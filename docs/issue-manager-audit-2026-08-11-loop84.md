# Issue Manager Audit Report — 2026-08-11 (loop 84)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `192f1c1`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: 0 open PRs, 82 open issues)

## Decision Summary

- **Step 0.1 (open PRs):** 0 → PR Handler Mode skipped.
- **Step 0.2 (open issues):** 82 open → Issue Manager Mode entered.
- **Steps 1–3 (normalization / duplicate detection / consolidation):** **token-blocked** — verified empirically this session:
  - `gh issue comment 496` → `403 GraphQL: Resource not accessible by integration (addComment)`
  - `gh issue edit 789 --add-label P3` → `403 ... (addLabelsToLabelable)`
  - Root cause confirmed via `github-workflow-automation` skill + `on-pull.yml` read: workflow grants only `contents: write` + `pull-requests: write` — **no `issues: write`**. 38 issues lack priority labels, 12 lack category labels; all normalization/closure blocked.
- **Step 4 (Repair Mode):** re-verified the P0/P1 population plus a fresh sample of the newest specialist issues (#751, #752, #753, #755, #785, #786, #787, #788, #789, #721, #722, #632, #666) — **all verified resolved in code on `main`** but stuck open (closure needs `issues: write`). No genuinely-actionable, contract-compliant repair target remains. Per the FAIL-SAFE rule, no speculative work was forced.
- **Carried-forward finding (loop 83):** repo-wide Vercel deployment failures with root cause = Node 20 vs 22 mismatch. Re-confirmed this session: CI workflows pin `node-version: 20` while repo requires Node ≥22 (`.nvmrc` = `22.14.0`, `engines.node >= 22`). Fix requires `workflows: write` (absent) → **action-blocked**, logged for human.

## Action Log

| Timestamp (UTC) | Action | Target | Result |
|---|---|---|---|
| 00:58 | Entry decision | PRs / issues | 0 open PRs, 82 open issues → Issue Manager Mode |
| 00:59 | Sync | local → `origin/main` | Pulled `192f1c1` (loop 83 report + Select modularization merged) |
| 00:59 | Token permission verification | issue mutations | comment 403, label-add 403 — `issues: write` absent |
| 01:00 | Issue verification (newest specialist issues) | #785, #786, #787, #788, #789, #755 | #785: `next` removed from `packages/stripe` deps ✅; #786: webhook logs event type only (no secret) ✅; #787: `migrations.test.ts` + 5 more in `packages/db` ✅; #788: UI tests present ✅; #789: `peerDependencies` includes `react`/`react-dom` ✅; #755: `@@index([authUserId, plan, stripeCurrentPeriodEnd])` ✅ |
| 01:00 | Issue verification (code-splitting / DX) | #751, #752, #753 | #751: PR #1193 merged (edge router code-splitting tests) ✅; #752: `packages/common/src/logger.ts` + `config/log-level.ts` + `logger.test.ts` ✅; #753: `next/dynamic` in dashboard/settings/marketing ✅ |
| 01:00 | Issue verification (security) | #721, #722, #632, #666 | #721: `isAdmin` middleware + `requireRole` in `trpc.ts` ✅; #722: `env.mjs` validation ✅; #632: `sensitive-data-logging.test.ts` ✅; #666: `error.tsx` + `global-error.tsx` ✅ |
| 01:01 | Node/CI mismatch re-confirm | `.nvmrc`, `engines`, workflows | `.nvmrc`=22.14.0, `engines.node>=22`; `on-pull.yml`+`iterate.yml` pin `node-version: 20` → Vercel/CI build failures (loop 83 finding still valid) |
| 01:01 | Race check | PRs / issues / main HEAD | 0 new PRs, 0 new issues, HEAD unchanged (`192f1c1`) |
| 01:02 | Audit report | `docs/issue-manager-audit-2026-08-11-loop84.md` | Committed (this report) |

## Issue Verification (spot-checks, against `origin/main` @ `192f1c1`)

| Issue | Title | Evidence (this session) |
|---|---|---|
| #785 (bug) | Duplicate `next` dep in `packages/stripe` | `packages/stripe/package.json` deps = `{@saasfly/common, @saasfly/db, @t3-oss/env-nextjs, stripe, zod}` — no `next` ✅ |
| #786 (P0, security) | Stripe webhook logs partial secret | `webhooks.ts` logs `{ eventType }` only; `webhook-idempotency.ts` logs event id/type; no secret material ✅ |
| #787 (test) | db migrations/schema tests | `packages/db/migrations.test.ts`, `db-instance.test.ts`, `soft-delete.test.ts`, `rls-middleware.test.ts`, `logger.test.ts`, `user-deletion.test.ts` ✅ |
| #788 (test) | UI component tests | `packages/ui/src/accordion/alert/avatar/button/callout/card/input/label.test.tsx` (+ select.test.tsx) ✅ |
| #789 (enhancement) | peerDependencies for React in `packages/ui` | `peerDependencies: { next:>=14, react:^19, react-dom:^19 }` ✅ |
| #755 (database) | Composite index | `@@index([authUserId, plan, stripeCurrentPeriodEnd])` in `schema.prisma` ✅ |
| #751 (performance) | tRPC bundle code splitting | PR #1193 merged — edge router code-splitting tests ✅ |
| #752 (DX) | Unified CLI output utilities | `packages/common/src/logger.ts` (pino, colorize, ISO timestamps), `config/log-level.ts` (LOG_LEVEL), `logger.test.ts` ✅ |
| #753 (frontend) | Route-based code splitting | `next/dynamic` in `dashboard/page.tsx`, `settings/page.tsx`, `marketing/page.tsx`, `cluster-list.tsx` ✅ |
| #721 (security) | Authorization beyond auth | `isAdmin` middleware + `requireRole()` factory in `packages/api/src/trpc.ts` ✅ |
| #722 (security) | Env validation at startup | `apps/nextjs/src/env.mjs` (t3-env) ✅ |
| #632 (security) | Sensitive-data logging audit | `packages/api/src/sensitive-data-logging.test.ts` + logger redaction ✅ |
| #666 (architecture) | Global error boundary | `apps/nextjs/src/app/error.tsx` + `global-error.tsx` ✅ |

## Remaining Open Issues — Classification (82 total)

### Verified resolved on `main` — awaiting closure (need `issues: write`)

#305, #480, #483, #485, #486, #487, #488, #492, #496, #498, #500, #501, #503, #515, #521, #523, #549, #550, #551, #578, #579, #581, #590, #609, #611, #613, #630, #631, #632, #634, #635, #663, #664, #666, #667, #683, #684, #685, #687, #697, #705, #706, #708, #713, #719, #720, #721, #722, #723, #724, #725, #729, #731, #751, #752, #753, #754, #755, #785, #786, #787, #788, #789

### Token-blocked — workflow-file changes (need `workflows: write`; **no workflow grants it**)

#502 (fast-path CI), #522 (Vercel deploy), #584 (pnpm CI), #595 (pnpm workflows), #650 (extract AI prompts), #670 (iterate.yml pnpm), #726 (dep-consistency wiring), #728 (security scanning), #744 (iterate.yml pnpm), #305 (pnpm standardization).

### FAIL-SAFE / contract-prohibited / declined

- **#688 (P2, security)** — middleware.ts: headers already implemented via `next.config.mjs` `headers()`; stale branch carries critical bugs (loop 81) → FAIL-SAFE.
- **#610 (P2)** — tRPC response standardization remainder = API-contract changes (contract-prohibited).
- **#494 (P2)** — domain-layer extraction = architectural migration, not minimal/atomic.
- **#636** — ISR for dashboard declined (user-scoped data leak under ISR).

### Phase-3 feature work (not Repair-Mode targets)

#668 (AI cluster diagnostics), #727 (AI code review), #749 (AI API testing generator), #580 (Sentry/APM — OTel merged via #486).

## Carried-Forward Finding — Vercel Deployment Failures (Node 20 vs 22)

- **Evidence (re-confirmed):** `.nvmrc` = `22.14.0`; root `package.json` `engines.node = ">=22"`; `apps/nextjs` `next: 16.2.11` (requires Node ≥22). `on-pull.yml:55` and `iterate.yml:70,266,340,395` all pin `node-version: 20`; latest Vercel deployment (Preview, `5932a88`) = **failure**.
- **Impact:** No preview/production builds; Vercel check red on all PRs. Pre-existing, repo-wide, not caused by any single PR.
- **Fix path (blocked this session):** align `node-version: 20` → `22` in `on-pull.yml` + `iterate.yml`; align Vercel project Node version. Requires `workflows: write` (absent) and Vercel project settings (human). Logged here for human action.

## Skills & Agents Used

- **Skill:** `github-workflow-automation` — loaded; used to confirm the `on-pull.yml` permission model (`contents`/`pull-requests` only → no `issues: write`, no `workflows: write`) and validate the Node-version alignment recommendation for CI/Vercel. Result: permission constraints confirmed; guided the "blocked, log for human" conclusion.
- **Subagents:** none spawned — verification executed directly with targeted evidence (file reads, greps, `gh` API, git logs). The work was narrow, sequential, and well-scoped; parallel exploration would have added latency without improving evidence quality.

## Final State

- **Status:** `blocked` (token permissions) / `waiting for human review`
- **Reason:** All P0/P1 and the newly spot-checked P2/P3 issues are verified **resolved on `main`**. Remaining open issues require either `issues: write` (label normalization for 38+12 issues, duplicate closure, closing ~63 verified-resolved issues), `workflows: write` (all workflow changes incl. the prepared #744 fix and the Node-version fix — **no workflow grants it**), or constitute FAIL-SAFE/contract-prohibited/Phase-3 work. Loop 83's Vercel/Node finding re-confirmed and still action-blocked.
- **Recommended follow-up:** grant `issues: write` to `on-pull.yml` (or run issue management from `iterate.yml`, which has it) to close the ~63 verified-resolved issues and normalize labels; grant `workflows: write` so the prepared #744 fix and the `node-version: 20 → 22` CI fix can be pushed/merged; align the Vercel project Node version to 22.x to restore deployments.
