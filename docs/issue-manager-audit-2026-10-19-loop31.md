# Issue Manager Audit — 2026-10-19 (loop 31)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-18 23:55 – 2026-10-19 00:05 UTC                                                                                                                                                                                                                              |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                                |
| DEFAULT_BRANCH        | `main` (auto-detected; `97cdbd6` = PR #1582 merge, loop-30 audit; synced at run start — `git merge --ff-only origin/main` → "Already up to date")                                                                                                                    |
| Phase 0.1 open PRs    | **0** → not PR HANDLER MODE (loop-30's audit PR #1582 merged after loop 30 ended waiting-for-review)                                                                                                                                                                 |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical number set to loops 7–30 — no drift; set hash `2e2b5101`)                                                                                                                                                                 |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                                 |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403 (§4)                                                                                                                                                                                 |
| Skills used           | `openx-basefly` (repo harness conventions, docs-audit PR pattern); `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `commit-message` unavailable (not in skill registry — conventional `docs:` style applied manually) |
| Subagents             | 2× `explore` background attempts **failed** (`ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free`) → **fallback: full first-hand verification by orchestrator** (all §1–§3 evidence collected directly)                                            |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **0 open PRs** → fall through to Phase 0.2.
2. **Phase 0.2**: `gh issue list --state open` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (no findings-issues created; issue creation is out of phase and 403-blocked anyway).
3. Drift check: issue number set `[305, 480, 483, …, 789]` (82 numbers, hash `2e2b5101`) identical to loops 7–30 → **no drift**; local `main` already at `origin/main` = `97cdbd6` (loop-30 audit merge #1582).
4. STEP 1: label matrix recomputed independently → **33 compliant / 49 remediation** — exact match with loops 7–30 (all five remediation partitions match item-for-item) → no-drift rule applies; write attempt re-probed → **403** (§1, §4).
5. STEP 2/3: duplicate clusters D1–D7 re-derived from the issue set → unchanged; **D1 bodies compared first-hand this run** (#480 vs #496: identical in-memory→Redis rate-limiter problem, #496 = P0 canonical); active close probe (`PATCH /issues/480 state=closed`) → **403**; #480 re-verified **still OPEN** (no side effect).
6. STEP 4: **#496** (only P0) re-verified code-complete **first-hand this run**: 3 rate-limiter test files → **98/98 passed** (1.17s) at `97cdbd6`; acceptance-criteria evidence: `.env.example:124,128-132` (`REDIS_URL` + `RATE_LIMIT_*`), `docs/redis-setup.md` exists, in-memory fallback with warning log (`distributed-rate-limiter.ts:174`). Full P0/P1 file-presence set re-verified (§3).
7. **Loop-31 delta — #634 claim disproven**: `tooling/typescript-config/base.json:9` sets `"strict": true`; root `tsconfig.json` **and all 7 workspace tsconfigs** (packages/api, auth, common, db, stripe, ui, apps/nextjs) extend `@saasfly/typescript-config/base.json` → strictness is enabled repo-wide; `pnpm typecheck` runs as a CI gate. Issue premise ("may not have strict explicitly enabled / packages may differ") is **stale** — administrative close requires issue write → 403 → recorded here (FAIL-SAFE).
8. **Loop-31 delta — #630 partially implemented**: `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm check-deps`, `pnpm lint-staged` → Acceptance Criteria 1–2 met (typecheck + tests on pre-commit). AC3 ("total <30s") likely **violated**: this run's full `pnpm test` gate = 46s (plus typecheck 14s + lint via lint-staged) → pre-commit runs the _full_ suite, not a "quick subset". Verdict: **partial** — recorded, not closed (403).
9. Stale-set re-confirmations this run (§3): #697 (zero U+FFFD outside audit docs), #578 (exactly one health route), #785 (no `next` dep in packages/stripe), #720/#748 (`.nvmrc` = `22.14.0`), #719 (root tsconfig.json exists, extends base), #722 (`env.mjs`, 17 zod lines), #721 (`adminProcedure` at `trpc.ts:331`), #635 (`docs/ONBOARDING.md`), #664 (0 runtime `console.*` — all 10 raw matches are doc-comment examples; pino `logger.ts` in both packages), #731 (`openapi.ts` + `api/docs/route.ts`), #501/#628/#724 (11 e2e specs), #789 (peerDeps `{next, react, react-dom}` present).
10. Genuinely-open re-confirmations this run: **#494** (0 `domain/` dirs), **#723** (36/127 `.tsx` with `"use client"` = 28% — matches loops 28–30 exactly), **#650** (inline `ulw-loop` prompt at `on-pull.yml:76`), **#502** (only `iterate.yml` + `on-pull.yml` exist), **D2** (`iterate.yml` `npm ci || true` at lines 72, 342; 0 pnpm occurrences) — the latter three all touch workflow files → **platform-blocked** (§4).
11. **#708 / #751 stand re-verified**: `@next/bundle-analyzer@16.2.7` (`apps/nextjs/package.json:68`), `size:check`/`size:analyze` scripts (`:18-19`), `turbopack: {}` at `next.config.mjs:156` (analyzer HTML report inert under Turbopack — loop-30 refinement stands); `pnpm size:check` **green this run**: Client JS **612.99/800 kB**, CSS **20.13/120 kB**, Media **260.03/300 kB** gzip; `lazy()` route splitting present (`packages/api/src/edge.ts:17-21`). #708 = partially implemented (budgets work, HTML report missing); #751 = partially implemented / measurement-baseline-blocked (≥10% historical DoD still open).
12. Permission probes **first-hand this run** (three surfaces): issue label POST → **403**; issue comment GraphQL (`addComment` on #496) → **403**; issue close REST (`PATCH /issues/480`) → **403**; issue reads → OK; #480 confirmed OPEN after probe.
13. Root-cause permission block re-verified: `.github/workflows/on-pull.yml:9-14` permissions block lists `contents`, `pull-requests`, `actions: read`, `repository-projects`, `id-token` — **no `issues: write`** (this loop's workflow); `iterate.yml:13` declares `issues: write` but does not run the loop.
14. FAIL-SAFE: STEP 1 apply, STEP 2/3 closes/consolidations, and STEP 4 administrative closure of #496 all require issue write → **403** → no guessing; durable capture = this audit (established loop pattern).
15. Full green baseline re-established first-hand: **typecheck 9/9 (13.0s), lint 9/9 (49.0s, zero warnings), test 2207/2207 (151 files, 46s), build 1/1 (35.5s)**, plus RL 98/98 and size budgets green → no regression vs loop-30 baseline.
16. **CI anomaly now recurring**: loop-30's own branch run `39171487973` (`docs/issue-audit-2026-10-18-loop30`) → `failure` with **zero jobs** (`jobs: []`) — same signature as loop-29's run `39138816789`. Two consecutive docs-branch runs failed with no recorded jobs, yet both PRs were merged. Recorded for maintainer attention (`actions: read` only — cannot re-run).
17. Subagent note: both `explore` background spawns failed at session start with `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free` (model removed from provider). Verified suggestion lists (`beam-free, deepseek-v4.1-flash-free, glm-5.3-flash-free`). All verification was re-done directly — no evidence gaps. Flagged for agent-harness maintenance (model registry drift in `opencode.json`/`oh-my-opencode.json`).

### Action log

| Timestamp (UTC)  | Action                                    | Target                                    | Result                                                                       |
| ---------------- | ----------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| 2026-10-18 23:55 | Phase 0.1 entry: `gh pr list`             | repo `cpa03/basefly`                      | **0 open PRs** → fall through                                                |
| 23:55            | Phase 0.2 entry: `gh issue list`          | repo                                      | **82 open issues → ISSUE MANAGER MODE**                                      |
| 23:55            | Sync local `main` with `origin/main`      | `main`                                    | Already up to date at `97cdbd6` (loop-30 merge)                              |
| 23:56            | Permission probe (issue label)            | issue 789                                 | **403** `Resource not accessible by integration`                             |
| 23:56            | Permission probe (issue comment, GraphQL) | issue #496                                | **403** GraphQL `addComment`                                                 |
| 23:56            | Permission probe (issue close, REST)      | issue #480 (`state=closed`)               | **403**; #480 re-verified **OPEN** (no side effect)                          |
| 23:56            | D1 body comparison (first-hand)           | #480 vs #496                              | identical RL problem statement; #496 = P0 canonical                          |
| 23:56            | Label matrix recomputation                | all 82 issues                             | **33 compliant / 49 remediation** — exact match (no drift)                   |
| 23:57            | `pnpm install --frozen-lockfile`          | workspace                                 | Done in 7.2s                                                                 |
| 23:57            | Gate: typecheck                           | workspace                                 | **9/9 successful**, 13.0s                                                    |
| 23:58            | Gate: lint                                | workspace                                 | **9/9 successful**, 49.0s (**zero warnings**)                                |
| 23:59            | Gate: test                                | workspace                                 | **2207/2207 passed (151 files)**, 46s                                        |
| 23:59            | Gate: build                               | workspace                                 | **1/1 successful**, 35.5s                                                    |
| 00:00            | STEP 4 verification: rate-limiter tests   | `packages/api/src/*rate-limiter*.test.ts` | **98/98 passed** (1.17s) → #496 code-complete                                |
| 00:00            | #496 acceptance evidence                  | `.env.example`, `docs/redis-setup.md`     | REDIS*URL + 5× RATE_LIMIT*\* vars; docs present; fallback warn at `:174`     |
| 00:00            | P0/P1 file-presence re-verification       | #551/#550/#549/#515/#501/#500/#498/#581   | all present (evidence §3)                                                    |
| 00:00            | Stale-set first-hand re-verification      | 12 claims (§3)                            | all stale as carried                                                         |
| 00:01            | Genuinely-open re-confirmation            | #494/#723/#650/#502/D2                    | all still open; workflow-file items platform-blocked                         |
| 00:01            | #634 first-hand audit                     | `tooling/typescript-config/base.json`     | `strict: true` at `:9`; all 7 workspace tsconfigs extend base → **stale**    |
| 00:01            | #630 first-hand audit                     | `.husky/pre-commit`                       | typecheck+test present → **partial** (46s test > 30s AC3)                    |
| 00:01            | `pnpm size:check`                         | apps/nextjs (size-limit budgets)          | **green**: 612.99/800 kB, 20.13/120 kB, 260.03/300 kB                        |
| 00:02            | Permission block re-verify                | `on-pull.yml:9-14`                        | no `issues: write` declared → root cause confirmed                           |
| 00:02            | CI run inspection                         | `gh run list` + run `39171487973`         | loop-30 branch run `failure` with `jobs: []` (2nd occurrence)                |
| 00:03            | Subagent attempts                         | 2× `explore` background                   | **failed** — `ProviderModelNotFoundError` (muse-spark) → first-hand fallback |
| 00:04            | Create audit branch                       | `docs/issue-audit-2026-10-19-loop31`      | created from `main` (`97cdbd6`)                                              |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–30 → no-drift rule applies.

Remediation partition (re-derived independently this run):

- 24 missing priority only: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- 1 missing category only: `670` (already carries `P3` + non-contract `DX-engineer`)
- 11 missing both: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- 10 multi-category: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- 3 multi-category + missing priority: `305, 584, 713`

Union check: missing-priority = 24 ∪ {305, 584, 713} = **27** ✓; missing-category = {670} ∪ 11 = **12** ✓; multi-category = 10 ∪ {305, 584, 713} = **13** ✓ — identical to loops 7–30 §1.

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=enhancement"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–31 no-flip-flop rule):**

```bash
# format: issue_number:category,priority
# SEMANTICS: for APPLY rows, REPLACE all category labels with the payload category
# and ensure exactly the payload priority.
APPLY=(
  789:enhancement,P3 788:test,P2 787:test,P2 786:security,P1 785:bug,P3
  755:enhancement,P2 754:test,P2 753:enhancement,P2 752:enhancement,P3 751:enhancement,P2
  749:feature,P3 748:bug,P2 744:ci,P2 731:feature,P3 729:test,P3 728:security,P1
  727:feature,P3 726:ci,P3 725:test,P2 724:test,P2 723:enhancement,P3
  722:security,P1 721:security,P1 720:docs,P2 719:chore,P2 713:test,P3
  697:docs,P2 668:feature,P3 636:enhancement,P3 635:docs,P2 634:refactor,P2
  632:security,P2 631:test,P3 630:chore,P3 628:test,P2 595:ci,P3 584:ci,P2 305:ci,P2
  670:ci            # has P3 + non-contract DX-engineer label; ADD category ci (keep P3)
)
# multi-category: replace all category labels with the single primary
MULTI=(713:test 688:security 584:ci 581:test 551:test 550:test 549:test 523:refactor
       522:ci 515:security 498:security 496:security 305:ci)
```

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–30.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters (re-derived)

Clusters unchanged from loops 17–30 (static issue set, no new issues this run):

| ID  | Members                 | Canonical | Disposition                                                                            |
| --- | ----------------------- | --------- | -------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | Close 480 as duplicate of P0 (both Redis RL) — **bodies compared first-hand this run** |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670 (P3, precise scope)                                              |
| D3  | 628, 501, 724           | **501**   | Close 628/724 as duplicates (Playwright E2E)                                           |
| D4  | 631, 725, 754           | **725**   | Close 631/754 as overlapping API test issues                                           |
| D5  | 720, 748                | **748**   | Both stale — `.nvmrc` now `22.14.0` (re-verified this run)                             |
| D6  | 785, 789                | —         | Not duplicates; **789 promoted (loop 26)**; 785 stale (re-verified)                    |
| D7  | 551, 550, 549, 581      | **581**   | Testing-infra umbrella; children already done (re-verified)                            |

STEP 3 consolidation of D2/D3/D4/D7 small issues into their canonicals also requires issue writes.

**Closing/consolidating requires issue write → 403 → blocked (§4). D1 close was actively re-attempted this run** (`PATCH /issues/480 state=closed` after first-hand body comparison: #480 "Replace in-memory rate limiter with Redis-based solution" vs #496 "[P0][Security] Replace in-memory rate limiter with distributed store (Redis)" — same problem statement, #496 = P0 canonical) → **403** `Resource not accessible by integration`; #480 confirmed still OPEN after the probe.

---

## §3 STEP 4 — Repair Mode

### Selection

- P0 exists: **#496** → selected (contract: highest-priority issue).
- Re-verified code-complete **first-hand this run**: `npx vitest run packages/api/src/rate-limiter.test.ts packages/api/src/distributed-rate-limiter.test.ts packages/api/src/distributed-rate-limiter-sync.test.ts` → **3 files, 98/98 tests passed** (1.17s) at `97cdbd6`. Implementation: `distributed-rate-limiter.ts` (`DistributedRateLimiter` Redis sliding-window + `SyncRateLimiter` in-memory fallback with warning at `:174`), `rate-limiter.ts`. Acceptance criteria: env-var config (`.env.example:124,128-132` — `REDIS_URL`, 5× `RATE_LIMIT_*`) ✓, documentation (`docs/redis-setup.md`) ✓, graceful fallback ✓, unit tests ✓ (98/98). Repair action = administrative close → probe `gh issue comment 496` → **403** → FAIL-SAFE (documented here).
- **Full P0/P1 set re-verified (file-presence first-hand this run):**

| Issue | Claim                               | First-hand evidence at `97cdbd6`                                                          |
| ----- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 rate-limiter tests green (this run)** + env/docs/fallback evidence above          |
| #581  | Testing-infra umbrella (P1)         | Children #551/#550/#549/#501/#500 all verified present (rows below) → umbrella satisfied  |
| #551  | k8s router tests (P1)               | `packages/api/src/router/k8s-router.test.ts` exists; in green 2207 suite                  |
| #550  | apps/nextjs in coverage (P1)        | `vitest.config` includes `apps/nextjs/src/**/*.{ts,tsx}` (line 16) + setup file (line 12) |
| #549  | packages/auth tests (P1)            | 3 test files: `logger.test.ts`, `env.test.ts`, `clerk.test.ts` (0%-claim stale)           |
| #515  | CSRF protection (P1)                | `apps/nextjs/src/lib/csrf.ts` (+ `csrf.test.ts`)                                          |
| #501  | Playwright E2E (P1)                 | 11 specs in `tests/e2e/`                                                                  |
| #500  | Clerk auth flow tests (P1)          | `apps/nextjs/src/utils/clerk.test.ts` + `packages/auth/clerk.test.ts`                     |
| #498  | Role-based admin RBAC (P1)          | `apps/nextjs/src/lib/admin-access.ts`, `packages/api/src/rbac.test.ts`                    |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1, bodies compared this run) → covered by #496 verification       |

- **#708 — partially implemented (carried, re-verified this run)**: analyzer dependency (`apps/nextjs/package.json:68`, `@next/bundle-analyzer@16.2.7`), `withBundleAnalyzer` wired in `next.config.mjs`, but `turbopack: {}` at `next.config.mjs:156` → Next 16 Turbopack build does not execute the webpack-config hook → no `.next/analyze` HTML report. Budget-based regression checking works: `pnpm size:check` green this run (612.99/800, 20.13/120, 260.03/300 kB). Blueprint TODO `docs/blueprint.md:1101` unticked.
- **#751 — partially implemented / measurement-blocked**: `lazy()` splitting present (`packages/api/src/edge.ts:17-21`, since `64b82a9`); size-limit numbers above give absolute measurements; historical ≥10% baseline DoD still open → stays partial.
- **#634 — NEW verdict this run: stale (claim disproven)**: `tooling/typescript-config/base.json:9` → `"strict": true`; root + all 7 workspace tsconfigs extend `@saasfly/typescript-config/base.json`; `pnpm typecheck` gate green (9/9). Close requires issue write → 403 → recorded (FAIL-SAFE).
- **#630 — NEW verdict this run: partial**: `.husky/pre-commit` = `pnpm typecheck` + `pnpm test` + `pnpm check-deps` + `pnpm lint-staged` → AC1/AC2 met; AC3 (<30s) violated (full test gate = 46s this run; hook runs full suite, not a quick subset). Recorded (FAIL-SAFE).
- **#755** remains rejected as a repair target (carried from loops 21–30: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — not deterministic here).
- **#636** rejected (carried): `dashboard/page.tsx:34-36` documents "ISR intentionally not used — `force-dynamic` … would leak user-scoped data across users" → intentional design; close as wontfix requires issue write → 403.
- **#697** rejected (stale; re-verified: **zero** U+FFFD in non-audit docs this run), **#578** stale (exactly one health route: `apps/nextjs/src/app/api/health/route.ts`, no tRPC health procedure), **#785** stale (no `next` dep in `packages/stripe`), **#719/#720/#748/#635/#722/#721/#664/#731/#789/#501** stale per §0.9 table → administrative closes all 403-blocked.
- **#728** (per payload = P1) requires new files under `.github/workflows/` → **platform-blocked** (§4 `workflows` permission).
- Genuinely open, non-critical (left per contract minimal/atomic rule): **#494** (no `domain/` dir — 0 matches), **#723** (36/127 = 28% `"use client"` — matches loops 28–30), **#502** (only 2 workflows exist), **#650** (inline prompt at `on-pull.yml:76`), **D2** (`iterate.yml:72,342` `npm ci || true`, 0 pnpm) — all workflow-file work → platform-blocked; **#751/#708** remainder (measurement-baseline / Turbopack-analyzer-blocked); **#630** remainder (hook-runtime <30s redesign); feature-grade items (#749, #668, …).
- Iterate.yml npm→pnpm cluster (D2) → platform-blocked (§4); pre-staged patch `docs/patches/fix-pnpm-consistency-iterate-744.patch` exists for maintainer application (not re-`git apply --check`ed this run — carried clean-apply from loop-30).
- Net: **no safely-implementable issue remains** (all P0/P1 implemented or platform-blocked; remaining candidates are workflow-file-blocked, measurement-baseline-blocked, or intentionally-designed); this loop's deliverable is verification evidence + the **#634/#630 verdicts** + recurring-CI-anomaly note + this audit (established loop 17–30 pattern).

### Stale-set spot re-confirmations (this run at `97cdbd6`)

| Issue          | Claim                                   | Verdict (loop-31, first-hand)                                                   |
| -------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter          | **Re-verified: 98/98 tests green (this run)**                                   |
| #634           | Strict TS may not be enabled            | **NEW: stale — `strict:true` at base.json:9; all 8 tsconfigs extend base**      |
| #630           | Pre-commit lacks typecheck/tests        | **NEW: partial — present, but full-suite 46s violates <30s AC**                 |
| #708           | Bundle analyzer / #751 code splitting   | Partially implemented (both; budget numbers refreshed this run)                 |
| #697           | Corrupted text in docs                  | Stale — zero corruption markers outside audit docs                              |
| #578           | Duplicate health check endpoint         | Stale — exactly one health route, no tRPC health procedure                      |
| #785           | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                                            |
| #720/#748      | `.nvmrc` missing / invalid              | Stale — file exists (`22.14.0`)                                                 |
| #719           | Missing root TypeScript config          | Stale — root `tsconfig.json` exists (extends base)                              |
| #722           | No env validation at startup            | Stale — `apps/nextjs/src/env.mjs` (17 zod lines)                                |
| #721           | No authorization beyond authentication  | Stale — `adminProcedure` at `trpc.ts:331`                                       |
| #635           | No developer onboarding guide           | Stale — `docs/ONBOARDING.md` exists                                             |
| #664           | console.\* in db/stripe                 | Stale — 0 runtime `console.*` (10 doc-comment examples only); pino loggers ✓    |
| #731           | API docs manually maintained            | Stale — `packages/api/src/openapi.ts` + `apps/nextjs/src/app/api/docs/route.ts` |
| #501/#628/#724 | Missing Playwright E2E                  | Stale — 11 e2e specs in `tests/e2e/`                                            |
| #789           | React peerDependencies missing          | Stale — `{next, react, react-dom}` peerDeps present                             |

Closing any of these requires issue write → **403 → blocked (§4)**.

---

## §4 Blocked Write Paths (re-confirmed this run, first-hand)

| Surface                             | Operation                           | Result                                                                |
| ----------------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| Issues (label)                      | `POST .../issues/789/labels`        | **403** `Resource not accessible by integration` (re-probed this run) |
| Issues (close, REST)                | `PATCH .../issues/480 state=closed` | **403** (re-probed; #480 stayed OPEN)                                 |
| Issues (comment, GraphQL)           | `gh issue comment 496 --body …`     | **403** GraphQL `addComment` (re-probed this run)                     |
| Issues (create)                     | —                                   | **403** (carried from loops 19–30; same token/scope class)            |
| CI re-run / dispatch                | `gh run rerun` / `gh workflow run`  | **403** (carried; `actions: read` only)                               |
| Workflow-file push                  | `git push` (`.github/workflows/*`)  | Platform-rejected: GitHub App lacks `workflows` perm                  |
| Branch push (non-WF)                | `git push` (normal files)           | **Allowed** (docs-audit branches are the proof)                       |
| PR create / label / comment / merge | —                                   | **Allowed** (loops 26–30 merged 12+ PRs; PR labels applied loop 28+)  |

Root cause (unchanged, carried from loops 19–30; re-verified first-hand this run):

1. **Token scope**: `.github/workflows/on-pull.yml:9-14` permissions block declares `contents: write`, `pull-requests: write`, `actions: read`, `repository-projects: write`, `id-token: write` — **no `issues: write`** → no issue-side write scopes, no CI re-runs. Note: `iterate.yml:13` declares `issues: write`, but the loop runs under `on-pull.yml`, which does not.
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` cannot create/update any file under `.github/workflows/` without the app's `workflows` permission — blocks shipping fix (1) from inside the loop.

**Suggested maintainer action (unchanged, still highest-leverage):** land `docs/patches/on-pull-issues-write-permission.patch` with a human account / `workflows: write` token — one line — then every future loop can execute the §1 label matrix, §2/§3 closes, and administrative closure of the §3 stale set (including **#496**, verified code-complete, and now **#634**, claim disproven this run). Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2). Third: for #751's ≥10% DoD, record a **historical bundle baseline** (build the pre-`64b82a9` tree or capture size-limit output across the lazy-splitting commit) and/or wire a Turbopack-compatible chunk report for #708's HTML analysis. Also worth maintainer attention: **two consecutive docs-branch CI runs** (loop-29 `39138816789`, loop-30 `39171487973`) concluded `failure` with `jobs: []` — investigate the zero-job failure mode; and the agent harness's `explore` model id (`opencode/muse-spark-1.3-contributor-free`) no longer resolves at the provider (spawns fail with `ProviderModelNotFoundError`) — update `.opencode/oh-my-opencode.json`/`opencode.json` model registry. With loop-26–30 promotions included, an `issues: write`-enabled loop could immediately close **50+** already-verified issues.

---

## §5 Gates (loop 31)

| Gate         | Command                                      | Result                                              |
| ------------ | -------------------------------------------- | --------------------------------------------------- |
| Install      | `pnpm install --frozen-lockfile`             | Done in 7.2s                                        |
| Typecheck    | `pnpm typecheck`                             | **9/9 successful**, 13.0s                           |
| Lint         | `pnpm lint`                                  | **9/9 successful**, 49.0s (**zero warnings**)       |
| Test         | `pnpm test`                                  | **2207/2207 passed (151 files)**, 46s               |
| Build        | `pnpm build`                                 | **1/1 successful**, 35.5s                           |
| RL tests     | `npx vitest run` (3 rate-limiter test files) | **98/98 passed**, 1.17s (first-hand #496 proof)     |
| Size budgets | `pnpm size:check`                            | **green**: 612.99/800, 20.13/120, 260.03/300 kB     |
| Ship         | docs-only PR (this audit)                    | No runtime code touched; last-known-green re-proven |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§4). All §3/§4 evidence collected first-hand this run. Vercel deployment status not re-probed (environmental; docs-only changes unaffected).

---

## §6 Final State

- **waiting for human review** — PR with this audit (labeled `docs` + `P2` per contract — PR-side label write is available even though issue-side is not).
- Unblocked only by a maintainer token/account with `workflows: write` (land the §4 one-line `on-pull.yml` patch first), after which `issues: write`-enabled loops can execute §1 labels, §2/§3 closes (D1's #480 close re-attempted and 403-blocked this run), administrative closure of #496 (verified code-complete) and #634 (claim disproven this run), and closure of the §3 stale set. Second: `actions: write` would let loops investigate/re-run the recurring zero-job docs-branch failures.
- Loop-31 delta vs. loop 30: **zero open PRs at entry** (loop-30's PR #1582 merged to `97cdbd6`); **#634 verdict added** (stale — strict mode is enabled repo-wide with all 8 tsconfigs extending base); **#630 verdict added** (partial — hooks run typecheck+test but full 46s suite violates the <30s AC); **D1 closed-loop evidence** (first-hand body comparison of #480 vs #496 + actively re-attempted close → 403, #480 confirmed OPEN); **recurring CI anomaly**: second consecutive docs-branch run (`39171487973`) failed with `jobs: []`; **subagent infrastructure note**: both `explore` spawns failed on a provider-side model error → full first-hand fallback (no evidence gaps); label matrix re-derived 33/49 with exact-match no-drift confirmation; full P0/P1 set re-verified; full green baseline re-proven (typecheck/lint/test/build/RL/size).
- No destructive actions taken; no force-pushes; issue-side writes remain untouched (403; #480 confirmed OPEN after close probe). Only the docs audit branch was created this run.
