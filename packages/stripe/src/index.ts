import Stripe from "stripe";

import { env } from "./env.mjs";
import { createStripeClientWithDefaults } from "./integration";
import { logger } from "./logger";

export * from "./webhooks";
export * from "./integration";
export * from "./client";
export * from "./webhook-idempotency";

type StripeClient = ReturnType<typeof createStripeClientWithDefaults>;

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
