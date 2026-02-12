import { env } from "./env.mjs";
import { createStripeClientWithDefaults } from "./integration";

export * from "./webhooks";
export * from "./integration";
export * from "./client";
export * from "./webhook-idempotency";

export const stripe = createStripeClientWithDefaults(env.STRIPE_API_KEY);
