import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getIdentifier,
  getLimiter,
  rateLimitConfigs,
  RateLimiter,
  type EndpointType,
} from "./rate-limiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    limiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });
  });

  afterEach(() => {
    limiter.destroy();
    vi.useRealTimers();
  });

  describe("check() - First request for identifier", () => {
    it("should allow first request and deduct one token", () => {
      const result = limiter.check("user1");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it("should create new entry with correct initial state", () => {
      limiter.check("user1");

      const result = limiter.check("user1");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(3);
    });
  });

  describe("check() - Token bucket algorithm", () => {
    it("should allow requests until tokens are exhausted", () => {
      for (let i = 0; i < 5; i++) {
        const result = limiter.check("user1");
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it("should reject request when tokens are exhausted", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("user1");
      }

      const result = limiter.check("user1");

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reject subsequent requests after limit is reached", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("user1");
      }

      const result1 = limiter.check("user1");
      const result2 = limiter.check("user1");

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });

  describe("check() - Window refill logic", () => {
    it("should refill tokens after window expires", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("user1");
      }

      vi.advanceTimersByTime(1100);

      const result = limiter.check("user1");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should not refill tokens while window is active", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("user1");
      }

      vi.advanceTimersByTime(500);

      const result = limiter.check("user1");

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset lastRefill timestamp when window expires", () => {
      const firstCheck = limiter.check("user1");
      vi.advanceTimersByTime(1100);

      const secondCheck = limiter.check("user1");

      expect(secondCheck.resetAt).toBeGreaterThan(firstCheck.resetAt);
    });
  });

  describe("check() - Multiple identifiers", () => {
    it("should track rate limits independently for each identifier", () => {
      const user1Results = [];
      const user2Results = [];

      for (let i = 0; i < 7; i++) {
        user1Results.push(limiter.check("user1"));
        user2Results.push(limiter.check("user2"));
      }

      expect(user1Results[4]?.success).toBe(true);
      expect(user1Results[5]?.success).toBe(false);
      expect(user2Results[4]?.success).toBe(true);
      expect(user2Results[5]?.success).toBe(false);
    });

    it("should allow different identifiers to have independent limits", () => {
      limiter.check("user1");
      limiter.check("user1");
      limiter.check("user1");

      const result = limiter.check("user2");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });

  describe("reset() - Reset rate limit for identifier", () => {
    it("should reset rate limit for specific identifier", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("user1");
      }

      limiter.reset("user1");

      const result = limiter.check("user1");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should not affect other identifiers", () => {
      for (let i = 0; i < 4; i++) {
        limiter.check("user1");
        limiter.check("user2");
      }

      limiter.reset("user1");

      const result1 = limiter.check("user1");
      const result2 = limiter.check("user2");

      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(0);
    });

    it("should handle reset for non-existent identifier", () => {
      expect(() => {
        limiter.reset("non-existent");
      }).not.toThrow();

      const result = limiter.check("non-existent");

      expect(result.success).toBe(true);
    });
  });

  describe("destroy() - Cleanup resources", () => {
    it("should clear all stored entries", () => {
      limiter.check("user1");
      limiter.check("user2");
      limiter.check("user3");

      limiter.destroy();

      const result = limiter.check("user1");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should stop cleanup interval", () => {
      limiter.destroy();

      expect(() => limiter.destroy()).not.toThrow();
    });
  });

  describe("Automatic cleanup of expired entries", () => {
    it("should clean up entries older than 2x window duration", () => {
      const slowLimiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 100,
      });

      slowLimiter.check("user1");
      slowLimiter.check("user2");

      vi.advanceTimersByTime(250);

      const result = slowLimiter.check("user1");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);

      slowLimiter.destroy();
    });
  });

  describe("resetAt calculation", () => {
    it("should calculate resetAt as lastRefill + windowMs", () => {
      const now = Date.now();
      const result = limiter.check("user1");

      expect(result.resetAt).toBeGreaterThanOrEqual(now + 1000);
      expect(result.resetAt).toBeLessThan(now + 2000);
    });

    it("should maintain consistent resetAt within window", () => {
      const result1 = limiter.check("user1");
      const result2 = limiter.check("user1");
      const result3 = limiter.check("user1");

      expect(result1.resetAt).toBe(result2.resetAt);
      expect(result2.resetAt).toBe(result3.resetAt);
    });
  });
});

describe("getLimiter()", () => {
  it("should return rate limiter for 'read' endpoint type", () => {
    const limiter = getLimiter("read");
    expect(limiter).toBeInstanceOf(RateLimiter);
  });

  it("should return rate limiter for 'write' endpoint type", () => {
    const limiter = getLimiter("write");
    expect(limiter).toBeInstanceOf(RateLimiter);
  });

  it("should return rate limiter for 'stripe' endpoint type", () => {
    const limiter = getLimiter("stripe");
    expect(limiter).toBeInstanceOf(RateLimiter);
  });

  it("should return the same limiter instance for same type", () => {
    const limiter1 = getLimiter("read");
    const limiter2 = getLimiter("read");

    expect(limiter1).toBe(limiter2);
  });

  it("should return different limiter instances for different types", () => {
    const readLimiter = getLimiter("read");
    const writeLimiter = getLimiter("write");

    expect(readLimiter).not.toBe(writeLimiter);
  });
});

describe("rateLimitConfigs", () => {
  it("should have correct config for 'read' endpoint", () => {
    const config = rateLimitConfigs.read;
    expect(config.maxRequests).toBe(100);
    expect(config.windowMs).toBe(60 * 1000);
  });

  it("should have correct config for 'write' endpoint", () => {
    const config = rateLimitConfigs.write;
    expect(config.maxRequests).toBe(20);
    expect(config.windowMs).toBe(60 * 1000);
  });

  it("should have correct config for 'stripe' endpoint", () => {
    const config = rateLimitConfigs.stripe;
    expect(config.maxRequests).toBe(10);
    expect(config.windowMs).toBe(60 * 1000);
  });
});

describe("getIdentifier()", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = {
      headers: {
        get: vi.fn(),
      },
    } as unknown as NextRequest;
  });

  it("should return user identifier when userId is provided", () => {
    const identifier = getIdentifier("user123");

    expect(identifier).toBe("user:user123");
  });

  it("should return IP identifier from x-forwarded-for header", () => {
    vi.mocked(mockRequest.headers.get).mockImplementation((header) => {
      if (header === "x-forwarded-for") return "192.168.1.1, 10.0.0.1";
      return null;
    });

    const identifier = getIdentifier(null, mockRequest);

    expect(identifier).toBe("ip:192.168.1.1");
  });

  it("should return IP identifier from x-real-ip header", () => {
    vi.mocked(mockRequest.headers.get).mockImplementation((header) => {
      if (header === "x-real-ip") return "10.0.0.1";
      return null;
    });

    const identifier = getIdentifier(null, mockRequest);

    expect(identifier).toBe("ip:10.0.0.1");
  });

  it("should return 'ip:unknown' when no userId and no IP headers", () => {
    vi.mocked(mockRequest.headers.get).mockReturnValue(null);

    const identifier = getIdentifier(null, mockRequest);

    expect(identifier).toBe("ip:unknown");
  });

  it("should return 'unknown' when no userId and no request provided", () => {
    const identifier = getIdentifier(null);

    expect(identifier).toBe("unknown");
  });

  it("should prefer userId over IP address", () => {
    vi.mocked(mockRequest.headers.get).mockReturnValue("10.0.0.1");

    const identifier = getIdentifier("user123", mockRequest);

    expect(identifier).toBe("user:user123");
  });

  it("should handle empty x-forwarded-for", () => {
    vi.mocked(mockRequest.headers.get).mockImplementation((header) => {
      if (header === "x-forwarded-for") return "";
      return null;
    });

    const identifier = getIdentifier(null, mockRequest);

    expect(identifier).toBe("ip:unknown");
  });

  it("should handle x-forwarded-for with single IP", () => {
    vi.mocked(mockRequest.headers.get).mockImplementation((header) => {
      if (header === "x-forwarded-for") return "192.168.1.1";
      return null;
    });

    const identifier = getIdentifier(null, mockRequest);

    expect(identifier).toBe("ip:192.168.1.1");
  });
});

describe("RateLimiter - Edge Cases and Boundary Conditions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should handle maxRequests of 1", () => {
    const limiter = new RateLimiter({
      maxRequests: 1,
      windowMs: 1000,
    });

    const result1 = limiter.check("user1");
    const result2 = limiter.check("user1");

    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(0);
    expect(result2.success).toBe(false);

    limiter.destroy();
  });

  it("should handle very large maxRequests", () => {
    const limiter = new RateLimiter({
      maxRequests: 10000,
      windowMs: 1000,
    });

    const result = limiter.check("user1");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9999);

    limiter.destroy();
  });

  it("should handle very short window (10ms)", () => {
    const limiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 10,
    });

    const result1 = limiter.check("user1");
    const result2 = limiter.check("user1");

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    vi.advanceTimersByTime(15);

    const result3 = limiter.check("user1");

    expect(result3.success).toBe(true);

    vi.advanceTimersByTime(5);

    const result4 = limiter.check("user1");
    const result5 = limiter.check("user1");

    expect(result4.success).toBe(true);
    expect(result5.success).toBe(false);

    limiter.destroy();
  });

  it("should handle empty string identifier", () => {
    const limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });

    const result = limiter.check("");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);

    limiter.destroy();
  });

  it("should handle special characters in identifier", () => {
    const limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });

    const result = limiter.check("user@#$%^&*()");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);

    limiter.destroy();
  });

  it("should handle rapid consecutive requests", () => {
    const limiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 1000,
    });

    const results = [];
    for (let i = 0; i < 100; i++) {
      results.push(limiter.check("user1"));
    }

    results.forEach((result, index) => {
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(99 - index);
    });

    const exhausted = limiter.check("user1");
    expect(exhausted.success).toBe(false);

    limiter.destroy();
  });
});
