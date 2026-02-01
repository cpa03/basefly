import type { Stripe } from "stripe";
import { CircuitBreaker, safeStripeCall } from "./integration";
import { stripe } from "./index";
import { logger } from "./logger";

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
 * @param prefix - Descriptive prefix for operation type
 * @returns Unique idempotency key string
 */
function generateIdempotencyKey(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * Add request ID to Stripe metadata for tracing
 * 
 * @param requestId - The request ID to add to metadata
 * @param existingMetadata - Existing metadata object
 * @returns New metadata object with request ID
 */
function addRequestMetadata(requestId?: string, existingMetadata?: Stripe.MetadataParam): Stripe.MetadataParam {
  if (!requestId) return existingMetadata ?? {};
  return { ...existingMetadata, requestId };
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
 *   "https://app.example.com/dashboard",
 *   { requestId: "uuid" } // Optional request tracking
 * );
 * const portalUrl = session.url;
 * window.location.href = portalUrl;
 * ```
 * 
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to redirect to after user finishes in portal
 * @param options - Optional request ID for distributed tracing
 * @returns Stripe billing portal session with URL
 */
export async function createBillingSession(customerId: string, returnUrl: string, options?: { requestId?: string }) {
  const { requestId } = options ?? {};

   logger.info("Creating Stripe billing portal session", { requestId, customerId });

    const result = await safeStripeCall(
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
  
  logger.info("Created Stripe billing portal session", { requestId });
  
  return result;
}

/**
 * Create a Stripe Checkout session for subscription payment
 * 
 * Creates a secure checkout page where customers can subscribe to a plan.
 * Idempotency keys ensure safe retries without duplicate charges.
 * Request IDs enable tracing of Stripe operations.
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
 *   "checkout_user123_plan_abc123", // Optional custom key
 *   { requestId: "uuid" } // Optional request tracking
 * );
 * const checkoutUrl = session.url;
 * window.location.href = checkoutUrl;
 * ```
 * 
 * @param params - Stripe checkout session parameters
 * @param idempotencyKey - Optional custom idempotency key (auto-generated if not provided)
 * @param options - Optional request ID for distributed tracing
 * @returns Stripe checkout session with URL
 */
export async function createCheckoutSession(
  params: Stripe.Checkout.SessionCreateParams,
  idempotencyKey?: string,
  options?: { requestId?: string },
) {
  const { requestId } = options ?? {};
  const key = idempotencyKey ?? generateIdempotencyKey("checkout_session");
  
  logger.info("Creating Stripe checkout session", { requestId, idempotencyKey: key });
  
  const result = await safeStripeCall(
    () =>
      stripe.checkout.sessions.create(
        {
          ...params,
          metadata: addRequestMetadata(requestId, params.metadata),
        },
        {
          idempotencyKey: key,
        },
      ),
    {
      serviceName: "Stripe Checkout",
      circuitBreaker: stripeCircuitBreaker,
      maxAttempts: 3,
      timeoutMs: 30000,
    },
  );
  
  logger.info("Created Stripe checkout session", { requestId });
  
  return result;
}

/**
 * Retrieve a Stripe subscription by ID
 * 
 * Fetches current subscription details including status, plan, and billing info.
 * Useful for verifying subscription state after webhooks.
 * Request IDs enable tracing of Stripe operations.
 * 
 * @example
 * ```typescript
 * const subscription = await retrieveSubscription("sub_abc123", { requestId: "uuid" });
 * console.log(`Status: ${subscription.status}`);
 * console.log(`Plan: ${subscription.items.data[0].price.id}`);
 * ```
 * 
 * @param subscriptionId - Stripe subscription ID
 * @param options - Optional request ID for distributed tracing
 * @returns Stripe subscription object with full details
 */
export async function retrieveSubscription(subscriptionId: string, options?: { requestId?: string }) {
  const { requestId } = options ?? {};
  
  logger.info("Retrieving Stripe subscription", { requestId, subscriptionId });
  
  const result = await safeStripeCall(() => stripe.subscriptions.retrieve(subscriptionId), {
    serviceName: "Stripe Subscriptions",
    circuitBreaker: stripeCircuitBreaker,
    maxAttempts: 3,
    timeoutMs: 30000,
  });
  
  logger.info("Retrieved Stripe subscription", { requestId });
  
  return result;
}
