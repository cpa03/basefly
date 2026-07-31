# Issue Manager Audit Report — 2026-07-31 (Loop 2)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0 → Issue Manager, entered because 0 open PRs and ~80 open issues).

## 2. Decision Summary

- Default branch detected: `main`.
- **0 open PRs**, **80 open issues**.
- Entered ISSUE MANAGER MODE: normalization plan → duplicate detection → consolidation → repair mode.
- **Token constraints confirmed again (unchanged since 2026-07-31 Loop 1):**
  - `github-actions[bot]` has **read-only issue access** (`GraphQL: Resource not accessible by integration` on `addLabelsToLabelable`). Labels, comments, issue creation, and closures cannot be applied by automation.
  - The token **lacks `workflows: write` permission** — pushes touching `.github/workflows/*` are rejected (`refusing to allow a GitHub App to create or update workflow ... without workflows permission`).
  - Non-workflow contents (docs, code, scripts) can be pushed; PRs can be created.
- **New finding this loop:** The pnpm migration of `.github/workflows/iterate.yml` (commit `cd9eb30`, 2026-07-27, resolving #744/#670) was **silently reverted by a subsequent stale merge**. The workflow on `main` is again using `npm ci`. This is a live CI regression that the previous loop's report incorrectly believed was fixed.
- **Repair mode target:** The pnpm-CI regression (canonical issues #305/#744/#670/#584/#595). Fix delivered as a verified patch (`docs/ci/iterate-pnpm-fix.patch`) plus a repaired deploy script, because the automation token cannot push workflow files.

## 3. Label Normalization Plan (for privileged process)

Mandated scheme: exactly one category (`bug|enhancement|feature|docs|refactor|chore|test|ci|security`) + exactly one priority (`P0|P1|P2|P3`).

### 3.1 Issues missing priority labels

| Issue | Suggested priority | Existing category |
|---|---|---|
| #305 | P1 | ci (dedupe enhancement) |
| #584 | P2 | ci (dedupe enhancement) |
| #628 | P2 | test (add) |
| #630 | P3 | ci (add) |
| #631 | P1 | test (add) |
| #632 | P1 | security |
| #634 | P2 | refactor (add) |
| #635 | P2 | docs (dedupe documentation) |
| #636 | P2 | feature (add) |
| #668 | P3 | feature (add) |
| #713 | P2 | test (dedupe enhancement) |
| #719 | P2 | enhancement |
| #720 | P2 | enhancement |
| #721 | P1 | security |
| #722 | P2 | security |
| #723 | P2 | enhancement |
| #724 | P2 | test |
| #725 | P2 | test |
| #726 | P2 | ci |
| #727 | P3 | feature (add) |
| #728 | P2 | security |
| #729 | P3 | test (add) |
| #731 | P3 | enhancement |
| #744 | P1 | ci (add) |
| #748 | P2 | bug (add) |
| #749 | P3 | feature (add) |
| #751 | P2 | enhancement (add) |
| #752 | P3 | enhancement (add) |
| #753 | P2 | enhancement (add) |
| #754 | P2 | test (add) |
| #755 | P2 | enhancement (add) |
| #785 | P2 | bug |
| #786 | P1 | security |
| #787 | P2 | test |
| #788 | P2 | test |
| #789 | P2 | enhancement |
| #595 | P2 | ci (add) |
| #697 | P2 | docs (add) |
| #670 | P3 | ci (add) |

### 3.2 Multi-category issues (reduce to exactly one category)

| Issue | Remove | Keep |
|---|---|---|
| #305 | enhancement | ci |
| #584 | enhancement | ci |
| #522 | enhancement, refactor | ci |
| #713 | enhancement | test |
| #635 | documentation | docs (dedupe label) |

## 4. Resolution Verification (issues already fixed in `main`)

Verified against `main` (2026-07-31). Issues below should be closed by a privileged process:

| Issue | Priority | Status | Evidence |
|---|---|---|---|
| #496 | P0 | **RESOLVED** | `packages/api/src/distributed-rate-limiter.ts` (Redis sliding window + in-memory fallback); wired in `trpc.ts` via `await limiter.checkAsync()`; tests in `distributed-rate-limiter.test.ts`; `REDIS_URL` in `.env.example` |
| #498 | P1 | **RESOLVED** | Merged #1031 (`5aff78e`); `requireRole` middleware + DB role checks in `trpc.ts`; `rbac.test.ts` |
| #500 | P1 | **RESOLVED** | `packages/auth/clerk.test.ts`, `packages/api/src/router/auth.test.ts` |
| #501 | P1 | **RESOLVED** | `playwright.config.ts` + `tests/e2e/{auth,dashboard,billing,authorization-bypass,webhook-error-handling}.spec.ts` |
| #515 | P1 | **RESOLVED** | `csrfProtection` middleware in `packages/api/src/trpc.ts`; referer validation in `proxy.ts` |
| #549 | P1 | **RESOLVED** | `packages/auth/clerk.test.ts` |
| #551 | P1 | **RESOLVED** | `packages/api/src/router/k8s.test.ts` |
| #581 | P1 | **RESOLVED** | `vitest.config.ts` at root; `turbo.json` pipelines |
| #721 | P1 | **RESOLVED** | `requireRole()` in `trpc.ts`; `authorization.test.ts` |
| #722 | P1 | **RESOLVED** | `packages/common/src/config/env.ts` validation; commit `5adec30` |
| #666 | P2 | **RESOLVED** | `apps/nextjs/src/app/global-error.tsx` (hardened in `59f4fe6`) |
| #670 | P3 | **RESOLVED* | iterate.yml pnpm fix (see §6 — **regressed**, patch ready) |
| #713 | P2 | **RESOLVED** | `packages/common/src/{animation,email,icon-sizes,logger,subscriptions,ui-tokens}.test.ts` |
| #719 | P2 | **RESOLVED** | Root `tsconfig.json` exists |
| #720 | P2 | **RESOLVED** | `.nvmrc` = `22.14.0` (valid) |
| #744 | P1 | **RESOLVED*** | iterate.yml pnpm fix (see §6 — **regressed**, patch ready) |
| #748 | P2 | **RESOLVED** | `.nvmrc` = `22.14.0` (valid) |
| #785 | P2 | **RESOLVED** | No `next` dependency in `packages/stripe/package.json` |
| #786 | P1 | **RESOLVED** | Commit `9c20a29` + `0093ec8`: webhook secret no longer logged; input validation at boundary |
| #787 | P2 | **RESOLVED** | `packages/db/{user-deletion,rls-middleware,logger}.test.ts` |
| #788 | P2 | **RESOLVED** | `packages/ui/src/switch.test.tsx`; branch `test/ui-component-tests-788` merged |
| #789 | P2 | **RESOLVED** | `peerDependencies` for `react`/`react-dom` in `packages/ui/package.json` |
| #483 | P2 | **RESOLVED** | `packages/stripe/src/webhooks.ts` uses `db.transaction()` for atomic select+update |

`*` = fix exists but was reverted by a stale merge; the fix is re-delivered in this loop (§6).

## 5. Duplicate Detection & Consolidation Plan

| Cluster | Issues | Recommendation |
|---|---|---|
| **pnpm CI consistency** | #305, #584, #595, #670, #744 | Canonical: **#305**. Close #584, #595, #670, #744 as duplicates. Fix delivered as patch (§6). |
| **E2E / Playwright** | #501, #628, #724 | All resolved (specs exist). Close all three. |
| **API router tests** | #551, #631, #725 | #551 resolved. #631/#725 partially satisfied by `{k8s,customer,stripe,admin,hello,auth}.test.ts`; close #631/#725 with reference to #551. |
| **Rate limiter (Redis)** | #496, #480 | Both resolved (distributed limiter wired). Close #480 as duplicate of #496. |
| **RBAC / authorization** | #498, #721 | Both resolved. Close #721 referencing #498. |
| **.nvmrc** | #720, #748 | Both resolved (.nvmrc valid). Close both. |
| **Security scanning CI** | #728, #727 | Design + deploy script exist (`scripts/deploy-ci-fixes.sh`, `docs/ci/workflows/`). Workflows NOT yet live in `.github/workflows/`. Keep #728 open (P2) with note; close #727 as duplicate if #728 retained, or vice versa. |
| **Barrel exports** | #523, #667, #687 | Consolidate into one issue (#523). |
| **Env validation** | #722, #579 | #722 resolved; #579 distinct (error messages) — keep both, note overlap. |
| **Stripe webhook** | #754, #786, #483 | #786/#483 resolved. #754 (idempotency tests) partially covered by `webhooks.test.ts` — keep #754, close others. |
| **Testing infra** | #549, #550, #581, #713, #787, #788 | #550 (apps/nextjs coverage config) is the only genuinely open item. Consolidate remaining open test items under #581. |

## 6. Repair Mode — iterate.yml pnpm regression (primary deliverable)

**Target:** The pnpm-CI cluster (#305/#744/#670/#584/#595) — a live regression on `main`.

**Root cause:** Commit `cd9eb30` (2026-07-27) migrated `.github/workflows/iterate.yml` from npm to pnpm. A later-merged long-lived branch carried a pre-migration copy of `iterate.yml`; git's merge resolution silently restored the old npm version. The file's `git log` does not show `cd9eb30` because its content effect was negated — a classic stale-merge rollback.

**Fix applied (verified, committed as `f3981be` on branch `fix/iterate-yml-pnpm-regression`):**

| Location | Before | After |
|---|---|---|
| architect job cache path | `~/.npm` | `~/.local/share/pnpm/store` |
| architect job cache key | `hashFiles('**/package-lock.json')` | `hashFiles('**/pnpm-lock.yaml')` |
| architect + fixer install | `npm ci \|\| true` | `pnpm/action-setup@v6` + `pnpm install --frozen-lockfile \|\| true` |
| setup-node | no cache | `cache: 'pnpm'` |

**Verification:** `npm ci` count = 0; `pnpm/action-setup` count = 2; YAML parses; patch applies cleanly to `main`.

**Delivery constraints:** The automation token cannot push `.github/workflows/*`. Delivered via the repo's established mechanism:
- `docs/ci/iterate-pnpm-fix.patch` — regenerated from the verified fix (previous patch was stale: referenced `actions/cache@v4`, `setup-node@v4`, wrong store path `~/.pnpm-store`).
- `docs/ci/iterate-pnpm-fix.md` — updated with current line numbers, regression analysis, and application steps.
- `scripts/deploy-ci-fixes.sh` — Fix 3 rewritten: previously used broken `sed` patterns (`s|npm ci || true|...` — pipe delimiter collision) and an incorrect store path; now applies the verified patch via `git apply --check` + `git apply`. Full script test-passed in an isolated clone.

**Application (privileged token with `workflows: write`):**
```bash
git apply docs/ci/iterate-pnpm-fix.patch   # or: bash scripts/deploy-ci-fixes.sh
git add .github/workflows/iterate.yml
git commit -m "fix(ci): restore pnpm migration in iterate.yml"
git push
```

## 7. Action Log

| Timestamp (UTC) | Action | Target | Result |
|---|---|---|---|
| 2026-07-31 ~20:50 | Phase 0 entry decision | repo | 0 open PRs, 80 open issues → ISSUE MANAGER MODE |
| 2026-07-31 ~20:50 | Inventory open issues with labels | GitHub API | 80 issues catalogued; 39 missing priority labels |
| 2026-07-31 ~20:51 | Token capability probe | GitHub API | Issues read-only; contents writable; workflows denied |
| 2026-07-31 ~20:52 | Resolution verification (P0/P1) | main tree | #496/#498/#500/#501/#515/#549/#551/#581/#721/#722 verified resolved |
| 2026-07-31 ~20:53 | Regression discovery | `.github/workflows/iterate.yml` | pnpm migration reverted by stale merge; `npm ci` present |
| 2026-07-31 ~20:54 | Fix implementation | iterate.yml | commit `f3981be`; 0 npm refs; YAML valid |
| 2026-07-31 ~20:55 | Push attempt (workflow file) | branch `fix/iterate-yml-pnpm-regression` | **Rejected** — token lacks `workflows` permission |
| 2026-07-31 ~20:56 | Patch + doc + script regeneration | `docs/ci/iterate-pnpm-fix.{patch,md}`, `scripts/deploy-ci-fixes.sh` | Patch applies cleanly; deploy script test-passed in clone |
| 2026-07-31 ~20:57 | Delivery PR (docs + patch + script) | branch `docs/issue-manager-audit-2026-07-31-loop2` | See PR |

## 8. Final State

- **Status:** waiting for privileged process (human or token with `issues: write` + `workflows: write`).
- **Required follow-ups:**
  1. Apply `docs/ci/iterate-pnpm-fix.patch` (or run `scripts/deploy-ci-fixes.sh`) and push — resolves the #305 cluster.
  2. Apply label normalization (§3).
  3. Close verified-resolved issues (§4) and duplicates (§5).
- **Blockers:** automation token lacks `issues: write` and `workflows: write`; no destructive or privileged actions possible from this loop.
