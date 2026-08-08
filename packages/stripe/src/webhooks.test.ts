import { beforeEach, describe, expect, it, vi } from "vitest";

import { cacheService } from "@saasfly/common/cache";
import { db } from "@saasfly/db";

import { stripe } from ".";
import { logger } from "./logger";
import { handleEvent } from "./webhooks";

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
    updateTable: vi.fn(),
    insertInto: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue(undefined),
    }),
    transaction: vi.fn().mockReturnValue({
      execute: vi
        .fn()
        .mockImplementation(async (cb: (trx: typeof db) => Promise<void>) => {
          await cb(db);
        }),
    }),
  },
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
}));

vi.mock("./stripe-instance", () => ({
  stripe: {
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
}));

describe("handleEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkout.session.completed event", () => {
    it("updates customer subscription on checkout completion", async () => {
      const mockEvent = {
        id: "evt_test_001",
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
          },
        },
      } as any;

      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        metadata: {
          userId: "user_123",
        },
        items: {
          data: [
            {
              price: {
                id: "price_123",
              },
            },
          ],
        },
      };

      const mockCustomer = {
        id: "customer_id",
        authUserId: "user_123",
      };

      vi.mocked(stripe!.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any,
      );

      const mockSelectAll = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockExecuteTakeFirst = vi.fn().mockResolvedValue(mockCustomer);
      const mockUpdateWhere = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockExecute = vi.fn().mockResolvedValue(undefined);

      (vi.mocked(db.selectFrom) as any).mockImplementation(
        () =>
          ({
            selectAll: mockSelectAll,
            where: mockWhere,
            executeTakeFirst: mockExecuteTakeFirst,
          }) as any,
      );

      vi.mocked(db.updateTable).mockReturnValue({
        where: mockUpdateWhere,
        set: mockSet,
        execute: mockExecute,
      } as any);

      await handleEvent(mockEvent);

      expect(stripe!.subscriptions.retrieve).toHaveBeenCalledWith("sub_123");
      expect(db.updateTable).toHaveBeenCalledWith("Customer");
      expect(mockUpdateWhere).toHaveBeenCalledWith("id", "=", mockCustomer.id);
      expect(mockSet).toHaveBeenCalledWith({
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        stripePriceId: "price_123",
      });
    });

    it("throws error when userId is missing", async () => {
      const mockEvent = {
        id: "evt_test_002",
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
          },
        },
      } as any;

      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        metadata: {},
      };

      vi.mocked(stripe!.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any,
      );

      await expect(handleEvent(mockEvent)).rejects.toThrow("Missing user id");
    });

    it("handles customer as string correctly", async () => {
      const mockEvent = {
        id: "evt_test_003",
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
          },
        },
      } as any;

      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        metadata: {
          userId: "user_123",
        },
        items: {
          data: [
            {
              price: {
                id: "price_123",
              },
            },
          ],
        },
      };

      vi.mocked(stripe!.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any,
      );

      const mockWhere = vi.fn().mockReturnThis();
      const mockExecuteTakeFirst = vi.fn().mockResolvedValue(null);
      (vi.mocked(db.selectFrom) as any).mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: mockWhere,
        executeTakeFirst: mockExecuteTakeFirst,
      } as any);

      await handleEvent(mockEvent);

      expect(mockWhere).toHaveBeenCalledWith("authUserId", "=", "user_123");
    });
  });

  describe("invoice.payment_succeeded event", () => {
    it("updates customer info on payment success", async () => {
      const mockEvent = {
        id: "evt_test_004",
        type: "invoice.payment_succeeded",
        data: {
          object: {
            subscription: "sub_123",
          },
        },
      } as any;

      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        metadata: {
          userId: "user_123",
        },
        items: {
          data: [
            {
              price: {
                id: "price_123",
              },
            },
          ],
        },
        current_period_end: 1234567890,
      };

      vi.mocked(stripe!.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any,
      );

      const mockCustomer = {
        id: "customer_id",
        authUserId: "user_123",
      };

      const mockWhere = vi.fn().mockReturnThis();
      const mockExecuteTakeFirst = vi.fn().mockResolvedValue(mockCustomer);
      const mockUpdateWhere = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockExecute = vi.fn().mockResolvedValue(undefined);

      (vi.mocked(db.selectFrom) as any).mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: mockWhere,
        executeTakeFirst: mockExecuteTakeFirst,
      } as any);

      vi.mocked(db.updateTable).mockReturnValue({
        where: mockUpdateWhere,
        set: mockSet,
        execute: mockExecute,
      } as any);

      await handleEvent(mockEvent);

      expect(stripe!.subscriptions.retrieve).toHaveBeenCalledWith("sub_123");
      expect(db.updateTable).toHaveBeenCalledWith("Customer");
      expect(mockUpdateWhere).toHaveBeenCalledWith("id", "=", mockCustomer.id);
    });

    it("throws error when userId is missing", async () => {
      const mockEvent = {
        id: "evt_test_005",
        type: "invoice.payment_succeeded",
        data: {
          object: {
            subscription: "sub_123",
          },
        },
      } as any;

      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        metadata: {},
      };

      vi.mocked(stripe!.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any,
      );

      await expect(handleEvent(mockEvent)).rejects.toThrow("Missing user id");
    });

    it("returns early when priceId is not found", async () => {
      const mockEvent = {
        id: "evt_test_006",
        type: "invoice.payment_succeeded",
        data: {
          object: {
            subscription: "sub_123",
          },
        },
      } as any;

      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        metadata: {
          userId: "user_123",
        },
        items: {
          data: [],
        },
      };

      vi.mocked(stripe!.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any,
      );

      const mockCustomer = {
        id: "customer_id",
        authUserId: "user_123",
      };

      const mockWhere = vi.fn().mockReturnThis();
      const mockExecuteTakeFirst = vi.fn().mockResolvedValue(mockCustomer);
      (vi.mocked(db.selectFrom) as any).mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: mockWhere,
        executeTakeFirst: mockExecuteTakeFirst,
      } as any);

      const result = await handleEvent(mockEvent);

      expect(result).toBeUndefined();
    });
  });

  describe("customer.subscription.updated event", () => {
    it("invalidates subscription cache when userId is present", async () => {
      const mockEvent = {
        id: "evt_test_007",
        type: "customer.subscription.updated",
        data: {
          object: {
            metadata: {
              userId: "user_123",
            },
          },
        },
      } as any;

      const invalidateSpy = vi
        .spyOn(cacheService, "invalidateKey")
        .mockResolvedValue(undefined);

      await handleEvent(mockEvent);

      expect(invalidateSpy).toHaveBeenCalledWith("subscription:user_123");

      invalidateSpy.mockRestore();
    });

    it("skips invalidation and warns when userId is missing", async () => {
      const mockEvent = {
        id: "evt_test_007",
        type: "customer.subscription.updated",
        data: {
          object: {},
        },
      } as any;

      const invalidateSpy = vi
        .spyOn(cacheService, "invalidateKey")
        .mockResolvedValue(undefined);
      const loggerSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

      await handleEvent(mockEvent);

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("skipping cache invalidation"),
      );

      invalidateSpy.mockRestore();
      loggerSpy.mockRestore();
    });
  });

  describe("unknown event type", () => {
    it("logs success message for unknown event", async () => {
      const mockEvent = {
        id: "evt_test_008",
        type: "unknown.event",
        data: {
          object: {},
        },
      } as any;

      const loggerSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

      await handleEvent(mockEvent);

      expect(loggerSpy).toHaveBeenCalledWith("Stripe Webhook Processed", {
        eventType: "unknown.event",
      });

      loggerSpy.mockRestore();
    });
  });

  describe("transaction atomicity", () => {
    function buildCheckoutEvent(): any {
      return {
        id: "evt_test_010",
        type: "checkout.session.completed",
        data: {
          object: {
            subscription: "sub_123",
          },
        },
      };
    }

    function buildSubscription(): any {
      return {
        id: "sub_123",
        customer: "cus_123",
        metadata: {
          userId: "user_123",
        },
        items: {
          data: [
            {
              price: {
                id: "price_123",
              },
            },
          ],
        },
      };
    }

    beforeEach(() => {
      vi.mocked(stripe!.subscriptions.retrieve).mockResolvedValue(
        buildSubscription(),
      );
    });

    it("wraps the customer update in a database transaction", async () => {
      const mockCustomer = { id: "customer_id", authUserId: "user_123" };
      const mockWhere = vi.fn().mockReturnThis();
      const mockExecuteTakeFirst = vi.fn().mockResolvedValue(mockCustomer);

      (vi.mocked(db.selectFrom) as any).mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: mockWhere,
        executeTakeFirst: mockExecuteTakeFirst,
      } as any);

      vi.mocked(db.updateTable).mockReturnValue({
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
      } as any);

      await handleEvent(buildCheckoutEvent());

      expect(db.transaction).toHaveBeenCalled();
    });

    it("propagates an error raised inside the transaction (rollback)", async () => {
      const mockCustomer = { id: "customer_id", authUserId: "user_123" };

      (vi.mocked(db.selectFrom) as any).mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(mockCustomer),
      } as any);

      vi.mocked(db.updateTable).mockReturnValue({
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(new Error("update failed")),
      } as any);

      await expect(handleEvent(buildCheckoutEvent())).rejects.toThrow(
        "update failed",
      );
    });

    it("skips the customer update entirely when no customer is found", async () => {
      (vi.mocked(db.selectFrom) as any).mockReturnValue({
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(null),
      } as any);

      vi.mocked(db.updateTable).mockReturnValue({
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
      } as any);

      await handleEvent(buildCheckoutEvent());

      expect(db.updateTable).not.toHaveBeenCalledWith("Customer");
    });
  });
});
