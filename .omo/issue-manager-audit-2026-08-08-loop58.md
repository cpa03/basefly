# Issue Manager Audit Report — 2026-08-08 (Loop 58)

**Phase**: ISSUE MANAGER MODE (Phase 0.2)
**Performed by**: Sisyphus (Autonomous Agent)
**Status**: Phase 0 entry check found **0 open PRs** → **82 open issues** →
ISSUE MANAGER MODE. Steps 1-3 (label normalization, duplicate closure,
consolidation) remain **blocked** by token scope — re-probed first-hand this
session: `addLabelsToLabelable` → 403, `closeIssue` → 403, `addComment` → 403
(consistent with loops 21-57). Step 4 REPAIR MODE: every P0/P1 issue was
**independently re-verified RESOLVED in code this session** (§4.2). The
genuinely-open P1 (#728) remains **permanently workflow-blocked** (push of a
workflow-touching branch re-probed this session → rejected for missing
`workflows` scope). Else-branch (lowest-scoring domain → criterion) already
executed in loop 33 (Release & Rollback Safety) and re-scored unchanged in
loops 36/48-57 — **no lower executable gap remains**. Health baseline
re-verified fresh on `main`: typecheck 9/9, lint 9/9 (0 warnings), 87 test
files / 1625 tests passing, `pnpm audit --prod` → 0 known vulnerabilities,
`check-deps` and `check:circular` pass. No code-fixable, non-workflow P0/P1
repair remains.

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0.2).

Phase 0 entry check: `gh pr list --state open` → **0 PRs** → open issues →
**82 open issues** → ISSUE MANAGER MODE. Phases 1-3 not entered (Phase 0 gate
requires issue management first).

## 2. Decision Summary

- Default branch detected: `main` (current HEAD `86eb071` = merged PR #1161 =
  loop 57 audit report; verified `HEAD == origin/main`). Working tree contains
  pre-existing harness artifacts (`.opencode/*` deletions, `.omo/` migration
  backups) — left untouched, excluded from the report commit.
- No new issues since loop 57 (newest open issues remain #785-789 from
  2026-02-27; re-checked via `gh issue list` createdAt filter) → no new
  duplicate/consolidation candidates.
- **Steps 1-3 (normalization / dedup / consolidation)**: Write capabilities
  re-probed first-hand this session — all return 403:
  - `gh issue edit 789 --add-label P3` → **403** `addLabelsToLabelable`
  - `gh issue close 785` → **403** `closeIssue`
  - `gh issue comment 785 --body ...` → **403** `addComment`
  - Conclusion: label normalization (Step 1), duplicate closure (Step 2), and
    consolidation (Step 3) **remain blocked**. No labels/comments/closure
    applied. Pending manual action list remains
    `.omo/issue-normalization-audit.md`.
- **Workflow-file pushes re-probed this session**: branch
  `probe/workflow-push-test` touching `.github/workflows/iterate.yml` was
  rejected at push time: `refusing to allow a GitHub App to create or update
workflow ... without workflows permission`. Confirms the pnpm-in-CI cluster
  (#305/#584/#595/#670/#744), #728, and the CI node-version bump remain
  **permanently workflow-blocked**.
- **Step 4 — REPAIR MODE**: P0/P1 exist on paper (#496 P0, 9 P1s), but every
  P0/P1 issue was **independently re-verified RESOLVED in code this session**
  (§4.2). The genuinely-open P1 (#728) remains **permanently
  workflow-blocked**. Else-branch (lowest-scoring domain → criterion):
  executed in loop 33; re-scored unchanged loops 36/48-57. **No lower
  executable gap remains.**
- **Health baseline re-verified fresh this session** (Node 20.20.2):

| Check           | Command               | Result                                                                                 |
| --------------- | --------------------- | -------------------------------------------------------------------------------------- |
| Install         | `pnpm install`        | OK (`--prefer-offline`, 7.8s)                                                          |
| Typecheck       | `pnpm typecheck`      | **9/9 tasks pass** (~12.6s)                                                            |
| Lint            | `pnpm lint`           | **9/9 tasks pass** (0 warnings, ~68.7s)                                                |
| Test            | `pnpm test`           | **87 files / 1625 tests pass** (fresh run, ~53.9s)                                     |
| Audit           | `pnpm audit --prod`   | **No known vulnerabilities found**                                                     |
| Dep consistency | `pnpm check-deps`     | **pass** (exit 0)                                                                      |
| Circular deps   | `pnpm check:circular` | **pass** (madge, exit 0, no cycles)                                                    |
| Build           | `pnpm build`          | **NOT runnable** — only Node 20.20.2 present; known webidl failure on Node 20 (see §6) |

## 3. Issue Manager — Steps 1-3 (BLOCKED)

Re-probed label assignment, issue close, and commenting this session — all 403
(GraphQL `addLabelsToLabelable`, `closeIssue`, `addComment`). **No
normalization, duplicate closure, or consolidation applied.** Duplicate
clusters unchanged (established maps: 480↔496, 305↔584↔595↔670↔744,
501↔628↔724, 551↔631↔725, 731↔749). No new issues since 2026-02-27 (82 open,
newest #785-789 from 2026-02-27), so no new duplicate candidates.

## 4. Step 4 — Repair Mode

### 4.1 Selection

- **P0/P1 exists?** Yes on paper, but every P0/P1 issue was **independently
  re-verified RESOLVED in code this session** (§4.2). The genuinely-open P1
  (#728) is **workflow-blocked** (push re-probed this session → rejected).
- **Else-branch** (lowest-scoring domain → criterion): loop 33 executed the
  lowest-scoring criterion repair (Release & Rollback Safety); loops
  36/48/49/50/51/52/53/54/55/56/57 re-scored domains — unchanged. **No lower
  executable gap remains.** No repair attempted — nothing new and non-blocked
  to fix.

### 4.2 P0/P1 Verification Matrix (fresh evidence THIS session)

| #   | Title                               | Evidence verified this session                                                                                                                                                                                                                                                               |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 496 | Distributed rate limiter (Redis) P0 | `packages/api/src/distributed-rate-limiter.ts` (9012B) + `distributed-rate-limiter.test.ts` (12564B) present; **wired into production**: `packages/api/src/trpc.ts` imports from `./distributed-rate-limiter` and `rateLimit(endpointType)` guards all procedure tiers (lines 482, 492, 501) |
| 480 | Redis rate limiter (dup of #496)    | resolved via #496 evidence above                                                                                                                                                                                                                                                             |
| 498 | RBAC admin (role-based)             | `requireRole` factory present at `packages/api/src/trpc.ts:347`; `packages/api/src/rbac.test.ts` present and passes within the 87-file / 1625-test suite                                                                                                                                     |
| 500 | Clerk auth flow tests               | `apps/nextjs/src/utils/clerk.test.ts` + `packages/auth/clerk.test.ts` present (verified this session)                                                                                                                                                                                        |
| 501 | Playwright E2E critical journeys    | `playwright.config.ts` + **12 spec files** present (`tests/e2e/{admin,auth,authorization-bypass,billing,cluster,critical-flows,dashboard,fixtures,home,pricing,subscription-workflows,webhook-error-handling}.ts`)                                                                           |
| 515 | CSRF protection                     | `csrfProtection` tRPC middleware at `packages/api/src/trpc.ts:104` + `ErrorCode.CSRF_ERROR`; applied via `t.procedure.use(tracing).use(csrfProtection)` (line 215)                                                                                                                           |
| 549 | packages/auth tests (0% coverage)   | `packages/auth/clerk.test.ts` + `env.test.ts` present                                                                                                                                                                                                                                        |
| 550 | nextjs in test coverage config      | `vitest.config.ts` coverage `include` contains `"apps/nextjs/src/**/*.{ts,tsx}"` (line 16)                                                                                                                                                                                                   |
| 551 | k8s router tests                    | `packages/api/src/router/k8s.test.ts` + `k8s-router.test.ts` present                                                                                                                                                                                                                         |
| 581 | Testing infra consolidation         | **10 router test files** present (`packages/api/src/router/*.test.ts`)                                                                                                                                                                                                                       |
| 728 | Security scanning workflows         | dependency-vuln prerequisite CLEARED (`pnpm audit --prod` → 0 this session); workflow files still blocked (`workflows` scope — push re-probed, rejected)                                                                                                                                     |
| 786 | Stripe webhook secret logging       | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` uses non-secret identifier `"stripe-webhook"` (lines 54-62); no `slice(-8)` secret logging in source (unchanged from prior loops)                                                                                                         |

### 4.3 Additional Spot-Checks (fresh this session)

| #   | Title                             | Evidence (this session)                                                                                                                                                   |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 720 | Missing .nvmrc                    | `.nvmrc` exists with valid `22.14.0` — stale, pending manual closure                                                                                                      |
| 748 | .nvmrc invalid value              | `.nvmrc` = `22.14.0` (valid) — stale, pending manual closure                                                                                                              |
| 613 | Duplicate GitHub Actions workflow | only `iterate.yml` + `on-pull.yml` in `.github/workflows/` (no duplicate)                                                                                                 |
| 578 | Duplicate health check endpoint   | single `apps/nextjs/src/app/api/health/route.ts` (GET + HEAD); no duplicate route in source                                                                               |
| 697 | Corrupted text formatting in docs | no BOM/prefix artifacts found in `docs/*.md`                                                                                                                              |
| 785 | Duplicate next dep in stripe pkg  | `packages/stripe/package.json` has **no** `next` entry in dependencies (deps: common/db/env/stripe/zod)                                                                   |
| 789 | peerDependencies for React        | `packages/ui/package.json` has `react`/`react-dom` in **peerDependencies** (`^19.0.0`, lines 93-94); devDeps pinned for build; `dependencies` contains no react/react-dom |
| 632 | Sensitive logging audit           | no `logger.*` calls logging secrets/passwords/tokens in `packages/{api,db,stripe}/src`                                                                                    |
| 722 | Env validation at startup         | `packages/common/src/config/env.ts`, `env.mjs`, `packages/api/src/env.mjs` present                                                                                        |
| 664 | console.\* → pino in db/stripe    | no non-test `console.*` in `packages/db/src`; only JSDoc examples in `packages/stripe/src`; `logger.ts` present                                                           |
| 580 | Observability infra               | `packages/api/src/logger.ts` + `packages/common/src/logger.ts` (+ logger.test.ts) present                                                                                 |
| 611 | not-found page                    | `apps/nextjs/src/app/not-found.tsx` present                                                                                                                               |
| 666 | Global error boundary             | `apps/nextjs/src/app/error.tsx` present                                                                                                                                   |

## 5. Action Log

| Timestamp (UTC) | Action                     | Target                                          | Result                                                                                                                                                    |
| --------------- | -------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15:16           | Phase 0 entry check        | PRs / issues                                    | 0 open PRs; 82 open issues → ISSUE MANAGER MODE                                                                                                           |
| 15:17           | Probe token capabilities   | issues (label / close / comment)                | **BLOCKED** (403 `addLabelsToLabelable`, `closeIssue`, `addComment`)                                                                                      |
| 15:17           | Sync with default branch   | `git fetch origin main`                         | HEAD == origin/main (`86eb071`)                                                                                                                           |
| 15:18           | `pnpm install`             | workspace                                       | OK (`--prefer-offline`, 7.8s)                                                                                                                             |
| 15:18           | `pnpm typecheck`           | workspace                                       | **9/9 tasks pass** (~12.6s)                                                                                                                               |
| 15:19           | `pnpm lint`                | workspace                                       | **9/9 tasks pass** (0 warnings, ~68.7s)                                                                                                                   |
| 15:19           | `pnpm test`                | workspace                                       | **87 files / 1625 tests pass** (~53.9s)                                                                                                                   |
| 15:19           | `pnpm audit --prod`        | workspace                                       | **No known vulnerabilities found**                                                                                                                        |
| 15:19           | `pnpm check-deps`          | workspace                                       | **pass** (exit 0)                                                                                                                                         |
| 15:19           | `pnpm check:circular`      | workspace                                       | **pass** (madge, exit 0)                                                                                                                                  |
| 15:20           | Probe workflow push        | branch touching `.github/workflows/iterate.yml` | **BLOCKED** — push rejected: `refusing to allow a GitHub App to create or update workflow ... without workflows permission`; probe branch deleted locally |
| 15:20           | Verify P0/P1 + spot-checks | #496/#498/#515/#501/#549/#550/#551/#581…        | all **RESOLVED in source** (fresh evidence, §4.2/§4.3)                                                                                                    |
| 15:21           | Write audit report         | `.omo/issue-manager-audit-2026-08-08-loop58.md` | created                                                                                                                                                   |

## 6. Reconfirmed Finding (P2 — CI node version mismatch)

- **Observation (reconfirmed, unchanged from loops 45-57)**: `.nvmrc` pins
  Node `22.14.0` and `next` engine requires Node >= 22, but
  `.github/workflows/on-pull.yml` (line 55) and `.github/workflows/iterate.yml`
  (lines 70, 266, 340, 395) pin `node-version: 20`.
- **Evidence**: `pnpm build` under Node 20.20.2 fails with
  `webidl.util.markAsUncloneable is not a function`; same build passes under
  Node 22 (loop 45 evidence). This session's environment only has Node 20, so
  build could not be re-verified here — the failure mode is documented, not
  observed anew.
- **Impact / Risk**: low today (CI runs lint/typecheck/test only); becomes a
  hard CI failure the moment a build/compile step is added. Violates Config &
  Env Parity.
- **Suggested fix**: bump `node-version` to 22 in `on-pull.yml` and
  `iterate.yml`. Deferred to a maintainer: workflow file pushes are
  token-blocked (`workflows` scope) — re-probed and rejected this session.

## 7. Additional Reconfirmed Finding (pnpm consistency in iterate.yml)

- **Observation (reconfirmed)**: `.github/workflows/iterate.yml` still contains
  2 `npm ci` invocations (lines 72, 342) despite the project using pnpm.
- **Evidence**: `grep -c "npm ci" .github/workflows/iterate.yml` → 2; on-pull.yml
  has 0 (already migrated).
- **Impact**: inconsistent install path / cache between CI and local; slower CI.
- **Suggested fix**: replace `npm ci || true` with `pnpm install --frozen-lockfile || true`
  in iterate.yml. Deferred to a maintainer with `workflows` scope. This is the
  remaining actionable portion of duplicate cluster #305/#584/#595/#670/#744.

## 8. Final State

- **State**: waiting for human review.
- **Blocked work**: issue label normalization, duplicate closure, and issue
  consolidation (Steps 1-3) — token lacks `issues:write`. Completing #728
  (security scanning workflow files) and the pnpm-in-CI cluster
  (#584/#305/#595/#670/#744) requires `workflows` permission. CI node-version
  bump requires `workflows` permission.
- **Recommended manual action**: a maintainer with `issues:write` should apply
  the label-normalization table in `.omo/issue-normalization-audit.md`, close
  the duplicate clusters (§3), close the resolved issues listed in §4.2/§4.3
  (including stale #720/#748 — `.nvmrc` now valid at `22.14.0`, and #785/#789
  whose code states were verified resolved this session), and close #728's
  dependency-vuln portion (cleared by `pnpm audit --prod` → 0 this session). A
  maintainer with `workflows` scope should bump CI `node-version` to 22,
  replace `npm ci` in iterate.yml, and add the security-audit workflow specs
  already drafted in `docs/ci/workflows/`.
