# Issue Manager Audit — 2026-10-25 (loop 50)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-25 00:36 – 00:50 UTC                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                                                                                                                                                                                                                                                                            |
| DEFAULT_BRANCH        | `main` (auto-detected via `gh repo view`); synced at `1ae38e0` = loop-49 audit merge (PR #1610)                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Phase 0.1 open PRs    | **0** at entry → PR HANDLER MODE not entered                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Phase 0.2 open issues | **82** — issue-set digest `84696e81` (sha256 of comma-joined sorted numbers) = **exact match with loops 33–49** → no drift                                                                                                                                                                                                                                                                                                                                                                                       |
| Runner context        | `on-pull.yml` (`name: pull`), event = **`schedule`** (`GITHUB_EVENT_NAME=schedule`), `GITHUB_RUN_NUMBER=4935`, `GITHUB_SHA=1ae38e0`, `GITHUB_WORKFLOW_REF=cpa03/basefly/.github/workflows/on-pull.yml@refs/heads/main`                                                                                                                                                                                                                                                                                           |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                                                                                                                                                                                                                                                                             |
| Final state           | **waiting for human review** — PR carrying this audit + one repo change (phantom cache removal); issue-side writes remain 403 (§4)                                                                                                                                                                                                                                                                                                                                                                               |
| Skills used           | `openx-basefly` (repo harness/agent conventions → agent model inventory used to diagnose §5.5 delegation failures) · `github-workflow-automation` (workflow `permissions:` semantics → applied to §4 root cause) — contract-mandated skill reporting fulfilled here                                                                                                                                                                                                                                              |
| Subagents             | 2 attempted, **2 failed**: `subagent_type=explore` bg `bg_83312a65` → **`ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free`** (provider suggests `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`); `subagent_type=general` bg `bg_4dbeeb1c` → **`ProviderModelNotFoundError: iflowcn/big-pickle`** (suggests `siliconflow-cn`) — **9th consecutive loop** (42–50) for explore; first recorded `general` failure with a distinct missing model. All verification executed first-hand |

### Decision summary (why this phase ran)

1.  **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → no PR HANDLER MODE.
2.  **Phase 0.2**: `gh issue list --state open --limit 1000` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run once a phase is activated).
3.  **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33–49** → no drift; carried payload applies verbatim (no-flip-flop rule).
4.  **STEP 1**: label matrix recomputed first-hand → **33 compliant / 49 remediation** (structurally identical to loops 7–49; see §1 for this run's exact partition). Apply attempt (label add `enhancement` on #755, payload-compliant) → **403** `Resource not accessible by integration` (§4). Comment probe → **403**.
5.  **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent first-hand file evidence this run (§2). All closes/commentaries require issue write → blocked.
6.  **STEP 4**: only P0 on the board is **#496** → selected per contract (label scan first-hand: `P0,enhancement,security`). Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.09s); **all 6 acceptance criteria evidenced** (§3.1). Repair action = administrative close → probe → **403** → FAIL-SAFE.
7.  **Repo health baseline (first-hand this run)**: full `pnpm vitest run` → **155 files / 2221 tests passed** (43.73s); `pnpm typecheck` → **9/9 tasks successful** (12.7s); `pnpm lint` → **9/9 tasks successful** (45.4s); `pnpm format` → 10/10 tasks (10.2s).
8.  **Repo change made (first-hand)**: removed tracked phantom file `'node_modules/.cache/.prettiercache'` (loop-49 §6.7 carried action; rationale in §5.8) — the only working-tree change in this loop's PR besides this document.
9.  **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface; probes re-confirmed `addLabelsToLabelable`/`addComment` 403 this run).
10. **Permission-surface delta**: none — writable surface remains `git push (non-workflow files) + PR create/close`; blocked surface remains `all issue mutations (label/comment/create/close) + workflow-file pushes` (issue side re-confirmed first-hand this run: §4).
11. **Probe hygiene**: three direct 403 probes this run (label add on #755 — payload-compliant, no residue; comment probe on #755 failed before content was written; close-with-comment probe on #496 failed before comment was written); no probe branches pushed; workspace branched from current `main`; untracked `.omo/run-continuation/*.json` session artifacts deliberately **not** committed.

### Action log

| Timestamp (UTC) | Action                                              | Target                                                   | Result                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00:36           | Phase 0.1 entry: `gh pr list --state open`          | repo `cpa03/basefly`                                     | **0 open PRs** → Phase 0.2                                                                                                                                                                                |
| 00:36           | Skill load                                          | `openx-basefly`                                          | Loaded; harness/agent conventions applied                                                                                                                                                                 |
| 00:36           | Phase 0.2 entry: `gh issue list`                    | repo                                                     | **82 open issues → ISSUE MANAGER MODE**                                                                                                                                                                   |
| 00:36           | Label inventory                                     | `gh label list` (59 labels)                              | Contract labels (`bug…security`, `P0–P3`) + specialty labels present ✓                                                                                                                                    |
| 00:37           | Issue dataset snapshot + drift check                | sorted issue-number digest                               | 82 numbers, `84696e81…` — **match loops 33–49** → no drift                                                                                                                                                |
| 00:37           | Workspace sync                                      | `git pull --ff-only origin main`                         | Already up to date @ `1ae38e0`                                                                                                                                                                            |
| 00:38           | STEP 1 matrix recomputed (first-hand)               | label partition script over 82 issues                    | **33 compliant / 49 remediation** — structural match with loops 7–49                                                                                                                                      |
| 00:38           | STEP 1 apply attempt (first-hand)                   | `gh issue edit 755 --add-label enhancement`              | **403** `Resource not accessible by integration (addLabelsToLabelable)`                                                                                                                                   |
| 00:39           | Subagent attempt #1 (contract orchestration)        | `task(subagent_type=explore, bg_83312a65)`               | **FAILED** — `ProviderModelNotFoundError: muse-spark-1.3-contributor-free` → 9th consecutive (loops 42–50)                                                                                                |
| 00:39           | Subagent attempt #2 (alternate agent type)          | `task(subagent_type=general, bg_4dbeeb1c)`               | **FAILED** — `ProviderModelNotFoundError: iflowcn/big-pickle` → delegation layer fully down; all checks first-hand from here                                                                              |
| 00:39           | Drift-free workspace install                        | `pnpm install --frozen-lockfile`                         | **7.2s** (pre-existing node engine warning: wanted `>=22`, runner has `v20.20.2`)                                                                                                                         |
| 00:40           | STEP 2/3 cluster re-verification (first-hand)       | workflows/e2e/idempotency/nvmrc/tsconfig/Dockerfile/etc. | All carried verdicts re-confirmed (§2) — 17 checks, all ✓                                                                                                                                                 |
| 00:40           | STEP 4 selection                                    | `gh issue list` label scan                               | P0 **#496** → only P0 on board → selected per contract                                                                                                                                                    |
| 00:40           | STEP 4 verification: rate-limiter tests             | 3 `*rate-limiter*.test.ts` files                         | **98/98 passed** (1.09s) → #496 code-complete                                                                                                                                                             |
| 00:41           | STEP 4 probes (comment + close)                     | `gh issue comment 755` / `gh issue close 496`            | Both **403** `addComment` — no content written, #496 not closed → FAIL-SAFE                                                                                                                               |
| 00:41           | Full test-suite baseline                            | `pnpm vitest run`                                        | **155 files / 2221 tests passed** (43.73s) — repo healthy                                                                                                                                                 |
| 00:42           | §3.1 AC evidence sweep (first-hand)                 | `distributed-rate-limiter.ts`/`.env.example`/`trpc.ts`   | ioredis `:13/:181` · sliding-window `zremrangebyscore :209` + `zadd :214` · `.env.example:124-133` ✓ · `rateLimit` `:433/:486/:496/:505` ✓ · fallbacks `:96/:189/:227` ✓ · `redis-setup.md:5` refs #496 ✓ |
| 00:43           | typecheck baseline                                  | `pnpm typecheck`                                         | **9/9** successful (12.7s)                                                                                                                                                                                |
| 00:43           | Vulnerability baseline refresh                      | `pnpm audit --json`                                      | **52 total** (7 critical / 15 high / 23 moderate / 7 low) — matches carried baseline                                                                                                                      |
| 00:44           | lint baseline                                       | `pnpm lint`                                              | **9/9** successful (45.4s) — zero warnings                                                                                                                                                                |
| 00:44           | §3.3 P0/P1 + stale-set spot checks (first-hand)     | RBAC/CSRF/auth tests/k8s tests/webhook route/workflows   | `requireRole:349`/`createRoleBasedProcedure:422` ✓ · `validateCSRF proxy.ts:54/:243` ✓ · auth 3 test files ✓ · k8s 458 lines ✓ · workflows = 2 files only ✓ · no `slice(-8)` ✓                            |
| 00:44           | N2/N3/N5 + §578 spot checks (first-hand)            | barrels/bundle-analyzer/madge/health route               | barrels exist ✓ · no bundle analyzer/code-splitting yet (N3 genuinely open) · `check:circular` madge script exists in `package.json:29` (not wired into workflows) · single `/api/health` route ✓         |
| 00:45           | Runner introspection (first-hand)                   | `env \| grep ^GITHUB_`                                   | event `schedule`, run 4935, SHA `1ae38e0` (= loop-49 merge of audit PR #1610)                                                                                                                             |
| 00:45           | §4 root-cause re-read (first-hand)                  | `on-pull.yml` `permissions:` block                       | contents/pull-requests/actions/repository-projects/id-token — **no `issues: write`** ✓                                                                                                                    |
| 00:45           | Workflow state (first-hand)                         | `gh workflow list --all`                                 | `parallel` (iterate.yml) **disabled_manually** · `pull` active ✓ · Dependabot Updates active ✓                                                                                                            |
| 00:45           | Skill load                                          | `github-workflow-automation`                             | Loaded; `permissions:` semantics applied to §4 root cause                                                                                                                                                 |
| 00:45           | Phantom cache removal (loop-49 §6.7 carried action) | `git rm "'node_modules/.cache/.prettiercache'"`          | **Removed from index** — `.gitignore:4` covers `node_modules` so regeneration is ignored; `pnpm format` re-ran clean (10/10) → no recurrence ✓                                                            |
| 00:46           | Durable capture                                     | this document                                            | Written to `docs/issue-manager-audit-2026-10-25-loop50.md` → PR → human review                                                                                                                            |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — recomputed first-hand this run; structurally identical to loops 7–49 (issue set byte-identical per digest `84696e81`; no-flip-flop rule).

Partition (reconciles to 82 ✓):

- **33 compliant**: `480, 483, 485, 486, 487, 488, 492, 494, 500, 501, 502, 503, 521, 578, 579, 580, 590, 609, 610, 611, 613, 650, 663, 664, 666, 667, 683, 684, 685, 687, 705, 706, 708`
- **27 missing priority only** (script bucket; 3 of these also multi-category → counted once in the 49): `305, 584, 628, 630, 631, 632, 634, 636, 668, 713, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (carries `P3` + non-contract `DX-engineer` label)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not contract `docs`)
- **13 multi-category**: `305(ci,enhancement) · 496(enhancement,security) · 498(enhancement,security) · 515(enhancement,security) · 522(ci,enhancement,refactor) · 523(enhancement,refactor) · 549/550/551/581(enhancement,test) · 584(ci,enhancement) · 688(enhancement,security) · 713(enhancement,test)` — of these, `305, 584, 713` also lack priority (bucket overlap; unique remediation still 49 ✓)
- **0 multi-priority**

**Application attempts (first-hand this run):**

```
gh issue edit 755 --add-label "enhancement"   → GraphQL 403 (addLabelsToLabelable)
gh issue comment 755 --body "probe (loop50)"   → GraphQL 403 (addComment)
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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–49.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (re-verified first-hand this run where noted ◆)

| ID  | Members                 | Canonical | Disposition (evidence marked ◆ = first-hand this run)                                                                                                                                                                                                        |
| --- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | 496, 480                | **496**   | ◆ Rate-limiter tests **98/98 green** + all 6 ACs of #496 evidenced (§3.1) → close 480 (write blocked)                                                                                                                                                        |
| D2  | 305, 595, 670, 584, 744 | **670**   | ◆ `iterate.yml` `npm ci \|\| true` at **lines 72 and 342** + `hashFiles('**/package-lock.json')` cache key at **line 59** (still present); workflow-file push platform-blocked (§4) → remedy `docs/patches/fix-pnpm-consistency-iterate-744.patch` ✓ present |
| D3  | 628, 501, 724           | **501**   | ◆ **11 e2e specs** in `tests/e2e/` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) + `fixtures.ts` ✓                                                         |
| D4  | 631, 725, 754           | **725**   | ◆ Router tests incl. `k8s-router.test.ts` (**458 lines**, `packages/api/src/router/`) ✓; **`packages/stripe/src/webhook-idempotency.test.ts` present (13,306 B) → #754 stale** → close 631/754                                                               |
| D5  | 720, 748                | **748**   | ◆ `.nvmrc` = `22.14.0` ✓ + `package.json` `engines.node >=22` (line 86) ✓ (neither "missing" nor "invalid '20'") → both stale/closable                                                                                                                       |
| D6  | 785, 789                | —         | ◆ **Not duplicates**; both stale: stripe `dependencies` = `@saasfly/common,@saasfly/db,@t3-oss/env-nextjs,stripe,zod` (no `next`) ✓; ui `peerDependencies: {next >=14, react ^19, react-dom ^19}` ✓                                                          |
| D7  | 551, 550, 549, 581      | **581**   | ◆ Umbrella children verified: k8s router tests 458 lines ✓ · `packages/auth` **3 test files** (`clerk.test.ts`, `env.test.ts`, `logger.test.ts`) ✓ · `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}` ✓                                        |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop 50)                                                                                                                                               |
| --- | ------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | ◆ Confirmed — `k8s-router.test.ts` 458 lines present                                                                                                           |
| N2  | 523, 667           | **#523**  | ◆ Barrel `index.ts` present in `packages/{api,common,ui}/src` — export-boundary audit itself still open (not stale)                                            |
| N3  | 751, 753, 723      | **#751**  | ◆ **Genuinely open** — no bundle analyzer / no `next/dynamic` code-splitting found in `next.config.mjs` or dashboard                                           |
| N4  | 683, 684, 634, 719 | **#684**  | ◆ `719` stale — root `tsconfig.json` present ✓; rest carried                                                                                                   |
| N5  | 726, 488           | **#488**  | ◆ `check:circular` madge script exists (`package.json:29`, wired into `ci:check` at `:7`) but **not invoked by any workflow** — partially addressed, keep open |
| N6  | 611, 666           | **#666**  | ◆ Stale — `apps/nextjs/src/app/error.tsx` **and** `not-found.tsx` present ✓                                                                                    |
| N7  | 705, 706           | **#705**  | ◆ Stale — root `Dockerfile` + `.devcontainer/devcontainer.json` present ✓                                                                                      |

**Additional first-hand stale checks (loop 50):** `#613` — `.github/workflows/` contains only `iterate.yml` + `on-pull.yml` (2 files); no duplicate workflow file ✓ · `#786` — `slice(-8)` appears **nowhere** in `apps/`+`packages/`; current route `api/webhooks/stripe/route.ts` logs exclusively via structured `logger.*` with an explicit comment at `:162` documenting suppression of information that could aid brute-force attacks on the webhook secret ✓ · `#578` — single health endpoint `apps/nextjs/src/app/api/health/route.ts` ✓ · `#663` — 8 non-test `eslint-disable` comments remain (audit/consolidation still open) · `#664` — 4 non-test `console.*` in `packages/{db,stripe}` remain (replacement still open).

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection — P0 #496 (first-hand AC verification this run)

Selected per contract (only P0 on board; label scan: `P0,enhancement,security`). **All 6 acceptance criteria satisfied on `main`** — repair would be duplicate/speculative work (contract forbids); remaining action is administrative close → probe → **403** (§4):

| #   | Acceptance Criterion               | Evidence (first-hand this run)                                                                                                                                    |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Redis-backed rate limiter          | `packages/api/src/distributed-rate-limiter.ts` — ioredis client (`:13/:181`), sliding-window ZSET `pipeline.zremrangebyscore` (`:209`) + `pipeline.zadd` (`:214`) |
| 2   | Consistent across instances        | Shared Redis key prefix + `pipeline()` atomic window ops (same file, sliding-window algorithm)                                                                    |
| 3   | Configuration via environment vars | `.env.example:124-133` (`REDIS_URL`, `RATE_LIMIT_READ/WRITE/STRIPE_MAX_REQUESTS` + `*_WINDOW_MS`)                                                                 |
| 4   | Graceful degradation               | In-memory fallback + `logger.warn` at `distributed-rate-limiter.ts:96, 189, 227` (init failure, per-request Redis error, sync path)                               |
| 5   | Unit tests                         | `rate-limiter.test.ts`, `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts` → **98/98 passed (1.09s)** this run                           |
| 6   | Setup/configuration documentation  | `docs/redis-setup.md:5` (**explicitly references Issue #496**)                                                                                                    |

Wiring verified: `trpc.ts:433` (`rateLimit` middleware); `:486`/`:496`/`:505` (`procedure.use(rateLimit(...))` incl. `protectedProcedure` and `adminProcedure`).

**Repair action attempted**: `gh issue close 496 --comment "…"` → **403** `addComment` → FAIL-SAFE (documented here).

### §3.2 Stale-set — spot re-verified first-hand this run

`#613` (2 workflow files only ✓) · `#754` (webhook idempotency tests exist ✓) · `#785`/`#789` (D6 ✓) · `#719` (N4 ✓) · `#720`/`#748` (`.nvmrc` = `22.14.0` ✓) · `#786` (§2.2 ✓) · `#611`/`#666` (N6 ✓) · `#705`/`#706` (N7 ✓) · `#578` (single health route ✓) · plus §3.1's #496 and §2's D1/D3/D4/D7 evidence.

### §3.3 P0/P1 evidence set — first-hand this run

- **P0 set**: exactly one — **#496** (code-complete, §3.1).
- **P1 set (9)**: `#581, #551, #550, #549, #515, #501, #500, #498, #480`.
- **#498** (RBAC): `trpc.ts:349 requireRole()`, `:422 createRoleBasedProcedure()` ◆ → AC complete.
- **#515** (CSRF): `proxy.ts:54 validateCSRF()`, wired at `:243` ◆ → AC complete.
- **#500**: `packages/auth` 3 test files ◆ + `tests/e2e/auth.spec.ts` ◆.
- **#549/#550/#551/#581**: children verified via D7 ◆ → umbrella/canonical handling per §2.
- **#501**: 11 e2e specs ◆ (D3).
- **#480**: duplicate of #496 (D1) → close referencing #496.
- **#786** (payload-assigned `P1`, currently unlabeled): no `slice(-8)` anywhere; webhook route logs exclusively via structured `logger.*` with `:162` suppression comment ◆ → appears addressed; needs human confirmation before close (no guessing; issue write blocked anyway).

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

Contract selection gates on P0/P1 on **current** labels; the only P0 (#496) is code-complete. Remaining open work (e.g. `iterate.yml` pnpm fix D2, blocked at the platform layer; N3 code-splitting genuinely absent; N5 madge not wired into workflows) was **not** re-targeted: deviating from the selection rule without issue-side recording would violate fail-safe (no guessing; issue creation blocked).

---

## §4 Permission Surface (root cause + probes)

| Surface                  | Probe / check (first-hand this run)            | Result                                                                                |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| Issues (label add)       | `gh issue edit 755 --add-label enhancement`    | **403** `Resource not accessible by integration (addLabelsToLabelable)`               |
| Issues (comment)         | `gh issue comment 755 --body "probe (loop50)"` | **403** `Resource not accessible by integration (addComment)` — no content written    |
| Issues (close w/comment) | `gh issue close 496 --body probe (loop50)`     | **403** `Resource not accessible by integration (addComment)` — issue not closed      |
| Issues (create)          | not re-probed this run                         | carried from loop 46: **403 `createIssue`** (first-hand there)                        |
| Workflow files (push)    | not re-probed this run                         | carried from loop 46: **`[remote rejected]` GitHub App lacks `workflows` permission** |
| Non-workflow push + PRs  | loop-49 end-to-end (PR #1610 merged)           | **writable** ✓ (this audit's own PR is the live proof)                                |

**Root cause (re-read first-hand):** this run executes under `on-pull.yml`, whose top-level `permissions:` block (re-read this run) is `contents, pull-requests, actions, repository-projects, id-token` — **no `issues: write`**; the only workflow granting it (`iterate.yml`, `name: parallel`) is **`disabled_manually`** (re-confirmed via `gh workflow list --all` this run). Per `github-workflow-automation` skill semantics: GitHub Actions tokens are denied any permission not explicitly granted at workflow/job level, so all issue-surface GraphQL mutations resolve to `Resource not accessible by integration`. Two zero-code human unblocks (carried):

1.  Re-enable the `parallel` workflow (it carries `issues: write`), or
2.  Apply `docs/patches/on-pull-issues-write-permission.patch` to `.github/workflows/on-pull.yml` via human/admin commit — **the workflow's own token cannot apply it** (GitHub App self-escalation guard, confirmed first-hand in loop 46; patch file re-verified present this run).

---

## §5 Systemic observations (first-hand this run)

1.  **Runner event**: `schedule` (`GITHUB_EVENT_NAME=schedule`) — hourly `pull` workflow runs. This run = #4935 on `main@1ae38e0`.
2.  **Repo health baseline**: full `pnpm vitest run` → **155 files / 2221 tests passed** (43.73s); `pnpm typecheck` → **9/9** (12.7s); `pnpm lint` → **9/9** (45.4s); `pnpm format` → 10/10 (10.2s). Matches loop-49 baseline exactly — no regression.
3.  **`pull_request` run flakiness (carried)**: loop-47's PR #1608 `pull_request` runs failed twice while its `schedule` siblings succeeded; pattern: `pull_request` events flaky, `schedule` events stable. Monitor this PR's checks accordingly.
4.  **Vercel systemic failure (carried)**: every merged PR fails Vercel previews on external namespace `donis-projects-f77cd16a` — non-attributable to diffs; treated as systemic per loop-43+ precedent.
5.  **Delegation layer down 9 loops, now with two distinct missing models**: `explore` → `opencode/muse-spark-1.3-contributor-free` (loops 42–50); `general` → `iflowcn/big-pickle` (first observed this loop). Provider alternatives observed: `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`, `siliconflow-cn`. All audit verification remains first-hand.
6.  **Dependency vulnerability baseline (first-hand refresh)**: `pnpm audit --json` → **52 total: 7 critical / 15 high / 23 moderate / 7 low** — matches carried loop-45/48/49 `52 full` baseline. Security-sensitive, outside STEP 4 scope; open a dedicated dependency-refresh PR once issue writes are unblocked (or directly as PR).
7.  **Phantom prettier cache (delta)**: loop 49's carried action executed this run — `git rm "'node_modules/.cache/.prettiercache'"` succeeded; `.gitignore:4` (`node_modules`) confirmed to cover the regenerated path (`git check-ignore` ✓); `pnpm format` re-ran clean afterwards → removal is durable with no recurrence. **Rationale logged**: the file was a quote-named cache artifact (path quoting bug in the `format` script's `--cache-location` argument) accidentally tracked inside `node_modules`; caches are regenerable and non-source, so removal is safe and non-destructive per contract §2.
8.  **Working tree**: only the cache deletion + this document; `.omo/run-continuation/*.json` session artifacts deliberately **not** committed.

---

## §6 Actions for human reviewer (carry-forward, in priority order)

1.  **Unblock issue writes** (§4): re-enable the `parallel` workflow **or** apply `docs/patches/on-pull-issues-write-permission.patch` to `on-pull.yml` via admin commit. Either permanently unblocks STEP 1–3 (label normalization payload in §1 + dedupe closes in §2).
2.  **Close P0 #496** administratively — all 6 ACs evidenced (§3.1); duplicate `#480` can close simultaneously referencing #496.
3.  **Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch`** via admin commit (workflow-file pushes are platform-blocked for the App) → resolves cluster D2 (305/595/670/584/744).
4.  **Reconcile stale issues** listed in §2/§3.2 as closable: `613, 628, 719, 720, 724, 748, 754, 785, 786, 789` + cluster non-canonicals, using first-hand evidence recorded here.
5.  **Fix the agent model config** (`.opencode`/`opencode.json`): `muse-spark-1.3-contributor-free` **and** `iflowcn/big-pickle` no longer resolve — restore subagent delegation for future loops (9 consecutive failures; both `explore` and `general` now affected).
6.  **Review the vulnerability baseline** (52 total: 7 critical / 15 high, refreshed this run) — open a dedicated dependency-refresh PR.
7.  ~~**Verify phantom prettier-cache state**~~ — **done this loop** (§5.7): removed + verified no recurrence.

---

## §7 Final state

**waiting for human review** — this audit is delivered via PR (the only writable durable surface while issue mutations remain 403), together with the §5.7 phantom-cache removal. Next loop should re-run Phase 0 from scratch; if issue writes are unblocked by then, execute the §1 payload + §2/§3 closes directly.
