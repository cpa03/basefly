/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  CircuitBreaker,
  CircuitBreakerOpenError,
  withRetry,
  withTimeout,
  IntegrationError,
  isRetryableError,
  defaultRetryableErrors,
} from "./integration";

describe("CircuitBreaker", () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    circuitBreaker = new CircuitBreaker("TestService", 3, 5000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("execute - success scenario", () => {
    it("executes function successfully when circuit is closed", async () => {
      const mockFn = vi.fn().mockResolvedValue("success");

      const result = await circuitBreaker.execute(mockFn);

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("resets failure count on successful execution", async () => {
      const successFn = vi.fn().mockResolvedValue("success");

      await circuitBreaker.execute(successFn);

      expect(circuitBreaker["state"].failureCount).toBe(0);
      expect(circuitBreaker["state"].lastFailureTime).toBeNull();
    });

    it("allows multiple successful executions", async () => {
      const successFn = vi.fn().mockResolvedValue("success");

      await circuitBreaker.execute(successFn);
      await circuitBreaker.execute(successFn);
      await circuitBreaker.execute(successFn);

      expect(successFn).toHaveBeenCalledTimes(3);
      expect(circuitBreaker["state"].isOpen).toBe(false);
    });
  });

  describe("execute - failure scenario", () => {
    it("increments failure count when function fails", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow("failure");
      expect(circuitBreaker["state"].failureCount).toBe(1);
    });

    it("does not open circuit below threshold", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();

      expect(circuitBreaker["state"].isOpen).toBe(false);
      expect(circuitBreaker["state"].failureCount).toBe(2);
    });

    it("opens circuit after reaching failure threshold", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();

      expect(circuitBreaker["state"].isOpen).toBe(true);
      expect(circuitBreaker["state"].failureCount).toBe(3);
    });

    it("sets next attempt time when circuit opens", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));
      const startTime = Date.now();

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();

      expect(circuitBreaker["state"].nextAttemptTime).toBeGreaterThanOrEqual(startTime + 5000);
    });

    it("throws CircuitBreakerOpenError when circuit is open", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow(CircuitBreakerOpenError);
      expect(errorFn).toHaveBeenCalledTimes(3);
    });
  });

  describe("execute - circuit reset scenario", () => {
    it("resets circuit after timeout period", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));
      const successFn = vi.fn().mockResolvedValue("success");

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();

      expect(circuitBreaker["state"].isOpen).toBe(true);

      vi.advanceTimersByTime(5000);

      const result = await circuitBreaker.execute(successFn);

      expect(result).toBe("success");
      expect(circuitBreaker["state"].isOpen).toBe(false);
      expect(circuitBreaker["state"].failureCount).toBe(0);
    });

    it("does not reset circuit before timeout period", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();

      vi.advanceTimersByTime(4000);

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow(CircuitBreakerOpenError);
      expect(circuitBreaker["state"].isOpen).toBe(true);
    });
  });

  describe("isOpen", () => {
    it("returns false when circuit is closed", () => {
      expect(circuitBreaker.isOpen()).toBe(false);
    });

    it("returns true when circuit is open and timeout not elapsed", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();

      expect(circuitBreaker.isOpen()).toBe(true);
    });

    it("returns false and resets circuit when timeout has elapsed", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();
      await expect(circuitBreaker.execute(errorFn)).rejects.toThrow();

      expect(circuitBreaker.isOpen()).toBe(true);

      vi.advanceTimersByTime(5000);

      expect(circuitBreaker.isOpen()).toBe(false);
      expect(circuitBreaker["state"].isOpen).toBe(false);
    });
  });

  describe("custom configuration", () => {
    it("uses custom threshold value", async () => {
      const customBreaker = new CircuitBreaker("CustomService", 5, 10000);
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(customBreaker.execute(errorFn)).rejects.toThrow();
      await expect(customBreaker.execute(errorFn)).rejects.toThrow();
      await expect(customBreaker.execute(errorFn)).rejects.toThrow();

      expect(customBreaker["state"].isOpen).toBe(false);

      await expect(customBreaker.execute(errorFn)).rejects.toThrow();
      await expect(customBreaker.execute(errorFn)).rejects.toThrow();

      expect(customBreaker["state"].isOpen).toBe(true);
    });

    it("uses custom timeout value", async () => {
      const customBreaker = new CircuitBreaker("CustomService", 2, 2000);
      const errorFn = vi.fn().mockRejectedValue(new Error("failure"));

      await expect(customBreaker.execute(errorFn)).rejects.toThrow();
      await expect(customBreaker.execute(errorFn)).rejects.toThrow();

      expect(customBreaker["state"].isOpen).toBe(true);

      vi.advanceTimersByTime(1500);

      expect(customBreaker.isOpen()).toBe(true);

      vi.advanceTimersByTime(500);

      expect(customBreaker.isOpen()).toBe(false);
    });
  });
});

describe("withRetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("success scenario", () => {
    it("returns result on first attempt", async () => {
      const successFn = vi.fn().mockResolvedValue("success");

      const result = await withRetry(successFn);

      expect(result).toBe("success");
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it("returns result after one retry", async () => {
      const retryFn = vi.fn()
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockResolvedValue("success");

      const result = await withRetry(retryFn, { maxAttempts: 2 });

      expect(result).toBe("success");
      expect(retryFn).toHaveBeenCalledTimes(2);
    });

    it("returns result after multiple retries", async () => {
      const retryFn = vi.fn()
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockResolvedValue("success");

      const result = await withRetry(retryFn, { maxAttempts: 3 });

      expect(result).toBe("success");
      expect(retryFn).toHaveBeenCalledTimes(3);
    });
  });

  describe("retry logic", () => {
    it("retries on retryable errors", async () => {
      const retryFn = vi.fn()
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockResolvedValue("success");

      await withRetry(retryFn, { maxAttempts: 3 });

      expect(retryFn).toHaveBeenCalledTimes(2);
    });

    it("does not retry on non-retryable errors", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("Not retryable"));

      await expect(withRetry(errorFn, { maxAttempts: 3 })).rejects.toThrow("Not retryable");
      expect(errorFn).toHaveBeenCalledTimes(1);
    });

    it("uses exponential backoff", async () => {
      const retryFn = vi.fn()
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockResolvedValue("success");

      const start = Date.now();
      const retryPromise = withRetry(retryFn, { maxAttempts: 3, baseDelay: 1000 });

      vi.advanceTimersByTime(1000);
      await vi.advanceTimersByTimeAsync(1000);

      vi.advanceTimersByTime(2000);
      await vi.advanceTimersByTimeAsync(2000);

      await retryPromise;

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(3000);
    });

    it("respects maxDelay parameter", async () => {
      const retryFn = vi.fn()
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockResolvedValue("success");

      await withRetry(retryFn, { maxAttempts: 5, baseDelay: 5000, maxDelay: 10000 });

      expect(retryFn).toHaveBeenCalledTimes(5);
    });

    it("stops retrying after maxAttempts", async () => {
      const retryFn = vi.fn().mockRejectedValue(new Error("ECONNRESET"));

      await expect(withRetry(retryFn, { maxAttempts: 3 })).rejects.toThrow("ECONNRESET");
      expect(retryFn).toHaveBeenCalledTimes(3);
    });
  });

  describe("custom retryable errors", () => {
    it("uses custom retryable error list", async () => {
      const retryFn = vi.fn()
        .mockRejectedValueOnce(new Error("CUSTOM_ERROR"))
        .mockResolvedValue("success");

      await withRetry(retryFn, {
        maxAttempts: 2,
        retryableErrors: ["CUSTOM_ERROR"],
      });

      expect(retryFn).toHaveBeenCalledTimes(2);
    });

    it("does not retry on errors not in custom list", async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error("ECONNRESET"));

      await expect(withRetry(errorFn, {
        maxAttempts: 3,
        retryableErrors: ["CUSTOM_ERROR"],
      })).rejects.toThrow("ECONNRESET");

      expect(errorFn).toHaveBeenCalledTimes(1);
    });
  });
});

describe("withTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns result when promise resolves before timeout", async () => {
    const quickPromise = Promise.resolve("result");

    const result = await withTimeout(quickPromise, 1000);

    expect(result).toBe("result");
  });

  it("throws IntegrationError when promise exceeds timeout", async () => {
    const slowPromise = new Promise((resolve) => setTimeout(resolve, 2000));

    const timeoutPromise = withTimeout(slowPromise, 1000);

    vi.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow(IntegrationError);
    await expect(timeoutPromise).rejects.toThrow("Operation timed out");
  });

  it("uses custom timeout message", async () => {
    const slowPromise = new Promise((resolve) => setTimeout(resolve, 2000));

    const timeoutPromise = withTimeout(slowPromise, 1000, "Custom timeout message");

    vi.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow("Custom timeout message");
  });

  it("throws IntegrationError with TIMEOUT code on timeout", async () => {
    const slowPromise = new Promise((resolve) => setTimeout(resolve, 2000));

    const timeoutPromise = withTimeout(slowPromise, 1000);

    vi.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow(IntegrationError);

    try {
      await timeoutPromise;
    } catch (error) {
      expect(error).toBeInstanceOf(IntegrationError);
      expect((error as IntegrationError).code).toBe("TIMEOUT");
    }
  });
});

describe("isRetryableError", () => {
  it("returns true for retryable network errors", () => {
    expect(isRetryableError(new Error("ECONNRESET"), defaultRetryableErrors)).toBe(true);
    expect(isRetryableError(new Error("ETIMEDOUT"), defaultRetryableErrors)).toBe(true);
    expect(isRetryableError(new Error("ECONNREFUSED"), defaultRetryableErrors)).toBe(true);
    expect(isRetryableError(new Error("ENOTFOUND"), defaultRetryableErrors)).toBe(true);
    expect(isRetryableError(new Error("EAI_AGAIN"), defaultRetryableErrors)).toBe(true);
  });

  it("returns true for retryable rate limit errors", () => {
    expect(isRetryableError(new Error("rate_limit exceeded"), defaultRetryableErrors)).toBe(true);
  });

  it("returns true for retryable timeout errors", () => {
    expect(isRetryableError(new Error("Connection timeout"), defaultRetryableErrors)).toBe(true);
  });

  it("returns false for non-retryable errors", () => {
    expect(isRetryableError(new Error("Not found"), defaultRetryableErrors)).toBe(false);
    expect(isRetryableError(new Error("Unauthorized"), defaultRetryableErrors)).toBe(false);
    expect(isRetryableError(new Error("Invalid input"), defaultRetryableErrors)).toBe(false);
  });

  it("is case-insensitive when checking error messages", () => {
    expect(isRetryableError(new Error("econnreset"), defaultRetryableErrors)).toBe(true);
    expect(isRetryableError(new Error("RATE_LIMIT"), defaultRetryableErrors)).toBe(true);
    expect(isRetryableError(new Error("TiMeOuT"), defaultRetryableErrors)).toBe(true);
  });

  it("returns false for non-Error objects", () => {
    expect(isRetryableError("string error", defaultRetryableErrors)).toBe(false);
    expect(isRetryableError(null, defaultRetryableErrors)).toBe(false);
    expect(isRetryableError(undefined, defaultRetryableErrors)).toBe(false);
    expect(isRetryableError(123, defaultRetryableErrors)).toBe(false);
  });
});

describe("IntegrationError", () => {
  it("creates error with message and code", () => {
    const error = new IntegrationError("Test error", "TEST_CODE");

    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_CODE");
    expect(error.name).toBe("IntegrationError");
  });

  it("includes original error in error object", () => {
    const originalError = new Error("Original");
    const error = new IntegrationError("Wrapped error", "WRAPPER", originalError);

    expect(error.originalError).toBe(originalError);
  });

  it("can be thrown and caught as IntegrationError", async () => {
    const testFn = () => {
      throw new IntegrationError("Test", "TEST");
    };

    await expect(testFn()).rejects.toThrow(IntegrationError);
    await expect(testFn()).rejects.toThrow("Test");
  });
});

describe("CircuitBreakerOpenError", () => {
  it("extends IntegrationError", () => {
    const error = new CircuitBreakerOpenError("TestService");

    expect(error).toBeInstanceOf(IntegrationError);
  });

  it("includes service name in message", () => {
    const error = new CircuitBreakerOpenError("Stripe");

    expect(error.message).toContain("Stripe");
    expect(error.message).toContain("Circuit breaker");
  });

  it("has correct error code", () => {
    const error = new CircuitBreakerOpenError("TestService");

    expect(error.code).toBe("CIRCUIT_BREAKER_OPEN");
  });

  it("has correct error name", () => {
    const error = new CircuitBreakerOpenError("TestService");

    expect(error.name).toBe("CircuitBreakerOpenError");
  });
});
