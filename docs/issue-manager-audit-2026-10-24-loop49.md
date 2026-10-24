# Issue Manager Audit — 2026-10-24 (loop 49)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-24 19:04 – 19:16 UTC                                                                                                                                                                                                                                                                                                                               |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                                                                                                                      |
| DEFAULT_BRANCH        | `main` (auto-detected via `gh repo view`); synced at `31cafe0` = loop-48 audit merge (PR #1609)                                                                                                                                                                                                                                                            |
| Phase 0.1 open PRs    | **0** at entry **and** re-checked immediately before PR creation → PR HANDLER MODE not entered                                                                                                                                                                                                                                                             |
| Phase 0.2 open issues | **82** — issue-set digest `84696e81` (sha256 of comma-joined sorted numbers) = **exact match with loops 33–48** → no drift                                                                                                                                                                                                                                 |
| Runner context        | `on-pull.yml` (`name: pull`), event = **`schedule`** (cron `0 * * * *`), `GITHUB_RUN_NUMBER=4932`, run `40123728521`, ref `refs/heads/main` @ `31cafe0` — contrast with loop 48 (`schedule` run 4929 @ `07a1f8b`)                                                                                                                                          |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                                                                                                                       |
| Final state           | **waiting for human review** — PR carrying this audit; issue-side writes remain 403 (§4)                                                                                                                                                                                                                                                                   |
| Skills used           | `openx-basefly` (repo harness/agent conventions) · `github-workflow-automation` (workflow `permissions:` semantics → applied to §4 root cause) — contract-mandated skill reporting fulfilled here                                                                                                                                                          |
| Subagents             | 1 attempted, **1 failed**: `subagent_type=explore` bg `bg_d10e6749` → **`ProviderModelNotFoundError: Model not found: opencode/muse-spark-1.3-contributor-free`** (provider suggests `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`) — **8th consecutive loop** (loops 42–49) of delegation-layer failure. All verification executed first-hand |

### Decision summary (why this phase ran)

1.  **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → no PR HANDLER MODE (re-confirmed 0 open PRs before PR creation).
2.  **Phase 0.2**: `gh issue list --state open --limit 300` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run once a phase is activated).
3.  **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33–48** → no drift; carried payload applies verbatim (no-flip-flop rule).
4.  **STEP 1**: label matrix carried from loop 48 (33 compliant / 49 remediation; structurally unchanged — same issue set). Apply attempt (label add `enhancement` on #755, payload-compliant) → **403** `Resource not accessible by integration` (§4). Comment probe → **403**.
5.  **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent first-hand file evidence this run (§2). All closes/commentaries require issue write → blocked.
6.  **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.08s); **all 6 acceptance criteria evidenced** (§3.1). Repair action = administrative close → probe → **403** → FAIL-SAFE.
7.  **Repo health baseline (new first-hand this run)**: full `pnpm vitest run` → **155 files / 2221 tests passed** (43.09s); `pnpm typecheck` → **9/9 tasks successful** (12.8s); `pnpm lint` → **9/9 tasks successful** (45.6s).
8.  **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface; probe re-confirmed `addComment` 403 this run).
9.  **Permission-surface delta**: none — writable surface remains `git push (non-workflow files) + PR create/close`; blocked surface remains `all issue mutations (label/comment/create/close) + workflow-file pushes` (issue side re-confirmed first-hand this run: §4; workflow side carried from loop 46).
10. **Probe hygiene**: three direct 403 probes this run (label add on #755 — payload-compliant, so no residue if it had succeeded; comment probe on #755 failed before content was written; close probe on #496 failed before comment was written); no probe branches pushed; workspace branched from current `main`; untracked `.omo/run-continuation/*.json` session artifacts deliberately **not** committed.

### Action log

| Timestamp (UTC) | Action                                          | Target                                                   | Result                                                                                                                                                                                                                                                 |
| --------------- | ----------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 19:04           | Phase 0.1 entry: `gh pr list --state open`      | repo `cpa03/basefly`                                     | **0 open PRs** → Phase 0.2                                                                                                                                                                                                                             |
| 19:04           | Skill load                                      | `openx-basefly`                                          | Loaded; harness/agent conventions applied                                                                                                                                                                                                              |
| 19:05           | Phase 0.2 entry: `gh issue list`                | repo                                                     | **82 open issues → ISSUE MANAGER MODE**                                                                                                                                                                                                                |
| 19:05           | Label inventory                                 | `gh label list` (59 labels)                              | Contract labels (`bug…security`, `P0–P3`) + specialty labels present ✓                                                                                                                                                                                 |
| 19:05           | Issue dataset snapshot + drift check            | sorted issue-number digest                               | 82 numbers, `84696e81…` — **match loops 33–48** → no drift                                                                                                                                                                                             |
| 19:06           | STEP 1 apply attempt (first-hand)               | `gh issue edit 755 --add-label enhancement`              | **403** `Resource not accessible by integration (addLabelsToLabelable)`                                                                                                                                                                                |
| 19:07           | STEP 2 prerequisite probe (first-hand)          | `gh issue comment 755 --body "probe (loop49)"`           | **403** `Resource not accessible by integration (addComment)` — no content written                                                                                                                                                                     |
| 19:07           | Subagent attempt (contract orchestration)       | `task(subagent_type=explore, bg_d10e6749)`               | **FAILED** — `ProviderModelNotFoundError: muse-spark-1.3-contributor-free` → 8th consecutive (loops 42–49)                                                                                                                                             |
| 19:08           | STEP 2/3 cluster re-verification (first-hand)   | `.nvmrc`/workflows/e2e/tsconfig/Dockerfile/stripe deps   | All carried verdicts re-confirmed (§2) — 10 checks, all ✓                                                                                                                                                                                              |
| 19:09           | Drift-free workspace install                    | `pnpm install --frozen-lockfile`                         | **6.6s** (pre-existing node engine warning: wanted `>=22`, runner has `v20.20.2`)                                                                                                                                                                      |
| 19:10           | STEP 4 selection                                | `gh issue view` label scan                               | P0 **#496** → only P0 on board → selected per contract                                                                                                                                                                                                 |
| 19:10           | STEP 4 verification: rate-limiter tests         | 3 `*rate-limiter*.test.ts` files                         | **98/98 passed** (1.08s) → #496 code-complete                                                                                                                                                                                                          |
| 19:10           | STEP 4 repair action (administrative close)     | `gh issue close 496 --comment …`                         | **403** `Resource not accessible by integration (addComment)` → FAIL-SAFE (§3.1)                                                                                                                                                                       |
| 19:11           | Full test-suite baseline (new this run)         | `pnpm vitest run`                                        | **155 files / 2221 tests passed** (43.09s) — repo healthy                                                                                                                                                                                              |
| 19:12           | §3.1 AC evidence sweep (first-hand)             | `distributed-rate-limiter.ts`/`.env.example`/`trpc.ts`   | ioredis sliding-window `zadd`/`zremrangebyscore` pipeline ✓ · `.env.example:124-133` ✓ · `rateLimit` wired `:433/:486/:496/:505` ✓ · fallbacks `:96/:189/:227` ✓ · `redis-setup.md:5` refs #496 ✓                                                      |
| 19:13           | typecheck + lint baseline (new this run)        | `pnpm typecheck` / `pnpm lint`                           | **9/9** successful (12.8s) / **9/9** successful (45.6s)                                                                                                                                                                                                |
| 19:13           | §3.3 P0/P1 + stale-set spot checks (first-hand) | `slice(-8)`/webhook route/k8s tests/auth tests/RBAC/CSRF | no `slice(-8)` anywhere ✓ · webhook logs via `logger.*` with `:162` suppression comment ✓ · `k8s-router.test.ts` 458 lines ✓ · `packages/auth` 3 test files ✓ · `requireRole:349`/`createRoleBasedProcedure:422` ✓ · `validateCSRF proxy.ts:54/:243` ✓ |
| 19:13           | Runner introspection (first-hand)               | `env \| grep ^GITHUB_`                                   | event `schedule`, run 4932 / `40123728521`, SHA `31cafe0` (= loop-48 merge of audit PR #1609)                                                                                                                                                          |
| 19:13           | §4 root-cause re-read (first-hand)              | `on-pull.yml` `permissions:` block                       | contents/pull-requests/actions/repository-projects/id-token — **no `issues: write`** ✓                                                                                                                                                                 |
| 19:13           | Workflow state (first-hand)                     | `gh workflow list --all`                                 | `parallel` (iterate.yml) **disabled_manually** · `pull` active ✓                                                                                                                                                                                       |
| 19:13           | Vulnerability baseline refresh (first-hand)     | `pnpm audit --json`                                      | **52 total** (7 critical / 15 high / 23 moderate / 7 low) — matches carried `52 full` baseline                                                                                                                                                         |
| 19:14           | Durable capture                                 | this document                                            | Written to `docs/issue-manager-audit-2026-10-24-loop49.md` → PR → human review                                                                                                                                                                         |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — carried from loop 48 (issue set byte-identical this run per digest `84696e81`, so the matrix is unchanged; no-flip-flop rule). Structural match with loops 7–48.

Partition (reconciles to 82 ✓):

- **33 compliant**: `480, 483, 485, 486, 487, 488, 492, 494, 500, 501, 502, 503, 521, 578, 579, 580, 590, 609, 610, 611, 613, 650, 663, 664, 666, 667, 683, 684, 685, 687, 705, 706, 708`
- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (carries `P3` + non-contract `DX-engineer` label)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not contract `docs`)
- **13 multi-category**: `305(ci,enhancement) · 496(enhancement,security) · 498(enhancement,security) · 515(enhancement,security) · 522(ci,enhancement,refactor) · 523(enhancement,refactor) · 549/550/551/581(enhancement,test) · 584(ci,enhancement) · 688(enhancement,security) · 713(enhancement,test)` — of these, `305, 584, 713` also lack priority (script bucket overlap; unique remediation still 49 ✓)
- **0 multi-priority**

**Application attempts (first-hand this run):**

```
gh issue edit 755 --add-label "enhancement"   → GraphQL 403 (addLabelsToLabelable)
gh issue comment 755 --body "probe (loop49)"   → GraphQL 403 (addComment)
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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–48.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (re-verified first-hand this run where noted ◆)

| ID  | Members                 | Canonical | Disposition (evidence marked ◆ = first-hand this run)                                                                                                                                                                                                        |
| --- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | 496, 480                | **496**   | ◆ Rate-limiter tests **98/98 green** + all 6 ACs of #496 evidenced (§3.1) → close 480 (write blocked)                                                                                                                                                        |
| D2  | 305, 595, 670, 584, 744 | **670**   | ◆ `iterate.yml` `npm ci \|\| true` at **lines 72 and 342** + `hashFiles('**/package-lock.json')` cache key at **line 59** (still present); workflow-file push platform-blocked (§4) → remedy `docs/patches/fix-pnpm-consistency-iterate-744.patch` ✓ present |
| D3  | 628, 501, 724           | **501**   | ◆ **11 e2e specs** in `tests/e2e/` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) + `fixtures.ts` ✓                                                         |
| D4  | 631, 725, 754           | **725**   | ◆ Router tests incl. `k8s-router.test.ts` (**458 lines**) ✓; **`packages/stripe/src/webhook-idempotency.test.ts` present (13,306 B) → #754 stale** → close 631/754                                                                                           |
| D5  | 720, 748                | **748**   | ◆ `.nvmrc` = `22.14.0` ✓ + `package.json` `engines.node >=22` ✓ (neither "missing" nor "invalid '20'") → both stale/closable                                                                                                                                 |
| D6  | 785, 789                | —         | ◆ **Not duplicates**; both stale: stripe `dependencies` = `@saasfly/common,@saasfly/db,@t3-oss/env-nextjs,stripe,zod` (no `next`) ✓; ui `peerDependencies: {next >=14, react ^19, react-dom ^19}` ✓                                                          |
| D7  | 551, 550, 549, 581      | **581**   | ◆ Umbrella children verified: k8s router tests 458 lines ✓ · `packages/auth` **3 test files** (`clerk.test.ts`, `env.test.ts`, `logger.test.ts`) ✓ · `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}` ✓                                        |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop 49)                                                            |
| --- | ------------------ | --------- | --------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | ◆ Confirmed — `k8s-router.test.ts` 458 lines present                        |
| N2  | 523, 667           | **#523**  | Carried (evidence unchanged since loop 43)                                  |
| N3  | 751, 753, 723      | **#751**  | Carried (evidence unchanged since loop 43)                                  |
| N4  | 683, 684, 634, 719 | **#684**  | ◆ `719` stale — root `tsconfig.json` present ✓; rest carried                |
| N5  | 726, 488           | **#488**  | Carried                                                                     |
| N6  | 611, 666           | **#666**  | ◆ Stale — `apps/nextjs/src/app/error.tsx` **and** `not-found.tsx` present ✓ |
| N7  | 705, 706           | **#705**  | ◆ Stale — root `Dockerfile` + `.devcontainer/devcontainer.json` present ✓   |

**Additional first-hand stale checks (loop 49):** `#613` — `.github/workflows/` contains only `iterate.yml` + `on-pull.yml`; no duplicate workflow file ✓ · `#786` — `slice(-8)` appears **nowhere** in `apps/`+`packages/`; current route `api/webhooks/stripe/route.ts` logs exclusively via structured `logger.*` with an explicit comment at `:162` documenting suppression of information that could aid brute-force attacks on the webhook secret ✓.

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection — P0 #496 (first-hand AC verification this run)

Selected per contract (only P0 on board; label scan: `enhancement,P0,security`). **All 6 acceptance criteria satisfied on `main`** — repair would be duplicate/speculative work (contract forbids); remaining action is administrative close → probe → **403** (§4):

| #   | Acceptance Criterion               | Evidence (first-hand this run)                                                                                                                                    |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Redis-backed rate limiter          | `packages/api/src/distributed-rate-limiter.ts` — ioredis client (`:13/:181`), sliding-window ZSET `pipeline.zremrangebyscore` (`:209`) + `pipeline.zadd` (`:214`) |
| 2   | Consistent across instances        | Shared Redis key prefix + `pipeline()` atomic window ops (same file, sliding-window algorithm documented `:5/:151`)                                               |
| 3   | Configuration via environment vars | `.env.example:124-133` (`REDIS_URL`, `RATE_LIMIT_READ/WRITE/STRIPE_MAX_REQUESTS` + `*_WINDOW_MS`) + `RATE_LIMIT_DEFAULTS` in `@saasfly/common` resilience config  |
| 4   | Graceful degradation               | In-memory fallback + `logger.warn` at `distributed-rate-limiter.ts:96, 189, 227` (init failure, per-request Redis error, sync path)                               |
| 5   | Unit tests                         | `rate-limiter.test.ts` (50), `distributed-rate-limiter.test.ts` (46), `distributed-rate-limiter-sync.test.ts` (8) → **98/98 passed (1.08s)** this run             |
| 6   | Setup/configuration documentation  | `docs/redis-setup.md:5` (**explicitly references Issue #496**) + `docs/blueprint.md` rate-limiting section                                                        |

Wiring verified: `trpc.ts:433` (`rateLimit` middleware → `getLimiter`); `:486`/`:496`/`:505` (`procedure.use(rateLimit(...))` incl. `protectedProcedure` and `adminProcedure`).

**Repair action attempted**: `gh issue close 496 --comment "…"` → **403** `addComment` → FAIL-SAFE (documented here).

### §3.2 Stale-set — spot re-verified first-hand this run

`#613` (workflows: only `iterate.yml` + `on-pull.yml` ✓) · `#754` (webhook idempotency tests exist ✓) · `#785`/`#789` (D6 ✓) · `#719` (N4 ✓) · `#720`/`#748` (`.nvmrc` = `22.14.0` ✓) · `#786` (§2.2 ✓) · `#611`/`#666` (N6 ✓) · `#705`/`#706` (N7 ✓) · plus §3.1's #496 and §2's D1/D3/D4/D7 evidence.

### §3.3 P0/P1 evidence set — first-hand this run

- **#498** (RBAC): `trpc.ts:349 requireRole()`, `:422 createRoleBasedProcedure()` ◆ → AC complete.
- **#515** (CSRF): `proxy.ts:54 validateCSRF()`, wired at `:243` ◆ → AC complete.
- **#500**: `packages/auth` 3 test files (via D7 ◆) + `tests/e2e/auth.spec.ts` ◆.
- **#786** (log partial secret — payload-assigned `P1`, currently unlabeled): no `slice(-8)` anywhere; current webhook route logs exclusively via structured `logger.*` with `:162` suppression comment ◆ → appears addressed; needs human confirmation before close (no guessing; issue write blocked anyway).

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

Contract selection gates on P0/P1 on **current** labels; the only P0 (#496) is code-complete. Remaining open work (e.g. `iterate.yml` pnpm fix D2, which is blocked at the platform layer, not by scope) was **not** re-targeted: deviating from the selection rule without issue-side recording would violate fail-safe (no guessing; issue creation blocked).

---

## §4 Permission Surface (root cause + probes)

| Surface                  | Probe / check (first-hand this run)            | Result                                                                                |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| Issues (label add)       | `gh issue edit 755 --add-label enhancement`    | **403** `Resource not accessible by integration (addLabelsToLabelable)`               |
| Issues (comment)         | `gh issue comment 755 --body "probe (loop49)"` | **403** `Resource not accessible by integration (addComment)` — no content written    |
| Issues (close w/comment) | `gh issue close 496 --comment "…"`             | **403** `Resource not accessible by integration (addComment)` — issue not closed      |
| Issues (create)          | not re-probed this run                         | carried from loop 46: **403 `createIssue`** (first-hand there)                        |
| Workflow files (push)    | not re-probed this run                         | carried from loop 46: **`[remote rejected]` GitHub App lacks `workflows` permission** |
| Non-workflow push + PRs  | loop-48 end-to-end (PR #1609 merged)           | **writable** ✓ (this audit's own PR is the live proof)                                |

**Root cause (re-read first-hand):** this run executes under `on-pull.yml`, whose top-level `permissions:` block (re-read this run) is `contents, pull-requests, actions, repository-projects, id-token` — **no `issues: write`**; the only workflow granting it (`iterate.yml`, `name: parallel`) is **`disabled_manually`** (re-confirmed via `gh workflow list --all` this run). Two zero-code human unblocks (carried):

1.  Re-enable the `parallel` workflow (it carries `issues: write`), or
2.  Apply `docs/patches/on-pull-issues-write-permission.patch` to `.github/workflows/on-pull.yml` via human/admin commit — **the workflow's own token cannot apply it** (GitHub App self-escalation guard, confirmed first-hand in loop 46).

---

## §5 Systemic observations (first-hand this run)

1.  **Runner event**: `schedule` (cron `0 * * * *`) — hourly `pull` workflow runs. This run = `40123728521` / #4932 on `main@31cafe0`.
2.  **Repo health baseline (new)**: full `pnpm vitest run` → **155 files / 2221 tests passed** (43.09s); `pnpm typecheck` → **9/9** (12.8s); `pnpm lint` → **9/9** (45.6s). First full-suite baseline captured this loop; use as regression reference for future loops.
3.  **`pull_request` run flakiness (carried)**: loop-47's PR #1608 `pull_request` runs failed twice while its `schedule` siblings succeeded; pattern: `pull_request` events flaky, `schedule` events stable. Monitor this PR's checks accordingly.
4.  **Vercel systemic failure (carried)**: every merged PR fails Vercel previews on external namespace `donis-projects-f77cd16a` — non-attributable to diffs; treated as systemic per loop-43+ precedent.
5.  **Delegation layer down 8 loops**: loops 42–49 all fail `explore` spawns with `ProviderModelNotFoundError: muse-spark-1.3-contributor-free`. Provider alternatives observed in error: `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`. All audit verification remains first-hand.
6.  **Dependency vulnerability baseline (first-hand refresh)**: `pnpm audit --json` → **52 total: 7 critical / 15 high / 23 moderate / 7 low** — matches carried loop-45/48 `52 full` baseline. Security-sensitive, outside STEP 4 scope; open a dedicated dependency-refresh PR once issue writes are unblocked (or directly as PR).
7.  **Phantom prettier cache (delta)**: loop 49's `git status --short` shows only untracked `.omo/run-continuation/*.json` session artifacts — no phantom modifications observed (consistent with loop 48).

---

## §6 Actions for human reviewer (unchanged carry-forward, in priority order)

1.  **Unblock issue writes** (§4): re-enable the `parallel` workflow **or** apply `docs/patches/on-pull-issues-write-permission.patch` to `on-pull.yml` via admin commit. Either permanently unblocks STEP 1–3 (label normalization payload in §1 + dedupe closes in §2).
2.  **Close P0 #496** administratively — all 6 ACs evidenced (§3.1); duplicate `#480` can close simultaneously referencing #496.
3.  **Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch`** via admin commit (workflow-file pushes are platform-blocked for the App) → resolves cluster D2 (305/595/670/584/744).
4.  **Reconcile stale issues** listed in §2/§3.2 as closable: `613, 628, 719, 720, 724, 748, 754, 785, 786, 789` + cluster non-canonicals, using first-hand evidence recorded here.
5.  **Fix the explore model config** (`.opencode` agent model `muse-spark-1.3-contributor-free` no longer exists) — restore subagent delegation for future loops (8 consecutive failures).
6.  **Review the vulnerability baseline** (52 total: 7 critical / 15 high, refreshed this run) — open a dedicated dependency-refresh PR.
7.  **Verify phantom prettier-cache state** (§5.7): if the quote-named tracked file still exists, `git rm "'node_modules/.cache/.prettiercache'"`.

---

## §7 Final state

**waiting for human review** — this audit is delivered via PR (the only writable durable surface while issue mutations remain 403). Next loop should re-run Phase 0 from scratch; if issue writes are unblocked by then, execute the §1 payload + §2/§3 closes directly.
