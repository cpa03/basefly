import { env } from "./env.mjs";
import { createStripeClientWithDefaults } from "./integration";
import { logger } from "./logger";

export * from "./webhooks";
export * from "./integration";
export * from "./client";
export * from "./webhook-idempotency";

function createStripeClientSafe() {
  try {
    if (!env.STRIPE_API_KEY || env.STRIPE_API_KEY.length < 10) {
      logger.warn("STRIPE_API_KEY not configured, Stripe features will be disabled");
      return null;
    }
    return createStripeClientWithDefaults(env.STRIPE_API_KEY);
  } catch (error) {
    logger.error("Failed to initialize Stripe client:", error);
    return null;
  }
}

const stripeClient = createStripeClientSafe();

export const stripe =
  stripeClient ?? ({} as ReturnType<typeof createStripeClientWithDefaults>);
