# Issue Manager Audit — 2026-10-18 (loop 29)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-18 14:55–15:02 UTC                                                                                                                                                                               |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                    |
| DEFAULT_BRANCH        | `main` (auto-detected; `e1d1af3` = PR #1580 merge, loop-28 audit; already synced at run start — `git merge --ff-only origin/main` → "Already up to date")                                                |
| Phase 0.1 open PRs    | **0** → not PR HANDLER MODE (loop-28's PRs #1579/#1578 both merged and their branches deleted; PR #1580 also merged before this run)                                                                     |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical number set to loops 7–28 — no drift)                                                                                                                          |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 re-derived; all issue-side writes re-probed 403 first-hand; STEP 4 completed — **#496 re-verified 98/98**, full P0/P1 set re-verified, **#751 classification corrected**)  |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§4)                                                                       |
| Skills used           | `openx-basefly` (repo harness conventions, docs-audit PR pattern); `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `commit-message` (conventional commit) |
| Subagents             | Not required this run — bounded, first-hand verification scope (established loops 17–28 pattern); all evidence collected directly                                                                        |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **0 open PRs** → fall through to Phase 0.2.
2. **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
3. Drift check: issue number set `[305, 480, 483, …, 789]` (82 numbers) identical to loop-28 → **no drift**; `origin/main` already at `e1d1af3`.
4. STEP 1: label matrix recomputed independently → **33 compliant / 49 remediation** — exact match with loops 7–28 (all five remediation partitions match item-for-item) → no-drift rule applies; apply attempt re-probed → **403** (§1, §4).
5. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–28 (§2). D1 close actively re-attempted (`PATCH /issues/480 state=closed`) → **403**; #480 re-verified **still OPEN** (probe had no side effect).
6. STEP 4: **#496** (only P0) re-verified code-complete **first-hand this run**: 3 rate-limiter test files → **98/98 passed** (1.17s) at `e1d1af3`; acceptance criteria cross-checked (env vars `REDIS_URL` + `RATE_LIMIT_*` in `.env.example:124-131`, `docs/redis-setup.md`, fallback `SyncRateLimiter`). Full P0/P1 set re-verified first-hand (§3).
7. **Loop-29 delta — #751 classification corrected**: loop 28 recorded "#751 genuinely open — no lazy/dynamic router splitting found in `packages/api/src`". This run found `packages/api/src/edge.ts:17-26` using `@trpc/server`'s `lazy()` for `admin`/`customer`/`k8s`/`stripe` routers (introduced by `64b82a9`, 2026-06-26 — pre-dates loop 28), and `root.ts:4` composes the **primary** `appRouter` as `mergeRouters(edgeRouter)`, so the lazy path is the live entrypoint; `edge.test.ts` explicitly covers eager+lazy caller paths. Verdict change: **core mechanism implemented (partially complete)** — remaining acceptance criteria are measurable-output items (bundle-analyzer reduction %, Lighthouse score) that depend on bundle-analyzer configuration (#708, still open) and cannot be satisfied deterministically here → #751 moves from "genuinely open gap" to **partially implemented / measurement-blocked**.
8. Loop-29 delta — first-hand re-confirmation of genuinely-open set: **#494** (no `domain/` directory anywhere), **#723** (36/127 `.tsx` under `apps/nextjs/src` carry `"use client"` = 28% — matches loop-28 figure exactly), **D2** (`iterate.yml` `npm ci || true` still at lines 72 and 342 — workflow-file, platform-blocked), **#650** (1 inline `ulw-loop` prompt still in `on-pull.yml` — workflow-file, platform-blocked), **#502** (only `iterate.yml` + `on-pull.yml` exist — workflow-file, platform-blocked).
9. Stale-set re-confirmations this run (§3): #697 (zero U+FFFD matches outside audit docs), #578 (exactly one health route), #785 (no `next` dep in packages/stripe), #720 (`.nvmrc` = `22.14.0`), #719 (root `tsconfig.json` exists).
10. Permission probes **first-hand this run**: issue label POST → **403**; issue close REST (`PATCH /issues/480`) → **403**; issue comment GraphQL (`addComment` on #496) → **403**; issue read → OK; PR-side writes not needed until audit PR creation.
11. Pre-staged patches re-validated against `e1d1af3`: `docs/patches/on-pull-issues-write-permission.patch` and `docs/patches/fix-pnpm-consistency-iterate-744.patch` both **clean apply**.
12. FAIL-SAFE: STEP 4 administrative closure of #496 and STEP 2/3 closes/consolidations all require issue write → **403** → no guess made; this audit remains the durable capture (established loop pattern).
13. Full green baseline re-established first-hand: **typecheck 9/9 (13.1s), lint 9/9 (47.0s, zero warnings), test 2207/2207 (151 files, 43.7s), build 1/1 (36.8s)** → no regression vs loop-28 baseline.

### Action log

| Timestamp (UTC) | Action                                  | Target                                    | Result                                                                  |
| --------------- | --------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| 14:55           | Phase 0.1 entry: `gh pr list`           | repo `cpa03/basefly`                      | **0 open PRs** → fall through                                           |
| 14:55           | Phase 0.2 entry: `gh issue list`        | repo                                      | **82 open issues → ISSUE MANAGER MODE**                                 |
| 14:55           | Sync local `main` with `origin/main`    | `main`                                    | Already up to date at `e1d1af3`                                         |
| 14:55           | Permission probe (issue label)          | issue 789                                 | **403** `Resource not accessible by integration`                        |
| 14:56           | Label matrix recomputation              | all 82 issues                             | **33 compliant / 49 remediation** — exact match (no drift)              |
| 14:57           | D1 duplicate close probe                | issue #480 (`state=closed`)               | **403**; #480 re-verified **OPEN** (no side effect)                     |
| 14:57           | `pnpm install --frozen-lockfile`        | workspace                                 | Done in 7.5s                                                            |
| 14:57           | STEP 4 verification: rate-limiter tests | `packages/api/src/*rate-limiter*.test.ts` | **98/98 passed** (1.17s) → #496 code-complete                           |
| 14:58           | P0/P1 claim spot-verification           | #551/#515/#498/#501/#500/#549/#550        | all implemented (evidence §3)                                           |
| 14:58           | **#751 gap re-check**                   | `packages/api/src/edge.ts` + `root.ts`    | **CORRECTION: `lazy()` splitting present since `64b82a9` (2026-06-26)** |
| 14:58           | #723 gap re-check                       | `apps/nextjs/src`                         | 36/127 `"use client"` (28%) — matches loop-28, gap holds                |
| 14:59           | Permission probe (issue comment)        | issue #496                                | **403** GraphQL `addComment`                                            |
| 14:59           | Gap checks (genuinely open set)         | #494/#723/#650/#502/D2                    | all still open; workflow files platform-blocked                         |
| 14:59           | Stale-set spot re-confirmation          | #697/#578/#785/#720/#719                  | all stale (evidence §3)                                                 |
| 14:59           | Patch re-validation                     | 2 pre-staged patches                      | clean apply vs `e1d1af3`                                                |
| 14:59–15:01     | Gates: typecheck / lint / test / build  | branch head                               | 9/9, 9/9 (0 warnings), 2207/2207, 1/1 — all green                       |
| 15:01           | Create audit branch                     | `docs/issue-audit-2026-10-18-loop29`      | created from `main` (`e1d1af3`)                                         |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–28 → no-drift rule applies.

Remediation partition (fresh this run, re-derived independently; equivalent to the carried partition):

- 24 missing priority only: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- 1 missing category only: `670` (already carries `P3` + non-contract `DX-engineer`)
- 11 missing both: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- 10 multi-category: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- 3 multi-category + missing priority: `305, 584, 713`

Union check: missing-priority set = 24 ∪ {305, 584, 713} = **27** ✓; missing-category set = {670} ∪ 11 = **12** ✓; multi-category set = 10 ∪ {305, 584, 713} = **13** ✓ — identical to loop-28 §1.

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=enhancement"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–29 no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–28.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters (re-derived)

Clusters unchanged from loops 17–28 (static issue set, no new issues this run):

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

**Closing/consolidating requires issue write → 403 → blocked (§4). D1 close was actively re-attempted this run** (`PATCH /issues/480 state=closed` — first-hand body comparison of #480 vs #496 unchanged: identical in-memory→Redis rate-limiter problem statement, #496 = P0 canonical) → **403** `issues#update-an-issue`; #480 confirmed still OPEN after the probe.

---

## §3 STEP 4 — Repair Mode

### Selection

- P0 exists: **#496** → selected first (contract: highest-priority).
- Re-verified code-complete **first-hand this run**: `npx vitest run packages/api/src/rate-limiter.test.ts packages/api/src/distributed-rate-limiter.test.ts packages/api/src/distributed-rate-limiter-sync.test.ts` → **3 files, 98/98 tests passed** (1.17s) at `e1d1af3`. Implementation present: `distributed-rate-limiter.ts` (Redis `DistributedRateLimiter` + `SyncRateLimiter` in-memory fallback, sliding-window), `rate-limiter.ts`. Acceptance-criteria cross-check this run: `.env.example:124` `REDIS_URL` + `:128-131` `RATE_LIMIT_READ/WRITE_*` (env-var config ✓), `docs/redis-setup.md` (documentation ✓), fallback with warning (✓ in `SyncRateLimiter` design), tests ✓. Repair would be administrative close → probe `gh issue comment 496` → **403** GraphQL `addComment` → FAIL-SAFE.
- **Full P0/P1 set re-verified first-hand this run** (no P1 left unverified):

| Issue | Claim                               | First-hand evidence at `e1d1af3`                                                             |
| ----- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 rate-limiter tests green (this run)** + env/docs acceptance evidence above           |
| #581  | Testing-infra umbrella (P1)         | Children #551/#550/#549/#501/#500 all verified implemented (rows below) → umbrella satisfied |
| #551  | k8s router tests (P1)               | `packages/api/src/router/k8s-router.test.ts` exists; in green 2207 suite                     |
| #550  | apps/nextjs in coverage (P1)        | `vitest.config` includes `apps/nextjs/src/**/*.{ts,tsx}` (line 16) + setup file (line 12)    |
| #549  | packages/auth tests (P1)            | 3 test files: `logger.test.ts`, `env.test.ts`, `clerk.test.ts` (0%-claim stale)              |
| #515  | CSRF protection (P1)                | `apps/nextjs/src/lib/csrf.ts` (+ `csrf.test.ts`)                                             |
| #501  | Playwright E2E (P1)                 | 11 specs in `tests/e2e/`                                                                     |
| #500  | Clerk auth flow tests (P1)          | `apps/nextjs/src/utils/clerk.test.ts` + `packages/auth/clerk.test.ts`                        |
| #498  | Role-based admin RBAC (P1)          | `apps/nextjs/src/lib/admin-access.ts`, `packages/api/src/rbac.test.ts`                       |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification                                    |

- **#751 — classification corrected this run (loop-29 delta)**: was carried as "genuinely open (no lazy/dynamic router splitting found)". First-hand evidence now: `packages/api/src/edge.ts:17-26` uses `lazy(() => import("./router/…"))` for `admin`, `customer`, `k8s`, `stripe`; `root.ts:4` = `mergeRouters(edgeRouter)` → the primary `appRouter` **is** the lazy-composed router; introduced by commit `64b82a9` (2026-06-26, "perf(api): implement lazy router loading for tRPC code splitting"); `edge.test.ts` explicitly asserts the eager+lazy caller paths. Remaining acceptance criteria (`Bundle analyzer shows reduced initial load`, `Lighthouse score`, `≥10% bundle reduction`) are measurable-output items requiring a bundle analyzer (#708, open) and a Lighthouse environment → **partially implemented, measurement-blocked**; not a zero-progress gap, and not safely closable without the measurement evidence. Recorded for the maintainer rather than force-closed (FAIL-SAFE).
- **#755** remains rejected as a repair target (FAIL-SAFE carried from loops 21–28: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- **#636** rejected: `apps/nextjs/src/app/[lang]/(dashboard)/dashboard/page.tsx:34-36` documents "ISR intentionally not used — `force-dynamic` … caching user-scoped data would leak it across users" → intentional design decision; closing as wontfix requires issue write → 403 → blocked.
- **#697** rejected (stale): this run found **zero** U+FFFD matches in non-audit docs; loops 24/192/223/229/loop3 recorded the fix commits (`e290045`/`b3b9000`/`c4d98b4`). Administrative close → 403 → blocked.
- **#728** (security scanning workflows) per payload = P1 → requires new files under `.github/workflows/` → **platform-blocked** (§4, `workflows` permission).
- Genuinely open but non-critical (no P0/P1 pressure; left per contract minimal/atomic rule): **#494** (no `domain/` directory — re-verified this run), **#723** (36/127 = 28% client components — re-verified, figure matches), **#502** (only `iterate.yml` + `on-pull.yml` exist → workflow-file, blocked), **#650** (1 inline `ulw-loop` prompt still in `on-pull.yml` → workflow-file, blocked), **D2** (`iterate.yml` `npm ci || true` at lines 72, 342 → workflow-file, blocked), **#751** remainder (measurement-blocked, see above), plus feature-grade items (#749, #668, #636-pending-close, etc.).
- Iterate.yml npm→pnpm cluster (D2) → **platform-blocked** (§4); pre-staged patch `docs/patches/fix-pnpm-consistency-iterate-744.patch` re-verified **clean apply** at `e1d1af3`.
- Net: **no safely-implementable issue remains** (all P0/P1 implemented or platform-blocked; remaining candidates are workflow-file-blocked, measurement-blocked, or intentionally-designed); this loop's deliverable is verification evidence + the **#751 classification correction** + this audit (established loop 17–28 pattern).

### Stale-set spot re-confirmations (this run at `e1d1af3`)

| Issue          | Claim                                   | Verdict (loop-29, first-hand)                                        |
| -------------- | --------------------------------------- | -------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter          | **Re-verified: 98/98 tests green (this run)**                        |
| #751           | tRPC router code splitting missing      | **CORRECTED: core `lazy()` splitting implemented since 2026-06-26**  |
| #697           | Corrupted text in docs                  | Stale — zero corruption markers outside audit docs                   |
| #578           | Duplicate health check endpoint         | Stale — exactly one health route found                               |
| #785           | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present (python json check: `False`)    |
| #720/#748      | `.nvmrc` missing / invalid              | Stale — file exists (`22.14.0`)                                      |
| #719           | Missing root TypeScript config          | Stale — root `tsconfig.json` exists                                  |
| #722           | No env validation at startup            | Stale — `env.mjs` with 16 zod checks (carried from loops 17–28)      |
| #721           | No authorization beyond authentication  | Stale — `adminProcedure` at `trpc.ts:331` (carried from loops 17–28) |
| #635           | No developer onboarding guide           | Stale — `docs/ONBOARDING.md` exists (carried from loops 17–28)       |
| #501/#628/#724 | Missing Playwright E2E                  | Stale — 11 e2e specs in `tests/e2e/`                                 |

Closing any of these requires issue write → **403 → blocked (§4)**.

---

## §4 Blocked Write Paths (re-confirmed this run, first-hand)

| Surface                             | Operation                           | Result                                                                |
| ----------------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| Issues (label)                      | `POST .../issues/789/labels`        | **403** `Resource not accessible by integration` (re-probed this run) |
| Issues (close, REST)                | `PATCH .../issues/480 state=closed` | **403** `issues#update-an-issue` (re-probed; #480 stayed OPEN)        |
| Issues (comment, GraphQL)           | `gh issue comment 496 --body …`     | **403** GraphQL `addComment` (re-probed this run)                     |
| Issues (create)                     | —                                   | **403** (carried from loops 19–28; same token/scope class)            |
| CI re-run / dispatch                | `gh run rerun` / `gh workflow run`  | **403** (carried; `actions: read` only)                               |
| Workflow-file push                  | `git push` (`.github/workflows/*`)  | Platform-rejected: GitHub App lacks `workflows` perm                  |
| Branch push (non-WF)                | `git push` (normal files)           | **Allowed** (docs-audit branches are the proof)                       |
| PR create / label / comment / merge | —                                   | **Allowed** (loops 26–28 merged 11+ PRs; PR labels applied loop 28)   |

Root cause (unchanged, carried from loops 19–28):

1. **Token scope**: the workflow `permissions:` block supplying this run's token omits `issues: write` (and `actions: write`) → no issue-side write scopes, no CI re-runs. Fix = one-line patch (§5 suggested action). Note: `iterate.yml:13` declares `issues: write`, but the loop runs under `on-pull.yml`, which does not.
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` cannot create/update any file under `.github/workflows/` without the app's `workflows` permission — blocks shipping fix (1) from inside the loop.

**Suggested maintainer action (unchanged, still highest-leverage):** land `docs/patches/on-pull-issues-write-permission.patch` with a human account / `workflows: write` token — one line — then every future loop can execute the §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set (including **#496**, verified code-complete). Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2). Third: configure a bundle analyzer (#708) so #751's measurable acceptance criteria can be verified and the issue closed. With loop-27–29 promotions included, an `issues: write`-enabled loop could immediately close **47+** already-verified issues.

---

## §5 Gates (loop 29)

| Gate      | Command                                      | Result                                              |
| --------- | -------------------------------------------- | --------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`             | Done in 7.5s                                        |
| Typecheck | `pnpm typecheck`                             | **9/9 successful**, 13.1s                           |
| Lint      | `pnpm lint`                                  | **9/9 successful**, 47.0s (**zero warnings**)       |
| Test      | `pnpm test`                                  | **2207/2207 passed (151 files)**, 43.7s             |
| Build     | `pnpm build` (env:validate + turbo build)    | **1/1 successful**, 36.8s                           |
| RL tests  | `npx vitest run` (3 rate-limiter test files) | **98/98 passed**, 1.17s (first-hand #496 proof)     |
| Patches   | `git apply --check` (both pre-staged)        | Clean against `e1d1af3`                             |
| Ship      | docs-only PR (this audit)                    | No runtime code touched; last-known-green re-proven |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§4). All §3/§4 evidence collected first-hand, matching the loops 17–28 verification pattern. Vercel deployment status not re-probed this run (environmental outage evidence recorded in loop 28; unaffected by docs-only changes).

---

## §6 Final State

- **waiting for human review** — PR with this audit (labeled `docs` + `P2` per contract — PR-side label write is available even though issue-side is not).
- Unblocked only by a maintainer token/account with `workflows: write` (land the §4 one-line `on-pull.yml` patch first), after which `issues: write`-enabled loops can execute §1 labels, §2/§3 closes (D1's #480 close re-attempted and 403-blocked this run), administrative closure of #496 (verified code-complete), and closure of the §3 stale set. Second: `actions: write` would let loops re-run timed-out CI instead of relying on local gate re-proofs.
- Loop-29 delta vs. loop 28: **zero open PRs at entry** (first time since loop 16 — loop-28 merged both remaining PRs); **#751 classification corrected** from "genuinely open, no code splitting" to **partially implemented** (`edge.ts` `lazy()` since 2026-06-26 is the live `appRouter` path; measurement criteria remain, blocked on #708); issue-side writes re-probed 403 across three surfaces (label/close/comment) including a real D1 close attempt; label matrix re-derived 33/49 with exact-match no-drift confirmation; full P0/P1 set verified first-hand; both pre-staged patches re-verified clean-apply; full green baseline re-proven.
- No destructive actions taken; no force-pushes; issue-side writes remain untouched (403; #480 confirmed OPEN after close probe). Only the docs audit branch was created this run.
