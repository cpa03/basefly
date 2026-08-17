# Issue Manager Audit Report — 2026-08-14 (Loop 117)

**Date**: 2026-08-14T11:45:00Z
**Mode**: ISSUE MANAGER MODE (Phase 0: 0 open PRs; 82 open issues)
**Branch**: `main` @ `0977675`

---

## Decision Summary

Phase 0 entry decision: **0 open PRs** → entered **ISSUE MANAGER MODE** directly (82 open issues).

ISSUE MANAGER MODE executed:

- **STEP 1 (normalization)**: label audit re-run for all 82 open issues. **39 issues still missing
  priority and/or category labels** — application remains **BLOCKED** (token lacks `issues: write`;
  verified again this loop: `gh issue edit --add-label` → 403 `addLabelsToLabelable`).
- **STEP 2 (dedupe)**: duplicate clusters re-validated (pnpm CI, E2E testing, router tests, tRPC
  docs, Redis rate limiter) — closing **BLOCKED** (same 403).
- **STEP 3 (consolidation)**: candidate consolidations re-validated — **BLOCKED**.
- **STEP 4 (repair)**: highest-priority genuinely-open issue = **#501 (P1, Playwright E2E)**.
  Verified the E2E suite exists (11 spec files / 73 tests) and the CI workflow template exists
  (`docs/ci/e2e-workflow.yml`), but `docs/test-coverage.md` still falsely claimed "not yet
  implemented" and asserted `.github/workflows/e2e.yml` was live. **Fixed the stale docs**
  → **PR #1273 merged** (docs accuracy portion of #501; CI activation still requires a maintainer
  with `workflows` permission).

---

## Action Log

| Timestamp (UTC)  | Action                                     | Target                                                | Result                                                                              |
| ---------------- | ------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-08-14T11:20 | Phase 0 decision                           | 0 open PRs / 82 open issues                           | ISSUE MANAGER MODE                                                                  |
| 2026-08-14T11:22 | Permission probe                           | `gh issue edit 748 --add-label`                       | 403 `addLabelsToLabelable` → issue label surface still BLOCKED                      |
| 2026-08-14T11:24 | STEP 1 normalization audit                 | 82 issues                                             | 39 issues missing priority/category labels (plan below); apply BLOCKED              |
| 2026-08-14T11:28 | P0/P1 genuinely-open verification           | 10 P0/P1 issues vs `main` code                        | 9 verified resolved; #501 partially open (docs stale)                                |
| 2026-08-14T11:32 | E2E suite verification                     | `tests/e2e/` + `docs/ci/e2e-workflow.yml`             | 11 spec files / 73 tests exist; CI template exists (loop 109) but not deployed      |
| 2026-08-14T11:35 | STEP 4 repair: #501 docs accuracy          | `docs/test-coverage.md`, `docs/e2e-testing.md`        | Stale claims corrected (pyramid, test-file table 7→11, CI integration status)        |
| 2026-08-14T11:38 | **Create PR #1273**                        | `fix/501-e2e-docs-accuracy` → `main`                  | OPEN, MERGEABLE, references "Issue #501"                                             |
| 2026-08-14T11:39 | **Merge PR #1273**                         | `main` @ `6053769`                                    | MERGED (pre-existing Vercel check failure on all docs PRs, not caused by this change) |
| 2026-08-14T11:40 | Branch cleanup                            | `fix/501-e2e-docs-accuracy`                           | Deleted local + remote after successful merge                                        |

---

## STEP 1 — Issue Normalization Plan (BLOCKED)

### Missing/Incorrect Labels (39 issues need action — unchanged from loop 116)

| Category          | Count | Notes                                                              |
| ----------------- | ----- | ------------------------------------------------------------------ |
| Missing priority  | 38    | Proposed: 21×P2, 8×P1, 6×P3, 3×P0 (per severity analysis)          |
| Missing category  | 12    | Proposed: backend-engineer (6), devops-engineer (3), ui-ux-engineer (2), frontend-engineer (1) |
| Priority overrides| 6     | #670→ci, #748→bug, #749→P3, #723/#785→P2, #721/#722/#728/#786/#632→P1 |

> Representative issues requiring labels (priority missing unless noted):
> #305 (no prio), #584 (no prio), #595 (no cat/prio), #628 (no prio), #630 (no prio),
> #631 (no prio), #632 (no prio), #634 (no prio), #635 (documentation→docs, no prio),
> #636 (no prio), #668 (no prio), #670 (no cat), #697 (technical-writer→docs, no prio),
> #713 (no prio), #719–#755 (no prio), #744 (no cat/prio), #748 (no cat/prio),
> #749–#755 (no cat/prio), #785 (bug, no prio), #786 (security, no prio),
> #787–#789 (no prio).

> Full per-issue label assignments are in the loop-116 report PR body (unchanged this loop).
> Application requires a token with `issues: write`.

---

## STEP 2 — Duplicate Clusters Identified (BLOCKED)

| Cluster               | Issues                                   | Recommendation                |
| --------------------- | ---------------------------------------- | ----------------------------- |
| pnpm CI migration     | #305, #584, #595, #670, #744             | Keep #670 (canonical), close rest |
| E2E testing strategy  | #501, #628, #724                         | Consolidate into #501 (suite now exists; #628/#724 superseded) |
| API router tests      | #631, #725                               | Consolidate into #631         |
| tRPC docs             | #731, #749                               | Consolidate into #731         |
| Redis rate limiter    | #480 (dup of #496)                       | Close #480 (P0 already fixed) |

---

## Verified-Resolved Issues (open but fixed in `main`; close BLOCKED)

| Issue | Title (abbrev)                     | Evidence in `main`                                                        |
| ----- | ---------------------------------- | ------------------------------------------------------------------------- |
| #496  | Redis rate limiter P0              | `distributed-rate-limiter.ts` + tests                                     |
| #480  | In-memory rate limiter             | Duplicate of #496; distributed limiter deployed                           |
| #498  | RBAC role checks                   | `packages/api/src/router/` role guards; `rbac.test.ts`                    |
| #500  | Clerk auth flow tests              | `packages/auth/clerk.test.ts`, `env.test.ts`                              |
| #515  | CSRF protection                    | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts`                            |
| #549  | Auth module tests                  | `packages/auth/clerk.test.ts`, `env.test.ts`                              |
| #550  | Coverage includes apps/nextjs      | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}`               |
| #551  | k8s router tests                   | `packages/api/src/router/k8s-router.test.ts`, `k8s.test.ts`               |
| #719  | Root tsconfig.json                 | File exists at repo root                                                  |
| #720  | Node version pin                   | `.nvmrc` = `22.14.0`                                                      |
| #748  | Node version mismatch              | `.nvmrc` = `22.14.0`; workflows use Node 22                               |
| #722  | Env validation CI                  | `tooling/qa/env-validate.js` (CI mode)                                    |
| #728  | Security scanning workflows        | `security-audit.yml` + `codeql-analysis.yml` templates in `docs/ci/workflows/` |
| #785  | Stripe next dependency             | `apps/nextjs/package.json` clean                                          |
| #613  | Remove paratterate.yml             | File absent from `.github/workflows/`                                     |
| #666  | Error handling / error.tsx         | 5 `error.tsx` boundary components                                         |
| #684  | Build script                       | root `build = pnpm env:validate && turbo build`                           |
| #755  | Composite DB indexes               | `@@index([plan, stripeCurrentPeriodEnd])` etc. in `schema.prisma`          |
| #483  | DB transactions                    | `db.transaction()` in webhooks / user-deletion / seed                     |
| #630  | Husky pre-commit                   | `.husky/pre-commit` present                                               |
| #713  | Test files added                   | 6 new test files                                                          |
| #578  | Duplicate health endpoint          | `packages/api/src/router/health_check.ts` removed                          |

---

## STEP 4 — Repair Mode

### Target: #501 — Playwright E2E tests (P1)

**Selection rationale**: the only genuinely-open P1 issue. All other P0/P1 issues verified resolved
in code (see table above). #501's acceptance criteria status:

| Criterion                    | Status                                              |
| ---------------------------- | --------------------------------------------------- |
| Playwright config            | ✅ `playwright.config.ts` exists                    |
| E2E tests auth flows         | ✅ 11 spec files / 73 tests (page-load + protection)|
| E2E tests subscription flow  | ✅ `billing.spec.ts`, `subscription-workflows.spec.ts`, `pricing.spec.ts` |
| E2E tests cluster management | ✅ `cluster.spec.ts` (protection + lifecycle routes)|
| CI integration for E2E       | ⚠️ Template exists (`docs/ci/e2e-workflow.yml`, loop 109); **not deployed** — blocked by `workflows` permission |
| Documentation for E2E        | ✅ `docs/e2e-testing.md` + `docs/test-coverage.md` (fixed this loop) |

**Deliverable** (PR #1273, MERGED):

- `docs/test-coverage.md`:
  - Test Pyramid entry corrected: "E2E tests: Minimal (not yet implemented)" → moderate, 11 spec files
  - Test Files table: 7 → all 11 spec files listed
  - Critical Flows Covered: 6 → 11 entries matching actual coverage
  - CI Integration: corrected false claim that `.github/workflows/e2e.yml` is live; documented it as a template pending activation (per #501)
- `docs/e2e-testing.md`: CI section now notes the workflow is not yet live until copied to `.github/workflows/e2e.yml` by a maintainer with `workflows` permission

**Remaining for #501** (requires human action): copy `docs/ci/e2e-workflow.yml` →
`.github/workflows/e2e.yml` with a token that has `workflows` permission. Optional future work:
authenticated interaction-flow tests (sign-in submission, cluster lifecycle) which need live
Clerk/Stripe credentials — cannot be verified in this automation's CI environment.

---

## Blockers (recurring)

1. **No `issues: write`** — normalization (STEP 1), dedupe/close (STEP 2/3) must ship as reports.
2. **No `workflows` permission** — CI workflow fixes must ship as templates in `docs/ci/` /
   `docs/ci/workflows/`.
3. **Vercel preview deployment fails for all PRs** (pre-existing project config issue; does not
   block docs-only merges — #1271/#1272/#1273 all merged with the same Vercel failure).

Both issue-level blockers are inherent to the GitHub App installation token used by this
automation; resolution requires a token with the missing scopes.
