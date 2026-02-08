/**
 * Centralized Pricing Configuration
 * 
 * This module provides a single source of truth for all pricing-related
 * configuration values, eliminating hardcoded prices scattered across the codebase.
 * 
 * All pricing values are configurable via environment variables with sensible defaults.
 * 
 * Flexy Principle: No hardcoded prices - everything is configurable!
 * 
 * @module @saasfly/common/config/pricing
 */

import { PRICING_CONFIG, type PricingTiers, type ResourceLimits, type ClusterLimits } from "./app";
import { env } from "../env.mjs";

/**
 * Pricing tiers for subscription plans
 * Uses centralized configuration from app.ts
 */
export const PRICING_TIERS = {
  STARTER: PRICING_CONFIG.tiers.STARTER,
  PRO: PRICING_CONFIG.tiers.PRO,
  BUSINESS: PRICING_CONFIG.tiers.BUSINESS,
} as const;

/**
 * Cluster limits per plan
 * Uses centralized configuration from app.ts
 */
export const CLUSTER_LIMITS = PRICING_CONFIG.clusterLimits;

/**
 * Resource limits per plan (for legacy use)
 * Uses centralized configuration from app.ts
 */
export const RESOURCE_LIMITS = PRICING_CONFIG.resourceLimits;

/**
 * Plan IDs as constants to avoid string duplication
 */
export const PLAN_IDS = PRICING_CONFIG.planIds;

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
export function formatPrice(amount: number, currency = PRICING_CONFIG.currency): string {
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
 * Type for plan tiers
 */
export type PlanTier = keyof typeof PRICING_TIERS;

/**
 * Type for billing cycles
 */
export type BillingCycle = "monthly" | "yearly";

/**
 * @deprecated LEGACY_PRICING_TIERS has been removed. Use PRICING_TIERS instead.
 * Pricing is now fully configurable via environment variables:
 * - PRICING_STARTER_MONTHLY, PRICING_STARTER_YEARLY
 * - PRICING_PRO_MONTHLY, PRICING_PRO_YEARLY  
 * - PRICING_BUSINESS_MONTHLY, PRICING_BUSINESS_YEARLY
 * Or use PRICING_TIERS_JSON for complete customization
 */
export const LEGACY_PRICING_TIERS = PRICING_TIERS;

/**
 * @deprecated Use getPriceDisplayString instead. Pricing is now unified.
 */
export const getLegacyPriceDisplayString = getPriceDisplayString;
