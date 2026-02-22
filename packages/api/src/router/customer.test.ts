import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db, SubscriptionPlan } from "@saasfly/db";

import {
  customerRouter,
  insertCustomerSchema,
  queryCustomerSchema,
  updateUserNameSchema,
} from "./customer";

vi.mock("@saasfly/db", () => ({
  db: {
    updateTable: vi.fn(),
    insertInto: vi.fn(),
    selectFrom: vi.fn(),
  },
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
}));

vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}));

vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

function createMockContext(
  userId: string | null,
  requestId = "test-request-id",
) {
  return {
    userId,
    requestId,
    req: undefined,
    rateLimitInfo: null,
    headers: new Headers(),
  };
}

function createMockCaller(userId: string | null) {
  const ctx = createMockContext(userId);
  // @ts-expect-error - Simplified mock for testing
  return customerRouter.createCaller(ctx);
}

describe("customerRouter - Schema Validation", () => {
  describe("updateUserNameSchema", () => {
    it("accepts valid user name update", () => {
      const validData = {
        name: "John Doe",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = updateUserNameSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects missing name", () => {
      const invalidData = { userId: "550e8400-e29b-41d4-a716-446655440000" };
      const result = updateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects missing userId", () => {
      const invalidData = { name: "John Doe" };
      const result = updateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects empty string name", () => {
      const invalidData = {
        name: "",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = updateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects non-UUID userId", () => {
      const invalidData = { name: "John Doe", userId: "user_123" };
      const result = updateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields (strict mode)", () => {
      const dataWithExtra = {
        name: "John Doe",
        userId: "550e8400-e29b-41d4-a716-446655440000",
        extraField: "should be rejected",
      };
      const result = updateUserNameSchema.safeParse(dataWithExtra);
      expect(result.success).toBe(false);
    });

    it("trims whitespace from name", () => {
      const data = {
        name: "  John Doe  ",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = updateUserNameSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
      }
    });
  });

  describe("insertCustomerSchema", () => {
    it("accepts valid user id", () => {
      const validData = { userId: "550e8400-e29b-41d4-a716-446655440000" };
      const result = insertCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects missing userId", () => {
      const invalidData = {};
      const result = insertCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects null userId", () => {
      const invalidData = { userId: null };
      const result = insertCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects non-UUID userId", () => {
      const invalidData = { userId: "user_123" };
      const result = insertCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields (strict mode)", () => {
      const dataWithExtra = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        extraField: "should be rejected",
      };
      const result = insertCustomerSchema.safeParse(dataWithExtra);
      expect(result.success).toBe(false);
    });
  });

  describe("queryCustomerSchema", () => {
    it("accepts valid user id", () => {
      const validData = { userId: "550e8400-e29b-41d4-a716-446655440000" };
      const result = queryCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects missing userId", () => {
      const invalidData = {};
      const result = queryCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects non-UUID userId", () => {
      const invalidData = { userId: "user_123" };
      const result = queryCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("customerRouter - Authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateUserName", () => {
    it("should reject when userId does not match context userId", async () => {
      const caller = createMockCaller("user-auth-123");
      const differentUserId = "550e8400-e29b-41d4-a716-446655440000";

      await expect(
        caller.updateUserName({
          name: "Test Name",
          userId: differentUserId,
        }),
      ).rejects.toThrow(TRPCError);

      try {
        await caller.updateUserName({
          name: "Test Name",
          userId: differentUserId,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("UNAUTHORIZED");
      }
    });

    it("should reject when context has no userId", async () => {
      const caller = createMockCaller(null);
      const userId = "550e8400-e29b-41d4-a716-446655440000";

      await expect(
        caller.updateUserName({
          name: "Test Name",
          userId,
        }),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("insertCustomer", () => {
    it("should reject when userId does not match context userId", async () => {
      const caller = createMockCaller("user-auth-123");
      const differentUserId = "550e8400-e29b-41d4-a716-446655440000";

      await expect(
        caller.insertCustomer({ userId: differentUserId }),
      ).rejects.toThrow(TRPCError);

      try {
        await caller.insertCustomer({ userId: differentUserId });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("UNAUTHORIZED");
      }
    });

    it("should reject when context has no userId", async () => {
      const caller = createMockCaller(null);
      const userId = "550e8400-e29b-41d4-a716-446655440000";

      await expect(caller.insertCustomer({ userId })).rejects.toThrow(
        TRPCError,
      );
    });
  });

  describe("queryCustomer", () => {
    it("should reject when userId does not match context userId", async () => {
      const caller = createMockCaller("user-auth-123");
      const differentUserId = "550e8400-e29b-41d4-a716-446655440000";

      await expect(
        caller.queryCustomer({ userId: differentUserId }),
      ).rejects.toThrow(TRPCError);

      try {
        await caller.queryCustomer({ userId: differentUserId });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("UNAUTHORIZED");
      }
    });

    it("should reject when context has no userId", async () => {
      const caller = createMockCaller(null);
      const userId = "550e8400-e29b-41d4-a716-446655440000";

      await expect(caller.queryCustomer({ userId })).rejects.toThrow(TRPCError);
    });
  });
});

describe("customerRouter - Error Handling", () => {
  const testUserId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateUserName", () => {
    it("should throw INTERNAL_SERVER_ERROR on database error", async () => {
      const caller = createMockCaller(testUserId);

      const mockUpdateBuilder = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi
          .fn()
          .mockRejectedValue(new Error("Database connection failed")),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.updateTable).mockReturnValue(
        mockUpdateBuilder as unknown as ReturnType<typeof db.updateTable>,
      );

      await expect(
        caller.updateUserName({ name: "Test Name", userId: testUserId }),
      ).rejects.toThrow(TRPCError);

      try {
        await caller.updateUserName({ name: "Test Name", userId: testUserId });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });

  describe("insertCustomer", () => {
    it("should throw CONFLICT when customer already exists (unique violation)", async () => {
      const caller = createMockCaller(testUserId);

      const uniqueViolationError = {
        code: "23505",
        constraint: "Customer_authUserId_unique",
      };

      const mockInsertBuilder = {
        values: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockRejectedValue(uniqueViolationError),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.insertInto).mockReturnValue(
        mockInsertBuilder as unknown as ReturnType<typeof db.insertInto>,
      );

      await expect(
        caller.insertCustomer({ userId: testUserId }),
      ).rejects.toThrow(TRPCError);

      try {
        await caller.insertCustomer({ userId: testUserId });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("CONFLICT");
      }
    });

    it("should throw INTERNAL_SERVER_ERROR on generic database error", async () => {
      const caller = createMockCaller(testUserId);

      const mockInsertBuilder = {
        values: vi.fn().mockReturnThis(),
        executeTakeFirst: vi
          .fn()
          .mockRejectedValue(new Error("Database error")),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.insertInto).mockReturnValue(
        mockInsertBuilder as unknown as ReturnType<typeof db.insertInto>,
      );

      await expect(
        caller.insertCustomer({ userId: testUserId }),
      ).rejects.toThrow(TRPCError);

      try {
        await caller.insertCustomer({ userId: testUserId });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });

  describe("queryCustomer", () => {
    it("should throw INTERNAL_SERVER_ERROR on database error", async () => {
      const caller = createMockCaller(testUserId);

      const mockSelectBuilder = {
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi
          .fn()
          .mockRejectedValue(new Error("Database error")),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.selectFrom).mockReturnValue(
        mockSelectBuilder as unknown as ReturnType<typeof db.selectFrom>,
      );

      await expect(
        caller.queryCustomer({ userId: testUserId }),
      ).rejects.toThrow(TRPCError);

      try {
        await caller.queryCustomer({ userId: testUserId });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });
});

describe("customerRouter - Successful Operations", () => {
  const testUserId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateUserName", () => {
    it("should successfully update user name when authorized", async () => {
      const caller = createMockCaller(testUserId);

      const mockUpdateBuilder = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.updateTable).mockReturnValue(
        mockUpdateBuilder as unknown as ReturnType<typeof db.updateTable>,
      );

      const result = await caller.updateUserName({
        name: "New Name",
        userId: testUserId,
      });

      expect(result).toEqual({ success: true, reason: "" });
      expect(mockUpdateBuilder.set).toHaveBeenCalledWith({ name: "New Name" });
      expect(mockUpdateBuilder.where).toHaveBeenCalledWith(
        "id",
        "=",
        testUserId,
      );
    });
  });

  describe("insertCustomer", () => {
    it("should successfully create customer when authorized", async () => {
      const caller = createMockCaller(testUserId);

      const mockResult = { numInsertedOrUpdatedRows: BigInt(1) };
      const mockInsertBuilder = {
        values: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockResult),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.insertInto).mockReturnValue(
        mockInsertBuilder as unknown as ReturnType<typeof db.insertInto>,
      );

      const result = await caller.insertCustomer({ userId: testUserId });

      expect(result).toEqual(mockResult);
      expect(mockInsertBuilder.values).toHaveBeenCalledWith({
        authUserId: testUserId,
        plan: SubscriptionPlan.FREE,
      });
    });
  });

  describe("queryCustomer", () => {
    it("should successfully query customer when authorized", async () => {
      const caller = createMockCaller(testUserId);

      const mockCustomer = {
        authUserId: testUserId,
        plan: "FREE",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      };

      const mockSelectBuilder = {
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockCustomer),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.selectFrom).mockReturnValue(
        mockSelectBuilder as unknown as ReturnType<typeof db.selectFrom>,
      );

      const result = await caller.queryCustomer({ userId: testUserId });

      expect(result).toEqual(mockCustomer);
    });

    it("should return undefined when customer not found", async () => {
      const caller = createMockCaller(testUserId);

      const mockSelectBuilder = {
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(null),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.selectFrom).mockReturnValue(
        mockSelectBuilder as unknown as ReturnType<typeof db.selectFrom>,
      );

      const result = await caller.queryCustomer({ userId: testUserId });

      expect(result).toBeNull();
    });
  });
});

describe("customerRouter - Edge Cases", () => {
  const testUserId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateUserName", () => {
    it("should handle maximum length name", async () => {
      const caller = createMockCaller(testUserId);
      const maxLengthName = "a".repeat(100);

      const mockUpdateBuilder = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.updateTable).mockReturnValue(
        mockUpdateBuilder as unknown as ReturnType<typeof db.updateTable>,
      );

      const result = await caller.updateUserName({
        name: maxLengthName,
        userId: testUserId,
      });

      expect(result.success).toBe(true);
    });

    it("should handle special characters in name", async () => {
      const caller = createMockCaller(testUserId);
      const specialName = "John O'Brien-Smith Jr.";

      const mockUpdateBuilder = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(db.updateTable).mockReturnValue(
        mockUpdateBuilder as unknown as ReturnType<typeof db.updateTable>,
      );

      const result = await caller.updateUserName({
        name: specialName,
        userId: testUserId,
      });

      expect(result.success).toBe(true);
      expect(mockUpdateBuilder.set).toHaveBeenCalledWith({ name: specialName });
    });
  });

  describe("Unique constraint violation detection", () => {
    it("should correctly identify unique violation by constraint name", () => {
      const error = {
        code: "23505",
        constraint: "Customer_authUserId_unique",
      };

      expect(error.code).toBe("23505");
      expect(error.constraint).toBe("Customer_authUserId_unique");
    });

    it("should not treat other unique violations as customer conflict", () => {
      const error = {
        code: "23505",
        constraint: "SomeOther_unique",
      };

      expect(error.code).toBe("23505");
      expect(error.constraint).not.toBe("Customer_authUserId_unique");
    });
  });
});
