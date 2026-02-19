// Environment configuration - centralized environment variables and utilities
export {
  LogLevel,
  DEFAULT_LOG_LEVEL,
  LOG_LEVEL,
  NODE_ENV,
  IS_DEV,
  IS_PROD,
  IS_TEST,
  ADMIN_EMAILS,
  isAdminEmail,
  isValidLogLevel,
} from "./config/env";

// Project configuration - ROOT configuration for brand, company, and project settings
export {
  PROJECT_CONFIG,
  BRAND_CONFIG,
  COMPANY_CONFIG,
  REPOSITORY_CONFIG,
  APP_URLS,
  FEATURE_CONFIG,
  DEPLOYMENT_CONFIG,
  CLI_CONFIG,
  MARKETING_CONFIG,
  INTEGRATION_CONFIG,
  getCurrentBaseUrl,
  isProjectFeatureEnabled,
  getBrandName,
  getRepositoryUrl,
} from "./config/project";
export type {
  ProjectConfig,
  BrandConfig,
  CompanyConfig,
  RepositoryConfig,
} from "./config/project";

export { siteConfig } from "./config/site";

// CSP configuration - centralized Content Security Policy
export {
  CSP_DOMAINS,
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  CSP_CONFIG,
  buildCSPHeader,
  getMinifiedCSPHeader,
} from "./config/csp";

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
  FORM_COLORS,
  FORM_TIMING,
  NOTIFICATION_COLORS,
  TRANSITION_PRESETS,
  VISUAL_EFFECTS,
  THEMES,
  PAGE_PROGRESS_CONFIG,
  NAVBAR_CONFIG,
  Z_INDEX,
} from "./config/ui";
export type {
  ToastConfig,
  FeedbackTiming,
  AnimationTiming,
  SemanticColors,
  FormColors,
  NotificationColorKey,
  VisualEffects,
  TransitionPresetKey,
  Theme,
  ZIndexKey,
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
  getTwitterProfileUrl,
  DEV_URLS,
  getBaseUrl,
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

// HTTP configuration - centralized HTTP status codes
export {
  HTTP_STATUS,
  HTTP_STATUS_CATEGORIES,
  HTTP_STATUS_MESSAGES,
  isSuccessStatus,
  isRedirectStatus,
  isClientErrorStatus,
  isServerErrorStatus,
  isErrorStatus,
  getStatusCategory,
  getStatusMessage,
} from "./config/http";
export type { HttpStatusCode } from "./config/http";

// Headers configuration - centralized HTTP header names
export {
  STANDARD_HEADERS,
  CUSTOM_HEADERS,
  TRPC_SOURCE_VALUES,
  CONTENT_TYPES,
  HEADERS,
} from "./config/headers";
export type {
  StandardHeader,
  CustomHeader,
  HeaderName,
  TrpcSourceValue,
  ContentType,
} from "./config/headers";

export {
  FEATURE_FLAGS,
  isFeatureEnabled,
  getEnabledFeatures,
} from "./config/features";
export type { FeatureFlagPath } from "./config/features";

export {
  SCROLL_OFFSETS,
  SCROLL_DELAYS,
  SCROLL_THRESHOLDS,
  SCROLL_BEHAVIOR,
  SCROLL_CONFIG,
  getScrollOffset,
  getScrollDelay,
  getScrollThreshold,
  createScrollOptions,
} from "./config/scroll";
export type {
  ScrollOffsetKey,
  ScrollDelayKey,
  ScrollThresholdKey,
} from "./config/scroll";

export {
  PAGE_SIZES,
  PAGINATION_LIMITS,
  INFINITE_SCROLL,
  PAGINATION_CONFIG,
  getPageSize,
  validatePageSize,
  calculateOffset,
  calculateTotalPages,
  generatePaginationMeta,
} from "./config/pagination";
export type { PageSizeKey } from "./config/pagination";

// Cache configuration - centralized cache control and TTL settings
export {
  CACHE_DURATION,
  CACHE_CONTROL,
  HTTP_SECURITY_HEADERS,
  NEXTJS_CACHE_HEADERS,
  generateCacheControl,
  generateNextJsHeaders,
} from "./config/cache";
export type { CacheDurationKey, CacheControlKey } from "./config/cache";

// Validation configuration - centralized validation constraints
export {
  VALIDATION,
  USER_VALIDATION,
  CLUSTER_VALIDATION,
  ORG_VALIDATION,
  PLAN_VALIDATION,
  API_VALIDATION,
  PAGINATION_VALIDATION,
} from "./config/validation";
export type {
  ValidationConfig,
  UserValidation,
  ClusterValidation,
  OrganizationValidation,
  PlanValidation,
  ApiValidation,
  PaginationValidation,
} from "./config/validation";

// UI Design Tokens - centralized theming and sizing
export {
  BUTTON_TOKENS,
  INPUT_TOKENS,
  CARD_TOKENS,
  DIALOG_TOKENS,
  BADGE_TOKENS,
  FOCUS_TOKENS,
  UI_ANIMATION,
} from "./ui-tokens";
export type {
  ButtonHeight,
  ButtonPadding,
  InputHeight,
  CardPadding,
  BadgeSize,
  FocusVariant,
} from "./ui-tokens";

export type { SubscriptionPlan } from "./subscriptions";
export { pricingData } from "./subscriptions";
