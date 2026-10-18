# Issue Manager Audit — 2026-10-18 (loop 28)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-18 01:38–02:00 UTC                                                                                                                                                                               |
| State machine         | Phase 0.1 → **PR HANDLER MODE** (PRs #1579 + #1578 merged) → Phase 0.2 → **ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                     |
| DEFAULT_BRANCH        | `main` (auto-detected; started at `7b2bd81`, advanced to `3c1f68f` = PR #1579 merge, then `90819ed` = PR #1578 merge, this run)                                                                          |
| Phase 0.1 open PRs    | **2** (#1579 latest, #1578) → **PR HANDLER MODE** (first two-PR batch since loop 17)                                                                                                                     |
| PR #1579 disposition  | `focusRing` token for `BADGE_TOKENS`/`StatusBadge`; up-to-date with `main`; all gates green; admin-merged → `main` at `3c1f68f`; remote branch deleted                                                   |
| PR #1578 disposition  | Loop-27 audit docs; synced with post-#1579 `main` (merge commit `8c7fc7d` pushed); all gates green; admin-merged → `main` at `90819ed`; remote branch deleted                                            |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical set to loops 7–27 — no drift)                                                                                                                                 |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 re-derived; all issue-side writes re-probed 403 first-hand; STEP 4 completed — **#496 re-verified 98/98**, **full P0/P1 set re-verified first-hand**)                      |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§5)                                                                       |
| Skills used           | `openx-basefly` (repo harness conventions, docs-audit PR pattern); `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `commit-message` (conventional commit) |
| Subagents             | Not required this run — bounded, first-hand verification scope (established loops 17–27 pattern); all evidence collected directly                                                                        |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **2 open PRs (#1579, #1578)** → **PR HANDLER MODE**; Phases 1–3 stopped.
2. **PR #1579 processing** (contract PR HANDLER MODE steps 1–4, latest created 2026-10-18T00:18:06Z):
   - Checkout `pr-1579` (`f6f3e3d`); `git merge origin/main` → **Already up to date** (no conflicts; `mergeable: MERGEABLE`).
   - Gates re-run first-hand: typecheck **9/9** (13.7s), lint **9/9** (49.3s, **zero warnings**), test **2207/2207** (151 files, 46.7s), build **1/1** (38.8s).
   - Checks analysis: `pull` run 39082260184 = **cancelled after 30m20s** (hit `timeout-minutes: 30` in shared `oc-agent` concurrency queue; main-branch runs of same workflow pass in 14–22m) — not a code failure. Re-run + `workflow_dispatch` both **403** (token `actions: read` only, re-probed first-hand). `Vercel` = **pre-existing repo-wide outage**: all 8 recent deployments `failure`/`inactive`, **including Production builds of `main`** (7b2bd81, 87c521e, 8007421) — merges #1575/#1577 landed with the same red status.
   - Comments: only bot greetings (Jules, Vercel); GraphQL `reviewThreads` = **0 unresolved**; no reviews; diff (3 code lines + docs entry) not security-sensitive. `FOCUS_RING_DEFAULT` confirmed defined at `packages/common/src/ui-tokens.ts:19`.
   - Verification comment posted → `gh pr merge 1579 --merge --admin` → **MERGED** at `2026-10-18T01:47:49Z` (`3c1f68f`); remote branch `agent-12399146019474417414` deleted post-merge (contract step 4); no linked issues to close.
3. **PR #1578 processing** (created 2026-10-17T23:46:05Z):
   - Checkout `pr-1578`; `git merge origin/main` (now containing #1579) → **clean, ort strategy, no conflicts** (`mergeable: MERGEABLE` after sync).
   - Gates re-run first-hand on synced head: typecheck **9/9**, lint **9/9** (zero warnings), test **2207/2207** (151 files, 47.7s), build **1/1**.
   - Sync merge commit `8c7fc7d` pushed to `docs/issue-audit-2026-10-17-loop27`; post-push pre-push hook (`dx:quick`) re-ran green.
   - Checks: **no `pull` run attached to this PR**; `Vercel` re-triggered by sync push → **failed again** (`dpl_2FJRPyEX…`), confirming outage; review threads **0**; docs-only, not security-sensitive.
   - Verification comment posted → `gh pr merge 1578 --merge --admin` → **MERGED** at `2026-10-18T01:51:29Z` (`90819ed`); remote branch deleted (contract step 4); no linked issues.
4. **Re-evaluation (Phase 0.1 again)**: open PRs now **0** → proceed to Phase 0.2.
5. **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
6. Drift check: issue set unchanged (same 82 numbers as loops 7–27) → **no drift**.
7. STEP 1: label matrix recomputed independently → **33 compliant / 49 remediation** — exact match with loops 7–27 → no-drift rule applies; apply attempt re-probed → **403** (§1, §5).
8. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–27 (§2). Closures re-probed → **403** (§5).
9. STEP 4: **#496** (only P0) re-verified code-complete **first-hand this run**: 3 rate-limiter test files → **98/98 passed** (1.22s) at `90819ed`. Full P0/P1 set re-verified first-hand (§3).
10. Permission probes **first-hand this run** (workflow `pull`, job `ci`, event `schedule`, run 39087213673): issue label POST → **403**; issue comment POST → **403**; issue create → **403**; issue close (`gh issue close` GraphQL) → **403**; issue **state-close REST** (`PATCH /issues/480 state=closed`) → **403** (D1 duplicate close attempt; #480 re-verified **still OPEN** — probe had no side effect); issue read → OK; PR comment/push/merge → allowed (both merges are the proof); **PR label write → ALLOWED** (`gh pr edit 1580 --add-label docs,P2` succeeded — PR-scoped endpoint accepted under `pull-requests: write`, first discovery this run).
11. Stale-set re-confirmations this run (§4): #697 (all U+FFFD/`â€` matches are self-referential audit quotes; `docs/DX-engineer.md` clean), #578 (one health route), #786 (no secret logging), #785 (no `next` dep), #720/#748 (`.nvmrc` = `22.14.0`), #719 (root `tsconfig.json`), #636 (ISR intentionally unused, `dashboard/page.tsx:34-36`).
12. Confirmed genuinely open (§3): **#751** (no lazy/dynamic router splitting in `packages/api/src`), **#494** (no `domain/` layer), **#723** (36/127 client components in `apps/nextjs` — improved from 40/182, observation holds), **D2** cluster (`iterate.yml` `npm ci || true` at lines 72, 342 — workflow-file, platform-blocked), **#650** (prompts inline in `on-pull.yml` — workflow-file, platform-blocked), **#502** (only `iterate.yml` + `on-pull.yml` exist — workflow-file, platform-blocked).
13. Pre-staged patches re-validated against `90819ed`: `docs/patches/on-pull-issues-write-permission.patch` and `docs/patches/fix-pnpm-consistency-iterate-744.patch` both **clean apply**.
14. FAIL-SAFE: administrative closure of the verified set and label application both require issue write → **403** → no guess made; this audit remains the durable capture (established loop pattern).
15. Full green baseline re-established first-hand this run: **typecheck 9/9, lint 9/9 (zero warnings), test 2207/2207 (151 files), build 1/1** → no regression vs loop-19/21/22/23/24/25/26/27 baseline.

### Action log

| Timestamp (UTC) | Action                                   | Target                                    | Result                                                           |
| --------------- | ---------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| 01:38           | Phase 0.1 entry: `gh pr list`            | repo `cpa03/basefly`                      | 2 open PRs → **PR HANDLER MODE**                                 |
| 01:39           | Fetch + checkout + merge `origin/main`   | PR #1579 branch                           | Already up to date; no conflicts                                 |
| 01:39–01:44     | Gates: typecheck / lint / test / build   | PR #1579 head                             | 9/9, 9/9 (0 warnings), 2207/2207, 1/1 — all green                |
| 01:45           | Checks analysis + rerun/dispatch probes  | run 39082260184, workflow 221500505       | cancelled (timeout); rerun+dispatch **403** (`actions: read`)    |
| 01:46           | Verification comment                     | PR #1579                                  | posted (`issuecomment-6244403036`)                               |
| 01:47:49        | `gh pr merge 1579 --merge --admin`       | PR #1579                                  | **MERGED** → `3c1f68f`                                           |
| 01:48           | Delete remote branch + sync local `main` | `agent-12399146019474417414`              | deleted; main fast-forwarded                                     |
| 01:48           | Fetch + checkout + merge `origin/main`   | PR #1578 branch                           | clean merge (ort), no conflicts                                  |
| 01:49–01:50     | Gates: typecheck / lint / test / build   | PR #1578 synced head                      | 9/9, 9/9 (0 warnings), 2207/2207, 1/1 — all green                |
| 01:50           | Push sync commit + pre-push hook         | `docs/issue-audit-2026-10-17-loop27`      | pushed `8c7fc7d`; hook `dx:quick` green                          |
| 01:51           | Verification comment + Vercel re-check   | PR #1578                                  | posted (`issuecomment-6244427769`); Vercel failed again (outage) |
| 01:51:29        | `gh pr merge 1578 --merge --admin`       | PR #1578                                  | **MERGED** → `90819ed`                                           |
| 01:52           | Delete remote branch + sync local `main` | `docs/issue-audit-2026-10-17-loop27`      | deleted; main at `90819ed`                                       |
| 01:52           | Phase 0.2 entry: `gh issue list`         | repo                                      | 82 open issues → **ISSUE MANAGER MODE**                          |
| 01:53           | Permission probes (label/comment/create) | issues 789 / repo                         | all **403** (first-hand)                                         |
| 01:53           | Permission probe (close)                 | issue 496                                 | **403** GraphQL `addComment` (first-hand)                        |
| 01:54           | Label matrix recomputation               | all 82 issues                             | **33 compliant / 49 remediation** — exact match (no drift)       |
| 01:54           | STEP 4 verification: rate-limiter tests  | `packages/api/src/*rate-limiter*.test.ts` | **98/98 passed** (1.22s) → #496 code-complete                    |
| 01:55           | P0/P1 claim spot-verification            | #500/#551/#549/#501/#550/#515/#498/#581   | all implemented (evidence §3)                                    |
| 01:55           | Gap checks (genuinely open set)          | #751/#494/#723/#650/#502/D2               | all still open; workflow files platform-blocked                  |
| 01:56           | Stale-set spot re-confirmation           | #697/#578/#786/#785/#720/#719/#636        | all stale (evidence §4)                                          |
| 01:56           | Patch re-validation                      | 2 pre-staged patches                      | clean apply vs `90819ed`                                         |
| 01:57           | Gates re-run on audit branch             | typecheck/lint/test/build                 | 9/9, 9/9 (0 warnings), 2207/2207, 1/1 — all green                |
| 01:57           | Commit + push + `gh pr create`           | `docs/issue-audit-2026-10-18-loop28`      | pushed `8e8128f`; **PR #1580 opened**                            |
| 01:57           | PR label application                     | PR #1580                                  | **ALLOWED** — labels `docs` + `P2` applied (PR-scoped endpoint)  |
| 01:58           | D1 duplicate close probe                 | issue #480 (`state=closed`)               | **403**; #480 re-verified still OPEN (no side effect)            |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–27 → no-drift rule applies.

Remediation partition (fresh this run, re-derived independently; equivalent to the carried partition):

- 24 missing priority only: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- 1 missing category only: `670` (already carries `P3` + non-contract `DX-engineer`)
- 11 missing both: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- 10 multi-category: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- 3 multi-category + missing priority: `305, 584, 713`

Union check vs carried lists: missing-priority set = 24 ∪ {305, 584, 713} = **27** ✓; missing-category set = {670} ∪ (missing-both 11) = **12** ✓; multi-category set = 10 ∪ {305, 584, 713} = **13** ✓ — identical to loop-27 §1.

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=enhancement"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–28 no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§5). No flip-flop vs loops 7–27.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters (re-derived)

Clusters unchanged from loops 17–27 (static issue set, no new issues this run):

| ID  | Members                 | Canonical | Disposition                                           |
| --- | ----------------------- | --------- | ----------------------------------------------------- |
| D1  | 496, 480                | **496**   | Close 480 as duplicate of P0 (both Redis RL)          |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670 (P3, precise scope)             |
| D3  | 628, 501, 724           | **501**   | Close 628/724 as duplicates (Playwright E2E)          |
| D4  | 631, 725, 754           | **725**   | Close 631/754 as overlapping API test issues          |
| D5  | 720, 748                | **748**   | Both stale — `.nvmrc` now `22.14.0` (re-verified)     |
| D6  | 785, 789                | —         | Not duplicates; **789 promoted (loop 26)**; 785 stale |
| D7  | 551, 550, 549, 581      | **581**   | Testing-infra umbrella; children already done         |

Consolidation of D2/D3/D4/D7 small issues into their canonicals also requires issue writes.

**Closing/consolidating requires issue write → 403 → blocked (§5). D1 close was actively attempted this run** (`PATCH /issues/480 state=closed` after first-hand body comparison of #480 vs #496 — identical in-memory→Redis rate-limiter problem statement, #496 = P0 canonical) → **403**; #480 confirmed still OPEN.

---

## §3 STEP 4 — Repair Mode

### Selection

- P0 exists: **#496** → selected first (contract: highest-priority).
- Re-verified code-complete **first-hand this run**: `npx vitest run packages/api/src/rate-limiter.test.ts packages/api/src/distributed-rate-limiter.test.ts packages/api/src/distributed-rate-limiter-sync.test.ts` → **3 files, 98/98 tests passed** (1.22s) at `90819ed`. Implementation present: `distributed-rate-limiter.ts` (Redis `DistributedRateLimiter` + `SyncRateLimiter` in-memory fallback, sliding-window), `rate-limiter.ts`. Repair would be administrative close → **403** (probe: GraphQL `addComment`) → FAIL-SAFE.
- **Full P0/P1 set re-verified first-hand this run** (no P1 left unverified):

| Issue | Claim                               | First-hand evidence at `90819ed`                                                             |
| ----- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 rate-limiter tests green (this run)**                                                |
| #581  | Testing-infra umbrella (P1)         | Children #551/#550/#549/#501/#500 all verified implemented (rows below) → umbrella satisfied |
| #551  | k8s router tests (P1)               | `packages/api/src/router/k8s-router.test.ts` exists; in green 2207 suite                     |
| #550  | apps/nextjs in coverage (P1)        | `vitest.config` includes `apps/nextjs/src/**/*.{ts,tsx}` (line 16) + setup file (line 12)    |
| #549  | packages/auth tests (P1)            | 3 test files: `logger.test.ts`, `env.test.ts`, `clerk.test.ts` (0%-claim stale)              |
| #515  | CSRF protection (P1)                | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts`                                               |
| #501  | Playwright E2E (P1)                 | 11 specs in `tests/e2e/` (admin/auth/billing/cluster/dashboard/…)                            |
| #500  | Clerk auth flow tests (P1)          | `apps/nextjs/src/utils/clerk.test.ts` + `packages/auth/clerk.test.ts`                        |
| #498  | Role-based admin RBAC (P1)          | `apps/nextjs/src/lib/admin-access.ts` (+test), `packages/api/src/rbac.test.ts`               |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification                                    |

- **#755** remains rejected as a repair target (FAIL-SAFE carried from loops 21–27: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- **#636** rejected: `apps/nextjs/src/app/[lang]/(dashboard)/dashboard/page.tsx:34-36` documents "ISR intentionally not used — `force-dynamic` … caching user-scoped data would leak it across users" → intentional design decision; closing as wontfix requires issue write → 403 → blocked.
- **#697** rejected (stale): repo-wide scan this run found 5 U+FFFD matches + 6 classic-mojibake matches — **all in audit reports quoting the scan patterns themselves** (self-referential); `docs/DX-engineer.md` = 0 matches; no U+FFFD outside `docs/`; loops 24/192/223/229/loop3 already recorded the fix commits (`e290045`/`b3b9000`/`c4d98b4`). Administrative close → 403 → blocked.
- **#728** (security scanning workflows) per payload = P1 → requires new files under `.github/workflows/` → **platform-blocked** (§5, `workflows` permission).
- Genuinely open but non-critical (no P0/P1 pressure; left per contract minimal/atomic rule): **#751** (no lazy/dynamic router splitting found in `packages/api/src`), **#494** (no `domain/` directory), **#723** (36/127 = 28% client components in `apps/nextjs`, improved from 40/182), **#502** (only `iterate.yml` + `on-pull.yml` exist → workflow-file, blocked), **#650** (`ulw-loop` prompt still inline in `on-pull.yml` → workflow-file, blocked), **D2** (`iterate.yml` `npm ci || true` at lines 72 and 342 → workflow-file, blocked), plus feature-grade items (#749, #668, #636-pending-close, etc.).
- Iterate.yml npm→pnpm cluster (D2) → **platform-blocked** (§5); pre-staged patch `docs/patches/fix-pnpm-consistency-iterate-744.patch` re-verified **clean apply** this run.
- Net: **no safely-implementable issue remains** (all P0/P1 implemented or platform-blocked; next candidates are workflow-file-blocked or intentionally-designed); this loop's deliverable is verification evidence + this audit (established loop 17–27 pattern).

### Stale-set spot re-confirmations (this run at `90819ed`)

| Issue          | Claim                                   | Verdict (loop-28, first-hand)                                           |
| -------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter          | **Re-verified: 98/98 tests green (this run)**                           |
| #697           | Corrupted text in docs                  | Stale — all corruption-marker matches are self-referential audit quotes |
| #578           | Duplicate health check endpoint         | Stale — exactly one route (`app/api/health/route.ts`)                   |
| #786           | Stripe webhook logs partial secret      | Stale — zero secret-logging patterns in `packages/stripe/src`           |
| #785           | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                                    |
| #720/#748      | `.nvmrc` missing / invalid              | Stale — file exists (`22.14.0`)                                         |
| #719           | Missing root TypeScript config          | Stale — root `tsconfig.json` exists                                     |
| #789           | React peerDependencies missing          | Stale — peerDeps `{next, react, react-dom}` present in `packages/ui`    |
| #722           | No env validation at startup            | Stale — `env.mjs` with 16 zod checks                                    |
| #721           | No authorization beyond authentication  | Stale — `adminProcedure` at `trpc.ts:331`                               |
| #630           | Pre-commit lacks typecheck/test         | Stale — `.husky/pre-commit` runs typecheck/test/check-deps/lint-staged  |
| #635           | No developer onboarding guide           | Stale — `docs/ONBOARDING.md` exists                                     |
| #636           | Missing ISR for dashboard               | Rejected — intentional `force-dynamic` (documented at lines 34–36)      |
| #501/#628/#724 | Missing Playwright E2E                  | Stale — 11 e2e specs in `tests/e2e/`                                    |

Closing any of these requires issue write → **403 → blocked (§5)**.

---

## §4 Blocked Write Paths (re-confirmed this run, first-hand)

| Surface                 | Operation                           | Result                                                                   |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| Issues (label)          | `POST .../issues/789/labels`        | **403** `Resource not accessible by integration` (re-probed)             |
| Issues (comment)        | `POST .../issues/789/comments`      | **403** (re-probed this run)                                             |
| Issues (create)         | `POST .../issues` (probe)           | **403** (re-probed this run)                                             |
| Issues (close, GraphQL) | `gh issue close 496 --comment …`    | **403** GraphQL `addComment` (re-probed this run)                        |
| Issues (close, REST)    | `PATCH .../issues/480 state=closed` | **403** `issues#update-an-issue` (first-hand this run; #480 stayed OPEN) |
| PR (label)              | `gh pr edit 1580 --add-label …`     | **Allowed** — first discovery this run (PR-scoped endpoint)              |
| CI re-run / dispatch    | `gh run rerun` / `gh workflow run`  | **403** `Resource not accessible by integration` (re-probed)             |
| Workflow-file push      | `git push` (`.github/workflows/*`)  | Platform-rejected: GitHub App lacks `workflows` perm                     |
| Branch push (non-WF)    | `git push` (normal files)           | **Allowed** — sync push `8c7fc7d` + this docs branch are proof           |
| PR comment              | `gh pr comment`                     | **Allowed** — comments on #1579/#1578 are proof                          |
| `gh pr create`          | —                                   | **Allowed** — this audit PR is the proof                                 |
| `gh pr merge --admin`   | —                                   | **Allowed — #1579 and #1578 merged this run**                            |

Root cause (unchanged, carried from loops 19–27):

1. **Token scope**: the workflow `permissions:` block supplying this run's token omits `issues: write` (and `actions: write`) → no issue-side write scopes, no CI re-runs. Fix = one-line patch (§5 suggested action).
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` cannot create/update any file under `.github/workflows/` without the app's `workflows` permission — blocks shipping fix (1) from inside the loop.

**Suggested maintainer action (unchanged, still highest-leverage):** land `docs/patches/on-pull-issues-write-permission.patch` with a human account / `workflows: write` token — one line — then every future loop can execute the §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set. Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2). With loop-27/28 promotions included, an `issues: write`-enabled loop could immediately close **47+** already-verified issues.

---

## §5 Gates (loop 28)

| Gate      | Command                                                            | Result                                              |
| --------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`                                   | Done in 8.1s                                        |
| Typecheck | `pnpm typecheck`                                                   | **9/9 successful**, 13.7s                           |
| Lint      | `pnpm lint`                                                        | **9/9 successful**, 49.3s (**zero warnings**)       |
| Test      | `pnpm test`                                                        | **2207/2207 passed (151 files)**, 46.7s             |
| Build     | `pnpm build` (env:validate + turbo build)                          | **1/1 successful**, 38.8s                           |
| RL tests  | `npx vitest run` (3 rate-limiter test files)                       | **98/98 passed**, 1.22s (first-hand #496 proof)     |
| Hooks     | `dx:quick` (pre-push/post-merge hooks)                             | typecheck 9/9 + lint 9/9 green on every hook run    |
| Patches   | `git apply --check` (both pre-staged)                              | Clean against `90819ed`                             |
| PR #1579  | sync + gates + comment + `gh pr merge 1579 --merge --admin`        | **MERGED** at 01:47:49Z; main `7b2bd81..3c1f68f`    |
| PR #1578  | sync + gates + push + comment + `gh pr merge 1578 --merge --admin` | **MERGED** at 01:51:29Z; main `3c1f68f..90819ed`    |
| Ship      | docs-only PR (this audit)                                          | No runtime code touched; last-known-green re-proven |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§4). All §3/§4 evidence collected first-hand, matching the loops 17–27 verification pattern.

**Vercel outage evidence (this run):** deployments for refs `f6f3e3d` (#1579 preview), `6ebdbe5` (#1578 preview), `2FJRPyEX` (#1578 sync-push preview) all `failure`; Production deployments of `main` (`7b2bd81`, `87c521e`, `8007421`) also `failure` → environmental, repo-wide, predates and is unaffected by either merged PR.

---

## §6 Final State

- **waiting for human review** — PR #1580 (this audit; labeled `docs` + `P2` per contract — PR-side label write is available even though issue-side is not).
- Unblocked only by a maintainer token/account with `workflows: write` (land the §4 one-line `on-pull.yml` patch first), after which `issues: write`-enabled loops can execute §1 labels, §2/§3 closes (D1's #480 close was attempted and 403-blocked this run), and administrative closure of the §4 stale set — which now includes **47+** issues verified implemented across loops 17–28. Second: `actions: write` would let loops re-run timed-out CI instead of relying on local gate re-proofs.
- Loop-28 delta vs. loop 27: **two PRs handled and merged** (#1579 feature-token PR — first non-docs PR merged in this loop series — and #1578, the loop-27 audit; both admin-merged after first-hand gate re-proofs, Vercel failure classified environmental, `pull`-timeout classified queue-timeout); **P0 #496 re-verified 98/98** and the **entire P0/P1 set verified first-hand for the first time in one pass**; **#697 re-classified stale** with a repo-wide corruption scan (all matches self-referential); label matrix re-derived 33/49 with exact-match no-drift confirmation; both pre-staged patches re-verified clean-apply.
- No destructive actions taken; no force-pushes; no branches left on remote besides this docs branch; issue-side writes remain untouched (403). PR #1579/#1578 remote branches were deleted only after confirmed successful merges (contract step 4).
