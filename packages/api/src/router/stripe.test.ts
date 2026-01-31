import { describe, it, expect, vi, beforeEach } from "vitest";
import { stripeRouter } from "./stripe";
import { IntegrationError } from "@saasfly/stripe";

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
  },
  Customer: {},
}));

vi.mock("@saasfly/stripe", () => ({
  createBillingSession: vi.fn(),
  createCheckoutSession: vi.fn(),
  retrieveSubscription: vi.fn(),
  IntegrationError: class IntegrationError extends Error {
    public code?: string;
    public details?: unknown;
    constructor(
      message: string,
      code?: string,
      details?: unknown
    ) {
      super(message);
      this.name = "IntegrationError";
      this.code = code;
      this.details = details;
    }
  },
}));

vi.mock("../env.mjs", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
}));

vi.mock("../../../common/src/subscriptions", () => ({
  pricingData: [
    {
      title: "Free",
      description: "Free plan",
      benefits: [],
      limitations: [],
      prices: { monthly: 0, yearly: 0 },
      stripeIds: { monthly: null, yearly: null },
    },
    {
      title: "Pro",
      description: "Pro plan",
      benefits: ["feature1", "feature2"],
      limitations: [],
      prices: { monthly: 10, yearly: 100 },
      stripeIds: {
        monthly: "price_monthly_pro",
        yearly: "price_yearly_pro",
      },
    },
  ],
}));

vi.mock("../errors", () => ({
  handleIntegrationError: vi.fn((error) => {
    if (error instanceof IntegrationError) {
      const newError = new Error(error.message);
      (newError as any).code = error.code || "INTEGRATION_ERROR";
      (newError as any).details = (error as any).details;
      throw newError;
    }
    throw error;
  }),
}));

describe("stripeRouter", () => {
  let mockCaller: ReturnType<typeof stripeRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    const { db } = require("@saasfly/db");

    mockCaller = stripeRouter.createCaller({
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

  describe("createSession", () => {
    it("creates checkout session for new user without existing customer", async () => {
      const { db } = require("@saasfly/db");
      const { createCheckoutSession } = require("@saasfly/stripe");

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue(null);

      const mockUserSelectWhere = vi.fn().mockReturnThis();
      const mockUserSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        email: "test@example.com",
      });

      vi.mocked(db.selectFrom)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          where: mockSelectWhere,
          executeTakeFirst: mockSelectExecuteTakeFirst,
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          where: mockUserSelectWhere,
          executeTakeFirst: mockUserSelectExecuteTakeFirst,
        } as any);

      createCheckoutSession.mockResolvedValue({
        url: "https://checkout.stripe.com/pay/test",
      });

      const input = { planId: "price_monthly_pro" };

      const result = await mockCaller.createSession(input);

      expect(createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "subscription",
          payment_method_types: ["card"],
          customer_email: "test@example.com",
          client_reference_id: "test-user-id",
          line_items: [{ price: "price_monthly_pro", quantity: 1 }],
        }),
        `checkout_test-user-id_price_monthly_pro`,
        { requestId: "test-request-id" }
      );
      expect(result).toEqual({ success: true, url: "https://checkout.stripe.com/pay/test" });
    });

    it("creates billing session for existing customer with paid plan", async () => {
      const { db } = require("@saasfly/db");
      const { createBillingSession } = require("@saasfly/stripe");

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        id: 1,
        authUserId: "test-user-id",
        plan: "PRO",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        stripePriceId: "price_monthly_pro",
      });

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);

      createBillingSession.mockResolvedValue({
        url: "https://billing.stripe.com/session/test",
      });

      const input = { planId: "price_monthly_pro" };

      const result = await mockCaller.createSession(input);

      expect(createBillingSession).toHaveBeenCalledWith(
        "cus_123",
        "http://localhost:3000/dashboard",
        { requestId: "test-request-id" }
      );
      expect(result).toEqual({ success: true, url: "https://billing.stripe.com/session/test" });
    });

    it("returns failure when checkout session has no url", async () => {
      const { db } = require("@saasfly/db");
      const { createCheckoutSession } = require("@saasfly/stripe");

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue(null);

      const mockUserSelectWhere = vi.fn().mockReturnThis();
      const mockUserSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        email: "test@example.com",
      });

      vi.mocked(db.selectFrom)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          where: mockSelectWhere,
          executeTakeFirst: mockSelectExecuteTakeFirst,
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          where: mockUserSelectWhere,
          executeTakeFirst: mockUserSelectExecuteTakeFirst,
        } as any);

      createCheckoutSession.mockResolvedValue({ url: null });

      const input = { planId: "price_monthly_pro" };

      const result = await mockCaller.createSession(input);

      expect(result).toEqual({ success: false });
    });

    it("handles IntegrationError and rethrows with error handler", async () => {
      const { db } = require("@saasfly/db");
      const { createCheckoutSession, IntegrationError } = require("@saasfly/stripe");
      const { handleIntegrationError } = require("../errors");

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue(null);

      const mockUserSelectWhere = vi.fn().mockReturnThis();
      const mockUserSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        email: "test@example.com",
      });

      vi.mocked(db.selectFrom)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          where: mockSelectWhere,
          executeTakeFirst: mockSelectExecuteTakeFirst,
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          where: mockUserSelectWhere,
          executeTakeFirst: mockUserSelectExecuteTakeFirst,
        } as any);

      createCheckoutSession.mockRejectedValue(
        new IntegrationError("Stripe API error", "STRIPE_ERROR")
      );

      const input = { planId: "price_monthly_pro" };

      await expect(mockCaller.createSession(input)).rejects.toThrow(
        "Stripe API error"
      );
      expect(handleIntegrationError).toHaveBeenCalled();
    });
  });

  describe("userPlans", () => {
    it("returns FREE plan for user without active subscription", async () => {
      const { db } = require("@saasfly/db");

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        stripeSubscriptionId: null,
        stripeCurrentPeriodEnd: null,
        stripeCustomerId: null,
        stripePriceId: null,
      });

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);

      const result = await mockCaller.userPlans();

      expect(result).toHaveProperty("title", "Free");
      expect(result).toHaveProperty("isPaid", false);
      expect(result).toHaveProperty("interval", null);
    });

    it("returns PRO plan for user with active monthly subscription", async () => {
      const { db } = require("@saasfly/db");
      const { retrieveSubscription } = require("@saasfly/stripe");

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        stripeSubscriptionId: "sub_123",
        stripeCurrentPeriodEnd: futureDate,
        stripeCustomerId: "cus_123",
        stripePriceId: "price_monthly_pro",
      });

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);

      retrieveSubscription.mockResolvedValue({
        cancel_at_period_end: false,
      });

      const result = await mockCaller.userPlans();

      expect(result).toHaveProperty("title", "Pro");
      expect(result).toHaveProperty("isPaid", true);
      expect(result).toHaveProperty("interval", "month");
      expect(result).toHaveProperty("isCanceled", false);
    });

    it("returns PRO plan for user with active yearly subscription", async () => {
      const { db } = require("@saasfly/db");
      const { retrieveSubscription } = require("@saasfly/stripe");

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 365);

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        stripeSubscriptionId: "sub_123",
        stripeCurrentPeriodEnd: futureDate,
        stripeCustomerId: "cus_123",
        stripePriceId: "price_yearly_pro",
      });

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);

      retrieveSubscription.mockResolvedValue({
        cancel_at_period_end: true,
      });

      const result = await mockCaller.userPlans();

      expect(result).toHaveProperty("title", "Pro");
      expect(result).toHaveProperty("isPaid", true);
      expect(result).toHaveProperty("interval", "year");
      expect(result).toHaveProperty("isCanceled", true);
    });

    it("returns FREE plan for user with expired subscription", async () => {
      const { db } = require("@saasfly/db");

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        stripeSubscriptionId: "sub_123",
        stripeCurrentPeriodEnd: pastDate,
        stripeCustomerId: "cus_123",
        stripePriceId: "price_monthly_pro",
      });

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);

      const result = await mockCaller.userPlans();

      expect(result).toHaveProperty("title", "Free");
      expect(result).toHaveProperty("isPaid", false);
    });

    it("returns undefined when customer does not exist", async () => {
      const { db } = require("@saasfly/db");

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue(null);

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);

      const result = await mockCaller.userPlans();

      expect(result).toBeUndefined();
    });

    it("handles retrieveSubscription errors gracefully", async () => {
      const { db } = require("@saasfly/db");
      const { retrieveSubscription, IntegrationError } = require("@saasfly/stripe");
      const { handleIntegrationError } = require("../errors");

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const mockSelectWhere = vi.fn().mockReturnThis();
      const mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue({
        stripeSubscriptionId: "sub_123",
        stripeCurrentPeriodEnd: futureDate,
        stripeCustomerId: "cus_123",
        stripePriceId: "price_monthly_pro",
      });

      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        where: mockSelectWhere,
        executeTakeFirst: mockSelectExecuteTakeFirst,
      } as any);

      retrieveSubscription.mockRejectedValue(
        new IntegrationError("Stripe API error")
      );

      const result = await mockCaller.userPlans();

      expect(handleIntegrationError).toHaveBeenCalled();
      expect(result).toHaveProperty("title", "Pro");
      expect(result).toHaveProperty("isCanceled", undefined);
    });
  });
});
