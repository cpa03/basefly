# Issue Manager Audit Report — 2026-08-12 (loop 96)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `715306e`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: Step 0.1 → 0 open PRs; Step 0.2 → 82 open issues → Issue Manager Mode entered; PR Handler Mode and Phases 1–3 stopped)

## Decision Summary

- **Step 0.1 (open PRs):** 0 open PRs (`gh pr list --state open` empty; #1226 verified MERGED) → PR Handler Mode skipped.
- **Step 0.2 (open issues):** 82 open issues → **Issue Manager Mode** entered. No new issues since 2026-02-27 (latest open #789).
- **Step 1 (normalization):** **BLOCKED** — re-probed live this session: `gh issue edit 785 --add-label P3` → `403 GraphQL: Resource not accessible by integration (addLabelsToLabelable)`; `gh issue comment 785` → `403 (addComment)`; `gh api user` → `403`. Confirms loops 85–95: 12 issues missing category label, 38 missing priority label, 13 with multi-category labels.
- **Step 2–3 (dedup/consolidation):** **BLOCKED** — close/label mutations remain 403. `createIssue` also 403 → FAIL-SAFE issue creation unavailable.
- **Step 4 (Repair Mode):**
  - P0 **#496** (distributed rate limiter) — re-verified code-resolved on `main`: `packages/api/src/distributed-rate-limiter.ts` (Redis sliding window + in-memory fallback + `SyncRateLimiter`), wired into `trpc.ts` via `getLimiter().checkAsync()` in `rateLimit()` middleware; tests `distributed-rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts` + fallback-path tests merged via #1198.
  - All 10 P0/P1 issues on paper (#496 P0; #480/#498/#500/#501/#515/#549/#550/#551/#581 P1) **independently re-verified code-resolved this session** (§ First-Hand Verifications). **No code-fixable P0/P1 defect remains.**
  - **NEW this loop:** E2E cluster **#501/#628/#724 all code-resolved** — `tests/e2e/` contains 11 spec files (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) added by PR #849 ("Add 34 e2e tests… Issue #724", commit `734f286`) plus `e0dd375`/`4c61bb3`. Loop 95 had listed #501 as canonical open P1 — **corrected**.
  - **Real bug still present (workflow-permission blocked):** pnpm/Node-20 CI cluster (#305/#584/#595/#670/#744) — `iterate.yml` still contains `npm ci || true` (lines 72/342) and `node-version: "20"` pins (lines 70/266/340/395); `on-pull.yml` pins `node-version: 20` (line 55). `.nvmrc` requires Node 22.14.0 → version mismatch. **Fix requires editing `.github/workflows/*` → live-tested this session: push rejected** (`refusing to allow a GitHub App to create or update workflow … without workflows permission`).

## First-Hand Verifications This Loop

### New code-resolved confirmations (3, additional to loop 95's list)

| Issue    | Title                                                     | Evidence on `main`                                                                                                                                                                                  |
| -------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#501** | Implement Playwright E2E tests for critical user journeys | `tests/e2e/` — 11 spec files covering auth, subscription, cluster, admin/dashboard, pricing, webhook-error-handling, authorization-bypass, home, billing (PR #849, 34 tests; `e0dd375`, `4c61bb3`). |
| **#628** | Implement E2E testing with Playwright                     | Same `tests/e2e/` suite as #501 (Playwright config `playwright.config.ts` with `testDir: "./tests/e2e"`, `test:e2e` script in root package.json).                                                   |
| **#724** | Missing e2e test coverage for critical flows              | `tests/e2e/critical-flows.spec.ts` (auth boundaries + multi-language routes, commit `e0dd375`); PR #849 closed-reference #724.                                                                      |

### Re-confirmed resolved (loop 95's 13 + 18, spot-checked this session)

- **#496** (P0, Redis rate limiter) — `distributed-rate-limiter.ts` + wiring + tests present (§ above).
- **#498** (P1, DB-role RBAC) — `trpc.ts` `adminProcedure`: DB role check first (`userRecord?.role === "ADMIN"`, `method: "database_role"`), `ADMIN_EMAIL` fallback retained as documented migration path; `rbac.test.ts` present.
- **#515** (P1, CSRF) — `apps/nextjs/src/proxy.ts` CSRF Origin/Referer validation; CSRF origin guard added to tRPC edge route (commit `1a3927d`).
- **#500** (P1, Clerk auth tests) — `apps/nextjs/src/utils/clerk.test.ts` (commit `ea9c18f`).
- **#549** (P1, auth module tests) — `packages/auth/env.test.ts` + `packages/auth/clerk.test.ts` (commit `97adb6d`).
- **#550** (P1, apps/nextjs in coverage) — `vitest.config.ts` line 16: `include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`.
- **#551** (P1, k8s router tests) — `packages/api/src/router/k8s-router.test.ts` + `k8s.test.ts` (commit `396b129`).
- **#581** (P1, testing infra) — `packages/api/src/test-utils.ts` + 96 test files / 1711 tests passing.
- **#480** (P1, dup of #496) — resolved with #496.
- **#786** (Stripe webhook secret) — `packages/stripe/src/webhooks.ts` logs only `{ eventType }` via pino; no secret field.
- **#722** (env validation) — `packages/api/src/env.mjs` `createEnv` + zod schemas; env startup validation tests (commit `5f4c15a`).
- **#721** (authorization beyond auth) — `trpc.ts` adminProcedure DB role check (§ above).
- **#483** (Stripe transactions) — `packages/stripe/src/webhooks.ts` `db.transaction().execute()`.
- **#486** (OpenTelemetry) — `trpc.ts` `@opentelemetry/api` spans; commit `f19a317`.
- **#488** (circular dep CI) — root `check:circular` = `madge --circular --warning …` wired into `ci:check`/`dx:check`.
- **#613** (duplicate workflow) — `.github/workflows/` = exactly `iterate.yml` + `on-pull.yml`.
- **#697** (docs corruption) — fixes merged (#697/#810/#770/#1219).
- **#632** (sensitive logging) — `console.log` only in JSDoc comments (`packages/stripe/src/client.ts`/`integration.ts`); runtime uses pino.
- **#580** (monitoring/logging infra) — `packages/api/src/logger.ts` (pino).
- **#785/#789/#748/#683/#579/#611/#755/#485/#705/#706/#684/#631/#713/#787/#788/#754/#688/#610/#663/#687/#667/#590/#723/#751/#753/#752/#494** — unchanged from loop 95 verdicts (resolved / partial / audit-type as previously documented).

### Health baseline re-verified fresh on `main` (Node 20.20.2, pnpm 10.28.2)

| Check     | Command                         | Result                                                                                      |
| --------- | ------------------------------- | ------------------------------------------------------------------------------------------- |
| Install   | `pnpm install --prefer-offline` | OK (8s)                                                                                     |
| Typecheck | `pnpm typecheck`                | **9/9 tasks pass**                                                                          |
| Lint      | `pnpm lint`                     | **9/9 tasks pass** (0 warnings)                                                             |
| Test      | `pnpm test`                     | **96 files / 1711 tests pass** (up from 87/1625 in loop 52)                                 |
| Build     | `pnpm build`                    | NOT runnable — only Node 20.20.2; known `webidl` failure on Node 20 (`.nvmrc` pins 22.14.0) |

## Duplicate Clusters (9 issues across 5 clusters — closure blocked pending `issues: write`)

1. **Rate limiter:** #480 ↔ #496 → canonical #496 (P0, acceptance criteria + OWASP ref).
2. **pnpm-in-CI:** #305 ↔ #584 ↔ #595 ↔ #670 ↔ #744 → canonical #305 (earliest, most comprehensive). Same root cause as the live `iterate.yml`/`on-pull.yml` bug (§ Decision Summary).
3. **E2E/Playwright:** #501 ↔ #628 ↔ #724 → all three **code-resolved** (PR #849 + follow-ups) — closure now purely administrative.
4. **API router tests:** #551 ↔ #631 ↔ #725 → canonical #631; all code-resolved (k8s-router.test.ts, integration.test.ts present).
5. **tRPC API docs generation:** #731 ↔ #749 → canonical #731; #749's AI-test-generation angle to be preserved if consolidated.

## Required Human Actions (unblock list — unchanged, plus one correction)

1. Add `issues: write` to the loop workflow (`on-pull.yml`) → unblocks normalization (12 missing category / 38 missing priority / 13 multi-category), the 5 duplicate clusters, and closing 70+ verified-resolved issues.
2. Add `workflows: write` → unblocks the pnpm/Node-20 CI fix (5-issue cluster #305/#584/#595/#670/#744), #728 security scanning deployment, #502/#522/#726.
3. **Correction to loop 95:** E2E cluster #501/#628/#724 is **code-resolved** (not open) — only closure pending.
4. Triage stale proposals: #636 (ISR on personalized data → cross-user leakage risk), duplicate clusters above.
5. Schedule Phase-2/3: #494 (domain layer), #749/#668 (AI features), #667/#634/#590 (audits), #723/#751/#753 (bundle/performance).

## Action Log

| Timestamp (UTC) | Action               | Target                                          | Result                                                                                                  |
| --------------- | -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------- |
| 01:0x           | Entry decision       | PRs / issues                                    | 0 open PRs; 82 open issues → Issue Manager Mode                                                         |
| 01:0x           | Token probe          | issue label mutation                            | `addLabelsToLabelable` 403 → Steps 1–3 blocked (re-confirmed)                                           |
| 01:0x           | Token probe          | `addComment` / `createIssue`                    | 403 → FAIL-SAFE issue creation unavailable                                                              |
| 01:0x           | Push probe           | git branch push                                 | ✅ `docs/…loop96` branch pushed (contents: write works)                                                 |
| 01:0x           | Push probe           | `.github/workflows/iterate.yml`                 | ❌ rejected — `workflows` permission missing (fix cluster #305/#584/#595/#670/#744 blocked)             |
| 01:0x           | PR probe             | `gh pr create`                                  | ✅ PR creation works (needs commit)                                                                     |
| 01:0x           | Duplicate scan       | 82 open issues                                  | 5 duplicate clusters confirmed (9 issues), unchanged                                                    |
| 01:0x           | Repair selection     | P0 #496                                         | ✅ code-resolved (rate limiter + tests + wiring on `main`)                                              |
| 01:0x           | **New verification** | **#501 #628 #724**                              | ✅ **E2E cluster code-RESOLVED** — 11 spec files in `tests/e2e/` (PR #849, 34 tests) — corrects loop 95 |
| 01:0x           | Re-verify            | #498 #500 #515 #549 #550 #551 #581 #480         | ✅ all code-resolved (evidence above)                                                                   |
| 01:0x           | Health baseline      | typecheck/lint/test                             | ✅ 9/9, 9/9 (0 warnings), 96 files / 1711 tests pass                                                    |
| 01:0x           | Bug re-verify        | pnpm/Node-20 CI cluster                         | Real bug present (`npm ci                                                                               |     | true`, Node 20 pins vs `.nvmrc` 22.14.0); workflow-file push blocked |
| 01:0x           | Audit report         | `docs/issue-manager-audit-2026-08-12-loop96.md` | Written (this file)                                                                                     |

## Skills & Agents Used

- **Skill:** `github-workflow-automation` — validated the GitHub App token permission model again: issue mutations (label/create/comment/close) all 403; workflow-file pushes rejected without `workflows` permission (live-tested); branch push + PR creation work.
- **Skills evaluated but not applicable:** `security-research` (no new attack surface — #515/#632/#721/#786/#688 controls confirmed present), `planning-with-files` (single-phase state-machine run), `obra-superpowers-systematic-debugging` (no code-level defect to debug — all P0/P1 code issues verified resolved).
- **Subagents:** None used — issue-state verification performed directly in the orchestrator session with first-hand command evidence (`gh` queries + file/commit inspection); duplicate clusters verified by reading issue bodies and PR references.

## Final State

- **State:** `waiting for human review` — blocked on token permissions (`issues: write`, `workflows: write`).
- **Blocked on:** Step 1–3 (normalization/dedup/consolidation) and the pnpm-CI + workflow-file fixes (#728, #502, #522, #726).
- **New this loop:** E2E cluster #501/#628/#724 confirmed code-resolved (corrects loop 95's open-P1 listing); health baseline re-verified (96 files / 1711 tests).
- **No working-tree changes introduced by this loop** (report is a new doc; branch/PR creation left to the established docs-PR flow).
