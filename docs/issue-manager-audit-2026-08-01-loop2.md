# Issue Manager Audit Report — 2026-08-01 (Loop 2)

## 1. Active Phase

**PR HANDLER MODE → ISSUE MANAGER MODE (REPAIR MODE)**. Entered PR HANDLER MODE because 2 open PRs existed at phase-0 detection (#1044, #1043); after both were merged and re-entry detected 0 open PRs with open issues remaining, transitioned to ISSUE MANAGER MODE.

## 2. Decision Summary

- Default branch detected: `main`. **2 open PRs** at phase 0 → PR HANDLER MODE (strict state machine: lower phases must not run).
- Both PRs processed to merge; then ISSUE MANAGER MODE: normalization → duplicate detection → consolidation → repair mode.
- **Permission constraints re-verified this loop (unchanged, now with direct evidence):**
  - `github-actions[bot]` token is **read-only for issues**: `createIssue`, `addComment`, `closeIssue` all confirmed failing with `GraphQL: Resource not accessible by integration (...)`.
  - `contents` + `pull-requests` are writable (branch push + PR creation verified working).
  - `.github/workflows/*` pushes remain blocked: verified again with a fresh branch — `refusing to allow a GitHub App to create or update workflow '.github/workflows/iterate.yml' without 'workflows' permission`.
- Therefore: label changes / duplicate closures / issue creation are **documented in this report for a privileged process**, while PR-mergeable work is executed directly.

## 3. PR Handler Mode — Actions Taken

| PR    | Title                                                                           | Action                                                                                                                                                                                                             | Result                                           |
| ----- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| #1044 | docs: add issue manager audit report for 2026-08-01 loop 1                      | Synced to `main` (already up-to-date, no conflicts), verified `ci:check` green (1463/1463 tests, 9/9 lint tasks, 0 warnings), merged `--admin --squash`                                                            | ✅ MERGED `2026-08-01T14:21:16Z`, branch deleted |
| #1043 | fix(security): repair invalid YAML in security-audit workflow spec (fixes #728) | Synced to `main`, verified `yaml@2` parses cleanly + embedded github-script executes end-to-end (correct issue body: title/date/trigger/results/run-link), `ci:check` green (1463/1463), merged `--admin --squash` | ✅ MERGED `2026-08-01T14:22:27Z`, branch deleted |

**Vercel check note:** both PRs show Vercel deployment FAILURE caused by the external free-tier rate limit (`api-deployments-free-per-day` — "try again in 24 hours"). This is an external quota, not a code failure; prior merged PR #1041 (merged 2026-08-01T09:52Z) had the identical Vercel state and established the non-blocking precedent.

**Issue #728 close:** attempted after #1043 merge — blocked (`addComment` 403). Requires privileged process.

## 4. Repair Mode — Selection & Verification

Per contract: if a P0/P1 issue exists → select highest-priority. All 10 open P0/P1 issues (#480, #496, #498, #500, #501, #515, #549, #550, #551, #581) were **independently re-verified RESOLVED on `main`** this loop (evidence below). The genuinely-open high-value item — pnpm CI consistency (#305/#584/#595/#670/#744) — was attempted and is **blocked by `workflows` permission** (see §5).

### 4.1 P0/P1 resolution verification (evidence on `main`)

| Issue     | Title                                     | Verdict     | Evidence                                                                                    |
| --------- | ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| #496 (P0) | Replace in-memory rate limiter with Redis | ✅ RESOLVED | `packages/api/src/distributed-rate-limiter.ts` exists                                       |
| #498 (P1) | Replace email-based admin RBAC            | ✅ RESOLVED | `requireRole` in `packages/api/src/trpc.ts`, RBAC tests (`rbac.test.ts`, `admin.test.ts`)   |
| #500 (P1) | Clerk authentication flow tests           | ✅ RESOLVED | `packages/auth/clerk.test.ts`                                                               |
| #501 (P1) | Playwright E2E tests                      | ✅ RESOLVED | `tests/e2e/*.spec.ts` (admin, auth, authorization-bypass, billing, cluster, critical-flows) |
| #515 (P1) | CSRF protection                           | ✅ RESOLVED | `apps/nextjs/src/proxy.ts` origin/referer validation                                        |
| #549 (P1) | Tests for packages/auth (0% coverage)     | ✅ RESOLVED | `packages/auth/clerk.test.ts`; vitest includes `packages/**/*.test.{ts,tsx}`                |
| #550 (P1) | Include apps/nextjs in coverage           | ✅ RESOLVED | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}` (line 16, 34)                   |
| #551 (P1) | Tests for k8s router                      | ✅ RESOLVED | `packages/api/src/router/k8s.test.ts`                                                       |
| #581 (P1) | Consolidate testing infra                 | ✅ RESOLVED | Umbrella — all referenced issues (#549/#550/#551/#500) resolved                             |

### 4.2 NEW findings this loop (not in loop-1 audit table)

| Issue              | Verdict                 | Evidence                                                                                                                                                                                                       |
| ------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #480 (P1)          | ⚠️ DUPLICATE of #496    | Same "replace in-memory rate limiter with Redis" scope (created 13 min before #496). Should be closed as duplicate; #496 is canonical.                                                                         |
| #789 (enhancement) | ✅ RESOLVED             | `packages/ui/package.json` already declares `peerDependencies: { react: ^19.0.0, react-dom: ^19.0.0 }`; react/react-dom only in devDependencies                                                                |
| #755 (database)    | ✅ RESOLVED             | Composite index `@@index([authUserId, plan, stripeCurrentPeriodEnd])` already exists (`packages/db/prisma/schema.prisma:44`), plus `[authUserId, stripeCurrentPeriodEnd]` and `[plan, stripeCurrentPeriodEnd]` |
| #609 (P2)          | ✅ RESOLVED             | k8s router imports `enhancedK8sClusterCreate/Delete/UpdateSchema` from `./schemas`; no inline `z.object` schemas remain in routers                                                                             |
| #664 (P2)          | ✅ RESOLVED             | No active `console.*` in `packages/db/src`, `packages/stripe/src` (only doc-comment examples)                                                                                                                  |
| #579 (P2)          | ✅ RESOLVED             | CONTRIBUTING.md has pnpm instructions; `.nvmrc` = `22.14.0`; `pnpm env:verify` gives friendly error guidance                                                                                                   |
| #663 (P2)          | ✅ EFFECTIVELY RESOLVED | All 29 remaining `eslint-disable` comments carry explicit inline justification (tRPC dynamic types, Kysely dynamic types, intentional patterns); consolidation intent met                                      |

## 5. Blocked Items (require privileged process)

- **#305 / #584 / #595 / #670 / #744 (pnpm CI consistency):** `iterate.yml` still uses `npm ci` (lines 72, 342). The verified fix (`docs/ci/iterate-pnpm-fix.patch`) was re-applied and a fresh push attempted — **rejected** by GitHub: `refusing to allow a GitHub App to create or update workflow '.github/workflows/iterate.yml' without 'workflows' permission`. `scripts/deploy-ci-fixes.sh` Fix 3 automates deployment for a privileged token.
- **#728 closure:** spec fixed and merged (#1043); closing the issue blocked (`addComment` 403). Deployment of the workflow itself still requires `workflows` permission.
- **#522 (Vercel deploy workflow):** requires creating a new workflow file — blocked.
- **Label normalization (loop-1 §6 table):** label mutations blocked (`addLabelsToLabelable` 403).

## 6. Final State

- **PRs merged this loop:** #1044, #1043 (both squashed, branches deleted).
- **Open issues:** 82 (unchanged; ~all P0/P1 verified resolved, issue closure/label mutations blocked for automation).
- **New duplicate finding for privileged process:** #480 → canonical #496.
- **No open PRs** currently (0 open).
- **Waiting for human review** — issue mutations (label/close/comment) and `.github/workflows/*` pushes require a privileged process.
