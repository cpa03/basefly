/**
 * Redis Application-Layer Cache
 *
 * Provides a centralized caching service for frequently accessed, rarely
 * changing data. Uses Redis when configured and falls back to an in-memory
 * store in development or edge runtimes.
 *
 * This module provides:
 * - CacheService: getOrSet/set/get/invalidate with TTL support
 * - In-memory fallback when Redis is not configured (local dev, edge)
 * - Cache metrics (hits, misses, sets, invalidations)
 *
 * @module @saasfly/common/cache
 * @see {@link https://github.com/cpa03/basefly/issues/487 | Issue #487}
 */

import type { Redis } from "ioredis";

import { IS_EDGE } from "../config/log-level";
import { IS_REDIS_CONFIGURED, REDIS_URL } from "../config/env";
import { logger } from "../logger";

/**
 * Default key prefix for all cache entries.
 * Prevents collisions with rate limiter keys and other Redis usage.
 */
export const CACHE_PREFIX = "cache:";

/**
 * Well-known cache keys shared across packages.
 * Keeps producers (webhooks) and consumers (routers) consistent.
 */
export const CACHE_KEYS = {
  /** Per-user subscription status, invalidated on Stripe webhook events */
  subscription: (userId: string) => `subscription:${userId}`,
} as const;

/**
 * Cache metrics counters.
 * Exposed via {@link CacheService.getMetrics} for observability.
 */
export interface CacheMetrics {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Number of values stored */
  sets: number;
  /** Number of keys invalidated */
  invalidations: number;
}

/**
 * In-memory cache entry with expiration.
 */
interface MemoryEntry {
  value: string;
  expiresAt: number;
}

/**
 * Redis-backed application cache with in-memory fallback.
 *
 * @example
 * ```ts
 * import { cacheService } from "@saasfly/common/cache";
 *
 * const plan = await cacheService.getOrSet(
 *   `subscription:${userId}`,
 *   CACHE_DURATION.FIVE_MINUTES,
 *   () => fetchSubscriptionStatus(userId),
 * );
 *
 * await cacheService.invalidate(`subscription:${userId}`);
 * ```
 */
export class CacheService {
  private redis: Redis | null = null;
  private initialized = false;
  private readonly memoryStore = new Map<string, MemoryEntry>();
  private readonly metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
  };
  private readonly prefix: string;

  constructor(prefix: string = CACHE_PREFIX) {
    this.prefix = prefix;
  }

  /**
   * Returns the cached value for `key` or computes it via `factory`,
   * stores it with the given TTL, and returns it.
   *
   * @param key - Cache key (without prefix)
   * @param ttlSeconds - Time-to-live in seconds
   * @param factory - Async function producing the value on a cache miss
   */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Stores `value` under `key` with the given TTL.
   *
   * @param key - Cache key (without prefix)
   * @param value - Value to store (JSON-serialized)
   * @param ttlSeconds - Time-to-live in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const fullKey = this.prefix + key;
    const serialized = JSON.stringify(value);
    const redis = await this.getRedis();

    if (redis) {
      try {
        await redis.setex(fullKey, ttlSeconds, serialized);
        this.metrics.sets++;
        return;
      } catch (error) {
        logger.warn(
          { error: error instanceof Error ? error.message : "Unknown error" },
          "CacheService.set failed, falling back to in-memory store",
        );
      }
    }

    this.memoryStore.set(fullKey, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    this.metrics.sets++;
  }

  /**
   * Returns the cached value for `key`, or `null` on a miss.
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.prefix + key;
    const redis = await this.getRedis();

    if (redis) {
      try {
        const raw = await redis.get(fullKey);
        if (raw === null) {
          this.metrics.misses++;
          return null;
        }
        this.metrics.hits++;
        return JSON.parse(raw) as T;
      } catch (error) {
        logger.warn(
          { error: error instanceof Error ? error.message : "Unknown error" },
          "CacheService.get failed, checking in-memory store",
        );
      }
    }

    const entry = this.memoryStore.get(fullKey);
    if (!entry) {
      this.metrics.misses++;
      return null;
    }
    if (entry.expiresAt <= Date.now()) {
      this.memoryStore.delete(fullKey);
      this.metrics.misses++;
      return null;
    }
    this.metrics.hits++;
    return JSON.parse(entry.value) as T;
  }

  /**
   * Invalidates a single cache key.
   *
   * @param key - Cache key (without prefix)
   */
  async invalidateKey(key: string): Promise<void> {
    const fullKey = this.prefix + key;
    const redis = await this.getRedis();

    if (redis) {
      try {
        await redis.del(fullKey);
        this.metrics.invalidations++;
        return;
      } catch (error) {
        logger.warn(
          { error: error instanceof Error ? error.message : "Unknown error" },
          "CacheService.invalidateKey failed, falling back to in-memory store",
        );
      }
    }

    this.memoryStore.delete(fullKey);
    this.metrics.invalidations++;
  }

  /**
   * Invalidates all cache keys matching the given glob pattern.
   *
   * @param pattern - Glob pattern (without prefix), e.g. `subscription:*`
   */
  async invalidate(pattern: string): Promise<void> {
    const fullPattern = this.prefix + pattern;
    const redis = await this.getRedis();

    if (redis) {
      try {
        const keys = await redis.keys(fullPattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        this.metrics.invalidations++;
        return;
      } catch (error) {
        logger.warn(
          { error: error instanceof Error ? error.message : "Unknown error" },
          "CacheService.invalidate failed, falling back to in-memory store",
        );
      }
    }

    const regex = globToRegex(fullPattern);
    for (const key of this.memoryStore.keys()) {
      if (regex.test(key)) {
        this.memoryStore.delete(key);
      }
    }
    this.metrics.invalidations++;
  }

  /**
   * Returns the current cache metrics counters.
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Lazily initializes the Redis client.
   * Falls back to in-memory storage when Redis is not configured,
   * when running in an edge runtime, or when the connection fails.
   */
  private async getRedis(): Promise<Redis | null> {
    if (this.redis) {
      return this.redis;
    }
    if (this.initialized) {
      return null;
    }
    this.initialized = true;

    if (IS_EDGE || !IS_REDIS_CONFIGURED || !REDIS_URL) {
      logger.debug(
        "CacheService using in-memory fallback (Redis not configured or edge runtime)",
      );
      return null;
    }

    try {
      const { default: RedisClient } = await import("ioredis");
      this.redis = new RedisClient(REDIS_URL);
      await this.redis.ping();
      logger.debug("CacheService connected to Redis");
      return this.redis;
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : "Unknown error" },
        "Failed to initialize Redis for caching, using in-memory fallback",
      );
      this.redis = null;
      return null;
    }
  }
}

/**
 * Converts a glob pattern (supporting `*` wildcards) to a RegExp.
 */
function globToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`);
}

/**
 * Shared singleton instance for application-wide use.
 */
export const cacheService = new CacheService();