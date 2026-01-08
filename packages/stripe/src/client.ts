import type { Stripe } from "stripe";
import { CircuitBreaker, safeStripeCall } from "./integration";
import { stripe } from "./index";

/**
 * Circuit breaker for Stripe API calls
 * 
 * Opens after 5 consecutive failures, resets after 60 seconds.
 * Prevents cascading failures when Stripe is unavailable.
 */
const stripeCircuitBreaker = new CircuitBreaker("Stripe", 5, 60000);

/**
 * Generate a unique idempotency key for Stripe operations
 * 
 * Idempotency keys prevent duplicate operations when retrying API calls.
 * This is critical for payment operations to prevent double-charging.
 * 
 * Format: `{prefix}_{timestamp}_{random}`
 * Example: "checkout_session_1704067200000_abc123"
 * 
 * @param prefix - Descriptive prefix for the operation type
 * @returns Unique idempotency key string
 */
function generateIdempotencyKey(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * Create a Stripe Billing Portal session for managing subscriptions
 * 
 * Allows customers to manage their subscription (upgrade, downgrade, cancel)
 * through Stripe's hosted billing portal.
 * 
 * @example
 * ```typescript
 * const session = await createBillingSession(
 *   "cus_abc123",
 *   "https://app.example.com/dashboard"
 * );
 * const portalUrl = session.url;
 * window.location.href = portalUrl;
 * ```
 * 
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to redirect to after user finishes in portal
 * @returns Stripe billing portal session with URL
 */
export async function createBillingSession(customerId: string, returnUrl: string) {
  return safeStripeCall(
    () =>
      stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      }),
    {
      serviceName: "Stripe Billing Portal",
      circuitBreaker: stripeCircuitBreaker,
      maxAttempts: 3,
      timeoutMs: 30000,
    },
  );
}

/**
 * Create a Stripe Checkout session for subscription payment
 * 
 * Creates a secure checkout page where customers can subscribe to a plan.
 * Idempotency keys ensure safe retries without duplicate charges.
 * 
 * @example
 * ```typescript
 * const session = await createCheckoutSession(
 *   {
 *     mode: "subscription",
 *     line_items: [{ price: "price_abc123", quantity: 1 }],
 *     success_url: "https://app.example.com/success",
 *     cancel_url: "https://app.example.com/cancel",
 *   },
 *   "checkout_user123_plan_abc123" // Optional custom key
 * );
 * const checkoutUrl = session.url;
 * window.location.href = checkoutUrl;
 * ```
 * 
 * @param params - Stripe checkout session parameters
 * @param idempotencyKey - Optional custom idempotency key (auto-generated if not provided)
 * @returns Stripe checkout session with URL
 */
export async function createCheckoutSession(
  params: Stripe.Checkout.SessionCreateParams,
  idempotencyKey?: string,
) {
  const key = idempotencyKey || generateIdempotencyKey("checkout_session");

  return safeStripeCall(
    () =>
      stripe.checkout.sessions.create(params, {
        idempotencyKey: key,
      }),
    {
      serviceName: "Stripe Checkout",
      circuitBreaker: stripeCircuitBreaker,
      maxAttempts: 3,
      timeoutMs: 30000,
    },
  );
}

/**
 * Retrieve a Stripe subscription by ID
 * 
 * Fetches current subscription details including status, plan, and billing info.
 * Useful for verifying subscription state after webhooks.
 * 
 * @example
 * ```typescript
 * const subscription = await retrieveSubscription("sub_abc123");
 * console.log(`Status: ${subscription.status}`);
 * console.log(`Plan: ${subscription.items.data[0].price.id}`);
 * ```
 * 
 * @param subscriptionId - Stripe subscription ID
 * @returns Stripe subscription object with full details
 */
export async function retrieveSubscription(subscriptionId: string) {
  return safeStripeCall(() => stripe.subscriptions.retrieve(subscriptionId), {
    serviceName: "Stripe Subscriptions",
    circuitBreaker: stripeCircuitBreaker,
    maxAttempts: 3,
    timeoutMs: 30000,
  });
}
