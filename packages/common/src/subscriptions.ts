import {
  getStripePriceIds,
  PRICING_TIERS,
  RESOURCE_LIMITS,
} from "./config/pricing";
import { env } from "./env.mjs";

export interface SubscriptionPlan {
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
}

const stripePriceIds = getStripePriceIds();

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Starter",
    description: "For Beginners",
    benefits: [
      `Up to ${RESOURCE_LIMITS.STARTER.posts} monthly posts`,
      "Basic analytics and reporting",
      "Access to standard templates",
    ],
    limitations: [
      "No priority access to new features.",
      "Limited customer support",
      "No custom branding",
      "Limited access to business resources.",
    ],
    prices: {
      monthly: PRICING_TIERS.STARTER.monthly,
      yearly: PRICING_TIERS.STARTER.yearly,
    },
    stripeIds: {
      monthly: null,
      yearly: null,
    },
  },
  {
    title: "Pro",
    description: "Unlock Advanced Features",
    benefits: [
      `Up to ${RESOURCE_LIMITS.PRO.posts} monthly posts`,
      "Advanced analytics and reporting",
      "Access to business templates",
      "Priority customer support",
      "Exclusive webinars and training.",
    ],
    limitations: [
      "No custom branding",
      "Limited access to business resources.",
    ],
    prices: {
      monthly: PRICING_TIERS.PRO.monthly,
      yearly: PRICING_TIERS.PRO.yearly,
    },
    stripeIds: {
      monthly: stripePriceIds.pro.monthly,
      yearly: stripePriceIds.pro.yearly,
    },
  },
  {
    title: "Business",
    description: "For Power Users",
    benefits: [
      "Unlimited posts",
      "Real-time analytics and reporting",
      "Access to all templates, including custom branding",
      "24/7 business customer support",
      "Personalized onboarding and account management.",
    ],
    limitations: [],
    prices: {
      monthly: PRICING_TIERS.BUSINESS.monthly,
      yearly: PRICING_TIERS.BUSINESS.yearly,
    },
    stripeIds: {
      monthly: stripePriceIds.business.monthly,
      yearly: stripePriceIds.business.yearly,
    },
  },
];

/**
 * @deprecated Use PRICING_TIERS from @saasfly/common/config/pricing instead
 */
export const PRICING = PRICING_TIERS;

/**
 * @deprecated Use RESOURCE_LIMITS from @saasfly/common/config/pricing instead
 */
export const LIMITS = RESOURCE_LIMITS;
