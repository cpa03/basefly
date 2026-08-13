# Issue Manager Audit Report — 2026-08-13 (loop 100)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `cd2aed3`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: Step 0.1 → 0 open PRs; Step 0.2 → 82 open issues → Issue Manager Mode entered; PR Handler Mode and Phases 1–3 stopped)

## Decision Summary

- **Step 0.1 (open PRs):** 0 open PRs (`gh pr list --state open` empty) → PR Handler Mode skipped.
- **Step 0.2 (open issues):** 82 open issues → **Issue Manager Mode** entered. Issue set unchanged (latest open #789, created 2026-02-27).
- **Step 1 (normalization):** **BLOCKED** — re-probed live this session with first-hand commands:
  - `gh issue edit 305 --add-label P2` → `403 GraphQL: Resource not accessible by integration (addLabelsToLabelable)`
  - `gh issue create` → `403 (createIssue)`; `gh issue comment` → `403 (addComment)`; `gh issue close` → `403 (closeIssue)`
  - REST probes: `POST /issues/{n}/comments` and `POST /issues/{n}/labels` → both `403 Resource not accessible by integration`
  - Token is `github-actions[bot]` (short-lived `ghs_` app token) under `on-pull.yml` which declares `contents: write` + `pull-requests: write` only — **no `issues: write`**.
  - Verified gap unchanged: 12 issues missing category label, 39 missing priority label.
- **Step 2–3 (dedup/consolidation):** **BLOCKED** — close/label/create mutations remain 403. FAIL-SAFE issue creation unavailable.
- **Step 4 (Repair Mode):**
  - All 10 P0/P1 issues on paper (#496 P0; #480/#498/#500/#501/#515/#549/#550/#551/#581 P1) **re-verified code-resolved on `main`** (evidence below). No code-fixable P0/P1 defect remains.
  - **Repair executed this loop:** **#483 (P2, data integrity)** — the last genuinely actionable criterion ("Documentation for transaction patterns") was stale: `docs/blueprint.md` claimed _"No observed multi-step transactions"_ and _"Stripe webhook handlers perform sequential updates"_, while the codebase uses `db.transaction()` in 7 locations. Updated the Transaction Usage section to document real patterns (webhooks, user-deletion cascade, RLS helper, seeding) + rollback test coverage. Merged as **PR #1239**.
  - Live workflow bug (pnpm/Node-20 CI cluster #305/#584/#595/#670/#744) remains — `iterate.yml` still has `npm ci || true` (lines 72/342). Re-verified this session: push of `.github/workflows/*` **rejected** (`refusing to allow a GitHub App to create or update workflow … without workflows permission`).

## First-Hand Verifications This Session (all fresh)

### P0/P1 code-resolved (re-confirmed with file evidence)

| Issue    | Title                                        | Evidence on `main`                                                                                                                                                           |
| -------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#496** | P0 Replace in-memory rate limiter with Redis | `packages/api/src/distributed-rate-limiter.ts` (Redis sliding-window + in-memory fallback + `SyncRateLimiter`), wired into `trpc.ts`; tests present; delivered via PR #1232. |
| **#480** | P1 Redis rate limiter (dup of #496)          | Resolved with #496 — duplicate cluster 1.                                                                                                                                    |
| **#498** | P1 Email-based admin RBAC → role-based       | `packages/api/src/authorization.ts` (verifyOwnership) + `rbac.test.ts`; `adminProcedure`/role-based procedures in `trpc.ts`.                                                 |
| **#500** | P1 Clerk authentication flow tests           | `apps/nextjs/src/utils/clerk.test.ts` + `apps/nextjs/src/lib/admin-access.test.ts` present.                                                                                  |
| **#501** | P1 Playwright E2E critical journeys          | `tests/e2e/` (11 spec files + fixtures); `playwright.config.ts` with `testDir: "./tests/e2e"`.                                                                               |
| **#515** | P1 CSRF protection                           | `packages/api/src/trpc.ts` line 104: `csrfProtection` middleware applied to `procedure` (line 215).                                                                          |
| **#549** | P1 packages/auth tests (0% coverage)         | `packages/auth/env.test.ts` + `packages/auth/clerk.test.ts` present.                                                                                                         |
| **#550** | P1 apps/nextjs in coverage config            | `vitest.config.ts` line 16: `include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`.                                                                          |
| **#551** | P1 k8s router tests                          | `packages/api/src/router/k8s-router.test.ts` + `k8s.test.ts` + `schemas-enhanced.test.ts` present.                                                                           |
| **#581** | P1 Consolidate testing infrastructure        | `packages/api/src/test-utils.ts`; 97 test files / 1733 tests passing this session.                                                                                           |

### #483 (P2) — the repair target this loop

- Acceptance criteria 1–3 (transaction wrappers in webhooks / cluster ops) already implemented in code:
  - `packages/stripe/src/webhooks.ts` — `handleCheckoutSessionCompleted` + `handleInvoicePaymentSucceeded` use `db.transaction()` (lines 115, 151).
  - `packages/db/user-deletion.ts` — cascade deletion inside `db.transaction()` (lines 68, 124).
  - `packages/db/rls-middleware.ts` — `rlsTransaction` helper (line 115); `packages/db/seed.ts` (lines 157, 185).
- Criterion 4 (rollback tests): `packages/stripe/src/webhooks.test.ts` — "transaction atomicity" suite incl. rollback-on-error test.
- Criterion 6 (documentation): **was stale → FIXED this loop** (PR #1239, merged `cd2aed3`).

### Health baseline re-verified fresh on `main` (Node 20.20.2, pnpm 10.28.2)

| Check     | Command                         | Result                                                                                                                                                                    |
| --------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install   | `pnpm install --prefer-offline` | OK (7.1s)                                                                                                                                                                 |
| Typecheck | `pnpm typecheck`                | **9/9 tasks pass**                                                                                                                                                        |
| Lint      | `pnpm lint`                     | **9/9 tasks pass** (0 warnings)                                                                                                                                           |
| Test      | `pnpm test`                     | **97 files / 1733 tests pass** (27.0s)                                                                                                                                    |
| Build     | `pnpm build`                    | NOT runnable — only Node 20.20.2 available; known Node 20 vs Next.js 16.2.11/workerd incompatibility (`.nvmrc` pins 22.14.0) — environment limitation, not a code defect. |

## Duplicate Clusters (9 issues across 5 clusters — closure blocked pending `issues: write`)

1. **Rate limiter:** #480 ↔ #496 → canonical #496 (P0). Both code-resolved.
2. **pnpm-in-CI:** #305 ↔ #584 ↔ #595 ↔ #670 ↔ #744 → canonical #305. Same root cause as the live `iterate.yml` bug — fix blocked by `workflows` permission.
3. **E2E/Playwright:** #501 ↔ #628 ↔ #724 → canonical #501. All code-resolved (11 spec files) — closure purely administrative.
4. **API router tests:** #551 ↔ #631 ↔ #725 → canonical #631. All code-resolved.
5. **Barrel exports:** #687 ↔ #523 → canonical #523. Both code-resolved.

## Required Human Actions (unblock list — unchanged)

1. Add `issues: write` to `on-pull.yml` → unblocks normalization (12 missing category / 39 missing priority), the 5 duplicate clusters, and closing 70+ verified-resolved issues.
2. Add `workflows: write` → unblocks the pnpm/Node-20 CI fix (5-issue cluster #305/#584/#595/#670/#744), #728 security scanning, #502/#522/#726.
3. Triage stale proposals: #636 (ISR on personalized data → cross-user leakage risk), #668 (AI cluster diagnostics), #749/#731 (AI docs/test generation), #667/#634/#590 (audits), #723/#751/#753 (bundle/performance), #494 (domain layer).
4. Build verification requires Node 22 in the runner (`.nvmrc` = 22.14.0) — currently only Node 20.20.2 available.

## Action Log

| Timestamp (UTC) | Action              | Target                                           | Result                                                                |
| --------------- | ------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| 09:0x           | Entry decision      | PRs / issues                                     | 0 open PRs; 82 open issues → Issue Manager Mode                       |
| 09:0x           | Token probe         | issue label mutation (#305)                      | `addLabelsToLabelable` 403 → Steps 1–3 blocked (re-confirmed)         |
| 09:0x           | Token probe         | `createIssue` / `addComment` / `closeIssue`      | All 403 → FAIL-SAFE issue creation unavailable                        |
| 09:0x           | Token probe         | PR create/merge/comment                          | ✅ PR create + merge + PR-comment work (`pull-requests: write`)       |
| 09:0x           | Push probe          | `.github/workflows/iterate.yml` (test branch)    | ❌ rejected — `workflows` permission missing (fix cluster blocked)    |
| 09:0x           | Health baseline     | typecheck / lint / test                          | ✅ 9/9; 9/9 (0 warnings); 97 files / 1733 tests pass                  |
| 09:0x           | Duplicate scan      | 82 open issues                                   | 5 duplicate clusters confirmed (9 issues), unchanged                  |
| 09:0x           | Repair selection    | P0/P1 scan + #483                                | All P0/P1 code-resolved; #483 doc criterion stale → selected          |
| 09:1x           | Repair: #483        | `docs/blueprint.md` Transaction Usage            | Updated to document real `db.transaction()` patterns + rollback tests |
| 09:1x           | PR created + merged | PR #1239 (`docs/blueprint-transaction-docs-483`) | ✅ Merged `cd2aed3`; remote branch deleted                            |
| 09:1x           | Audit report        | `docs/issue-manager-audit-2026-08-13-loop100.md` | Written (this file)                                                   |

## Final State

- **State:** waiting for human review (permission unblock list above)
- **Note:** accidental permission-probe file (`perm-test.txt`) introduced and merged during token probing was reverted on `main` (`dab3079`) and the probe branch deleted; `main` is clean.
