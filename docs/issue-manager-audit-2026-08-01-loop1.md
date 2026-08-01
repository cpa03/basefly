# Issue Manager Audit Report — 2026-08-01 (Loop 1)

## 1. Active Phase

**REPAIR MODE** (Phase 0 → Issue Manager → Repair). Entered ISSUE MANAGER MODE because 0 open PRs and 82 open issues existed at phase-0 detection; moved to REPAIR MODE to deliver a high-priority fix.

## 2. Decision Summary

- Default branch detected: `main`. **0 open PRs**, **82 open issues** at phase 0.
- Executed the Issue Manager workflow: normalization → duplicate detection → consolidation → repair mode.
- **Permission constraints re-verified this loop (unchanged):**
  - `github-actions[bot]` token has **read-only issue access**: label mutation confirmed failing (`GraphQL: Resource not accessible by integration (addLabelsToLabelable)`). Commenting, closing, and creating issues are likewise unavailable.
  - `contents` + `pull-requests` are writable (branch push + PR creation verified working).
  - `.github/workflows/*` pushes remain blocked (token lacks `workflows` permission) — verified again: pushing a change to the **existing** `iterate.yml` was rejected with `refusing to allow a GitHub App to create or update workflow ... without 'workflows' permission`.
- Therefore: label changes / duplicate closures / issue creation are **documented in this report for a privileged process**, while the **repair-mode fix is implemented, verified, and delivered via PR** (the executable path available to this token).

## 3. Repair Mode — Solution (this loop's deliverable)

**Target issue:** **#728 — "[P1][Security] security-audit workflow spec is invalid YAML / security scanning not deployed"**.

**Finding:** The canonical security-audit workflow spec lives at `docs/references/security-audit.yml.ref` (deployment requires `workflows` permission; automated deployment is blocked — documented in `docs/issue-728-deployment-status`). The spec file itself was **unparseable as YAML**:

- The `Create issue on vulnerability detection` step used a github-script block whose JS template literal contained lines (`**Date**: ${new Date().toISOString()}`, `**Trigger**: ${context.eventName}`, etc.) at **0-space indentation** inside a 12-space block scalar.
- This terminates the block scalar early. `yaml@2` (GitHub's parser) fails with: `Implicit map keys need to be followed by map values at line 103, column 1`.

**Fix applied** (PR #1043, open):

| Change | Detail |
| ------ | ------ |
| `docs/references/security-audit.yml.ref` | Converted the broken template literal to a uniformly-indented `.join("\n")` array, preserving identical issue-body output |

**Verification (all green):**

- `yaml@2` (GitHub Actions parser): file parses cleanly. Sibling specs (`codeql-analysis.yml.ref`, `iterate-pnpm-migration.yml.ref`) also validated.
- Embedded github-script executed successfully in a mocked `context`/`github` harness: produces correct title, date, trigger, audit-results, and workflow-run link.
- PR diff contains exactly one file (`docs/references/security-audit.yml.ref`); PR is MERGEABLE.

**Action for privileged process:** merge PR #1043 (fixes the spec defect). Deployment of the workflow itself still requires a token with `workflows` permission (`scripts/setup-security-workflows.sh` exists for that step).

## 4. Resolution Verification — remaining P0/P1 issues

All other P0/P1 issues were verified **RESOLVED on `main`** (stale-open; cannot be closed by automation):

| Issue | Title | Verdict | Evidence |
| ----- | ----- | ------- | -------- |
| #496 (P0) | Replace in-memory rate limiter with Redis | ✅ RESOLVED | `packages/api/src/distributed-rate-limiter.ts` on main |
| #498 (P1) | Replace email-based admin RBAC | ✅ RESOLVED | `requireRole` middleware + `admin.test.ts` RBAC tests |
| #500 (P1) | Add Clerk authentication flow tests | ✅ RESOLVED | `packages/auth/clerk.test.ts` (commits #912/#916/44fd869) |
| #501 (P1) | Playwright E2E tests | ✅ RESOLVED | `tests/e2e/*.spec.ts` (auth, billing, dashboard, webhook, authorization-bypass) |
| #515 (P1) | CSRF protection | ✅ RESOLVED | `apps/nextjs/src/proxy.ts` origin/referer validation |
| #549 (P1) | Add tests for packages/auth (0% coverage) | ✅ RESOLVED | `packages/auth/clerk.test.ts` exists; vitest includes `packages/**/*.test.{ts,tsx}` |
| #550 (P1) | Include apps/nextjs in coverage | ✅ RESOLVED | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}` |
| #551 (P1) | Add tests for k8s router | ✅ RESOLVED | `packages/api/src/router/k8s.test.ts` on main |
| #581 (P1) | Consolidate testing infra | ✅ RESOLVED | Umbrella — all referenced issues (#549/#550/#551/#500) resolved |
| #578 (P3) | Remove duplicate health check | ✅ RESOLVED | Only `apps/nextjs/src/app/api/health/route.ts` remains |
| #611 (P3) | not-found.tsx pages | ✅ RESOLVED | `not-found.tsx` present in docs/dashboard/marketing groups |
| #613 (P2) | Remove duplicate workflow | ✅ RESOLVED | Only `iterate.yml` + `on-pull.yml` exist |
| #748 (P2) | .nvmrc invalid value | ✅ RESOLVED | `.nvmrc` = `22.14.0` (valid) |
| #785 (P2) | Duplicate next dep in stripe | ✅ RESOLVED | `packages/stripe/package.json` has no `next` dep |
| #786 (P1) | Stripe webhook logs partial secret | ✅ RESOLVED | No secret logging in `packages/stripe/src/*` (only doc comments) |

## 5. Genuinely-open items requiring `workflows` permission (blocked, documented)

- **#305 / #584 / #595 / #670 / #744 (pnpm CI consistency):** `iterate.yml` still uses `npm ci`. The verified fix exists at `docs/ci/iterate-pnpm-fix.patch` (restores `pnpm/action-setup@v6` + `pnpm install --frozen-lockfile` + pnpm cache path/key in both architect and Fixer jobs). Applying it to the existing workflow file and pushing was **rejected** by GitHub's workflow-file protection. `scripts/deploy-ci-fixes.sh` Fix 3 automates the deployment for a token with `workflows` permission. (Also re-verified: migration `cd9eb30` was lost when a stale branch merged over it — regression documented in `docs/ci/iterate-pnpm-fix.md`.)
- **#522 (Vercel deploy workflow):** requires creating a new workflow file — blocked.
- **#728 deployment:** requires `workflows` permission (spec fixed in PR #1043).

## 6. Label Normalization Plan (unchanged — for privileged process)

Mandated scheme: exactly one category (`bug|enhancement|feature|docs|refactor|chore|test|ci|security`) + exactly one priority (`P0|P1|P2|P3`).

### 6.1 Issues still missing priority labels

| Issue | Suggested priority | Existing category |
| ----- | ------------------ | ----------------- |
| #305  | P1                 | ci (dedupe enhancement) |
| #584  | P2                 | ci (dedupe enhancement) |
| #628  | P2                 | test (add)          |
| #630  | P3                 | ci (add)            |
| #631  | P1                 | test (add)          |
| #632  | P1                 | security            |
| #634  | P2                 | refactor (add)      |
| #635  | P2                 | docs (dedupe documentation) |
| #636  | P2                 | feature (add)       |
| #668  | P3                 | feature (add)       |
| #713  | P2                 | test (dedupe enhancement) |
| #719  | P2                 | enhancement         |
| #720  | P2                 | enhancement         |

### 6.2 Issues with duplicate/conflicting category labels

| Issue | Suggested action |
| ----- | ---------------- |
| #581  | keep `test`; drop duplicate categories |
| #549  | keep `test`; drop duplicate categories |
| #744  | keep `ci`; drop duplicate categories |

## 7. Final State

- **PR #1043** (fixes #728 spec) — open, mergeable, awaiting merge.
- **82 open issues** (unchanged count; ~all P0/P1 verified resolved, label/dedupe/closure mutations blocked for automation).
- **No branch conflicts**: `fix/issue-728-security-spec` contains only the single-file fix.
- **Waiting for human review** — issue mutations (label/close/comment) require a privileged process.
