import { describe, expect, it } from "vitest";

import {
  CIRCUIT_BREAKER_CONFIG,
  type CircuitBreakerConfig,
  DEFAULT_RETRYABLE_ERRORS,
  type EndpointType,
  type RateLimitConfig,
  RATE_LIMIT_DEFAULTS,
  RETRY_CONFIG,
  type RetryConfig,
  STRIPE_CONFIG,
  type StripeConfig,
  TIMEOUT_CONFIG,
  type TimeoutConfig,
} from "./resilience";

describe("Resilience Configuration", () => {
  describe("CIRCUIT_BREAKER_CONFIG", () => {
    it("should have correct failure threshold", () => {
      expect(CIRCUIT_BREAKER_CONFIG.failureThreshold).toBe(5);
    });

    it("should have correct reset timeout in milliseconds", () => {
      expect(CIRCUIT_BREAKER_CONFIG.resetTimeoutMs).toBe(60000);
    });

    it("should have default service name", () => {
      expect(CIRCUIT_BREAKER_CONFIG.defaultServiceName).toBe("External Service");
    });

    it("should have all required properties", () => {
      expect(CIRCUIT_BREAKER_CONFIG).toHaveProperty("failureThreshold");
      expect(CIRCUIT_BREAKER_CONFIG).toHaveProperty("resetTimeoutMs");
      expect(CIRCUIT_BREAKER_CONFIG).toHaveProperty("defaultServiceName");
    });
  });

  describe("RETRY_CONFIG", () => {
    it("should have correct max attempts", () => {
      expect(RETRY_CONFIG.maxAttempts).toBe(3);
    });

    it("should have correct base delay", () => {
      expect(RETRY_CONFIG.baseDelay).toBe(1000);
    });

    it("should have correct max delay", () => {
      expect(RETRY_CONFIG.maxDelay).toBe(10000);
    });

    it("should have correct backoff multiplier", () => {
      expect(RETRY_CONFIG.backoffMultiplier).toBe(2);
    });

    it("should have exponential backoff configuration", () => {
      expect(RETRY_CONFIG.maxDelay).toBeGreaterThan(RETRY_CONFIG.baseDelay);
      expect(RETRY_CONFIG.backoffMultiplier).toBeGreaterThan(1);
    });

    it("should have all required properties", () => {
      expect(RETRY_CONFIG).toHaveProperty("maxAttempts");
      expect(RETRY_CONFIG).toHaveProperty("baseDelay");
      expect(RETRY_CONFIG).toHaveProperty("maxDelay");
      expect(RETRY_CONFIG).toHaveProperty("backoffMultiplier");
    });
  });

  describe("TIMEOUT_CONFIG", () => {
    it("should have correct default timeout", () => {
      expect(TIMEOUT_CONFIG.default).toBe(30000);
    });

    it("should have correct short timeout", () => {
      expect(TIMEOUT_CONFIG.short).toBe(5000);
    });

    it("should have correct long timeout", () => {
      expect(TIMEOUT_CONFIG.long).toBe(60000);
    });

    it("should have increasing timeout values", () => {
      expect(TIMEOUT_CONFIG.short).toBeLessThan(TIMEOUT_CONFIG.default);
      expect(TIMEOUT_CONFIG.default).toBeLessThan(TIMEOUT_CONFIG.long);
    });

    it("should have all required properties", () => {
      expect(TIMEOUT_CONFIG).toHaveProperty("default");
      expect(TIMEOUT_CONFIG).toHaveProperty("short");
      expect(TIMEOUT_CONFIG).toHaveProperty("long");
    });
  });

  describe("STRIPE_CONFIG", () => {
    it("should have correct timeout", () => {
      expect(STRIPE_CONFIG.timeout).toBe(30000);
    });

    it("should have correct max network retries", () => {
      expect(STRIPE_CONFIG.maxNetworkRetries).toBe(2);
    });

    it("should have TypeScript enabled", () => {
      expect(STRIPE_CONFIG.typescript).toBe(true);
    });

    it("should have telemetry disabled", () => {
      expect(STRIPE_CONFIG.telemetry).toBe(false);
    });

    it("should have all required properties", () => {
      expect(STRIPE_CONFIG).toHaveProperty("timeout");
      expect(STRIPE_CONFIG).toHaveProperty("maxNetworkRetries");
      expect(STRIPE_CONFIG).toHaveProperty("typescript");
      expect(STRIPE_CONFIG).toHaveProperty("telemetry");
    });
  });

  describe("DEFAULT_RETRYABLE_ERRORS", () => {
    it("should include common network errors", () => {
      expect(DEFAULT_RETRYABLE_ERRORS).toContain("ECONNRESET");
      expect(DEFAULT_RETRYABLE_ERRORS).toContain("ETIMEDOUT");
      expect(DEFAULT_RETRYABLE_ERRORS).toContain("ECONNREFUSED");
      expect(DEFAULT_RETRYABLE_ERRORS).toContain("ENOTFOUND");
    });

    it("should include DNS retry error", () => {
      expect(DEFAULT_RETRYABLE_ERRORS).toContain("EAI_AGAIN");
    });

    it("should include application-level errors", () => {
      expect(DEFAULT_RETRYABLE_ERRORS).toContain("rate_limit");
      expect(DEFAULT_RETRYABLE_ERRORS).toContain("timeout");
    });

    it("should be a readonly array", () => {
      expect(Array.isArray(DEFAULT_RETRYABLE_ERRORS)).toBe(true);
      expect(DEFAULT_RETRYABLE_ERRORS.length).toBeGreaterThan(0);
    });
  });

  describe("RATE_LIMIT_DEFAULTS", () => {
    it("should have read endpoint config", () => {
      expect(RATE_LIMIT_DEFAULTS.read.maxRequests).toBe(100);
      expect(RATE_LIMIT_DEFAULTS.read.windowMs).toBe(60000);
    });

    it("should have write endpoint config", () => {
      expect(RATE_LIMIT_DEFAULTS.write.maxRequests).toBe(20);
      expect(RATE_LIMIT_DEFAULTS.write.windowMs).toBe(60000);
    });

    it("should have stripe endpoint config", () => {
      expect(RATE_LIMIT_DEFAULTS.stripe.maxRequests).toBe(10);
      expect(RATE_LIMIT_DEFAULTS.stripe.windowMs).toBe(60000);
    });

    it("should have stricter limits for write than read", () => {
      expect(RATE_LIMIT_DEFAULTS.write.maxRequests).toBeLessThan(
        RATE_LIMIT_DEFAULTS.read.maxRequests,
      );
    });

    it("should have strictest limits for stripe", () => {
      expect(RATE_LIMIT_DEFAULTS.stripe.maxRequests).toBeLessThan(
        RATE_LIMIT_DEFAULTS.write.maxRequests,
      );
    });

    it("should have same window for all endpoints", () => {
      expect(RATE_LIMIT_DEFAULTS.read.windowMs).toBe(
        RATE_LIMIT_DEFAULTS.write.windowMs,
      );
      expect(RATE_LIMIT_DEFAULTS.write.windowMs).toBe(
        RATE_LIMIT_DEFAULTS.stripe.windowMs,
      );
    });
  });

  describe("Type exports", () => {
    it("should export CircuitBreakerConfig type", () => {
      const config: CircuitBreakerConfig = {
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        defaultServiceName: "Test Service",
      };
      expect(config.failureThreshold).toBe(5);
    });

    it("should export RetryConfig type", () => {
      const config: RetryConfig = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      };
      expect(config.maxAttempts).toBe(3);
    });

    it("should export TimeoutConfig type", () => {
      const config: TimeoutConfig = {
        default: 30000,
        short: 5000,
        long: 60000,
      };
      expect(config.default).toBe(30000);
    });

    it("should export StripeConfig type", () => {
      const config: StripeConfig = {
        timeout: 30000,
        maxNetworkRetries: 2,
        typescript: true,
        telemetry: false,
      };
      expect(config.timeout).toBe(30000);
    });

    it("should export RateLimitConfig type", () => {
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000,
      };
      expect(config.maxRequests).toBe(100);
    });

    it("should export EndpointType type", () => {
      const endpointType: EndpointType = "read";
      expect(endpointType).toBe("read");
    });
  });
});
