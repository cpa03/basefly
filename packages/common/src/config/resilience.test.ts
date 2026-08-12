import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CIRCUIT_BREAKER_CONFIG,
  DEFAULT_RETRYABLE_ERRORS,
  parsePositiveIntEnv,
  RATE_LIMIT_DEFAULTS,
  RATE_LIMIT_ENV_VARS,
  RETRY_CONFIG,
  STRIPE_CONFIG,
  TIMEOUT_CONFIG,
  type CircuitBreakerConfig,
  type EndpointType,
  type RateLimitConfig,
  type RetryConfig,
  type StripeConfig,
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
      expect(CIRCUIT_BREAKER_CONFIG.defaultServiceName).toBe(
        "External Service",
      );
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

  describe("RATE_LIMIT_ENV_VARS", () => {
    it("should define env var names for every endpoint", () => {
      expect(RATE_LIMIT_ENV_VARS.read.maxRequests).toBe(
        "RATE_LIMIT_READ_MAX_REQUESTS",
      );
      expect(RATE_LIMIT_ENV_VARS.read.windowMs).toBe(
        "RATE_LIMIT_READ_WINDOW_MS",
      );
      expect(RATE_LIMIT_ENV_VARS.write.maxRequests).toBe(
        "RATE_LIMIT_WRITE_MAX_REQUESTS",
      );
      expect(RATE_LIMIT_ENV_VARS.write.windowMs).toBe(
        "RATE_LIMIT_WRITE_WINDOW_MS",
      );
      expect(RATE_LIMIT_ENV_VARS.stripe.maxRequests).toBe(
        "RATE_LIMIT_STRIPE_MAX_REQUESTS",
      );
      expect(RATE_LIMIT_ENV_VARS.stripe.windowMs).toBe(
        "RATE_LIMIT_STRIPE_WINDOW_MS",
      );
    });
  });

  describe("parsePositiveIntEnv", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should return fallback when env var is undefined", () => {
      expect(parsePositiveIntEnv(undefined, 42)).toBe(42);
    });

    it("should return fallback when env var is empty", () => {
      expect(parsePositiveIntEnv("", 42)).toBe(42);
      expect(parsePositiveIntEnv("   ", 42)).toBe(42);
    });

    it("should parse a valid positive integer", () => {
      expect(parsePositiveIntEnv("10", 42)).toBe(10);
    });

    it("should return fallback for zero and negative values", () => {
      expect(parsePositiveIntEnv("0", 42)).toBe(42);
      expect(parsePositiveIntEnv("-5", 42)).toBe(42);
    });

    it("should return fallback for non-numeric values", () => {
      expect(parsePositiveIntEnv("abc", 42)).toBe(42);
      expect(parsePositiveIntEnv("1.5", 42)).toBe(42);
    });
  });

  describe("RATE_LIMIT_DEFAULTS with env overrides", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.resetModules();
    });

    async function loadWithEnv(env: Record<string, string>) {
      for (const [key, value] of Object.entries(env)) {
        vi.stubEnv(key, value);
      }
      vi.resetModules();
      return import("./resilience");
    }

    it("should override read maxRequests via env", async () => {
      const mod = await loadWithEnv({
        RATE_LIMIT_READ_MAX_REQUESTS: "250",
      });
      expect(mod.RATE_LIMIT_DEFAULTS.read.maxRequests).toBe(250);
    });

    it("should override read windowMs via env", async () => {
      const mod = await loadWithEnv({
        RATE_LIMIT_READ_WINDOW_MS: "30000",
      });
      expect(mod.RATE_LIMIT_DEFAULTS.read.windowMs).toBe(30000);
    });

    it("should override write and stripe limits independently", async () => {
      const mod = await loadWithEnv({
        RATE_LIMIT_WRITE_MAX_REQUESTS: "5",
        RATE_LIMIT_STRIPE_MAX_REQUESTS: "3",
      });
      expect(mod.RATE_LIMIT_DEFAULTS.write.maxRequests).toBe(5);
      expect(mod.RATE_LIMIT_DEFAULTS.stripe.maxRequests).toBe(3);
    });

    it("should fall back to defaults when env value is invalid", async () => {
      const mod = await loadWithEnv({
        RATE_LIMIT_READ_MAX_REQUESTS: "not-a-number",
      });
      expect(mod.RATE_LIMIT_DEFAULTS.read.maxRequests).toBe(100);
    });

    it("should keep defaults when no env vars are set", async () => {
      vi.resetModules();
      const mod = await import("./resilience");
      expect(mod.RATE_LIMIT_DEFAULTS.read.maxRequests).toBe(100);
      expect(mod.RATE_LIMIT_DEFAULTS.read.windowMs).toBe(60000);
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
