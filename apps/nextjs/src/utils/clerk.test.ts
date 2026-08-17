/**
 * Unit tests for the Clerk authentication middleware
 * (apps/nextjs/src/utils/clerk.ts).
 *
 * Covers the security-critical authentication flow:
 * - Public/private route matching
 * - Locale negotiation and locale redirects
 * - Webhook and static-asset passthrough
 * - Login redirects for unauthenticated users
 * - Authenticated access to tRPC routes
 *
 * Reference: Issue #500 - [P1][Testing] Add Clerk authentication flow tests
 */

import { NextResponse, type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getLocale,
  isNoNeedProcess,
  isNoRedirect,
  isPublicRoute,
  middleware,
} from "./clerk";

// --- Mocks ------------------------------------------------------------------

const { matchLocaleMock, negotiatorLanguagesMock, negotiatorMock } = vi.hoisted(
  () => {
    const negotiatorLanguagesMock = vi.fn().mockReturnValue([]);
    // Negotiator is constructed with `new` in the module under test, so the
    // mock must be a class. Instances expose `languages()` backed by the
    // shared `negotiatorLanguagesMock` so tests can control negotiation.
    const negotiatorMock = class {
      languages = negotiatorLanguagesMock;
    };
    return {
      negotiatorMock,
      negotiatorLanguagesMock,
      matchLocaleMock: vi.fn().mockReturnValue("zh"),
    };
  },
);

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: vi.fn((handler: unknown) => handler),
  createRouteMatcher: vi.fn(
    (patterns: RegExp[]) => (req: { nextUrl: { pathname: string } }) =>
      patterns.some((pattern) => pattern.test(req.nextUrl.pathname)),
  ),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => ({ type: "next" })),
    redirect: vi.fn((url: string | URL) => ({ type: "redirect", url })),
  },
}));

vi.mock("negotiator", () => ({ default: negotiatorMock }));

vi.mock("@formatjs/intl-localematcher", () => ({ match: matchLocaleMock }));

// --- Helpers ----------------------------------------------------------------

function createMockRequest(pathname: string, search = ""): NextRequest {
  return {
    nextUrl: { pathname, search },
    url: `https://example.com${pathname}${search}`,
    headers: {
      forEach: () => undefined,
    },
  } as unknown as NextRequest;
}

/**
 * The real `clerkMiddleware()` wrapper returns a Next.js `NextMiddleware`.
 * Since it is mocked to pass the handler through unchanged, the exported
 * `middleware` is the raw `(auth, request)` handler at runtime. Cast the
 * type accordingly so tests can invoke the auth flow directly.
 */
type AuthFlowHandler = (
  auth: () => Promise<{ userId: string | null }>,
  req: NextRequest,
) => Promise<unknown>;

const authFlowHandler = middleware as unknown as AuthFlowHandler;

const signedInAuth = vi.fn().mockResolvedValue({ userId: "user_123" });
const signedOutAuth = vi.fn().mockResolvedValue({ userId: null });

function expectRedirect(result: unknown, expectedUrl: string): void {
  expect(result).toMatchObject({ type: "redirect" });
  expect(String((result as { url: URL }).url)).toBe(expectedUrl);
}

beforeEach(() => {
  vi.clearAllMocks();
  negotiatorLanguagesMock.mockReturnValue([]);
  matchLocaleMock.mockReturnValue("zh");
});

// --- Tests ------------------------------------------------------------------

describe("utils/clerk - isPublicRoute", () => {
  it("matches sign-in, terms, privacy, docs, blog, and pricing routes", () => {
    for (const path of [
      "/en/signin",
      "/en/signin?redirect=1",
      "/en/terms",
      "/en/privacy",
      "/en/docs",
      "/en/docs/getting-started",
      "/en/blog/post-1",
      "/en/pricing",
    ]) {
      expect(isPublicRoute(createMockRequest(path))).toBe(true);
    }
  });

  it("matches the bare locale root (e.g. /en, /zh)", () => {
    expect(isPublicRoute(createMockRequest("/en"))).toBe(true);
    expect(isPublicRoute(createMockRequest("/zh"))).toBe(true);
  });

  it("does not match private or API routes", () => {
    for (const path of [
      "/en/dashboard",
      "/en/settings",
      "/en/login",
      "/api/trpc/edge/foo",
      "/api/webhooks/stripe",
    ]) {
      expect(isPublicRoute(createMockRequest(path))).toBe(false);
    }
  });
});

describe("utils/clerk - getLocale", () => {
  it("falls back to the default locale when no language matches", () => {
    negotiatorLanguagesMock.mockReturnValue([]);
    matchLocaleMock.mockReturnValue("zh");

    expect(getLocale(createMockRequest("/dashboard"))).toBe("zh");
    expect(matchLocaleMock).toHaveBeenCalledWith(
      [],
      ["en", "zh", "ko", "ja"],
      "zh",
    );
  });

  it("returns the best matching locale from request headers", () => {
    negotiatorLanguagesMock.mockReturnValue(["fr"]);
    matchLocaleMock.mockReturnValue("fr");

    expect(getLocale(createMockRequest("/dashboard"))).toBe("fr");
    expect(matchLocaleMock).toHaveBeenCalledWith(
      ["fr"],
      ["en", "zh", "ko", "ja"],
      "zh",
    );
  });
});

describe("utils/clerk - isNoRedirect", () => {
  it("returns true for API and tRPC routes", () => {
    expect(isNoRedirect(createMockRequest("/api/webhooks/stripe"))).toBe(true);
    expect(isNoRedirect(createMockRequest("/api/trpc/edge/foo"))).toBe(true);
    expect(isNoRedirect(createMockRequest("/trpc/foo"))).toBe(true);
  });

  it("returns false for regular pages", () => {
    expect(isNoRedirect(createMockRequest("/en/dashboard"))).toBe(false);
  });
});

describe("utils/clerk - isNoNeedProcess", () => {
  it("returns true for static image assets", () => {
    expect(isNoNeedProcess(createMockRequest("/og-image.png"))).toBe(true);
    expect(isNoNeedProcess(createMockRequest("/images/logo.jpg"))).toBe(true);
  });

  it("returns false for regular pages", () => {
    expect(isNoNeedProcess(createMockRequest("/en/dashboard"))).toBe(false);
  });
});

describe("utils/clerk - middleware (auth flow)", () => {
  it("skips processing for static assets", async () => {
    const result = await authFlowHandler(
      signedInAuth,
      createMockRequest("/og-image.png"),
    );
    expect(result).toBeNull();
  });

  it("passes through webhook routes", async () => {
    const result = await authFlowHandler(
      signedInAuth,
      createMockRequest("/api/webhooks/stripe"),
    );
    expect(result).toEqual({ type: "next" });
    expect(NextResponse.next).toHaveBeenCalledTimes(1);
  });

  it("redirects to the locale-prefixed URL when the locale is missing", async () => {
    const result = await authFlowHandler(
      signedOutAuth,
      createMockRequest("/dashboard"),
    );
    expectRedirect(result, "https://example.com/zh/dashboard");
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
  });

  it("returns null for public routes", async () => {
    const result = await authFlowHandler(
      signedOutAuth,
      createMockRequest("/en/signin"),
    );
    expect(result).toBeNull();
  });

  it("allows authenticated requests to tRPC routes", async () => {
    const result = await authFlowHandler(
      signedInAuth,
      createMockRequest("/api/trpc/edge/foo"),
    );
    expect(result).toEqual({ type: "next" });
  });

  it("redirects authenticated users away from the login page", async () => {
    matchLocaleMock.mockReturnValue("en");
    const result = await authFlowHandler(
      signedInAuth,
      createMockRequest("/en/login"),
    );
    expectRedirect(result, "https://example.com/en/dashboard");
  });

  it("returns null on the login page for unauthenticated users", async () => {
    const result = await authFlowHandler(
      signedOutAuth,
      createMockRequest("/en/login"),
    );
    expect(result).toBeNull();
  });

  it("redirects unauthenticated users to the login page with a from path", async () => {
    matchLocaleMock.mockReturnValue("en");
    const result = await authFlowHandler(
      signedOutAuth,
      createMockRequest("/en/settings"),
    );
    expectRedirect(
      result,
      "https://example.com/en/login?from=%2Fen%2Fsettings",
    );
  });

  it("preserves query parameters in the from path", async () => {
    matchLocaleMock.mockReturnValue("en");
    const result = await authFlowHandler(
      signedOutAuth,
      createMockRequest("/en/dashboard", "?tab=1"),
    );
    expectRedirect(
      result,
      "https://example.com/en/login?from=%2Fen%2Fdashboard%3Ftab%3D1",
    );
  });
});
