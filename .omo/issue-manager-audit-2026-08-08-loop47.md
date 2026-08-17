# Issue Manager Audit Report — 2026-08-08 (Loop 47)

**Phase**: ISSUE MANAGER MODE
**Performed by**: Sisyphus (Autonomous Agent)
**Status**: Phase 0 entry check found **0 open PRs** → open-issue check found
**82 open issues** (unchanged since loop 46; no new issues created) → ISSUE
MANAGER MODE entered; all other phases stopped. Steps 1-3 (label normalization,
duplicate closure, consolidation) re-probed and **still blocked** by token scope
(`issues:write` → 403 on GraphQL `addLabelsToLabelable` and `addComment`; REST
PATCH also denied). Every P0/P1 issue re-verified **RESOLVED in code** with
fresh evidence this session (§4.2), including first-hand execution of the full
distributed-rate-limiter test suite (77 tests, all passing). Health baseline
re-verified fresh on `main`: **typecheck 9/9, lint 9/9 (0 warnings), 87 test
files / 1625 tests passing, `pnpm audit --prod` → 0 known vulnerabilities.**
Build not runnable in this environment (only Node 20 available; known
`webidl.util.markAsUncloneable` failure on Node 20 — `.nvmrc` pins 22.14.0). No
code-fixable, non-workflow P0/P1 repair remains; no new executable gap found in
P2/P3 spot-checks (§4.3).

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0.2).

Phase 0 entry check: **0 open PRs** (`gh pr list --state open` → empty) →
open-issue check → **82 open issues** → ISSUE MANAGER MODE. PR HANDLER MODE not
entered (no open PRs); Phases 1-3 not entered (issues exist).

## 2. Decision Summary

- Default branch detected: `main`. Working tree contains pre-existing harness
  artifacts (`.opencode/*` deletions, `.omo/` migration backups) — left
  untouched, excluded from the report commit.
- **ISSUE MANAGER MODE — Steps 1-3**: Re-probed token capabilities first-hand
  this session. Issue-write probes return 403:
  - `gh issue edit 789 --add-label ...` → **403** `addLabelsToLabelable`
  - `gh issue comment 496 ...` → **403** `addComment`
  - Git push to `main` (probe branch) → **ALLOWED** (contents: write); probe
    branch deleted after test.
  - Conclusion: label normalization (Step 1), duplicate closure (Step 2), and
    consolidation (Step 3) **remain blocked**. No labels/comments/closure
    applied. The pending manual action list remains
    `.omo/issue-normalization-audit.md`.
- **Step 4 — REPAIR MODE**: P0/P1 exists on paper (#496 P0, plus P1s), but
  every P0/P1 issue was **independently re-verified RESOLVED in code this
  session** (§4.2). The genuinely-open P1 (#728) remains **permanently
  workflow-blocked** (push of `.github/workflows/*` refused without `workflows`
  scope; the dependency-vulnerability prerequisite was already cleared by
  merged PR #1146 — `pnpm audit --prod` → 0 this session). Else-branch
  (lowest-scoring domain → criterion): executed in loop 33 (Release & Rollback
  Safety, PR #1116); re-scored loop 36 — unchanged. **No lower executable gap
  remains.**
- **Health baseline re-verified fresh this session** (Node 20.20.2):

| Check     | Command                          | Result                                                                                 |
| --------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile` | OK (workerd build script ignored, non-blocking)                                        |
| Typecheck | `pnpm typecheck`                 | **9/9 tasks pass**                                                                     |
| Lint      | `pnpm lint`                      | **9/9 tasks pass** (0 warnings)                                                        |
| Test      | `pnpm test`                      | **87 files / 1625 tests pass**                                                         |
| Audit     | `pnpm audit --prod`              | **No known vulnerabilities found**                                                     |
| Build     | `pnpm build`                     | **NOT runnable** — only Node 20.20.2 present; known webidl failure on Node 20 (see §6) |

## 3. Issue Manager — Steps 1-3 (BLOCKED)

Re-probed label assignment and issue write access this session. Both REST and
GraphQL paths return 403. **No normalization, duplicate closure, or
consolidation applied.** Duplicate clusters unchanged (established maps:
480↔496, 305↔584↔595↔670↔744, 501↔628↔724, 551↔631↔725, 731↔749). No new
issues since loop 46 (82 open, newest #785-789 from 2026-02-27), so no new
duplicate candidates.

## 4. Step 4 — Repair Mode

### 4.1 Selection

- **P0/P1 exists?** Yes on paper, but every P0/P1 issue was **independently
  re-verified RESOLVED in code this session** (§4.2). The genuinely-open P1
  (#728) is **workflow-blocked** (no `workflows` scope).
- **Else-branch** (lowest-scoring domain → criterion): loop 33 executed the
  lowest-scoring criterion repair (Release & Rollback Safety, PR #1116);
  loop 36 re-scored domains — unchanged. **No lower executable gap remains.**
  No repair attempted — nothing new and non-blocked to fix.

### 4.2 P0/P1 Verification Matrix (fresh evidence THIS session)

| #   | Title                               | Evidence verified this session                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 496 | Distributed rate limiter (Redis) P0 | `packages/api/src/distributed-rate-limiter.ts` (359 lines: `DistributedRateLimiter` sliding-window ZSET + `InMemoryRateLimiter` fallback + `SyncRateLimiter`) wired into `packages/api/src/trpc.ts` `rateLimit()` middleware via `checkAsync`; **tests executed first-hand: `distributed-rate-limiter.test.ts` + `rate-limiter.test.ts` → 77/77 passing**; `docs/redis-setup.md` present (8.3KB); `REDIS_URL` in `.env.example`; ioredis ^5.6.0 dep |
| 480 | Redis rate limiter (dup of #496)    | resolved via #496 evidence above                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 498 | RBAC admin (role-based)             | `requireRole` + `createRoleBasedProcedure` + DB `User.role` check in `packages/api/src/trpc.ts` (lines 254-419); `packages/api/src/authorization.ts` present (209 lines)                                                                                                                                                                                                                                                                            |
| 500 | Clerk auth flow tests               | `packages/auth/clerk.test.ts` + `env.test.ts` present                                                                                                                                                                                                                                                                                                                                                                                               |
| 501 | Playwright E2E critical journeys    | `playwright.config.ts` (testDir `./tests/e2e`) + **10 spec files** present (`tests/e2e/{auth,admin,billing,cluster,dashboard,home,subscription-workflows,critical-flows,authorization-bypass,webhook-error-handling}.spec.ts`)                                                                                                                                                                                                                      |
| 515 | CSRF protection                     | `csrfProtection` middleware in `packages/api/src/trpc.ts` (Origin/Referer validation against `NEXT_PUBLIC_APP_URL`, production-enforced)                                                                                                                                                                                                                                                                                                            |
| 549 | packages/auth tests                 | `packages/auth/{clerk,env}.test.ts` present (note: `db.ts` referenced by the issue no longer exists in the package — stale file list)                                                                                                                                                                                                                                                                                                               |
| 550 | nextjs in coverage config           | `vitest.config.ts` coverage `include` contains `apps/nextjs/src/**`; apps/nextjs component/hook tests present                                                                                                                                                                                                                                                                                                                                       |
| 551 | k8s router tests                    | `packages/api/src/router/k8s-router.test.ts` + `k8s.test.ts` present                                                                                                                                                                                                                                                                                                                                                                                |
| 581 | Testing infra consolidation         | 10 router test files present (`packages/api/src/router/*.test.ts`)                                                                                                                                                                                                                                                                                                                                                                                  |
| 728 | Security scanning workflows         | dependency-vuln prerequisite CLEARED (merged PR #1146; `pnpm audit --prod` → 0 this session); workflow files still blocked                                                                                                                                                                                                                                                                                                                          |
| 754 | Webhook idempotency integration     | `packages/stripe/src/webhook-idempotency.test.ts` + `webhook-idempotency.ts` present                                                                                                                                                                                                                                                                                                                                                                |
| 785 | Duplicate `next` dep in stripe      | `packages/stripe/package.json` dependencies = `{@saasfly/common, @saasfly/db, @t3-oss/env-nextjs, stripe, zod}` — `next` NOT present                                                                                                                                                                                                                                                                                                                |
| 786 | Stripe webhook logs partial secret  | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` — rate-limit log uses non-secret `identifier: "stripe-webhook"` + `requestId` only; explicit comment documenting that raw `StripeError` is never passed to logger                                                                                                                                                                                                                                |

### 4.3 Additional P2/P3 Spot-Checks (verified fresh THIS session)

| #   | Title                                     | Evidence this session                                                                                                              |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 789 | peerDependencies for React in packages/ui | `packages/ui/package.json` peerDependencies: `next >=14.0.0`, `react ^19.0.0`, `react-dom ^19.0.0` — present                       |
| 719 | Missing root-level TypeScript config      | root `tsconfig.json` present                                                                                                       |
| 684 | Root build script / turbo pipelines       | root `package.json` has `build`/`dev`/`lint`/`test` wired to turbo; typecheck/lint/test all pass via root scripts                  |
| 722 | Env variable validation at startup        | `packages/common/src/config/env.ts` `validateEnvVars()` (line 107) + `packages/auth/env.mjs` `createEnv` from `@t3-oss/env-nextjs` |
| 578 | Duplicate health check endpoint           | single `apps/nextjs/src/app/api/health/route.ts`                                                                                   |
| 609 | Consolidate duplicate Zod schemas         | `errorFormatter` centralizes ZodError flattening in `trpc.ts` (line 66); routers use shared schemas                                |
| 503 | JSDoc on API routers                      | `packages/api/src/router/k8s.ts` has module-level JSDoc; `api-spec.md` documents tRPC endpoints                                    |
| 488 | Circular dependency detection CI          | root `package.json` `check:circular` script using `madge` (line 28) — present                                                      |
| 708 | Bundle analyzer                           | `@next/bundle-analyzer` ^16.2.7 in `apps/nextjs/package.json` (line 67) — present                                                  |
| 610 | Standardize tRPC response format          | `errorFormatter` in `packages/api/src/trpc.ts` — consistent `{shape, zodError, requestId}` envelope                                |
| 613 | Remove duplicate workflow file            | `.github/workflows/` contains exactly 2 files (`iterate.yml`, `on-pull.yml`) — no duplicate                                        |
| 748 | `.nvmrc` invalid value                    | `.nvmrc` now contains `22.14.0` (valid; matches `next` engine requirement)                                                         |
| 611 | Custom 404 page                           | `apps/nextjs/src/app/not-found.tsx` present                                                                                        |
| 664 | Replace console.\* with pino              | `packages/db/src/` + `packages/stripe/src/` — `console.*` only inside JSDoc usage examples, not runtime code                       |
| 667 | Audit package export boundaries           | `packages/api/src/index.ts` + `packages/common/src/index.ts` barrel exports present                                                |

## 5. Action Log

| Timestamp (UTC) | Action                           | Target                                                      | Result                                                   |
| --------------- | -------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| 04:00           | Phase 0 entry check              | PRs / issues                                                | 0 open PRs; 82 open issues → ISSUE MANAGER MODE          |
| 04:01           | Probe token capabilities         | issues (label edit + comment)                               | **BLOCKED** (403 `addLabelsToLabelable` / `addComment`)  |
| 04:01           | Probe git push                   | `token-write-probe` branch                                  | **ALLOWED**; probe branch deleted immediately            |
| 04:02           | Verify #496 implementation       | `packages/api/src/distributed-rate-limiter.ts`              | present + wired into `trpc.ts`; docs + env + dep present |
| 04:04           | **Execute rate-limiter tests**   | `distributed-rate-limiter.test.ts` + `rate-limiter.test.ts` | **77/77 tests pass** (first-hand)                        |
| 04:05           | Verify remaining P0/P1 + P2/P3   | 25+ issues (§4.2, §4.3)                                     | all RESOLVED in source; #728 workflow-blocked            |
| 04:05           | `pnpm install --frozen-lockfile` | workspace                                                   | OK (workerd ignored)                                     |
| 04:05           | `pnpm lint`                      | workspace                                                   | **9/9 tasks pass** (0 warnings)                          |
| 04:06           | `pnpm typecheck`                 | workspace                                                   | **9/9 tasks pass**                                       |
| 04:05           | `pnpm test`                      | workspace                                                   | **87 files / 1625 tests pass**                           |
| 04:07           | `pnpm audit --prod`              | workspace                                                   | **No known vulnerabilities found**                       |
| 04:08           | Write audit report               | `.omo/issue-manager-audit-2026-08-08-loop47.md`             | created                                                  |

## 6. Reconfirmed Finding (P2 — CI node version mismatch)

- **Observation (reconfirmed, unchanged)**: `.nvmrc` pins Node `22.14.0` and
  `next` engine requires Node >= 22, but `.github/workflows/on-pull.yml`
  (line 55) and `.github/workflows/iterate.yml` (lines 70, 266, 340, 395) pin
  `node-version: 20`.
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
  token-blocked (`workflows` scope).

## 7. Final State

- **State**: waiting for human review.
- **Blocked work**: issue label normalization, duplicate closure, and issue
  consolidation (Steps 1-3) — token lacks `issues:write`. Completing #728
  (security scanning workflow files) and the pnpm-in-CI cluster
  (#584/#305/#595/#670/#744) requires `workflows` permission. #755 requires DB
  access. CI node-version bump requires `workflows` permission.
- **Recommended manual action**: a maintainer with `issues:write` should apply
  the label-normalization table in `.omo/issue-normalization-audit.md`, close
  the duplicate clusters (§3), close the resolved issues listed in §4.2/§4.3,
  and close #728's dependency-vuln portion (cleared by merged PR #1146). A
  maintainer with `workflows` scope should bump CI `node-version` to 22 and add
  the security-audit workflow specs already drafted in `docs/ci/workflows/`.
