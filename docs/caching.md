# Application-Layer Caching

Basefly provides a Redis-backed application cache for frequently accessed,
rarely changing data. The cache automatically falls back to an in-memory store
when Redis is not configured (local development, edge runtimes, or connection
failures).

## Overview

The cache service lives in `@saasfly/common/cache` and is exported from the
main `@saasfly/common` entry point:

- `CacheService` - the cache implementation (get/set/getOrSet/invalidate)
- `cacheService` - shared singleton instance for application-wide use
- `CACHE_KEYS` - well-known cache keys shared across packages
- `CACHE_PREFIX` - default key prefix (`cache:`)

## Configuration

The cache is enabled automatically when `REDIS_URL` is set. See
[Redis Setup](./redis-setup.md) for connection details. When `REDIS_URL` is
empty, or when running in an edge runtime, the cache transparently falls back
to an in-memory store so the application works without Redis.

## Usage

### getOrSet

Read a value from the cache, or compute and store it on a miss:

```ts
import { CACHE_DURATION, CACHE_KEYS, cacheService } from "@saasfly/common";

const plan = await cacheService.getOrSet(CACHE_KEYS.subscription(userId), CACHE_DURATION.FIVE_MINUTES, () => fetchSubscriptionStatus(userId));
```

### set / get

Store and read values explicitly:

```ts
await cacheService.set("key", value, CACHE_DURATION.ONE_HOUR);
const value = await cacheService.get("key");
```

`get` returns `null` on a miss.

### Invalidation

Invalidate a single key or all keys matching a glob pattern:

```ts
await cacheService.invalidateKey(CACHE_KEYS.subscription(userId));
await cacheService.invalidate("subscription:*");
```

## Cache Key Conventions

Use `CACHE_KEYS` for well-known keys so producers (webhooks) and consumers
(routers) stay consistent. Keys are namespaced with the `cache:` prefix to
avoid collisions with rate limiter keys.

| Data                     | Key                           | TTL  | Invalidation          |
| ------------------------ | ----------------------------- | ---- | --------------------- |
| User subscription status | `CACHE_KEYS.subscription(id)` | 5min | Stripe webhook events |

## Cache Metrics

`CacheService.getMetrics()` returns hit/miss/set/invalidation counters for
observability:

```ts
const metrics = cacheService.getMetrics();
// { hits, misses, sets, invalidations }
```

## Cached Data

### User Subscription Status

`userPlans` (in `packages/api/src/router/stripe.ts`) caches the user's
subscription plan for 5 minutes. The cache is invalidated by Stripe webhook
events in `packages/stripe/src/webhooks.ts`:

- `checkout.session.completed`
- `invoice.payment_succeeded`
- `customer.subscription.updated`

This reduces repeated database queries and Stripe API calls on every page
load while keeping subscription status fresh via webhook-driven invalidation.

## Adding a New Cache Entry

1. Add a key helper to `CACHE_KEYS` in `packages/common/src/cache/index.ts`.
2. Read/write through `cacheService` using a TTL from `CACHE_DURATION`.
3. Identify the mutation point that should invalidate the entry and call
   `cacheService.invalidateKey(...)` or `cacheService.invalidate(...)`.
4. Add unit tests in `packages/common/src/cache/cache.test.ts`.
