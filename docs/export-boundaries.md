# Package Export Boundaries

> **Status**: Documented 2026-08-12 — Issue #667
>
> This document defines the package export boundaries of the Basefly monorepo:
> which packages may import from which, and what each package exposes as its
> public API surface.

## Boundary Policy

1. **Dependency direction is a DAG** — packages may only depend on packages
   listed in the dependency graph below. Circular dependencies are forbidden
   and enforced in CI via `pnpm check:circular` (madge).
2. **Explicit `exports` fields** — every workspace package declares an
   `exports` map in its `package.json`. Consumers must import through declared
   subpath exports; private internals are not reachable.
3. **Layering** — `@saasfly/common` is the foundation layer (no workspace
   dependencies). Domain packages (`db`, `auth`, `stripe`, `ui`) build on it.
   `@saasfly/api` composes domain packages into tRPC routers. The Next.js app
   is the composition root that depends on all packages.
4. **Tree-shaking enabled** — all workspace packages declare
   `"sideEffects": false`. Import-time side effects (e.g., t3-env `createEnv`
   in `env.mjs` files) are confined to subpath exports and never placed in the
   main barrel. Barrel re-exports of heavy modules (`logger` → `pino`,
   `cache` → `ioredis`) are tree-shaken out of client bundles that do not
   import them. See `docs/barrel-export-audit-2026-08-17.md` (Issue #523).

## Dependency Graph (verified 2026-08-12)

```
@saasfly/common                 (foundation — no workspace deps)
├── @saasfly/db                 → common
├── @saasfly/auth               → common
├── @saasfly/stripe             → common, db
├── @saasfly/ui                 → common
└── @saasfly/api                → common, db, stripe
        │
        └── apps/nextjs         → api, auth, common, db, stripe, ui
```

**Circular dependency check**: `npx madge --circular --extensions ts,tsx,js,jsx,mjs,cjs packages/`
reports **"No circular dependency found!"** across 207 processed files.

## Package Export Surfaces

### `@saasfly/common` — shared utilities, config, types

| Subpath                                      | Purpose                                                                                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.`                                          | Shared utilities, types, constants                                                                                                                                              |
| `./config/*`                                 | Modular configuration domains (ui, resilience, k8s, pricing, site, http, headers, features, urls, validation, pagination, cache, scroll, csp, env, ui-strings, assets, project) |
| `./cache`                                    | Application-layer cache service (`cacheService`, `CACHE_KEYS`)                                                                                                                  |
| `./logger`                                   | Pino logger                                                                                                                                                                     |
| `./observability`                            | OpenTelemetry/Sentry instrumentation                                                                                                                                            |
| `./env`                                      | Environment validation (t3-env)                                                                                                                                                 |
| `./resend`                                   | Email integration                                                                                                                                                               |
| `./subscriptions`                            | Subscription plan types                                                                                                                                                         |
| `./animation`, `./icon-sizes`, `./ui-tokens` | UI token/constant modules                                                                                                                                                       |

### `@saasfly/db` — database access (Kysely + Prisma schema)

| Subpath                            | Purpose                                  |
| ---------------------------------- | ---------------------------------------- |
| `.`                                | DB instance, schema types, query helpers |
| `./soft-delete`                    | Soft-delete query helpers                |
| `./user-deletion`                  | User deletion flows                      |
| `./prisma/types`, `./prisma/enums` | Generated Prisma types/enums             |
| `./logger`                         | DB logging                               |

### `@saasfly/auth` — Clerk authentication

| Subpath     | Purpose                                          |
| ----------- | ------------------------------------------------ |
| `.`         | Auth options, current-user helpers, admin guards |
| `./env.mjs` | Auth environment validation                      |

### `@saasfly/stripe` — Stripe billing integration

| Subpath                 | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `.`                     | Stripe client, webhook handling, plans       |
| `./plans`               | Subscription plan definitions                |
| `./client`              | Stripe API client with retry/circuit breaker |
| `./integration`         | Integration error types                      |
| `./webhook-idempotency` | Idempotent webhook execution                 |
| `./logger`, `./env`     | Logging and env validation                   |

### `@saasfly/api` — tRPC routers and API infrastructure

| Subpath           | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `.`               | Public API surface: context, errors, rate limiting, request-id |
| `./server`        | `appRouter` root (edge router with lazy-loaded sub-routers)    |
| `./edge`          | Edge router composition (lazy-loads admin/customer/k8s/stripe) |
| `./openapi`       | OpenAPI documentation generation                               |
| `./transformer`   | tRPC data transformer                                          |
| `./request-id`    | Request ID utilities                                           |
| `./subscriptions` | Subscription helpers                                           |
| `./env`           | API environment validation                                     |

### `@saasfly/ui` — shared UI components (Radix + Tailwind)

| Subpath         | Purpose                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `.`             | Component barrel export                                                                                                         |
| `./<component>` | Individual components (accordion, button, dialog, select, table, etc.) — each component is a dedicated subpath for tree-shaking |

### `apps/nextjs` — composition root

Imports from all packages; no other package may import from `apps/nextjs`.

## Verification

```bash
# Circular dependency check (CI-enforced)
pnpm check:circular

# Dependency version consistency (CI-enforced)
pnpm check-deps

# Full DX gate
pnpm dx:check
```

## Acceptance Criteria (Issue #667)

- [x] No circular dependencies — verified by madge (0 cycles, 207 files)
- [x] Clean package export boundaries — explicit `exports` maps on all 6 packages
- [x] Barrel exports optimized — `@saasfly/ui` exposes per-component subpaths; `@saasfly/api` lazy-loads heavy routers
- [x] Export boundaries documented — this document
