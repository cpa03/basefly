/**
 * Stripe Client Instance
 *
 * Separated to break the circular dependency between index.ts and client.ts.
 * This module creates and exports the singleton Stripe client instance.
 *
 * @module stripe-instance
 */

import type Stripe from "stripe";

import { env } from "./env.mjs";
import { createStripeClientWithDefaults } from "./integration";
import { logger } from "./logger";

type StripeClient = Stripe;

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

/**
 * The configured Stripe client instance, or null if not configured.
 */
export const stripe: StripeClient | null = stripeClient;

/**
 * Check if Stripe is configured and available.
 *
 * @returns true if Stripe client is initialized
 */
export function isStripeConfigured(): boolean {
  return stripe !== null;
}

/**
 * Get the Stripe client, throwing if not configured.
 *
 * @returns The configured Stripe client
 * @throws {Error} If Stripe is not configured
 */
export function getStripeClientOrThrow(): StripeClient {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_API_KEY environment variable.",
    );
  }
  return stripe;
}
