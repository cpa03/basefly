import { env } from "./env.mjs";
import { createStripeClientWithDefaults } from "./integration";
import { logger } from "./logger";
// =============================================================================
// EXPLICIT BARREL EXPORTS
// =============================================================================
// This file uses explicit named exports instead of `export *` for better
// tree-shaking. Each module's exports are explicitly listed below.
// See Issue #523: Audit and optimize barrel exports for tree-shaking
// =============================================================================

// -----------------------------------------------------------------------------
// webhooks.ts - Stripe webhook event handling
// -----------------------------------------------------------------------------
export { handleEvent } from "./webhooks";

// -----------------------------------------------------------------------------
// integration.ts - Resilience patterns (circuit breaker, retry, timeout)
// -----------------------------------------------------------------------------
export {
  IntegrationError,
  CircuitBreakerOpenError,
  CircuitBreaker,
  defaultRetryableErrors,
  withRetry,
  isRetryableError,
  withTimeout,
  createStripeClientWithDefaults,
  safeStripeCall,
} from "./integration";

// -----------------------------------------------------------------------------
// client.ts - Stripe API client functions
// -----------------------------------------------------------------------------
export {
  createBillingSession,
  createCheckoutSession,
  retrieveSubscription,
} from "./client";

// -----------------------------------------------------------------------------
// webhook-idempotency.ts - Webhook idempotency tracking
// -----------------------------------------------------------------------------
export {
  hasEventBeenProcessed,
  markEventAsProcessed,
  registerWebhookEvent,
  executeIdempotentWebhook,
  cleanupOldWebhookEvents,
} from "./webhook-idempotency";

// -----------------------------------------------------------------------------
// plans.ts - Subscription plan utilities
// -----------------------------------------------------------------------------
export { getPlans, PLANS, getSubscriptionPlan } from "./plans";
export type { PlanType } from "./plans";

// -----------------------------------------------------------------------------
// Local exports - Stripe client instance and helpers
// -----------------------------------------------------------------------------

/**
 * Type alias for the configured Stripe client instance
 * @see createStripeClientWithDefaults
 */
export type StripeClient = ReturnType<typeof createStripeClientWithDefaults>;

function createStripeClientSafe(): StripeClient | null {
  try {
    if (!env.STRIPE_API_KEY || env.STRIPE_API_KEY.length < 10) {
      logger.warn(
        "STRIPE_API_KEY not configured, Stripe features will be disabled",
      );
      return null;
    }
    return createStripeClientWithDefaults(env.STRIPE_API_KEY);
  } catch (error) {
    logger.error("Failed to initialize Stripe client:", error);
    return null;
  }
}

const stripeClient = createStripeClientSafe();

export const stripe: StripeClient | null = stripeClient;
export function isStripeConfigured(): boolean {
  return stripe !== null;
}
export function getStripeClientOrThrow(): StripeClient {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_API_KEY environment variable.",
    );
  }
  return stripe;
}
