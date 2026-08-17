# Barrel Export Audit — 2026-08-17

> **Status**: Complete — Issue #523
>
> **Audit date**: 2026-08-17
> **Auditor**: Repository maintainer automation (loop 171)
> **Baseline**: `main` @ `18e38c5` — typecheck 9/9, lint 9/9, tests 2137/2137 ✅

## Scope

Barrel exports (package entry `index.ts` / `src/index.ts` files) across the
monorepo, with focus on tree-shaking effectiveness for client bundles.

| Package           | Barrel                         | Exports                               |
| ----------------- | ------------------------------ | ------------------------------------- |
| `@saasfly/common` | `packages/common/src/index.ts` | 263 named exports (24 domain groups)  |
| `@saasfly/ui`     | `packages/ui/src/index.ts`     | 3 (`cn`, `buttonVariants`, `Callout`) |
| `@saasfly/api`    | `packages/api/src/index.ts`    | ~30 (mostly types + infrastructure)   |
| `@saasfly/auth`   | `packages/auth/index.ts`       | auth options, guards                  |
| `@saasfly/stripe` | `packages/stripe/src/index.ts` | Stripe client, webhooks, plans        |
| `@saasfly/db`     | `packages/db/src/index.ts`     | DB instance, query helpers            |

## Findings

### 1. `@saasfly/ui` — already optimized (verified)

The UI barrel was previously reduced to 3 exports; all 60+ components are
available via per-component subpath exports (`@saasfly/ui/button`, etc.) for
maximum tree-shaking. No action needed.

### 2. `@saasfly/common` — 263 exports, all referenced

Every one of the 263 named exports from the `common` barrel is referenced by at
least one consumer in the repository. No dead exports were found.

**Internal-only usage (134 exports):** 134 of the 263 exports are only ever
referenced _inside_ `packages/common` itself (its config modules), never
imported by `apps/` or another package. Examples: `PRICING_TIERS`,
`STRIPE_PRICE_IDS`, `RESOURCE_LIMITS`, `CACHE_CONTROL`, `buildCSPHeader`,
`getStripePriceIds`, `IS_DEV`.

- **Retained deliberately**: this is a public SaaS template; removing exports
  would be a breaking change for downstream consumers who may import them.
- **Cost is now zero** after the `sideEffects` fix below: unused re-exports are
  tree-shaken away by the bundler instead of being emitted.

### 3. [FIXED] Missing `sideEffects: false` — tree-shaking was disabled

**Root cause of the bundle-size risk in issue #523:**

The barrel `packages/common/src/index.ts` re-exports `logger` (which imports
`pino`). The package did **not** declare `"sideEffects": false`, so bundlers
treated every module in the barrel's re-export graph as potentially
side-effectful. Any client component importing `{ THEME_STRINGS }` (or any
other constant) from `@saasfly/common` would pull `pino` (and transitively its
dependencies) into the client bundle.

**Fix applied** — `"sideEffects": false` added to:

| Package           | Evidence of safety                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@saasfly/common` | No CSS imports; no top-level side-effectful statements in `src/` (logger instantiation is module-scoped but only included when imported; `env.mjs` `createEnv` lives on a separate subpath, not the barrel) |
| `@saasfly/ui`     | No CSS imports; components are pure render functions                                                                                                                                                        |
| `@saasfly/api`    | Type-focused barrel; server-only                                                                                                                                                                            |
| `@saasfly/auth`   | No CSS imports; no top-level side effects                                                                                                                                                                   |
| `@saasfly/stripe` | No CSS imports; no top-level side effects                                                                                                                                                                   |
| `@saasfly/db`     | Already declared `sideEffects: false` (precedent)                                                                                                                                                           |

**Verification of safety:**

- `grep` across `packages/*/src`: zero `import "./*.css"` statements, zero
  top-level `window./document./globalThis.` statements, zero top-level
  side-effectful function calls in barrel-reachable modules.
- The only import-time side effects (`createEnv` env validation) live in
  `env.mjs` files exposed as **subpath exports**, not the barrel, and are
  explicitly imported by consumers — explicit imports always execute
  regardless of the `sideEffects` flag.

### 4. Circular dependency risk — clean (re-verified)

`pnpm check:circular` (madge) reports no circular dependencies across
`apps/` + `packages/`; CI-enforced via `pnpm dx:check` / `ci:check`.

## Recommendations

1. **Done — keep**: `"sideEffects": false` on all 6 workspace packages enables
   bundlers to drop unused barrel re-exports; this directly addresses #523's
   "increase bundle size" concern without removing public API.
2. **Do not remove the 134 internal-only exports** — they are public template
   API surface; tree-shaking now makes them free. Documented here instead.
3. **Future**: if a future `sideEffects` violation is introduced (e.g., a CSS
   import in a shared component), the `size:check` (450 kB client JS gzip
   limit) and `pnpm dx:check` gates in CI will catch it.

## Acceptance Criteria (Issue #523)

- [x] Audit current barrel exports — mapped all 6 package barrels (263 exports
      in `common` alone; every one verified against consumers)
- [x] Identify unused exports — 0 dead exports; 134 internal-only exports
      documented and deliberately retained
- [x] Check for circular dependency risks — madge clean, CI-enforced
- [x] Consider splitting by domain — already done (`common` has 24 subpath
      config exports; `ui` has per-component subpaths); `sideEffects: false`
      now makes the main barrels tree-shakeable
