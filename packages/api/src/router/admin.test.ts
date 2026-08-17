/**
 * Admin Router Business Logic Tests
 *
 * Exercises the actual adminRouter.getStats procedure through a real tRPC
 * caller with a mocked database (refs #581).
 *
 * This replaces the previous test file which only asserted against inline
 * literals and never imported the router (0% coverage).
 *
 * Covers:
 * - Admin authentication + role enforcement (UNAUTHORIZED / FORBIDDEN)
 * - Database role grant path (ADMIN role)
 * - Aggregated stats aggregation across User / K8sClusterConfig / Customer
 * - Missing count fallback to zero
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
import type { TRPCContext } from "../trpc";
// Import AFTER mocks are registered.
import { adminRouter } from "./admin";

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

// Mock the database before importing the router.
vi.mock("@saasfly/db", () => ({
  db: mockDb,
  SubscriptionPlan: { FREE: "FREE", PRO: "PRO", BUSINESS: "BUSINESS" },
  rlsTransaction: (
    _db: unknown,
    _userId: string,
    callback: (trx: unknown) => Promise<unknown>,
  ) => callback(_db),
}));

// Mock the logger to keep test output clean and assert audit logging.
vi.mock("../logger", () => ({ logger: mockLogger }));

const ADMIN_USER_ID = "admin-user-123";

/** Builds a full authenticated TRPCContext for the admin router. */
function createAdminContext(overrides: Partial<TRPCContext> = {}): TRPCContext {
  return {
    userId: ADMIN_USER_ID,
    requestId: "req-admin-123",
    rateLimitInfo: null,
    role: null,
    headers: new Headers({ origin: "http://localhost:3000" }),
    auth: {
      userId: ADMIN_USER_ID,
      sessionId: "sess-admin-123",
    } as unknown as TRPCContext["auth"],
    req: undefined,
    ...overrides,
  };
}

describe("adminRouter - Business Logic", () => {
  const RATE_LIMIT_IDENTIFIER = `user:${ADMIN_USER_ID}`;

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
    // - getStats: .select(eb => ...).where(...).executeTakeFirst() with count aggregates
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

  describe("getStats", () => {
    it("returns aggregated counts for an authenticated admin", async () => {
      const caller = adminRouter.createCaller(createAdminContext());
      const result = await caller.getStats();

      expect(result).toEqual({
        totalUsers: 42,
        totalClusters: 7,
        activeSubscriptions: 3,
        recentActivity: 0,
      });

      // isAdmin role lookup + 3 count queries.
      expect(mockDb.selectFrom).toHaveBeenCalledWith("User");
      expect(mockDb.selectFrom).toHaveBeenCalledWith("K8sClusterConfig");
      expect(mockDb.selectFrom).toHaveBeenCalledWith("Customer");
    });

    it("falls back to zero when a count query returns no row", async () => {
      mockCounts.Customer = undefined;

      const caller = adminRouter.createCaller(createAdminContext());
      const result = await caller.getStats();

      expect(result.totalUsers).toBe(42);
      expect(result.totalClusters).toBe(7);
      expect(result.activeSubscriptions).toBe(0);
      expect(result.recentActivity).toBe(0);
    });

    it("rejects unauthenticated access with UNAUTHORIZED", async () => {
      const caller = adminRouter.createCaller(
        createAdminContext({ userId: null, auth: null }),
      );

      await expect(caller.getStats()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      expect(mockDb.selectFrom).not.toHaveBeenCalled();
    });

    it("rejects non-admin users with FORBIDDEN", async () => {
      mockRoleValue.value = "USER";
      mockCurrentUser.mockResolvedValue(null);

      const caller = adminRouter.createCaller(createAdminContext());

      await expect(caller.getStats()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(mockCurrentUser).toHaveBeenCalled();
    });
  });
});
