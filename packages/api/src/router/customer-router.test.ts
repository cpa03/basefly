/**
 * Customer Router Business Logic Tests
 *
 * Exercises the actual customerRouter procedures (updateUserName,
 * insertCustomer, queryCustomer) through a real tRPC caller with a mocked
 * database layer (refs #631, #725).
 *
 * Covers:
 * - Authentication enforcement (unauthenticated => UNAUTHORIZED)
 * - Ownership verification (cross-user access => UNAUTHORIZED)
 * - Successful update/insert/query flows
 * - Unique-violation handling (CONFLICT on duplicate customer)
 * - Database error propagation (INTERNAL_SERVER_ERROR)
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
import { customerRouter } from "./customer";

// Mock Clerk server helpers to avoid server-only module side effects.
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock the database before importing the router.
// db methods are re-assigned per-test to control behavior.
const mockDb = vi.hoisted(() => ({
  updateTable: vi.fn(),
  insertInto: vi.fn(),
  selectFrom: vi.fn(),
}));

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@saasfly/db", () => ({
  db: mockDb,
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
  rlsTransaction: (
    _db: unknown,
    _userId: string,
    callback: (trx: unknown) => Promise<unknown>,
  ) => callback(_db),
}));

// Mock the logger to keep test output clean and assert audit logging.
vi.mock("../logger", () => ({
  logger: mockLogger,
}));

// Mock Next.js cache (server-only module).
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}));

const OWNER_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const OTHER_USER_ID = "550e8400-e29b-41d4-a716-446655440001";

/** Builds a full authenticated TRPCContext for the customer router. */
function createCustomerContext(
  overrides: Partial<TRPCContext> = {},
): TRPCContext {
  return {
    userId: OWNER_USER_ID,
    requestId: "req-customer-123",
    rateLimitInfo: null,
    role: null,
    headers: new Headers({
      origin: "http://localhost:3000",
      "x-request-id": "req-customer-123",
    }),
    auth: {
      userId: OWNER_USER_ID,
      sessionId: "sess-123",
    } as unknown as TRPCContext["auth"],
    req: undefined,
    ...overrides,
  };
}

/** Returns a caller bound to the given context. */
function createCaller(ctx: TRPCContext) {
  return customerRouter.createCaller(ctx);
}

describe("customerRouter - Business Logic", () => {
  const RATE_LIMIT_IDENTIFIER = `user:${OWNER_USER_ID}`;
  const OTHER_LIMIT_IDENTIFIER = `user:${OTHER_USER_ID}`;

  beforeAll(() => {
    // CSRF protection requires a configured app URL and matching Origin.
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  beforeEach(async () => {
    // Fresh mock state per test.
    vi.clearAllMocks();

    // Default: updateTable("User").set(...).where(...).execute()
    mockDb.updateTable.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Default: insertInto("Customer").values(...).executeTakeFirst()
    mockDb.insertInto.mockReturnValue({
      values: vi.fn().mockReturnValue({
        executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      }),
    });

    // Default: selectFrom("Customer").where(...).executeTakeFirst()
    mockDb.selectFrom.mockReturnValue({
      where: vi.fn().mockReturnValue({
        executeTakeFirst: vi.fn().mockResolvedValue(undefined),
      }),
    });

    // Reset rate limit buckets to avoid cross-test interference.
    await getLimiter("read").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("read").resetAsync(OTHER_LIMIT_IDENTIFIER);
    await getLimiter("write").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("write").resetAsync(OTHER_LIMIT_IDENTIFIER);
  });

  afterEach(async () => {
    await getLimiter("read").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("read").resetAsync(OTHER_LIMIT_IDENTIFIER);
    await getLimiter("write").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("write").resetAsync(OTHER_LIMIT_IDENTIFIER);
  });

  describe("updateUserName", () => {
    it("throws UNAUTHORIZED when the user is not authenticated", async () => {
      const caller = createCaller(
        createCustomerContext({ userId: null as unknown as string }),
      );

      await expect(
        caller.updateUserName({ userId: OWNER_USER_ID, name: "New Name" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("throws UNAUTHORIZED when a user tries to update another user's name", async () => {
      const caller = createCaller(
        createCustomerContext({ userId: OWNER_USER_ID }),
      );

      await expect(
        caller.updateUserName({ userId: OTHER_USER_ID, name: "Hacker" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("updates the authenticated user's own name", async () => {
      const execute = vi.fn().mockResolvedValue([]);
      mockDb.updateTable.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({ execute }),
        }),
      });

      const caller = createCaller(createCustomerContext());
      const result = await caller.updateUserName({
        userId: OWNER_USER_ID,
        name: "Jane Doe",
      });

      expect(result).toEqual({ success: true });
      expect(mockDb.updateTable).toHaveBeenCalledWith("User");
      expect(execute).toHaveBeenCalled();
    });

    it("propagates INTERNAL_SERVER_ERROR when the database update fails", async () => {
      mockDb.updateTable.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            execute: vi.fn().mockRejectedValue(new Error("db down")),
          }),
        }),
      });

      const caller = createCaller(createCustomerContext());

      await expect(
        caller.updateUserName({ userId: OWNER_USER_ID, name: "Jane Doe" }),
      ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    });
  });

  describe("insertCustomer", () => {
    it("throws UNAUTHORIZED when the user is not authenticated", async () => {
      const caller = createCaller(
        createCustomerContext({ userId: null as unknown as string }),
      );

      await expect(
        caller.insertCustomer({ userId: OWNER_USER_ID }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("throws UNAUTHORIZED when a user tries to create a customer for another user", async () => {
      const caller = createCaller(
        createCustomerContext({ userId: OWNER_USER_ID }),
      );

      await expect(
        caller.insertCustomer({ userId: OTHER_USER_ID }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("creates a customer for the authenticated user", async () => {
      const executeTakeFirst = vi.fn().mockResolvedValue(undefined);
      mockDb.insertInto.mockReturnValue({
        values: vi.fn().mockReturnValue({ executeTakeFirst }),
      });

      const caller = createCaller(createCustomerContext());
      const result = await caller.insertCustomer({ userId: OWNER_USER_ID });

      expect(result).toEqual({ success: true });
      expect(mockDb.insertInto).toHaveBeenCalledWith("Customer");
      expect(executeTakeFirst).toHaveBeenCalled();
    });

    it("throws CONFLICT when the customer already exists (unique violation)", async () => {
      const uniqueError = Object.assign(new Error("duplicate"), {
        code: "23505",
        constraint: "Customer_authUserId_unique",
      });
      mockDb.insertInto.mockReturnValue({
        values: vi.fn().mockReturnValue({
          executeTakeFirst: vi.fn().mockRejectedValue(uniqueError),
        }),
      });

      const caller = createCaller(createCustomerContext());

      await expect(
        caller.insertCustomer({ userId: OWNER_USER_ID }),
      ).rejects.toMatchObject({ code: "CONFLICT" });
    });

    it("propagates INTERNAL_SERVER_ERROR when the database insert fails", async () => {
      mockDb.insertInto.mockReturnValue({
        values: vi.fn().mockReturnValue({
          executeTakeFirst: vi.fn().mockRejectedValue(new Error("db down")),
        }),
      });

      const caller = createCaller(createCustomerContext());

      await expect(
        caller.insertCustomer({ userId: OWNER_USER_ID }),
      ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    });
  });

  describe("queryCustomer", () => {
    it("throws UNAUTHORIZED when the user is not authenticated", async () => {
      const caller = createCaller(
        createCustomerContext({ userId: null as unknown as string }),
      );

      await expect(
        caller.queryCustomer({ userId: OWNER_USER_ID }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("throws UNAUTHORIZED when a user tries to query another user's customer", async () => {
      const caller = createCaller(
        createCustomerContext({ userId: OWNER_USER_ID }),
      );

      await expect(
        caller.queryCustomer({ userId: OTHER_USER_ID }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("returns the customer record for the authenticated user", async () => {
      const customer = {
        id: 1,
        authUserId: OWNER_USER_ID,
        plan: "FREE",
        stripeCustomerId: null,
      };
      mockDb.selectFrom.mockReturnValue({
        where: vi.fn().mockReturnValue({
          executeTakeFirst: vi.fn().mockResolvedValue(customer),
        }),
      });

      const caller = createCaller(createCustomerContext());
      const result = await caller.queryCustomer({ userId: OWNER_USER_ID });

      expect(mockDb.selectFrom).toHaveBeenCalledWith("Customer");
      expect(result).toEqual(customer);
    });

    it("returns undefined when the customer does not exist", async () => {
      mockDb.selectFrom.mockReturnValue({
        where: vi.fn().mockReturnValue({
          executeTakeFirst: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const caller = createCaller(createCustomerContext());
      const result = await caller.queryCustomer({ userId: OWNER_USER_ID });

      expect(result).toBeUndefined();
    });

    it("propagates INTERNAL_SERVER_ERROR when the database query fails", async () => {
      mockDb.selectFrom.mockReturnValue({
        where: vi.fn().mockReturnValue({
          executeTakeFirst: vi.fn().mockRejectedValue(new Error("db down")),
        }),
      });

      const caller = createCaller(createCustomerContext());

      await expect(
        caller.queryCustomer({ userId: OWNER_USER_ID }),
      ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    });
  });
});
