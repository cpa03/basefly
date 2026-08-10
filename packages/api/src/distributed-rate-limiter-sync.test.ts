/**
 * SyncRateLimiter distributed-branch tests
 *
 * Covers the Redis-configured path of SyncRateLimiter.checkAsync and
 * resetAsync (ensureInitialized creating a DistributedRateLimiter), which
 * requires IS_REDIS_CONFIGURED and REDIS_URL to be set.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import type * as CommonTypes from "@saasfly/common";

import {
  DistributedRateLimiter,
  SyncRateLimiter,
} from "./distributed-rate-limiter";

vi.mock("@saasfly/common", async (importOriginal) => {
  const mod = await importOriginal<typeof CommonTypes>();
  return {
    ...mod,
    IS_REDIS_CONFIGURED: true,
    REDIS_URL: "redis://localhost:6379",
  };
});

class MockRedis {
  constructor() {
    const instance = {
      ping: vi.fn().mockResolvedValue("PONG"),
      pipeline: vi.fn().mockReturnValue({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          [null, 0],
          [null, 1],
          [null, 1],
          [null, 1],
        ]),
      }),
      del: vi.fn().mockResolvedValue(1),
      quit: vi.fn().mockResolvedValue("OK"),
      zrem: vi.fn().mockResolvedValue(1),
    };
    Object.assign(this, instance);
  }
}

vi.mock("ioredis", () => ({
  default: MockRedis,
  Redis: MockRedis,
}));

vi.mock("./logger", () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const waitForInit = () => new Promise((resolve) => setTimeout(resolve, 10));

describe("SyncRateLimiter with Redis configured", () => {
  let limiter: SyncRateLimiter;

  afterEach(() => {
    limiter?.destroy();
  });

  it("should initialize a DistributedRateLimiter when Redis is configured", async () => {
    limiter = new SyncRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    await limiter.checkAsync("user1");
    await waitForInit();

    const distributed = limiter["distributed"];
    expect(distributed).toBeInstanceOf(DistributedRateLimiter);
  });

  it("checkAsync should delegate to the distributed limiter when Redis is configured", async () => {
    limiter = new SyncRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    await waitForInit();

    const result = await limiter.checkAsync("user1");

    expect(result.success).toBe(true);
    expect(result.limit).toBe(5);
  });

  it("resetAsync should reset both the distributed limiter and the fallback", async () => {
    limiter = new SyncRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    await limiter.checkAsync("user1");
    await waitForInit();

    await expect(limiter.resetAsync("user1")).resolves.toBeUndefined();
  });

  it("checkAsync should fall back to in-memory when the distributed limiter fails at runtime", async () => {
    limiter = new SyncRateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    // resetAsync triggers ensureInitialized without consuming rate limit tokens
    await limiter.resetAsync("user1");
    await waitForInit();

    const distributed = limiter["distributed"]!;
    distributed["redis"] = {
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

    const result = await limiter.checkAsync("user1");

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });
});
