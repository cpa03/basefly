/**
 * Distributed Rate Limiter Tests
 *
 * Tests for Redis-based rate limiting and fallback behavior.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DistributedRateLimiter,
  getIdentifier,
  getLimiter,
  InMemoryRateLimiter,
  rateLimitConfigs,
  SyncRateLimiter,
} from "./distributed-rate-limiter";
import { logger } from "./logger";

// Create a reusable mock Redis instance factory
let mockPing: (() => Promise<string>) | null = null;

function createMockRedis() {
  return {
    ping: mockPing ?? vi.fn().mockResolvedValue("PONG"),
    pipeline: vi.fn().mockReturnValue({
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        [null, 0],
        [null, 5],
        [null, 1],
        [null, 1],
      ]),
    }),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue("OK"),
    zrem: vi.fn().mockResolvedValue(1),
  };
}

// Mock ioredis constructor - must be a class/function that supports `new`
class MockRedis {
  constructor(_url?: string) {
    const instance = createMockRedis();
    Object.assign(this, instance);
  }
}

vi.mock("ioredis", () => ({
  default: MockRedis,
  Redis: MockRedis,
}));

// Mock the logger
vi.mock("./logger", () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const waitForRedisInit = () =>
  new Promise((resolve) => setTimeout(resolve, 10));

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

  it("should delete stale entries via the cleanup interval", () => {
    limiter = new InMemoryRateLimiter({
      maxRequests: 2,
      windowMs: 100,
    });

    limiter.check("user1");

    // Advance past windowMs * 2 so the cleanup interval removes the entry
    vi.advanceTimersByTime(350);

    expect(limiter["store"].size).toBe(0);
  });
});

describe("DistributedRateLimiter (Redis-based)", () => {
  let limiter: DistributedRateLimiter;

  afterEach(async () => {
    await limiter?.destroy();
  });

  it("should initialize with Redis URL", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    // Wait for async initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        maxRequests: 5,
        windowMs: 1000,
      }),
      "DistributedRateLimiter connected to Redis",
    );
  });

  it("should allow request when under limit", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Mock the pipeline to return count below the limit (2 prior requests)
    const mockPipeline = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        [null, 0],
        [null, 2], // Count < limit
        [null, 1],
        [null, 1],
      ]),
    };

    limiter["redis"] = {
      pipeline: vi.fn().mockReturnValue(mockPipeline),
      zrem: vi.fn().mockResolvedValue(1),
      quit: vi.fn().mockResolvedValue("OK"),
    } as any;

    const result = await limiter.check("user1");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2); // 5 - 2 - 1 = 2
    expect(result.limit).toBe(5);
  });

  it("should reject request when at the limit (no off-by-one)", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Mock the pipeline to return count = limit (5 prior requests)
    const mockPipeline = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        [null, 0],
        [null, 5], // Count == limit
        [null, 1],
        [null, 1],
      ]),
    };

    limiter["redis"] = {
      pipeline: vi.fn().mockReturnValue(mockPipeline),
      zrem: vi.fn().mockResolvedValue(1),
      quit: vi.fn().mockResolvedValue("OK"),
    } as any;

    const result = await limiter.check("user1");

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reject request when over limit", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 1,
        windowMs: 1000,
      },
      "redis://localhost:6379",
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
    limiter = new DistributedRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    const result = await limiter.check("user1");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should reset rate limit for identifier", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
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
      "redis://localhost:6379",
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Spy on quit before destroy (destroy sets redis to null afterwards)
    const redis = limiter["redis"] as any;
    const quitSpy = vi.spyOn(redis, "quit");

    await limiter.destroy();

    expect(quitSpy).toHaveBeenCalled();
  });

  it("should warn and use in-memory fallback when Redis init fails (ping rejects)", async () => {
    const errorLoggerSpy = vi
      .spyOn(logger, "warn")
      .mockImplementation(() => {});

    // Force the ioredis mock's ping to reject
    mockPing = () => Promise.reject(new Error("ECONNREFUSED"));

    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    await waitForRedisInit();

    expect(errorLoggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "ECONNREFUSED",
      }),
      "Failed to initialize Redis, using in-memory fallback",
    );
    expect(limiter["redis"]).toBeNull();

    const result = await limiter.check("user1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);

    errorLoggerSpy.mockRestore();
    mockPing = null;
  });

  it("should use generic message when Redis init fails with a non-Error value", async () => {
    const errorLoggerSpy = vi
      .spyOn(logger, "warn")
      .mockImplementation(() => {});

    // Intentionally reject with a non-Error value to exercise the defensive
    // "Unknown error" branch in initializeRedis's catch handler.
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- test fixture for the non-Error rejection path
    mockPing = () => Promise.reject("connection refused");

    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    await waitForRedisInit();

    expect(errorLoggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Unknown error",
      }),
      "Failed to initialize Redis, using in-memory fallback",
    );

    errorLoggerSpy.mockRestore();
    mockPing = null;
  });

  it("should log error and fall back to in-memory when Redis pipeline exec fails at runtime", async () => {
    const errorLoggerSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => {});

    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Mock pipeline exec to reject, simulating a Redis runtime failure
    limiter["redis"] = {
      pipeline: vi.fn().mockReturnValue({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValue(new Error("Connection lost")),
      }),
      zrem: vi.fn().mockResolvedValue(1),
      quit: vi.fn().mockResolvedValue("OK"),
    } as any;

    const result = await limiter.check("user1");

    expect(errorLoggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Connection lost",
        identifier: "user1",
      }),
      "Redis error, falling back to in-memory",
    );
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);

    errorLoggerSpy.mockRestore();
  });

  it("should treat missing pipeline result as zero count and allow the request", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    // exec resolves with a result that lacks the zcard entry
    limiter["redis"] = {
      pipeline: vi.fn().mockReturnValue({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([[null, 0], null, null, null]),
      }),
      zrem: vi.fn().mockResolvedValue(1),
      quit: vi.fn().mockResolvedValue("OK"),
    } as any;

    const result = await limiter.check("user1");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should handle non-Error thrown values from Redis with a generic message", async () => {
    const errorLoggerSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => {});

    limiter = new DistributedRateLimiter(
      {
        maxRequests: 5,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    limiter["redis"] = {
      pipeline: vi.fn().mockReturnValue({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValue("raw string error"),
      }),
      zrem: vi.fn().mockResolvedValue(1),
      quit: vi.fn().mockResolvedValue("OK"),
    } as any;

    const result = await limiter.check("user1");

    expect(errorLoggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Unknown error",
        identifier: "user1",
      }),
      "Redis error, falling back to in-memory",
    );
    expect(result.success).toBe(true);

    errorLoggerSpy.mockRestore();
  });
  it("should fall back to in-memory reset when Redis is not initialized", async () => {
    limiter = new DistributedRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    // No Redis URL provided -> redis stays null
    await limiter.check("user1");
    await limiter.check("user1");
    expect((await limiter.check("user1")).success).toBe(false);

    await limiter.reset("user1");

    const result = await limiter.check("user1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("should fall back to in-memory reset when Redis del fails", async () => {
    limiter = new DistributedRateLimiter(
      {
        maxRequests: 2,
        windowMs: 1000,
      },
      "redis://localhost:6379",
    );

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));

    await limiter.check("user1");
    await limiter.check("user1");

    // Mock del to reject, simulating a Redis runtime failure
    limiter["redis"] = {
      del: vi.fn().mockRejectedValue(new Error("Connection lost")),
      quit: vi.fn().mockResolvedValue("OK"),
    } as any;

    await expect(limiter.reset("user1")).resolves.toBeUndefined();

    const result = await limiter.check("user1");
    expect(result.success).toBe(true);
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

  it("resetAsync should use only the fallback when Redis is not configured", async () => {
    limiter = new SyncRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    await limiter.checkAsync("user1");
    await limiter.checkAsync("user1");
    expect((await limiter.checkAsync("user1")).success).toBe(false);

    await limiter.resetAsync("user1");

    const result = await limiter.checkAsync("user1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
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
      "Rate limit exceeded",
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

describe("getIdentifier()", () => {
  it("should return user-based identifier when userId is provided", () => {
    expect(getIdentifier("user_123")).toBe("user:user_123");
  });

  it("should return first IP from x-forwarded-for header", () => {
    const req = {
      headers: {
        get: (name: string) =>
          name === "x-forwarded-for" ? "203.0.113.1, 198.51.100.2" : null,
      },
    } as any;

    expect(getIdentifier(null, req)).toBe("ip:203.0.113.1");
  });

  it("should fall back to x-real-ip when x-forwarded-for is absent", () => {
    const req = {
      headers: {
        get: (name: string) => (name === "x-real-ip" ? "203.0.113.9" : null),
      },
    } as any;

    expect(getIdentifier(null, req)).toBe("ip:203.0.113.9");
  });

  it("should fall through to x-real-ip when x-forwarded-for is empty", () => {
    const req = {
      headers: {
        get: (name: string) =>
          name === "x-forwarded-for"
            ? ""
            : name === "x-real-ip"
              ? "203.0.113.9"
              : null,
      },
    } as any;

    expect(getIdentifier(null, req)).toBe("ip:203.0.113.9");
  });

  it("should fall back to ip:unknown when x-forwarded-for is empty and no x-real-ip", () => {
    const req = {
      headers: {
        get: (name: string) => (name === "x-forwarded-for" ? "" : null),
      },
    } as any;

    expect(getIdentifier(null, req)).toBe("ip:unknown");
  });

  it("should fall back to ip:unknown when request has no identifying headers", () => {
    const req = {
      headers: {
        get: () => null,
      },
    } as any;

    expect(getIdentifier(null, req)).toBe("ip:unknown");
  });

  it("should return unknown when no identifier can be derived", () => {
    expect(getIdentifier(null, undefined)).toBe("unknown");
  });
});
