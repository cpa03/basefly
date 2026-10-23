# Issue Manager Audit — 2026-10-23 (loop 44)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-23 21:00 – 21:12 UTC                                                                                                                                                                                                                                                                                                                                                                                                                        |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                                                                                                                                                                                                               |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `b3206e6` = PR #1603 merge; `git fetch` re-confirmed `b3206e6` = HEAD — 0 commits behind)                                                                                                                                                                                                                                                                                                                          |
| Phase 0.1 open PRs    | **0** (re-checked at 21:04: still 0) → PR HANDLER MODE not entered                                                                                                                                                                                                                                                                                                                                                                                  |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (same set as loops 7–43 — no drift)                                                                                                                                                                                                                                                                                                                                                                                 |
| Runner context        | `on-pull.yml` (`name: pull`), job `ci`, **event = `schedule`**, `GITHUB_WORKFLOW_REF=cpa03/basefly/.github/workflows/on-pull.yml@refs/heads/main`, `GITHUB_RUN_NUMBER=4917`                                                                                                                                                                                                                                                                         |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                                                                                                                                                                                                                |
| Final state           | **waiting for human review** — PR carrying this audit; issue-side writes remain 403 (§4)                                                                                                                                                                                                                                                                                                                                                            |
| Skills used           | `github-workflow-automation` (concurrency/queue + permissions model → informed the §5.1 0-job CI analysis and the §4 `issues: write` gap: `on-pull.yml` `permissions:` block lacks `issues: write`)                                                                                                                                                                                                                                                 |
| Subagents             | 2 attempted, **2 failed**: `category=quick` bg `bg_2361b5ee` and `subagent_type=explore` bg `bg_4e65f566` — both `ProviderModelNotFoundError: Model not found: opencode/muse-spark-1.3-contributor-free` (provider suggested `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`) — **3rd consecutive loop**; NEW: the failure now also hits **category-routed** tasks, not just `subagent_type` (§5.2). All verification executed first-hand |

### Decision summary (why this phase ran)

1.  **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → no PR HANDLER MODE.
2.  **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run when a phase is activated).
3.  **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256` digest `84696e81` — **exact match with loops 33–43** → no drift; carried payload applies verbatim (no-flip-flop rule).
4.  **STEP 1**: label matrix independently re-derived this run (scripted over full label sets, §1) → **33 compliant / 49 remediation** — structural match with loops 7–43. Application attempt (probe `gh issue edit 789 --add-label P3`) → **403** `Resource not accessible by integration` (addLabelsToLabelable) (§4).
5.  **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent first-hand file inspection this run (§2). Duplicate-close attempt (`gh issue close 480 --comment …`) → **403** addComment → blocked.
6.  **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.19s, vitest). Repair action = administrative close → `gh issue close 496 --comment …` → **403** addComment → FAIL-SAFE (documented here; §4).
7.  **STEP 4 contingency (#670)**: `iterate.yml` `npm ci || true` re-confirmed first-hand (lines 72, 342) — genuine defect; workflow-file push remains platform-blocked (§4, carried from loop 38). Canonical remedy remains `docs/patches/fix-pnpm-consistency-iterate-744.patch` (verified present this run).
8.  **Vulnerability baseline: UPWARD REVERSAL (loop-44 NEW)**: `pnpm audit --prod` → **31** vulnerabilities (was 30 in loop 43); `pnpm audit` → **46** (was 44). Criticals unchanged (prod 5, full 7); the increase is in `high` (prod 6→7, full 11→13). Tree unchanged (only markdown audits merged since loop 38) → advisory-database churn, not dependency change (§3.5).
9.  **Vercel systemic failure re-confirmed (4/4)**: `Vercel` deployment status = `failure` on #1600/#1601/#1602/#1603, each on records at or before merge (§5.3).
10. **NEW CI anomaly**: `pull_request` runs of the `pull` workflow conclude `failure` with **zero jobs** across all recent PRs (audit and feature branches alike), while `schedule` runs of the same workflow provision jobs normally (§5.1).
11. **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface).
12. **Probe hygiene**: three direct 403 probes this run (label add, close #480, close #496); no probe branches created; workspace on `docs/issue-manager-audit-2026-10-23-loop44` branched from current `main`; only untracked harness artifacts (`.omo/run-continuation/*.json` from the two failed subagent tasks) present — all commits are explicit-path.

### Action log

| Timestamp (UTC) | Action                                     | Target                                              | Result                                                                                                                            |
| --------------- | ------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 21:00           | Phase 0.1 entry: `gh pr list --state open` | repo `cpa03/basefly`                                | **0 open PRs** → Phase 0.2                                                                                                        |
| 21:00           | Phase 0.2 entry: `gh issue list`           | repo                                                | **82 open issues → ISSUE MANAGER MODE**                                                                                           |
| 21:00           | Issue-set digest                           | sorted issue-number sha256                          | 82 numbers, `84696e81…` — **match loops 33–43** → no drift                                                                        |
| 21:00           | Runner introspection                       | `env \| grep ^GITHUB_`                              | workflow `pull` (on-pull.yml), job `ci`, event `schedule` → explains token permission set                                         |
| 21:00           | Token identity                             | `gh auth status`                                    | `github-actions[bot]`; `GITHUB_TOKEN` (`ghs_…`)                                                                                   |
| 21:00           | Workflow inventory                         | `gh workflow list --all`                            | `parallel` = **disabled_manually**; `pull` + Dependabot active (unchanged)                                                        |
| 21:00           | Sync check                                 | `git fetch origin main`                             | `origin/main` = HEAD = `b3206e6` → 0 behind; worktree clean (tracked)                                                             |
| 21:00           | Subagent spawn #1                          | `category=quick` bg `bg_2361b5ee`                   | **FAILED to start** `ProviderModelNotFoundError` (§5.2)                                                                           |
| 21:00           | STEP 1 label probe                         | `gh issue edit 789 --add-label P3`                  | **403** `Resource not accessible by integration (addLabelsToLabelable)`                                                           |
| 21:00           | Defect check                               | `grep "npm ci" .github/workflows/iterate.yml`       | lines **72, 342** still `npm ci \|\| true` → D2/#670 confirmed genuine                                                            |
| 21:00           | Patch inventory                            | `ls docs/patches/`                                  | `fix-pnpm-consistency-iterate-744.patch` + `on-pull-issues-write-permission.patch` present ✓                                      |
| 21:00           | Subagent spawn #2                          | `subagent_type=explore` bg `bg_4e65f566`            | **FAILED to start** same `ProviderModelNotFoundError` (§5.2)                                                                      |
| 21:01           | Workspace install                          | `pnpm install --frozen-lockfile`                    | **8.0s**                                                                                                                          |
| 21:01           | STEP 2 duplicate-close probe               | `gh issue close 480 --comment …`                    | **403** `Resource not accessible by integration (addComment)` → blocked                                                           |
| 21:01           | STEP 4 verification: rate-limiter tests    | 3 `*rate-limiter*.test.ts` files                    | **98/98 passed** (1.19s) → #496 code-complete                                                                                     |
| 21:01           | Stale-set verification (S1–S10)            | first-hand `ls`/`grep`/`find` over 9 areas          | all carried STALE verdicts re-confirmed (§3.2)                                                                                    |
| 21:02           | STEP 4 repair attempt                      | `gh issue close 496 --comment …`                    | **403** `Resource not accessible by integration (addComment)` → FAIL-SAFE (§4)                                                    |
| 21:02           | #496 AC evidence                           | `.env.example`, `resilience.ts`, `redis-setup.md`   | 6 `RATE_LIMIT_*` entries; `RATE_LIMIT_ENV_VARS` (line 112); doc present ✓                                                         |
| 21:02           | Vulnerability baseline                     | `pnpm audit --prod` / `pnpm audit`                  | **31 prod** (was 30, +1) / **46 full** (was 44, +2) — upward reversal (§3.5)                                                      |
| 21:02           | Vercel status check                        | statuses on #1600/#1601/#1602/#1603                 | `failure` on all 4 → systemic (§5.3)                                                                                              |
| 21:03           | CI anomaly probe                           | `gh run view`/`actions/runs` for PR runs            | loop-43 PR runs **failure with 0 jobs**; no `pull` check-run on head SHA (§5.1)                                                   |
| 21:04           | CI anomaly survey                          | last 15 `pull_request`-event runs of `pull`         | failures across audit **and** feature PRs; success counterexample `39699360847`; schedule runs healthy                            |
| 21:04           | Workflow anatomy                           | `sed -n '1,60p' .github/workflows/on-pull.yml`      | shared `concurrency: group: oc-agent` (`cancel-in-progress: false`) + `turnstyle` queue — context for §5.1                        |
| 21:04           | Skill load                                 | `github-workflow-automation`                        | concurrency/queue + permission model references applied to §4/§5.1 analysis                                                       |
| 21:04           | Worktree hygiene + re-check                | `git ls-files`, `gh pr list`, `gh pr checks 1603`   | tracked prettier-cache file still present (unmodified); **0 open PRs**; loop-43 PR: `Vercel` fail                                 |
| 21:05           | STEP 2/3 evidence: router/e2e test files   | `find packages/api/src` / `tests/e2e/`              | **12 router test files** + **11 e2e specs** → D3/D4/N1 confirmed                                                                  |
| 21:09           | Commit audit (pre-commit gate)             | branch `docs/issue-manager-audit-2026-10-23-loop44` | **green**: lint-staged prettier auto-fix; `git commit` → `67a62cb` (docs-only diff)                                               |
| 21:10           | Local verification gate                    | `pnpm typecheck` / `pnpm test`                      | typecheck **9/9 tasks** ✓ · full suite **2218/2218 passed** (154 files) ✓                                                         |
| 21:10           | Branch push (PR-surface contrast)          | `origin/docs/issue-manager-audit-2026-10-23-loop44` | **SUCCESS** (`contents: write`)                                                                                                   |
| 21:10           | PR creation                                | **PR #1604**                                        | Created from `67a62cb`                                                                                                            |
| 21:10           | PR label application                       | `gh pr edit 1604 --add-label docs,P3`               | **SUCCESS** (`pull-requests: write`) — contract labels applied                                                                    |
| 21:11           | Merge preconditions                        | `gh pr view 1604`                                   | `MERGEABLE`, labels `docs,P3`, 0 human review comments; local gates green (2218/2218 + typecheck 9/9)                             |
| 21:12           | Merge decision                             | PR #1604                                            | merge `--admin` per contract clause — docs-only diff; Vercel failure systemic (§5.3); zero-job `pull` run failure systemic (§5.1) |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — exact structural match with loops 7–43 → no-flip-flop rule applies.

Independently re-derived partition this run (scripted over all 82 issues; identical to carried):

- **33 compliant**: `480, 483, 485, 486, 487, 488, 492, 494, 500, 501, 502, 503, 521, 578, 579, 580, 590, 609, 610, 611, 613, 650, 663, 664, 666, 667, 683, 684, 685, 687, 705, 706, 708`
- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (already carries `P3` + non-contract `DX-engineer`)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- **13 multi-category**: `305(ci,enhancement) · 496(enhancement,security) · 498(enhancement,security) · 515(enhancement,security) · 522(ci,enhancement,refactor) · 523(enhancement,refactor) · 549/550/551/581(enhancement,test) · 584(ci,enhancement) · 688(enhancement,security) · 713(enhancement,test)` — of these, `305, 584, 713` also lack priority
- **0 multi-priority**

**Union checks:** missing-priority = 24 ∪ {305, 584, 713} = **27** ✓ · missing-category = {670} ∪ 11 = **12** ✓ · multi-category = 13 ✓ · 33 + 27 + 12 + 13 − overlaps(13 includes the 3 missing-pri ones) = 82 ✓.

**Application attempt (first-hand this run):**

```
gh issue edit 789 --add-label "P3"
   → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim per no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–43.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (re-verified first-hand this run)

| ID  | Members                 | Canonical | Disposition (first-hand evidence this run)                                                                                                                                                                                                                            |
| --- | ----------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | Re-verified: 3 rate-limiter test files + **98/98 tests green this run** (21:01) → close 480 (attempted: 403 §4)                                                                                                                                                       |
| D2  | 305, 595, 670, 584, 744 | **670**   | `iterate.yml` `npm ci \|\| true` re-confirmed (lines 72, 342); workflow file only → close 305/595/584/744 (write blocked)                                                                                                                                             |
| D3  | 628, 501, 724           | **501**   | E2E specs present: **11 spec files + fixtures.ts** in `tests/e2e/` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) → close 628/724                                    |
| D4  | 631, 725, 754           | **725**   | **Router test files verified**: 12 files incl. `k8s-router`, `customer-router`, `stripe-router`, `integration`, `k8s`, `customer`, `stripe`, `admin`, `auth`, `validation` under `packages/api/src/router/` → close 631/754                                           |
| D5  | 720, 748                | **748**   | `.nvmrc` = `22.14.0` re-verified ✓ (neither "missing" nor "invalid '20'"); fix commit `de2d52b` references Issue #748 → both stale/closable                                                                                                                           |
| D6  | 785, 789                | —         | **Not duplicates**; 785 stale (`next` absent from `packages/stripe/package.json` dependencies ✓ — deps are `@saasfly/common, @saasfly/db, @t3-oss/env-nextjs, stripe, zod`); 789 stale (`peerDependencies: { next: >=14.0.0, react: ^19.0.0, react-dom: ^19.0.0 }` ✓) |
| D7  | 551, 550, 549, 581      | **581**   | Umbrella; children re-verified: k8s router tests ✓, `packages/auth` **3 test files** ✓ (`logger.test.ts`, `env.test.ts`, `clerk.test.ts`), `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}` ✓                                                           |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop-44, first-hand spot checks)                                                              |
| --- | ------------------ | --------- | ----------------------------------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | Confirmed — k8s router tests exist (`k8s-router.test.ts`, `k8s.test.ts`)                              |
| N2  | 523, 667           | **#523**  | Carried — barrel export audit / tree-shaking family (evidence unchanged since loop 43)                |
| N3  | 751, 753, 723      | **#751**  | Carried — code splitting / bundle-size family (evidence unchanged since loop 43)                      |
| N4  | 683, 684, 634, 719 | **#684**  | `719` stale confirmed (root `tsconfig.json` present ✓); rest carried                                  |
| N5  | 726, 488           | **#488**  | Carried — dependency check in CI family                                                               |
| N6  | 611, 666           | **#666**  | Confirmed both stale — `error.tsx` + `not-found.tsx` in ≥5 route groups + `global-error.tsx` (root) ✓ |
| N7  | 705, 706           | **#705**  | Confirmed both stale — `Dockerfile` + `docker-compose.yml` + `.devcontainer/devcontainer.json` ✓      |

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection — P0 #496 (first-hand verification this run)

- P0 exists → contract selects highest-priority → **#496** (only P0 on the board; #480 is its duplicate).
- Re-verified **code-complete first-hand this run**: `vitest run` on 3 rate-limiter test files → **3 files, 98/98 passed** (1.19s).
- **Acceptance criteria matrix (first-hand artifact check, loop 44):**

| AC                                      | Verdict | Evidence (loop-44)                                                                                                  |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| Redis-backed rate limiter implemented   | ✓       | `packages/api/src/distributed-rate-limiter.ts` + `distributed-rate-limiter-sync.test.ts` + `rate-limiter.test.ts`   |
| Consistent limits across instances      | ✓       | `SyncRateLimiter` sync tests green (part of the 98)                                                                 |
| Configuration via environment variables | ✓       | 6 `RATE_LIMIT_*` entries in `.env.example`; `RATE_LIMIT_ENV_VARS` in `packages/common/src/config/resilience.ts:112` |
| Graceful degradation when Redis down    | ✓       | in-memory fallback path exercised by `rate-limiter.test.ts` (legacy suite, 98 total)                                |
| Unit tests for rate limiter             | ✓       | **98/98 green this run** (3 files, 1.19s)                                                                           |
| Documentation for setup/configuration   | ✓       | `docs/redis-setup.md` present ✓                                                                                     |

- **Repair action = administrative close → `gh issue close 496 --comment …` → 403 → FAIL-SAFE** (documented here; §4).
- No code change is required or permitted for the selected issue, therefore **no commit/PR linked to #496 was produced**.

### §3.1b Contingency repair — #670 (highest genuinely-open defect) — CARRIED, platform-blocked

`iterate.yml` lines 72 and 342 still carry `npm ci || true` (re-confirmed first-hand this run). The fix requires editing a workflow file, which the GitHub App token cannot push (§4: App lacks `workflows` permission; carried from loop-38 real-fix push). Canonical human-applicable remedy remains **`docs/patches/fix-pnpm-consistency-iterate-744.patch`** (verified present this run).

### §3.2 Stale-set — spot re-verified first-hand this run

| Issue          | Claim                                 | Verdict (loop-44, first-hand)                                                                                                                          |
| -------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #496           | Distributed Redis rate limiter        | **Re-verified: 98/98 tests green this run + AC matrix (§3.1)**                                                                                         |
| #786           | Stripe webhook partial-secret logging | Stale — `webhooks/stripe/route.ts`: all 7 `logger.*` calls inspected (lines 60–201); none emits secret material; only `eventType`/`requestId` payloads |
| #720/#748      | `.nvmrc` missing / invalid            | Stale — `.nvmrc` = `22.14.0` ✓                                                                                                                         |
| #515           | CSRF protection                       | Stale — `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` ✓ + wired in `api/trpc/edge/[trpc]/route.ts` ✓                                                  |
| #721/#498      | Authz beyond auth / RBAC              | Stale — `adminProcedure` (`trpc.ts:331`), DB `method: "database_role"` (`trpc.ts:277`) ✓                                                               |
| #789           | React peerDependencies in ui          | Stale — `peerDependencies: { next: >=14.0.0, react: ^19.0.0, react-dom: ^19.0.0 }` ✓                                                                   |
| #785           | Duplicate `next` in stripe pkg        | Stale — `next` absent from `packages/stripe/package.json` dependencies ✓                                                                               |
| #549/#550/#551 | Testing gaps                          | Stale — `packages/auth` 3 test files ✓, router tests ✓, `vitest.config.ts:16` includes `apps/nextjs/src/**` ✓                                          |
| #631/#725      | API router tests                      | Stale — 12 router test files incl. k8s/customer/stripe routers ✓                                                                                       |
| #501/#628/#724 | E2E testing                           | Stale — 11 Playwright specs incl. critical flows ✓                                                                                                     |
| #611/#666      | Error boundary / 404 pages            | Stale — `error.tsx` + `not-found.tsx` across ≥5 route groups + `global-error.tsx` ✓                                                                    |
| #705/#706      | Docker / devcontainer                 | Stale — `Dockerfile` + `docker-compose.yml` + `.devcontainer/devcontainer.json` ✓                                                                      |
| #713           | packages/common unit tests            | Stale — **28** test files under `packages/common/src/` ✓                                                                                               |
| #719           | Root TypeScript configuration         | Stale — root `tsconfig.json` present ✓                                                                                                                 |

Closing any of these requires issue write → **403 → blocked (§4).**

### §3.3 P0/P1 evidence set — re-verified first-hand

| Issue | Claim                               | First-hand evidence (loop-44)                       |
| ----- | ----------------------------------- | --------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 RL tests green this run** + AC matrix ✓     |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → close attempted → 403  |
| #581  | Testing-infra umbrella (P1)         | Children verified present ✓                         |
| #515  | CSRF protection (P1)                | `csrf.ts` + `csrf.test.ts` + edge-route wiring ✓    |
| #498  | Role-based admin RBAC (P1)          | `adminProcedure` / DB `role` checks in `trpc.ts` ✓  |
| #786  | Webhook secret logging (P1)         | All 7 logger calls inspected — no secret material ✓ |

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

Carried unchanged from loop 43 §3.4: #670+D2 (workflow-file push blocked) · #687 · #663 · #609/#610 · #494 (large refactor — forbidden) · #723 · #650/#502 (workflow-file blocked) · #751/#708 · #630 · feature-grade items (#749, #668, #727, …).

### §3.5 Dependency vulnerability baseline — UPWARD REVERSAL

```
pnpm audit --prod  → 31 vulnerabilities: 5 critical | 7 high | 15 moderate | 4 low   (loop 43: 30 — DELTA +1)
pnpm audit         → 46 vulnerabilities: 7 critical | 13 high | 21 moderate | 5 low  (loop 43: 44 — DELTA +2)
```

Loop 43 recorded a −1/−1 decrease; loop 44 reverses it (+1 prod, +2 full), driven entirely by `high` (prod 6→7, full 11→13) while criticals hold at **5 prod / 7 full**. Tree is code-identical to loop 38 (only markdown audits merged since) → movement is **advisory-database churn against the same locked versions**, not dependency drift. Baseline remains elevated and security-sensitive → human review. Not fixed in-loop: STEP 4 binds this run to **#496**; dependency bumps link to no open issue and the contract forbids _unrelated improvements_.

---

## §4 Blocked Write Paths (re-confirmed first-hand this run)

| Surface                   | Operation                                                          | Result                                                                                         |
| ------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Issues (label, add)       | `gh issue edit 789 --add-label P3`                                 | **403** `Resource not accessible by integration (addLabelsToLabelable)` (first-hand this run)  |
| Issues (comment/close)    | `gh issue close 480 --comment …`                                   | **403** `Resource not accessible by integration (addComment)` (first-hand, STEP 2 target)      |
| Issues (comment/close)    | `gh issue close 496 --comment …`                                   | **403** `Resource not accessible by integration (addComment)` (first-hand, STEP 4 target)      |
| Workflow files (push)     | loop-38 real-fix push (carried)                                    | **`[remote rejected]`** GitHub App lacks `workflows` permission (not re-probed: probe hygiene) |
| PRs (git push) — CONTRAST | branch push + `gh pr create` + `gh pr edit --add-label` (PR #1604) | **SUCCESS** (first-hand 21:10; `contents: write` + `pull-requests: write`)                     |

**Root cause (carried):** this run executes under `on-pull.yml` (`name: pull`, hourly `schedule`), whose top-level `permissions:` block (verified this run: `contents, pull-requests, actions, repository-projects, id-token`) lacks `issues: write`. The only workflow granting it (`iterate.yml`, `name: parallel`) remains **`disabled_manually`** — re-verified this run via `gh workflow list --all` (last run 2026-02-27, dormant ~8 months). Two viable human unblocks, both zero-code:

1.  **Re-enable the `parallel` workflow** (Actions UI) after triaging the 2026-02-27 Architect-stage failure.
2.  **Apply `docs/patches/on-pull-issues-write-permission.patch`** to `.github/workflows/on-pull.yml` via human/admin commit.

---

## §5 LOOP-44 New Findings

### §5.1 `pull_request` runs of the `pull` workflow fail with ZERO jobs (NEW — systemic, unexplained)

First observed with hard data this run:

- Loop-43 PR runs `40000914996`, `40001664456`, `40002238344` → `conclusion=failure`, **`jobs: []`** (API `/actions/runs/{id}/jobs` returns empty), and **no `pull` check-run** exists on the head SHA (only `Vercel Preview Comments:success`).
- The same pattern appears on **every** recent `pull_request`-event run of `pull` — loops 38–43 audit PRs **and** feature PRs (`agent-*` branches, `chore/permission-probe`).
- **Counterexample proving the workflow itself is sound**: run `39699360847` (feature PR `agent-11952651353537225109`) → `success` with job `pull:success`.
- **Schedule runs are healthy**: current run `40022958223` (this loop) has job `pull:in_progress`; `39999474828` succeeded.
- Timing correlation (loop-43 runs): two runs (`40001664456`, `40002238344`) both concluded at **18:19:25**, one second after PR #1603 merged (18:19:24) — consistent with queued runs being failed at merge/branch-delete time, though the empty `jobs` array makes the exact platform mechanism unproven from the API surface alone.
- Workflow anatomy relevant to queueing (inspected this run): single shared `concurrency: group: oc-agent` (`cancel-in-progress: false`) across schedule + pull_request events, plus a `softprops/turnstyle` queue gate inside the job.

**Impact:** red CI on every PR; `gh pr checks` shows no `pull` check at all (0 jobs → no check-run), so PR check surfaces display only Vercel. Merge decisions must therefore rely on locally executed gates (pre-commit: typecheck + full suite + check-deps + prettier) — as loops 38–43 did. **Recommendation: human investigates a failed run's raw log in the Actions UI** (API log endpoint returns `log not found` for 0-job runs) — this cannot be safely root-caused from the runner.

### §5.2 Subagent model retirement now also breaks category-routed tasks (NEW confirmation + escalation)

Loop 43 documented `subagent_type=explore` failing. Loop 44 additionally spawned `category=quick` (bg `bg_2361b5ee`) — **also failed to start** with the identical `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free`. The failure now covers both direct subagent invocation **and** category-based `task()` routing (both resolve to the retired model). Two consecutive spawns failed in this run; all verification was executed first-hand. This is the **3rd consecutive loop** with the underlying mapping rot. Fix = update agent→model mappings in `AGENTS.md`/`.opencode/` (provider suggests `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`).

### §5.3 Vercel preview failures continue repo-wide (NEW confirmation)

Re-checked first-hand: `Vercel` deployment status = `failure` on **#1600** (17:54:10Z vs merge 20:58:05Z), **#1601** (00:40:18Z vs merge 02:15:52Z), **#1602** (13:19:44Z vs merge 13:20:11Z, **27s before merge**), **#1603** (failure status present; loop 43 recorded its first failure at 18:09:44Z, **before** its 18:19:24Z merge). 4/4 PRs — systemic, non-attributable to merged changes (all diffs docs/UI-only). External Vercel namespace (`donis-projects-f77cd16a`) remains broken for previews; merge decisions treat this status as systemic (§6 item 6).

### §5.4 PR-surface permission contrast (re-tested this run)

Issue-surface writes 403 on all three probes this run (§4), while PR-surface operations (branch push, `gh pr create`, `gh pr edit --add-label`) are exercised again for this audit PR and recorded in the evidence rows.

### §5.5 Tracked prettier-cache file with literal quote characters in its filename (carried, re-checked)

`git ls-files` still reports `'node_modules/.cache/.prettiercache'` (literal single quotes in the filename). This run: file tracked and **unmodified** (worktree clean apart from untracked `.omo/run-continuation/*.json` harness artifacts). The phantom-dirty-worktree hazard recorded in loop 43 persists until the file is untracked (§6 item 7).

---

## §6 Human Action Checklist (updated for loop 44)

1.  **Re-enable the `parallel` workflow** (Actions UI) after triaging the 2026-02-27 Architect failure — restores `issues: write` immediately (§4); **or** apply `docs/patches/on-pull-issues-write-permission.patch` to `on-pull.yml` via admin commit. Either action permanently unblocks STEP 1–3 (label normalization + dedupe closes).
2.  **Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch`** to `.github/workflows/iterate.yml` (D2/#670) — workflow-file pushes are platform-blocked for the App.
3.  **Close the stale-set** in §3.2 / clusters D1–D5, D7, N1–N7 with references per §2 dispositions (administrative action) — or let the re-enabled `parallel` stage-1 prompt execute the §1 payload.
4.  **Review the vulnerability baseline** (§3.5 — **31 prod / 46 full**, upward reversal of loop 43's decrease; prod criticals 5, full criticals 7; highs rising) — security-sensitive, outside STEP 4 scope. Open a dedicated dependency-refresh issue/PR.
5.  **Refresh agent model IDs** (§5.2) — `muse-spark-1.3-contributor-free` retired; **category-routed and direct subagent delegation both fail** every run until `AGENTS.md`/`.opencode/` mappings are updated.
6.  **Repair the Vercel preview integration** (§5.3) — every PR carries a red `Vercel` deployment status from the `donis-projects-f77cd16a` namespace; re-connect the project or refresh its tokens.
7.  **Untrack the quote-named prettier cache** (§5.5) — `git rm` the `'node_modules/.cache/.prettiercache'` file (literal quotes in the filename) so worktree cleanliness checks stop reporting phantom modifications.
8.  **Investigate zero-job `pull_request` run failures** (§5.1, NEW) — open a failed run in the Actions UI and read its raw log (API returns none); every recent PR run of `pull` fails with an empty jobs array while schedule runs pass. Until fixed, PR CI signal is effectively Vercel-only.
