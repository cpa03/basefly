/**
 * Centralized Pricing Configuration
 * 
 * This module provides a single source of truth for all pricing-related
 * configuration values, eliminating hardcoded prices scattered across the codebase.
 * All prices are configurable via environment variables.
 * 
 * @module @saasfly/common/config/pricing
 */

import { env } from "../env.mjs";

/**
 * Parse numeric environment variable with fallback
 */
function parseEnvNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Pricing tiers for subscription plans
 * All values can be configured via environment variables
 */
export const PRICING_TIERS = {
  STARTER: {
    monthly: parseEnvNumber(process.env.NEXT_PUBLIC_STARTER_MONTHLY_PRICE, 0),
    yearly: parseEnvNumber(process.env.NEXT_PUBLIC_STARTER_YEARLY_PRICE, 0),
  },
  PRO: {
    monthly: parseEnvNumber(process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE, 15),
    yearly: parseEnvNumber(process.env.NEXT_PUBLIC_PRO_YEARLY_PRICE, 144),
  },
  BUSINESS: {
    monthly: parseEnvNumber(process.env.NEXT_PUBLIC_BUSINESS_MONTHLY_PRICE, 30),
    yearly: parseEnvNumber(process.env.NEXT_PUBLIC_BUSINESS_YEARLY_PRICE, 300),
  },
} as const;

/**
 * Legacy pricing tiers (used by nextjs app)
 * These have different values than the common package tiers
 */
export const LEGACY_PRICING_TIERS = {
  STARTER: {
    monthly: parseEnvNumber(process.env.NEXT_PUBLIC_LEGACY_STARTER_MONTHLY_PRICE, 0),
    yearly: parseEnvNumber(process.env.NEXT_PUBLIC_LEGACY_STARTER_YEARLY_PRICE, 0),
  },
  PRO: {
    monthly: parseEnvNumber(process.env.NEXT_PUBLIC_LEGACY_PRO_MONTHLY_PRICE, 30),
    yearly: parseEnvNumber(process.env.NEXT_PUBLIC_LEGACY_PRO_YEARLY_PRICE, 288),
  },
  BUSINESS: {
    monthly: parseEnvNumber(process.env.NEXT_PUBLIC_LEGACY_BUSINESS_MONTHLY_PRICE, 60),
    yearly: parseEnvNumber(process.env.NEXT_PUBLIC_LEGACY_BUSINESS_YEARLY_PRICE, 600),
  },
} as const;

/**
 * Cluster limits per plan
 */
export const CLUSTER_LIMITS = {
  STARTER: 1,
  PRO: 3,
  BUSINESS: 10,
} as const;

/**
 * Resource limits per plan (for legacy use)
 */
export const RESOURCE_LIMITS = {
  STARTER: {
    posts: 100,
    clusters: 1,
  },
  PRO: {
    posts: 500,
    clusters: 3,
  },
  BUSINESS: {
    posts: Infinity,
    clusters: 10,
  },
} as const;

/**
 * Plan IDs as constants to avoid string duplication
 */
export const PLAN_IDS = {
  STARTER: "starter",
  PRO: "pro",
  BUSINESS: "business",
} as const;

/**
 * Stripe price ID environment variable names
 */
export const STRIPE_PRICE_IDS = {
  PRO: {
    monthly: "NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID",
    yearly: "NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID",
  },
  BUSINESS: {
    monthly: "NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID",
    yearly: "NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID",
  },
} as const;

/**
 * Helper function to get Stripe price IDs from environment
 */
export function getStripePriceIds() {
  return {
    pro: {
      monthly: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
      yearly: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? null,
    },
    business: {
      monthly: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID ?? null,
      yearly: env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID ?? null,
    },
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency = "USD"): string {
  if (amount === 0) return "Free";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get price string for FAQ or display purposes
 */
export function getPriceDisplayString(
  tier: keyof typeof PRICING_TIERS,
  billingCycle: "monthly" | "yearly"
): string {
  const price = PRICING_TIERS[tier][billingCycle];
  if (price === 0) return "Free";
  return `$${price}`;
}

/**
 * Get legacy price string for FAQ or display purposes
 */
export function getLegacyPriceDisplayString(
  tier: keyof typeof LEGACY_PRICING_TIERS,
  billingCycle: "monthly" | "yearly"
): string {
  const price = LEGACY_PRICING_TIERS[tier][billingCycle];
  if (price === 0) return "Free";
  return `$${price}`;
}

/**
 * Type for plan tiers
 */
export type PlanTier = keyof typeof PRICING_TIERS;

/**
 * Type for billing cycles
 */
export type BillingCycle = "monthly" | "yearly";
