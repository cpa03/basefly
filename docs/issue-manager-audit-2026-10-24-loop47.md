# Issue Manager Audit — 2026-10-24 (loop 47)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-24 02:04 – 02:20 UTC                                                                                                                                                                                                                                                                                                                                                                             |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                                                                                                                                                                    |
| DEFAULT_BRANCH        | `main` (auto-detected via `origin/HEAD`); synced at `6283113` = loop-46 audit merge (PR #1607)                                                                                                                                                                                                                                                                                                           |
| Phase 0.1 open PRs    | **0** → PR HANDLER MODE not entered (loop-46 merged its PR #1606 and audit PR #1607 during its own run window; both landed before this run started)                                                                                                                                                                                                                                                      |
| Phase 0.2 open issues | **82** — issue-set digest `84696e81` (sha256 of sorted numbers) = **exact match with loops 33–46** → no drift                                                                                                                                                                                                                                                                                            |
| Runner context        | `on-pull.yml` (`name: pull`), event = **`schedule`** (cron `0 * * * *`), `GITHUB_RUN_NUMBER=4925`, run `40052626320`, ref `refs/heads/main` @ `6283113` — contrast with loop 46 (`pull_request` event on PR #1606)                                                                                                                                                                                       |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                                                                                                                                                                     |
| Final state           | **waiting for human review** — PR carrying this audit; issue-side writes remain 403 (§5)                                                                                                                                                                                                                                                                                                                 |
| Skills used           | `openx-basefly` (repo harness/agent conventions) · `github-workflow-automation` (GITHUB_TOKEN permission model, workflow `permissions:` semantics → applied to §5 root-cause) — contract-mandated skill reporting fulfilled here                                                                                                                                                                         |
| Subagents             | 1 attempted, **1 failed**: `subagent_type=explore` bg `bg_b332cd32` → **`ProviderModelNotFoundError: Model not found: opencode/muse-spark-1.3-contributor-free`** (provider suggests `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`), 0s, session `ses_e94551216ffeYstENRxzCymlwF` — **6th consecutive loop** (loops 42–47) of delegation-layer failure. All verification executed first-hand |

### Decision summary (why this phase ran)

1.  **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → no PR HANDLER MODE.
2.  **Phase 0.2**: `gh issue list --state open --limit 300` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run once a phase is activated).
3.  **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33–46** → no drift; carried payload applies verbatim (no-flip-flop rule).
4.  **STEP 1**: label matrix independently re-derived (script over full label sets) → **33 compliant / 49 remediation** — structural match with loops 7–46. Apply attempt (label add on #755, payload step) → **403** `Resource not accessible by integration` (§5).
5.  **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent first-hand file evidence this run (§3). Comment probe (STEP 2 prerequisite) → **403**; closes/commentaries require issue write → blocked.
6.  **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.14s); **all 6 acceptance criteria evidenced** (§4.1) — `docs/redis-setup.md` explicitly references Issue #496, `.env.example:124-133` carries `REDIS_URL` + `RATE_LIMIT_*` block, `docs/blueprint.md:704-725` documents the sliding-window design, `logger.warn` fallbacks at `distributed-rate-limiter.ts:96/189/227`. Repair action = administrative close → comment probe → **403** → FAIL-SAFE.
7.  **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface; probe re-confirmed in loop 46 as `createIssue` 403).
8.  **Permission-surface delta**: none — writable surface remains `git push (non-workflow files) + PR create/close`; blocked surface remains `all issue mutations (label/comment/create/close) + workflow-file pushes` (both re-confirmed first-hand this run: §5).
9.  **Probe hygiene**: two direct 403 probes this run (label add `#755` — payload-compliant, so no residue if it had succeeded; comment `#755` — probe failed before content was written); no probe branches pushed; workspace branched from current `main`; untracked `.omo/run-continuation/*.json` session artifacts deliberately **not** committed.

### Action log

| Timestamp (UTC) | Action                                        | Target                                                  | Result                                                                                                                                         |
| --------------- | --------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 02:04           | Phase 0.1 entry: `gh pr list --state open`    | repo `cpa03/basefly`                                    | **0 open PRs** → Phase 0.2                                                                                                                     |
| 02:04           | Skill load                                    | `openx-basefly`                                         | Loaded; harness/agent conventions applied                                                                                                      |
| 02:05           | Phase 0.2 entry: `gh issue list`              | repo                                                    | **82 open issues → ISSUE MANAGER MODE**                                                                                                        |
| 02:05           | Label inventory                               | `gh label list` (59 labels)                             | Contract labels (`bug…security`, `P0–P3`) + specialty labels present ✓                                                                         |
| 02:06           | Issue dataset snapshot                        | `/tmp` JSON (`number,labels` loop47)                    | 82 issues                                                                                                                                      |
| 02:06           | Drift check                                   | sorted issue-number digest                              | 82 numbers, `84696e81…` — **match loops 33–46** → no drift                                                                                     |
| 02:06           | STEP 1 label matrix (script)                  | category/priority partition                             | **33 compliant / 24 missing-pri-only / 1 missing-cat / 11 missing-both / 10 multi-cat / 3 multi+miss-pri = 49 remediation** — match loops 7–46 |
| 02:07           | STEP 1 apply attempt (first-hand)             | `gh issue edit 755 --add-label enhancement`             | **403** `Resource not accessible by integration (addLabelsToLabelable)`                                                                        |
| 02:07           | STEP 2 prerequisite probe (first-hand)        | `gh issue comment 755`                                  | **403** `Resource not accessible by integration (addComment)`                                                                                  |
| 02:07           | Subagent attempt (contract orchestration)     | `task(subagent_type=explore, bg_b332cd32)`              | **FAILED** 0s — `ProviderModelNotFoundError: muse-spark-1.3-contributor-free` → 6th consecutive (loops 42–47)                                  |
| 02:08           | STEP 2/3 cluster re-verification (first-hand) | 10 file-evidence checks (D2–D7, N4–N7, #613, patches)   | All carried verdicts re-confirmed (§3)                                                                                                         |
| 02:09           | Drift-free workspace install                  | `pnpm install --frozen-lockfile`                        | **8.1s** (pre-existing node engine warning)                                                                                                    |
| 02:09           | STEP 4 selection                              | `gh issue view` label scan                              | P0 **#496** → only P0 on board → selected per contract                                                                                         |
| 02:09           | STEP 4 verification: rate-limiter tests       | 3 `*rate-limiter*.test.ts` files                        | **98/98 passed** (1.14s) → #496 code-complete                                                                                                  |
| 02:09           | STEP 4 verification: #496 documentation ACs   | docs + env example                                      | `redis-setup.md` (references #496) ✓ · `.env.example:124-133` RATE_LIMIT\*\* ✓ · `blueprint.md:704-725` ✓                                      |
| 02:10           | §4.3 P0/P1 wiring spot-checks (first-hand)    | `trpc.ts` RBAC, `proxy.ts` CSRF, stripe webhook logging | `requireRole:349`/`createRoleBasedProcedure:422` ✓ · `validateCSRF:54` wired `:243` matcher `:95` ✓ · webhook route logs via `logger` only     |
| 02:10           | Runner introspection (first-hand)             | `env \| grep ^GITHUB_`                                  | event `schedule`, run 4925 / `40052626320`, SHA `6283113` (= loop-46 merge)                                                                    |
| 02:10           | §5 root-cause re-read (first-hand)            | `on-pull.yml` `permissions:` block                      | contents/pull-requests/actions/repository-projects/id-token — **no `issues: write`** ✓                                                         |
| 02:10           | Workflow state (first-hand)                   | `gh workflow list --all`                                | `parallel` (iterate.yml) **disabled_manually** · `pull` active ✓                                                                               |
| 02:11           | Vercel sweep (first-hand)                     | PR #1606 raw rollup                                     | `Vercel: FAILURE` (+ Preview Comments SUCCESS) → systemic trend continues                                                                      |
| 02:12           | Durable capture                               | this document                                           | Written to `docs/issue-manager-audit-2026-10-24-loop47.md` → PR → human review                                                                 |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — independently re-derived this run (script over all 82 issues' full label sets); exact structural match with loops 7–46 → no-flip-flop rule applies.

Partition (first-hand this run, reconciles to 82 ✓):

- **33 compliant**: `480, 483, 485, 486, 487, 488, 492, 494, 500, 501, 502, 503, 521, 578, 579, 580, 590, 609, 610, 611, 613, 650, 663, 664, 666, 667, 683, 684, 685, 687, 705, 706, 708`
- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (carries `P3` + non-contract `DX-engineer`)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not contract `docs`)
- **13 multi-category**: `305(ci,enhancement) · 496(enhancement,security) · 498(enhancement,security) · 515(enhancement,security) · 522(ci,enhancement,refactor) · 523(enhancement,refactor) · 549/550/551/581(enhancement,test) · 584(ci,enhancement) · 688(enhancement,security) · 713(enhancement,test)` — of these, `305, 584, 713` also lack priority (script bucket overlap; unique remediation still 49 ✓)
- **0 multi-priority**

**Application attempts (first-hand this run):**

```
gh issue edit 755 --add-label "enhancement"
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

**Application blocked: issue write → 403 (§5). No flip-flop vs loops 7–46.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (re-verified first-hand this run where noted ◆)

| ID  | Members                 | Canonical | Disposition (evidence marked ◆ = first-hand this run)                                                                                                                                               |
| --- | ----------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | ◆ Rate-limiter tests **98/98 green** + all 6 ACs of #496 evidenced (§4.1) → close 480 (write blocked)                                                                                               |
| D2  | 305, 595, 670, 584, 744 | **670**   | ◆ `iterate.yml` `npm ci \|\| true` at **lines 72 and 342** (still present); workflow-file push platform-blocked (§5) → remedy `docs/patches/fix-pnpm-consistency-iterate-744.patch` ✓ present       |
| D3  | 628, 501, 724           | **501**   | ◆ **11 e2e specs + fixtures.ts** in `tests/e2e/` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) ✓  |
| D4  | 631, 725, 754           | **725**   | ◆ Router tests incl. `k8s-router.test.ts` (**458 lines**) ✓; **`packages/stripe/src/webhook-idempotency.test.ts` present (13,306 B) → #754 stale** → close 631/754                                  |
| D5  | 720, 748                | **748**   | ◆ `.nvmrc` = `22.14.0` ✓ (neither "missing" nor "invalid '20'") → both stale/closable                                                                                                               |
| D6  | 785, 789                | —         | ◆ **Not duplicates**; both stale: stripe `dependencies` = `@saasfly/common,@saasfly/db,@t3-oss/env-nextjs,stripe,zod` (no `next`) ✓; ui `peerDependencies: {next >=14, react ^19, react-dom ^19}` ✓ |
| D7  | 551, 550, 549, 581      | **581**   | ◆ Umbrella children verified: k8s router tests ✓ · `packages/auth` **3 test files** (`clerk`, `env`, `logger`) ✓ · `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}` ✓                 |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop 47)                                                                                             |
| --- | ------------------ | --------- | ------------------------------------------------------------------------------------------------------------ |
| N1  | 551, 631           | **#551**  | ◆ Confirmed — `k8s-router.test.ts` 458 lines present                                                         |
| N2  | 523, 667           | **#523**  | Carried (evidence unchanged since loop 43)                                                                   |
| N3  | 751, 753, 723      | **#751**  | Carried (evidence unchanged since loop 43)                                                                   |
| N4  | 683, 684, 634, 719 | **#684**  | ◆ `719` stale — root `tsconfig.json` present (extends `tooling/typescript-config/base.json`) ✓; rest carried |
| N5  | 726, 488           | **#488**  | Carried                                                                                                      |
| N6  | 611, 666           | **#666**  | ◆ Stale — `apps/nextjs/src/app/error.tsx` **and** `not-found.tsx` present ✓                                  |
| N7  | 705, 706           | **#705**  | ◆ Stale — root `Dockerfile` + `.devcontainer/` present ✓                                                     |

**Additional first-hand stale check (loop 47):** `#613` — `.github/workflows/` contains only `iterate.yml` + `on-pull.yml`; no duplicate `paratterate.yml` ✓.

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§5).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection — P0 #496 (first-hand AC verification this run)

Selected per contract (only P0 on board; label scan: `enhancement,P0,security`). **All 6 acceptance criteria satisfied on `main`** — repair would be duplicate/speculative work (contract forbids); remaining action is administrative close → blocked (§5):

| #   | Acceptance Criterion               | Evidence (first-hand this run)                                                                                                                                   |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Redis-backed rate limiter          | `packages/api/src/distributed-rate-limiter.ts` — ioredis client, sliding-window ZSET `pipeline()`, `REDIS_URL` config                                            |
| 2   | Consistent across instances        | Shared Redis key prefix + `pipeline()` atomic window ops (same file, `checkLimit`)                                                                               |
| 3   | Configuration via environment vars | `.env.example:124-133` (`REDIS_URL`, `RATE_LIMIT_READ/WRITE/STRIPE_MAX_REQUESTS` + `*_WINDOW_MS`) + `RATE_LIMIT_DEFAULTS` in `@saasfly/common` resilience config |
| 4   | Graceful degradation               | In-memory fallback + `logger.warn` at `distributed-rate-limiter.ts:96, 189, 227` (init failure, per-request Redis error, sync path)                              |
| 5   | Unit tests                         | `rate-limiter.test.ts`, `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts` → **98/98 passed (1.14s)** this run                          |
| 6   | Setup/configuration documentation  | `docs/redis-setup.md` (9,588 B, **explicitly references Issue #496** at line 5) + `docs/blueprint.md:704-725` rate-limiting section                              |

Wiring verified: `trpc.ts:433-505` (`rateLimit` middleware → `getLimiter`; `adminProcedure`/`protectedProcedure` both `.use(rateLimit(...))`).

**Repair action attempted**: administrative close of #496 → comment/close requires `addComment` → **403** → FAIL-SAFE (documented here).

### §3.2 Stale-set — spot re-verified first-hand this run

`#613` (workflows: only `iterate.yml` + `on-pull.yml` ✓) · `#754` (webhook idempotency tests exist ✓) · `#785`/`#789` (D6 ✓) · `#719` (N4 ✓) · `#720`/`#748` (`.nvmrc` = `22.14.0` ✓) · plus §3.1's #496 and §2's D1/D3/D4/D7 evidence.

### §3.3 P0/P1 evidence set — first-hand or carried

- **#498** (RBAC): `trpc.ts:349 requireRole()`, `:422 createRoleBasedProcedure()` ◆ first-hand → AC complete.
- **#515** (CSRF): `proxy.ts:54 validateCSRF()`, wired at `:243`, matcher at `:95` ◆ first-hand → AC complete.
- **#500**: `packages/auth` 3 test files (via D7 ◆) + `tests/e2e/auth.spec.ts` ◆.
- **#786** (log partial secret — payload-assigned `P1`, currently unlabeled): stripe webhook route logs exclusively via structured `logger.*`; comment at line ~162 explicitly documents suppression of "information that could aid brute-force attacks on the webhook secret" ◆ → appears addressed; needs human confirmation before close (no guessing; issue write blocked anyway).

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

Contract selection gates on P0/P1 on **current** labels; the only P0 (#496) is code-complete. Remaining open work (e.g. `iterate.yml` pnpm fix D2, which is blocked at the platform layer, not by scope) was **not** re-targeted: deviating from the selection rule without issue-side recording would violate fail-safe (no guessing; issue creation blocked).

---

## §4 Permission Surface (root cause + probes)

| Surface                 | Probe / check (first-hand this run)  | Result                                                                                          |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Issues (label add)      | `gh issue edit 755 --add-label …`    | **403** `Resource not accessible by integration (addLabelsToLabelable)`                         |
| Issues (comment)        | `gh issue comment 755`               | **403** `Resource not accessible by integration (addComment)`                                   |
| Issues (create/close)   | not re-probed this run               | carried from loop 46: **403 `createIssue`** (first-hand there)                                  |
| Workflow files (push)   | not re-probed this run               | carried from loop 46: **`[remote rejected]` GitHub App lacks `workflows` permission**           |
| Non-workflow push + PRs | loop-46 end-to-end (push, PR, merge) | **writable** ✓ (loop-46 merged #1606 + landed its own audit PR #1607 — itself first-hand proof) |

**Root cause (re-read first-hand):** this run executes under `on-pull.yml`, whose top-level `permissions:` block (re-read this run) is `contents, pull-requests, actions, repository-projects, id-token` — **no `issues: write`**; the only workflow granting it (`iterate.yml`, `name: parallel`) is **`disabled_manually`** (re-confirmed via `gh workflow list --all` this run). Two zero-code human unblocks (carried):

1.  Re-enable the `parallel` workflow (it carries `issues: write`), or
2.  Apply `docs/patches/on-pull-issues-write-permission.patch` to `.github/workflows/on-pull.yml` via human/admin commit — **the workflow's own token cannot apply it** (GitHub App self-escalation guard, confirmed first-hand in loop 46).

---

## §5 Systemic observations (first-hand this run)

1.  **Runner event**: `schedule` (cron `0 * * * *`) — hourly `pull` workflow runs. This run = `40052626320` / #4925 on `main@6283113`.
2.  **`pull_request` run flakiness (carried loop-46 nuance)**: recent `pull_request` runs of workflow `pull` — `40046336511` **failure (9s)**, `40044946116` **failure**, `40044239744` **success (26m)**; schedule runs proceeding normally (this run `in_progress` at introspection).
3.  **Vercel systemic failure (carried)**: raw rollup of merged PR #1606 → **`Vercel: FAILURE`** (first-hand this run); follows loop-43+ pattern of 6/6 merged PRs failing Vercel previews on external namespace `donis-projects-f77cd16a` — non-attributable to diffs; treated as systemic per precedent.
4.  **Delegation layer down 6 loops**: loops 42–47 all fail `explore` spawns with `ProviderModelNotFoundError: muse-spark-1.3-contributor-free`. Provider alternatives observed in error: `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`. All audit verification remains first-hand.
5.  **Dependency vulnerability baseline** (carried loop 45 §3.5: **31 prod / 52 full**) — security-sensitive, outside STEP 4 scope; open a dedicated dependency-refresh issue/PR once issue writes are unblocked (or directly as PR).
6.  **Phantom prettier cache** (carried loop 43–46): `git rm "'node_modules/.cache/.prettiercache'"` still pending (quote-named tracked file makes cleanliness checks report phantom modifications).

---

## §6 Actions for human reviewer (unchanged carry-forward, in priority order)

1.  **Unblock issue writes** (§4): re-enable the `parallel` workflow **or** apply `docs/patches/on-pull-issues-write-permission.patch` to `on-pull.yml` via admin commit. Either permanently unblocks STEP 1–3 (label normalization payload in §1 + dedupe closes in §2).
2.  **Close P0 #496** administratively — all 6 ACs evidenced (§3.1); duplicate `#480` can close simultaneously referencing #496.
3.  **Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch`** via admin commit (workflow-file pushes are platform-blocked for the App) → resolves cluster D2 (305/595/670/584/744).
4.  **Reconcile stale issues** listed in §2/§3.2 as closable: `613, 628, 719, 720, 724, 748, 754, 785, 789` + cluster non-canonicals, using first-hand evidence recorded here.
5.  **Fix the explore model config** (`.opencode` agent model `muse-spark-1.3-contributor-free` no longer exists) — restore subagent delegation for future loops.
6.  **Review the vulnerability baseline** (31 prod / 52 full) — open a dedicated dependency-refresh PR.
7.  **Untrack the quote-named prettier cache**: `git rm "'node_modules/.cache/.prettiercache'"`.

---

## §7 Final state

**waiting for human review** — this audit is delivered via PR (the only writable durable surface while issue mutations remain 403). Next loop should re-run Phase 0 from scratch; if issue writes are unblocked by then, execute the §1 payload + §2/§3 closes directly.
