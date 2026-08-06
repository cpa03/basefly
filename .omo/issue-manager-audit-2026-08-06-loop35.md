# Issue Manager Audit Report — 2026-08-06 (Loop 35)

**Phase**: ISSUE MANAGER MODE — Steps 1-4
**Performed by**: Sisyphus (Autonomous Agent)
**Status**: Full-codebase verification of all 82 open issues completed. No
genuinely-unresolved, code-fixable, non-workflow P0/P1 issue remains. Label/issue
mutations and workflow-file pushes remain blocked by token scope (see below).

## Executive Summary

All 82 open issues were fetched (body + comments) and verified against the
current `main` codebase. This session focused on **Step 4 (REPAIR) target
selection** and produced a definitive verification matrix.

**Key conclusions:**

1. **Every P0/P1 issue is resolved in code** — with one exception: #728
   (security scanning workflows), which is **blocked by token scope** (the
   `GITHUB_TOKEN` lacks `workflows` permission; a real push of
   `.github/workflows/security-audit.yml` was rejected with
   `refusing to allow a GitHub App to create or update workflow`).
2. **No genuinely-unresolved, code-fixable, non-workflow issue remains** at
   P0/P1. The remaining open issues are either resolved-but-unclosed,
   duplicates, P2/P3 audit/optimization tasks, or workflow-file changes that
   the token cannot push.
3. **Issue mutations (Steps 1-3) remain blocked**: `issues:write` is absent.
   `gh issue edit --add-label` → `GraphQL: Resource not accessible by
integration (addLabelsToLabelable)`; issue comments → HTTP 403.
4. **Repo health verified**: `pnpm test` → 79 files / 1560 tests PASS;
   `pnpm typecheck` → 9/9 packages; `pnpm lint` → 9/9 packages, 0 warnings.

---

## Verification Matrix (verified against code this session)

### P0/P1 — RESOLVED in code (issue left open, needs human closure)

| #   | Title                            | Evidence in code                                                                               |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| 496 | Distributed rate limiter (Redis) | `packages/api/src/distributed-rate-limiter.ts` (ioredis, sliding window), wired in `trpc.ts`   |
| 480 | (dup of 496)                     | same file                                                                                      |
| 498 | RBAC admin                       | `packages/api/src/rbac.ts` (Role enum, isAdmin, requireRole), `adminProcedure`, `rbac.test.ts` |
| 500 | Clerk auth flow tests            | `packages/auth` coverage 100% (clerk.ts, index.ts, logger.ts, env.mjs)                         |
| 501 | Playwright E2E                   | `tests/e2e/*.spec.ts` + `playwright.config.ts`                                                 |
| 515 | CSRF protection                  | `apps/nextjs/src/proxy.ts` (origin/referer validation) + tRPC middleware                       |
| 549 | packages/auth tests              | coverage 100%                                                                                  |
| 550 | nextjs in coverage config        | `vitest.config.ts` includes `apps/nextjs/src/**`                                               |
| 551 | k8s router tests                 | `packages/api/src/router/k8s-router.test.ts` (18 tests, PR #1119 merged)                       |
| 722 | Env validation                   | `packages/common/src/config/env.ts` `validateEnvVars()` + `env:validate` script                |
| 721 | Explicit authorization           | RBAC + `isAdmin` middleware in `trpc.ts`                                                       |
| 632 | Sensitive logging audit          | `packages/api/src/sensitive-data-logging.test.ts`                                              |
| 786 | Stripe secret in logs            | `packages/stripe/src/webhooks.ts` sanitized (no secret logged)                                 |
| 754 | Stripe webhook idempotency tests | `packages/stripe/src/webhook-idempotency.test.ts`                                              |
| 785 | Duplicate next dep               | `packages/stripe/package.json` deduped                                                         |
| 789 | React peerDeps in ui             | `packages/ui/package.json` peerDeps present                                                    |

### P2/P3 — RESOLVED in code (verified)

| #           | Title                        | Evidence                                                                                          |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| 579         | Env setup error messages     | `env:verify` script with friendly pnpm guidance                                                   |
| 609         | Duplicate Zod schemas        | `router/schemas.ts` centralizes; k8s/customer/stripe import from it                               |
| 630         | Pre-commit hooks             | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged`                        |
| 634         | TS strictness                | `tooling/typescript-config/base.json` `strict: true` + `noUncheckedIndexedAccess`                 |
| 683         | ESLint/Prettier config       | root `.eslintrc.cjs`; `prettier: @saasfly/prettier-config`; lint passes 9/9                       |
| 663         | eslint-disable consolidation | remaining are legitimate type-assertion suppressions                                              |
| 664         | console.\* → pino            | only doc-comment `console.log` examples remain in packages                                        |
| 483         | Transaction handling         | `packages/stripe/src/webhooks.ts` uses `db.transaction().execute(...)`                            |
| 485         | Suspense boundaries          | dashboard/billing/pricing pages all use `<Suspense>` + skeletons                                  |
| 755         | Composite index              | Customer model: `@@index([authUserId, plan, stripeCurrentPeriodEnd])` etc.                        |
| 688         | Next.js middleware           | `apps/nextjs/src/proxy.ts` (CSRF + security headers + tracing)                                    |
| 666         | Global error boundary        | `apps/nextjs/src/app/global-error.tsx` + route-group `error.tsx` files                            |
| 611         | not-found pages              | `not-found.tsx` in all route groups                                                               |
| 578         | Duplicate health endpoint    | only `apps/nextjs/src/app/api/health/route.ts` remains (health_check.ts removed)                  |
| 488         | Circular dep detection       | `check:circular` (madge) script in root package.json                                              |
| 719         | Root tsconfig                | `tsconfig.json` extends base                                                                      |
| 726         | Dependency consistency       | `check-deps` (check-dependency-version-consistency) in `dx:check`                                 |
| 521         | Hydration consistency        | `use-client-dictionary.ts` uses SSR-safe `useSyncExternalStore`                                   |
| 636         | ISR caching                  | intentionally NOT applied — dashboard is `force-dynamic` (user-specific data, documented in code) |
| 729         | Bundle size regression       | `size-limit` config (4 budgets) + `size:check` script                                             |
| 751         | tRPC bundle size             | routers already split per-file                                                                    |
| 503         | JSDoc on routers             | k8s(5)/customer(4)/stripe(3)/auth(1)/admin(2) JSDoc blocks                                        |
| 752         | CLI output utils             | per-package loggers exist (common/api/auth/stripe/db/nextjs)                                      |
| 697         | Corrupted docs text          | mojibake scan: zero matches (loop24 verified)                                                     |
| 720/748     | .nvmrc                       | `.nvmrc` = 22.14.0 (valid)                                                                        |
| 705         | Docker config                | `Dockerfile` + `docker-compose.yml`                                                               |
| 706         | Dev Containers               | `.devcontainer/devcontainer.json`                                                                 |
| 708         | Bundle analyzer              | `size:analyze` script (ANALYZE=true)                                                              |
| 684         | Root build script            | `build: pnpm env:validate && turbo build`                                                         |
| 713/787/788 | unit tests common/db/ui      | test suites exist and pass (1560 total)                                                           |

### BLOCKED — token cannot fix

| #   | Title                       | Blocker                                                                                                                                                        |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 728 | Security scanning workflows | requires pushing `.github/workflows/*` — token lacks `workflows` permission (push rejected with `refusing to allow a GitHub App to create or update workflow`) |

### Duplicate clusters (consolidation needed — blocked from closing)

- **480 ↔ 496** (Redis rate limiter)
- **305 ↔ 584 ↔ 595 ↔ 670 ↔ 744** (pnpm consistency in workflows)
- **501 ↔ 628 ↔ 724** (Playwright E2E)
- **551 ↔ 631 ↔ 725** (API router tests)
- **720 ↔ 748** (.nvmrc)
- **731 ↔ 749** (auto API docs generation)

### Genuinely open but NOT safe/minimal for automation

| #           | Title                               | Reason                                                           |
| ----------- | ----------------------------------- | ---------------------------------------------------------------- |
| 610         | Standardize tRPC response format    | risky cross-contract refactor (frontend consumers), not minimal  |
| 487         | App-level Redis caching             | large feature (pricing/subscription/stripe caching), not minimal |
| 590         | UI library audit                    | audit task, not a code fix                                       |
| 685         | React perf optimizations            | speculative memoization, not minimal                             |
| 723         | Reduce client components (41 files) | large refactor, not minimal                                      |
| 650         | Extract AI prompts from on-pull.yml | workflow file — blocked                                          |
| 502/522/727 | CI workflow changes                 | workflow files — blocked                                         |

---

## Step 1-3 — Issue Mutations (blocked, manual action required)

Token lacks `issues:write`. Recommended human actions:

1. **Close resolved-but-open issues** listed in the two matrices above.
2. **Close duplicates**: keep 496, 584/670/744 (or 595), 628, 631, 720, 731;
   close 480, 305, 595, 670, 744, 501, 724, 551, 725, 748, 749.
3. **Add priority labels** per loop34 recommendations (unchanged).
4. **#728**: merge-ready workflow specs already exist at
   `docs/ci/workflows/security-audit.yml` and
   `docs/ci/workflows/codeql-analysis.yml` — a maintainer with
   `workflows` permission can copy them into `.github/workflows/`.

---

## Repo Health Evidence (this session)

- `pnpm install --frozen-lockfile` → OK
- `pnpm test` → **79 files / 1560 tests PASS**
- `pnpm typecheck` → **9/9 packages pass**
- `pnpm lint` → **9/9 packages pass, 0 warnings**

---

## Final State

- **Phase**: ISSUE MANAGER MODE (Steps 1-4)
- **Conclusion**: All P0/P1 issues resolved in code except #728 (blocked by
  `workflows` permission). Steps 1-3 blocked by missing `issues:write`.
  Waiting for human review/execution of the above manual actions.
