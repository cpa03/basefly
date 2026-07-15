import { NextResponse, type NextRequest } from "next/server";

import {
  getOrGenerateRequestId,
  REQUEST_ID_HEADER,
} from "@saasfly/api/request-id";
import { getMinifiedCSPHeader, HEADERS, HTTP_STATUS } from "@saasfly/common";

import { i18n } from "./config/i18n-config";
import { middleware as clerkMiddleware, isPublicRoute } from "./utils/clerk";
import { logger } from "~/lib/logger";

/**
 * CSRF Protection: validate state-changing requests originate from the
 * application's own origin. Strategies used in priority order:
 * 1. Origin header (most reliable)
 * 2. Referer header (fallback)
 * Both are compared against NEXT_PUBLIC_APP_URL.
 * Safe methods (GET/HEAD/OPTIONS) and API/tRPC routes are excluded.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isSafeMethod(method: string): boolean {
  return SAFE_METHODS.has(method);
}

function isApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/trpc/") ||
    pathname === "/api" ||
    pathname === "/trpc"
  );
}

function getExpectedOrigin(): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return null;
  try {
    return new URL(appUrl).origin;
  } catch {
    return null;
  }
}

function extractOrigin(urlString: string): string | null {
  try {
    return new URL(urlString).origin;
  } catch {
    return null;
  }
}

function validateCSRF(req: NextRequest): boolean {
  if (isSafeMethod(req.method) || isApiRoute(req.nextUrl.pathname)) {
    return true;
  }
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const expectedOrigin = getExpectedOrigin();
  if (!expectedOrigin) {
    return true;
  }

  const origin = req.headers.get("origin");
  if (origin) {
    const reqOrigin = extractOrigin(origin);
    if (reqOrigin === expectedOrigin) {
      return true;
    }
    const allowedOrigins = process.env.CSRF_ALLOWED_ORIGINS;
    if (allowedOrigins) {
      const origins = allowedOrigins.split(",").map((o) => o.trim());
      if (origins.includes(origin) || origins.includes(reqOrigin ?? "")) {
        return true;
      }
    }
    return false;
  }

  const referer = req.headers.get("referer");
  if (referer) {
    const refOrigin = extractOrigin(referer);
    if (refOrigin === expectedOrigin) {
      return true;
    }
  }

  return false;
}

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

// Use centralized CSP configuration from @saasfly/common
const contentSecurityPolicyHeaderValue = getMinifiedCSPHeader();

/**
 * Security headers applied to all middleware responses
 * These complement the headers set in next.config.mjs for defense-in-depth
 */
const SECURITY_HEADERS: Record<string, string> = {
  [HEADERS.X_CONTENT_TYPE_OPTIONS]: "nosniff",
  [HEADERS.X_FRAME_OPTIONS]: "SAMEORIGIN",
  [HEADERS.REFERRER_POLICY]: "origin-when-cross-origin",
  [HEADERS.CONTENT_SECURITY_POLICY]: contentSecurityPolicyHeaderValue,
  // Cross-Origin headers for enhanced security
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/**
 * Apply security headers to a response
 * Ensures all middleware responses have consistent security headers
 */
function applySecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
}

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key.includes("dummy") || key.includes("placeholder")) return false;
  if (!key.startsWith("pk_")) return false;
  return key.length > 20;
}

function createErrorResponse(
  req: NextRequest,
  requestId: string,
  error: unknown,
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  if (process.env.NODE_ENV === "development") {
    const response = NextResponse.json(
      {
        error: "Middleware Error",
        message: errorMessage,
        requestId,
      },
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      },
    );
    response.headers.set(REQUEST_ID_HEADER, requestId);
    applySecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  });
  applySecurityHeaders(response);
  return response;
}

function handleI18nRouting(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return null;
  }

  const locale = i18n.defaultLocale;
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

const SLOW_REQUEST_THRESHOLD_MS = 500;

export default async function proxy(
  req: NextRequest,
): Promise<Response | null> {
  const startTime = performance.now();

  const response = await handleRequest(req);

  const duration = performance.now() - startTime;
  const method = req.method;
  const url = req.nextUrl.pathname;

  if (response && "headers" in response) {
    (response as NextResponse).headers.set(
      "Server-Timing",
      `total;dur=${duration.toFixed(0)}`,
    );
  }

  if (duration > SLOW_REQUEST_THRESHOLD_MS && response) {
    const requestId =
      (response as NextResponse).headers.get(REQUEST_ID_HEADER) ?? "unknown";

    if (process.env.NODE_ENV === "production") {
      logger.error("Slow request detected", undefined, {
        type: "slow-request",
        method,
        url,
        duration: Math.round(duration),
        thresholdMs: SLOW_REQUEST_THRESHOLD_MS,
        requestId,
      });
    } else {
      logger.warn("Slow request detected", {
        type: "slow-request",
        method,
        url,
        duration: Math.round(duration),
        thresholdMs: SLOW_REQUEST_THRESHOLD_MS,
        requestId,
      });
    }
  }

  return response;
}

async function handleRequest(req: NextRequest): Promise<Response | null> {
  const i18nResponse = handleI18nRouting(req);
  if (i18nResponse) {
    return i18nResponse;
  }

  const requestId = getOrGenerateRequestId(req.headers);

  // CSRF validation gate — before any auth or business logic
  if (!validateCSRF(req)) {
    const response = NextResponse.json(
      { error: "CSRF validation failed", requestId },
      { status: HTTP_STATUS.FORBIDDEN },
    );
    response.headers.set(REQUEST_ID_HEADER, requestId);
    applySecurityHeaders(response);
    return response;
  }

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  try {
    // If the route is not public, require authentication via clerkMiddleware
    if (!isPublicRoute(req)) {
      const authResult = await clerkMiddleware(req);
      if (
        authResult &&
        typeof authResult === "object" &&
        "headers" in authResult
      ) {
        (authResult as NextResponse).headers.set(REQUEST_ID_HEADER, requestId);
        applySecurityHeaders(authResult as NextResponse);
        return authResult;
      }
    }

    if (!isValidClerkKey(clerkKey)) {
      const response = NextResponse.next({
        request: {
          headers: new Headers(req.headers),
        },
      });
      response.headers.set(REQUEST_ID_HEADER, requestId);
      applySecurityHeaders(response);
      return response;
    }

    const result = await (
      clerkMiddleware as (req: NextRequest) => Promise<Response | null>
    )(req);

    if (result && typeof result === "object" && "headers" in result) {
      result.headers.set(REQUEST_ID_HEADER, requestId);
      applySecurityHeaders(result as NextResponse);
    }

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      return createErrorResponse(req, requestId, error);
    }
    throw error;
  }
}
