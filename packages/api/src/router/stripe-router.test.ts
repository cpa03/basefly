/**
 * Stripe Billing Router Business Logic Tests
 *
 * Exercises the actual stripeRouter procedures (createSession, userPlans)
 * through a real tRPC caller with mocked database, cache, and Stripe
 * integration layers (refs #631, #725).
 *
 * Covers:
 * - Authentication enforcement (unauthenticated => UNAUTHORIZED)
 * - createSession: billing portal for paid customers, checkout for free
 * - createSession: missing session URL => failure result
 * - createSession: Stripe integration errors => INTEGRATION_ERROR
 * - userPlans: no customer => undefined
 * - userPlans: paid plan resolution + caching
 * - userPlans: free plan fallback
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

import type * as CommonTypes from "@saasfly/common";

import { getLimiter } from "../distributed-rate-limiter";
import type { TRPCContext } from "../trpc";
// Import AFTER mocks are registered.
import { stripeRouter } from "./stripe";

// Mock Clerk server helpers to avoid server-only module side effects.
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  getAuth: vi.fn(),
}));

const mockDb = vi.hoisted(() => ({
  selectFrom: vi.fn(),
}));

const mockCacheService = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

const mockStripe = vi.hoisted(() => ({
  createBillingSession: vi.fn(),
  createCheckoutSession: vi.fn(),
  retrieveSubscription: vi.fn(),
  IntegrationError: class IntegrationError extends Error {
    constructor(
      message: string,
      public readonly code: string,
      public readonly originalError?: unknown,
    ) {
      super(message);
      this.name = "IntegrationError";
    }
  },
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

vi.mock("@saasfly/common/cache", () => ({
  cacheService: mockCacheService,
  CACHE_KEYS: {
    subscription: (userId: string) => `subscription:${userId}`,
  },
}));

vi.mock("@saasfly/common", async (importOriginal) => {
  const actual = await importOriginal<typeof CommonTypes>();
  return {
    ...actual,
    CACHE_DURATION: { FIVE_MINUTES: 300 },
    TIME_MS: { ONE_DAY: 86400000 },
    pricingData: [
      {
        title: "Starter",
        description: "Starter plan",
        benefits: [],
        limitations: [],
        prices: { monthly: 0, yearly: 0 },
        stripeIds: { monthly: null, yearly: null },
      },
      {
        title: "Pro",
        description: "Pro plan",
        benefits: [],
        limitations: [],
        prices: { monthly: 20, yearly: 200 },
        stripeIds: {
          monthly: "price_pro_monthly",
          yearly: "price_pro_yearly",
        },
      },
    ],
  };
});

vi.mock("@saasfly/stripe", () => mockStripe);

vi.mock("../logger", () => ({
  logger: mockLogger,
}));

vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}));

vi.mock("../env.mjs", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    RESEND_API_KEY: "test-key",
  },
}));

const OWNER_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

/** Builds a full authenticated TRPCContext for the stripe router. */
function createStripeContext(
  overrides: Partial<TRPCContext> = {},
): TRPCContext {
  return {
    userId: OWNER_USER_ID,
    requestId: "req-stripe-123",
    rateLimitInfo: null,
    role: null,
    headers: new Headers({
      origin: "http://localhost:3000",
      "x-request-id": "req-stripe-123",
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
  return stripeRouter.createCaller(ctx);
}

/** Default db.selectFrom(...).where(...).executeTakeFirst() mock. */
function mockCustomerQuery(result: unknown) {
  mockDb.selectFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        executeTakeFirst: vi.fn().mockResolvedValue(result),
      }),
    }),
  });
}

describe("stripeRouter - Business Logic", () => {
  const RATE_LIMIT_IDENTIFIER = `user:${OWNER_USER_ID}`;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    mockCustomerQuery(undefined);
    mockCacheService.get.mockResolvedValue(undefined);
    mockCacheService.set.mockResolvedValue(undefined);

    await getLimiter("stripe").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("read").resetAsync(RATE_LIMIT_IDENTIFIER);
  });

  afterEach(async () => {
    await getLimiter("stripe").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("read").resetAsync(RATE_LIMIT_IDENTIFIER);
  });

  describe("createSession", () => {
    it("throws UNAUTHORIZED when the user is not authenticated", async () => {
      const caller = createCaller(
        createStripeContext({ userId: null as unknown as string }),
      );

      await expect(
        caller.createSession({ planId: "price_pro_monthly" }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });

    it("creates a billing portal session for a paid customer", async () => {
      mockCustomerQuery({
        id: 1,
        plan: "PRO",
        stripeCustomerId: "cus_123",
      });
      mockStripe.createBillingSession.mockResolvedValue({
        url: "https://billing.stripe.com/session",
      });

      const caller = createCaller(createStripeContext());
      const result = await caller.createSession({
        planId: "price_pro_monthly",
      });

      expect(mockStripe.createBillingSession).toHaveBeenCalledWith(
        "cus_123",
        "http://localhost:3000/dashboard",
        { requestId: "req-stripe-123" },
      );
      expect(result).toEqual({
        success: true,
        url: "https://billing.stripe.com/session",
      });
    });

    it("creates a checkout session for a free / new customer", async () => {
      mockCustomerQuery(undefined);
      mockStripe.createCheckoutSession.mockResolvedValue({
        url: "https://checkout.stripe.com/pay",
      });

      const caller = createCaller(createStripeContext());
      const result = await caller.createSession({
        planId: "price_pro_monthly",
      });

      expect(mockStripe.createCheckoutSession).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        url: "https://checkout.stripe.com/pay",
      });
    });

    it("returns a failure result when the checkout session has no URL", async () => {
      mockCustomerQuery(undefined);
      mockStripe.createCheckoutSession.mockResolvedValue({ url: null });

      const caller = createCaller(createStripeContext());
      const result = await caller.createSession({
        planId: "price_pro_monthly",
      });

      expect(result).toEqual({ success: false });
    });

    it("propagates INTEGRATION_ERROR when Stripe integration fails", async () => {
      mockCustomerQuery(undefined);
      mockStripe.createCheckoutSession.mockRejectedValue(
        new mockStripe.IntegrationError("stripe down", "STRIPE_ERROR"),
      );

      const caller = createCaller(createStripeContext());

      await expect(
        caller.createSession({ planId: "price_pro_monthly" }),
      ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    });
  });

  describe("userPlans", () => {
    it("throws UNAUTHORIZED when the user is not authenticated", async () => {
      const caller = createCaller(
        createStripeContext({ userId: null as unknown as string }),
      );

      await expect(caller.userPlans()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("returns undefined when the user has no customer record", async () => {
      mockCustomerQuery(undefined);

      const caller = createCaller(createStripeContext());
      const result = await caller.userPlans();

      expect(result).toBeUndefined();
    });

    it("returns the cached plan when present", async () => {
      const cached = { title: "Pro", isPaid: true };
      mockCacheService.get.mockResolvedValue(cached);

      const caller = createCaller(createStripeContext());
      const result = await caller.userPlans();

      expect(result).toEqual(cached);
      expect(mockDb.selectFrom).not.toHaveBeenCalled();
    });

    it("returns a paid plan with interval for a paid customer", async () => {
      mockCustomerQuery({
        stripeSubscriptionId: "sub_123",
        stripeCurrentPeriodEnd: new Date(Date.now() + 86400000),
        stripeCustomerId: "cus_123",
        stripePriceId: "price_pro_monthly",
      });
      mockStripe.retrieveSubscription.mockResolvedValue({
        cancel_at_period_end: false,
      });

      const caller = createCaller(createStripeContext());
      const result = await caller.userPlans();

      expect(result?.isPaid).toBe(true);
      expect(result?.interval).toBe("month");
      expect(result?.isCanceled).toBe(false);
      expect(result?.title).toBe("Pro");
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it("falls back to the free plan for an expired subscription", async () => {
      mockCustomerQuery({
        stripeSubscriptionId: "sub_123",
        stripeCurrentPeriodEnd: new Date(Date.now() - 86400000),
        stripeCustomerId: "cus_123",
        stripePriceId: "price_pro_monthly",
      });

      const caller = createCaller(createStripeContext());
      const result = await caller.userPlans();

      expect(result?.isPaid).toBe(false);
      expect(result?.title).toBe("Starter");
    });
  });
});
