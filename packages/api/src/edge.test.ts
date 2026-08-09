/**
 * Edge Router Code-Splitting Tests
 *
 * Exercises the edgeRouter composition in edge.ts (refs #751):
 * - Eager routers (hello, auth) are available directly on the router
 * - Lazy-loaded routers (admin, customer, k8s, stripe) resolve correctly
 *   through tRPC's lazy() dynamic import mechanism
 * - The full caller path works for both eager and lazy procedures
 *
 * This closes the coverage gap for the tRPC bundle code-splitting feature:
 * edge.ts previously had 0% statement coverage because no test imported it.
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

import { getLimiter } from "./distributed-rate-limiter";
// Import AFTER mocks are registered.
import { edgeRouter } from "./edge";
import type { TRPCContext } from "./trpc";

// Hoisted mock state (referenced by the vi.mock factories below).
const mockCurrentUser = vi.hoisted(() => vi.fn());
const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));
const mockDb = vi.hoisted(() => ({ selectFrom: vi.fn() }));
const mockRoleValue = vi.hoisted(() => ({ value: "ADMIN" as string | null }));
const mockCounts = vi.hoisted(
  () =>
    ({ User: "42", K8sClusterConfig: "7", Customer: "3" }) as Record<
      string,
      string | undefined
    >,
);

// Mock Clerk server helpers to avoid server-only module side effects.
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: mockCurrentUser,
  getAuth: vi.fn(),
}));

// Mock the database before importing edge.ts (which transitively imports
// trpc.ts and the routers that use @saasfly/db at module scope).
vi.mock("@saasfly/db", () => ({
  db: mockDb,
  SubscriptionPlan: { FREE: "FREE", PRO: "PRO", BUSINESS: "BUSINESS" },
  Role: { USER: "USER", ADMIN: "ADMIN" },
}));

// Mock the logger to keep test output clean.
vi.mock("./logger", () => ({ logger: mockLogger }));

// Mock next/cache (noStore / revalidatePath) to avoid server-only side effects.
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
  revalidatePath: vi.fn(),
}));

// Mock the Stripe SDK used by the lazy stripe router.
vi.mock("@saasfly/stripe", () => ({
  createBillingSession: vi.fn(),
  createCheckoutSession: vi.fn(),
  IntegrationError: class IntegrationError extends Error {},
  retrieveSubscription: vi.fn(),
}));

const TEST_USER_ID = "edge-user-123";

/** Builds a full authenticated TRPCContext for the edge router caller. */
function createEdgeContext(overrides: Partial<TRPCContext> = {}): TRPCContext {
  return {
    userId: TEST_USER_ID,
    requestId: "req-edge-123",
    rateLimitInfo: null,
    role: null,
    headers: new Headers({ origin: "http://localhost:3000" }),
    auth: {
      userId: TEST_USER_ID,
      sessionId: "sess-edge-123",
    } as unknown as TRPCContext["auth"],
    req: undefined,
    ...overrides,
  };
}

describe("edgeRouter - Code Splitting", () => {
  const RATE_LIMIT_IDENTIFIER = `user:${TEST_USER_ID}`;

  beforeAll(() => {
    // CSRF protection requires a configured app URL.
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Restore default mock state.
    mockRoleValue.value = "ADMIN";
    mockCounts.User = "42";
    mockCounts.K8sClusterConfig = "7";
    mockCounts.Customer = "3";
    mockCurrentUser.mockResolvedValue(null);

    // Route db.selectFrom() by usage:
    // - isAdmin middleware: .select("role").where("id","=",userId).executeTakeFirst()
    // - admin getStats: .select(eb => ...).where(...).executeTakeFirst() with count aggregates
    mockDb.selectFrom.mockImplementation((table: string) => ({
      select: (arg: unknown) => {
        if (arg === "role") {
          return {
            where: vi.fn().mockReturnValue({
              executeTakeFirst: vi
                .fn()
                .mockResolvedValue({ role: mockRoleValue.value }),
            }),
          };
        }
        if (typeof arg === "function") {
          // Execute the count-expression callback with a minimal fake
          // expression builder so the router's query construction runs.
          const fakeEb = {
            fn: { count: () => ({ as: () => ({ count: mockCounts[table] }) }) },
          };
          const countExpr = (arg as (eb: unknown) => unknown)(fakeEb) as {
            count?: string;
          };
          const count = countExpr?.count;
          const executeTakeFirst = vi
            .fn()
            .mockResolvedValue(count === undefined ? undefined : { count });
          return {
            where: vi.fn().mockReturnValue({ executeTakeFirst }),
            executeTakeFirst,
          };
        }
        throw new Error(`Unexpected select() argument for table "${table}"`);
      },
    }));
  });

  afterEach(async () => {
    // Reset the rate limit bucket to avoid cross-test interference.
    await getLimiter("read").resetAsync(RATE_LIMIT_IDENTIFIER);
  });

  describe("router composition", () => {
    it("exposes the eager routers directly on the router", () => {
      expect(edgeRouter).toBeDefined();
      // Eager routers (hello, auth) are composed directly; lazy routers
      // (admin, customer, k8s, stripe) are deferred via lazy() and only
      // appear once resolved through the caller.
      const keys = Object.keys(edgeRouter);
      expect(keys).toEqual(
        expect.arrayContaining(["hello", "auth", "_def", "createCaller"]),
      );
    });
  });

  describe("eager routers", () => {
    it("serves the hello procedure without a lazy import", async () => {
      const caller = edgeRouter.createCaller(createEdgeContext());
      const result = await caller.hello.hello({ text: "World" });

      expect(result.greeting).toContain("World");
    });
  });

  describe("lazy routers", () => {
    it("resolves the lazy admin router and runs getStats", async () => {
      const caller = edgeRouter.createCaller(createEdgeContext());
      const result = await caller.admin.getStats();

      expect(result).toEqual({
        totalUsers: 42,
        totalClusters: 7,
        activeSubscriptions: 3,
        recentActivity: 0,
      });
    });

    it("enforces admin role through the lazy router", async () => {
      mockRoleValue.value = "USER";
      mockCurrentUser.mockResolvedValue(null);

      const caller = edgeRouter.createCaller(createEdgeContext());

      await expect(caller.admin.getStats()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("rejects unauthenticated access to lazy routers with UNAUTHORIZED", async () => {
      const caller = edgeRouter.createCaller(
        createEdgeContext({ userId: null, auth: null }),
      );

      await expect(caller.admin.getStats()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });
});
