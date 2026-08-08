# Issue Manager Audit Report — 2026-08-08 (Loop 48)

**Phase**: ISSUE MANAGER MODE
**Performed by**: Sisyphus (Autonomous Agent)
**Status**: Phase 0 entry check found **0 open PRs** → open-issue check found
**82 open issues** (unchanged since loop 47; no new issues created) → ISSUE
MANAGER MODE entered; all other phases stopped. Steps 1-3 (label normalization,
duplicate closure, consolidation) re-probed and **still blocked** by token scope
(`issues:write` → 403 on GraphQL `addLabelsToLabelable`, `addComment`,
`createIssue`; REST PATCH also denied). Every P0/P1 issue re-verified
**RESOLVED in code** with fresh evidence this session (§4.2), including
first-hand execution of the full test suite (87 files / 1625 tests passing).
Health baseline re-verified fresh on `main`: **typecheck 9/9, lint 9/9 (0
warnings), 87 test files / 1625 tests passing, `pnpm audit --prod` → 0 known
vulnerabilities.** Build not runnable in this environment (only Node 20
available; known `webidl.util.markAsUncloneable` failure on Node 20 — `.nvmrc`
pins 22.14.0). No code-fixable, non-workflow P0/P1 repair remains; no new
executable gap found in P2/P3 spot-checks (§4.3).

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
  - `gh api repos/cpa03/basefly/issues/789/comments -f body=...` → **403**
    `addComment`
  - `gh issue create ...` → **403** `createIssue`
  - `gh api repos/cpa03/basefly` permissions → `{admin:false, maintain:false,
pull:false, push:false, triage:false}` (API surface read-only)
  - Git push to `main` (probe branches) → **ALLOWED** (contents: write);
    probe branches deleted after test.
  - Push of `.github/workflows/zz-test.yml` → **REFUSED** ("refusing to allow
    a GitHub App to create or update workflow ... without `workflows`
    permission"); probe branch deleted after test.
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
| Typecheck | `pnpm typecheck`                 | **9/9 tasks pass** (fresh run)                                                         |
| Lint      | `pnpm lint`                      | **9/9 tasks pass** (0 warnings, fresh run)                                             |
| Test      | `pnpm test`                      | **87 files / 1625 tests pass** (fresh run, ~23s)                                       |
| Audit     | `pnpm audit --prod`              | **No known vulnerabilities found**                                                     |
| Build     | `pnpm build`                     | **NOT runnable** — only Node 20.20.2 present; known webidl failure on Node 20 (see §6) |

## 3. Issue Manager — Steps 1-3 (BLOCKED)

Re-probed label assignment, comment, and issue-creation access this session.
All return 403 (GraphQL `addLabelsToLabelable` / `addComment` / `createIssue`).
**No normalization, duplicate closure, or consolidation applied.** Duplicate
clusters unchanged (established maps: 480↔496, 305↔584↔595↔670↔744,
501↔628↔724, 551↔631↔725, 731↔749). No new issues since loop 47 (82 open,
newest #785-789 from 2026-02-27), so no new duplicate candidates.

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

| #   | Title                               | Evidence verified this session                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 496 | Distributed rate limiter (Redis) P0 | `packages/api/src/distributed-rate-limiter.ts` (359 lines: `DistributedRateLimiter` sliding-window ZSET + `InMemoryRateLimiter` fallback + `SyncRateLimiter`) wired into `packages/api/src/trpc.ts` `rateLimit()` middleware via `checkAsync`; **tests executed first-hand: `distributed-rate-limiter.test.ts` + `rate-limiter.test.ts` pass within the 87-file / 1625-test suite**; `docs/redis-setup.md` present; `REDIS_URL` in `.env.example`; ioredis ^5.6.0 dep |
| 480 | Redis rate limiter (dup of #496)    | resolved via #496 evidence above                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 498 | RBAC admin (role-based)             | `requireRole` + `createRoleBasedProcedure` + DB `User.role` check in `packages/api/src/trpc.ts` (lines 254-419); `packages/api/src/authorization.ts` present (209 lines)                                                                                                                                                                                                                                                                                              |
| 500 | Clerk auth flow tests               | `packages/auth/clerk.test.ts` + `env.test.ts` present; merged PR #1140 added Clerk middleware tests                                                                                                                                                                                                                                                                                                                                                                   |
| 501 | Playwright E2E critical journeys    | `playwright.config.ts` (testDir `./tests/e2e`) + **12 spec files** present (`tests/e2e/{auth,admin,billing,cluster,dashboard,home,subscription-workflows,critical-flows,authorization-bypass,webhook-error-handling,pricing,fixtures}.ts`)                                                                                                                                                                                                                            |
| 515 | CSRF protection                     | `csrfProtection` middleware in `packages/api/src/trpc.ts` (Origin/Referer validation against `NEXT_PUBLIC_APP_URL`, production-enforced); `proxy.ts` also validates CSRF origin for state-changing requests                                                                                                                                                                                                                                                           |
| 549 | packages/auth tests                 | `packages/auth/{clerk,env}.test.ts` present (note: `db.ts` referenced by the issue no longer exists in the package — stale file list)                                                                                                                                                                                                                                                                                                                                 |
| 550 | nextjs in coverage config           | `vitest.config.ts` coverage `include` contains `apps/nextjs/src/**`; apps/nextjs component/hook tests present                                                                                                                                                                                                                                                                                                                                                         |
| 551 | k8s router tests                    | `packages/api/src/router/k8s-router.test.ts` + `k8s.test.ts` present; merged PR #1119                                                                                                                                                                                                                                                                                                                                                                                 |
| 581 | Testing infra consolidation         | 10 router test files present (`packages/api/src/router/*.test.ts`); merged PR #1123                                                                                                                                                                                                                                                                                                                                                                                   |
| 728 | Security scanning workflows         | dependency-vuln prerequisite CLEARED (merged PR #1146; `pnpm audit --prod` → 0 this session); workflow files still blocked (`workflows` scope)                                                                                                                                                                                                                                                                                                                        |
| 754 | Webhook idempotency integration     | `packages/stripe/src/webhook-idempotency.test.ts` (20 test cases) + `webhook-idempotency.ts` present                                                                                                                                                                                                                                                                                                                                                                  |
| 785 | Duplicate `next` dep in stripe      | `packages/stripe/package.json` dependencies = `{@saasfly/common, @saasfly/db, @t3-oss/env-nextjs, stripe, zod}` — `next` NOT present                                                                                                                                                                                                                                                                                                                                  |
| 786 | Stripe webhook logs partial secret  | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` — rate-limit log uses non-secret `identifier` + `requestId` only; explicit comment documenting that raw `StripeError` is never passed to logger                                                                                                                                                                                                                                                                    |

### 4.3 Additional P2/P3 Spot-Checks (verified fresh THIS session)

| #   | Title                                     | Evidence this session                                                                                                                |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 789 | peerDependencies for React in packages/ui | `packages/ui/package.json` peerDependencies: `next >=14.0.0`, `react ^19.0.0`, `react-dom ^19.0.0` — present                         |
| 719 | Missing root-level TypeScript config      | root `tsconfig.json` present                                                                                                         |
| 684 | Root build script / turbo pipelines       | root `package.json` has `build`/`dev`/`lint`/`test` wired to turbo; typecheck/lint/test all pass via root scripts                    |
| 722 | Env variable validation at startup        | `apps/nextjs/src/env.mjs` `createEnv` from `@t3-oss/env-nextjs` (server + client schemas)                                            |
| 578 | Duplicate health check endpoint           | single `apps/nextjs/src/app/api/health/route.ts`                                                                                     |
| 609 | Consolidate duplicate Zod schemas         | routers import `enhancedK8sClusterCreateSchema`/`enhancedInsertCustomerSchema` etc. from `router/schemas.ts` — centralized           |
| 503 | JSDoc on API routers                      | `packages/api/src/router/k8s.ts` has module-level + per-procedure JSDoc                                                              |
| 488 | Circular dependency detection CI          | root `package.json` `check:circular` script using `madge` (line 28) — present                                                        |
| 708 | Bundle analyzer                           | `@size-limit` scripts `size:check`/`size:analyze` in `apps/nextjs/package.json` — present                                            |
| 610 | Standardize tRPC response format          | `errorFormatter` in `packages/api/src/trpc.ts` — consistent envelope                                                                 |
| 613 | Remove duplicate workflow file            | `.github/workflows/` contains exactly 2 files (`iterate.yml`, `on-pull.yml`) — no duplicate                                          |
| 748 | `.nvmrc` invalid value                    | `.nvmrc` now contains `22.14.0` (valid; matches `next` engine requirement)                                                           |
| 611 | Custom 404 page                           | `apps/nextjs/src/app/not-found.tsx` present                                                                                          |
| 664 | Replace console.\* with pino              | `packages/db/src/` + `packages/stripe/src/` — `console.*` only inside JSDoc usage examples, not runtime code                         |
| 667 | Audit package export boundaries           | `packages/api/src/index.ts` + `packages/common/src/index.ts` barrel exports present                                                  |
| 697 | Corrupted text formatting in docs         | prior full mojibake scan: zero matches (loop 24); spot-check again clean                                                             |
| 755 | Composite index for subscriptions         | `@@index([authUserId, plan, stripeCurrentPeriodEnd])` present in `packages/db/prisma/schema.prisma`                                  |
| 713 | Unit tests for packages/common            | 6 test files present (`animation`, `email`, `icon-sizes`, `logger`, `subscriptions`, `ui-tokens`)                                    |
| 688 | Next.js middleware.ts                     | `apps/nextjs/src/proxy.ts` (Next.js middleware-equivalent) with security headers, CSRF origin validation, Clerk routing, request IDs |
| 666 | Global error boundary                     | `apps/nextjs/src/app/error.tsx` + `global-error.tsx` + route-group `error.tsx` files present                                         |
| 663 | Consolidate eslint-disable comments       | only 1 intentional `eslint-disable-next-line` (with `--` rationale) in non-test source                                               |
| 683 | ESLint monorepo config                    | root `.eslintrc.cjs` extends `tooling/eslint-config/base.js`; lint 9/9 clean                                                         |
| 752 | Unified CLI/console output utilities      | shared logger (`@saasfly/common/logger`) with pino redaction + structured API/DB/stripe loggers                                      |
| 753 | Route-based code splitting                | `next/dynamic` used in dashboard page (K8sCreateButton), settings, marketing, cluster-list                                           |
| 636 | ISR caching for dashboard                 | intentionally NOT used — documented in code: user-scoped data cannot be cached (`force-dynamic`)                                     |
| 630 | Pre-commit hooks                          | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged` — present                                                 |
| 634 | TypeScript strictness                     | `tooling/typescript-config/base.json` `strict: true` + `noUncheckedIndexedAccess`                                                    |
| 579 | Env setup error messages                  | `env.mjs`/`createEnv` produce actionable missing-variable errors                                                                     |
| 485 | Suspense boundaries                       | `Suspense` used in dashboard page (ClusterListSkeleton), pricing (PricingCardsSkeleton), billing, docs layout, marketing layout      |
| 486 | OpenTelemetry observability               | `packages/common/src/observability/index.ts` — NodeSDK + OTLP exporter + tracer (issue #486 referenced in module docstring)          |
| 483 | Transaction handling                      | `packages/stripe/src/webhooks.ts` uses `db.transaction().execute()` for atomic select+update (2 call sites)                          |
| 705 | Docker configuration                      | `Dockerfile` + `docker-compose.yml` present                                                                                          |
| 706 | Dev Containers                            | `.devcontainer/devcontainer.json` present                                                                                            |
| 635 | Developer onboarding guide                | `docs/ONBOARDING.md` + `docs/DEVELOPMENT.md` present                                                                                 |

## 5. Action Log

| Timestamp (UTC) | Action                           | Target                                                        | Result                                                              |
| --------------- | -------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| 05:00           | Phase 0 entry check              | PRs / issues                                                  | 0 open PRs; 82 open issues → ISSUE MANAGER MODE                     |
| 05:01           | Probe token capabilities         | issues (label edit + comment + create)                        | **BLOCKED** (403 `addLabelsToLabelable`/`addComment`/`createIssue`) |
| 05:02           | Probe git push                   | `test-push-perm-check` branch                                 | **ALLOWED**; probe branch deleted immediately                       |
| 05:03           | Probe workflow push              | `test-workflow-perm` branch (`.github/workflows/zz-test.yml`) | **REFUSED** (workflows scope); probe branch deleted                 |
| 05:04           | `pnpm install --frozen-lockfile` | workspace                                                     | OK (workerd ignored)                                                |
| 05:05           | `pnpm typecheck`                 | workspace                                                     | **9/9 tasks pass**                                                  |
| 05:05           | `pnpm lint`                      | workspace                                                     | **9/9 tasks pass** (0 warnings)                                     |
| 05:06           | `pnpm test`                      | workspace                                                     | **87 files / 1625 tests pass** (fresh, ~23s)                        |
| 05:07           | `pnpm audit --prod`              | workspace                                                     | **No known vulnerabilities found**                                  |
| 05:08           | Verify P0/P1 + P2/P3 issues      | 30+ issues (§4.2, §4.3)                                       | all RESOLVED in source; #728 workflow-blocked                       |
| 05:10           | Write audit report               | `.omo/issue-manager-audit-2026-08-08-loop48.md`               | created                                                             |

## 6. Reconfirmed Finding (P2 — CI node version mismatch)

- **Observation (reconfirmed, unchanged from loops 45-47)**: `.nvmrc` pins Node
  `22.14.0` and `next` engine requires Node >= 22, but
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
  token-blocked (`workflows` scope).

## 7. Final State

- **State**: waiting for human review.
- **Blocked work**: issue label normalization, duplicate closure, and issue
  consolidation (Steps 1-3) — token lacks `issues:write`. Completing #728
  (security scanning workflow files) and the pnpm-in-CI cluster
  (#584/#305/#595/#670/#744) requires `workflows` permission. CI node-version
  bump requires `workflows` permission.
- **Recommended manual action**: a maintainer with `issues:write` should apply
  the label-normalization table in `.omo/issue-normalization-audit.md`, close
  the duplicate clusters (§3), close the resolved issues listed in §4.2/§4.3,
  and close #728's dependency-vuln portion (cleared by merged PR #1146). A
  maintainer with `workflows` scope should bump CI `node-version` to 22 and add
  the security-audit workflow specs already drafted in `docs/ci/workflows/`.
