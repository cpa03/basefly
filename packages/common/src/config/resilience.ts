/**
 * Resilience Configuration
 * Circuit breaker, retry, and timeout settings for external service integration
 */

/** Circuit breaker configuration type */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  defaultServiceName: string;
}

/** Retry configuration type */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/** Timeout configuration type */
export interface TimeoutConfig {
  default: number;
  short: number;
  long: number;
}

/** Stripe configuration type */
export interface StripeConfig {
  timeout: number;
  maxNetworkRetries: number;
  typescript: boolean;
  telemetry: boolean;
}

/**
 * Circuit breaker configuration
 * Prevents cascading failures by stopping calls to failing services
 */
export const CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  /** Number of consecutive failures before opening circuit */
  failureThreshold: 5,
  /** Time to wait before attempting to close circuit (ms) */
  resetTimeoutMs: 60000, // 1 minute
  /** Default service name for error messages */
  defaultServiceName: "External Service",
};

/**
 * Retry configuration
 * Exponential backoff settings for transient error handling
 */
export const RETRY_CONFIG: RetryConfig = {
  /** Maximum number of retry attempts */
  maxAttempts: 3,
  /** Initial delay between retries (ms) */
  baseDelay: 1000, // 1 second
  /** Maximum delay between retries (ms) */
  maxDelay: 10000, // 10 seconds
  /** Multiplier for exponential backoff */
  backoffMultiplier: 2,
};

/**
 * Timeout configuration
 * Default timeout settings for external service calls
 */
export const TIMEOUT_CONFIG: TimeoutConfig = {
  /** Default timeout for API calls (ms) */
  default: 30000, // 30 seconds
  /** Short timeout for quick operations (ms) */
  short: 5000, // 5 seconds
  /** Long timeout for heavy operations (ms) */
  long: 60000, // 1 minute
};

/**
 * Stripe-specific configuration
 */
export const STRIPE_CONFIG: StripeConfig = {
  /** Stripe API timeout (ms) */
  timeout: 30000,
  /** Maximum network retries for Stripe SDK */
  maxNetworkRetries: 2,
  /** Enable TypeScript types */
  typescript: true,
  /** Disable telemetry */
  telemetry: false,
};

export const DEFAULT_RETRYABLE_ERRORS: readonly string[] = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "rate_limit",
  "timeout",
];

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export type EndpointType = "read" | "write" | "stripe";

/**
 * Environment variable names for per-endpoint rate limit overrides.
 * Each endpoint can be tuned independently without code changes.
 */
export const RATE_LIMIT_ENV_VARS: Record<
  EndpointType,
  { maxRequests: string; windowMs: string }
> = {
  read: {
    maxRequests: "RATE_LIMIT_READ_MAX_REQUESTS",
    windowMs: "RATE_LIMIT_READ_WINDOW_MS",
  },
  write: {
    maxRequests: "RATE_LIMIT_WRITE_MAX_REQUESTS",
    windowMs: "RATE_LIMIT_WRITE_WINDOW_MS",
  },
  stripe: {
    maxRequests: "RATE_LIMIT_STRIPE_MAX_REQUESTS",
    windowMs: "RATE_LIMIT_STRIPE_WINDOW_MS",
  },
};

/**
 * Parses a positive integer from an environment variable.
 * Falls back to the default when the variable is unset, empty, or invalid.
 */
export function parsePositiveIntEnv(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  if (!/^\d+$/.test(value.trim())) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (parsed <= 0) {
    return fallback;
  }
  return parsed;
}

/**
 * Builds the rate limit config for an endpoint, applying environment
 * variable overrides on top of the hardcoded defaults.
 */
function resolveRateLimitConfig(
  endpoint: EndpointType,
  defaults: RateLimitConfig,
): RateLimitConfig {
  const env = RATE_LIMIT_ENV_VARS[endpoint];
  return {
    maxRequests: parsePositiveIntEnv(
      process.env[env.maxRequests],
      defaults.maxRequests,
    ),
    windowMs: parsePositiveIntEnv(process.env[env.windowMs], defaults.windowMs),
  };
}

const RATE_LIMIT_HARDCODED_DEFAULTS: Record<EndpointType, RateLimitConfig> = {
  read: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
  write: {
    maxRequests: 20,
    windowMs: 60 * 1000,
  },
  stripe: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
};

/**
 * Effective per-endpoint rate limit configuration.
 * Hardcoded defaults can be overridden via environment variables:
 * - RATE_LIMIT_READ_MAX_REQUESTS / RATE_LIMIT_READ_WINDOW_MS
 * - RATE_LIMIT_WRITE_MAX_REQUESTS / RATE_LIMIT_WRITE_WINDOW_MS
 * - RATE_LIMIT_STRIPE_MAX_REQUESTS / RATE_LIMIT_STRIPE_WINDOW_MS
 */
export const RATE_LIMIT_DEFAULTS: Record<EndpointType, RateLimitConfig> = {
  read: resolveRateLimitConfig("read", RATE_LIMIT_HARDCODED_DEFAULTS.read),
  write: resolveRateLimitConfig("write", RATE_LIMIT_HARDCODED_DEFAULTS.write),
  stripe: resolveRateLimitConfig(
    "stripe",
    RATE_LIMIT_HARDCODED_DEFAULTS.stripe,
  ),
};

export const RATE_LIMIT_PREFIX = "ratelimit:";
