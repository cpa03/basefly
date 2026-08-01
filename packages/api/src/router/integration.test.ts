/**
 * API Router Integration Tests
 *
 * Exercises the full tRPC request lifecycle through the real caller,
 * covering the middleware chain end-to-end (refs #725):
 * - Authentication middleware (isAuthed)
 * - CSRF protection middleware (csrfProtection)
 * - Rate limiting middleware (rateLimit)
 *
 * Existing router tests validate input schemas and individual handlers;
 * these tests close the gap for full request/response cycle behavior:
 * rate limit enforcement, CSRF origin validation, and auth propagation.
 */
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getLimiter } from "../distributed-rate-limiter";
import {
  createRateLimitedProcedure,
  createTRPCRouter,
  procedure,
  protectedProcedure,
  type TRPCContext,
} from "../trpc";

// Mock Clerk server helpers to avoid server-only module side effects.
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock the database before importing trpc.ts (which imports @saasfly/db at
// module scope and would otherwise attempt a real Postgres connection).
vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
  },
  Role: {
    USER: "USER",
    ADMIN: "ADMIN",
  },
}));

// Mock the logger to keep test output clean.
vi.mock("../logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

/** Builds a full TRPCContext, mirroring the pattern used in rbac.test.ts. */
function createTestContext(overrides: Partial<TRPCContext> = {}): TRPCContext {
  return {
    userId: "user-123",
    requestId: "req-123",
    rateLimitInfo: null,
    role: null,
    headers: new Headers({ "x-request-id": "req-123" }),
    auth: {
      userId: "user-123",
      sessionId: "sess-123",
      getToken: vi.fn() as never,
      claims: {},
    } as unknown as TRPCContext["auth"],
    req: undefined,
    ...overrides,
  };
}

describe("API Router Integration (middleware chain)", () => {
  describe("rate limit middleware", () => {
    const RATE_LIMIT_USER = "integration-rate-limit-test";
    const RATE_LIMIT_OTHER_USER = "integration-rate-limit-other";
    const RATE_LIMIT_IDENTIFIER = `user:${RATE_LIMIT_USER}`;
    const OTHER_USER_IDENTIFIER = `user:${RATE_LIMIT_OTHER_USER}`;
    // stripe endpoint default: 10 requests per 60s window
    const RATE_LIMIT_MAX = 10;

    beforeEach(async () => {
      await getLimiter("stripe").resetAsync(RATE_LIMIT_IDENTIFIER);
      await getLimiter("stripe").resetAsync(OTHER_USER_IDENTIFIER);
    });

    afterEach(async () => {
      await getLimiter("stripe").resetAsync(RATE_LIMIT_IDENTIFIER);
      await getLimiter("stripe").resetAsync(OTHER_USER_IDENTIFIER);
    });

    it("propagates rateLimitInfo into the context for response headers", async () => {
      const router = createTRPCRouter({
        stats: createRateLimitedProcedure("stripe").query(({ ctx }) => ({
          ok: true,
          rateLimitInfo: ctx.rateLimitInfo,
        })),
      });
      const caller = router.createCaller(
        createTestContext({ userId: RATE_LIMIT_USER }),
      );

      const result = await caller.stats();

      expect(result.ok).toBe(true);
      expect(result.rateLimitInfo).not.toBeNull();
      expect(result.rateLimitInfo?.limit).toBe(RATE_LIMIT_MAX);
      expect(result.rateLimitInfo?.remaining).toBe(RATE_LIMIT_MAX - 1);
      expect(result.rateLimitInfo?.resetAt).toBeGreaterThan(Date.now());
    });

    it("rejects requests once the endpoint limit is exhausted", async () => {
      const router = createTRPCRouter({
        stats: createRateLimitedProcedure("stripe").query(() => "ok"),
      });
      const caller = router.createCaller(
        createTestContext({ userId: RATE_LIMIT_USER }),
      );

      // Consume the full token bucket.
      for (let i = 0; i < RATE_LIMIT_MAX; i++) {
        await expect(caller.stats()).resolves.toBe("ok");
      }

      // The next request must be rejected with TOO_MANY_REQUESTS.
      await expect(caller.stats()).rejects.toMatchObject({
        code: "TOO_MANY_REQUESTS",
      });
    });

    it("isolates rate limits per user identifier", async () => {
      const router = createTRPCRouter({
        stats: createRateLimitedProcedure("stripe").query(() => "ok"),
      });
      const exhaustedCaller = router.createCaller(
        createTestContext({ userId: RATE_LIMIT_USER }),
      );
      const otherCaller = router.createCaller(
        createTestContext({ userId: RATE_LIMIT_OTHER_USER }),
      );

      for (let i = 0; i < RATE_LIMIT_MAX; i++) {
        await exhaustedCaller.stats();
      }
      await expect(exhaustedCaller.stats()).rejects.toMatchObject({
        code: "TOO_MANY_REQUESTS",
      });

      // A different user still has a fresh quota.
      await expect(otherCaller.stats()).resolves.toBe("ok");
    });
  });

  describe("CSRF protection middleware", () => {
    const APP_ORIGIN = "https://app.example.com";

    beforeAll(() => {
      process.env.NEXT_PUBLIC_APP_URL = APP_ORIGIN;
    });

    afterAll(() => {
      delete process.env.NEXT_PUBLIC_APP_URL;
    });

    it("allows mutations with a matching Origin header", async () => {
      const router = createTRPCRouter({
        mutate: procedure.mutation(() => "ok"),
      });
      const caller = router.createCaller(
        createTestContext({
          headers: new Headers({
            origin: APP_ORIGIN,
            "x-request-id": "req-123",
          }),
        }),
      );

      await expect(caller.mutate()).resolves.toBe("ok");
    });

    it("rejects mutations with a mismatched Origin header", async () => {
      const router = createTRPCRouter({
        mutate: procedure.mutation(() => "ok"),
      });
      const caller = router.createCaller(
        createTestContext({
          headers: new Headers({
            origin: "https://evil.example.com",
            "x-request-id": "req-123",
          }),
        }),
      );

      await expect(caller.mutate()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("rejects mutations with a mismatched Referer-derived origin", async () => {
      const router = createTRPCRouter({
        mutate: procedure.mutation(() => "ok"),
      });
      const caller = router.createCaller(
        createTestContext({
          headers: new Headers({
            referer: "https://evil.example.com/attack",
            "x-request-id": "req-123",
          }),
        }),
      );

      await expect(caller.mutate()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("skips CSRF validation for read-only queries", async () => {
      const router = createTRPCRouter({
        read: procedure.query(() => "data"),
      });
      const caller = router.createCaller(
        createTestContext({
          headers: new Headers({
            origin: "https://evil.example.com",
            "x-request-id": "req-123",
          }),
        }),
      );

      await expect(caller.read()).resolves.toBe("data");
    });
  });

  describe("authentication middleware", () => {
    it("rejects unauthenticated access to protected procedures", async () => {
      const router = createTRPCRouter({
        secret: protectedProcedure.query(() => "secret"),
      });
      const caller = router.createCaller(
        createTestContext({ userId: null, auth: null }),
      );

      await expect(caller.secret()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("allows authenticated access to protected procedures", async () => {
      const router = createTRPCRouter({
        secret: protectedProcedure.query(() => "secret"),
      });
      const caller = router.createCaller(createTestContext());

      await expect(caller.secret()).resolves.toBe("secret");
    });
  });
});
