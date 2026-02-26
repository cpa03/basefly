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

export const RATE_LIMIT_DEFAULTS: Record<EndpointType, RateLimitConfig> = {
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
