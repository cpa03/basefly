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
  SUBSCRIPTION_CONFIG,
  getTrialPeriodDisplayString,
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
  K8S_DEFAULTS,
} from "./config/k8s";
export type {
  ClusterLocation,
  ClusterStatus,
  SubscriptionTier,
} from "./config/k8s";

// UI Strings configuration
export {
  UI_STRINGS,
  THEME_STRINGS,
  MARKETING_FALLBACKS,
  PAGE_METADATA,
  MARKETING_STATS,
} from "./config/ui-strings";

// Asset paths configuration
export { ASSET_BASE_PATHS, ASSETS, getAssetPath } from "./config/assets";

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
  THEMES,
  PAGE_PROGRESS_CONFIG,
  NAVBAR_CONFIG,
} from "./config/ui";
export type {
  ToastConfig,
  FeedbackTiming,
  AnimationTiming,
  SemanticColors,
  VisualEffects,
  TransitionPresetKey,
  Theme,
} from "./config/ui";

export {
  CIRCUIT_BREAKER_CONFIG,
  RETRY_CONFIG,
  TIMEOUT_CONFIG,
  STRIPE_CONFIG,
  DEFAULT_RETRYABLE_ERRORS,
  RATE_LIMIT_DEFAULTS,
} from "./config/resilience";
export type {
  CircuitBreakerConfig,
  RetryConfig,
  TimeoutConfig,
  StripeConfig,
  RateLimitConfig,
  EndpointType,
} from "./config/resilience";

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

export {
  ICON_SIZES,
  getIconSize,
  BUTTON_ICON_SIZES,
  NAV_ICON_SIZES,
  FEATURE_ICON_SIZES,
  STATUS_ICON_SIZES,
  SOCIAL_ICON_SIZES,
  ICON_PRESETS,
} from "./icon-sizes";
export type { IconSizeKey } from "./icon-sizes";
