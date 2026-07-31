# Issue Manager Audit Report — 2026-07-31

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0 → Issue Manager, entered because 0 open PRs and 82 open issues).

## 2. Decision Summary

- **82 open issues** found, 0 open PRs. Default branch: `main`.
- Executed the Issue Manager workflow: normalization plan → duplicate detection → consolidation → repair mode.
- **Critical constraint discovered**: The automation token (`GITHUB_TOKEN`, `github-actions[bot]`) has **read-only access to issues** (confirmed via GraphQL: `addLabelsToLabelable`, `addComment`, `createIssue` all return `Resource not accessible by integration`). Pull-request and contents permissions are writable (PR creation verified).
- Therefore all label changes, duplicate closures, and issue creation decisions are **documented in this report** for application by a privileged process, while the **repair-mode code fix is implemented, committed, and delivered via PR** (which the token can create).

## 3. Repair Mode — Solution

**Target issue:** #305 (canonical consolidated pnpm CI issue, see §5.1)

**Fix applied:** `.github/workflows/iterate.yml` — completed the pnpm migration:

| Location | Before | After |
|---|---|---|
| architect job, cache block | `~/.npm` cache path | `~/.local/share/pnpm/store` |
| architect job, cache key | `hashFiles('**/package-lock.json')` | `hashFiles('pnpm-lock.yaml')` |
| architect job, install step | `npm ci \|\| true` | `pnpm/action-setup@v4` + `pnpm install --frozen-lockfile \|\| true` |
| Fixer job, install step | `npm ci \|\| true` | `pnpm/action-setup@v4` + `pnpm install --frozen-lockfile \|\| true` |

**Verification:**
- `grep -n "npm ci\|package-lock\|~/.npm"` → **no remaining npm references** in `iterate.yml`
- Python `yaml.safe_load` → **YAML valid**
- `on-pull.yml` already fully pnpm (verified, no npm refs)

## 4. Label Normalization Plan (per-issue)

Mandated scheme: exactly one category (`bug|enhancement|feature|docs|refactor|chore|test|ci|security`) + exactly one priority (`P0|P1|P2|P3`).

### 4.1 Add priority labels (38 issues)

| Issue | Priority | Category (existing) | Issue | Priority | Category (existing) |
|---|---|---|---|---|---|
| #789 | P2 | enhancement | #752 | P3 | enhancement (add) |
| #788 | P2 | test | #751 | P2 | enhancement (add) |
| #787 | P2 | test | #749 | P3 | feature (add) |
| #755 | P2 | enhancement (add) | #729 | P2 | test (add) |
| #754 | P2 | test (add) | #728 | P2 | security |
| #753 | P2 | enhancement (add) | #727 | P3 | feature (add) |
| #726 | P2 | ci | #723 | P2 | enhancement (add) |
| #722 | P2 | security | #721 | **P1** | security |
| #719 | P2 | enhancement (add) | #713 | P2 | test (dedupe enhancement) |
| #708 | P3 | enhancement | #706 | P3 | enhancement |
| #705 | P2 | enhancement | #697 | P2 | docs (add) |
| #688 | P2 | security | #687 | P3 | enhancement |
| #685 | P2 | enhancement | #684 | P3 | enhancement |
| #683 | P2 | enhancement | #668 | P3 | feature (add) |
| #667 | P3 | enhancement | #666 | P2 | enhancement |
| #664 | P2 | enhancement | #663 | P2 | enhancement |
| #650 | P3 | enhancement | #636 | P2 | feature (add) |
| #635 | P2 | docs | #634 | P2 | refactor (add) |
| #632 | **P1** | security | #630 | P3 | ci (add) |
| #613 | P2 | enhancement | #611 | P3 | enhancement |
| #610 | P2 | enhancement | #609 | P2 | enhancement |
| #590 | P2 | enhancement | #580 | P2 | enhancement |
| #579 | P2 | enhancement | #578 | P3 | enhancement |
| #523 | P3 | enhancement | #522 | P3 | ci (dedupe enhancement,refactor) |
| #521 | P2 | enhancement | #503 | P2 | docs |
| #502 | P2 | enhancement | #500 | P1 | enhancement |
| #498 | P1 | enhancement | #494 | P2 | refactor |
| #492 | P3 | enhancement | #488 | P2 | enhancement |
| #487 | P2 | enhancement | #486 | P2 | enhancement |
| #485 | P2 | enhancement | #483 | P2 | enhancement |
| #480 | P1 | enhancement (dup of #496) | #305 | **P1** | ci (dedupe enhancement) |

### 4.2 Category-only issues (add missing category label)

| Issue | Category to add |
|---|---|
| #755 | enhancement |
| #754 | test |
| #753 | enhancement |
| #752 | enhancement |
| #751 | enhancement |
| #749 | feature |
| #697 | docs |
| #744 | ci |
| #748 | bug |
| #670 | ci |
| #595 | ci |

### 4.3 Multi-category issues (reduce to exactly one)

| Issue | Remove | Keep |
|---|---|---|
| #305 | enhancement | ci |
| #584 | enhancement | ci |
| #581 | enhancement | test |
| #551 | enhancement | test |
| #550 | enhancement | test |
| #549 | enhancement | test |
| #713 | enhancement | test |
| #522 | enhancement, refactor | ci |

## 5. Duplicate Detection & Consolidation

### 5.1 pnpm CI consistency cluster — CONSOLIDATE (5 → 1)

Issues: #305, #584, #595, #670, #744 — all describe the same npm→pnpm migration in GitHub Actions.

- **Canonical:** #305 (earliest, most complete scope)
- **Status:** Most work already merged (`on-pull.yml` clean; commit `cd9eb30` migrated iterate.yml partially). Remaining gap was **iterate.yml** lines 59/72/342 → **now fixed by this PR**.
- **Action:** Close #584, #595, #670, #744 as duplicates referencing #305.

### 5.2 E2E testing cluster — CLOSE AS RESOLVED (3)

- #628, #501, #724 claim missing/incomplete E2E tests.
- **Evidence of resolution:** `playwright.config.ts` exists; `tests/e2e/` contains 12 spec files including the exact flows requested by #724: `subscription-workflows.spec.ts`, `webhook-error-handling.spec.ts`, `authorization-bypass.spec.ts`, `cluster.spec.ts`, `dashboard.spec.ts`, `billing.spec.ts`.
- **Action:** Close #628, #501, #724 as resolved.

### 5.3 Rate limiter cluster — CLOSE AS RESOLVED (2)

- #496 (P0, distributed rate limiter), #480 (P1, duplicate).
- **Evidence of resolution:** `packages/api/src/distributed-rate-limiter.ts` (Redis sliding-window, `SyncRateLimiter` in-memory fallback) + `distributed-rate-limiter.test.ts` (unit tests). `packages/api/src/trpc.ts` `rateLimit()` middleware uses `getLimiter(endpointType)` from the distributed module (line 18 import, line 362 usage).
- **Action:** Close #496 as resolved; close #480 as duplicate of #496.

### 5.4 nvmrc cluster — CLOSE AS RESOLVED (2)

- #720 (missing .nvmrc), #748 (invalid value `20`).
- **Evidence:** `.nvmrc` exists and contains valid `22.14.0`.
- **Action:** Close both as resolved.

### 5.5 API router tests cluster — CLOSE AS RESOLVED (2)

- #725 (integration tests for API routers), #631 (k8s/customer/stripe router tests).
- **Evidence:** `packages/api/src/router/` contains `admin.test.ts`, `auth.test.ts`, `customer.test.ts`, `hello.test.ts`, `k8s.test.ts`, `schemas-enhanced.test.ts`, `stripe.test.ts`, `validation.test.ts`.
- **Action:** Close #725, #631 as resolved.

### 5.6 API docs automation cluster — CLOSE AS RESOLVED (1) / KEEP (1)

- #731 (auto-generate API docs from tRPC): **Resolved** — `apps/nextjs/src/app/api/docs/route.ts` serves generated OpenAPI (`@saasfly/api/openapi`) with Scalar interactive UI.
- #749 (AI-powered endpoint testing + docs generator): **Keep** (distinct AI-generation scope, not implemented). Normalize as `feature` + P3.

### 5.7 Individual resolved issues (verified on main)

| Issue | Evidence |
|---|---|
| #785 duplicate `next` in `packages/stripe/package.json` | `package.json` contains no `next` dependency |
| #786 Stripe webhook logs partial secret | Fixed in `69b43e0`/`9c20a29`/`a6b1f6e`; current route logs non-secret identifiers only |
| #549 auth module tests (0% coverage) | `packages/auth/clerk.test.ts` exists |
| #550 apps/nextjs in coverage config | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}` in coverage + test patterns |
| #551 k8s router tests | `packages/api/src/router/k8s.test.ts` exists |

## 6. Action Log

| Timestamp (UTC) | Action | Target | Result |
|---|---|---|---|
| 2026-07-31 ~08:24 | Phase 0 entry decision | Repo `cpa03/basefly` | 0 open PRs, 82 open issues → ISSUE MANAGER MODE |
| 2026-07-31 ~08:25 | Inventory build | All 82 open issues | Label gaps: 38 missing priority, ~12 missing category, 7 multi-category |
| 2026-07-31 ~08:26 | State verification | workflows, .nvmrc, rate limiter, playwright, stripe pkg, webhook route | 15 issues verified resolved on main; pnpm cluster partially resolved |
| 2026-07-31 ~08:27 | Token capability probe | GitHub API/GraphQL | Issues read-only (labels/comments/create blocked); PRs+contents writable |
| 2026-07-31 ~08:28 | Repair: edit `iterate.yml` | cache path/key + 2× install step | npm refs eliminated; YAML valid |
| 2026-07-31 ~08:29 | Report + branch + commit + push + PR | `fix/iterate-pnpm-consistency-2026-07-31` | PR created, linked to #305 |

## 7. Remaining Open Items (for privileged process)

1. Apply §4 label normalization (requires `issues: write`).
2. Close resolved/duplicate issues per §5 (requires `issues: write`).
3. Highest-priority outstanding work after this repair: **#498** (P1, email-based admin RBAC → role-based) and **#515** (P1, CSRF protection) — both security, both require design + DB migration planning before implementation.

## 8. Final State

- **State:** `waiting for human review` (issue mutations blocked by token permissions; code repair delivered via PR)
- **Skills used:** none applicable from `.opencode/skills` for this run (repo-maintenance orchestration, no skill matched)
- **Subagents used:** none (all verification performed with direct read-only tooling; no delegation needed for the small deterministic fix)
