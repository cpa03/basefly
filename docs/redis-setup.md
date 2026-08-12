# Redis Setup & Distributed Rate Limiting

This guide covers how to configure **Redis-backed distributed rate limiting** for Basefly. Distributed rate limiting ensures consistent API protection across **all application instances** in multi-instance deployments (serverless, Kubernetes, multiple Vercel instances).

> **Reference**: Issue [#496](https://github.com/cpa03/basefly/issues/496) — [P0][Security] Replace in-memory rate limiter with distributed store (Redis). OWASP A01:2021 — Broken Access Control.

---

## 1. Why Redis?

The default in-memory rate limiter (`packages/api/src/rate-limiter.ts`) keeps its state **per application instance**. In a multi-instance deployment, each instance maintains its own counter, so a client can bypass rate limits by distributing requests across instances.

A Redis-backed limiter (`packages/api/src/distributed-rate-limiter.ts`) stores the rate-limit state in a shared store, so the limit is enforced **globally**, regardless of which instance serves the request.

| Capability                       | In-memory (`rate-limiter.ts`) | Redis (`distributed-rate-limiter.ts`) |
| -------------------------------- | ----------------------------- | ------------------------------------- |
| Consistent across instances      | ❌ Per-instance only          | ✅ Global                             |
| Survives instance restarts       | ❌ State lost                 | ✅ State persists                     |
| Algorithm                        | Token bucket                  | Sliding window (Redis sorted sets)    |
| Works in Edge runtime            | ✅                            | ⚠️ Falls back to in-memory (see §4)   |
| Zero configuration (development) | ✅                            | ✅ (automatic fallback)               |

## 2. Requirements

- A Redis server **v6.0+** (sorted-set commands used: `ZREMRANGEBYSCORE`, `ZCARD`, `ZADD`, `EXPIRE`).
- Any Redis-compatible provider works:
  - **Upstash Redis** (serverless, recommended for Vercel)
  - **Redis Cloud** / Redis Enterprise
  - **Self-hosted Redis** (Docker, Kubernetes, bare metal)
  - **Vercel KV** (compatible with the `REDIS_URL` format)

## 3. Configuration

### 3.1 Environment Variable

Set the `REDIS_URL` environment variable. Format:

```
redis://[[username:]password@]host[:port][/database]
```

Examples:

```bash
# Upstash (serverless)
REDIS_URL="rediss://default:YOUR_TOKEN@your-db.upstash.io:6379"

# Self-hosted with password
REDIS_URL="redis://:yourpassword@localhost:6379/0"

# Local development (no auth)
REDIS_URL="redis://localhost:6379"
```

Add it to your environment file (`.env.local` / `.env.example`):

```bash
# .env.local
REDIS_URL="redis://localhost:6379"
```

> `REDIS_URL` is a **recommended** (non-blocking) environment variable. When it is empty or unset, the application continues to work with the in-memory fallback (see §4). See `RECOMMENDED_ENV_VARS` in `packages/common/src/config/env.ts`.

### 3.2 Docker Compose (local development)

For local development with Docker, add a Redis service to `docker-compose.yml` and pass `REDIS_URL` to the app service:

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: basefly-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - basefly-network

  app:
    environment:
      # ...
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
```

### 3.3 Runtime detection

The application detects Redis availability at startup:

- `REDIS_URL` set → `IS_REDIS_CONFIGURED = true` (`packages/common/src/config/env.ts`)
- Redis reachable → limiter connects and `ping()` succeeds
- Redis unreachable → **graceful degradation** to in-memory (with warning logs)

## 4. Graceful Degradation (Fallback)

The `SyncRateLimiter` (`packages/api/src/distributed-rate-limiter.ts`) is the entry point used by all rate-limited routes:

1. If `REDIS_URL` is configured **and** the runtime is **not** the Edge runtime, it initializes a `DistributedRateLimiter` (Redis-backed).
2. If Redis is unavailable (connection failure, timeout, runtime error), every `check()` falls back to the `InMemoryRateLimiter` and logs a warning.
3. If `REDIS_URL` is empty (development), the in-memory limiter is used directly.

**Important — Edge runtime**: `ioredis` is not available in the Edge runtime (`IS_EDGE`). In Edge-deployed routes the limiter automatically uses the in-memory fallback. For globally consistent limits on Edge routes, deploy the rate-limited routes on the Node.js runtime or use an Upstash REST-based client.

```typescript
// Example: how a route consumes the limiter
import { getIdentifier, getLimiter } from "@saasfly/api";

const identifier = getIdentifier(userId, req);
const result = await limiter.checkAsync(identifier); // async = Redis-capable
```

> Always use the **async** `checkAsync()` / `resetAsync()` API in route handlers so Redis is used when available. The synchronous `check()` / `reset()` are in-memory only.

## 5. Default Rate Limits

Rate limits are configured in `packages/common/src/config/resilience.ts` (`RATE_LIMIT_DEFAULTS`) and can be adjusted per endpoint type:

| Endpoint Type | Limit               | Window     | Example Endpoints                                 |
| ------------- | ------------------- | ---------- | ------------------------------------------------- |
| Read          | 100 requests/minute | 60 seconds | `getClusters`, `userPlans`, `hello`, `/api/docs`  |
| Write         | 20 requests/minute  | 60 seconds | `createCluster`, `updateCluster`, `deleteCluster` |
| Stripe        | 10 requests/minute  | 60 seconds | `createSession`, `/api/webhooks/stripe`           |

Redis keys are namespaced with the `ratelimit:` prefix (`RATE_LIMIT_PREFIX`) and expire automatically after the configured window.

### 5.1 Per-endpoint overrides via environment variables

Each endpoint's limit and window can be overridden at deployment time via environment variables, without code changes. Invalid or empty values fall back to the hardcoded defaults.

| Env var                          | Default | Description                         |
| -------------------------------- | ------- | ----------------------------------- |
| `RATE_LIMIT_READ_MAX_REQUESTS`   | `100`   | Max read requests per window        |
| `RATE_LIMIT_READ_WINDOW_MS`      | `60000` | Read window length (milliseconds)   |
| `RATE_LIMIT_WRITE_MAX_REQUESTS`  | `20`    | Max write requests per window       |
| `RATE_LIMIT_WRITE_WINDOW_MS`     | `60000` | Write window length (milliseconds)  |
| `RATE_LIMIT_STRIPE_MAX_REQUESTS` | `10`    | Max Stripe requests per window      |
| `RATE_LIMIT_STRIPE_WINDOW_MS`    | `60000` | Stripe window length (milliseconds) |

Example (`.env.local`):

```bash
# Allow 50 read requests per 30 seconds
RATE_LIMIT_READ_MAX_REQUESTS="50"
RATE_LIMIT_READ_WINDOW_MS="30000"
```

## 6. Verification

### 6.1 Check Redis connectivity

```bash
# The application logs the limiter state on startup:
#   - "DistributedRateLimiter connected to Redis"   (Redis active)
#   - "Failed to initialize Redis, using in-memory fallback"  (fallback)
```

### 6.2 Run the unit tests

```bash
pnpm --filter @saasfly/api test        # includes distributed-rate-limiter.test.ts
pnpm --filter @saasfly/common test     # includes env/resilience tests
```

### 6.3 Manual check

```bash
# With Redis running, verify keys are written:
redis-cli KEYS "ratelimit:*"
redis-cli ZCARD ratelimit:ip:127.0.0.1
```

### 6.4 Production deployment checklist

- [ ] `REDIS_URL` is set in the production environment
- [ ] Redis endpoint is reachable from the deployment platform (firewall/VPC)
- [ ] TLS is used (`rediss://`) when connecting over public networks
- [ ] Redis credentials are stored as secrets, never in the repository
- [ ] The Redis instance has sufficient memory for the expected request volume (keys expire automatically)

## 7. Implementation Reference

| File                                               | Purpose                                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `packages/api/src/distributed-rate-limiter.ts`     | `DistributedRateLimiter` (Redis sliding window), `SyncRateLimiter`, `InMemoryRateLimiter` fallback |
| `packages/api/src/rate-limiter.ts`                 | Original in-memory token-bucket limiter (kept for compatibility)                                   |
| `packages/api/src/trpc.ts`                         | `rateLimit(endpointType)` tRPC middleware (uses `checkAsync`)                                      |
| `apps/nextjs/src/app/api/webhooks/stripe/route.ts` | Stripe webhook route (uses `checkAsync`)                                                           |
| `apps/nextjs/src/app/api/docs/route.ts`            | Docs API route (uses `checkAsync`)                                                                 |
| `packages/common/src/config/env.ts`                | `REDIS_URL`, `IS_REDIS_CONFIGURED`                                                                 |
| `packages/common/src/config/resilience.ts`         | `RATE_LIMIT_DEFAULTS`, `RATE_LIMIT_PREFIX`                                                         |
