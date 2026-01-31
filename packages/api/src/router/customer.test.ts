import { describe, it, expect, vi, beforeEach } from "vitest";
import { customerRouter } from "./customer";

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
    updateTable: vi.fn(),
    insertInto: vi.fn(),
  },
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
}));

describe("customerRouter", () => {
  let mockCaller: ReturnType<typeof customerRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    const { db } = require("@saasfly/db");

    mockCaller = customerRouter.createCaller({
      headers: new Headers(),
      auth: {
        userId: "test-user-id",
        sessionClaims: null,
        sessionId: null,
        sessionStatus: null,
        actor: null,
        orgId: null,
        orgRole: null,
        orgPermissions: null,
        orgSlug: null,
      } as any,
      req: undefined,
      userId: "test-user-id",
      requestId: "test-request-id",
    });
  });

  describe("updateUserName", () => {
    let mockUpdateWhere: ReturnType<typeof vi.fn>;
    let mockUpdateSet: ReturnType<typeof vi.fn>;
    let mockUpdateExecute: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      const { db } = require("@saasfly/db");

      mockUpdateWhere = vi.fn().mockReturnThis();
      mockUpdateSet = vi.fn().mockReturnThis();
      mockUpdateExecute = vi.fn().mockResolvedValue(undefined);

      vi.mocked(db.updateTable).mockReturnValue({
        where: mockUpdateWhere,
        set: mockUpdateSet,
        execute: mockUpdateExecute,
      } as any);
    });

    it("updates user name when userId matches ctxUserId", async () => {
      const { db } = require("@saasfly/db");

      const input = {
        name: "New Name",
        userId: "test-user-id",
      };

      const result = await mockCaller.updateUserName(input);

      expect(db.updateTable).toHaveBeenCalledWith("User");
      expect(mockUpdateWhere).toHaveBeenCalledWith("id", "=", "test-user-id");
      expect(mockUpdateSet).toHaveBeenCalledWith({ name: "New Name" });
      expect(mockUpdateExecute).toHaveBeenCalled();
      expect(result).toEqual({ success: true, reason: "" });
    });

    it("returns failure when userId does not match ctxUserId", async () => {
      const { db } = require("@saasfly/db");

      const input = {
        name: "New Name",
        userId: "different-user-id",
      };

      const result = await mockCaller.updateUserName(input);

      expect(db.updateTable).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, reason: "no auth" });
    });

    it("handles database errors gracefully", async () => {
      mockUpdateExecute.mockRejectedValue(new Error("Database error"));

      const input = {
        name: "New Name",
        userId: "test-user-id",
      };

      await expect(mockCaller.updateUserName(input)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("insertCustomer", () => {
    let mockInsertValues: ReturnType<typeof vi.fn>;
    let mockInsertExecute: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      const { db } = require("@saasfly/db");

      mockInsertValues = vi.fn().mockReturnThis();
      mockInsertExecute = vi.fn().mockResolvedValue({
        id: 1,
        authUserId: "test-user-id",
        plan: "FREE",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.insertInto).mockReturnValue({
        values: mockInsertValues,
        executeTakeFirst: mockInsertExecute,
      } as any);
    });

    it("inserts customer with FREE plan", async () => {
      const { db, SubscriptionPlan } = require("@saasfly/db");

      const input = {
        userId: "test-user-id",
      };

      const result = await mockCaller.insertCustomer(input);

      expect(db.insertInto).toHaveBeenCalledWith("Customer");
      expect(mockInsertValues).toHaveBeenCalledWith({
        authUserId: "test-user-id",
        plan: SubscriptionPlan.FREE,
      });
      expect(mockInsertExecute).toHaveBeenCalled();
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("authUserId", "test-user-id");
      expect(result).toHaveProperty("plan", "FREE");
    });

    it("handles database errors gracefully", async () => {
      mockInsertExecute.mockRejectedValue(new Error("Database error"));

      const input = {
        userId: "test-user-id",
      };

      await expect(mockCaller.insertCustomer(input)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("queryCustomer", () => {
    let mockSelect: ReturnType<typeof vi.fn>;
    let mockSelectWhere: ReturnType<typeof vi.fn>;
    let mockSelectExecuteTakeFirst: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      const { db } = require("@saasfly/db");

      mockSelect = vi.fn().mockReturnThis();
      mockSelectWhere = vi.fn().mockReturnThis();
      mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        id: 1,
        authUserId: "test-user-id",
        plan: "PRO",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        stripePriceId: "price_123",
        stripeCurrentPeriodEnd: new Date(),
      });

      vi.mocked(db.selectFrom).mockReturnValue({
        select: mockSelect,
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);
    });

    it("returns customer data for existing user", async () => {
      const { db } = require("@saasfly/db");

      const input = {
        userId: "test-user-id",
      };

      const result = await mockCaller.queryCustomer(input);

      expect(db.selectFrom).toHaveBeenCalledWith("Customer");
      expect(mockSelectWhere).toHaveBeenCalledWith("authUserId", "=", "test-user-id");
      expect(mockSelectExecuteTakeFirst).toHaveBeenCalled();
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("plan", "PRO");
      expect(result).toHaveProperty("stripeCustomerId", "cus_123");
    });

    it("returns null when customer does not exist", async () => {
      mockSelectExecuteTakeFirst.mockResolvedValue(null);

      const input = {
        userId: "non-existent-user",
      };

      const result = await mockCaller.queryCustomer(input);

      expect(result).toBeNull();
    });

    it("handles database errors gracefully", async () => {
      mockSelectExecuteTakeFirst.mockRejectedValue(new Error("Database error"));

      const input = {
        userId: "test-user-id",
      };

      await expect(mockCaller.queryCustomer(input)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
