/**
 * CacheService Tests
 *
 * Tests for Redis-backed caching with in-memory fallback.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CACHE_KEYS, CACHE_PREFIX, type CacheService } from "./index";

const envState = vi.hoisted(() => ({
  IS_EDGE: false,
  IS_REDIS_CONFIGURED: false,
  REDIS_URL: "",
}));

vi.mock("../config/env", () => ({
  IS_EDGE: envState.IS_EDGE,
  IS_REDIS_CONFIGURED: envState.IS_REDIS_CONFIGURED,
  REDIS_URL: envState.REDIS_URL,
}));

vi.mock("../logger", () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

let redisConnectionFails = false;

class MockRedis {
  private store = new Map<string, string>();

  constructor() {
    if (redisConnectionFails) {
      throw new Error("connect failed");
    }
  }

  ping = vi.fn().mockResolvedValue("PONG");
  get = vi.fn(async (key: string) => this.store.get(key) ?? null);
  setex = vi.fn(async (key: string, _ttl: number, value: string) => {
    this.store.set(key, value);
    return "OK";
  });
  del = vi.fn(async (...keys: string[]) => {
    let removed = 0;
    for (const key of keys) {
      if (this.store.delete(key)) removed++;
    }
    return removed;
  });
  keys = vi.fn(async (pattern: string) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
    return [...this.store.keys()].filter((key) => regex.test(key));
  });
  quit = vi.fn().mockResolvedValue("OK");
}

vi.mock("ioredis", () => ({
  default: MockRedis,
  Redis: MockRedis,
}));

describe("CacheService - constants", () => {
  it("should export CACHE_PREFIX with cache: prefix", () => {
    expect(CACHE_PREFIX).toBe("cache:");
  });

  it("should build subscription cache keys from userId", () => {
    expect(CACHE_KEYS.subscription("user_123")).toBe("subscription:user_123");
  });
});

describe("CacheService - in-memory fallback", () => {
  let service: CacheService;

  beforeEach(async () => {
    vi.useFakeTimers();
    envState.IS_REDIS_CONFIGURED = false;
    envState.REDIS_URL = "";
    vi.resetModules();
    const { CacheService } = await import("./index");
    service = new CacheService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return factory value on miss and cache it", async () => {
    const factory = vi.fn().mockResolvedValue({ plan: "pro" });

    const first = await service.getOrSet("key1", 300, factory);
    const second = await service.getOrSet("key1", 300, factory);

    expect(first).toEqual({ plan: "pro" });
    expect(second).toEqual({ plan: "pro" });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("should expire entries after TTL", async () => {
    const factory = vi.fn().mockResolvedValue({ plan: "pro" });

    await service.getOrSet("key1", 60, factory);
    vi.advanceTimersByTime(61_000);

    const after = await service.getOrSet("key1", 60, factory);
    expect(after).toEqual({ plan: "pro" });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it("should return null for unknown keys", async () => {
    expect(await service.get("missing")).toBeNull();
  });

  it("should invalidate a single key", async () => {
    const factory = vi.fn().mockResolvedValue("value");

    await service.getOrSet("key1", 60, factory);
    await service.invalidateKey("key1");

    expect(await service.get("key1")).toBeNull();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("should invalidate keys matching a glob pattern", async () => {
    const factory = vi.fn().mockResolvedValue("value");

    await service.getOrSet("subscription:a", 60, factory);
    await service.getOrSet("subscription:b", 60, factory);
    await service.getOrSet("other:c", 60, factory);

    await service.invalidate("subscription:*");

    expect(await service.get("subscription:a")).toBeNull();
    expect(await service.get("subscription:b")).toBeNull();
    expect(await service.get("other:c")).toEqual("value");
  });

  it("should respect a custom prefix", async () => {
    const { CacheService: PrefixedCacheService } = await import("./index");
    const prefixed = new PrefixedCacheService("custom:");
    const factory = vi.fn().mockResolvedValue("value");

    await prefixed.getOrSet("key1", 60, factory);
    expect(await prefixed.get("key1")).toEqual("value");
  });

  it("should track metrics", async () => {
    const factory = vi.fn().mockResolvedValue("value");

    await service.get("miss1");
    await service.getOrSet("key1", 60, factory);
    await service.get("key1");
    await service.invalidateKey("key1");

    const metrics = service.getMetrics();
    expect(metrics.hits).toBe(1);
    expect(metrics.misses).toBe(2);
    expect(metrics.sets).toBe(1);
    expect(metrics.invalidations).toBe(1);
  });
});

describe("CacheService - Redis backend", () => {
  let service: CacheService;

  beforeEach(async () => {
    envState.IS_REDIS_CONFIGURED = true;
    envState.REDIS_URL = "redis://localhost:6379";
    vi.resetModules();
    const { CacheService } = await import("./index");
    service = new CacheService();
  });

  afterEach(() => {
    envState.IS_REDIS_CONFIGURED = false;
    envState.REDIS_URL = "";
    redisConnectionFails = false;
  });

  it("should store and retrieve values via Redis", async () => {
    await service.set("key1", { plan: "pro" }, 60);
    expect(await service.get("key1")).toEqual({ plan: "pro" });
  });

  it("should invalidate keys via Redis", async () => {
    await service.set("key1", "value", 60);
    await service.invalidateKey("key1");
    expect(await service.get("key1")).toBeNull();
  });

  it("should fall back to in-memory when Redis fails", async () => {
    redisConnectionFails = true;

    await service.set("key1", "value", 60);
    expect(await service.get("key1")).toBe("value");
  });
});