/**
 * Centralized Pricing Configuration
 *
 * This module provides a single source of truth for all pricing-related
 * configuration values, eliminating hardcoded prices scattered across the codebase.
 *
 * @module @saasfly/common/config/pricing
 */

import { env } from "../env.mjs";

/**
 * Pricing tiers for subscription plans
 */
export const PRICING_TIERS = {
  STARTER: {
    monthly: 0,
    yearly: 0,
  },
  PRO: {
    monthly: 15,
    yearly: 144,
  },
  BUSINESS: {
    monthly: 30,
    yearly: 300,
  },
} as const;

/**
 * Legacy pricing tiers (used by nextjs app)
 * These have different values than the common package tiers
 */
export const LEGACY_PRICING_TIERS = {
  STARTER: {
    monthly: 0,
    yearly: 0,
  },
  PRO: {
    monthly: 30,
    yearly: 288,
  },
  BUSINESS: {
    monthly: 60,
    yearly: 600,
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
  billingCycle: "monthly" | "yearly",
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
  billingCycle: "monthly" | "yearly",
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

/**
 * Subscription configuration
 * Centralized subscription settings like trial periods, grace periods, etc.
 */
export const SUBSCRIPTION_CONFIG = {
  /** Free trial period duration in days */
  trialPeriodDays: 14,
  /** Plans that offer free trial */
  trialEligiblePlans: ["PRO"] as const,
  /** Grace period after subscription expires (days) */
  gracePeriodDays: 3,
} as const;

/**
 * Get trial period display string for a locale
 */
export function getTrialPeriodDisplayString(
  locale: "en" | "zh" | "ja" | "ko" = "en",
  days: number = SUBSCRIPTION_CONFIG.trialPeriodDays,
): string {
  const strings: Record<typeof locale, string> = {
    en: `${days}-day`,
    zh: `${days}天`,
    ja: `${days}日間`,
    ko: `${days}일`,
  };
  return strings[locale];
}
