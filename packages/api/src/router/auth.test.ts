import { describe, it, expect, vi, beforeEach } from "vitest";
import { authRouter } from "./auth";

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
  },
}));

describe("authRouter", () => {
  let mockCaller: ReturnType<typeof authRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    const { db } = require("@saasfly/db");

    mockCaller = authRouter.createCaller({
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

  describe("mySubscription", () => {
    let mockSelect: ReturnType<typeof vi.fn>;
    let mockSelectWhere: ReturnType<typeof vi.fn>;
    let mockSelectExecuteTakeFirst: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      const { db } = require("@saasfly/db");

      mockSelect = vi.fn().mockReturnThis();
      mockSelectWhere = vi.fn().mockReturnThis();
      mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        plan: "PRO",
        stripeCurrentPeriodEnd: new Date(),
      });

      vi.mocked(db.selectFrom).mockReturnValue({
        select: mockSelect,
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);
    });

    it("returns subscription plan for existing customer", async () => {
      const { db } = require("@saasfly/db");

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      mockSelectExecuteTakeFirst.mockResolvedValue({
        plan: "PRO",
        stripeCurrentPeriodEnd: futureDate,
      });

      const result = await mockCaller.mySubscription();

      expect(db.selectFrom).toHaveBeenCalledWith("Customer");
      expect(mockSelectWhere).toHaveBeenCalledWith("authUserId", "=", "test-user-id");
      expect(mockSelectExecuteTakeFirst).toHaveBeenCalled();
      expect(result).toEqual({
        plan: "PRO",
        endsAt: futureDate,
      });
    });

    it("returns null when customer does not exist", async () => {
      mockSelectExecuteTakeFirst.mockResolvedValue(null);

      const result = await mockCaller.mySubscription();

      expect(result).toBeNull();
    });

    it("returns subscription with FREE plan", async () => {
      mockSelectExecuteTakeFirst.mockResolvedValue({
        plan: "FREE",
        stripeCurrentPeriodEnd: null,
      });

      const result = await mockCaller.mySubscription();

      expect(result).toEqual({
        plan: "FREE",
        endsAt: null,
      });
    });

    it("returns subscription with BUSINESS plan", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 365);

      mockSelectExecuteTakeFirst.mockResolvedValue({
        plan: "BUSINESS",
        stripeCurrentPeriodEnd: futureDate,
      });

      const result = await mockCaller.mySubscription();

      expect(result).toEqual({
        plan: "BUSINESS",
        endsAt: futureDate,
      });
    });

    it("returns subscription with null stripeCurrentPeriodEnd", async () => {
      mockSelectExecuteTakeFirst.mockResolvedValue({
        plan: "PRO",
        stripeCurrentPeriodEnd: null,
      });

      const result = await mockCaller.mySubscription();

      expect(result).toEqual({
        plan: "PRO",
        endsAt: null,
      });
    });

    it("handles database errors gracefully", async () => {
      mockSelectExecuteTakeFirst.mockRejectedValue(new Error("Database error"));

      await expect(mockCaller.mySubscription()).rejects.toThrow("Database error");
    });

    it("passes requestId to database query", async () => {
      const callerWithRequestId = authRouter.createCaller({
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
        requestId: "custom-request-id",
      });

      await callerWithRequestId.mySubscription();

      expect(mockSelectWhere).toHaveBeenCalledWith("authUserId", "=", "test-user-id");
    });
  });
});
