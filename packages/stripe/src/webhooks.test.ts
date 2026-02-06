/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method, @typescript-eslint/no-empty-function, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleEvent } from "./webhooks";
import { db } from "@saasfly/db";
import { stripe } from ".";
import { logger } from "./logger";

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
    updateTable: vi.fn(),
    insertInto: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue(undefined),
    }),
  },
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
}));

vi.mock(".", () => ({
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

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
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

      // @ts-expect-error Type instantiation excessively deep
      vi.mocked(db.updateTable).mockReturnValue({
        where: mockUpdateWhere,
        set: mockSet,
        execute: mockExecute,
      } as any);

      await handleEvent(mockEvent);

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_123");
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

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any,
      );

      await expect(handleEvent(mockEvent)).rejects.toThrow("Missing user id");
    });

    it("handles customer as string correctly", async () => {
      const mockEvent = {
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

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
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

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
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

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_123");
      expect(db.updateTable).toHaveBeenCalledWith("Customer");
      expect(mockUpdateWhere).toHaveBeenCalledWith("id", "=", mockCustomer.id);
    });

    it("throws error when userId is missing", async () => {
      const mockEvent = {
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

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
        mockSubscription as any,
      );

      await expect(handleEvent(mockEvent)).rejects.toThrow("Missing user id");
    });

    it("returns early when priceId is not found", async () => {
      const mockEvent = {
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

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(
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
    it("logs event type", async () => {
      const mockEvent = {
        type: "customer.subscription.updated",
        data: {
          object: {},
        },
      } as any;

      const loggerSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

      await handleEvent(mockEvent);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unhandled event type: customer.subscription.updated"),
      );

      loggerSpy.mockRestore();
    });
  });

  describe("unknown event type", () => {
    it("logs success message for unknown event", async () => {
      const mockEvent = {
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
});
