# Issue Manager Audit Report — 2026-08-14 (Loop 113)

**Date**: 2026-08-14T05:30:00Z
**Mode**: PR HANDLER MODE → ISSUE MANAGER MODE
**Branch**: `main` @ `e982b31` (after rebase of #1263)

---

## Decision Summary

Phase 0 entry decision: **2 open PRs detected** → entered **PR HANDLER MODE**.
Both PRs processed and merged. After PR handling, re-entered Phase 0: no open PRs,
70+ open issues → **ISSUE MANAGER MODE**.

---

## PR HANDLER MODE — Action Log

| Timestamp (UTC)  | Action                  | Target                                        | Result                                                                                               |
| ---------------- | ----------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 2026-08-14T05:25 | Triage open PRs         | #1264 (docs), #1263 (fix/dx)                  | Latest = #1264, processed first                                                                      |
| 2026-08-14T05:26 | Verify #1264            | `docs/issue-manager-audit-2026-08-14-loop112` | Docs-only; lint 9/9, typecheck 9/9, tests 2079, build OK; Vercel failure = rate-limit (pre-existing) |
| 2026-08-14T05:26 | **Merge #1264**         | `docs/issue-manager-audit-2026-08-14-loop112` | Merged (squash, `a86dee5`); branch deleted                                                           |
| 2026-08-14T05:26 | Rebase #1263 onto main  | `fix/pnpm-guard-preinstall-579`               | Rebased cleanly onto latest main (included #1264 merge); pushed                                      |
| 2026-08-14T05:27 | Verify #1263            | `scripts/check-package-manager.js` etc.       | lint 9/9, typecheck 9/9, tests 2079, build OK; preinstall guard verified (pnpm→0, npm→1)             |
| 2026-08-14T05:27 | **Merge #1263**         | `fix/pnpm-guard-preinstall-579`               | Merged (squash, `bf25da09`); branch deleted; fixes issue #579                                        |
| 2026-08-14T05:27 | Close linked issue #579 | issue #579                                    | **BLOCKED** — token lacks `issues: write` (closeIssue → 403)                                         |

**Vercel check note**: Both PRs show a failing Vercel deployment check, but it is
`Deployment rate limited — retry in 24 hours` (project-level build rate limit),
identical to recently merged PRs #1260/#1261/#1262. Not a code regression.

---

## ISSUE MANAGER MODE — Findings

### Verified resolved in code (against `main` after this loop's merges)

Re-confirmed from loop-112 audit + this loop's code verification:

| Issue | Title                             | Evidence of resolution                                                      |
| ----- | --------------------------------- | --------------------------------------------------------------------------- |
| #496  | Redis rate limiter (P0)           | `packages/api/src/distributed-rate-limiter.ts` + tests                      |
| #480  | Redis rate limiter dup (P1)       | Same implementation as #496                                                 |
| #498  | RBAC (P1)                         | `packages/api/src/rbac.ts` + tests                                          |
| #515  | CSRF (P1)                         | `apps/nextjs/src/proxy.ts` CSRF origin validation + tests                   |
| #501  | Playwright E2E (P1)               | 12 spec files in `tests/e2e/` on main + `playwright.config.ts`              |
| #500  | Clerk auth tests (P1)             | `router/auth.test.ts`, `packages/auth/clerk.test.ts`                        |
| #549  | packages/auth tests (P1)          | `packages/auth/clerk.test.ts`                                               |
| #550  | apps/nextjs coverage (P1)         | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}`                 |
| #551  | k8s router tests (P1)             | `router/k8s-router.test.ts`, `k8s.test.ts`                                  |
| #581  | Consolidate testing infra (P1)    | All 5 sub-issues (#549/#550/#551/#500/#501) verified resolved               |
| #578  | Duplicate health check (P3)       | `packages/api/src/router/health_check.ts` no longer exists                  |
| #666  | Global error boundary (P2)        | `global-error.tsx` + 5 `error.tsx` route boundaries                         |
| #613  | Duplicate workflow (P2)           | `paratterate.yml` no longer exists                                          |
| #683  | ESLint/Prettier config (P2)       | Root `.eslintrc.cjs` extends `tooling/eslint-config/base.js`                |
| #492  | Image sizes attribute (P3)        | All `<Image>` components verified with `sizes`                              |
| #486  | OpenTelemetry (P2)                | `packages/common/src/observability/index.ts` + `instrumentation.ts`         |
| #580  | Sentry/observability (P2)         | `instrumentation.ts` initializes Sentry when `SENTRY_DSN` set               |
| #688  | middleware.ts (P2)                | `apps/nextjs/src/proxy.ts` (Next.js 16 middleware) with CSRF + headers      |
| #705  | Docker config (P2)                | `Dockerfile` + `docker-compose.yml` exist                                   |
| #706  | Dev Containers (P3)               | `.devcontainer/devcontainer.json` exists                                    |
| #708  | Bundle analyzer (P3)              | `@next/bundle-analyzer` + `build:analyze` script                            |
| #635  | Onboarding guide (docs)           | `docs/ONBOARDING.md` exists                                                 |
| #503  | JSDoc on routers (P2)             | All routers (k8s/stripe/customer/admin/auth/hello) have JSDoc               |
| #663  | eslint-disable consolidation (P2) | Reduced to ~11 justified non-test instances (was 34)                        |
| #684  | Root build script (P3)            | Root `package.json` has `build`/`dev`/`lint`/`test` scripts                 |
| #752  | Unified CLI/logging utils (DX)    | `packages/common/src/logger.ts` (pino); remaining `console.*` only in JSDoc |
| #685  | React perf optimizations (P2)     | `React.memo`/`useCallback` across ui components (PRs #1034/#690/#700)       |
| #485  | Suspense boundaries (P2)          | Dashboard + pricing pages use `Suspense` + lazy-loaded heavy components     |
| #787  | db migrations/schema tests        | `migrations.test.ts`, `seed.test.ts`, `db-instance.test.ts` etc.            |
| #636  | ISR caching (innovation)          | Intentionally not used — `force-dynamic` for user-scoped data (documented)  |
| #483  | Transaction handling (P2)         | Webhooks use `db.transaction()`; remaining cases are single-table ops       |
| #723  | Client component bloat            | Dashboard lazy-loads `K8sCreateButton`, `ClusterOperations` (dynamic)       |
| #753  | Route-based code splitting        | `next/dynamic` + Suspense in dashboard, pricing                             |

### Genuinely open issue (repair candidates)

| Issue | Title                      | Status                                                                                                                                                                                                                                                                                |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #305  | pnpm in workflows (P1, ci) | **Confirmed still broken** — `iterate.yml` uses `npm ci`, `package-lock.json` cache key, `~/.npm` cache in a pnpm monorepo. Fix **BLOCKED**: push of `.github/workflows/` rejected ("refusing to allow a GitHub App to create or update workflow ... without `workflows` permission") |

### Blocked actions (token permissions, FAIL-SAFE)

Confirmed this loop by direct API calls:

1. **Close issue #579** (fixed by merged PR #1263) → `closeIssue` 403
2. **Comment on issues** → `addComment` 403
3. **Label normalization** → `addLabelsToLabelable` 403
4. **Create issues** → `createIssue` 403
5. **Fix #305 (iterate.yml pnpm)** → push rejected, no `workflows` permission

These require a token with `issues: write` and `workflows: write`. No destructive
action was taken; no guesses were made.

---

## Final State

**Status**: `waiting for human review` — PR #1263 (pnpm preinstall guard, fixes #579)
merged this loop. Issue #579 and stale resolved issues remain open because the token
lacks `issues: write`. Issue #305 fix requires a token with `workflows: write`.
