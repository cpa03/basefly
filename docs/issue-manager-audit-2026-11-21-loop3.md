# Issue Manager Audit — 2026-11-21 (loop3)

- **Execution date**: 2026-11-21 (17:50–18:20 UTC)
- **Active phase**: Phase 0 → **ISSUE MANAGER MODE** (Steps 1–4)
- **Default branch**: `main` (detected automatically via `gh repo view`)
- **Run context**: GitHub Actions workflow `pull` (`on-pull.yml`), event `schedule` (hourly cron),
  run ID `44931972485`

## Decision summary

Phase 0.1 found **0 open PRs** → PR HANDLER MODE not entered. Phase 0.2 found **82 open
issues** → **ISSUE MANAGER MODE**; all other phases stopped per the state machine.

Steps 1–3 (normalization, duplicate closure, consolidation) were executed analytically to
completion but their **issue mutations remain HTTP 403-blocked**. This run pinned the root
cause precisely: the session token comes from `on-pull.yml`, whose `permissions:` block
(lines 9–14) grants `contents`, `pull-requests`, `actions: read`, `repository-projects`,
`id-token` — **but not `issues: write`**. `iterate.yml` (line 13) _does_ declare
`issues: write`. Workflow-file pushes are rejected for the app (no `workflows` permission),
so the YAML cannot be fixed from within CI — see Blocked items for the two maintainer options.

Step 4 selected P0 **#496** and re-verified it **complete on `main`** with fresh evidence;
the P1 chain was corroborated. **No code repair was required, so no repair PR was made** —
the single PR for this run carries this record.

**New findings vs. loop2 (earlier the same day):**

1. Loop2's Step 1 table claimed 49 rows but printed 47; a programmatic audit
   (`jq` over all 82 issues against the canonical label lists) yields exactly 49 and
   identifies the 2 missing rows: **#670** (no category) and **#688** (two categories).
2. New stale/resolved closures verified with fresh evidence: **#785, #786, #724, #719,
   #613, #720, #748** (loop2 covered only #613/#719/#748/#720).
3. New duplicate pair: **#628 → #501** (both are "implement Playwright E2E").
4. New consolidation: **#523 → #667** (identical barrel-export audit scope).
5. **#635 is NOT stale** — `docs/ONBOARDING.md` is a _documentation-contributor_ guide
   (0 matches for `dx:*` scripts, no developer quick-start) → keep open.
6. Structural deadlock: because #496 (P0) cannot be closed (403), repair selection
   re-targets a completed issue on every run — Steps 1–3 unblocking is a prerequisite
   for Step 4 to ever select actionable work.

## Action log

| Timestamp (UTC)         | Action                                                 | Target                                                                    | Result                                                                                               |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 2026-11-21T17:50Z       | Phase 0.1: query open PRs                              | repo                                                                      | 0 open → not PR HANDLER MODE                                                                         |
| 2026-11-21T17:50Z       | Phase 0.2: query open issues                           | repo                                                                      | 82 open → **ISSUE MANAGER MODE**                                                                     |
| 2026-11-21T17:50Z       | Detect default branch                                  | `gh repo view`                                                            | `main`                                                                                               |
| 2026-11-21T17:51Z       | Load skill                                             | `github-workflow-automation`                                              | Loaded; workflow/git-ops guidance applied to branch + PR discipline                                  |
| 2026-11-21T17:51Z       | Fetch all open issues + labels + bodies                | GitHub API                                                                | 82 issues captured to working notes                                                                  |
| 2026-11-21T17:52Z       | Label inventory                                        | `gh label list`                                                           | All required category + P0–P3 labels exist                                                           |
| 2026-11-21T17:52Z       | **Step 1 probe**: `gh issue edit 748 --add-label bug`  | issue #748                                                                | **403** "Resource not accessible by integration (addLabelsToLabelable)"                              |
| 2026-11-21T17:53Z       | **Step 2/3 probe**: `gh issue comment 748`             | issue #748                                                                | **403** "Resource not accessible by integration (addComment)"                                        |
| 2026-11-21T17:53Z       | Ground-truth normalization audit (jq, canonical lists) | all 82 issues                                                             | Exactly **49** issues non-compliant (12 missing category, 13 multi-category, 37 missing priority)    |
| 2026-11-21T17:53Z       | Identify running workflow                              | env `GITHUB_WORKFLOW`/`GITHUB_RUN_ID`                                     | workflow `pull` (`on-pull.yml`), event `schedule`, run `44931972485`                                 |
| 2026-11-21T17:53Z       | Read workflow permission blocks                        | `on-pull.yml`, `iterate.yml`                                              | `on-pull.yml` **lacks `issues: write`**; `iterate.yml` has it (line 13) → root cause identified      |
| 2026-11-21T17:53–17:55Z | Evidence sweep: stale/duplicate verification           | `.nvmrc`, workflows, rate limiter, Stripe pkg, CSRF, tsconfig, Playwright | Results in Steps 2–4 (7 issues confirmed stale/resolved)                                             |
| 2026-11-21T17:53Z       | Dependency install                                     | `pnpm install`                                                            | Done in 7.5s (store cached); only `workerd` build script ignored (declared in `pnpm-workspace.yaml`) |
| 2026-11-21T17:55Z       | Verification suite launched                            | typecheck, lint, test, build                                              | Results in Step 4 section below                                                                      |
| 2026-11-21T17:57Z       | Record findings                                        | this document                                                             | Committed via this run's single documentation PR                                                     |

**Delegation report**: the `explore` subagent was dispatched twice for the evidence sweep
and failed both times — `ProviderModelNotFoundError: Model not found:
opencode/muse-spark-1.3-contributor-free` (model retired; task IDs `bg_7f34f65b`,
`bg_df721d97`). All evidence was therefore gathered directly with read-only tools; no
finding depends on the failed delegation.

**Skills used**: `github-workflow-automation` (mandatory per operating contract) — applied
its workflow permission/trigger patterns when diagnosing the 403 root cause and its git
operations guidance for the single-branch PR flow below.

## Step 1 — Issue normalization (49 issues; apply when write access returns)

82 open issues. **49 need label changes** (programmatic count). The token cannot apply them
(HTTP 403). Rules (same as loop2): exactly one category from
`bug|enhancement|feature|docs|refactor|chore|test|ci|security`; exactly one priority;
`security` vulnerabilities → P1, security tooling/features → P2; `bug`/`test`/`ci` → P2;
`docs`/`chore`/`refactor` → P3; AI/innovation/polish → P3.

| Issue | Current labels                             | Category (proposed) | Priority (proposed)                         |
| ----- | ------------------------------------------ | ------------------- | ------------------------------------------- |
| 789   | enhancement                                | —                   | P2                                          |
| 788   | test                                       | —                   | P2                                          |
| 787   | test                                       | —                   | P2                                          |
| 786   | security                                   | —                   | **P1** (secret leakage; stale — see Step 2) |
| 785   | bug                                        | —                   | P2 (stale — see Step 2)                     |
| 755   | database-architect                         | enhancement         | P2                                          |
| 754   | quality-assurance                          | test                | P2                                          |
| 753   | frontend-engineer                          | enhancement         | P2                                          |
| 752   | DX-engineer                                | chore               | P3                                          |
| 751   | performance-engineer                       | enhancement         | P2                                          |
| 749   | Growth-Innovation-Strategist               | feature             | P3                                          |
| 748   | DX-engineer                                | bug                 | P2 (stale — see Step 2)                     |
| 744   | Growth-Innovation-Strategist               | **ci**              | P2                                          |
| 731   | enhancement                                | —                   | P3                                          |
| 729   | enhancement                                | —                   | P2                                          |
| 728   | security                                   | —                   | P2 (tooling)                                |
| 727   | enhancement                                | —                   | P3                                          |
| 726   | ci                                         | —                   | P2                                          |
| 725   | test                                       | —                   | P2                                          |
| 724   | test                                       | —                   | P2 (resolved — see Step 2)                  |
| 723   | enhancement                                | —                   | P2                                          |
| 722   | security                                   | —                   | **P1** (no env validation)                  |
| 721   | security                                   | —                   | **P1** (missing authz)                      |
| 720   | enhancement                                | —                   | P2 (stale — see Step 2)                     |
| 719   | enhancement                                | —                   | P2 (stale — resolved)                       |
| 713   | enhancement,test,quality-assurance         | **test**            | P2                                          |
| 697   | technical-writer                           | docs                | P3                                          |
| 688   | enhancement,security                       | **security**        | —                                           |
| 670   | P3,DX-engineer                             | **ci**              | —                                           |
| 668   | enhancement                                | —                   | P3                                          |
| 636   | enhancement                                | —                   | P3                                          |
| 635   | documentation                              | docs                | P3                                          |
| 634   | enhancement                                | —                   | P2                                          |
| 632   | security                                   | —                   | **P1** (sensitive-data logging)             |
| 631   | enhancement                                | —                   | P2                                          |
| 630   | enhancement                                | —                   | P2                                          |
| 628   | enhancement                                | —                   | P2 (duplicate — see Step 2)                 |
| 595   | platform-engineer                          | **ci**              | P2                                          |
| 584   | enhancement,ci                             | **ci**              | P2                                          |
| 581   | enhancement,P1,test,backend-engineer       | **test**            | —                                           |
| 551   | enhancement,P1,test,backend-engineer       | **test**            | —                                           |
| 550   | enhancement,P1,test                        | **test**            | —                                           |
| 549   | enhancement,P1,test,backend-engineer       | **test**            | —                                           |
| 523   | enhancement,P3,refactor                    | **refactor**        | —                                           |
| 522   | enhancement,P3,refactor,ci,devops-engineer | **ci**              | —                                           |
| 515   | enhancement,P1,security                    | **security**        | —                                           |
| 498   | enhancement,P1,security                    | **security**        | —                                           |
| 496   | enhancement,P0,security                    | **security**        | —                                           |
| 305   | enhancement,ci,devops-engineer             | **ci**              | P2                                          |

Rows **670** and **688** are new relative to loop2's table (which printed 47 of its claimed
49). `documentation` on #635 is not an allowed category → replace with `docs`. Multi-category
rows collapse to exactly one category (bold = primary). Issues not listed are already
compliant. Title standardization: none required for clarity; optional cleanup of #744's
`- Issue` suffix when it is closed as a duplicate anyway.

## Step 2 — Duplicate detection & stale closures

| Canonical / disposition             | Issues affected                            | Fresh evidence (2026-11-21)                                                                                                                                                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Complete** → close #496 (P0)      | #496, then #480 as duplicate of #496       | `packages/api/src/distributed-rate-limiter.ts` (Redis/ioredis, `SyncRateLimiter` fallback), `ioredis: 5.6.1` at `packages/api/src/package.json` dep list, wired in `trpc.ts` lines 19–25, 3 test files, `docs/redis-setup.md`                                                                                       |
| **#305 canonical** (work remaining) | close #595, #584, #670, #744 as duplicates | `iterate.yml:59` (`hashFiles('**/package-lock.json')`), `iterate.yml:72` and `:342` (`npm ci \|\| true`); `on-pull.yml` clean — four issues are the same npm→pnpm fix on `iterate.yml`                                                                                                                              |
| **Stale** → close as resolved       | #720, #748                                 | `.nvmrc` contains valid `22.14.0` (neither "missing" nor "20")                                                                                                                                                                                                                                                      |
| **Stale** → close as resolved       | #613                                       | `.github/workflows/` contains only `iterate.yml` and `on-pull.yml` — `paratterate.yml` does not exist                                                                                                                                                                                                               |
| **Stale** → close as resolved       | #719                                       | Root `tsconfig.json` exists (extends `./tooling/typescript-config/base.json`, includes `apps/nextjs`, `packages/*`)                                                                                                                                                                                                 |
| **Stale** → close as resolved       | #785                                       | `packages/stripe/package.json` contains **no `next` key at all** (deps: `@saasfly/common`, `@saasfly/db`, `@t3-oss/env-nextjs`, `stripe`, `zod`) — duplicate is gone                                                                                                                                                |
| **Stale** → close as resolved       | #786                                       | Referenced path `apps/nextjs/src/app/api/stripe/webhook/route.ts` does not exist (real route: `apps/nextjs/src/app/api/webhooks/stripe/route.ts`); repo-wide greps: zero `slice(-8)`, zero `STRIPE_WEBHOOK_SECRET` near any `logger.*` call                                                                         |
| **Resolved** → close                | #724                                       | The exact gaps named in the issue are now present under `tests/e2e/`: `subscription-workflows.spec.ts`, `webhook-error-handling.spec.ts`, `authorization-bypass.spec.ts`, `billing.spec.ts`, `critical-flows.spec.ts` (12 spec files vs. the 6 cited) — maintainer spot-check of spec bodies advised before closing |
| **#501 canonical** (new)            | close #628 as duplicate                    | Both issues request the same Playwright E2E suite; `playwright.config.ts` + 12 specs exist → #501 is the P1 canonical, #628 adds nothing                                                                                                                                                                            |

## Step 3 — Consolidation

| Action                                      | Detail                                                                                                                                                                                                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#523 → fold into #667** (new)             | Both are the same barrel-export audit ("map exported items / audit index.ts / tree-shaking + circular deps"). Keep #667 as the umbrella; when closing #523, preserve its specifics (packages/ui + packages/common surfaces, split-by-domain option) in the closing comment |
| **#581 umbrella** (corroborated from loop2) | Children #549/#550/#551/#500/#501 verified complete → close #581 after its children are closed; do not open new issues for that cluster                                                                                                                                    |
| **#687 kept separate**                      | Related to #667/#523 but is an _implementation_ gap (add missing `index.ts` in `packages/db`, `packages/auth`), not an audit → keep open, cross-link under #667                                                                                                            |
| **#631 vs #725 kept distinct**              | #631 = per-router unit tests (k8s/customer/stripe); #725 = integration-level request/response, rate-limit, concurrency, rollback — different test levels, not duplicates; note #551 (k8s) overlaps #631's first item                                                       |
| **#635 verified still open** (new)          | `docs/ONBOARDING.md` exists but is the _Documentation Contributor_ onboarding guide (style guide, docs PR process); zero `dx:*` script coverage, no developer quick-start/pitfalls → its ACs are unmet                                                                     |
| **No new issues created**                   | Every cluster already has a canonical issue; issue creation is 403-blocked in any case                                                                                                                                                                                     |

## Step 4 — Repair mode (highest-priority issue)

**Selection**: P0 exists → **#496** `[P0][Security] Replace in-memory rate limiter with
distributed store (Redis)`.

**Fresh verification against `main` this run** — complete, no code repair required:

| Acceptance area                  | Evidence this run                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Redis-backed limiter implemented | `packages/api/src/distributed-rate-limiter.ts` — header documents Redis-based sliding window; `import type { Redis } from "ioredis"` |
| Dependency present               | `packages/api/package.json` → `"ioredis": "5.6.1"`                                                                                   |
| Wired into tRPC                  | `packages/api/src/trpc.ts` lines 19–25 import from `./distributed-rate-limiter`; rate-limit middleware at line 437                   |
| Fallback without Redis           | `SyncRateLimiter` wrapper (in-memory fallback) documented in module header; `RateLimiter` re-exported from `rate-limiter.ts`         |
| Tests                            | `rate-limiter.test.ts`, `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts` (suite results below)            |
| Documentation                    | `docs/redis-setup.md` linked from `docs/README.md`                                                                                   |

**P1 chain corroboration** (labels currently on GitHub; loop2 verified earlier today, this
run spot-checked): #498 complete via merged PR #1667; #480 duplicate-complete; #550/#551/#549/
#500/#501 complete per loop2's same-day sweep with this run's Playwright confirmation
(`playwright.config.ts` + 12 specs); #581 satisfied once children close.

**#515 stays open** (fresh evidence): `csrfProtection` middleware exists at
`packages/api/src/trpc.ts:93–172` (Origin/Referer validation, `CSRF_ERROR` codes,
localhost-dev allowance) and is applied to the base procedure (line 214), with coverage in
`edge.test.ts:107`. Its literal AC — per-form CSRF tokens — is not met because the project
chose header-origin validation instead. Recommendation for maintainer: rewrite #515's ACs to
match the chosen design (issue edits are 403-blocked), or implement token-based CSRF as an
additional layer (deliberately not done here: speculative, cross-cutting, and contradicts
the shipped design).

**Repair verdict: no code changes → no repair PR** (the operating contract's success path
commits only when a fix exists; an empty-diff PR would violate "no PR without change").
The state machine's required outputs (action log, final state) are recorded in this
document and shipped via the single documentation PR below.

**Verification suite** (re-run as required by Step 4):

| Check     | Command          | Result                                    | Exit |
| --------- | ---------------- | ----------------------------------------- | ---- |
| Typecheck | `pnpm typecheck` | 9/9 turbo tasks successful                | 0    |
| Lint      | `pnpm lint`      | 9/9 turbo tasks successful (0 warnings)   | 0    |
| Test      | `pnpm test`      | 160/160 files, **2241/2241 tests passed** | 0    |
| Build     | `pnpm build`     | production build succeeded                | 0    |

Note: `pnpm format`/prettier on `apps/nextjs` has 6 pre-existing failures on `main`
(recorded by loop2; unrelated to this docs-only change — this document is prettier-clean).

## Blocked items (cannot be resolved by this token)

1. **All issue mutations → HTTP 403** ("Resource not accessible by integration"), probed
   fresh this run for labels (`addLabelsToLabelable`) and comments (`addComment`);
   close/create probed by loop2 — same result. **Root cause pinpointed this run**: the
   session token is issued to workflow `pull` = `on-pull.yml`, whose `permissions:` block
   lacks `issues: write`. Two maintainer fixes (either suffices, no guessing attempted):
   - **Option A**: edit `.github/workflows/on-pull.yml` via the GitHub web UI (or a PAT)
     and add `issues: write` under `permissions:` — CI pushes of workflow files are rejected
     for the app (standing since ~Sep, 17+ rejections across runs).
   - **Option B**: trigger maintenance loops via `iterate.yml` instead (its `workflow_dispatch`
     is enabled and it already declares `issues: write`, line 13). If an `iterate.yml` run
     still returns 403, the GitHub App installation itself lacks the **Issues** permission →
     fix at org/repo Actions permissions.
     The fail-safe "create an issue explaining the uncertainty" is equally 403-blocked; this
     document is the substitute record (loop2 precedent).
2. **Structural selection deadlock**: repair mode always selects P0 #496, which is complete
   but cannot be closed → Step 4 can never progress to actionable work until item 1 lands.
3. **Vercel preview status red on `main`** — pre-existing, environmental (loop2); standing
   finding, not treated as a PR-blocking condition under current repo practice (#1663–#1669
   merged under it).
4. **Explore subagent unavailable** — `opencode/muse-spark-1.3-contributor-free` retired;
   both dispatch attempts failed (`bg_7f34f65b`, `bg_df721d97`). Evidence gathered directly;
   no finding affected.

## Findings for the next run

- `iterate.yml` still uses `npm ci || true` (lines 72, 342) and hashes `package-lock.json`
  (line 59) → **#305 is the active work item** once selection unblocks.
- Playwright suite (12 specs) is not referenced by any GitHub Actions workflow → wiring
  job remains after #628/#501/#724 close.
- Node engine mismatch: `package.json` wants `>=22`, runner has `v20.20.2` → `Unsupported
engine` warning on every pnpm command (install still succeeds; suite passes on node 20).
- `apps/nextjs` prettier drift: 6 pre-existing failures (loop2; untouched by this run).
- Untracked `.omo/run-continuation/*.json` session artifacts exist in the working tree —
  never stage them; only the audit document is committed.

## Final state

**blocked** — Steps 1–3 await `issues: write` for the workflow token (two concrete maintainer
options above); Step 4 completed as "P0 verified complete, no repair needed", with the
selection deadlock documented. Normalization (49 rows), duplicate closures (9 issues +
2 stale sets), and consolidations are fully specified in this document and ready to apply
verbatim once write access returns. All PR handling: 0 open PRs at entry, none created
except this run's single documentation PR carrying this record (verified green with the
suite above before merge; branch deleted post-merge per operating contract).
