# Issue Manager Audit Report — 2026-08-14 (Loop 112)

**Date**: 2026-08-14T03:32:04Z
**Mode**: ISSUE MANAGER MODE (Phase 0: no open PRs, 70+ open issues)
**Branch**: `main` @ `32b7a81`

---

## Decision Summary

Phase 0 entry decision: **No open PRs** → **Open issues exist** → entered **ISSUE MANAGER MODE**.

70+ open issues were analyzed for label normalization, duplicates, consolidation candidates, and
resolution status against the current `main` branch code.

---

## Action Log

| Timestamp (UTC)  | Action                            | Target                                                              | Result                                                                                          |
| ---------------- | --------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 2026-08-14T03:17 | Phase 0 triage                    | repo                                                                | No open PRs; 70+ open issues → ISSUE MANAGER MODE                                               |
| 2026-08-14T03:19 | Resolution audit                  | 40+ issues                                                          | Verified code-level resolution status against `main`                                            |
| 2026-08-14T03:20 | Label normalization attempt       | all open issues                                                     | **BLOCKED** — token lacks `issues: write` (GraphQL 403 on addLabelsToLabelable)                 |
| 2026-08-14T03:20 | Duplicate/comment closure attempt | #480, #628, #724, #584, #595, #670, #744                            | **BLOCKED** — token lacks comment/close permissions                                             |
| 2026-08-14T03:21 | Workflow fix attempt (#305)       | `.github/workflows/iterate.yml`                                     | **BLOCKED** — token lacks `workflows` permission (push rejected)                                |
| 2026-08-14T03:25 | Baseline verification             | repo                                                                | `pnpm test` 2079 passed; `pnpm lint` 9/9; `pnpm typecheck` 9/9                                  |
| 2026-08-14T03:28 | REPAIR MODE fix (#579)            | `scripts/check-package-manager.js`, `package.json`, `.eslintignore` | Implemented preinstall pnpm guard; verified npm-path fails with clear message, pnpm-path passes |
| 2026-08-14T03:30 | Verification                      | repo                                                                | lint/typecheck/tests all green after fix                                                        |
| 2026-08-14T03:31 | PR created                        | `fix/pnpm-guard-preinstall-579`                                     | **PR #1263** opened against `main`                                                              |

---

## Findings

### 1. Issues already resolved in code (stale — candidates for closure)

Verified against `main` (evidence in parentheses):

| Issue              | Title                                     | Evidence of resolution                                                                         |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| #496 (P0)          | Replace in-memory rate limiter with Redis | `packages/api/src/distributed-rate-limiter.ts`, `ioredis` dep, tests; merged PRs #1232, #1198  |
| #480 (P1)          | Replace rate limiter with Redis           | Duplicate of #496 — same implementation                                                        |
| #786 (P1)          | Stripe webhook logs partial secret        | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` uses non-secret identifier; merged PR #1001 |
| #785 (P1)          | Duplicate `next` in packages/stripe       | `packages/stripe/package.json` has 0 duplicate `next` entries                                  |
| #789 (P3)          | peerDependencies for React in packages/ui | `packages/ui/package.json` has `peerDependencies` with react/react-dom ^19                     |
| #748 / #720        | .nvmrc issues                             | `.nvmrc` = `22.14.0` (merged PR #758)                                                          |
| #719               | Missing root tsconfig                     | `tsconfig.json` exists                                                                         |
| #722               | Env validation at startup                 | `apps/nextjs/src/env.mjs` + `packages/common/src/env.mjs` use `@t3-oss/env-nextjs`             |
| #721               | Explicit authorization checks             | `packages/api/src/authorization.ts`, `rbac.ts` + tests                                         |
| #632               | Sensitive data logging audit              | `packages/api/src/sensitive-data-logging.test.ts`, logger redaction                            |
| #713               | packages/common tests                     | 6 test files exist (animation, email, icon-sizes, logger, subscriptions, ui-tokens)            |
| #725               | API router integration tests              | 10 test files in `packages/api/src/router/`                                                    |
| #731               | Auto-generate API docs                    | `packages/api/src/openapi.ts` + `apps/nextjs/src/app/api/docs/route.ts`                        |
| #498 (P1)          | RBAC                                      | `packages/api/src/rbac.ts` + `rbac.test.ts`                                                    |
| #500 / #549 / #551 | auth/k8s tests                            | `router/auth.test.ts`, `packages/auth/clerk.test.ts`, `k8s-router.test.ts`                     |
| #488               | Circular dependency detection             | `check:circular` (madge) in package.json                                                       |
| #487               | Redis application caching                 | merged PR #1165 (`feat/cache`)                                                                 |
| #515 (P1)          | CSRF protection                           | `apps/nextjs/src/lib/csrf.test.ts`, trpc integration                                           |
| #754 (P1)          | Webhook idempotency tests                 | `packages/stripe/src/webhook-idempotency.test.ts` — 21 tests covering all ACs                  |
| #755               | Composite index                           | `@@index([authUserId, plan, stripeCurrentPeriodEnd])` in schema.prisma                         |
| #609               | Duplicate Zod schemas                     | `router/schemas.ts` centralized; k8s.ts imports from it                                        |
| #687               | Missing barrel exports                    | `packages/ui/src/index.ts`, `packages/api/src/index.ts` exist                                  |
| #630               | Pre-commit hooks                          | `.husky/pre-commit` runs typecheck + test                                                      |
| #634               | TS strictness                             | `tooling/typescript-config/base.json` has `strict: true`                                       |
| #664               | console.\* → pino in db/stripe            | pino in packages/db; remaining console.\* are JSDoc comments only                              |
| #697               | Corrupted docs                            | merged PR #1219 removed HW corruption artifact                                                 |
| #788               | UI component tests                        | navbar/modal/cluster tests exist in `apps/nextjs/src/components/__tests__/`                    |

### 2. Duplicate clusters (candidates for consolidation)

| Cluster                          | Issues                       | Canonical |
| -------------------------------- | ---------------------------- | --------- |
| Redis rate limiter               | #496, #480                   | #496 (P0) |
| pnpm consistency in CI workflows | #305, #584, #595, #670, #744 | #305      |
| Playwright E2E tests             | #501, #628, #724             | #501 (P1) |
| .nvmrc                           | #720, #748                   | #748      |

### 3. Label normalization required (blocked by token)

~35 open issues are missing priority labels (P0–P3) and/or category labels
(bug/enhancement/feature/docs/refactor/chore/test/ci/security). Examples:

- Missing priority: #789, #788, #787, #786, #785, #731, #729, #728, #727, #726, #725, #724, #723,
  #722, #721, #720, #719, #713, #668, #636, #635, #634, #632, #631, #630, #628, #584, #305
- Missing category (specialist-only labels): #755, #754, #753, #752, #751, #749, #748, #744, #697,
  #595, #670

**Recommended mapping** (for a token with `issues: write`):

- #786 → security + P1; #785 → bug + P1; #788/#787 → test + P2; #789 → enhancement + P3
- #754 → test + P1; #755 → enhancement + P3; #753/#752/#751 → enhancement + P2
- #749 → feature + P2; #748 → bug + P2; #744 → ci + P2; #697 → docs + P2; #595 → ci + P2; #670 → ci + P3

### 4. Genuinely open issues (repair candidates)

- **#305 cluster** (pnpm in iterate.yml) — **confirmed broken**: `iterate.yml` still uses `npm ci`,
  `package-lock.json` cache key, and `~/.npm` cache path in a pnpm monorepo (no package-lock.json
  exists). Fix was prepared but **push blocked** by missing `workflows` permission.
- **#579** (env setup error messages) — **fixed this loop** via preinstall guard (PR #1263).
- #753/#751/#723 (code splitting) — partially addressed (dashboard lazy-loads K8sCreateButton).
- #636 (ISR caching) — intentionally not used for user-scoped dashboard data (documented in code).

---

## Blocked Actions (FAIL-SAFE)

The `GITHUB_TOKEN` in this run is a fine-grained PAT with **Contents: write, Issues: read-only,
no workflows permission**. The following ISSUE MANAGER actions could not be executed:

1. **Label normalization** (addLabelsToLabelable → GraphQL 403)
2. **Commenting/closing duplicate or stale issues** (addComment → 403)
3. **Workflow file changes** (#305 iterate.yml fix → push rejected: "refusing to allow a GitHub App
   to create or update workflow ... without workflows permission")

These require a token with `issues: write` and `workflows: write`. No destructive action was taken.

---

## Final State

**Status**: `waiting for human review` — PR #1263 open for review; issue-label/closure work and the
#305 workflow fix require elevated token permissions.
