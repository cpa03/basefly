# Issue Manager Audit Report — 2026-08-12 (loop 98)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `4c2a92c`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: Step 0.1 → 0 open PRs; Step 0.2 → 82 open issues → Issue Manager Mode entered; PR Handler Mode and Phases 1–3 stopped)

## Decision Summary

- **Step 0.1 (open PRs):** 0 open PRs (`gh pr list --state open` empty) → PR Handler Mode skipped.
- **Step 0.2 (open issues):** 82 open issues → **Issue Manager Mode** entered. Issue set unchanged since 2026-02-27 (latest open #789).
- **Step 1 (normalization):** **BLOCKED** — re-probed live this session with first-hand commands:
  - `gh issue edit 789 --add-label P2` → `403 GraphQL: Resource not accessible by integration (addLabelsToLabelable)`
  - `gh issue create` → `403 (createIssue)`; `gh issue comment 789` → `403 (addComment)`; `gh issue close 789` → `403 (closeIssue)`
  - Token is `github-actions[bot]` (short-lived `ghs_` app token) under `on-pull.yml` which declares `contents: write` + `pull-requests: write` only — **no `issues: write`**.
  - Verified gap: 12 issues missing category label, 38 missing priority label (unchanged from loops 85–97).
- **Step 2–3 (dedup/consolidation):** **BLOCKED** — close/label/create mutations remain 403. FAIL-SAFE issue creation unavailable.
- **Step 4 (Repair Mode):**
  - P0 **#496** (distributed rate limiter) — re-verified **code-resolved** on `main`: `packages/api/src/distributed-rate-limiter.ts` (Redis sliding-window + in-memory fallback + `SyncRateLimiter`) wired into `trpc.ts` rate-limit middleware via `getLimiter().checkAsync()`; tests `distributed-rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts` present; setup documented in `docs/redis-setup.md` (references #496). Delivered by PR #627 + follow-ups.
  - All 10 P0/P1 issues on paper (#496 P0; #480/#498/#500/#501/#515/#549/#550/#551/#581 P1) **re-verified code-resolved this session** (§ First-Hand Verifications). **No code-fixable P0/P1 defect remains on `main`.**
  - **Live bug still present (workflow-permission blocked):** pnpm/Node-20 CI cluster (#305/#584/#595/#670/#744) — `iterate.yml` still contains `npm ci || true` (lines 72/342) and `node-version: "20"` pins (lines 70/266/340/395); `on-pull.yml` pins `node-version: 20` (line 55) while `.nvmrc` requires 22.14.0 and `package.json` requires `node >=22`. Fix requires editing `.github/workflows/*` → **live-tested this session: push rejected** (`refusing to allow a GitHub App to create or update workflow … without workflows permission`).
  - **No code change between loops:** `git log 1baf277..HEAD` shows only the loop 97 audit report commit (4c2a92c) — repo state identical to loop 97 apart from that doc.

## First-Hand Verifications This Session (all fresh, loop 98)

### P0/P1 code-resolved (re-confirmed with file/commit evidence)

| Issue    | Title                                        | Evidence on `main`                                                                                                                                                                                                                                                                                     |
| -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **#496** | P0 Replace in-memory rate limiter with Redis | `packages/api/src/distributed-rate-limiter.ts` (Redis sliding-window + in-memory fallback + `SyncRateLimiter`), `rateLimit()` middleware calls `getLimiter().checkAsync()`; tests `distributed-rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts`; `docs/redis-setup.md` documents setup. |
| **#480** | P1 Redis-based rate limiter (dup of #496)    | Resolved with #496 — duplicate cluster 1.                                                                                                                                                                                                                                                              |
| **#498** | P1 Email-based admin RBAC → role-based       | `trpc.ts` `adminProcedure`/`createRoleBasedProcedure` (DB role lookup, `method: "database_role"`); `packages/api/src/rbac.test.ts` present.                                                                                                                                                            |
| **#500** | P1 Clerk authentication flow tests           | `apps/nextjs/src/utils/clerk.test.ts` + `apps/nextjs/src/lib/admin-access.test.ts` present.                                                                                                                                                                                                            |
| **#501** | P1 Playwright E2E critical journeys          | `tests/e2e/` — 12 files (11 spec + fixtures: auth, subscription-workflows, cluster, admin, dashboard, pricing, billing, home, critical-flows, authorization-bypass, webhook-error-handling); `playwright.config.ts` with `testDir: "./tests/e2e"`.                                                     |
| **#515** | P1 CSRF protection                           | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` present.                                                                                                                                                                                                                                                |
| **#549** | P1 packages/auth tests (0% coverage)         | `packages/auth/env.test.ts` + `packages/auth/clerk.test.ts` present.                                                                                                                                                                                                                                   |
| **#550** | P1 apps/nextjs in coverage config            | `vitest.config.ts` line 16: `include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`.                                                                                                                                                                                                    |
| **#551** | P1 k8s router tests                          | `packages/api/src/router/k8s-router.test.ts` + `k8s.test.ts` + `schemas-enhanced.test.ts` present.                                                                                                                                                                                                     |
| **#581** | P1 Consolidate testing infrastructure        | `packages/api/src/test-utils.ts`; 96 test files / 1711 tests passing this session.                                                                                                                                                                                                                     |

### Health baseline re-verified fresh on `main` (Node 20.20.2, pnpm 10.28.2)

| Check     | Command                         | Result                                                                                                                                                                                                                               |
| --------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Install   | `pnpm install --prefer-offline` | OK (7.6s)                                                                                                                                                                                                                            |
| Typecheck | `pnpm typecheck`                | **9/9 tasks pass**                                                                                                                                                                                                                   |
| Lint      | `pnpm lint`                     | **9/9 tasks pass** (0 warnings)                                                                                                                                                                                                      |
| Test      | `pnpm test`                     | **96 files / 1711 tests pass** (25.0s)                                                                                                                                                                                               |
| Build     | `pnpm build`                    | NOT runnable — only Node 20.20.2 available; `webidl.util.markAsUncloneable is not a function` failure (known Node 20 vs Next.js 16.2.11/workerd incompatibility; `.nvmrc` pins 22.14.0) — environment limitation, not a code defect. |

## Duplicate Clusters (9 issues across 5 clusters — closure blocked pending `issues: write`)

1. **Rate limiter:** #480 ↔ #496 → canonical #496 (P0, acceptance criteria + OWASP ref). Both code-resolved.
2. **pnpm-in-CI:** #305 ↔ #584 ↔ #595 ↔ #670 ↔ #744 → canonical #305 (earliest, most comprehensive). Same root cause as the live `iterate.yml`/`on-pull.yml` bug (§ Decision Summary) — fix blocked by `workflows` permission.
3. **E2E/Playwright:** #501 ↔ #628 ↔ #724 → all three **code-resolved** (11 spec files in `tests/e2e/`) — closure purely administrative.
4. **API router tests:** #551 ↔ #631 ↔ #725 → canonical #631; all code-resolved (`k8s-router.test.ts`, `integration.test.ts`, `k8s.test.ts` present).
5. **tRPC API docs generation:** #731 ↔ #749 → canonical #731; #749's AI-test-generation angle preserved if consolidated.

## Required Human Actions (unblock list — unchanged)

1. Add `issues: write` to the loop workflow (`on-pull.yml`) → unblocks normalization (12 missing category / 38 missing priority / 13 multi-category), the 5 duplicate clusters, and closing 70+ verified-resolved issues.
2. Add `workflows: write` → unblocks the pnpm/Node-20 CI fix (5-issue cluster #305/#584/#595/#670/#744), #728 security scanning deployment, #502/#522/#726.
3. Triage stale proposals: #636 (ISR on personalized data → cross-user leakage risk), #668 (AI cluster diagnostics), #749/#731 (AI docs/test generation), #667/#634/#590 (audits), #723/#751/#753 (bundle/performance), #494 (domain layer).
4. Build verification requires Node 22 in the runner (`.nvmrc` = 22.14.0) — currently only Node 20.20.2 available, causing the known webidl build failure.

## Action Log

| Timestamp (UTC) | Action           | Target                                          | Result                                                                                      |
| --------------- | ---------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 07:0x           | Entry decision   | PRs / issues                                    | 0 open PRs; 82 open issues → Issue Manager Mode                                             |
| 07:0x           | Token probe      | issue label mutation (#789)                     | `addLabelsToLabelable` 403 → Steps 1–3 blocked (re-confirmed)                               |
| 07:0x           | Token probe      | `createIssue` / `addComment` / `closeIssue`     | All 403 → FAIL-SAFE issue creation unavailable                                              |
| 07:0x           | Push probe       | `.github/workflows/iterate.yml` (test branch)   | ❌ rejected — `workflows` permission missing (fix cluster #305/#584/#595/#670/#744 blocked) |
| 07:0x           | Duplicate scan   | 82 open issues                                  | 5 duplicate clusters confirmed (9 issues), unchanged                                        |
| 07:0x           | Repair selection | P0 #496 + 9 P1s                                 | ✅ all code-resolved on `main` (evidence § above); no fixable P0/P1 defect                  |
| 07:1x           | Health baseline  | typecheck / lint / test                         | ✅ 9/9; 9/9 (0 warnings); 96 files / 1711 tests pass                                        |
| 07:1x           | Build check      | `pnpm build`                                    | ❌ Node 20 only → webidl failure (documented env limitation; `.nvmrc` = 22.14.0)            |
| 07:2x           | Audit report     | `docs/issue-manager-audit-2026-08-12-loop98.md` | Written (this file)                                                                         |

## Skills & Agents Used

- **Skill:** `github-workflow-automation` — validated the GitHub App token permission model first-hand: issue mutations (label/create/comment/close) all 403; workflow-file pushes rejected without `workflows` permission (live-tested); branch push + PR creation work (loop 97's #1229 created+merged by the same app).
- **Skills evaluated, not applicable:** `security-research` (no new attack surface — #515/#632/#721/#786/#688 controls confirmed present), `planning-with-files` (single-phase state-machine run), `obra-superpowers-systematic-debugging` (no code-level defect to debug — all P0/P1 code issues verified resolved).
- **Subagents:** None — issue-state verification performed in the orchestrator session with first-hand command evidence (`gh` queries, file inspection, git history, live push probes).

## Final State

- **State:** `waiting for human review` — blocked on token permissions (`issues: write`, `workflows: write`).
- **Blocked on:** Step 1–3 (normalization/dedup/consolidation) and the pnpm-CI + workflow-file fixes (#728, #502, #522, #726).
- **No working-tree changes introduced by this loop** beyond this report doc (branch/PR creation follows the established docs-PR flow).
