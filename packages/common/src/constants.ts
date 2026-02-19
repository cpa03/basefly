export const SUBSCRIPTION_TIERS = {
  STARTER: "STARTER",
  PRO: "PRO",
  BUSINESS: "BUSINESS",
} as const;

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

export const BILLING_CYCLES = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type BillingCycle = (typeof BILLING_CYCLES)[keyof typeof BILLING_CYCLES];

export const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
  STAGING: "staging",
} as const;

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD",
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export const DURATIONS = {
  ONE_SECOND: 1000,
  FIVE_SECONDS: 5000,
  TEN_SECONDS: 10000,
  THIRTY_SECONDS: 30000,
  ONE_MINUTE: 60000,
  FIVE_MINUTES: 300000,
  TEN_MINUTES: 600000,
  ONE_HOUR: 3600000,
  ONE_DAY: 86400000,
  ONE_WEEK: 604800000,
} as const;

export const DURATIONS_SECONDS = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
  ONE_YEAR: 31536000,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

export const VALIDATION_LIMITS = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_CLUSTER_NAME_LENGTH: 100,
} as const;

export const UI_CONSTANTS = {
  MAX_TOASTS: 5,
  DEFAULT_TOAST_DURATION: 5000,
  DEFAULT_TRANSITION_DURATION: 200,
  DEFAULT_STAGGER_DELAY: 50,
  SCROLL_OFFSET_DEFAULT: 100,
  DEFAULT_DEBOUNCE_DELAY: 300,
  SEARCH_DEBOUNCE_DELAY: 150,
} as const;

export const ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INTEGRATION_ERROR: "INTEGRATION_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  CIRCUIT_BREAKER_OPEN: "CIRCUIT_BREAKER_OPEN",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const CURRENCIES = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  JPY: "JPY",
  CNY: "CNY",
} as const;

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];

export const LOCALES = {
  EN: "en",
  ZH: "zh",
  JA: "ja",
  KO: "ko",
  DE: "de",
  VI: "vi",
} as const;

export type Locale = (typeof LOCALES)[keyof typeof LOCALES];

export const DEFAULTS = {
  PAGE_SIZE: 10,
  CLUSTER_LOCATION: "Hong Kong",
  CLUSTER_NODE_COUNT: 1,
  API_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  UNKNOWN_VALUE: "Unknown",
  NOT_AVAILABLE: "N/A",
} as const;

export type PlanId = "FREE" | "PRO" | "BUSINESS";
export type FeatureFlag =
  | "billing"
  | "clusters"
  | "auth"
  | "analytics"
  | "notifications"
  | "admin"
  | "ai";

export function isValidPlanId(value: string): value is PlanId {
  return ["FREE", "PRO", "BUSINESS"].includes(value);
}

export function isValidClusterStatus(value: string): boolean {
  return [
    "PENDING",
    "CREATING",
    "INITING",
    "RUNNING",
    "STOPPED",
    "DELETED",
  ].includes(value);
}

export function isValidBillingCycle(value: string): value is BillingCycle {
  return Object.values(BILLING_CYCLES).includes(value as BillingCycle);
}

export function isValidLocale(value: string): value is Locale {
  return Object.values(LOCALES).includes(value as Locale);
}

export function isValidTheme(value: string): boolean {
  return ["light", "dark", "system"].includes(value);
}

export function getAllPlanIds(): PlanId[] {
  return ["FREE", "PRO", "BUSINESS"];
}

export function getAllClusterStatuses(): string[] {
  return ["PENDING", "CREATING", "INITING", "RUNNING", "STOPPED", "DELETED"];
}

export function getActiveClusterStatuses(): string[] {
  return ["PENDING", "CREATING", "INITING", "RUNNING", "STOPPED"];
}

export default {
  SUBSCRIPTION_TIERS,
  BILLING_CYCLES,
  ENVIRONMENTS,
  HTTP_METHODS,
  DURATIONS,
  DURATIONS_SECONDS,
  PAGINATION,
  VALIDATION_LIMITS,
  UI_CONSTANTS,
  ERROR_CODES,
  CURRENCIES,
  LOCALES,
  DEFAULTS,
};
