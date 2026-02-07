export { resend } from "./email";

export { MagicLinkEmail } from "./emails/magic-link-email";

export { siteConfig } from "./config/site";

// Pricing configuration - centralized pricing values
export {
  PRICING_TIERS,
  LEGACY_PRICING_TIERS,
  CLUSTER_LIMITS,
  RESOURCE_LIMITS,
  PLAN_IDS,
  STRIPE_PRICE_IDS,
  getStripePriceIds,
  formatPrice,
  getPriceDisplayString,
  getLegacyPriceDisplayString,
} from "./config/pricing";
export type { PlanTier, BillingCycle } from "./config/pricing";

// K8s configuration - centralized Kubernetes settings
export {
  CLUSTER_LOCATIONS,
  DEFAULT_CLUSTER_LOCATION,
  AVAILABLE_CLUSTER_REGIONS,
  CLUSTER_STATUSES,
  DEFAULT_CLUSTER_CONFIG,
  CLUSTER_DEFAULTS,
  CLUSTER_TIER_LIMITS,
  isValidClusterLocation,
  getClusterLocationDisplayName,
  isValidClusterName,
  sanitizeClusterName,
  generateClusterName,
} from "./config/k8s";
export type { ClusterLocation, ClusterStatus, SubscriptionTier } from "./config/k8s";

export { ANIMATION } from "./animation";
export type { DurationKey, EasingKey, ScaleKey } from "./animation";
