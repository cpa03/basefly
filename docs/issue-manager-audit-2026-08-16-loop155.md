# Issue Manager Audit Report — 2026-08-16 (Loop 155)

## Executive Summary

- **Open PRs**: 0
- **Open issues**: 82
- **Mode**: ISSUE MANAGER MODE (Phase 0 → Issue Manager, since open PRs = 0 and open issues > 0)
- **Token constraints discovered this loop**:
  - `issues: write` **NOT available** → label normalization, duplicate closing, and issue comments are **BLOCKED**
  - `workflows: write` **NOT available** → any change to `.github/workflows/*` is **BLOCKED** (push rejected by GitHub App policy)
  - `contents: write` + `pull-requests: write` **available** → branch pushes and PR creation work
- **Key finding**: the vast majority of open issues are **already resolved in code** but were never closed. This report documents evidence per issue so a maintainer with write access can batch-close them.
- **No genuinely-open, non-blocked, repair-scope issue exists** this loop. Per the FAIL-SAFE RULE, no speculative code changes were made.

---

## STEP 1 — Issue Normalization Matrix (BLOCKED: no `issues: write`)

The following 39 issues are missing either a category label (one of `bug | enhancement | feature | docs | refactor | chore | test | ci | security`) or a priority label (one of `P0 | P1 | P2 | P3`). Recommended labels below.

### Missing both category + priority (10 issues)

| Issue | Title | Recommended Category | Recommended Priority |
|-------|-------|----------------------|----------------------|
| #755 | [Database] Add composite index for customer subscription queries | `enhancement` | `P2` |
| #754 | [QA] Add integration tests for Stripe webhook idempotency | `test` | `P2` |
| #753 | [Frontend] Implement route-based code splitting for dashboard pages | `enhancement` | `P2` |
| #752 | [DX] Create unified CLI output utilities | `enhancement` | `P3` |
| #751 | [Performance] Optimize tRPC router bundle size | `enhancement` | `P2` |
| #749 | [Innovation] AI-powered API testing/docs generator | `feature` | `P3` |
| #748 | [DX] .nvmrc contains invalid value '20' | `bug` | `P2` |
| #744 | fix(ci): pnpm consistency in iterate.yml | `ci` | `P2` |
| #697 | Fix corrupted text formatting in documentation files | `docs` | `P3` |
| #595 | GitHub Actions workflows use npm instead of pnpm | `ci` | `P2` |

### Missing category only (1 issue)

| Issue | Title | Recommended Category | Existing Priority |
|-------|-------|----------------------|-------------------|
| #670 | [DX] Fix iterate.yml to use pnpm instead of npm | `ci` | `P3` |

### Missing priority only (28 issues)

| Issue | Recommended Priority | Issue | Recommended Priority |
|-------|----------------------|-------|----------------------|
| #789 | `P2` | #725 | `P1` |
| #788 | `P2` | #724 | `P1` |
| #787 | `P2` | #723 | `P2` |
| #786 | `P1` | #722 | `P1` |
| #785 | `P2` | #721 | `P1` |
| #731 | `P3` | #720 | `P3` |
| #729 | `P3` | #719 | `P2` |
| #728 | `P2` | #713 | `P2` |
| #727 | `P3` | #668 | `P3` |
| #726 | `P2` | #636 | `P3` |
| #635 | `P3` | #630 | `P3` |
| #634 | `P2` | #628 | `P2` |
| #632 | `P1` | #584 | `P2` |
| #631 | `P2` | #305 | `P2` |

---

## STEP 2/3 — Duplicate & Consolidation Plan (BLOCKED: no `issues: write`)

Semantic clusters identified. Close duplicates with reference to canonical; do not lose information (append unique details as comments on the canonical issue).

| Cluster | Canonical | Duplicates to close | Rationale |
|---------|-----------|---------------------|-----------|
| Rate limiter → Redis | #496 | #480 | Identical scope (in-memory → Redis). #496 is the P0. |
| pnpm consistency in workflows | #584 | #305, #670, #744, #595 | Same root cause: `npm ci` / npm cache in workflows. |
| API router integration tests | #725 | #631, #551 | Overlapping: tests for k8s/customer/stripe routers. |
| Playwright E2E tests | #501 | #628, #724 | Same: E2E coverage for critical flows. |
| Barrel exports audit | #523 | #687 | Same: barrel exports / tree-shaking. |
| API documentation generation | #731 | #749 | Same: auto-generate API docs from tRPC. |
| Frontend bundle / code splitting | #753 | #723 | #723 states the problem, #753 the implementation. |
| Middleware / authorization | #721 | #688 | Both about middleware-level request handling/authz. |
| Testing infrastructure umbrella | #581 | #550 | #550 is a sub-item of #581. |

---

## STEP 4 — Repair Mode Findings

### Selection

Per the selection rule, the highest-priority issue should be repaired. **All P0/P1 issues were verified as already resolved in code** (see evidence below), so no P0/P1 repair was possible. The next-highest actionable cluster was the pnpm CI consistency issues (#305/#584/#595/#670/#744, P2/P3).

### Attempted repair: pnpm consistency in `iterate.yml` — BLOCKED

A minimal, atomic patch was prepared and committed locally (branch `fix/ci-pnpm-consistency-iterate`, commit `818b06c`), but the push was **rejected**:

```
refusing to allow a GitHub App to create or update workflow
`.github/workflows/iterate.yml` without `workflows` permission
```

**The patch** (ready to apply by a maintainer with `workflows: write`):

```diff
--- a/.github/workflows/iterate.yml
+++ b/.github/workflows/iterate.yml
@@ cache step (Architect job):
-            ~/.npm
-          key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
+            ~/.local/share/pnpm/store
+          key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1
@@ install steps (Architect job line ~68 and Fixer job line ~337):
+      - uses: pnpm/action-setup@v6
+        with:
+          run_install: false
+
       - uses: actions/setup-node@v7
         with:
           node-version: "20"
+          cache: "pnpm"
 
-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
```

This mirrors the proven pattern already used in `on-pull.yml` (pnpm/action-setup@v6 + setup-node cache `pnpm`). YAML validated; zero remaining npm references.

### No other repair target exists

After verifying every open issue, no genuinely-open, non-blocked, repair-scope issue remains. All remaining open issues are either resolved-in-code (below), blocked by token permissions (workflow files), or Phase 2/3 feature/hardening scope.

---

## Resolved-but-open Issues — Evidence Table

Verified this loop against `main` (commit `76d6ad2`). These issues can be safely closed.

| Issue | Title | Evidence (file / command) |
|-------|-------|---------------------------|
| #496 | Replace in-memory rate limiter with Redis (P0) | `packages/api/src/distributed-rate-limiter.ts` (DistributedRateLimiter, sliding window, ioredis, in-memory fallback); `trpc.ts` uses `getLimiter(...).checkAsync(...)`; `ioredis@5.6.1` in deps; tests `distributed-rate-limiter*.test.ts` |
| #480 | Same as #496 (duplicate) | Same evidence |
| #786 | Stripe webhook logs partial secret | `packages/stripe/src/client.ts` only references the env var *name* in a setup error; `webhooks.ts` logs event type/error, never the secret value |
| #722 | Env var validation at startup | `packages/common/src/config/env-validation.test.ts` + `env.ts` |
| #721 | Explicit authorization checks | `packages/api/src/authorization.ts` + `authorization.test.ts` |
| #632 | Audit error logging for sensitive data | `packages/api/src/sensitive-data-logging.test.ts` |
| #725 | Integration tests for API routers | `packages/api/src/router/integration.test.ts` |
| #515 | CSRF protection | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts`, wired in `apps/nextjs/src/app/api/trpc/edge/[trpc]/route.ts` |
| #500 | Clerk authentication flow tests | `apps/nextjs/src/utils/clerk.test.ts` |
| #498 | Replace email RBAC with role-based | `packages/api/src/rbac.ts` + `rbac.test.ts` |
| #501 | Playwright E2E critical journeys | `tests/e2e/` (pricing, subscription-workflows, webhook-error-handling specs) |
| #549 | Tests for packages/auth (0% coverage) | `packages/auth/clerk.test.ts` + `env.test.ts` |
| #550 | Include apps/nextjs in coverage | `vitest.config.ts` coverage `include` has `apps/nextjs/src/**` |
| #748 | Invalid .nvmrc value | `.nvmrc` now `22.14.0` |
| #785 | Duplicate next dependency in stripe | `packages/stripe/package.json` has 0 `next` deps |
| #789 | peerDependencies for React in ui | `packages/ui/package.json` peerDeps: `react ^19.0.0`, `react-dom ^19.0.0`, `next >=14.0.0` |
| #787 | Unit tests for db migrations/schema | `packages/db/*.test.ts` (db-instance, soft-delete, user-deletion, rls-middleware, logger) |
| #713 | Unit tests for packages/common | `packages/common/src/**/*.test.ts` (observability, config/urls, headers, cache, ui, ...) |
| #708 | Bundle analyzer | `apps/nextjs/next.config.mjs` uses `withBundleAnalyzer` |
| #706 | VS Code Dev Containers | `devcontainer.json` (repo root) |
| #705 | Docker configuration | `Dockerfile` + `docker-compose.yml` |
| #666 | Global error boundary | `apps/nextjs/src/app/error.tsx` + `global-error.tsx` |
| #492 | Proper sizes attribute for images | Components use `sizes=` (blog-posts, site-footer, sign-in-modal-clerk) |
| #580 | Monitoring/logging infrastructure | `packages/api/src/logger.ts` (pino) + `request-id.ts` |
| #579 | Improve environment setup errors | `packages/common/src/config/env.ts` (t3-env with clear messages) |
| #749 | AI API testing/docs generator | `packages/api/src/docs-generator.ts` |
| #688 | Next.js middleware.ts | `apps/nextjs/src/proxy.ts` (Next 16 middleware: request-id, CSP headers, CSRF, clerk) |
| #611 | not-found.tsx custom 404 | `apps/nextjs/src/app/not-found.tsx` |
| #719 | Root-level TypeScript config | `tsconfig.json` (root) |
| #630 | Pre-commit hooks with typecheck/test | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged` |
| #684 | Root build script + turbo pipelines | `turbo.json` tasks: topo, build, dev, format, lint, typecheck, size:check, size:analyze |
| #613 | Duplicate GitHub Actions workflow | `.github/workflows/` contains exactly 2 files |
| #578 | Duplicate health check endpoint | No health endpoint in `packages/api/src/router/` |
| #664 | Replace console.* with pino in db/stripe | Only JSDoc comment examples remain; no live `console.*` calls |
| #663 | Consolidate eslint-disable comments | 5 remaining (from 19+); mostly consolidated |
| #631 | API router tests (k8s, customer, stripe) | `packages/api/src/router/{k8s,customer,stripe}-router.test.ts` |
| #628 | E2E testing with Playwright | `tests/e2e/` + `@playwright/test` in root deps |
| #724 | Missing e2e coverage for critical flows | `tests/e2e/` specs cover pricing, subscriptions, webhooks |
| #635 | Developer onboarding guide | `docs/ONBOARDING.md` (linked from README) |
| #610 | Standardize tRPC response format | `packages/api/src/response.ts` + `errors.ts` |
| #697 | Corrupted text formatting in docs | Full mojibake scan (`Ã`/`â€`/`ï¿½`/U+FFFD) across docs/ = zero matches |
| #752 | Unified CLI output utilities | `tooling/qa/cli-output.js` |
| #729 | Bundle size regression testing | `turbo.json` `size:check` task |
| #731 | Auto-generate API docs from tRPC | `packages/api/src/openapi.ts` + `docs-generator.ts` |
| #551 | Tests for k8s router | `packages/api/src/router/k8s-router.test.ts` |
| #581 | Consolidate testing infrastructure | `vitest.config.ts` (coverage, setup) + turbo tasks |
| #754 | Stripe webhook idempotency tests | `packages/stripe/src/webhook-idempotency.test.ts` |
| #755 | Composite index for subscription queries | `packages/db/prisma/schema.prisma` `@@index([authUserId, plan, stripeCurrentPeriodEnd])` etc. |
| #788 | Unit tests for critical UI components | `apps/nextjs/src/components/__tests__/*.test.tsx` (cluster-config, navbar, user-avatar, ...) |

---

## Blocked by token permissions (cannot be fixed with current token)

| Issue | Title | Blocker |
|-------|-------|---------|
| #305, #584, #595, #670, #744 | pnpm consistency in workflows | `workflows: write` missing — patch prepared above |
| #522 | Vercel deployment workflow | `workflows: write` missing |
| #502 | Fast-path CI workflow | `workflows: write` missing |
| #728 | Security scanning workflows | `workflows: write` missing |
| #726 | Dependency consistency checking to CI | `workflows: write` missing |
| #488 | Circular dependency detection to CI | `workflows: write` missing (branch `dx/add-circular-dependency-detection` exists, unmerged) |
| #650 | Extract AI prompts from on-pull.yml | `workflows: write` missing |

## Phase 2/3 scope (feature/hardening — not repair items)

#753, #751, #723, #668, #636, #685, #521, #494, #487, #486, #485, #483, #590, #634, #667, #503, #727, #687, #720 (see note below)

> Note on #720: `.nvmrc` exists with a valid value (`22.14.0`), so the "Missing .nvmrc" part is resolved; the issue may be closable.

---

## Recommended Actions for Maintainer (with write access)

1. **Batch-close the ~50 resolved issues** listed in the evidence table (add a closing comment referencing this report).
2. **Apply the label normalization matrix** (STEP 1) — 39 issues.
3. **Close/consolidate the 9 duplicate clusters** (STEP 2/3) — 13 issues.
4. **Apply the pnpm patch** to `iterate.yml` (STEP 4) — resolves 5 issues.
5. **Grant the automation token `issues: write` and `workflows: write`** (or use a PAT) so future loops can perform these actions directly.

## Final State

- **State**: `waiting for human review`
- **Reason**: All repair-scope work is either already done (issues resolved in code) or blocked by token permissions (`issues: write`, `workflows: write`).
- **No destructive actions taken. No branches deleted. No issues modified.**