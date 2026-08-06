/**
 * Hello Router Business Logic Tests
 *
 * Exercises the actual helloRouter.hello procedure through a real tRPC
 * caller (refs #581).
 *
 * This replaces the previous test file which re-implemented escapeHtml and
 * the input schema locally and never imported the router (0% coverage).
 *
 * Covers:
 * - HTML sanitization (XSS prevention) of user input
 * - Input validation (trim / min / max length)
 * - Authentication enforcement (unauthenticated => UNAUTHORIZED)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_VALIDATION } from "@saasfly/common";

import { getLimiter } from "../distributed-rate-limiter";
import type { TRPCContext } from "../trpc";

// Hoisted mock state (referenced by the vi.mock factories below).
const mockDb = vi.hoisted(() => ({ selectFrom: vi.fn() }));

// Mock Clerk server helpers to avoid server-only module side effects.
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock the database before importing the router. The hello router itself does
// not use the database, but trpc.ts (imported transitively) does, and the real
// db instance requires a POSTGRES_URL connection string.
vi.mock("@saasfly/db", () => ({
  db: mockDb,
  SubscriptionPlan: { FREE: "FREE", PRO: "PRO", BUSINESS: "BUSINESS" },
}));

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

// Mock the logger to keep test output clean.
vi.mock("../logger", () => ({ logger: mockLogger }));

// Import AFTER mocks are registered.
import { helloRouter } from "./hello";

const TEST_USER_ID = "hello-user-123";

/** Builds a full authenticated TRPCContext for the hello router. */
function createHelloContext(
  overrides: Partial<TRPCContext> = {},
): TRPCContext {
  return {
    userId: TEST_USER_ID,
    requestId: "req-hello-123",
    rateLimitInfo: null,
    role: null,
    headers: new Headers(),
    auth: {
      userId: TEST_USER_ID,
      sessionId: "sess-hello-123",
    } as unknown as TRPCContext["auth"],
    req: undefined,
    ...overrides,
  };
}

describe("helloRouter - Business Logic", () => {
  const RATE_LIMIT_IDENTIFIER = `user:${TEST_USER_ID}`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Reset the rate limit bucket to avoid cross-test interference.
    await getLimiter("read").resetAsync(RATE_LIMIT_IDENTIFIER);
  });

  describe("hello", () => {
    it("returns a greeting with the provided text", async () => {
      const caller = helloRouter.createCaller(createHelloContext());
      const result = await caller.hello({ text: "World" });

      expect(result).toEqual({ greeting: "hello World" });
    });

    it("trims surrounding whitespace from input", async () => {
      const caller = helloRouter.createCaller(createHelloContext());
      const result = await caller.hello({ text: "  World  " });

      expect(result).toEqual({ greeting: "hello World" });
    });

    it("escapes HTML special characters to prevent XSS", async () => {
      const caller = helloRouter.createCaller(createHelloContext());
      const result = await caller.hello({
        text: `<script>alert("x")</script>`,
      });

      expect(result.greeting).toBe(
        "hello &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
      );
      expect(result.greeting).not.toContain("<script>");
    });

    it("escapes ampersands to prevent entity injection", async () => {
      const caller = helloRouter.createCaller(createHelloContext());
      const result = await caller.hello({ text: "Tom & Jerry" });

      expect(result.greeting).toBe("hello Tom &amp; Jerry");
    });

    it("rejects empty text with a validation error", async () => {
      const caller = helloRouter.createCaller(createHelloContext());

      await expect(caller.hello({ text: "" })).rejects.toThrow(
        /Text cannot be empty/,
      );
    });

    it("rejects whitespace-only text after trimming", async () => {
      const caller = helloRouter.createCaller(createHelloContext());

      await expect(caller.hello({ text: "   " })).rejects.toThrow(
        /Text cannot be empty/,
      );
    });

    it("accepts text at the maximum length", async () => {
      const caller = helloRouter.createCaller(createHelloContext());
      const result = await caller.hello({
        text: "a".repeat(API_VALIDATION.text.maxLength),
      });

      expect(result.greeting.startsWith("hello ")).toBe(true);
    });

    it("rejects text exceeding the maximum length", async () => {
      const caller = helloRouter.createCaller(createHelloContext());

      await expect(
        caller.hello({ text: "a".repeat(API_VALIDATION.text.maxLength + 1) }),
      ).rejects.toThrow(/cannot exceed/);
    });

    it("rejects unauthenticated access with UNAUTHORIZED", async () => {
      const caller = helloRouter.createCaller(
        createHelloContext({ userId: null, auth: null }),
      );

      await expect(caller.hello({ text: "World" })).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });
});
