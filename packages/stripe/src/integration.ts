import Stripe from "stripe";

/**
 * Configuration options for retry logic
 */
interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryableErrors?: string[];
}

/**
 * Error thrown when integration with external services fails
 * Used for wrapping external service errors with consistent error handling
 */
export class IntegrationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

/**
 * Error thrown when circuit breaker is open
 * Indicates the service is temporarily unavailable due to repeated failures
 */
export class CircuitBreakerOpenError extends IntegrationError {
  constructor(serviceName: string) {
    super(
      `Circuit breaker is open for ${serviceName}`,
      "CIRCUIT_BREAKER_OPEN",
    );
    this.name = "CircuitBreakerOpenError";
  }
}

/**
 * Internal state for circuit breaker
 */
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
}

/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping calls to failing services.
 * After a threshold number of failures, the circuit "opens" and
 * all calls immediately fail without attempting the service.
 * 
 * This pattern improves system resilience by:
 * - Preventing resource exhaustion on failing services
 * - Providing fast failures when services are down
 * - Allowing services time to recover
 * 
 * @example
 * ```typescript
 * const stripeBreaker = new CircuitBreaker("Stripe", 5, 60000);
 * 
 * try {
 *   const result = await stripeBreaker.execute(() => stripe.charges.create(params));
 * } catch (error) {
 *   if (error instanceof CircuitBreakerOpenError) {
 *     console.log("Stripe is temporarily unavailable");
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: null,
    nextAttemptTime: null,
  };

  /**
   * Create a new circuit breaker
   * 
   * @param serviceName - Name of the service being protected (for error messages)
   * @param threshold - Number of consecutive failures before opening circuit (default: 5)
   * @param resetTimeoutMs - Time to wait before attempting to close circuit (default: 60000ms)
   */
  constructor(
    private readonly serviceName: string,
    private readonly threshold: number = 5,
    private readonly resetTimeoutMs: number = 60000,
  ) {}

  /**
   * Execute a function with circuit breaker protection
   * 
   * If circuit is open and reset timeout hasn't passed, throws CircuitBreakerOpenError.
   * If circuit is open but timeout has passed, attempts to reset and execute.
   * If circuit is closed, executes function and tracks success/failure.
   * 
   * @param fn - Async function to execute with protection
   * @returns Result of the function if successful
   * @throws CircuitBreakerOpenError if circuit is open
   * @throws Original error if function fails and circuit hasn't opened yet
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.isOpen) {
      if (Date.now() < (this.state.nextAttemptTime ?? 0)) {
        throw new CircuitBreakerOpenError(this.serviceName);
      }
      this.reset();
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   * Resets failure count on success
   */
  private onSuccess(): void {
    this.state.failureCount = 0;
    this.state.lastFailureTime = null;
  }

  /**
   * Handle failed execution
   * Increments failure count and potentially opens circuit
   */
  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.threshold) {
      this.state.isOpen = true;
      this.state.nextAttemptTime = Date.now() + this.resetTimeoutMs;
    }
  }

  /**
   * Reset the circuit breaker to closed state
   * Called when timeout expires or manually
   */
  private reset(): void {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
    };
  }

  /**
   * Check if circuit breaker is currently open
   * Auto-resets if timeout has expired
   * 
   * @returns true if circuit is open and timeout hasn't expired
   */
  isOpen(): boolean {
    if (!this.state.isOpen) return false;
    if (Date.now() >= (this.state.nextAttemptTime ?? 0)) {
      this.reset();
      return false;
    }
    return true;
  }
}

/**
 * Default list of retryable error codes
 * Includes network errors and rate limits
 */
export const defaultRetryableErrors = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "rate_limit",
  "timeout",
];

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * 
 * Retries a function on failure with exponentially increasing delays.
 * Useful for handling transient network errors and rate limits.
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchApi(),
 *   {
 *     maxAttempts: 3,
 *     baseDelay: 1000,  // 1s, 2s, 4s delays
 *     maxDelay: 10000,   // Cap at 10s
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryableErrors = defaultRetryableErrors,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isRetryable = isRetryableError(error, retryableErrors);

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable based on error codes
 */
export function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (error instanceof Error) {
    return retryableErrors.some((code) =>
      error.message.toLowerCase().includes(code.toLowerCase()),
    );
  }
  return false;
}

/**
 * Wrap a promise with timeout protection
 * 
 * Throws IntegrationError if promise doesn't resolve within timeout.
 * Prevents operations from hanging indefinitely.
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await withTimeout(fetchApi(), 30000, "API call timed out");
 * } catch (error) {
 *   if (error instanceof IntegrationError && error.code === "TIMEOUT") {
 *     console.log("Operation took too long");
 *   }
 * }
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = "Operation timed out",
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new IntegrationError(timeoutMessage, "TIMEOUT"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Create a Stripe client with default configuration
 */
export function createStripeClientWithDefaults(
  apiKey: string,
  options: Stripe.StripeConfig = {},
): Stripe {
  return new Stripe(apiKey, {
    typescript: true,
    timeout: 30000,
    maxNetworkRetries: 2,
    telemetry: false,
    ...options,
  });
}

/**
 * Safe Stripe API call with full resilience patterns
 * 
 * Combines circuit breaker, retry logic, and timeout protection.
 * All Stripe API calls should use this wrapper.
 * 
 * Features:
 * - Circuit breaker to prevent cascading failures
 * - Retry with exponential backoff for transient errors
 * - Timeout protection to prevent hanging calls
 * - Standardized error handling with IntegrationError
 * 
 * @example
 * ```typescript
 * const stripeBreaker = new CircuitBreaker("Stripe", 5, 60000);
 * 
 * const session = await safeStripeCall(
 *   () => stripe.checkout.sessions.create(params, { idempotencyKey }),
 *   {
 *     timeoutMs: 30000,
 *     maxAttempts: 3,
 *     serviceName: "Stripe Checkout",
 *     circuitBreaker: stripeBreaker,
 *   }
 * );
 * ```
 */
export async function safeStripeCall<T>(
  fn: () => Promise<T>,
  options: {
    timeoutMs?: number;
    maxAttempts?: number;
    serviceName?: string;
    circuitBreaker?: CircuitBreaker;
  } = {},
): Promise<T> {
  const {
    timeoutMs = 30000,
    maxAttempts = 3,
    serviceName = "Stripe",
    circuitBreaker,
  } = options;

  const executeWithCircuitBreaker = async (): Promise<T> => {
    if (circuitBreaker) {
      return circuitBreaker.execute(async () => {
        return withRetry(async () => {
          return withTimeout(fn(), timeoutMs);
        }, { maxAttempts });
      });
    }

    return withRetry(async () => {
      return withTimeout(fn(), timeoutMs);
    }, { maxAttempts });
  };

  try {
    return await executeWithCircuitBreaker();
  } catch (error) {
    if (error instanceof IntegrationError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new IntegrationError(
        `${serviceName} API call failed: ${error.message}`,
        "API_ERROR",
        error,
      );
    }

    throw new IntegrationError(
      `${serviceName} API call failed: Unknown error`,
      "API_ERROR",
      error,
    );
  }
}
