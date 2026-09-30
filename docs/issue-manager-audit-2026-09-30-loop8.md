# Issue Manager Audit — 2026-09-30 (loop 8)

## §0 Run Metadata

| Field | Value |
|---|---|
| Evaluation date | 2026-09-30 (UTC), run window ≈07:31–08:00 |
| State machine | Phase 0 → **ISSUE MANAGER MODE** (all other phases stopped) |
| DEFAULT_BRANCH | `main` (detected: `origin/HEAD` unset → verified via `gh api repos/.../default_branch` + `git rev-parse HEAD origin/main` equality at `eb47cc8`) |
| Phase 0.1 open PRs | **0** → PR HANDLER MODE not entered |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** |
| Active phase at end | ISSUE MANAGER MODE (STEP 4 → FAIL-SAFE stop) |
| Final state | **BLOCKED** (issue-side writes 403; unblock paths platform-gated, re-confirmed) |
| Skills used | `github-workflow-automation` (workflow permission model, queue/automation patterns), `openx-basefly` (agent/model inventory + repo conventions) |
| Subagents | **4 spawn attempts, all failed at launch** → analysis performed directly by orchestrator (details §6.3) |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open` → `[]` (zero) → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open` → **82** → **ISSUE MANAGER MODE**; Phases 1–3 stopped per state machine.
3. STEP 1 label matrix recomputed independently: **33 compliant / 49 need remediation** — identical counts to loop 7 (§1).
4. STEP 2/3 analysis: loop-7 clusters D1–D6 / groups G1–G6 adopted after **first-hand spot re-verification** this run (§2); closures/creation remain 403-blocked.
5. STEP 4 selected **#496** (only P0) → first-hand re-verification across all 6 acceptance criteria: **code-complete and documented on `main`** → remaining repair is administrative close → **403**.
6. Per **FAIL-SAFE RULE**: stopped; no speculative changes shipped; uncertainty + new findings documented here (issue creation itself is 403).

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label system (mandatory): exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Independent recompute this run (GraphQL, all 82 open issues):**

| State | Count | Loop-7 count | Delta |
|---|---|---|---|
| Fully compliant | **33** | 33 | — |
| Need remediation | **49** | 49 | — |
| — missing category | 12 | 12 | — |
| — multi-category | 13 | 13 | — |
| — missing priority | 38 | 38 | — |
| — multi-priority | 0 | 0 | — |

Applying labels is **403-blocked** (§5). **The executable remediation payload from loop 7 §1.2 is adopted unchanged as the canonical apply script** (its judgments differ marginally from loop 6 in ~8 rows; loop 7 is the latest merged decision — no flip-flopping):

```bash
# format: issue_number:category,priority   (source: loop-7 audit §1.2, adopted verbatim)
APPLY=(
  789:enhancement,P3 788:test,P2 787:test,P2 786:security,P1 785:bug,P3
  755:enhancement,P2 754:test,P2 753:enhancement,P2 752:enhancement,P3 751:enhancement,P2
  749:feature,P3 748:bug,P2 744:ci,P2 731:feature,P3 729:test,P3 728:security,P2
  727:feature,P3 726:ci,P3 725:test,P2 724:test,P2 723:enhancement,P3
  722:security,P1 721:security,P1 720:docs,P2 719:chore,P2 713:test,P3
  697:docs,P2 668:feature,P3 636:enhancement,P3 635:docs,P2 634:refactor,P2
  632:security,P2 631:test,P3 630:chore,P3 628:test,P2 595:ci,P3 584:ci,P2 305:ci,P2
)
# multi-category: replace all category labels with the single primary
MULTI=(713:test 688:security 584:ci 581:test 551:test 550:test 549:test 523:refactor
       522:ci 515:security 498:security 496:security 305:ci)
```

> Note: rows `722` and `748` carry closure recommendations too (§6.2: #722 verified fixed this run; #748 stale since `.nvmrc` = `22.14.0`).

---

## §2 STEP 2 — Duplicate Detection (re-verified this run)

| Cluster | Canonical | Duplicates | Shared subject | Re-verification 2026-09-30 ≈07:48 |
|---|---|---|---|---|
| D1 | **#496** (P0) | #480 (P1) | Redis-backed distributed rate limiter | ✅ confirmed stale: `packages/api/src/distributed-rate-limiter.ts` + `trpc.ts:435,439` `checkAsync`; all routers wired (§4) |
| D2 | **#305** | #584, #595, #670, #744 | pnpm instead of npm in GitHub Actions | ✅ **still genuinely open**: `iterate.yml:72` and `:342` still `npm ci \|\| true` |
| D3 | **#501** (P1) | #628, #724 | Playwright E2E for critical journeys | ✅ confirmed stale: `tests/e2e/*.spec.ts` × **11** |
| D4 | **#631** | #725 | API-router test coverage (k8s/customer/stripe) | ✅ confirmed stale: router `*.test.ts` files present |
| D5 | **#720** | #748 | `.nvmrc` node-version correctness | ✅ confirmed stale: `.nvmrc` = `22.14.0` |
| D6 | **#719** | #634 (partial) | Root/TS-configuration completeness | ✅ confirmed stale: root `tsconfig.json` exists |

Recommended actions (all **403-blocked**, recorded for execution):

- **D1**: close #496 and #480 with pointer to `packages/api/src/distributed-rate-limiter.ts` + `docs/redis-setup.md`.
- **D2**: close #584/#595/#670/#744 as duplicates of #305; **keep #305 open** (real, fix unshippable — §5.3).
- **D3/D4/D5**: close as stale per loop-7 §7 evidence (re-verified above).
- No information lost: every duplicate retains its canonical reference.

---

## §3 STEP 3 — Consolidation of Small / Similar Issues

Loop-7 groups **G1–G6 adopted unchanged** (nothing changed since 01:58 UTC merge; 0 issues closed in between):

| Group | Members | Proposed consolidated title |
|---|---|---|
| G1 (test program) | #581 ⊃ #549, #550, #551, #500, #501 — plus #713, #725, #787, #788, #628, #724, #729, #754 | `[Testing] Test-coverage program: packages/common, packages/db, apps/nextjs UI, Stripe webhook idempotency` |
| G2 (barrel exports) | #687, #523 | `[DX] Barrel-export audit: add missing index.ts + tree-shaking optimization` |
| G3 (API docs) | #731, #749, #503 | `[Docs] Auto-generate + document tRPC API surface (JSDoc → generated reference)` |
| G4 (bundle performance) | #723, #751, #753, #729, #708 | `[Performance] Bundle-size program: code splitting, analyzer, regression gate` |
| G5 (sensitive-data logging) | #632, #786 | `[Security] Sensitive-data-in-logs audit (Stripe webhook + error paths)` |
| G6 (TS config/strictness) | #634, #719 | `[DX] TypeScript strictness enforcement across packages` |

Issue creation for consolidated groups is **403-blocked** (§5).

---

## §4 STEP 4 — Repair Mode (highest-priority issue)

### 4.1 Selection

| Issue | Labels | Title |
|---|---|---|
| **#496** | `enhancement, P0, security` | [P0][Security] Replace in-memory rate limiter with distributed store (Redis) |

`#496` is the **only P0** in the repository → selected by the P0/P1 rule.

### 4.2 First-hand acceptance-criteria verification (all 6 ACs met on `main`)

| #496 Acceptance Criterion | Evidence (verified this run) | Result |
|---|---|---|
| Redis-backed rate limiter implemented | `packages/api/src/distributed-rate-limiter.ts` — `DistributedRateLimiter` (sliding window over `ioredis` zsets), `SyncRateLimiter` wrapper | ✅ |
| Rate limits consistent across all instances | tRPC `rateLimit` middleware → `await limiter.checkAsync()` (`trpc.ts:435-439`); Stripe webhook + docs routes also `checkAsync`; Redis path active when `IS_REDIS_CONFIGURED && !IS_EDGE` | ✅ |
| Configuration via environment variables | `REDIS_URL` (`packages/common/src/config/env.ts:57`), `RATE_LIMIT_{READ,WRITE,STRIPE}_{MAX_REQUESTS,WINDOW_MS}` (`resilience.ts:112-128`), `.env.example:121-130` | ✅ |
| Graceful degradation when Redis unavailable | `distributed-rate-limiter.ts:188-194,239-247` → in-memory fallback + `logger.warn` | ✅ |
| Unit tests for rate limiter | `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts`, `rate-limiter.test.ts` | ✅ |
| Documentation for setup/configuration | **`docs/redis-setup.md`** (linked from `docs/README.md`) + `.env.example` comments | ✅ |

**Verdict**: the P0 code change is complete **including its documentation AC**. The remaining repair action is **administrative closure** of #496 (and duplicate #480) → blocked (§5).

### 4.3 Repair attempt → blocked (first-hand this run)

```
POST /repos/cpa03/basefly/issues/789/labels  (REST) → 403 Resource not accessible by integration
gh issue edit <n> --add-label / --remove-label (GraphQL, ×63 ops) → 403 addLabelsToLabelable/removeLabelsFromLabelable
POST /repos/.../issues/496/comments           → 403
PATCH /repos/.../issues/789 -f state=open      → 403
POST /repos/.../issues (create probe, empty)   → 403
```

Root cause (unchanged since loop 6): running workflow is `pull` (`.github/workflows/on-pull.yml`), whose `permissions:` block **lacks `issues: write`** (has `contents: write`, `pull-requests: write`, `actions: read`, `repository-projects: write`, `id-token: write`).

### 4.4 Root-cause fix status: platform-gated (loop-7 verbatim evidence re-adopted)

Both unblock pushes were rejected by GitHub's workflow-file gate (loop 7 §4.4, verbatim):

```
! [remote rejected] ... (refusing to allow a GitHub App to create or update workflow
  `.github/workflows/on-pull.yml` without `workflows` permission)
```

This run did **not** re-attempt the identical push (same token, same gate — re-rejection is certain; avoided creating branch residue). Remaining dead paths per loop 7 §4.5, re-confirmed: `parallel` workflow = **`disabled_manually`** (re-checked ≈07:48), dispatch/permissions/settings = 403.

**Single remaining unblock (maintainer, one line):** from a PAT/admin checkout add `issues: write` under `permissions:` in `.github/workflows/on-pull.yml` and merge.

---

## §5 Capability Matrix (first-hand, loop 8)

| Verb | Target | Result |
|---|---|---|
| Read issues (GraphQL, with bodies) | repo | ✅ |
| Read issues (`gh issue list` / `gh issue view`) | repo | ✅ |
| Read issues (**REST** `GET /repos/.../issues?state=open`) | repo | ⚠️ returns **`[]`** — see §6.1 |
| Read labels / workflows / actions inventory | repo | ✅ |
| Create repo label (`POST .../labels`, probe) | repo | ✅ (probe `probe-perm-test` created **and deleted**; `GET` → `Not Found`, zero residue) |
| Delete repo label (probe cleanup) | repo | ✅ |
| `git push` non-workflow file | branch | ✅ (evidenced by merged PRs #1524–#1526) |
| Create/label/edit PR | new PR | ✅ (loop-7 PR #1526 labeled `docs,P2`) |
| Label / comment / close / edit issue | any issue | ❌ **403** (REST + GraphQL, 6 verbs probed) |
| Create issue | repo | ❌ **403** |
| Push `.github/workflows/*` | branch | ❌ rejected (`workflows` scope — not grantable to Actions token) |
| Workflow dispatch / repo settings | repo | ❌ 403 |
| Spawn subagents | `explore`/`oracle`/`ultrabrain`/`general` | ❌ **all 4 models missing at provider** (§6.3) |

No destructive actions performed this run. Probe incident check: **no existing PR/issue artifacts were modified** (all write probes targeted only 403-failing issue verbs or throwaway repo label).

---

## §6 Findings (issue creation itself is 403 — recorded here for the next write-capable run)

### 6.1 🔴 NEW — REST issue-list endpoint returns empty while 82 issues are open (Phase-0 mis-route risk)

- **Category**: `bug` — **Priority**: `P1`
- **Evidence (this run)**: `gh api "repos/cpa03/basefly/issues?state=open&per_page=100"` → `[]` (also with `-f state=open`, `--paginate`); `gh api graphql ... issues(states:OPEN)` → `totalCount: 82`; `gh issue list` → 82; `gh api repos/.../open_issues_count` → 82. Rate limit untouched (`remaining: 5000`).
- **Impact**: a future loop run that uses REST for **Phase 0.2** would observe zero issues → wrongly conclude "empty repo" → enter **PHASE 1 (audit)** while 82 issues exist, violating the state machine ("If a phase is activated, all lower phases MUST NOT run" — in reverse, it would run audit mode it must not). `gh issue list`/GraphQL are the safe probes.
- **Fix**: mandate GraphQL or `gh issue list` for Phase 0 in the loop prompt; investigate why the REST collection route is masked for this repo/token (possibly an org-level issue-visibility filter on the integration).

### 6.2 🟠 NEW — Loop-7 verdict on #722 corrected: startup env validation EXISTS (was marked "OPEN (likely real)")

- **Category**: `chore` (issue hygiene) — **Priority**: `P2` (closure) / reclassifies a `security` `P1`
- **Evidence**: `apps/nextjs/src/env.mjs` — `createEnv` from `@t3-oss/env-nextjs` + zod schema (POSTGRES_URL, STRIPE_*, CLERK_SECRET_KEY, ADMIN_EMAIL, NEXT_PUBLIC_*); `packages/auth/env.mjs` — `createEnv` from `@t3-oss/env-core`; **both imported by `apps/nextjs/next.config.mjs:2-3`** → validation executes at Next config load = startup/build, before any DB/external connection.
- **Why loop 7 missed it**: their grep targeted `createEnv|t3-env|@t3-oss` in `*.ts` — the validators are `.mjs`.
- **Impact**: #722 should be re-verified and closed as fixed; carrying it as `security/P1` mis-ranks the backlog.

### 6.3 🟠 NEW/ONGOING — Subagent orchestration still fully broken: 4/4 spawn attempts died at launch

- **Category**: `bug` (or `ci`) — **Priority**: `P1` (extends loop-7 §8.1)
- **Evidence (this run, consecutive failures ≤1 s each):**

  | Attempt | Agent/category | Missing model ID |
  |---|---|---|
  | `bg_59c17a6b` | `ultrabrain` | `opencode/kimi-k2.5-free` |
  | `bg_ef28e7c4` | `oracle` | `opencode/glm-4.7-free` |
  | `bg_4aba619c` | `explore` | `opencode/gpt-5-nano` |
  | `bg_09234fa2` | `general` (built-in default) | `iflowcn/big-pickle` |

- **Provider inventory** (`opencode models`, this run): `opencode/ling-3.0-flash-fin-free`, `opencode/longcat-2.5-preview-free`, `opencode/mimo-v2.6-flash-free`, `opencode/muse-spark-1.3-contributor-free`, `opencode/nemotron-3-ultra-free`, `opencode/nemotron-3.5-lightning-free`, `opencode/space-bunny-free`. **None** of the configured agent IDs exist.
- **Impact**: the operating contract's MANDATORY ORCHESTRATION step cannot execute (4th consecutive loop). `.omo/omo.jsonc`, `.opencode/skills/openx-basefly/SKILL.md`, and `AGENTS.md` all document the same stale IDs — config, skill, and docs agree with each other but all disagree with the provider.
- **Fix (deliberately NOT shipped — choosing replacement models changes subagent quality repo-wide and contradicts `AGENTS.md`; needs maintainer decision)**: repoint agent/category `model` entries in `.omo/omo.jsonc` to models present in `opencode models`, then mirror the change in `AGENTS.md` + `openx-basefly` skill.

### 6.4 Carry-forward (loop-7 §8, still valid, still 403-blocked to file)

| # | Finding | Category/Priority |
|---|---|---|
| 8.2 | `on-pull.yml` lacks `issues: write` (root cause of every blocked loop) | `ci`/`P0` |
| 8.3 | `parallel` (iterate.yml) disabled while being the only issue-capable workflow | `ci`/`P1` |
| 8.4 | 49/82 issues violate the mandatory label contract (§1 payload ready) | `chore`/`P1` |
| 8.5 | ~20 verified-stale issues remain open (§2 clusters) | `chore`/`P2` |
| 8.6 | Genuine open work confirmed: #305 (+dups, fix unshippable), #728, #498 (ADMIN_EMAIL fallback removal unsafe to ship speculatively), #500 (partial) | mixed |

### 6.5 Working-tree disclosure (not shipped)

- `.omo/omo.jsonc` shows an uncommitted diff (`deep` → `deep-low` category rename + `_migrations` entry `2026-09-category-deep-split`) applied by the oh-my-opencode plugin at session start ≈07:33 — **not authored by this run's decisions**; deliberately excluded from the audit commit.
- Untracked `.omo/run-continuation/*.json` runtime artifacts likewise excluded.

---

## §7 Action Log (UTC, 2026-09-30, approximate minute precision)

| Time | Action | Target | Result |
|---|---|---|---|
| ≈07:31 | Phase 0.1 open-PR query | `gh pr list` | 0 open → skip PR mode |
| ≈07:31 | Phase 0.2 open-issue query | `gh issue list` / GraphQL | 82 open → **ISSUE MANAGER MODE** |
| ≈07:31 | DEFAULT_BRANCH detection | `gh api` + git | `main` @ `eb47cc8` (local == remote) |
| ≈07:32 | Skill load | `github-workflow-automation` | ✅ branch/permission patterns applied |
| ≈07:33 | Issue dataset fetch | GraphQL (REST returned `[]` — logged as §6.1) | 82 nodes with bodies |
| ≈07:33 | Subagent spawn #1 | `ultrabrain` `bg_59c17a6b` | ❌ `ProviderModelNotFoundError: opencode/kimi-k2.5-free` |
| ≈07:34 | STEP 1 apply attempt | 63 label ops (38 pri + 12 cat + 13 de-dup) | ❌ all **403** (GraphQL `addLabelsToLabelable`) |
| ≈07:35 | Permission probes | repo label create/delete, issue comment/PATCH/create | labels ✅ (probe created+deleted, zero residue); issue verbs ❌ 403 |
| ≈07:36 | Subagent spawns #2/#3 | `oracle` `bg_ef28e7c4`, `explore` `bg_4aba619c` | ❌ both `ProviderModelNotFoundError` |
| ≈07:37 | Root-cause identified | `GITHUB_WORKFLOW=pull`, `on-pull.yml` permissions | missing `issues: write` (matches loops 6/7) |
| ≈07:40 | Subagent spawn #4 | `general` `bg_09234fa2` | ❌ `ProviderModelNotFoundError: iflowcn/big-pickle` |
| ≈07:41 | STEP 4 evidence | `rate-limiter.ts`, `distributed-rate-limiter.ts`, `trpc.ts:435-439` | #496 code-complete confirmed |
| ≈07:44 | STEP 4 AC sweep | consumers, `docs/redis-setup.md`, `.env.example`, tests | **6/6 ACs met** |
| ≈07:45 | Adopt loop-7 analysis | `docs/issue-manager-audit-2026-09-30-loop7.md` | D1–D6, G1–G6, §1.2 payload adopted |
| ≈07:48 | Freshness spot-checks | `iterate.yml`, actions inventory, REST re-probe, counts | npm-ci lines intact; `parallel` disabled; REST `0`; 0 PRs / 82 issues |
| ≈07:50 | **#722 verdict correction** | `apps/nextjs/src/env.mjs` + `next.config.mjs:2-3` | loop-7 "OPEN" → **STALE (fixed)** (§6.2) |
| ≈07:52 | Model inventory | `opencode models` | 7 free models; all configured IDs absent (§6.3) |
| ≈07:55 | Skill load | `openx-basefly` | ✅ confirmed skill docs carry same stale model IDs |
| ≈07:58 | Deliverable | `docs/issue-manager-audit-2026-09-30-loop8.md` | written → branch → PR |

**Subagent report**: 4 spawn attempts (`bg_59c17a6b`, `bg_ef28e7c4`, `bg_4aba619c`, `bg_09234fa2`) — duplicate clustering, rate-limiter discovery — **all failed at launch** with `ProviderModelNotFoundError` for 4 distinct model IDs (§6.3). All analysis in this document was produced directly by the orchestrator; **no result here depends on a failed subagent**.

---

## §8 Final State

**BLOCKED** — reasons:

1. Issue-side writes (label / comment / close / create) are **403** for `GITHUB_TOKEN` in the active `pull` workflow — missing `issues: write` (§4.3).
2. Fixing (1) from inside the workflow is **platform-gated**: GitHub refuses workflow-file pushes without the non-grantable `workflows` scope (§4.4).
3. The only issue-capable workflow (`parallel`) remains **disabled manually**, and dispatching it is 403 (§4.4).
4. STEP 4's selected issue (#496) is **code-complete across all 6 acceptance criteria**; its remaining action is administrative (close #496 + dup #480) → blocked by (1).
5. The next genuinely atomic repair (#305: `npm ci` → `pnpm`) **is implemented but unshippable** → same gate as (2).
6. Per FAIL-SAFE RULE: no speculative changes shipped; uncertainty documented here (issue creation itself is 403).

**Unblock path for maintainer (single change):**

```yaml
# .github/workflows/on-pull.yml
permissions:
  contents: write
  issues: write        # ← add this line
  pull-requests: write
  actions: write       # ← optional: enables dispatching `parallel`
```

Merge from a PAT/admin checkout. The next loop can then execute §1 (normalize 49 issues), §2 (close ~12 verified-stale duplicates incl. the P0 pair #496/#480), §3 (create 6 consolidated issues), and §6 (file the findings above — starting with the `P0` `issues: write` root cause and the `P1` REST-list quirk).

**Secondary recommendation**: repoint agent/category models in `.omo/omo.jsonc` to models present in `opencode models`, mirroring the change in `AGENTS.md` and `.opencode/skills/openx-basefly/SKILL.md`, so mandatory subagent orchestration resumes (§6.3).

🤖 Generated as the loop-8 issue-manager audit deliverable.
