# Issue Manager Audit — 2026-10-19 (loop 32)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-19 02:11 – 02:25 UTC                                                                                                                                                                                                                                                      |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                                             |
| DEFAULT_BRANCH        | `main` (auto-detected via `origin/HEAD`; `e7698d9` = PR #1583 merge = loop-31 audit; local HEAD synced at run start)                                                                                                                                                              |
| Phase 0.1 open PRs    | **0** → not PR HANDLER MODE (loop-31's audit PR #1583 merged after loop 31 ended waiting-for-review)                                                                                                                                                                              |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical number set to loops 7–31 — no drift; sorted-number digest `b8c2c2a8` recomputed this run)                                                                                                                                              |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                                              |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403 (§4); workflow-file push block now **first-hand proven** (§4)                                                                                                                                     |
| Skills used           | `openx-basefly` (repo harness conventions, docs-audit PR pattern); `planning-with-files` (persistent task_plan.md across the run); `github-workflow-automation` referenced via loop-31 continuity for the GITHUB_TOKEN/workflows permission model — all claims re-probed this run |
| Subagents             | None this run — loop 31 recorded 2× `explore` background spawns failing with `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free` (provider-side model removal); all verification done first-hand by the orchestrator to avoid a known-broken path              |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **0 open PRs** → fall through to Phase 0.2.
2. **Phase 0.2**: `gh issue list --state open` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (findings-issue creation is out of phase and 403-blocked anyway).
3. Drift check: sorted open-issue numbers recomputed → **82 numbers**, digest `b8c2c2a8…`; full number set `[305, 480, 483, …, 789]` identical to loops 7–31 → **no drift**; local `main` already at `origin/main` = `e7698d9` (loop-31 audit merge #1583).
4. STEP 1: label matrix recomputed independently (Python, first-hand) → **33 compliant / 49 remediation** — exact item-for-item match with loops 7–31 (all five partitions) → no-drift rule applies; write attempt re-probed → **403** (§1, §4).
5. STEP 2/3: duplicate clusters D1–D7 re-derived from issue bodies (first-hand `jq` body extraction this run for D1/D2/D3/D4/D5/D7 members); close probe (`PATCH /issues/480 state=closed`) → **403**; #480 re-verified **still OPEN** (no side effect).
6. STEP 4: **#496** (only P0) re-verified code-complete **first-hand this run**: 3 rate-limiter test files → **98/98 passed** (1.16s) at `e7698d9`; acceptance-criteria evidence: `.env.example:124,128-133` (`REDIS_URL` + 6× `RATE_LIMIT_*`), `docs/redis-setup.md` exists, in-memory fallback present (`distributed-rate-limiter.ts`). Full P0/P1 file-presence set re-verified (§3).
7. **Loop-32 delta — workflow-file push block now first-hand proven (was carried in loops 19–31)**: probe commit appending a comment to `.github/workflows/iterate.yml` → `git push` rejected with the exact platform message: `! [remote rejected] HEAD -> chore/issue-manager-audit-2026-10-19-loop32 (refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml without workflows permission)`; local probe commit reverted (`git reset --hard e7698d9`); remote branch still at main tip (push rejected before ref update). Carried claim elevated to first-hand evidence.
8. **Loop-32 delta — both maintainer patches verified CLEAN APPLY** (loop 31 verified only the on-pull patch; the pnpm patch was carried-unchecked): `git apply --check docs/patches/on-pull-issues-write-permission.patch` → CLEAN; `git apply --check docs/patches/fix-pnpm-consistency-iterate-744.patch` → **CLEAN** (loop-31 §0.10 gap closed).
9. **Loop-32 delta — zero-job CI anomaly upgraded to established failure mode**: `gh api .../actions/runs/{39182275421,39179140997,39171487973}/jobs` → all three docs-branch runs return `{"jobs":[],"total_count":0}` with conclusion `failure`; contrast run `39181672002` (agent branch, success) → `total_count: 1`. Loop-31's **own** branch failed **twice** (`39179140997`, `39182275421`) yet PR #1583 was still merged — the failure does not gate merges. Total zero-job failures now **4** (loop-29 `39138816789`, loop-30 `39171487973`, loop-31 ×2). Recorded for maintainer (`actions: read` only — cannot re-run or inspect deeper).
10. Stale-set re-confirmations this run (§3): #720/#748 (`.nvmrc` = `22.14.0`), #785 (no `next` dep in packages/stripe — deps/peer/dev all None), #578 (exactly one health route), #634 (`strict: true` at `tooling/typescript-config/base.json:9`), #630 (`.husky/pre-commit` runs `pnpm typecheck` + `pnpm test` + `pnpm check-deps` + `pnpm lint-staged` → partial: full-suite 45.2s this run > 30s AC), #697 (zero U+FFFD outside audit docs), #635 (`docs/ONBOARDING.md` exists), #721 (`adminProcedure` at `trpc.ts:331`), #722 (`apps/nextjs/src/env.mjs` 55 lines, 16 zod lines), #731 (`packages/api/src/openapi.ts` + `apps/nextjs/src/app/api/docs/route.ts`), #664 (0 runtime `console.*` in packages/db + packages/stripe sources), #789 (peerDeps `{next: >=14, react: ^19, react-dom: ^19}` present), #501/#628/#724 (12 entries in `tests/e2e/` = 11 `.spec.ts` + `fixtures.ts`).
11. Genuinely-open re-confirmations this run: **#494** (0 `domain/` dirs), **#723** (36/127 `.tsx` with `"use client"` = 28% — matches loops 28–31 exactly), **#650** (inline `ulw-loop` prompt still at `on-pull.yml:76`), **#502** (only `iterate.yml` + `on-pull.yml` exist), **D2** (`iterate.yml` `npm ci || true` at lines 72 and 342; `~/.npm` cache path + `package-lock.json` hash at 58–59) — the latter three all touch workflow files → **platform-blocked, now with first-hand push-rejection proof** (§4).
12. Permission probes **first-hand this run** (four surfaces): issue label POST → **403**; issue close REST (`PATCH /issues/480 state=closed`) → **403**; #480 confirmed OPEN after probe; issue comment GraphQL (`addComment` on #496) → **403**; **workflow-file push → platform-rejected with explicit `workflows`-permission message** (delta #7 above); issue reads → OK.
13. Root-cause permission block re-verified: `.github/workflows/on-pull.yml:9-14` permissions block lists `contents: write`, `pull-requests: write`, `actions: read`, `repository-projects: write`, `id-token: write` — **no `issues: write`** (this loop's workflow); `iterate.yml:13` declares `issues: write` but does not run the loop. Workflow-file updates additionally require the GitHub App `workflows` permission, which neither workflow declares and the installation does not grant.
14. FAIL-SAFE: STEP 1 apply, STEP 2/3 closes/consolidations, STEP 4 administrative closure of #496, and the D2 workflow fix all require issue write or `workflows` permission → **403 / platform-reject** → no guessing; durable capture = this audit (established loop pattern).
15. Full green baseline re-established first-hand: **typecheck 9/9 (13.7s), lint 9/9 (48.0s, zero warning lines), test 2207/2207 (151 files, 45.2s), build 1/1 (36.7s)**, plus RL 98/98 (1.16s) and size budgets green (CSS 20.13/120 kB, Media 260.03/300 kB; Client JS budget cached-green) → no regression vs loop-31 baseline.
16. Runner Node is v20.20.2 while `package.json` engines want `>=22` and `.nvmrc` pins `22.14.0` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§4). Vercel deployment status not re-probed (environmental; docs-only changes unaffected).

### Action log

| Timestamp (UTC)  | Action                                    | Target                                                | Result                                                                                                                                      |
| ---------------- | ----------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-19 02:11 | Phase 0.1 entry: `gh pr list`             | repo `cpa03/basefly`                                  | **0 open PRs** → fall through                                                                                                               |
| 02:11            | Phase 0.2 entry: `gh issue list`          | repo                                                  | **82 open issues → ISSUE MANAGER MODE**                                                                                                     |
| 02:11            | Sync local `main` with `origin/main`      | `main`                                                | Already up to date at `e7698d9` (loop-31 merge #1583)                                                                                       |
| 02:11            | Drift check                               | sorted issue-number digest                            | `b8c2c2a8…`, 82 numbers — identical set to loops 7–31 → **no drift**                                                                        |
| 02:12            | Label matrix recomputation (Python)       | all 82 issues                                         | **33 compliant / 49 remediation** — exact match (no drift)                                                                                  |
| 02:12            | Permission probe (issue label)            | issue 789                                             | **403** `Resource not accessible by integration`                                                                                            |
| 02:12            | Permission probe (issue close, REST)      | issue #480 (`state=closed`)                           | **403**; #480 re-verified **OPEN** (no side effect)                                                                                         |
| 02:13            | **Workflow-file push probe (first-hand)** | `.github/workflows/iterate.yml` probe commit          | **Platform-rejected**: `refusing to allow a GitHub App to create or update workflow … without workflows permission`; probe reverted locally |
| 02:13            | Permission probe (issue comment, GraphQL) | issue #496                                            | **403** GraphQL `addComment`                                                                                                                |
| 02:14            | Patch verification                        | `docs/patches/on-pull-issues-write-permission.patch`  | **CLEAN APPLY**                                                                                                                             |
| 02:14            | Patch verification                        | `docs/patches/fix-pnpm-consistency-iterate-744.patch` | **CLEAN APPLY** (loop-31 carried-unchecked gap closed)                                                                                      |
| 02:14            | Stale-set spot checks (12 claims)         | .nvmrc / stripe deps / health / strict / husky / …    | all stale/partial verdicts confirmed (§0.10)                                                                                                |
| 02:14            | Genuinely-open re-confirmation            | #494/#723/#650/#502/D2                                | all still open; workflow-file items platform-blocked                                                                                        |
| 02:14            | `pnpm install --frozen-lockfile`          | workspace                                             | Done in 7.6s                                                                                                                                |
| 02:14            | Gate: typecheck                           | workspace                                             | **9/9 successful**, 13.7s                                                                                                                   |
| 02:15            | Gate: lint                                | workspace                                             | **9/9 successful**, 48.0s (**zero warning lines**)                                                                                          |
| 02:16            | Gate: test                                | workspace                                             | **2207/2207 passed (151 files)**, 45.2s                                                                                                     |
| 02:17            | Gate: build                               | workspace                                             | **1/1 successful**, 36.7s                                                                                                                   |
| 02:17            | STEP 4 verification: rate-limiter tests   | `packages/api/src/*rate-limiter*.test.ts`             | **98/98 passed** (1.16s) → #496 code-complete                                                                                               |
| 02:17            | Size budgets                              | apps/nextjs (size-limit)                              | **green**: CSS 20.13/120 kB, Media 260.03/300 kB (Client JS cached-green)                                                                   |
| 02:18            | CI anomaly inspection                     | runs 39182275421 / 39179140997 / 39171487973          | all `failure` with `jobs: []`; contrast success run has 1 job                                                                               |
| 02:20            | Create audit branch + write this file     | `docs/issue-audit-2026-10-19-loop32`                  | created from `e7698d9`                                                                                                                      |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–31 → no-drift rule applies.

Remediation partition (re-derived independently this run via Python over `.omo-loop/open_issues.json`):

- 24 missing priority only: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- 1 missing category only: `670` (already carries `P3` + non-contract `DX-engineer`)
- 11 missing both: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- 10 multi-category: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- 3 multi-category + missing priority: `305, 584, 713`

Union check: missing-priority = 24 ∪ {305, 584, 713} = **27** ✓; missing-category = {670} ∪ 11 = **12** ✓; multi-category = 10 ∪ {305, 584, 713} = **13** ✓ — identical to loops 7–31 §1.

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=enhancement"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–32 no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–31.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters (re-derived)

Clusters unchanged from loops 17–31 (static issue set, no new issues this run; D1/D2/D3/D4/D5/D7 bodies re-extracted first-hand this run via `jq`):

| ID  | Members                 | Canonical | Disposition                                                                                   |
| --- | ----------------------- | --------- | --------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | Close 480 as duplicate of P0 (both Redis RL) — bodies compared first-hand (identical problem) |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670 (P3, precise scope: iterate.yml lines 72/342)                           |
| D3  | 628, 501, 724           | **501**   | Close 628/724 as duplicates (Playwright E2E; 11 specs now exist)                              |
| D4  | 631, 725, 754           | **725**   | Close 631/754 as overlapping API test issues                                                  |
| D5  | 720, 748                | **748**   | Both stale — `.nvmrc` now `22.14.0` (re-verified this run)                                    |
| D6  | 785, 789                | —         | Not duplicates; **789 promoted (loop 26)**; 785 stale (re-verified: no `next` dep)            |
| D7  | 551, 550, 549, 581      | **581**   | Testing-infra umbrella; children already done (re-verified)                                   |

STEP 3 consolidation of D2/D3/D4/D7 small issues into their canonicals also requires issue writes.

**Closing/consolidating requires issue write → 403 → blocked (§4). D1 close was actively re-attempted this run** (`PATCH /issues/480 state=closed`) → **403** `Resource not accessible by integration`; #480 confirmed still OPEN after the probe.

---

## §3 STEP 4 — Repair Mode

### Selection

- P0 exists: **#496** → selected (contract: highest-priority issue).
- Re-verified code-complete **first-hand this run**: `npx vitest run packages/api/src/rate-limiter.test.ts packages/api/src/distributed-rate-limiter.test.ts packages/api/src/distributed-rate-limiter-sync.test.ts` → **3 files, 98/98 tests passed** (1.16s) at `e7698d9`. Acceptance criteria: env-var config (`.env.example:124,128-133` — `REDIS_URL`, 6× `RATE_LIMIT_*`) ✓, documentation (`docs/redis-setup.md`) ✓, graceful fallback ✓, unit tests ✓ (98/98). Repair action = administrative close → probe → **403** → FAIL-SAFE (documented here).
- **Full P0/P1 set re-verified (file-presence first-hand this run):**

| Issue | Claim                               | First-hand evidence at `e7698d9`                                                            |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 rate-limiter tests green (this run)** + env/docs/fallback evidence above            |
| #581  | Testing-infra umbrella (P1)         | Children #551/#550/#549/#501/#500 all verified present (rows below) → umbrella satisfied    |
| #551  | k8s router tests (P1)               | `packages/api/src/router/k8s-router.test.ts` exists; in green 2207 suite                    |
| #550  | apps/nextjs in coverage (P1)        | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}`                                 |
| #549  | packages/auth tests (P1)            | test files present under `packages/auth` (0%-claim stale)                                   |
| #515  | CSRF protection (P1)                | `csrfProtection` middleware at `packages/api/src/trpc.ts:104` (+ apps/nextjs `lib/csrf.ts`) |
| #501  | Playwright E2E (P1)                 | 11 `.spec.ts` + `fixtures.ts` in `tests/e2e/`                                               |
| #500  | Clerk auth flow tests (P1)          | `apps/nextjs/src/utils/clerk.test.ts` + `packages/auth/clerk.test.ts`                       |
| #498  | Role-based admin RBAC (P1)          | `requireRole`/`createRoleBasedProcedure` at `trpc.ts:349,422`; `adminProcedure` at `:331`   |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification                                   |

- **#708 — partially implemented (carried, verdict unchanged)**: `@next/bundle-analyzer` present, size-limit budgets green this run; Turbopack build does not execute the webpack-config analyzer hook → no HTML report. **#751 — partially implemented / measurement-blocked**: `lazy()` splitting present; historical ≥10% baseline DoD still open.
- **#634 — stale (claim disproven, loop-31 verdict re-confirmed)**: `tooling/typescript-config/base.json:9` → `"strict": true`; all workspace tsconfigs extend base; `pnpm typecheck` gate green (9/9).
- **#630 — partial (re-confirmed)**: `.husky/pre-commit` = `pnpm typecheck` + `pnpm test` + `pnpm check-deps` + `pnpm lint-staged` → AC1/AC2 met; AC3 (<30s) violated (full test gate = 45.2s this run).
- **#755** remains rejected as a repair target (carried: self-declared Low priority; ACs need live-DB `EXPLAIN ANALYZE` — not deterministic here). **#636** rejected (carried: ISR intentionally not used — user-data isolation design).
- Stale per §0.10 table → administrative closes all 403-blocked: #697, #578, #785, #719, #720, #748, #635, #722, #721, #664, #731, #789, #501/#628/#724, #634.
- **#728** (per payload = P1) requires new files under `.github/workflows/` → **platform-blocked** (§4 `workflows` permission — now first-hand proven this run).
- Genuinely open, non-critical (left per contract minimal/atomic rule): **#494** (no `domain/` dir), **#723** (28% `"use client"` — matches loops 28–31), **#502** (only 2 workflows), **#650** (inline prompt at `on-pull.yml:76`), **D2** (`iterate.yml:72,342` `npm ci || true`) — all workflow-file work → platform-blocked; **#751/#708** remainder; **#630** remainder; feature-grade items (#749, #668, …).
- D2 workflow fix: pre-staged patch `docs/patches/fix-pnpm-consistency-iterate-744.patch` **verified CLEAN APPLY this run** — maintainer can land it with one command (§4).
- Net: **no safely-implementable issue remains** (all P0/P1 implemented or platform-blocked; remaining candidates are workflow-file-blocked, measurement-baseline-blocked, or intentionally-designed); this loop's deliverable is verification evidence + the **workflow-push first-hand proof** + **pnpm-patch clean-apply proof** + **zero-job anomaly quantification** + this audit (established loop 17–31 pattern).

### Stale-set spot re-confirmations (this run at `e7698d9`)

| Issue          | Claim                                   | Verdict (loop-32, first-hand)                                    |
| -------------- | --------------------------------------- | ---------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter          | **Re-verified: 98/98 tests green (this run)**                    |
| #634           | Strict TS may not be enabled            | Stale — `strict:true` at base.json:9; typecheck 9/9 green        |
| #630           | Pre-commit lacks typecheck/tests        | Partial — present, but full-suite 45.2s violates <30s AC         |
| #708/#751      | Bundle analyzer / code splitting        | Partially implemented (budgets green; Turbopack/DoD gaps remain) |
| #697           | Corrupted text in docs                  | Stale — zero corruption markers outside audit docs               |
| #578           | Duplicate health check endpoint         | Stale — exactly one health route                                 |
| #785           | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                             |
| #720/#748      | `.nvmrc` missing / invalid              | Stale — file exists (`22.14.0`)                                  |
| #719           | Missing root TypeScript config          | Stale — root tsconfig extends base                               |
| #722           | No env validation at startup            | Stale — `apps/nextjs/src/env.mjs` (16 zod lines)                 |
| #721           | No authorization beyond authentication  | Stale — `adminProcedure` at `trpc.ts:331`                        |
| #635           | No developer onboarding guide           | Stale — `docs/ONBOARDING.md` exists                              |
| #664           | console.\* in db/stripe                 | Stale — 0 runtime `console.*` matches                            |
| #731           | API docs manually maintained            | Stale — `openapi.ts` + `api/docs/route.ts`                       |
| #501/#628/#724 | Missing Playwright E2E                  | Stale — 11 specs in `tests/e2e/`                                 |
| #789           | React peerDependencies missing          | Stale — `{next, react, react-dom}` peerDeps present              |

Closing any of these requires issue write → **403 → blocked (§4)**.

---

## §4 Blocked Write Paths (re-confirmed this run, first-hand)

| Surface                             | Operation                           | Result                                                                                                                                                                                                    |
| ----------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issues (label)                      | `POST .../issues/789/labels`        | **403** `Resource not accessible by integration` (re-probed this run)                                                                                                                                     |
| Issues (close, REST)                | `PATCH .../issues/480 state=closed` | **403** (re-probed; #480 stayed OPEN)                                                                                                                                                                     |
| Issues (comment, GraphQL)           | `gh issue comment 496 --body …`     | **403** GraphQL `addComment` (re-probed this run)                                                                                                                                                         |
| Issues (create)                     | —                                   | **403** (carried from loops 19–31; same token/scope class)                                                                                                                                                |
| CI re-run / dispatch                | `gh run rerun` / `gh workflow run`  | **403** (carried; `actions: read` only)                                                                                                                                                                   |
| **Workflow-file push**              | `git push` (`.github/workflows/*`)  | **FIRST-HAND PROVEN this run**: `refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml without workflows permission` (probe commit reverted; remote branch unchanged) |
| Branch push (non-WF)                | `git push` (normal files)           | **Allowed** (this audit branch is the proof)                                                                                                                                                              |
| PR create / label / comment / merge | —                                   | **Allowed** (loops 26–31 merged 13+ PRs; PR labels applied loop 28+)                                                                                                                                      |

Root cause (unchanged, carried from loops 19–31; re-verified first-hand this run):

1. **Token scope**: `.github/workflows/on-pull.yml:9-14` permissions block declares `contents: write`, `pull-requests: write`, `actions: read`, `repository-projects: write`, `id-token: write` — **no `issues: write`** → no issue-side write scopes, no CI re-runs. Note: `iterate.yml:13` declares `issues: write`, but the loop runs under `on-pull.yml`, which does not.
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` cannot create/update any file under `.github/workflows/` without the app's `workflows` permission — blocks shipping the D2 fix from inside the loop. **Now proven with the exact platform rejection message this run** (previously carried).

**Suggested maintainer action (unchanged, still highest-leverage):** land `docs/patches/on-pull-issues-write-permission.patch` with a human account / `workflows: write` token — one line — then every future loop can execute the §1 label matrix, §2/3 closes, and administrative closure of the §3 stale set (including **#496**, verified code-complete, and **#634**, claim disproven). Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (**verified clean-apply this run**) — closes #670 and cluster D2. Third: for #751's ≥10% DoD, record a **historical bundle baseline** and/or wire a Turbopack-compatible chunk report for #708's HTML analysis. Also worth maintainer attention: **four zero-job docs-branch CI failures** (39138816789, 39171487973, 39179140997, 39182275421 — loop-31's branch failed twice) — investigate the zero-job failure mode (it does not block merges but pollutes run history); and the agent harness's `explore` model id (`opencode/muse-spark-1.3-contributor-free`) no longer resolves at the provider — update `.opencode/oh-my-opencode.json`/`opencode.json` model registry. With loop-26–31 promotions included, an `issues: write`-enabled loop could immediately close **50+** already-verified issues.

---

## §5 Gates (loop 32)

| Gate         | Command                                      | Result                                              |
| ------------ | -------------------------------------------- | --------------------------------------------------- |
| Install      | `pnpm install --frozen-lockfile`             | Done in 7.6s                                        |
| Typecheck    | `pnpm typecheck`                             | **9/9 successful**, 13.7s                           |
| Lint         | `pnpm lint`                                  | **9/9 successful**, 48.0s (**zero warning lines**)  |
| Test         | `pnpm test`                                  | **2207/2207 passed (151 files)**, 45.2s             |
| Build        | `pnpm build`                                 | **1/1 successful**, 36.7s                           |
| RL tests     | `npx vitest run` (3 rate-limiter test files) | **98/98 passed**, 1.16s (first-hand #496 proof)     |
| Size budgets | `pnpm size:check`                            | **green**: CSS 20.13/120, Media 260.03/300 kB       |
| Patches      | `git apply --check` (both docs/patches/\*)   | **CLEAN APPLY** (both)                              |
| Ship         | docs-only PR (this audit)                    | No runtime code touched; last-known-green re-proven |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§4). All §3/§4 evidence collected first-hand this run.

---

## §6 Final State

- **waiting for human review** — PR with this audit (labeled `docs` + `P2` per contract — PR-side label write is available even though issue-side is not).
- Unblocked only by a maintainer token/account with `workflows: write` (land the §4 one-line `on-pull.yml` patch first), after which `issues: write`-enabled loops can execute §1 labels, §2/3 closes (D1's #480 close re-attempted and 403-blocked this run), administrative closure of #496 (verified code-complete) and #634 (claim disproven), and closure of the §3 stale set. Second: `actions: write` would let loops investigate/re-run the zero-job docs-branch failures (now 4 occurrences).
- Loop-32 delta vs. loop 31: **zero open PRs at entry** (loop-31's PR #1583 merged to `e7698d9`); **workflow-file push block elevated from carried to first-hand proof** (exact platform rejection message captured; probe commit safely reverted); **both maintainer patches verified clean-apply** (loop 31 checked only one); **zero-job CI anomaly quantified at 4 occurrences** with loop-31's own branch failing twice; label matrix re-derived 33/49 with exact-match no-drift confirmation; full P0/P1 set re-verified; full green baseline re-proven (typecheck/lint/test/build/RL/size).
- No destructive actions taken; no force-pushes; issue-side writes remain untouched (403; #480 confirmed OPEN after close probe); workflow probe commit reverted before any remote ref update. Only the docs audit branch was created this run.
