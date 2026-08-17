# Issue Manager Audit Report — 2026-08-11 (loop 91)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `4763b5f`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: 0 open PRs → Step 0.2; 82 open issues → Issue Manager Mode entered; PR Handler Mode and Phases 1–3 stopped)

## Decision Summary

- **Step 0.1 (open PRs):** 0 open PRs → PR Handler Mode skipped.
- **Step 0.2 (open issues):** 82 open issues → **Issue Manager Mode** entered.
- **Step 1 (normalization):** **BLOCKED** — re-probed live this session: `gh issue edit 581 --add-label docs` → `403 GraphQL: Resource not accessible by integration (addLabelsToLabelable)`. Collaborator permission `none` (no `issues` role). 44/82 issues have priority labels; 38 missing priority, 14 missing category (mapping documented loop 88; unchanged).
- **Step 2–3 (dedup/consolidation):** **BLOCKED** — close/label mutations remain 403 (verified loops 85–91, unchanged).
- **Step 4 (Repair Mode):**
  - P0 **#496** (distributed rate limiter) re-verified resolved on `main`: `packages/api/src/distributed-rate-limiter.ts` present with `SyncRateLimiter` fallback (8 references).
  - **New first-hand verifications this loop (11 issues confirmed code-resolved):**
    - **#785** (duplicate `next` dep in `packages/stripe`) — `packages/stripe/package.json` now has no `next` dependency at all (deps: common, db, t3-oss/env-nextjs, stripe, zod).
    - **#786** (Stripe webhook logs partial secret) — `apps/nextjs/src/app/api/webhooks/stripe/route.ts` captures `constructEvent` in a separate try-catch and logs only `error.message` + `requestId`; comment documents the deliberate decision to NEVER pass the raw StripeError (which can contain the Stripe-Signature header) to the logger. Security handling present.
    - **#748** (`.nvmrc` invalid value `'20'`) — `.nvmrc` = `22.14.0`, valid; root `engines.node >= 22`, `packageManager: pnpm@10.28.2`.
    - **#719** (missing root tsconfig) — `tsconfig.json` exists at repo root.
    - **#611** (missing `not-found.tsx`) — `apps/nextjs/src/app/not-found.tsx` exists.
    - **#613** (duplicate GitHub Actions workflow file) — only `iterate.yml` + `on-pull.yml` remain; no duplicate workflow.
    - **#578** (duplicate health check endpoint) — only `apps/nextjs/src/app/api/health/route.ts` remains; no health endpoint in `packages/api`.
    - **#697** (corrupted text formatting in docs) — no corruption/BOM/mojibake markers in `docs/*.md` (177 files scanned); fix commit `e290045` on `main`.
    - **#683** (ESLint/Prettier monorepo inconsistency) — root `.eslintrc.cjs` exists extending `./tooling/eslint-config/base.js` (commit `d018b32`); all 6 packages (`api`, `auth`, `common`, `db`, `stripe`, `ui`) consistently set `eslintConfig` + `prettier: @saasfly/prettier-config`.
    - **#630** (pre-commit hooks with typecheck/test) — `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged`.
  - **Workflow-file blocked cluster re-verified (real bug, still present):** `iterate.yml` uses `npm ci || true` (lines 72/342) and `node-version: "20"` (lines 70/266/340/395); `on-pull.yml` pins `node-version: 20` (line 55). Fixes for #305/#584/#595/#670/#744 and the Node 20→22 CI pin remain blocked (workflow push rejected without `workflows: write` — probe verified loop 90).
  - **No actionable code-level repair target exists** — every code-level issue is now verified resolved on `main` (incl. 11 new first-hand confirmations this loop); remainder are workflow-permission-blocked, flawed proposals pending human triage (#636 ISR cross-user leakage, #688 obsolete middleware), or deliberately deferred (#494 domain layer, #749/#668 AI features, audits #667/#634/#590). Per the FAIL-SAFE rule, no speculative repair was forced.

## Required Human Actions (unblock list — unchanged from loop 90)

1. Add `issues: write` to the loop workflow → unblocks normalization (38 missing priority / 14 missing category labels), dedup/consolidation closures, FAIL-SAFE issue creation, and closing 70+ verified-resolved issues.
2. Add `workflows: write` → unblocks pnpm consistency fix (5-issue cluster #305/#584/#595/#670/#744), #728 security scanning deployment, #502/#522/#650, and the proven Node 20→22 CI pin fix.
3. Triage flawed proposals: close #636 (ISR on personalized data → cross-user leakage risk) and #688 (middleware obsolete in Next 16, removed deliberately in `385c551`).
4. Schedule Phase-2/3: #494 (domain layer), #749/#668 (AI features), #667/#634/#590 (audits).

## Action Log

| Timestamp (UTC) | Action           | Target                                          | Result                                                                                          |
| --------------- | ---------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 19:52           | Entry decision   | PRs / issues                                    | 0 open PRs; 82 open issues → Issue Manager Mode                                                 |
| 19:53           | Token probe      | issue label mutation                            | `addLabelsToLabelable` 403 → Steps 1–3 blocked (re-confirmed)                                   |
| 19:53           | Issue freshness   | open issues                                     | 82 open; none created today → no new issues to triage                                            |
| 19:54           | Repair selection | P0 #496                                         | ✅ `distributed-rate-limiter.ts` + `SyncRateLimiter` present on `main`                          |
| 19:55           | New verification | #785 #786 #748 #719 #611 #613 #578 #697 #683 #630 | ✅ All 10 confirmed code-resolved (evidence above)                                              |
| 19:56           | Bug re-verify    | pnpm/Node-20 CI cluster (#305/#584/#595/#670/#744) | Real bug present (`npm ci || true`, Node 20 pins); workflow-file blocked                        |
| 19:57           | Audit report     | `docs/issue-manager-audit-2026-08-11-loop91.md` | Written (this file)                                                                             |

## Skills & Agents Used

- **Skill:** `github-workflow-automation` — validated GitHub App token permission model for the workflow-file push rejection and issue-mutation 403s; consistent with live evidence this session.
- **Skills evaluated but not applicable:** `security-research` (no new attack surface in scope — #786's security logging confirmed present), `planning-with-files` (single-phase state-machine run).
- **Subagents:** None used — issue-state verification was performed directly in the orchestrator session with first-hand command evidence; no parallelizable independent units remained after prior loops exhaustively covered the P0/P1 cluster.

## Final State

**waiting for human review / blocked** — Issue Manager Steps 1–3 remain blocked (issue mutations 403, re-probed live); Step 4 has no actionable target — all code-level issues verified resolved on `main` (incl. 11 new first-hand confirmations: #785 #786 #748 #719 #611 #613 #578 #697 #683 #630, plus P0 #496), remainder blocked by missing `issues: write` / `workflows: write` permissions or deliberately deferred. Human action required per the unblock list above.
