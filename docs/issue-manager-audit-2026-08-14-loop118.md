# Issue Manager Audit Report — 2026-08-14 (Loop 118)

**Date**: 2026-08-14T12:50:00Z
**Mode**: ISSUE MANAGER MODE (Phase 0: 0 open PRs; 82 open issues)
**Branch**: `main` @ `b725f85`

---

## Decision Summary

Phase 0 entry decision: **0 open PRs** → entered **ISSUE MANAGER MODE** directly (82 open issues).

ISSUE MANAGER MODE executed:

- **STEP 1 (normalization)**: label audit for all 82 open issues. **38 issues missing priority
  labels, 12 missing category labels** — application remains **BLOCKED** (token lacks `issues:
write`; verified this loop: `gh issue edit --add-label` → 403 `addLabelsToLabelable`, REST
  `PATCH /issues/{n}` → 403 too).
- **STEP 2 (dedupe)**: duplicate clusters re-validated (pnpm CI, E2E testing, router tests, tRPC
  docs, Redis rate limiter) — closing **BLOCKED** (403 `closeIssue`).
- **STEP 3 (consolidation)**: candidate consolidations re-validated — **BLOCKED**.
- **STEP 4 (repair)**: verified **all P0/P1/P2 issues are resolved in code** on `main`. The last
  genuinely-open P1 (#501) had its docs component fixed in loop 117 (PR #1273); its remaining
  criterion (deploy `.github/workflows/e2e.yml`) is **BLOCKED by missing `workflows` permission**
  — re-verified this loop with a real push attempt (remote rejected the workflow file creation).
  No code-level repair target remains within token scope.

---

## Action Log

| Timestamp (UTC)  | Action                               | Target                                                | Result                                                                                           |
| ---------------- | ------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 2026-08-14T12:30 | Phase 0 decision                     | 0 open PRs / 82 open issues                           | ISSUE MANAGER MODE                                                                               |
| 2026-08-14T12:31 | Permission probe                     | `gh issue edit --add-label` (39 issues)               | 403 `addLabelsToLabelable` → issue label surface BLOCKED                                         |
| 2026-08-14T12:31 | REST probe                           | `PATCH /repos/cpa03/basefly/issues/496`               | 403 → REST path also blocked                                                                     |
| 2026-08-14T12:32 | Capability mapping                   | write ops via token                                   | Push branches + PR create/comment OK; labels/comments/close/create on issues BLOCKED             |
| 2026-08-14T12:33 | STEP 1 normalization audit           | 82 issues                                             | 38 missing priority, 12 missing category (list below); apply BLOCKED                             |
| 2026-08-14T12:36 | Full verification suite              | `main` @ b725f85                                      | typecheck 9/9, lint 9/9 zero-warnings, **139 files / 2085 tests passing**                        |
| 2026-08-14T12:38 | P0/P1/P2 genuinely-open verification | 10 P0/P1 + 27 P2 issues vs `main` code                | **All verified resolved in code** (evidence table below)                                         |
| 2026-08-14T12:41 | #501 last criterion probe            | push `.github/workflows/e2e.yml` on test branch       | **Rejected**: "refusing to allow a GitHub App to create workflow without `workflows` permission" |
| 2026-08-14T12:42 | Cleanup                              | test branches (`test-pr-perm`, `test-workflows-perm`) | Deleted locally; remote branches never created                                                   |
| 2026-08-14T12:50 | STEP 4 conclusion                    | repair survey                                         | No actionable code repair remains within token scope → report only                               |

---

## STEP 1 — Issue Normalization Plan (BLOCKED)

### Missing Labels (as of this loop)

| Category         | Count | Notes                                                            |
| ---------------- | ----- | ---------------------------------------------------------------- |
| Missing priority | 38    | Proposed: 21×P2, 8×P1, 6×P3, 3×P0 (per severity analysis)        |
| Missing category | 12    | Proposed: docs/ci/test/enhancement/bug mapping per issue content |

Issues missing **priority** (38): #305, #584, #595, #628, #630, #631, #632, #634, #635, #636,
#668, #697, #713, #719, #720, #721, #722, #723, #724, #725, #726, #727, #728, #729, #731, #744,
#748, #749, #751, #752, #753, #754, #755, #785, #786, #787, #788, #789.

Issues missing **category** (12): #595 (→ci), #635 (→docs), #670 (→ci), #697 (→docs), #744 (→ci),
#748 (→bug), #749 (→enhancement), #751 (→enhancement), #752 (→enhancement), #753 (→enhancement),
#754 (→test), #755 (→enhancement).

> Application requires a token with `issues: write`. Unchanged from loops 113–117.

---

## STEP 2 — Duplicate Clusters Identified (BLOCKED)

| Cluster              | Issues                       | Recommendation                                                 |
| -------------------- | ---------------------------- | -------------------------------------------------------------- |
| pnpm CI migration    | #305, #584, #595, #670, #744 | Keep #670 (canonical), close rest                              |
| E2E testing strategy | #501, #628, #724             | Consolidate into #501 (suite now exists; #628/#724 superseded) |
| API router tests     | #631, #725                   | Consolidate into #631                                          |
| tRPC docs            | #731, #749                   | Consolidate into #731                                          |
| Redis rate limiter   | #480 (dup of #496)           | Close #480 (P0 already fixed)                                  |

---

## STEP 4 — Repair Mode Survey: All P0/P1/P2 Verified Resolved

### P0/P1 Issues (10)

| Issue | Title (abbrev)                | Evidence in `main`                                                                           |
| ----- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| #496  | Redis rate limiter P0         | `distributed-rate-limiter.ts` + 3 test suites (96 tests) all passing                         |
| #480  | In-memory rate limiter        | Duplicate of #496; distributed limiter deployed                                              |
| #498  | RBAC role checks              | `role` enum in schema.prisma; `requireRole`/`createRoleBasedProcedure`; `rbac.test.ts`       |
| #500  | Clerk auth flow tests         | `packages/auth/clerk.test.ts` (251 lines), `env.test.ts`; **auth pkg coverage 90%**          |
| #501  | Playwright E2E tests          | 12 spec files in `tests/e2e/`; docs fixed loop 117; CI activation BLOCKED (`workflows` perm) |
| #515  | CSRF protection               | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts`; tRPC `csrfProtection` middleware             |
| #549  | Auth module tests             | `packages/auth/clerk.test.ts`, `env.test.ts` (PRs #912, #1096)                               |
| #550  | Coverage includes apps/nextjs | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}` + 14 component test files        |
| #551  | k8s router tests              | `packages/api/src/router/k8s-router.test.ts` (24 tests), `k8s.test.ts`                       |
| #581  | Testing consolidation         | Constituent issues (#549/#550/#551/#500/#501) all resolved individually                      |

### P2 Issues Verified Resolved (representative sample of 27)

| Issue | Title (abbrev)              | Evidence in `main`                                                             |
| ----- | --------------------------- | ------------------------------------------------------------------------------ |
| #483  | DB transactions             | `db.transaction()` in webhooks / user-deletion / seed                          |
| #485  | Suspense boundaries         | Dashboard + pricing pages wrap data components in `<Suspense>`                 |
| #486  | OpenTelemetry               | `tracing` middleware in `trpc.ts` (@opentelemetry/api)                         |
| #488  | Circular dependency check   | `pnpm check:circular` exits 0 (madge)                                          |
| #502  | Fast-path CI workflow       | Template `docs/ci/workflows/quick-check.yml` (loop 116)                        |
| #503  | JSDoc on routers            | Full JSDoc on k8s.ts (4/4 procedures), stripe.ts, customer.ts                  |
| #579  | Env setup error messages    | `scripts/check-package-manager.js` preinstall guard (#1263)                    |
| #580  | Observability               | `packages/common/src/observability/`                                           |
| #609  | Duplicate Zod schemas       | `router/schemas.ts` is single source; routers import `enhanced*`               |
| #610  | tRPC response contract      | `packages/api/src/response.ts` (PR #1268)                                      |
| #613  | Duplicate workflow          | `.github/workflows/` contains only iterate.yml + on-pull.yml                   |
| #664  | console.\* → pino           | Zero non-comment `console.*` in packages/ + apps/nextjs/src                    |
| #683  | ESLint config consistency   | All packages extend `@saasfly/eslint-config/base`; lint 9/9 clean              |
| #685  | React performance           | memo/useMemo/useCallback across 20+ UI components; dynamic imports             |
| #688  | middleware security headers | Superseded by `proxy.ts` (#981); branch not merged (intentional)               |
| #705  | Docker config               | `Dockerfile` + `docker-compose.yml` present                                    |
| #719  | Root tsconfig               | File exists at repo root                                                       |
| #720  | Node version pin            | `.nvmrc` = `22.14.0`                                                           |
| #722  | Env validation              | `tooling/qa/env-validate.js` (CI mode)                                         |
| #723  | Client components           | Only 7 `"use client"` app files; heavy components code-split                   |
| #728  | Security scanning           | `security-audit.yml` + `codeql-analysis.yml` templates in `docs/ci/workflows/` |
| #729  | Bundle size regression      | `size:check` + `size:analyze` scripts (turbo)                                  |
| #755  | Composite DB indexes        | `@@index([plan, stripeCurrentPeriodEnd])` etc. in schema.prisma                |
| #785  | Stripe duplicate next       | `packages/stripe/package.json` has no `next` entry                             |
| #786  | Webhook secret logging      | Webhook route logs only non-secret identifier; no `slice(-8)`                  |
| #789  | React peerDependencies      | `react`/`react-dom` now in `peerDependencies` of packages/ui                   |
| #697  | Corrupted docs formatting   | Mojibake scan across docs/ = zero real matches (only self-references)          |

### Newly-verified this loop (not in loop-117 table)

- **#785 / #786 / #789** (created 2026-02-27): all three verified resolved in `main`.
- **#503 JSDoc**: k8s.ts has complete JSDoc on all 4 procedures (verified line-by-line).
- **#485 Suspense**: dashboard + pricing pages verified wrapping in `<Suspense>` with skeleton fallbacks.
- **#664 console→pino**: verified zero live `console.*` calls in production source.

---

## STEP 4 — Selection Rationale

The state machine requires selecting the highest-priority genuinely-open issue. This loop:

1. All P0/P1 issues verified resolved in code (table above).
2. The only partially-open P1 (#501) had its remaining code-adjacent work (docs) completed in loop 117. Its final criterion — deploying the E2E workflow — was **re-block-verified** this loop via
   an actual push attempt to `.github/workflows/e2e.yml`, which GitHub rejected with
   "refusing to allow a GitHub App to create or update workflow ... without `workflows` permission".
3. Therefore **no code-level repair target remains** within token scope. Consistent with loops
   74–75 conclusion and the loop-116/117 pattern of shipping templates/reports when blocked.

---

## Blockers (recurring)

1. **No `issues: write`** — normalization (STEP 1), dedupe/close (STEP 2/3) must ship as reports.
   Re-verified this loop via both GraphQL (`addLabelsToLabelable`) and REST (`PATCH /issues/{n}`).
2. **No `workflows` permission** — CI workflow fixes must ship as templates in `docs/ci/`;
   deployment requires a maintainer token. Re-verified this loop with a real push rejection.
3. **Vercel preview deployment fails for all PRs** (pre-existing project config issue; does not
   block docs-only merges — #1271/#1272/#1273 all merged with the same Vercel failure).

Both issue-level blockers are inherent to the GitHub App installation token used by this
automation; resolution requires a token with the missing scopes.
