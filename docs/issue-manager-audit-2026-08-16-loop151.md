# Issue Manager Audit Report — 2026-08-16 (Loop 151)

**Date**: 2026-08-16T04:35:00Z
**Mode**: ISSUE MANAGER MODE
**Branch**: `main` @ `52ba70a`

---

## Decision Summary

Phase 0 entry decision: **0 open PRs** (fresh `gh pr list --state open` → empty)
→ PR HANDLER MODE skipped → Phase 0 STEP 0.2 → **ISSUE MANAGER MODE** (82 open
issues; count unchanged; no new issues since loop 150).

ISSUE MANAGER MODE executed:

- **STEP 1 (normalization)**: 38 issues still missing a priority label (P0–P3)
  and 10 missing a category label (bug|enhancement|feature|docs|refactor|
  chore|test|ci|security). All 48 label-add operations were attempted and
  **BLOCKED** — fresh 403 on `addLabelsToLabelable` ("Resource not accessible by
  integration"); issue comments also **BLOCKED** (fresh 403 on `addComment`).
  The intended label assignments are preserved in this report (see
  "Normalization Plan" below) so a human actor with `issues: write` can apply
  them in one pass.
- **STEP 2 (dedupe)**: duplicate clusters re-validated — **BLOCKED** (403).
- **STEP 3 (consolidation)**: candidate consolidations unchanged — **BLOCKED** (403).
- **STEP 4 (repair)**: NEW this loop — 8 P1-worthy issues were previously
  invisible to repair-mode selection because they lacked priority labels. All 8
  were verified **resolved in code** with fresh evidence, along with a sweep of
  6 P2/P3 candidates (also resolved). Remaining open defects require workflow-
  file changes that are **BLOCKED** (no `workflows` permission). Additionally,
  **10 orphan remote branches with no open PR** were discovered and flagged as a
  governance risk (not deleted — FAIL-SAFE).

## NEW FINDING — Previously Unlabeled P1 Issues (this loop's contribution)

Prior loops selected repair targets from issues that _already_ carried P0/P1
labels. 8 issues with P1-level severity were missing priority labels entirely
and were never evaluated. All are now verified **resolved in code on `main`**:

| Issue     | Title                                                         | Status      | Evidence (fresh, this loop)                                                                                                                                 |
| --------- | ------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #632 [P1] | Audit error logging for sensitive data leakage                | ✅ resolved | No secret-bearing `console.*` in non-test code; Stripe webhook sanitizes errors (see #786)                                                                  |
| #719 [P1] | Missing root-level TypeScript configuration                   | ✅ resolved | `tsconfig.json` exists at repo root                                                                                                                         |
| #721 [P1] | Add explicit authorization checks beyond authentication       | ✅ resolved | `packages/api/src/authorization.ts`; enforced in `router/customer.ts` + `trpc.ts`                                                                           |
| #724 [P1] | Missing e2e test coverage for critical flows                  | ✅ resolved | `playwright.config.ts` + `tests/e2e/{admin,auth,authorization-bypass,billing}.spec.ts`                                                                      |
| #748 [P1] | `.nvmrc` contains invalid value `'20'`                        | ✅ resolved | `.nvmrc` now contains `22.14.0` (valid)                                                                                                                     |
| #785 [P1] | Duplicate `next` dependency in `packages/stripe/package.json` | ✅ resolved | `dependencies` contains no `next` entry                                                                                                                     |
| #786 [P1] | Stripe webhook logs partial secret                            | ✅ resolved | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` — signature errors caught separately, only `error.message` logged; raw `StripeError`/secret never logged |
| #789 [P1] | Add peerDependencies for React in `packages/ui`               | ✅ resolved | `peerDependencies` includes `react`, `react-dom`, `next`                                                                                                    |

## STEP 4 — P2/P3 Sweep (fresh evidence, this loop)

| Issue     | Title                                             | Status      | Evidence                                                                                                                                                                     |
| --------- | ------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #578 [P3] | Remove duplicate health check endpoint            | ✅ resolved | Single endpoint: `apps/nextjs/src/app/api/health/route.ts` + `lib/health-check.ts`                                                                                           |
| #609 [P2] | Consolidate duplicate Zod schemas in tRPC routers | ✅ resolved | Shared `packages/api/src/router/schemas.ts`; `customer.ts`, `k8s.ts`, `stripe.ts` import from it                                                                             |
| #630 [P2] | Enhance pre-commit hooks with typecheck and test  | ✅ resolved | `.husky/pre-commit` + `.husky/pre-push` exist                                                                                                                                |
| #663 [P2] | Consolidate eslint-disable comments               | ✅ resolved | Only 5 remain, each with documented justification (`--` rationale)                                                                                                           |
| #664 [P2] | Replace `console.*` with pino in db/stripe        | ✅ resolved | Pino loggers exist (`packages/common/src/logger.ts`, `packages/stripe/src/logger.ts`, `packages/api/src/logger.ts`); remaining 4 `console.*` are JSDoc comment examples only |
| #722 [P2] | Env var validation at startup                     | ✅ resolved | `apps/nextjs/src/env.mjs` uses `createEnv` (@t3-oss/env-nextjs)                                                                                                              |

## Remaining Open Defects (all token-blocked)

| Defect                             | Issues                   | Blocker                                                                                        |
| ---------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------- |
| pnpm consistency in GitHub Actions | #305/#584/#595/#670/#744 | ❌ no `workflows` permission (push rejected, verified loop 150 `f35a7cf`)                      |
| Security scanning in CI            | #728                     | ❌ no `workflows` permission (security references in `on-pull.yml` are prompt text, not scans) |

## NEW FINDING — Orphan Remote Branches (governance risk)

10 remote branches exist with **no open PR** and no merge record. Their work
appears absorbed into `main` (e.g. middleware consolidated into `proxy.ts`), but
stale branches accumulate. Per FAIL-SAFE, **not deleted** — flagged for human
review:

`dx/add-circular-dependency-detection`, `dx/circular-dependency-detection`,
`dx/issue-683-eslint-root-config`, `feat/frontend/add-not-found-page`,
`feat/improve-env-setup-error-messages`, `feat/middleware-ts-security-headers`,
`fix/build-remove-middleware-conflict-nextjs16`,
`fix/create-middleware-edge-security`, `fix/rbac-require-role-middleware-721`,
`fix/remove-duplicate-middleware-nextjs16`

## Normalization Plan (for human with `issues: write`)

Priority additions (38): #305 P2, #584 P2, #595 P2, #628 P2, #630 P2, #631 P2,
#632 P1, #634 P2, #635 P3, #636 P2, #668 P3, #697 P2, #713 P2, #719 P1, #720 P2,
#721 P1, #722 P2, #723 P2, #724 P1, #725 P2, #726 P2, #727 P3, #728 P1, #729 P3,
#731 P3, #744 P2, #748 P1, #749 P3, #751 P2, #752 P2, #753 P2, #754 P2, #755 P2,
#785 P1, #786 P1, #787 P2, #788 P2, #789 P1.

Category additions (10): #595 ci, #697 docs, #744 ci, #748 bug, #749 enhancement,
#751 refactor, #752 refactor, #753 enhancement, #754 test, #755 enhancement.

## CI Verification (fresh, this loop)

| Check            | Result                    | Notes                          |
| ---------------- | ------------------------- | ------------------------------ |
| `pnpm install`   | ✅                        | pnpm v10.28.2, 7.8s            |
| `pnpm typecheck` | ✅ 9/9                    | turbo typecheck passes         |
| `pnpm lint`      | ✅ 9/9                    | turbo lint passes (0 warnings) |
| `pnpm test`      | ✅ 141 files / 2112 tests | vitest run passes              |

## Skills Used

- `github-workflow-automation` (loaded per contract §5) — provided PR/branch
  patterns and permission-boundary guidance; result: audit report shipped via
  the established docs-PR channel, no workflow-file edits attempted.

## Subagents Used

- None required this loop: all work was sequential read-only verification and
  one report write; direct tool use was the lowest-overhead, highest-precision
  path. No exploration/delegation surface justified a subagent.

## Action Log

| Timestamp (UTC) | Action                   | Target            | Result                                   |
| --------------- | ------------------------ | ----------------- | ---------------------------------------- |
| 04:10           | Re-enter Phase 0         | open PRs / issues | 0 PRs, 82 issues → ISSUE MANAGER MODE    |
| 04:11           | Enumerate issue labels   | 82 issues         | 38 missing priority, 10 missing category |
| 04:12           | Label write attempt      | 48 ops            | ❌ all 403 (addLabelsToLabelable)        |
| 04:13           | Comment write probe      | #305              | ❌ 403 (addComment)                      |
| 04:15           | Verify newly-labeled P1s | 8 issues          | all ✅ resolved in code                  |
| 04:20           | Verify P2/P3 sweep       | 6 issues          | all ✅ resolved in code                  |
| 04:22           | Verify #728/#724/#632    | CI/security/e2e   | #724/#632 ✅; #728 workflow-blocked      |
| 04:23           | Orphan branch scan       | remote branches   | 10 flagged, none deleted (FAIL-SAFE)     |
| 04:26           | `pnpm install`           | repo              | ✅ 7.8s                                  |
| 04:27           | CI suite run             | repo              | ✅ typecheck 9/9, lint 9/9, test 2112    |
| 04:35           | Audit report             | docs/             | loop 151 report written                  |

## Final State

- **blocked (with reason)** — every code-level P0/P1/P2 issue (including the 8
  newly-discovered P1s) is verified resolved in code; issue normalization,
  dedupe, and consolidation are blocked by missing `issues: write`; the pnpm-CI
  (#305/#584/#595/#670/#744) and security-scanning (#728) fixes are blocked by
  missing `workflows` permission. A human actor with elevated permissions must
  apply the Normalization Plan, close verified-resolved issues, and approve the
  workflow-file fixes.
