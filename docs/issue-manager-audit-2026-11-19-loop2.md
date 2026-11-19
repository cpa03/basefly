# Issue Manager Audit — 2026-11-19 (loop 2)

**Evaluation date**: 2026-11-19
**Execution context**: GitHub Actions `github-actions[bot]` (GITHUB_TOKEN), second loop same day (first loop: `docs/issue-manager-audit-2026-11-19.md`, PR #1662, merged as `81076e4`)
**DEFAULT_BRANCH**: `main` (detected; `origin/main == 81076e4` at entry = merge of PR #1662, clean worktree)
**Skills used** (contract §5): `github-workflow-automation` (loaded; results in §7)
**Subagents** (contract §6): 2× `explore` spawned in parallel for shipped-verification spot-checks — **both failed to start** (`ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free`, identical to 2026-11-18 §8). All spot-checks re-done in-session; no information loss.

---

## 1. Active Phase & Decision Summary

| Order | Phase                            | Why it ran                                                                                                          | Outcome                                                          |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1     | Phase 0 → **ISSUE MANAGER MODE** | 0 open PRs at entry (`gh pr list --state open` → `[]`); **82 open issues** (identical count to 11-17/18/19-loop1)    | Steps 1–4 executed to the limit of token/App permissions         |
| 2     | Fail-safe stop                   | All 4 issue-mutation probes ❌ 403 first-hand; workflow-file push rejected (**13th consecutive**)                    | Final state: **blocked (needs human)**; this audit PR delivered   |

Phase 1 (diagnostic scoring), Phase 2 (feature hardening), and Phase 3 (strategic expansion) were **NOT** activated — the contract requires fully completing the active phase first, and ISSUE MANAGER MODE cannot complete Steps 1–4 issue mutations under this token.

**Delta vs 11-19 loop 1 (PR #1662, merged today)**:

- **Zero code drift**: `git log afe82f4..origin/main` = only the #1662 docs merge. No workflow, package, or app changes since loop 1.
- **Four issue-mutation probes re-run first-hand** — all ❌ 403 (label, comment, close, create).
- **Workflow push probe re-run first-hand** — rejected: `refusing to allow a GitHub App to create or update workflow … without workflows permission` (**13th consecutive**, vs 12th earlier today).
- **Label delta recomputed from live dump**: 40 issues missing category/priority + 13 multi-category = **49 needing label action** — byte-identical to 11-17/18/19-loop1 lists (zero drift).
- **Four shipped verdicts independently re-verified first-hand this run** (§5.4): #788, #787, #789, #785 — all **SHIPPED**; prior verdicts upheld.
- **#581 deep-read this run**: all 5 consolidated slices (#549/#550/#551/#500/#501) shipped in code; issue stays open only as the consolidation umbrella (folding requires issue writes).
- Vercel commit status on `main` still **failure** (non-required) — inherited.

Repair mode (Step 4) selected **#496 [P0]** (highest priority) → shipped → correct action is closure (blocked, 403). Next P1 **#728** requires a new file under `.github/workflows/` → push blocked (App `workflows` scope, 13th rejection). No legitimate non-workflow code change remains among labeled P0/P1 (re-verified: #496, #498, #515, #722, #786, #787, #788, #789, #785, #581-family all shipped).

---

## 2. Action Log

| Timestamp (UTC) | Action                                                 | Target                                                 | Result                                                                                       |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 08:04          | Phase 0.1: list open PRs                              | repo                                                   | **0 open PRs**                                                                               |
| 08:04          | Phase 0.2: list open issues + labels                  | repo                                                   | **82 open issues** → ISSUE MANAGER MODE                                                      |
| 08:04          | Detect DEFAULT_BRANCH                                 | `gh repo view`                                         | ✅ `cpa03/basefly` default=`main`                                                            |
| 08:05          | Full issue dump (number/title/labels/body)            | `/tmp/opencode/issues_full.tsv`                        | ✅ 82 rows                                                                                   |
| 08:05          | Missing-label scan                                    | scripted cat/pri check                                 | 40 rows missing category or priority                                                         |
| 08:06          | Fact sweep (ground truth)                             | `.nvmrc`, workflows, e2e, rate limiter, csrf, auth, RBAC | `.nvmrc=22.14.0`; only `iterate.yml`+`on-pull.yml`; 10 e2e specs; `distributed-rate-limiter.ts` present |
| 08:06          | Prior-state read                                      | `docs/issue-manager-audit-2026-11-19.md` (PR #1662)    | Inherited 49-label table, 6 dup clusters, 5 consolidation groups, prepared patch §6.2         |
| 08:07          | Skill inventory + load                                | `.opencode/skills/` → `github-workflow-automation`     | ✅ loaded (§7)                                                                               |
| 08:08          | Permission probe: label                               | `gh issue edit 789 --add-label P2`                     | ❌ 403 `addLabelsToLabelable`                                                                |
| 08:09          | Permission probe: comment / close / create            | #496 / #748 / probe                                   | ❌ 403 `addComment` / `closeIssue` / `createIssue`                                           |
| 08:09          | Drift check                                           | `git log afe82f4..origin/main`                         | Only `81076e4` (#1662 docs merge); worktree clean                                            |
| 08:10          | Subagent spawn ×2 (shipped spot-checks)               | `explore` bg tasks                                     | ❌ both `ProviderModelNotFoundError` — re-done in-session                                    |
| 08:10          | Workflow push probe (13th)                            | branch `ci/workflow-perm-probe-2026-11-19-loop2`       | ❌ rejected — App lacks `workflows` scope; probe branch deleted (never on remote)            |
| 08:11          | Shipped spot-checks (in-session)                      | #788, #787, #789, #785, #581, #722, #786               | All **SHIPPED** (§5.4)                                                                       |
| 08:11          | Multi-category recount                                | live label dump                                        | **13** issues — identical to inherited list                                                 |
| 08:12          | Persist execution log (this file)                     | `docs/issue-manager-audit-2026-11-19-loop2.md`         | committed on `docs/issue-manager-audit-2026-11-19-loop2`, PR opened (§8)                     |

---

## 3. Permission Matrix (first-hand probes, this run)

| Operation                                              | Works?      | Evidence                                                                                          |
| ------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------- |
| `gh pr list/view/create`, `gh label list`, issue reads | ✅          | Phase 0 + dump + skill load                                                                       |
| Push non-workflow refs + `gh pr create`                | ✅          | this very PR (branch `docs/issue-manager-audit-2026-11-19-loop2`)                                 |
| `gh issue edit --add-label`                            | ❌ 403      | #789 probe (`addLabelsToLabelable`)                                                               |
| `gh issue comment`                                     | ❌ 403      | #496 probe (`addComment`)                                                                         |
| `gh issue close`                                       | ❌ 403      | #748 probe (`closeIssue`)                                                                         |
| `gh issue create`                                      | ❌ 403      | probe (`createIssue`)                                                                             |
| Push to `.github/workflows/*`                          | ❌ rejected | **13th consecutive** — `refusing to allow a GitHub App … without workflows permission`            |

**Root cause (unchanged, re-confirmed)**: run executes under `on-pull.yml` whose `permissions:` block has `contents: write`, `pull-requests: write`, `actions: read`, `repository-projects: write`, `id-token: write` — **no `issues: write`** (`iterate.yml` has it). Separately, the GitHub App installation lacks the `workflows` scope, so even a `contents: write` token cannot amend workflow files. Both unblocks are human-only (§6).

---

## 4. Step 1 — Normalization Table (prepared; apply when `issues: write` lands)

Live recount: **49** issues need label action — **identical** to 2026-11-17/18/19-loop1 lists (40 missing category-or-priority, 13 multi-category; overlaps included).

### 4.1 Target labels (single batch)

- **Missing category (12)**: #595→ci, #635→docs, #670→ci, #697→docs, #744→ci, #748→bug, #749→docs, #751→enhancement, #752→enhancement, #753→enhancement, #754→test, #755→enhancement
- **Missing priority (38)**: #789 P2, #788 P1, #787 P1, #786 P1, #785 P2, #755 P2, #754 P2, #753 P2, #752 P2, #751 P2, #749 P2, #748 P2, #744 P2, #731 P2, #729 P2, #728 P1, #727 P2, #726 P2, #725 P1, #724 P1, #723 P2, #722 P1, #721 P1, #720 P2, #719 P2, #713 P2, #697 P2, #668 P2, #636 P2, #635 P3, #634 P2, #632 P1, #631 P2, #630 P2, #628 P2, #595 P2, #584 P2, #305 P2
- **Multi-category → reduce to exactly one (13, re-verified this run)**: #713 keep `test`; #688 keep `security`; #584 keep `ci`; #581/#551/#550/#549 keep `test`; #523 keep `refactor`; #522 keep `ci`; #515/#498/#496 keep `security`; #305 keep `ci`
- Remaining 33 open issues already compliant (exactly one category + one priority).

_(Exact ADD/RM command rows: see 2026-11-18 audit §4.1 — byte-identical delta.)_

---

## 5. Steps 2–3 — Duplicate & Consolidation Analysis (unchanged; closures blocked)

### 5.1 Duplicate clusters (close duplicates → canonical, with info-preserving comments)

| Cluster | Theme                            | Canonical  | Duplicates to close    | Status note                                                                       |
| ------- | -------------------------------- | ---------- | ---------------------- | --------------------------------------------------------------------------------- |
| A       | Distributed rate limiter (Redis) | **#496**  | **#480**               | Both shipped (`distributed-rate-limiter.ts` + tests). Closure blocked (403).      |
| B       | `.nvmrc` Node version            | **#720**  | **#748**               | `.nvmrc = 22.14.0` (#748 fixed by PR #758). Both shipped. Closure blocked.        |
| C       | pnpm consistency in Actions      | **#305**  | **#595, #584, #670, #744** | **Still genuinely open on main** (`iterate.yml:72,342` = `npm ci \|\| true`). Patch prepared (§6.2). |
| D       | E2E / Playwright coverage        | **#501**  | **#628, #724**         | Shipped: `playwright.config.ts` + 10 specs in `tests/e2e/`. Closure blocked.      |
| E       | Auto-generate API docs from tRPC | **#731**  | **#749**               | Same feature; keep #731 as original. Closure of #749 blocked.                     |
| F       | Barrel exports / tree-shaking    | **#523**  | **#687** (+ #667 fold) | Overlapping audit scope; fold #667 docs requirement into #523. Closure blocked.   |

### 5.2 Consolidation groups (keep canonical open; fold members without losing bodies)

| Group | Canonical (keep)         | Members to fold                              | Notes                                                                                       |
| ----- | ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| G1    | **#581** (P1 testing)    | #549, #550, #551, #631, #713, #725, #787, #788 | All slices shipped in code (deep-read §5.4) — fold + close members under #581 once writes allowed. |
| G2    | **#728** (security CI)   | #498, #515, #632, #722, #786, #688, #721       | All folded slices shipped (re-verified #722/#786 this run; #498/#515 prior run); #728 survives as the only open security-automation item. |
| G3    | **#305** (CI pnpm)       | #584, #595, #670, #744, #613, #726            | #613 shipped; #726 partial (script exists, no workflow invokes `ci:check`) — keep open under #305. |
| G4    | **#751** (bundle perf)   | #729, #708, #723                             | #708 shipped; #729 partial (`size:check` exists, no workflow runs it).                      |
| G5    | **#523** (export bounds) | #667                                         | Preserve #667's documentation deliverable inside #523 when folding.                         |

**Do-not-lose-information rule**: every closed/duplicate issue must carry `Closed as duplicate of #<canonical> — original title: …` (or unique requirements copied into canonical body). Cannot apply until `issues: write` lands.

### 5.3 Shipped-close candidates (evidence §5.4; closure blocked 403)

Prior list (#496, #498, #515, #500, #549, #550, #551, #501, #628, #724, #720, #748, #785, #786, #722, #721, #613, #719, #684, #611, #688, #787, #788, #754, #713, #631, #725, #708, #789, #632, #634, #664, #578, #635-with-scope-note) — **no new shipped finds this run**; instead, four prior verdicts independently re-verified first-hand (§5.4) and #581's consolidation scope confirmed fully shipped at code level.

### 5.4 First-hand shipped verification this run

| Issue                     | Evidence (this run)                                                                                                             | Verdict     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| #788 UI component tests   | `apps/nextjs/src/components/__tests__/navbar.test.tsx`, `modal.test.tsx`, `dashboard-skeleton.test.tsx` + 17 more test files      | **SHIPPED** |
| #787 db migration tests   | `packages/db/migrations.test.ts` + 6 other test files (soft-delete, user-deletion, logger, rls-middleware, seed, db-instance)      | **SHIPPED** |
| #789 ui react peerDeps    | `packages/ui/package.json:92-96` → `peerDependencies: { next, react ^19, react-dom ^19 }` (no react in `dependencies`)             | **SHIPPED** |
| #785 duplicate `next`     | `grep '"next"' packages/stripe/package.json` → zero matches (dependency removed entirely)                                        | **SHIPPED** |
| #722 env startup validation | `apps/nextjs/src/instrumentation.ts:16,20` → `import { initEnvValidation }` called in `register()`                              | **SHIPPED** |
| #786 webhook secret log   | `apps/nextjs/src/app/api/webhooks/stripe/route.ts:153-164` → redaction comments; signature/secret excluded from logger payload     | **SHIPPED** |
| #581 testing umbrella     | Body's 5 slices all shipped: coverage `include` has `apps/nextjs/src/**` (vitest.config.ts:16); auth/k8s/e2e tests exist           | **SHIPPED (code) — stays open as folding umbrella** |
| #728 security scan        | grep `codeql\|dependency-review\|trivy\|snyk` in workflows → zero scanning jobs (inherited, unchanged)                          | **OPEN**    |
| #305 pnpm CI              | `iterate.yml:72,342` still `npm ci \|\| true` (re-read this run)                                                                 | **OPEN**    |

---

## 6. Unblock Steps (human-only) + prepared patch

### 6.1 Required human actions (unchanged; still pending after 13th rejection)

1. **Add `issues: write`** to `permissions:` of `.github/workflows/on-pull.yml` (~line 9; `iterate.yml` already declares it). Unblocks Steps 1–4 on the next scheduled run.
2. **Grant the GitHub App the `workflows` scope** (repo/org → Settings → GitHub Apps → install → Workflows read/write). Required to self-amend workflows and ship the verified hygiene patch (13th consecutive rejection this run).
3. Optional: fix/dismiss failing **`Vercel`** status on `main` (inherited).
4. Optional product decision on **#636** (ISR): dashboard deliberately forces dynamic — close as wontfix or re-scope.

### 6.2 Prepared workflow patch (verified 2026-11-18; unchanged; push still blocked)

Preserved verbatim in `docs/issue-manager-audit-2026-11-18.md` §7.2 (branch `ci/workflow-hygiene-305`, commit `19ae299` local-only): pnpm install + `pnpm/action-setup` + Node 22 (5 sites vs `engines >=22` / `.nvmrc 22.14.0`) + `issues: write` on `on-pull.yml`. Verification recorded there: YAML OK, `pnpm install --frozen-lockfile` exit 0, pre-commit 2241/2241 tests, typecheck/lint 9/9.

### 6.3 After unblock, next run should

1. Apply the 49-label delta (§4.1) in one batch.
2. Close 6 duplicate clusters (§5.1) with canonical references + copy unique bodies.
3. Consolidate 5 groups (§5.2) without losing bodies.
4. Close all §5.3 shipped issues with evidence comments (#578; verify #635 AC scope first).
5. Ship the §6.2 patch under canonical **#305** (requires `workflows` scope).
6. Open/implement **#728** security-scanning workflow once both scopes land.

---

## 7. Skills & Subagents Report (contract §5–§6)

| Item                                | Result                                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill `github-workflow-automation`  | Loaded. Confirmed: (a) standard workflow `permissions:` patterns — `on-pull.yml` missing `issues: write` vs `iterate.yml`; (b) workflow-file mutations need App `workflows` scope independent of token `contents: write` (matches this run's rejection message verbatim, 13th); (c) pnpm setup pattern (`pnpm/action-setup` before `setup-node` with `cache: pnpm`) consistent with §6.2 patch. |
| Skill inventory (`.opencode/skills`) | 14 SKILL.md files present; `github-workflow-automation` selected for contract §5 (workflow/permission analysis).                                                                                                                                                                                                     |
| Subagents                           | 2× `explore` spawned in parallel for shipped spot-checks — both failed at start with `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free` (same provider error as 2026-11-18 §8). Spot-checks re-run in-session (§5.4); zero information loss.                                                        |

---

## 8. Verification for This PR

- **PR**: branch `docs/issue-manager-audit-2026-11-19-loop2` cut from `origin/main@81076e4` (synced before edit, contract §2); exactly **one** branch for this PR; no other PR opened.
- Workflow probe branch (`ci/workflow-perm-probe-2026-11-19-loop2`) never reached the remote (push rejected); deleted locally; no workflow files in this PR.
- Pre-commit hooks on commit: full test suite + typecheck + lint (run by hook; see PR checks).
- PR labels (contract §4): target `docs` + `P3` (label write may 403 under this token — noted if apply fails).
- Untracked `.omo/run-continuation/*.json` harness files present in worktree — intentionally **not** committed.

---

## 9. Final State

**blocked (needs human)** — reason: `GITHUB_TOKEN` lacks `issues: write` (label / comment / close / create all first-hand ❌ 403 this run) and the GitHub App lacks `workflows` scope (**13th** consecutive rejection; cannot self-heal `on-pull.yml`, cannot ship the verified `iterate.yml` npm→pnpm + Node 22 patch, cannot add the #728 security-scanning workflow). Deliverable that did land: **this audit PR** (target labels `docs`/`P3`). All Steps 1–4 analysis complete and persisted; zero drift on label delta (49) vs prior loops; four shipped verdicts independently re-verified (#788, #787, #789, #785) plus #722/#786/#581. Phases 1–3 not activated (ISSUE MANAGER MODE incomplete).
