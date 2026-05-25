/**
 * Distributed Rate Limiter
 *
 * Redis-based rate limiter for multi-instance deployments.
 * Uses sliding window algorithm for accurate rate limiting.
 *
 * This module provides:
 * - DistributedRateLimiter: Redis-based rate limiter
 * - SyncRateLimiter: Backward-compatible wrapper that falls back to in-memory
 */

import type { NextRequest } from "next/server";

import {
  IS_REDIS_CONFIGURED,
  RATE_LIMIT_DEFAULTS,
  REDIS_URL,
  type EndpointType,
  type RateLimitConfig,
} from "@saasfly/common";

import { logger } from "./logger";

// Re-export types and original RateLimiter
export { RateLimiter } from "./rate-limiter";
export type { EndpointType, RateLimitConfig } from "@saasfly/common";

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

// Type for Redis client
type RedisClient = InstanceType<typeof import("ioredis").Redis>;

/**
 * In-memory rate limiter (fallback when Redis is not available)
 */
export class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
    this.startCleanup();
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry) {
      this.store.set(identifier, {
        tokens: this.maxRequests - 1,
        lastRefill: now,
      });
      return {
        success: true,
        remaining: this.maxRequests - 1,
        resetAt: now + this.windowMs,
        limit: this.maxRequests,
      };
    }

    const elapsed = now - entry.lastRefill;

    if (elapsed >= this.windowMs) {
      entry.tokens = this.maxRequests;
      entry.lastRefill = now;
    }

    if (entry.tokens > 0) {
      entry.tokens -= 1;
      return {
        success: true,
        remaining: entry.tokens,
        resetAt: entry.lastRefill + this.windowMs,
        limit: this.maxRequests,
      };
    }

    logger.warn(
      {
        identifier,
        remaining: 0,
        resetAt: entry.lastRefill + this.windowMs,
        windowMs: this.windowMs,
        maxRequests: this.maxRequests,
      },
      "Rate limit exceeded",
    );

    return {
      success: false,
      remaining: 0,
      resetAt: entry.lastRefill + this.windowMs,
      limit: this.maxRequests,
    };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }

  get maxRequestsValue(): number {
    return this.maxRequests;
  }

  get windowMsValue(): number {
    return this.windowMs;
  }

  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now - entry.lastRefill > this.windowMs * 2) {
          this.store.delete(key);
        }
      }
    }, this.windowMs);
  }
}

/**
 * DistributedRateLimiter - Redis-based rate limiter
 * Uses sliding window algorithm for accurate rate limiting
 */
export class DistributedRateLimiter {
  private redis: RedisClient | null = null;
  private prefix: string;
  private maxRequests: number;
  private windowMs: number;
  private fallback: InMemoryRateLimiter;
  private initialized = false;

  constructor(config: RateLimitConfig, redisUrl?: string) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
    this.prefix = "ratelimit:";
    this.fallback = new InMemoryRateLimiter(config);

    // Initialize Redis if URL is provided
    const url = redisUrl ?? REDIS_URL;
    if (url) {
      void this.initializeRedis(url);
    } else {
      logger.debug(
        { maxRequests: this.maxRequests, windowMs: this.windowMs },
        "DistributedRateLimiter initialized with in-memory fallback",
      );
    }
  }

  private async initializeRedis(url: string): Promise<void> {
    try {
      const { default: RedisClient } = await import("ioredis");
      this.redis = new RedisClient(url);
      await this.redis.ping();
      logger.debug(
        { maxRequests: this.maxRequests, windowMs: this.windowMs },
        "DistributedRateLimiter connected to Redis",
      );
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : "Unknown error" },
        "Failed to initialize Redis, using in-memory fallback",
      );
      this.redis = null;
    }
    this.initialized = true;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    if (!this.redis) {
      return this.fallback.check(identifier);
    }

    const fullKey = `${this.prefix}${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      const pipeline = this.redis.pipeline();
      pipeline.zremrangebyscore(fullKey, 0, windowStart);
      pipeline.zcard(fullKey);
      const requestId = `${now}-${Math.random()}`;
      pipeline.zadd(fullKey, now, requestId);
      pipeline.expire(fullKey, Math.ceil(this.windowMs / 1000));

      const results = await pipeline.exec();
      const count = (results?.[1]?.[1] as number) ?? 0;

      const allowed = count <= this.maxRequests;
      const remaining = Math.max(0, this.maxRequests - count);

      if (!allowed) {
        await this.redis.zrem(fullKey, requestId);
        logger.warn(
          { identifier, count, limit: this.maxRequests },
          "Rate limit exceeded (distributed)",
        );
      }

      return {
        success: allowed,
        remaining,
        resetAt: now + this.windowMs,
        limit: this.maxRequests,
      };
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          identifier,
        },
        "Redis error, falling back to in-memory",
      );
      return this.fallback.check(identifier);
    }
  }

  async reset(identifier: string): Promise<void> {
    if (!this.redis) {
      this.fallback.reset(identifier);
      return;
    }

    try {
      await this.redis.del(`${this.prefix}${identifier}`);
    } catch {
      this.fallback.reset(identifier);
    }
  }

  async destroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
    this.fallback.destroy();
  }
}

/**
 * SyncRateLimiter - Backward-compatible rate limiter
 * Uses in-memory by default, but can use Redis when configured
 */
export class SyncRateLimiter {
  private distributed: DistributedRateLimiter | null = null;
  private fallback: InMemoryRateLimiter;
  private initialized = false;

  constructor(config: RateLimitConfig) {
    this.fallback = new InMemoryRateLimiter(config);
  }

  private ensureInitialized(): void {
    if (this.initialized) return;

    if (IS_REDIS_CONFIGURED && REDIS_URL) {
      this.distributed = new DistributedRateLimiter(
        {
          maxRequests: this.fallback.maxRequestsValue,
          windowMs: this.fallback.windowMsValue,
        },
        REDIS_URL,
      );
    }
    this.initialized = true;
  }

  check(identifier: string): RateLimitResult {
    return this.fallback.check(identifier);
  }

  async checkAsync(identifier: string): Promise<RateLimitResult> {
    this.ensureInitialized();

    if (this.distributed) {
      return this.distributed.check(identifier);
    }

    return this.fallback.check(identifier);
  }

  reset(identifier: string): void {
    this.fallback.reset(identifier);
  }

  async resetAsync(identifier: string): Promise<void> {
    this.ensureInitialized();

    if (this.distributed) {
      await this.distributed.reset(identifier);
    }

    this.fallback.reset(identifier);
  }

  destroy(): void {
    this.fallback.destroy();
  }
}

// Factory functions - maintain backward compatibility
const limiters: Record<EndpointType, SyncRateLimiter> = {
  read: new SyncRateLimiter(RATE_LIMIT_DEFAULTS.read),
  write: new SyncRateLimiter(RATE_LIMIT_DEFAULTS.write),
  stripe: new SyncRateLimiter(RATE_LIMIT_DEFAULTS.stripe),
};

export function getLimiter(type: EndpointType): SyncRateLimiter {
  return limiters[type];
}

export const rateLimitConfigs: Record<EndpointType, RateLimitConfig> =
  RATE_LIMIT_DEFAULTS;

export function getIdentifier(
  userId: string | null,
  req?: NextRequest,
): string {
  if (userId) {
    return `user:${userId}`;
  }

  if (req) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown";
    return `ip:${ip}`;
  }

  return "unknown";
}
