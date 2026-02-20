import type { Stripe } from "stripe";

import {
  CIRCUIT_BREAKER_CONFIG,
  RETRY_CONFIG,
  TIMEOUT_CONFIG,
} from "@saasfly/common";

import { stripe } from "./index";
import { CircuitBreaker, safeStripeCall } from "./integration";
import { logger } from "./logger";

const stripeCircuitBreaker = new CircuitBreaker(
  "Stripe",
  CIRCUIT_BREAKER_CONFIG.failureThreshold,
  CIRCUIT_BREAKER_CONFIG.resetTimeoutMs,
);

function requireStripeClient(): NonNullable<typeof stripe> {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET environment variables. See .env.example for all required Stripe keys. Billing features will be disabled until configured.",
    );
  }
  return stripe;
}

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
function addRequestMetadata(
  requestId?: string,
  existingMetadata?: Stripe.MetadataParam,
): Stripe.MetadataParam {
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
export async function createBillingSession(
  customerId: string,
  returnUrl: string,
  options?: { requestId?: string },
) {
  const { requestId } = options ?? {};
  const client = requireStripeClient();

  logger.info("Creating Stripe billing portal session", {
    requestId,
    customerId,
  });

  const result = await safeStripeCall(
    () =>
      client.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      }),
    {
      serviceName: "Stripe Billing Portal",
      circuitBreaker: stripeCircuitBreaker,
      maxAttempts: RETRY_CONFIG.maxAttempts,
      timeoutMs: TIMEOUT_CONFIG.default,
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
  const client = requireStripeClient();

  logger.info("Creating Stripe checkout session", {
    requestId,
    idempotencyKey: key,
  });

  const result = await safeStripeCall(
    () =>
      client.checkout.sessions.create(
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
      maxAttempts: RETRY_CONFIG.maxAttempts,
      timeoutMs: TIMEOUT_CONFIG.default,
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
export async function retrieveSubscription(
  subscriptionId: string,
  options?: { requestId?: string },
) {
  const { requestId } = options ?? {};
  const client = requireStripeClient();

  logger.info("Retrieving Stripe subscription", { requestId, subscriptionId });

  const result = await safeStripeCall(
    () => client.subscriptions.retrieve(subscriptionId),
    {
      serviceName: "Stripe Subscriptions",
      circuitBreaker: stripeCircuitBreaker,
      maxAttempts: RETRY_CONFIG.maxAttempts,
      timeoutMs: TIMEOUT_CONFIG.default,
    },
  );

  logger.info("Retrieved Stripe subscription", { requestId });

  return result;
}
