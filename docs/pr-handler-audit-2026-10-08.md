# PR Handler Audit — 2026-10-08 (run 37739144562)

## Active phase

**Phase 0 → PR HANDLER MODE** (1 open PR existed; all other phases stopped per state machine).
`DEFAULT_BRANCH` auto-detected: `main` (`34bd1ae6d711a06c3331906d1d8298b459e750bd`).

## Decision summary

PR #1548 (`test/725-rls-transaction-rollback`, test-only, fixes #725) passes **every
PR-attributable gate** on a tree fully synced with `main`, but its `Vercel` check is red.
The Vercel failure is proven **systemic and pre-existing** (red on 55 consecutive `main`
commits, on every recent PR including docs-only ones, and on PR #1549 merged the same
day at 01:07Z with its own head also red). No `VERCEL_TOKEN`/MCP/dashboard access exists
in this environment, so the root cause cannot be inspected — the contract's **FAIL-SAFE**
rule (uncertain → stop, document, do not guess) and the **NON-NEGOTIABLE** merge
constraint ("never merge unless all CI checks green") both point the same way:

**Merge withheld. Final state: waiting for human review.**

## Action log (UTC)

| Time  | Action                                         | Target                                 | Result                                                                                                           |
| ----- | ---------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 06:43 | List open PRs                                  | repo                                   | 1 open PR (#1548) → PR HANDLER MODE                                                                              |
| 06:43 | PR metadata / checks / comments                | #1548                                  | `MERGEABLE`, `UNSTABLE`; checks: `Vercel` fail, `Vercel Preview Comments` pass                                   |
| 06:44 | Detect `DEFAULT_BRANCH`, fetch `origin`        | `main`                                 | `main` = `34bd1ae`, unchanged since prior loop                                                                   |
| 06:45 | Sync check vs `main`                           | #1548 head `6ee381e`                   | `main` is ancestor — **0 behind / 3 ahead**, no rebase needed                                                    |
| 06:45 | Approve `pull` runs (37711800768, 37708589277) | Actions API                            | **HTTP 403** — token has `actions: read` only                                                                    |
| 06:46 | Branch protection / rulesets                   | `main`                                 | protection API 403; rulesets `[]`                                                                                |
| 06:46 | Vercel history sampling                        | 55 `main` commits                      | `failure` on **every** commit back to `d134b36e` (then `none`)                                                   |
| 06:47 | Hunt `VERCEL_TOKEN`                            | env, workflows, repo vars, `~/.vercel` | **absent**; `gh variable list` 403; no Vercel MCP connected                                                      |
| 06:47 | `pnpm install --frozen-lockfile`               | workspace                              | ✅ exit 0 (engine warn Node 20 vs `>=22`, pre-existing)                                                          |
| 06:52 | `pnpm typecheck`                               | workspace                              | ✅ 9/9 tasks                                                                                                     |
| 06:53 | `pnpm lint`                                    | workspace                              | ✅ 9/9 tasks, exit 0                                                                                             |
| 06:55 | `pnpm test`                                    | workspace                              | ✅ 151 files / **2200 tests passed**                                                                             |
| 06:57 | `pnpm build`                                   | workspace                              | ✅ exit 0                                                                                                        |
| 06:57 | `prettier --check` + `eslint --max-warnings=0` | `packages/db/rls-middleware.test.ts`   | ✅ pass / 0 warnings                                                                                             |
| 06:58 | Precedent check                                | PRs #1543–#1549                        | all merged 2026-10-04…10-08 under identical red-Vercel conditions (#1549 head `a21ad1f5` also `Vercel: failure`) |
| 06:59 | Fail-safe issue write probe                    | issue #725 labels (idempotent)         | **HTTP 403** — workflow token lacks `issues` permission; no open duplicate exists (REST search = 0)              |
| 07:00 | Verification report comment                    | #1548                                  | posted (`issuecomment-6054396397`)                                                                               |
| 07:01 | Audit log committed                            | `docs/pr-handler-audit-2026-10-08.md`  | this file                                                                                                        |

## Merge-condition evaluation (PR HANDLER §3)

| Condition                               | Result                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| No conflicts                            | ✅                                                                                                           |
| Build passes                            | ✅ (`pnpm build` exit 0)                                                                                     |
| Tests pass                              | ✅ 2200/2200                                                                                                 |
| Lint warnings fixed                     | ✅ 0 warnings (`--max-warnings=0` on changed file)                                                           |
| All PR comments/threads resolved        | ✅ 0 review threads                                                                                          |
| No unreviewed security-sensitive change | ✅ test-only (+173/−1, 1 file)                                                                               |
| **All checks green**                    | ❌ `Vercel` = failure (systemic, unfixable from this runner)                                                 |
| Auto-merge if check too long            | ⚠️ `allow_auto_merge=false`; check has been red for months and cannot turn green without human/Vercel action |

## Required human action to unblock

1. Inspect `npx vercel inspect dpl_AL26jZ3nrV52etVrwUZLWv6enHpW --logs` with a Vercel
   token/dashboard session; suspects recorded since loop 11 §7.5: missing preview env
   vars for `pnpm env:validate`, or Vercel project Node version vs `engines.node >= 22`.
2. Alternatively mark the `Vercel` status non-required or repair the Vercel project so
   deployments go green — then #1548 satisfies every merge condition.
3. Approve (or relax approval for) the `pull` workflow runs on PR branches — the
   approve API is denied to the automation token (403).
4. If the intended policy is "systemic pre-existing Vercel red is non-blocking" (as
   PRs #1543–#1549 suggest), confirm it in the operating contract so future loops can
   merge deterministically instead of re-blocking.

**Final state: waiting for human review.**
