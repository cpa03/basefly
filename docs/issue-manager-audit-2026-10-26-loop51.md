# Issue Manager Audit — 2026-10-26 (loop 51)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-26 05:28 – 05:40 UTC                                                                                                                                                                                                                            |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                   |
| DEFAULT_BRANCH        | `main` (auto-detected via `git remote show origin`); synced at `a69654b` = PR #1611 merge (UserAvatar refactor); branched from it directly                                                                                                              |
| Phase 0.1 open PRs    | **0** at entry → PR HANDLER MODE not entered (carried mid-run PR #1611 from loop 50 was **merged 2026-10-26T00:57:30Z** — verified first-hand via `gh pr view 1611`)                                                                                    |
| Phase 0.2 open issues | **82** — issue-set digest `84696e81` (sha256 of comma-joined sorted numbers) = **exact match with loops 33–50** → no drift                                                                                                                              |
| Runner context        | `on-pull.yml` (`name: pull`), event = **`schedule`**, `GITHUB_RUN_NUMBER=4950`, `GITHUB_SHA=a69654b`, `GITHUB_WORKFLOW_REF=cpa03/basefly/.github/workflows/on-pull.yml@refs/heads/main`                                                                 |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                    |
| Final state           | **waiting for human review** — PR carrying this audit; issue-side writes remain 403 (§4)                                                                                                                                                                |
| Skills used           | `openx-basefly` (repo harness/agent conventions) · `github-workflow-automation` (workflow `permissions:` semantics → applied to §4 root cause) — contract-mandated skill reporting fulfilled here                                                       |
| Subagents             | None attempted this run — delegation layer carried as broken from loops 42–50 (`explore` → `muse-spark-1.3-contributor-free`, `general` → `iflowcn/big-pickle`, both `ProviderModelNotFoundError`); verification executed first-hand per carried policy |

### Decision summary (why this phase ran)

1.  **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → no PR HANDLER MODE. Mid-run delta flagged by loop 50 (PR #1611) confirmed **merged** at entry — nothing to handle.
2.  **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run once a phase is activated).
3.  **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33–50** → no drift; carried payload applies verbatim (no-flip-flop rule).
4.  **STEP 1**: label matrix recomputed first-hand (scripted over full label sets) → **33 compliant / 49 remediation** — byte-identical partition to loops 7–50. Application attempt (`gh issue edit 789 --add-label P3`) → **403** `Resource not accessible by integration (addLabelsToLabelable)` (§4).
5.  **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent first-hand file/grep evidence this run (§2). All closes/commentaries require issue write → blocked.
6.  **STEP 4**: only P0 on the board is **#496** → selected per contract (label scan first-hand: `P0,enhancement,security`). Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.13s); **all 6 acceptance criteria evidenced** (§3.1). Repair action = administrative close → `gh issue close 496 --comment …` → **403** `addComment` → FAIL-SAFE.
7.  **Repo health baseline (first-hand this run)**: full `pnpm vitest run` → **156 files / 2224 tests passed** (46.45s); `pnpm typecheck` → **9/9 tasks** (29.97s); `pnpm lint` → **9/9 tasks** (58.6s). Test count up from loop 50's 2221 → **+3 tests from PR #1611** (UserAvatar consolidation) — no regression.
8.  **Vulnerability baseline (first-hand refresh)**: `pnpm audit --json` → **52 total: 7 critical / 15 high / 23 moderate / 7 low** — **exact match** with loop-45/48/49/50 carried baseline → no delta this run (code tree changed only by #1611 UI consolidation).
9.  **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface; probes re-confirmed `addLabelsToLabelable`/`addComment` 403 this run).
10. **Permission-surface delta**: none — writable surface remains `git push (non-workflow files) + PR create/merge`; blocked surface remains `all issue mutations (label/comment/create/close) + workflow-file pushes + workflow-run approval`.
11. **Probe hygiene**: two direct 403 probes this run (label add on #789 — payload-compliant, no residue; close-with-comment on #496 failed before comment was written); no probe branches pushed; workspace branched from current `main`.

### Action log

| Timestamp (UTC) | Action                                     | Target                                       | Result                                                                                                                               |
| --------------- | ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 05:28           | Phase 0.1 entry: `gh pr list --state open` | repo `cpa03/basefly`                         | **0 open PRs** → Phase 0.2                                                                                                           |
| 05:28           | Default-branch detection                   | `git remote show origin`                     | `HEAD branch: main` ✓                                                                                                                |
| 05:28           | Phase 0.2 entry: `gh issue list`           | repo                                         | **82 open issues → ISSUE MANAGER MODE**                                                                                              |
| 05:28           | Loop-50 mid-run delta resolution           | `gh pr view 1611`                            | **MERGED** 2026-10-26T00:57:30Z → nothing left for PR HANDLER MODE                                                                   |
| 05:29           | Skill inventory                            | `.opencode/skills/`                          | 12 skills listed; `openx-basefly` + `github-workflow-automation` loaded (contract §5)                                                |
| 05:29           | Label inventory                            | `gh label list`                              | Contract labels (`bug…security`, `P0–P3`) + specialty labels present ✓                                                               |
| 05:30           | Issue-set digest                           | sorted issue-number sha256                   | 82 numbers, `84696e81…` — **match loops 33–50** → no drift                                                                           |
| 05:30           | STEP 1 label matrix (scripted)             | category/priority partition                  | **33 compliant / 27 missing-pri / 1 missing-cat / 11 missing-both / 13 multi-cat / 0 multi-pri / 49 remediation** — match loops 7–50 |
| 05:30           | Token identity                             | `gh auth status`                             | `github-actions[bot]`; `GITHUB_TOKEN` (`ghs_…`)                                                                                      |
| 05:30           | Issue-label probe                          | `gh issue edit 789 --add-label P3`           | **403** `Resource not accessible by integration (addLabelsToLabelable)`                                                              |
| 05:31           | STEP 2/3 cluster re-verification           | D1–D7, N1–N7 + stale set                     | All carried verdicts re-confirmed first-hand (§2)                                                                                    |
| 05:31           | Workflow inventory                         | `gh workflow list --all`                     | `parallel` = **disabled_manually**; `pull` + Dependabot active                                                                       |
| 05:31           | §4 root-cause re-read                      | `on-pull.yml` `permissions:` block           | contents/pull-requests/actions/repository-projects/id-token — **no `issues: write`** ✓                                               |
| 05:32           | Workspace install                          | `pnpm install --frozen-lockfile`             | **7.6s**                                                                                                                             |
| 05:33           | STEP 4 selection                           | P0 **#496**                                  | only P0 on board (P1 set: 480/498/500/501/515/549/550/551/581) → selected per contract                                               |
| 05:33           | STEP 4 verification: rate-limiter tests    | 3 `*rate-limiter*.test.ts` files             | **98/98 passed** (1.13s) → #496 code-complete                                                                                        |
| 05:33           | Vulnerability baseline                     | `pnpm audit --json`                          | **52 total: 7C/15H/23M/7L** — matches carried loop-45/48/49/50 baseline, no delta                                                    |
| 05:33           | Repo health: full test suite               | `pnpm vitest run`                            | **156 files / 2224 tests passed** (46.45s) — +3 vs loop 50 (PR #1611)                                                                |
| 05:34           | STEP 4 repair attempt                      | `gh issue close 496 --comment "…"`           | **403** `Resource not accessible by integration (addComment)` → FAIL-SAFE (§3.1)                                                     |
| 05:35           | Repo health: typecheck / lint              | `pnpm typecheck` / `pnpm lint`               | **9/9** (29.97s) · **9/9** (58.6s) — all green                                                                                       |
| 05:35           | Branch                                     | `docs/issue-manager-audit-2026-10-26-loop51` | Branched from `a69654b` (= current `main`)                                                                                           |
| 05:40           | Durable capture                            | this document                                | Written to `docs/issue-manager-audit-2026-10-26-loop51.md` → PR → human review                                                       |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — recomputed first-hand this run; structurally identical to loops 7–50 (issue set byte-identical per digest `84696e81`; no-flip-flop rule).

Partition (reconciles to 82 ✓):

- **33 compliant**: `480, 483, 485, 486, 487, 488, 492, 494, 500, 501, 502, 503, 521, 578, 579, 580, 590, 609, 610, 611, 613, 650, 663, 664, 666, 667, 683, 684, 685, 687, 705, 706, 708`
- **27 missing priority only** (script bucket; 3 of these also multi-category → counted once in the 49): `305, 584, 628, 630, 631, 632, 634, 636, 668, 713, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (carries `P3` + non-contract `DX-engineer` label)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not contract `docs`)
- **13 multi-category**: `305(ci,enhancement) · 496(enhancement,security) · 498(enhancement,security) · 515(enhancement,security) · 522(ci,enhancement,refactor) · 523(enhancement,refactor) · 549/550/551/581(enhancement,test) · 584(ci,enhancement) · 688(enhancement,security) · 713(enhancement,test)` — of these, `305, 584, 713` also lack priority (bucket overlap; unique remediation still 49 ✓)
- **0 multi-priority**

**Application attempt (first-hand this run):**

```
gh issue edit 789 --add-label P3   → GraphQL 403 (addLabelsToLabelable)
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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–50.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (re-verified first-hand this run where noted ◆)

| ID  | Members                 | Canonical | Disposition (evidence marked ◆ = first-hand this run)                                                                                                                                                                                                                                 |
| --- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | ◆ Rate-limiter tests **98/98 green** + all 6 ACs of #496 evidenced (§3.1) → close 480 (write blocked)                                                                                                                                                                                 |
| D2  | 305, 595, 670, 584, 744 | **670**   | ◆ `iterate.yml` `npm ci \|\| true` at **lines 72 and 342** + `~/.npm` cache path (**:58**) + `hashFiles('**/package-lock.json')` cache key (**:59**) still present; workflow-file push platform-blocked (§4) → remedy `docs/patches/fix-pnpm-consistency-iterate-744.patch` ✓ present |
| D3  | 628, 501, 724           | **501**   | ◆ **11 e2e specs + fixtures.ts** in `tests/e2e/` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) ✓ → 628/724 stale                                                                    |
| D4  | 631, 725, 754           | **725**   | ◆ Router tests incl. `k8s-router.test.ts` (**458 lines**) ✓; **`packages/stripe/src/webhook-idempotency.test.ts` present (13,306 B) → #754 stale** → close 631/754                                                                                                                    |
| D5  | 720, 748                | **748**   | ◆ `.nvmrc` = `22.14.0` ✓ + `package.json` `engines.node >=22` ✓ (neither "missing" nor "invalid '20'") → both stale/closable                                                                                                                                                          |
| D6  | 785, 789                | —         | ◆ **Not duplicates**; both stale: stripe `dependencies` = `@saasfly/common,@saasfly/db,@t3-oss/env-nextjs,stripe,zod` (no `next`) ✓; ui `peerDependencies: {next >=14, react ^19, react-dom ^19}` ✓, no react in deps ✓                                                               |
| D7  | 551, 550, 549, 581      | **581**   | ◆ Umbrella children verified: k8s router tests 458 lines ✓ · `packages/auth` **3 test files** (`clerk.test.ts`, `env.test.ts`, `logger.test.ts`) ✓ · `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}` ✓ (→ #550 stale)                                                  |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop 51)                                                                                                                                                                                                               |
| --- | ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| N1  | 551, 631           | **#551**  | ◆ Confirmed — `k8s-router.test.ts` 458 lines present                                                                                                                                                                           |
| N2  | 523, 667           | **#523**  | ◆ Barrel `index.ts` present in `packages/{api,common,ui}/src` — export-boundary audit itself still open (not stale)                                                                                                            |
| N3  | 751, 753, 723      | **#751**  | ◆ **Partially addressed but still open** — `next/dynamic` imports now exist (`cluster-list.tsx`, marketing `page.tsx`, editor cluster page) but no bundle analyzer / no route-level code-splitting config in `next.config.mjs` |
| N4  | 683, 684, 634, 719 | **#684**  | ◆ `719` stale — root `tsconfig.json` present ✓; rest carried                                                                                                                                                                   |
| N5  | 726, 488           | **#488**  | ◆ `check:circular` madge script exists (`package.json:29`, wired into `ci:check` at `:7`) but **not invoked by any workflow** — partially addressed, keep open                                                                 |
| N6  | 611, 666           | **#666**  | ◆ Stale — `apps/nextjs/src/app/error.tsx` **and** `not-found.tsx` present ✓                                                                                                                                                    |
| N7  | 705, 706           | **#705**  | ◆ Stale — root `Dockerfile` + `.devcontainer/devcontainer.json` present ✓                                                                                                                                                      |

**Additional first-hand stale checks (loop 51):** `#613` — `.github/workflows/` contains only `iterate.yml` + `on-pull.yml` (2 files); no duplicate workflow file ✓ · `#786` — `slice(-8)` appears **nowhere** in `apps/`+`packages/`; current route `api/webhooks/stripe/route.ts` logs exclusively via structured `logger.*` with an explicit comment at `:162` documenting suppression of information that could aid brute-force attacks on the webhook secret ✓ · `#578` — single health endpoint `apps/nextjs/src/app/api/health/route.ts` ✓ · `#663` — **10** non-test `eslint-disable` comments remain (audit/consolidation still open; was 8 in loop 50 → +2 from #1611) · `#664` — **4** non-test `console.*` matches in `packages/{db,stripe}` remain, all inside JSDoc comment examples (actual live `console.*` calls ≈ 0 — replacement still open for doc-comment cleanup) · `#500` — `packages/auth` 3 test files ✓ + `tests/e2e/auth.spec.ts` ✓.

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection — P0 #496 (first-hand AC verification this run)

Selected per contract (only P0 on board; label scan: `P0,enhancement,security`). **All 6 acceptance criteria satisfied on `main`** — repair would be duplicate/speculative work (contract forbids); remaining action is administrative close → probe → **403** (§4):

| #   | Acceptance Criterion               | Evidence (first-hand this run)                                                                                                                               |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Redis-backed rate limiter          | `packages/api/src/distributed-rate-limiter.ts` — ioredis import (`:14`), sliding-window ZSET `pipeline.zremrangebyscore` (`:209`) + `pipeline.zadd` (`:214`) |
| 2   | Consistent across instances        | Shared Redis key prefix + `pipeline()` atomic window ops (same file, sliding-window algorithm)                                                               |
| 3   | Configuration via environment vars | `.env.example:124-133` (`REDIS_URL`, `RATE_LIMIT_READ/WRITE/STRIPE_MAX_REQUESTS` + `*_WINDOW_MS`)                                                            |
| 4   | Graceful degradation               | In-memory fallback + `logger.warn` at `distributed-rate-limiter.ts:96, 189, 227` (init failure, per-request Redis error, sync path)                          |
| 5   | Unit tests                         | `rate-limiter.test.ts`, `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts` → **98/98 passed (1.13s)** this run                      |
| 6   | Setup/configuration documentation  | `docs/redis-setup.md:5` (**explicitly references Issue #496**)                                                                                               |

Wiring verified: `trpc.ts:433` (`rateLimit` middleware); `:486`/`:496`/`:505` (`procedure.use(rateLimit(...))` incl. `protectedProcedure` and `adminProcedure`).

**Repair action attempted**: `gh issue close 496 --comment "…administrative close…"` → **403** `addComment` → FAIL-SAFE (documented here).

### §3.2 Stale-set — spot re-verified first-hand this run

`#613` (2 workflow files only ✓) · `#754` (webhook idempotency tests exist ✓) · `#785`/`#789` (D6 ✓) · `#719` (N4 ✓) · `#720`/`#748` (`.nvmrc` = `22.14.0` ✓) · `#786` (§2.2 ✓) · `#611`/`#666` (N6 ✓) · `#705`/`#706` (N7 ✓) · `#578` (single health route ✓) · `#550` (coverage includes apps/nextjs ✓) · `#549` (auth tests ✓) · `#501`/`#628`/`#724` (11 e2e specs ✓) · plus §3.1's #496 and §2's D1/D4/D7 evidence.

### §3.3 P0/P1 evidence set — first-hand this run

- **P0 set**: exactly one — **#496** (code-complete, §3.1).
- **P1 set (9)**: `#581, #551, #550, #549, #515, #501, #500, #498, #480`.
- **#498** (RBAC): carried — `trpc.ts` `requireRole()` / `createRoleBasedProcedure()` present (loop 50 ◆; wiring re-grepped this run ✓).
- **#515** (CSRF): carried — `proxy.ts` `validateCSRF()` present (loop 50 ◆).
- **#500**: `packages/auth` 3 test files ◆ + `tests/e2e/auth.spec.ts` ◆.
- **#549/#550/#551/#581**: children verified via D7 ◆ → umbrella/canonical handling per §2.
- **#501**: 11 e2e specs ◆ (D3).
- **#480**: duplicate of #496 (D1) → close referencing #496.
- **#786** (payload-assigned `P1`, currently unlabeled): no `slice(-8)` anywhere; webhook route logs exclusively via structured `logger.*` with `:162` suppression comment ◆ → appears addressed; needs human confirmation before close (no guessing; issue write blocked anyway).

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

Contract selection gates on P0/P1 on **current** labels; the only P0 (#496) is code-complete. Remaining open work (e.g. `iterate.yml` pnpm fix D2, blocked at the platform layer; N3 route-level code-splitting still absent despite some `next/dynamic` usage; N5 madge not wired into workflows) was **not** re-targeted: deviating from the selection rule without issue-side recording would violate fail-safe (no guessing; issue creation blocked).

---

## §4 Permission Surface (root cause + probes)

| Surface                  | Probe / check (first-hand this run)   | Result                                                                                |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------- |
| Issues (label add)       | `gh issue edit 789 --add-label P3`    | **403** `Resource not accessible by integration (addLabelsToLabelable)`               |
| Issues (close w/comment) | `gh issue close 496 --comment "…"`    | **403** `Resource not accessible by integration (addComment)` — issue not closed      |
| Issues (comment)         | not re-probed (same surface as close) | carried: **403 `addComment`** (loop 50 first-hand)                                    |
| Issues (create)          | not re-probed this run                | carried from loop 46: **403 `createIssue`** (first-hand there)                        |
| Workflow files (push)    | not re-probed this run                | carried from loop 46: **`[remote rejected]` GitHub App lacks `workflows` permission** |
| Workflow-run approval    | not re-probed this run                | carried from loop 50: **403** (token `actions: read` only)                            |
| Non-workflow push + PRs  | this audit's own PR (live proof)      | **writable** ✓                                                                        |

**Root cause (re-read first-hand):** this run executes under `on-pull.yml`, whose top-level `permissions:` block (re-read this run, `:9-14`) is `contents, pull-requests, actions, repository-projects, id-token` — **no `issues: write`**; the only workflow granting it (`iterate.yml`, `name: parallel`) is **`disabled_manually`** (re-confirmed via `gh workflow list --all` this run). Per `github-workflow-automation` skill semantics: GitHub Actions tokens are denied any permission not explicitly granted at workflow/job level, so all issue-surface GraphQL mutations resolve to `Resource not accessible by integration`. Two zero-code human unblocks (carried):

1.  Re-enable the `parallel` workflow (it carries `issues: write`), or
2.  Apply `docs/patches/on-pull-issues-write-permission.patch` to `.github/workflows/on-pull.yml` via human/admin commit — **the workflow's own token cannot apply it** (GitHub App self-escalation guard, confirmed first-hand in loop 46; patch file re-verified present this run).

---

## §5 Systemic observations (first-hand this run)

1.  **Runner event**: `schedule` — hourly `pull` workflow runs. This run = #4950 on `main@a69654b`.
2.  **Repo health baseline**: full `pnpm vitest run` → **156 files / 2224 tests passed** (46.45s); `pnpm typecheck` → **9/9** (29.97s); `pnpm lint` → **9/9** (58.6s). **+3 tests vs loop 50** (2221 → 2224) — attributable to merged PR #1611 (UserAvatar consolidation); no regression.
3.  **Vulnerability baseline**: `pnpm audit --json` → **52 total: 7 critical / 15 high / 23 moderate / 7 low** — **exact match** with loop-45/48/49/50 baseline → **no delta this run** (first no-delta loop since loop 42's third-consecutive delta finding; #1611 added no new dependencies).
4.  **Delegation layer down 10 consecutive loops (42–51)**: `explore` → `opencode/muse-spark-1.3-contributor-free`; `general` → `iflowcn/big-pickle` — both `ProviderModelNotFoundError`. No subagent attempted this run (carried broken-state policy). All verification first-hand.
5.  **Engine warning**: local runner executes Node v20.20.2 while `engines` requires `>=22` (`WARN Unsupported engine` observed during vitest) — tests still green; CI runner drift worth noting for humans (does not affect this audit's verdicts).
6.  **Concurrent agent activity**: loop-50's flagged PR #1611 (`agent-12382078969161290272`) **merged at 00:57:30Z** — resolved before this loop's entry; no PR HANDLER MODE triggered. Watch for further concurrent-agent PRs at next loop's Phase 0.1.
7.  **Working tree**: only this document; `.omo/run-continuation/*.json` session artifacts deliberately **not** committed.
8.  **Permission-surface delta**: none vs loop 50 — writable surface `git push (non-workflow) + PR create/merge`; blocked surface `issue mutations + workflow-file pushes + run approval`.

---

## §6 Actions for human reviewer (carry-forward, in priority order)

1.  **Unblock issue writes** (§4): re-enable the `parallel` workflow **or** apply `docs/patches/on-pull-issues-write-permission.patch` to `on-pull.yml` via admin commit. Either permanently unblocks STEP 1–3 (label normalization payload in §1 + dedupe closes in §2).
2.  **Close P0 #496** administratively — all 6 ACs evidenced (§3.1); duplicate `#480` can close simultaneously referencing #496.
3.  **Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch`** via admin commit (workflow-file pushes are platform-blocked for the App) → resolves cluster D2 (305/595/670/584/744).
4.  **Reconcile stale issues** listed in §2/§3.2 as closable: `549, 550, 613, 628, 719, 720, 724, 748, 754, 785, 786, 789` + cluster non-canonicals, using first-hand evidence recorded here.
5.  **Fix the agent model config** (`.opencode`/`opencode.json`): `muse-spark-1.3-contributor-free` **and** `iflowcn/big-pickle` no longer resolve — restore subagent delegation for future loops (10 consecutive failures; both `explore` and `general` affected).
6.  **Review the vulnerability baseline** (52 total: 7 critical / 15 high — stable this run) — open a dedicated dependency-refresh PR.
7.  **Node engine drift**: CI runner uses Node v20 while `engines` demands `>=22` — align runner image or relax engines to silence install-time warnings.

---

## §7 Final state

**waiting for human review** — this audit is delivered via PR (the only writable durable surface while issue mutations remain 403). Next loop should re-run Phase 0 from scratch; if issue writes are unblocked by then, execute the §1 payload + §2/§3 closes directly.
