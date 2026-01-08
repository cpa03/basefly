import Stripe from "stripe";

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryableErrors?: string[];
}

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

export class CircuitBreakerOpenError extends IntegrationError {
  constructor(serviceName: string) {
    super(
      `Circuit breaker is open for ${serviceName}`,
      "CIRCUIT_BREAKER_OPEN",
    );
    this.name = "CircuitBreakerOpenError";
  }
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: null,
    nextAttemptTime: null,
  };

  constructor(
    private readonly serviceName: string,
    private readonly threshold: number = 5,
    private readonly resetTimeoutMs: number = 60000,
  ) {}

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

  private onSuccess(): void {
    this.state.failureCount = 0;
    this.state.lastFailureTime = null;
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.threshold) {
      this.state.isOpen = true;
      this.state.nextAttemptTime = Date.now() + this.resetTimeoutMs;
    }
  }

  private reset(): void {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
    };
  }

  isOpen(): boolean {
    if (!this.state.isOpen) return false;
    if (Date.now() >= (this.state.nextAttemptTime ?? 0)) {
      this.reset();
      return false;
    }
    return true;
  }
}

const defaultRetryableErrors = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "rate_limit",
  "timeout",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (error instanceof Error) {
    return retryableErrors.some((code) =>
      error.message.toLowerCase().includes(code.toLowerCase()),
    );
  }
  return false;
}

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
