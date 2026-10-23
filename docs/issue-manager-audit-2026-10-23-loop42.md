# Issue Manager Audit — 2026-10-23 (loop 42)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-23 13:00 – 13:15 UTC                                                                                                                                                                                                                                                                                     |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                                                                            |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `659d75e` = PR #1601 merge; `git fetch` confirmed 0 commits behind at audit close)                                                                                                                                                                                              |
| Phase 0.1 open PRs    | **0** (re-checked at run end: still 0) → PR HANDLER MODE not entered                                                                                                                                                                                                                                             |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (same set as loops 7–41 — no drift)                                                                                                                                                                                                                                              |
| Runner context        | `on-pull.yml` (`name: pull`), job `ci`, **event = `schedule`** (`cron 0 * * * *`), `GITHUB_WORKFLOW_REF=cpa03/basefly/.github/workflows/on-pull.yml@refs/heads/main`                                                                                                                                             |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                                                                             |
| Final state           | **waiting for human review** — PR carrying this audit; issue-side writes remain 403 (§4)                                                                                                                                                                                                                         |
| Skills used           | `openx-basefly` (repo harness/agent conventions) · `github-workflow-automation` (GITHUB_TOKEN permission model; standard templates omit `issues: write`, matching on-pull.yml)                                                                                                                                   |
| Subagents             | 1 attempted, **1 failed**: `explore` bg task (`Find rate limiter implementation`) errored `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free` — model retired from provider. All verification executed first-hand instead (same policy as loop 41: evidence checks require first-hand output) |

### Decision summary (why this phase ran)

1.  **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → no PR HANDLER MODE.
2.  **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run when a phase is activated).
3.  **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33–41** → no drift; carried payload applies verbatim (no-flip-flop rule).
4.  **STEP 1**: label matrix independently re-derived (scripted over full label sets, §1) → **33 compliant / 49 remediation** — structural match with loops 7–41. Application attempts (probe `gh issue edit 789 --add-label P3`, `gh issue comment 789`, `gh issue close 496`) → **403** `Resource not accessible by integration` (§4).
5.  **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent first-hand file/grep inspection this run (§2). Closes/comments require issue write → **403 → blocked**.
6.  **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.22s, vitest 4.1.11). Repair action = administrative close → `gh issue close 496` → **403** → FAIL-SAFE (documented here).
7.  **STEP 4 contingency (#670)**: `iterate.yml` `npm ci || true` re-confirmed first-hand (lines 72, 342) — genuine defect; workflow-file push remains platform-blocked (§4). Canonical remedy remains `docs/patches/fix-pnpm-consistency-iterate-744.patch`.
8.  **ROOT CAUSE IDENTIFIED (loop-42 NEW, §5.1)**: the frozen label matrix is explained by workflow availability — the **only** workflow granting `issues: write` (`parallel` = `iterate.yml`) is **`disabled_manually`** with its last run on **2026-02-27** (8 months dormant), while the active hourly `pull` workflow lacks `issues: write`. Unblocking STEP 1–3 does **not** require a workflow-file edit: re-enabling `parallel` (UI action, zero code) restores issue-write capability for its stage-1 issue-audit prompt.
9.  **Vulnerability baseline DELTA (third consecutive)**: `pnpm audit --prod` → **31** vulnerabilities (was 26 in loop 41, 20 in loop 40); `pnpm audit` → **45** (was 38, 32). Prod criticals rose 2 → **5**. Tree is code-identical since loop 38 (markdown-only merges) → delta = **new advisories published against the same locked dependency versions** (§5.2). Security-sensitive → human review; STEP 4 binds to #496, contract forbids unrelated dependency bumps.
10. **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface).
11. **Probe hygiene**: no probe branches created this run (permissions already characterized first-hand via three direct 403 probes); workspace left clean on `main`.

### Action log

| Timestamp (UTC) | Action                                     | Target                             | Result                                                                                                    |
| --------------- | ------------------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 13:00           | Phase 0.1 entry: `gh pr list --state open` | repo `cpa03/basefly`               | **0 open PRs** → Phase 0.2                                                                                |
| 13:00           | Phase 0.2 entry: `gh issue list`           | repo                               | **82 open issues → ISSUE MANAGER MODE**                                                                   |
| 13:01           | Runner introspection                       | `env \| grep ^GITHUB_`             | workflow `pull` (on-pull.yml), job `ci`, event `schedule` → explains token permission set                 |
| 13:01           | Issue-set digest                           | sorted issue-number sha256         | 82 numbers, `84696e81…` — **match loops 33–41** → no drift                                                |
| 13:01           | STEP 1 label matrix (scripted)             | category/priority partition        | **33 compliant / 12 missing-cat / 27 missing-pri / 13 multi-cat** — match loops 7–41                      |
| 13:01           | Token identity                             | `gh auth status`                   | `github-actions[bot]`; `GITHUB_TOKEN` (`ghs_…`)                                                           |
| 13:01           | Issue-label probe                          | `gh issue edit 789 --add-label P3` | **403** `Resource not accessible by integration (addLabelsToLabelable)`                                   |
| 13:01           | Issue-comment probe                        | `gh issue comment 789 --body …`    | **403** `Resource not accessible by integration (addComment)`                                             |
| 13:04           | STEP 2/3 cluster re-verification           | D1–D7, N1–N7 + stale set           | All carried verdicts re-confirmed first-hand (§2, §3.2)                                                   |
| 13:06           | Workflow inventory                         | `gh workflow list --all`           | `parallel` = **disabled_manually**; `pull` + Dependabot active                                            |
| 13:07           | `parallel` run history                     | `gh workflow view iterate.yml`     | 264 total runs; last run `22502836710` **2026-02-27T20:35Z failure** (Architect stage) → dormant 8 months |
| 13:07           | STEP 4 selection                           | P0 **#496**                        | only P0 on board → selected per contract                                                                  |
| 13:06           | Workspace install                          | `pnpm install --frozen-lockfile`   | **7.7s**                                                                                                  |
| 13:08           | STEP 4 verification: rate-limiter tests    | 3 `*rate-limiter*.test.ts` files   | **98/98 passed** (1.22s) → #496 code-complete                                                             |
| 13:09           | STEP 4 repair attempt                      | `gh issue close 496`               | **403** `Resource not accessible by integration (addComment)` → FAIL-SAFE (§0.6, §4)                      |
| 13:09           | Vulnerability baseline                     | `pnpm audit --prod` / `pnpm audit` | **31 prod** (was 26) / **45 full** (was 38) — **3rd consecutive DELTA** (§5.2)                            |
| 13:10           | Sync check                                 | `git fetch origin main`            | 0 commits behind `659d75e` → branch from current main                                                     |
| 13:10           | Final PR re-check                          | `gh pr list`                       | 0 open PRs (no drift introduced during run)                                                               |
| 13:15           | Durable capture                            | this audit file → PR               | PR on `docs/issue-manager-audit-2026-10-23-loop42`                                                        |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — exact structural match with loops 7–41 → no-flip-flop rule applies.

Independently re-derived partition this run (scripted over all 82 issues; identical to carried):

- **33 compliant**: `480, 483, 485, 486, 487, 488, 492, 494, 500, 501, 502, 503, 521, 578, 579, 580, 590, 609, 610, 611, 613, 650, 663, 664, 666, 667, 683, 684, 685, 687, 705, 706, 708`
- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (already carries `P3` + non-contract `DX-engineer`)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- **13 multi-category**: `305(ci,enhancement) · 496(enhancement,security) · 498(enhancement,security) · 515(enhancement,security) · 522(ci,enhancement,refactor) · 523(enhancement,refactor) · 549/550/551/581(enhancement,test) · 584(ci,enhancement) · 688(enhancement,security) · 713(enhancement,test)`
- **0 multi-priority**

**Union checks:** missing-priority = 24 ∪ {305, 584, 713} = **27** ✓ · missing-category = {670} ∪ 11 = **12** ✓ · multi-category = 13 ✓ · 33 + 27 + 12 + 13 − overlaps(13 includes the 3 missing-pri ones) = 82 ✓.

**Application attempts (first-hand this run):**

```
gh issue edit 789 --add-label "P3"
   → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
gh issue comment 789 --body "loop-42 permission probe"
   → GraphQL 403: Resource not accessible by integration (addComment)
gh issue close 496 --comment "test"
   → GraphQL 403: Resource not accessible by integration (addComment)
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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–41.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (re-verified first-hand this run)

| ID  | Members                 | Canonical | Disposition (first-hand evidence this run)                                                                                                                                                                                                                            |
| --- | ----------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | Re-verified: `packages/api/src/distributed-rate-limiter.ts` present + **98/98 tests green this run** → close 480 (write blocked)                                                                                                                                      |
| D2  | 305, 595, 670, 584, 744 | **670**   | `iterate.yml` `npm ci \|\| true` re-confirmed (lines 72, 342); workflow file only → close 305/595/584/744                                                                                                                                                             |
| D3  | 628, 501, 724           | **501**   | E2E specs present: **11 spec files** in `tests/e2e/` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) → close 628/724                                                  |
| D4  | 631, 725, 754           | **725**   | **12 router test files** incl. `k8s-router`, `customer-router`, `stripe-router`, `integration` → close 631/754                                                                                                                                                        |
| D5  | 720, 748                | **748**   | `.nvmrc` = `22.14.0` re-verified ✓ (neither "missing" nor "invalid '20'"); fix commit `de2d52b` references Issue #748 → both stale/closable                                                                                                                           |
| D6  | 785, 789                | —         | **Not duplicates**; 785 stale (`next` absent from `packages/stripe/package.json` dependencies ✓ — deps are `@saasfly/common, @saasfly/db, @t3-oss/env-nextjs, stripe, zod`); 789 stale (`peerDependencies: { next: >=14.0.0, react: ^19.0.0, react-dom: ^19.0.0 }` ✓) |
| D7  | 551, 550, 549, 581      | **581**   | Umbrella; children re-verified: k8s router tests ✓, `packages/auth` **3 test files** ✓ (`logger.test.ts`, `env.test.ts`, `clerk.test.ts` — package root, not `src/`), `vitest.config.ts:16` includes `apps/nextjs/src/**` ✓                                           |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop-42, first-hand spot checks)                                                           |
| --- | ------------------ | --------- | -------------------------------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | Confirmed — k8s router tests exist (`k8s-router.test.ts`, `k8s.test.ts`)                           |
| N2  | 523, 667           | **#523**  | Confirmed — barrel export audit / tree-shaking family                                              |
| N3  | 751, 753, 723      | **#751**  | Confirmed — code splitting / bundle-size family                                                    |
| N4  | 683, 684, 634, 719 | **#684**  | Confirmed — DX tooling/config family                                                               |
| N5  | 726, 488           | **#488**  | Confirmed — dependency check in CI family                                                          |
| N6  | 611, 666           | **#666**  | Confirmed — both stale (`not-found.tsx` + `error.tsx` + `global-error.tsx` all exist ✓)            |
| N7  | 705, 706           | **#705**  | Confirmed — both stale (`Dockerfile` + `docker-compose.yml` + `.devcontainer/devcontainer.json` ✓) |

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection — P0 #496 (first-hand verification this run)

- P0 exists → contract selects highest-priority → **#496** (only P0 on the board).
- Re-verified **code-complete first-hand this run**: `vitest run` on 3 rate-limiter test files → **3 files, 98/98 passed** (1.22s, vitest 4.1.11).
- **Acceptance criteria matrix (first-hand artifact check):**

| AC                                      | Verdict | Evidence (loop-42)                                                                          |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| Redis-backed rate limiter implemented   | ✓       | `packages/api/src/distributed-rate-limiter.ts` (sliding window; exported via `index.ts:29`) |
| Consistent limits across instances      | ✓       | `SyncRateLimiter` sync tests green (`distributed-rate-limiter-sync.test.ts` part of 98)     |
| Configuration via environment variables | ✓       | `RATE_LIMIT_*` resolver in `packages/common/src/config/resilience.ts` (+ tests green)       |
| Graceful degradation when Redis down    | ✓       | in-memory fallback path exercised by `rate-limiter.test.ts` (legacy suite, 98 total)        |
| Unit tests for rate limiter             | ✓       | **98/98 green this run** (3 files, 1.22s)                                                   |
| Documentation for setup/configuration   | ✓       | `docs/redis-setup.md` present ✓ (grep hit)                                                  |

- **Repair action = administrative close → `gh issue close 496` → 403 → FAIL-SAFE** (documented here; §4).
- No code change is required or permitted for the selected issue, therefore **no commit/PR linked to #496 was produced**.

### §3.1b Contingency repair — #670 (highest genuinely-open defect) — CARRIED, platform-blocked

`iterate.yml` lines 72 and 342 still carry `npm ci || true` (re-confirmed first-hand this run: `.github/workflows/iterate.yml:72,342`). The fix requires editing a workflow file, which the GitHub App token cannot push (§4: App lacks `workflows` permission; prior attempt `caab1f5` had to "restore workflow files to remote state"). Canonical human-applicable remedy remains **`docs/patches/fix-pnpm-consistency-iterate-744.patch`**.

### §3.2 Stale-set — spot re-verified first-hand this run

| Issue          | Claim                                 | Verdict (loop-42, first-hand)                                                                                                 |
| -------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter        | **Re-verified: 98/98 tests green this run + AC matrix (§3.1)**                                                                |
| #786           | Stripe webhook partial-secret logging | Stale — `webhooks/stripe/route.ts` uses non-secret identifier (line 54) + explicit no-secret-logging comments (lines 153–162) |
| #720/#748      | `.nvmrc` missing / invalid            | Stale — `.nvmrc` = `22.14.0` ✓; `engines.node >=22` ✓                                                                         |
| #515           | CSRF protection                       | Stale — `apps/nextjs/src/lib/csrf.ts` ✓                                                                                       |
| #721/#498      | Authz beyond auth / RBAC              | Stale — `adminProcedure` (`trpc.ts:331`), DB `User.role` checks (`trpc.ts:268,368`), `authorization.ts` + `rbac.test.ts` ✓    |
| #789           | React peerDependencies in ui          | Stale — `peerDependencies: { react: ^19.0.0, react-dom: ^19.0.0, next: >=14.0.0 }` ✓                                          |
| #785           | Duplicate `next` in stripe pkg        | Stale — `next` absent from `packages/stripe/package.json` ✓                                                                   |
| #549/#550/#551 | Testing gaps                          | Stale — `packages/auth` 3 test files ✓, router tests ✓, `vitest.config.ts` covers `apps/nextjs/src/**` ✓                      |
| #631/#725      | API router tests                      | Stale — `k8s-router` / `customer-router` / `stripe-router` / `integration` tests ✓                                            |
| #501/#628/#724 | E2E testing                           | Stale — 11 Playwright specs incl. critical flows ✓                                                                            |
| #611/#666      | Error boundary / 404 pages            | Stale — `not-found.tsx` + `error.tsx` + `global-error.tsx` all exist ✓                                                        |
| #705/#706      | Docker / devcontainer                 | Stale — `Dockerfile` + `docker-compose.yml` + `.devcontainer/` ✓                                                              |
| #713           | packages/common unit tests            | Stale — **28** test files under `packages/common/src/` ✓                                                                      |

Closing any of these requires issue write → **403 → blocked (§4).**

### §3.3 P0/P1 evidence set — re-verified first-hand

| Issue | Claim                               | First-hand evidence (loop-42)                             |
| ----- | ----------------------------------- | --------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 RL tests green this run** + AC matrix ✓           |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification |
| #581  | Testing-infra umbrella (P1)         | Children verified present ✓                               |
| #515  | CSRF protection (P1)                | `csrf.ts` ✓                                               |
| #498  | Role-based admin RBAC (P1)          | `adminProcedure` / role checks in `trpc.ts` ✓             |
| #786  | Webhook secret logging (P1)         | Non-secret identifier + no-secret-logging comments ✓      |

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

Carried unchanged from loop 41 §3.4: #670+D2 (workflow-file push blocked) · #687 · #663 · #609/#610 · #494 (large refactor — forbidden) · #723 · #650/#502 (workflow-file blocked) · #751/#708 · #630 · feature-grade items (#749, #668, #727, …).

### §3.5 Dependency vulnerability baseline — THIRD CONSECUTIVE DELTA

```
pnpm audit --prod  → 31 vulnerabilities: 5 critical | 7 high | 15 moderate | 4 low   (loop 41: 26 — DELTA +5; loop 40: 20)
pnpm audit         → 45 vulnerabilities: 7 critical | 12 high | 21 moderate | 5 low  (loop 41: 38 — DELTA +7; loop 40: 32)
```

Tree is code-identical since loop 38 (only markdown audits merged since) → the delta is **new advisories published against the same locked dependency versions**, not dependency drift. This is the **third consecutive run** with a worsening baseline against a frozen lockfile (loop 40: +2/+6; loop 41: +6/+6; this run: +5/+7). Prod **criticals rose 2 → 5**. Not fixed in-loop: STEP 4 binds this run to **#496**; dependency bumps link to no open issue and the contract forbids _unrelated improvements_. Security-sensitive → human review.

---

## §4 Blocked Write Paths (re-confirmed first-hand this run)

| Surface                   | Operation                            | Result                                                                                                     |
| ------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Issues (label, add)       | `gh issue edit 789 --add-label P3`   | **403** `Resource not accessible by integration` (addLabelsToLabelable)                                    |
| Issues (comment)          | `gh issue comment 789 --body probe`  | **403** `Resource not accessible by integration` (addComment)                                              |
| Issues (close)            | `gh issue close 496 --comment test`  | **403** `Resource not accessible by integration` (addComment) — first-hand on STEP 4 target                |
| Workflow files (push)     | loop-38 real-fix push (carried)      | **`[remote rejected]`** GitHub App lacks `workflows` permission (commit `caab1f5` restored workflow files) |
| PRs (git push) — CONTRAST | branch push from `main` (this audit) | **SUCCESS** (pre-commit gate green: typecheck + full suite + check-deps)                                   |

**Root cause (first-hand, loop-42):** this run executes under **`on-pull.yml`** (`name: pull`, hourly `schedule`), whose top-level `permissions:` block is `contents: write, pull-requests: write, actions: read, repository-projects: write, id-token: write` — **no `issues: write`** (direct file read this run, lines 9–15).

**Why past loops could not fix it either (loop-42 root-cause refinement, §5.1):** the workflow that _does_ grant `issues: write` (`iterate.yml`, `name: parallel`, lines 11–16: `contents/issues/pull-requests/actions/id-token: write`) is **`disabled_manually`** and has not run since **2026-02-27**. The App token also cannot push workflow-file edits (`workflows` scope absent), so `on-pull.yml` cannot self-grant the permission. Two viable human unblocks — neither requires writing workflow files with the App token:

1. **Re-enable the `parallel` workflow** (Actions UI → `parallel` → Enable). Its stage-1 prompt already contains the issue-audit mandate ("Ensure labels match the correct layer and priority. Remove duplicate issues or merge overlapping scopes") and its token has `issues: write`. Investigate the 2026-02-27 Architect-stage failure first (§5.4).
2. **Add `issues: write` to `on-pull.yml`** (human-authored commit or admin token), so hourly issue-manager loops can execute STEP 1–3 directly.

---

## §5 LOOP-42 New Findings

### §5.1 Root cause of the frozen label matrix: the only issues:write workflow is disabled (NEW)

Loop 41 documented _that_ issue writes 403 and proposed granting `issues: write` to `on-pull.yml`. Loop 42 identifies _why_ the board has been frozen for 40+ loops despite an existing correctly-permissioned workflow:

- `gh workflow list --all` → `parallel` (iterate.yml) = **`disabled_manually`**, `pull` (on-pull.yml) = active, Dependabot = active.
- `gh workflow view iterate.yml` → 264 total runs, **last run `22502836710` at 2026-02-27T20:35:19Z (failure)** — dormant for ~8 months despite `cron: 0 */4 * * *`.
- The label matrix (33/49) has been frozen since issue creation dates (issues #744–#789 all created 2026-02-27) — exactly when `parallel` stopped running.
- `parallel`'s stage-1 prompt (`iterate.yml:82`) is a genuine issue-manager: "Audit all existing issues… Ensure labels match the correct layer and priority. Remove duplicate issues or merge overlapping scopes."

**Implication:** the cheapest full unblock is a **UI re-enable of `parallel`** (zero code, zero workflow-file push), not a permission edit to `on-pull.yml`.

### §5.2 Vulnerability baseline worsened a third time without code change (NEW)

Prod 20 → 26 → **31** and full 32 → 38 → **45** across loops 40 → 41 → 42 while the dependency tree is byte-identical since loop 38. Prod criticals: 2 → **5**. New advisories continue to land intra-day against locked versions (e.g., `dompurify` via `posthog-js`, GHSA-c6gr-qvv4-5v3f, patched ≥3.4.17, surfaced in this run's output). The baseline now requires **same-day human attention**; a dedicated dependency-refresh issue/PR is recommended (outside STEP 4 scope per contract).

### §5.3 All carried verdicts re-confirmed; one location nuance (NEW confirmation)

Every stale-set claim, cluster disposition, and #496 AC was independently re-derived first-hand this run (file existence, grep, test execution, dependency JSON inspection). No carried verdict was accepted without fresh evidence. Issue-set digest `84696e81` identical to loops 33–41 → the remediation payload and cluster map remain valid without modification. Location nuance: `packages/auth` tests live at package **root** (`packages/auth/*.test.ts`), not `src/` — verification commands should not assume `src/`.

### §5.4 `parallel` was disabled immediately after its Architect stage failed (NEW context)

Last run `22502836710` failed specifically at job **"Architect: Strategy & Triage"** (8m29s). The disable event itself is a UI action (no commit in `.github/workflows/iterate.yml` history around that date). Re-enabling should first triage that failure, otherwise the workflow may fail-loop every 4 hours.

### §5.5 Explore subagent model retired (NEW harness observation)

`subagent_type="explore"` (model `opencode/muse-spark-1.3-contributor-free` per AGENTS.md) fails with `ProviderModelNotFoundError`. Agent-to-model mappings in `.opencode/` / `AGENTS.md` are stale relative to the provider's current free-model roster (error suggested `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`). Future loops should refresh model IDs before delegating, or evidence checks will keep falling back to first-hand execution.

---

## §6 Human Action Checklist (updated for loop 42)

1.  **Re-enable the `parallel` workflow** (Actions UI) after triaging the 2026-02-27 Architect failure — restores `issues: write` capability immediately (§5.1/§5.4); **or** add `issues: write` to `on-pull.yml` via an admin/human commit — unblocks STEP 1–3 for hourly loops. Either action permanently unblocks label normalization, dedupe closes, and future loops.
2.  **Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch`** to `.github/workflows/iterate.yml` (D2/#670) — workflow-file pushes are platform-blocked for the App.
3.  **Close the stale-set** in §3.2 / clusters D1–D5, D7, N1–N7 with references per §2 dispositions (administrative action; bodies already preserved in-cluster) — or let the re-enabled `parallel` stage-1 prompt execute the §1 payload.
4.  **Review the vulnerability baseline** (§3.5 — now **31 prod / 45 full**, up from 26/38 yesterday and 20/32 two days ago; prod criticals 2 → 5) — security-sensitive, outside STEP 4 scope; new advisories against locked deps are arriving intra-day. Open a dedicated dependency-refresh issue/PR.
5.  **Refresh agent model IDs** (§5.5) — `muse-spark-1.3-contributor-free` is retired; explore/librarian subagent delegation currently fails.
