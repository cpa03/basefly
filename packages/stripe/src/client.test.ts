import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createBillingSession,
  createCheckoutSession,
  retrieveSubscription,
} from "./client";
import { safeStripeCall } from "./integration";

vi.mock("./integration", () => ({
  safeStripeCall: vi.fn(),
  CircuitBreaker: vi.fn(),
}));

vi.mock("./index", () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
  },
}));

describe("createBillingSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates billing session with correct parameters", async () => {
    const mockSession = { url: "https://billing.stripe.com/session/123" };
    vi.mocked(safeStripeCall).mockResolvedValue(mockSession);

    const result = await createBillingSession("cus_123", "https://example.com/dashboard");

    expect(result).toEqual(mockSession);
    expect(safeStripeCall).toHaveBeenCalledWith(
      expect.any(Function),
      {
        serviceName: "Stripe Billing Portal",
        circuitBreaker: expect.any(Object),
        maxAttempts: 3,
        timeoutMs: 30000,
      }
    );
  });

  it("passes customer ID and return URL to Stripe API", async () => {
    const { stripe } = require("./index");
    const mockSession = { url: "https://billing.stripe.com/session/123" };
    let capturedFn: any;

    vi.mocked(safeStripeCall).mockImplementation((fn: any) => {
      capturedFn = fn;
      return Promise.resolve(mockSession);
    });

    await createBillingSession("cus_abc", "https://example.com/return");

    if (capturedFn) {
      await capturedFn();
      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: "cus_abc",
        return_url: "https://example.com/return",
      });
    }
  });

  it("handles Stripe API errors", async () => {
    const error = new Error("Stripe API error");
    vi.mocked(safeStripeCall).mockRejectedValue(error);

    await expect(createBillingSession("cus_123", "https://example.com")).rejects.toThrow(error);
  });

  it("uses circuit breaker for resilience", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ url: "https://example.com" });

    await createBillingSession("cus_123", "https://example.com");

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.circuitBreaker).toBeDefined();
  });

  it("sets maxAttempts to 3", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ url: "https://example.com" });

    await createBillingSession("cus_123", "https://example.com");

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.maxAttempts).toBe(3);
  });

  it("sets timeout to 30000ms", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ url: "https://example.com" });

    await createBillingSession("cus_123", "https://example.com");

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.timeoutMs).toBe(30000);
  });
});

describe("createCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates checkout session with provided parameters", async () => {
    const mockSession = { url: "https://checkout.stripe.com/session/456", id: "cs_123" };
    vi.mocked(safeStripeCall).mockResolvedValue(mockSession);

    const params = {
      mode: "subscription" as const,
      payment_method_types: ["card"] as const,
      customer_email: "test@example.com",
      client_reference_id: "user_123",
      subscription_data: { metadata: { userId: "user_123" } },
      cancel_url: "https://example.com/dashboard",
      success_url: "https://example.com/success",
      line_items: [{ price: "price_123", quantity: 1 }],
    };

    const result = await createCheckoutSession(params, "checkout_user_123_price_123");

    expect(result).toEqual(mockSession);
    expect(safeStripeCall).toHaveBeenCalledWith(
      expect.any(Function),
      {
        serviceName: "Stripe Checkout",
        circuitBreaker: expect.any(Object),
        maxAttempts: 3,
        timeoutMs: 30000,
      }
    );
  });

  it("generates idempotency key if not provided", async () => {
    const mockSession = { url: "https://example.com" };
    let capturedFn: any;
    const { stripe } = require("./index");

    vi.mocked(safeStripeCall).mockImplementation((fn: any, options: any) => {
      capturedFn = fn;
      return Promise.resolve(mockSession);
    });

    await createCheckoutSession({ mode: "subscription" as const, line_items: [] });

    if (capturedFn) {
      await capturedFn();
      const stripeCall = vi.mocked(stripe.checkout.sessions.create).mock.calls[0][1];
      expect(stripeCall?.idempotencyKey).toBeDefined();
      expect(stripeCall?.idempotencyKey).toMatch(/^checkout_session_\d+_/);
    }
  });

  it("uses provided idempotency key", async () => {
    const mockSession = { url: "https://example.com" };
    let capturedFn: any;
    const { stripe } = require("./index");

    vi.mocked(safeStripeCall).mockImplementation((fn: any) => {
      capturedFn = fn;
      return Promise.resolve(mockSession);
    });

    await createCheckoutSession(
      { mode: "subscription" as const, line_items: [] },
      "custom_key_123"
    );

    if (capturedFn) {
      await capturedFn();
      const stripeCall = vi.mocked(stripe.checkout.sessions.create).mock.calls[0][1];
      expect(stripeCall?.idempotencyKey).toBe("custom_key_123");
    }
  });

  it("includes idempotency key in Stripe API call", async () => {
    const mockSession = { url: "https://example.com" };
    let capturedFn: any;
    const { stripe } = require("./index");

    vi.mocked(safeStripeCall).mockImplementation((fn: any) => {
      capturedFn = fn;
      return Promise.resolve(mockSession);
    });

    await createCheckoutSession({ mode: "subscription" as const, line_items: [] });

    if (capturedFn) {
      await capturedFn();
      expect(stripe.checkout.sessions.create).toHaveBeenCalled();
      const callArgs = vi.mocked(stripe.checkout.sessions.create).mock.calls[0];
      expect(callArgs[1]?.idempotencyKey).toBeDefined();
    }
  });

  it("handles Stripe API errors", async () => {
    const error = new Error("Checkout session creation failed");
    vi.mocked(safeStripeCall).mockRejectedValue(error);

    await expect(createCheckoutSession({ mode: "subscription" as const, line_items: [] }))
      .rejects.toThrow(error);
  });

  it("uses circuit breaker for resilience", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ url: "https://example.com" });

    await createCheckoutSession({ mode: "subscription" as const, line_items: [] });

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.circuitBreaker).toBeDefined();
  });

  it("sets maxAttempts to 3", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ url: "https://example.com" });

    await createCheckoutSession({ mode: "subscription" as const, line_items: [] });

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.maxAttempts).toBe(3);
  });

  it("sets timeout to 30000ms", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ url: "https://example.com" });

    await createCheckoutSession({ mode: "subscription" as const, line_items: [] });

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.timeoutMs).toBe(30000);
  });

  it("passes all session parameters to Stripe API", async () => {
    const mockSession = { url: "https://example.com" };
    let capturedFn: any;
    const { stripe } = require("./index");

    vi.mocked(safeStripeCall).mockImplementation((fn: any) => {
      capturedFn = fn;
      return Promise.resolve(mockSession);
    });

    const params = {
      mode: "subscription" as const,
      payment_method_types: ["card"] as const,
      customer_email: "test@example.com",
      client_reference_id: "ref_123",
      subscription_data: { metadata: { userId: "user_123" } },
      cancel_url: "https://example.com/cancel",
      success_url: "https://example.com/success",
      line_items: [{ price: "price_abc", quantity: 2 }],
    };

    await createCheckoutSession(params, "key_123");

    if (capturedFn) {
      await capturedFn();
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(params, expect.any(Object));
    }
  });
});

describe("retrieveSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves subscription with subscription ID", async () => {
    const mockSubscription = {
      id: "sub_123",
      customer: "cus_123",
      items: { data: [{ price: { id: "price_123" } }] },
      current_period_end: 1234567890,
    };
    vi.mocked(safeStripeCall).mockResolvedValue(mockSubscription);

    const result = await retrieveSubscription("sub_123");

    expect(result).toEqual(mockSubscription);
    expect(safeStripeCall).toHaveBeenCalledWith(
      expect.any(Function),
      {
        serviceName: "Stripe Subscriptions",
        circuitBreaker: expect.any(Object),
        maxAttempts: 3,
        timeoutMs: 30000,
      }
    );
  });

  it("passes subscription ID to Stripe API", async () => {
    const mockSubscription = { id: "sub_abc" };
    let capturedFn: any;
    const { stripe } = require("./index");

    vi.mocked(safeStripeCall).mockImplementation((fn: any) => {
      capturedFn = fn;
      return Promise.resolve(mockSubscription);
    });

    await retrieveSubscription("sub_abc");

    if (capturedFn) {
      await capturedFn();
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_abc");
    }
  });

  it("handles Stripe API errors", async () => {
    const error = new Error("Subscription not found");
    vi.mocked(safeStripeCall).mockRejectedValue(error);

    await expect(retrieveSubscription("sub_123")).rejects.toThrow(error);
  });

  it("uses circuit breaker for resilience", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ id: "sub_123" });

    await retrieveSubscription("sub_123");

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.circuitBreaker).toBeDefined();
  });

  it("sets maxAttempts to 3", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ id: "sub_123" });

    await retrieveSubscription("sub_123");

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.maxAttempts).toBe(3);
  });

  it("sets timeout to 30000ms", async () => {
    vi.mocked(safeStripeCall).mockResolvedValue({ id: "sub_123" });

    await retrieveSubscription("sub_123");

    const callOptions = vi.mocked(safeStripeCall).mock.calls[0][1];
    expect(callOptions?.timeoutMs).toBe(30000);
  });

  it("returns subscription object with all expected fields", async () => {
    const mockSubscription = {
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      items: {
        data: [
          {
            id: "item_123",
            price: { id: "price_123", unit_amount: 1000 },
          },
        ],
      },
      current_period_end: 1234567890,
      cancel_at_period_end: false,
    };
    vi.mocked(safeStripeCall).mockResolvedValue(mockSubscription);

    const result = await retrieveSubscription("sub_123");

    expect(result).toEqual(mockSubscription);
    expect(result.id).toBe("sub_123");
    expect(result.customer).toBe("cus_123");
    expect(result.status).toBe("active");
  });
});
