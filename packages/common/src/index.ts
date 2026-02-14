export { siteConfig } from "./config/site";

// Contributors configuration - centralized team member data
export {
  CORE_CONTRIBUTORS,
  CONTRIBUTORS,
  getAllContributors,
  getCoreContributors,
  getContributorById,
  getContributorAvatarUrl,
  getContributorsForDisplay,
} from "./config/contributors";
export type { Contributor } from "./config/contributors";

// Dimensions configuration - centralized sizes and measurements
export {
  IMAGE_DIMENSIONS,
  CONTAINER_DIMENSIONS,
  SPACING,
  getImageDimensions,
  getSpacing,
} from "./config/dimensions";
export type { ImageDimensionKey, SpacingCategory } from "./config/dimensions";

// Theme configuration - centralized color tokens
export {
  BRAND_COLORS,
  SEMANTIC_COLORS,
  GRADIENTS,
  FEATURE_CARD_COLORS,
  WOBBLE_CARD_COLORS,
  METEORS_CARD_COLORS,
  TEXT_COLORS,
  BACKGROUND_COLORS,
  BORDER_COLORS,
} from "./config/theme";
export type {
  BrandColorKey,
  SemanticColorKey,
  GradientKey,
} from "./config/theme";

// Content configuration - centralized content values
export {
  SAMPLE_DATES,
  SAMPLE_STATS,
  TYPEWRITER_WORDS,
  TESTIMONIALS,
  FEATURE_HIGHLIGHTS,
} from "./config/content";
export type { SampleStatKey, TypewriterWordSetKey } from "./config/content";

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
export type {
  ClusterLocation,
  ClusterStatus,
  SubscriptionTier,
} from "./config/k8s";

// Animation constants
export { ANIMATION } from "./animation";
export type {
  DurationKey,
  EasingKey,
  ScaleKey,
  FocusRingKey,
  HoverScaleKey,
} from "./animation";

// UI configuration - timing, colors, and feedback
export {
  TOAST_CONFIG,
  FEEDBACK_TIMING,
  ANIMATION_TIMING,
  SEMANTIC_COLORS,
  TRANSITION_PRESETS,
  VISUAL_EFFECTS,
} from "./config/ui";
export type {
  ToastConfig,
  FeedbackTiming,
  AnimationTiming,
  SemanticColors,
  VisualEffects,
  TransitionPresetKey,
} from "./config/ui";

// URLs and routes configuration - centralized external and internal links
export {
  EXTERNAL_URLS,
  ROUTES,
  CONTACT,
  GITHUB_REPO,
  CLI_COMMANDS,
  BRAND,
  getExternalUrl,
  getRoute,
  getAvatarUrl,
  getGitHubProfileUrl,
} from "./config/urls";
export type { ExternalUrlCategory, RouteSection } from "./config/urls";
