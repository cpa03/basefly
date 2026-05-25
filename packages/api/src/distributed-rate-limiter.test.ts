/**
 * Distributed Rate Limiter Tests
 *
 * Tests for Redis-based rate limiting and fallback behavior.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock ioredis
vi.mock("ioredis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    ping: vi.fn().mockResolvedValue("PONG"),
    pipeline: vi.fn().mockReturnValue({
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        [null, 0], // zremrangebyscore result
        [null, 5], // zcard result - current count
        [null, 1], // zadd result
        [null, 1], // expire result
      ]),
    }),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue("OK"),
    zrem: vi.fn().mockResolvedValue(1),
  })),
}));

// Mock the logger
vi.mock("./logger", () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  DistributedRateLimiter,
  InMemoryRateLimiter,
  SyncRateLimiter,
  getLimiter,
  rateLimitConfigs,
} from "./distributed-rate-limiter";
import { logger } from "./logger";

describe("InMemoryRateLimiter (Fallback)", () => {
  let limiter: InMemoryRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    limiter?.destroy();
    vi.useRealTimers();
  });

  it("should allow first request and deduct one token", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    const result = limiter.check("user1");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("should reject request when tokens are exhausted", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    limiter.check("user1");
    limiter.check("user1");
    const result = limiter.check("user1");

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should refill tokens after window expires", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    limiter.check("user1");
    limiter.check("user1");
    expect(limiter.check("user1").success).toBe(false);

    vi.advanceTimersByTime(1100);

    const result = limiter.check("user1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("should track rate limits independently for each identifier", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    limiter.check("user1");
    limiter.check("user1");
    // user1 should be blocked
    expect(limiter.check("user1").success).toBe(false);

    // user2 should still have tokens
    expect(limiter.check("user2").success).toBe(true);
  });

  it("should reset rate limit for specific identifier", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    limiter.check("user1");
    limiter.check("user1");
    limiter.reset("user1");

    const result = limiter.check("user1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("should clean up expired entries", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 2,
      windowMs: 100,
    });

    limiter.check("user1");
    limiter.check("user2");

    vi.advanceTimersByTime(250);

    // Should still work - expired entries are cleaned up lazily
    const result = limiter.check("user1");
    expect(result.success).toBe(true);
  });
});

describe("DistributedRateLimiter (Redis-based)", () => {
  let limiter: DistributedRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await limiter?.destroy();
    vi.useRealTimers();
  });

  it("should initialize with Redis URL", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379"
    );

    // Wait for async initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        maxRequests: 5,
        windowMs: 1000,
      }),
      "DistributedRateLimiter connected to Redis"
    );
  });

  it("should allow request when under limit", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379"
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    const result = await limiter.check("user1");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0); // 5 - 5 = 0 based on mock
    expect(result.limit).toBe(5);
  });

  it("should reject request when over limit", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 1,
        windowMs: 1000,
      },
      "redis://localhost:6379"
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Mock the pipeline to return count exceeding limit
    const mockPipeline = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        [null, 0],
        [null, 5], // Count > limit
        [null, 1],
        [null, 1],
      ]),
    };

    // access private property for test
    limiter["redis"] = {
      pipeline: vi.fn().mockReturnValue(mockPipeline),
      zrem: vi.fn().mockResolvedValue(1),
      quit: vi.fn().mockResolvedValue("OK"),
    } as any;

    const result = await limiter.check("user1");

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should fall back to in-memory when Redis fails", async () => {
    // Mock Redis that throws error
    vi.mock("ioredis", () => ({
      Redis: vi.fn().mockImplementation(() => {
        throw new Error("Connection refused");
      }),
    }));

    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379"
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Should use fallback
    const result = await limiter.check("user1");

    expect(result.success).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
      }),
      "Failed to initialize Redis, using in-memory fallback"
    );
  });

  it("should reset rate limit for identifier", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379"
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    await limiter.reset("user1");

    // access private property for test
    const redis = limiter["redis"] as any;
    expect(redis.del).toHaveBeenCalledWith("ratelimit:user1");
  });

  it("should destroy cleanly", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379"
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    await limiter.destroy();

    // access private property for test
    const redis = limiter["redis"] as any;
    expect(redis.quit).toHaveBeenCalled();
  });
});

describe("SyncRateLimiter (Backward-compatible wrapper)", () => {
  let limiter: SyncRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    limiter?.destroy();
    vi.useRealTimers();
  });

  it("should provide synchronous check method using fallback", () => {
    limiter = new SyncRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    const result = limiter.check("user1");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should provide async checkAsync method", async () => {
    limiter = new SyncRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    const result = await limiter.checkAsync("user1");

    expect(result.success).toBe(true);
  });

  it("should reset identifier in both sync and async", () => {
    limiter = new SyncRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    limiter.check("user1");
    limiter.check("user1");
    limiter.reset("user1");

    const result = limiter.check("user1");
    expect(result.success).toBe(true);
  });

  it("should destroy cleanly", () => {
    limiter = new SyncRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    expect(() => limiter.destroy()).not.toThrow();
  });
});

describe("getLimiter()", () => {
  afterEach(() => {
    // Clean up limiters after tests
    const readLimiter = getLimiter("read");
    const writeLimiter = getLimiter("write");
    const stripeLimiter = getLimiter("stripe");
    readLimiter.destroy();
    writeLimiter.destroy();
    stripeLimiter.destroy();
  });

  it("should return SyncRateLimiter for read endpoint", () => {
    const limiter = getLimiter("read");
    expect(limiter).toBeInstanceOf(SyncRateLimiter);
  });

  it("should return SyncRateLimiter for write endpoint", () => {
    const limiter = getLimiter("write");
    expect(limiter).toBeInstanceOf(SyncRateLimiter);
  });

  it("should return SyncRateLimiter for stripe endpoint", () => {
    const limiter = getLimiter("stripe");
    expect(limiter).toBeInstanceOf(SyncRateLimiter);
  });
});

describe("rateLimitConfigs", () => {
  it("should have correct config for read endpoint", () => {
    const config = rateLimitConfigs.read;
    expect(config.maxRequests).toBe(100);
    expect(config.windowMs).toBe(60000);
  });

  it("should have correct config for write endpoint", () => {
    const config = rateLimitConfigs.write;
    expect(config.maxRequests).toBe(20);
    expect(config.windowMs).toBe(60000);
  });

  it("should have correct config for stripe endpoint", () => {
    const config = rateLimitConfigs.stripe;
    expect(config.maxRequests).toBe(10);
    expect(config.windowMs).toBe(60000);
  });
});

describe("Rate limiting edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should handle maxRequests of 1", async () => {
    const limiter = new InMemoryRateLimiter({
      maxRequests: 1,
      windowMs: 1000,
    });

    const result1 = limiter.check("user1");
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(0);

    const result2 = limiter.check("user1");
    expect(result2.success).toBe(false);
    expect(result2.remaining).toBe(0);

    limiter.destroy();
  });

  it("should handle rapid consecutive requests", () => {
    const limiter = new InMemoryRateLimiter({
      maxRequests: 100,
      windowMs: 1000,
    });

    for (let i = 0; i < 100; i++) {
      const result = limiter.check("user1");
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(99 - i);
    }

    const exhausted = limiter.check("user1");
    expect(exhausted.success).toBe(false);

    limiter.destroy();
  });

  it("should handle special characters in identifier", () => {
    const limiter = new InMemoryRateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });

    const result = limiter.check("user@#$%^&*()");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);

    limiter.destroy();
  });
});

describe("Logging", () => {
  let limiter: InMemoryRateLimiter;
  let loggerWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    loggerWarnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    limiter?.destroy();
    vi.useRealTimers();
    loggerWarnSpy.mockRestore();
  });

  it("should log warning when rate limit is exceeded", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    limiter.check("user1");
    limiter.check("user1");
    limiter.check("user1");

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: "user1",
        remaining: 0,
      }),
      "Rate limit exceeded"
    );
  });

  it("should include resetAt in warning log", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 1,
      windowMs: 1000,
    });

    limiter.check("user1");
    limiter.check("user1");

    const callArgs = loggerWarnSpy.mock.calls[0];
    expect(callArgs?.[0]).toHaveProperty("resetAt");
  });
});
