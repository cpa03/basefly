# Issue Manager Audit Report — 2026-08-09 (loop 71)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `e02ddc6` → merged PRs #1187/#1188/#1189 this cycle)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: 0 open PRs, 82 open issues)

## Decision Summary

- Step 0.1 (open PRs): **0 open PRs** → PR Handler Mode skipped.
- Step 0.2 (open issues): **82 open issues** → Issue Manager Mode entered.
- Steps 1–3 (label normalization / dedupe / consolidation): **BLOCKED at API level** — re-probed first-hand this session: `gh issue edit --add-label` → 403 `Resource not accessible by integration` (REST and GraphQL); `gh issue comment` → 403. Token (`on-pull.yml`) grants `contents: write` + `pull-requests: write` only; **no `issues: write`**. All Step 1–3 analysis carried forward read-only from loop 70 (documented below).
- Step 4 (Repair Mode): All P0/P1 issues re-verified **resolved in code** this session. Repair target selected from next-lowest actionable criterion → **B. SYSTEM QUALITY / Security Practices (60)** → **Issue #722 (P2) "[Security] Add environment variable validation at startup"** → **PR #1189 (merged)**.

## Prior-Loop Repair Status

- **PR #1187** (loop 70, #609 Zod schema consolidation) — **MERGED** this cycle (merge commit `05de225`). Issue #609 remains open only because closing issues requires `issues: write` (token-blocked).
- **PR #1188** (loop 70 audit report) — **MERGED** (HEAD `e02ddc6`).

## Step 1 — Label Normalization Plan (carried forward from loop 70, NOT applied — token blocked)

### Missing category label (11 issues)

| Issue | Title                                                       | Proposed category | Proposed priority |
| ----- | ----------------------------------------------------------- | ----------------- | ----------------- |
| #595  | GitHub Actions workflows use npm instead of pnpm            | `ci`              | P2                |
| #670  | Fix iterate.yml to use pnpm instead of npm                  | `ci`              | (keep P3)         |
| #697  | Fix corrupted text formatting in documentation files        | `docs`            | P3                |
| #744  | fix(ci): pnpm consistency in iterate.yml                    | `ci`              | P2                |
| #748  | .nvmrc contains invalid value '20'                          | `bug`             | P2                |
| #749  | AI-powered API endpoint testing and documentation generator | `feature`         | P3                |
| #751  | Optimize tRPC router bundle size with code splitting        | `enhancement`     | P2                |
| #752  | Create unified CLI output utilities                         | `refactor`        | P3                |
| #753  | Route-based code splitting for dashboard pages              | `enhancement`     | P2                |
| #754  | Integration tests for Stripe webhook idempotency            | `test`            | P2                |
| #755  | Composite index for customer subscription queries           | `enhancement`     | P2                |

### Missing priority label (28 issues)

P1 (security/test gaps): #632, #721, #724, #786
P2: #305, #584, #595, #628, #631, #634, #713, #719, #720, #722, #723, #725, #728, #785, #787, #788, #789
P3: #630, #635, #636, #668, #726, #727, #729, #731

## Step 2 — Duplicate Detection (semantic clusters, closure NOT applied — token blocked)

| Cluster                | Issues                       | Canonical                   | Duplicates / notes                                                                                                                              |
| ---------------------- | ---------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm consistency in CI | #305, #584, #595, #670, #744 | **#305** (oldest, broadest) | #584, #595, #670, #744 — near-identical intent (npm→pnpm in workflows); all blocked on `workflows: write`                                       |
| Redis rate limiter     | #496, #480                   | **#496** (P0, implemented)  | #480 fully superseded — same feature, implemented via PR #627                                                                                   |
| Playwright E2E         | #501, #628, #724             | **#501**                    | #628 duplicate; #724 partially addressed (12 spec files exist incl. `authorization-bypass`, `subscription-workflows`, `webhook-error-handling`) |
| API router tests       | #631, #725                   | **#631**                    | #725 superseded — `integration.test.ts` exists (refs #725)                                                                                      |
| .nvmrc                 | #720, #748                   | **#720**                    | #748 same file, both resolved (`.nvmrc` = `22.14.0`)                                                                                            |
| AI API docs/tooling    | #731, #749                   | **#731**                    | #749 related (docs-generator + openapi exist)                                                                                                   |
| Code splitting         | #751, #753                   | keep separate               | different targets (tRPC bundle vs dashboard routes); both partially done (`dynamic()` used)                                                     |
| Authorization          | #498, #721                   | **#498**                    | #721 related; both resolved (`authorization.ts`, `requireRole`)                                                                                 |

## Step 3 — Consolidation Analysis

- **pnpm cluster (5 issues)** → consolidate into #305 as the canonical umbrella (blocked on `workflows: write`).
- **Testing cluster** → #581 already serves as the consolidated testing-infrastructure umbrella; its sub-items (#500/#549/#550/#551/#501) verified resolved.
- No additional grouping warranted; remaining open issues are distinct concerns.

## P0/P1 Verification (re-checked in code this session, all resolved)

| Issue     | Title                              | Evidence                                                                                                                                                                                 |
| --------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496 (P0) | Redis distributed rate limiter     | `packages/api/src/distributed-rate-limiter.ts` + `.test.ts`; wired via `checkAsync` in `trpc.ts`; `REDIS_URL` documented in `.env.example`, `docs/redis-setup.md`, `docs/DEVELOPMENT.md` |
| #480 (P1) | Replace in-memory rate limiter     | superseded by #496                                                                                                                                                                       |
| #498 (P1) | Role-based access control          | `authorization.ts`, `requireRole`/`createRoleBasedProcedure` in `trpc.ts`, `rbac.test.ts`                                                                                                |
| #500 (P1) | Clerk auth flow tests              | `apps/nextjs/src/utils/clerk.test.ts`, `packages/auth/src/clerk.test.ts`                                                                                                                 |
| #501 (P1) | Playwright E2E tests               | `playwright.config.ts` + 12 `*.spec.ts` files                                                                                                                                            |
| #515 (P1) | CSRF protection                    | `csrfProtection` middleware in `trpc.ts`; `proxy.ts` origin/referer validation                                                                                                           |
| #549 (P1) | packages/auth tests                | `packages/auth/src/clerk.test.ts` + `env.test.ts`                                                                                                                                        |
| #550 (P1) | apps/nextjs in coverage config     | `vitest.config.ts` includes `apps/nextjs/src/**`                                                                                                                                         |
| #551 (P1) | k8s router tests                   | `k8s-router.test.ts` (458 lines, 18 tests)                                                                                                                                               |
| #581 (P1) | Consolidate testing infrastructure | consolidated `vitest.config.ts`, `test:e2e` scripts                                                                                                                                      |
| #632 (P1) | Sensitive data leak audit          | `sensitive-data-logging.test.ts`; real logging paths redact/type-only                                                                                                                    |
| #721 (P1) | Explicit authorization checks      | `authorization.ts` + `authorization.test.ts`                                                                                                                                             |
| #724 (P1) | Missing e2e coverage               | 12 e2e spec files incl. `critical-flows`, `authorization-bypass`, `subscription-workflows`, `webhook-error-handling`                                                                     |
| #786 (P1) | Stripe webhook logs partial secret | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` — non-secret identifier `"stripe-webhook"`, no secret logging; signature errors sanitized                                             |

## Fresh Verifications This Session (all resolved in code)

| Issue     | Title                                    | Evidence                                                                         |
| --------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| #503      | JSDoc coverage in codebase               | JSDoc added across routers/common (fixed in loop 69, PR #1180)                   |
| #521      | SSR hydration mismatch                   | `useSyncExternalStore` SSR-safe pattern in client stores                         |
| #579      | Improve env error messages               | merged via PR #606                                                               |
| #609      | Consolidate duplicate Zod schemas        | fixed in loop 70, PR #1187 merged (commit `05de225`)                             |
| #613      | Duplicate GitHub Actions workflow file   | exactly 2 workflow files (`iterate.yml`, `on-pull.yml`), no duplicates           |
| #631      | Unit tests for tRPC routers              | `customer.test.ts`, `stripe.test.ts`, `k8s-router.test.ts`, `auth.test.ts`       |
| #663      | eslint-disable audit                     | loop 65 audit; 29 disables across 21 non-test files, all documented/justified    |
| #683      | ESLint/Prettier config inconsistency     | `.eslintrc.cjs` (ESLint 8) — lint 9/9 zero warnings                              |
| #685      | React performance optimizations          | `React.memo`/`useMemo` content already in main (commit `c6e391a`)                |
| #688      | Next.js middleware security headers      | `proxy.ts` (Next 16 middleware→proxy): CSP, security headers, CSRF, i18n, Clerk  |
| #720/#748 | .nvmrc invalid value                     | `.nvmrc` = `22.14.0`                                                             |
| #752      | Unified CLI output utilities             | pino-based `packages/common/src/logger.ts`                                       |
| #755      | Composite index for subscription queries | indexes present in `packages/db/prisma/schema.prisma`                            |
| #483      | Transactions in DB operations            | webhooks use `db.transaction()`; createCluster/createSession single-table writes |
| #722      | Env validation at startup                | **gap found & fixed this loop** (see Repair Mode)                                |

## Repair Mode Implementation

**Issue:** #722 — "[P2][Security] Add environment variable validation at startup"

**Selection rationale:** No actionable P0/P1 remains (all verified resolved). Workflow-blocked criteria (Stability 40, CI/CD Health 50, Release & Rollback 55) remain unreachable without `workflows: write`. Next-lowest actionable criterion: **B. SYSTEM QUALITY / Security Practices (60)**. Its only open item, **#722**, is a genuine, code-level gap: the validation logic exists (`validateEnvVars`, `getEnvValidationMessage`, `initEnvValidation` in `packages/common/src/config/env.ts`, wired via `initEnvValidation()` in `apps/nextjs/src/instrumentation.ts`) but had **zero test coverage** — a security-critical startup path untested.

### Audit result (this session)

- `validateEnvVars()` / `getEnvValidationMessage()` / `initEnvValidation()` had **no test coverage** (grep across `*.test.ts`: zero matches; `env.test.ts` covers only `ADMIN_EMAIL`/`REDIS_URL`/`isAdminEmail`/`IS_REDIS_CONFIGURED`).
- Contract confirmed from source: `REQUIRED_ENV_VARS` = `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `POSTGRES_URL`, `NEXT_PUBLIC_APP_URL`; `RECOMMENDED_ENV_VARS` = `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `REDIS_URL`; `initEnvValidation()` throws in production (`IS_PROD`), warns via structured logger otherwise.

### Fix applied (PR #1189 — MERGED, commit `f84b58a7`)

New test file `packages/common/src/config/env-validation.test.ts` (13 tests):

- `validateEnvVars()`: all-required-set → valid; missing required vars listed; whitespace-only values treated as missing; missing recommended vars reported without failing validation.
- `getEnvValidationMessage()`: success message when valid; required vars listed when missing; success message when only recommended vars are missing (matches actual contract — recommended-only message is produced by `initEnvValidation`, not `getEnvValidationMessage`); combined required+recommended listing.
- `initEnvValidation()`: non-production logs warning (no throw) for missing required/recommended; no warning when fully configured; **production fail-fast throw** (tested via module reload with `NODE_ENV=production` stub + `vi.resetModules()`); production no-throw when all required vars set.

## Verification (fresh this session)

| Check         | Command                                                             | Result                                     |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| Targeted test | `pnpm vitest run packages/common/src/config/env-validation.test.ts` | 13/13 passed                               |
| Full suite    | `pnpm test`                                                         | 89 files, 1652/1652 passed (was 88/1639)   |
| Typecheck     | `pnpm typecheck`                                                    | 9/9 tasks clean                            |
| Lint          | `pnpm lint`                                                         | 9/9 tasks, zero warnings                   |
| PR            | `gh pr view 1189`                                                   | merged (commit `f84b58a7`), linked to #722 |

## Skills Used

- `github-workflow-automation` — GitHub App permission model: confirmed `issues: write` absent from `on-pull.yml` (403 on issue edit/comment/create), `workflows` permission required for workflow-file pushes; PR creation/merge policy (sync to default branch, single branch per PR, merge only when conflict-free + checks green).
- `planning` (`.opencode/skills/planning`) — structured multi-step tracking of the issue-manager cycle.

## Action Log

| Timestamp (UTC) | Action                        | Target                                                                     | Result                                  |
| --------------- | ----------------------------- | -------------------------------------------------------------------------- | --------------------------------------- |
| 20:0x           | Phase 0 entry decision        | 0 PRs / 82 issues                                                          | ISSUE MANAGER MODE                      |
| 20:0x           | Permission probe              | `gh issue edit` / `comment` / REST PATCH                                   | 403 — `issues: write` absent            |
| 20:1x           | P0/P1 + fresh re-verification | #496/#480/#498/#500/#501/#515/#549/#550/#551/#581/#632/#721/#724/#786 + 15 | All resolved in code                    |
| 20:1x           | Repair target selection       | B. SYSTEM QUALITY / Security Practices (60) → #722                         | gap: env validation untested            |
| 20:2x           | Test file written             | `packages/common/src/config/env-validation.test.ts`                        | 13 tests (prod-throw via module reload) |
| 20:3x           | Quality gates                 | typecheck / lint / test                                                    | clean / 9/9 zero-warnings / 1652/1652   |
| 20:3x           | PR created + merged           | `test/env-validation-722-loop71` → PR #1189                                | merged (commit `f84b58a7`)              |

## Final State

- **Status**: Repair delivered (PR #1189 merged → issue #722 env-validation coverage gap closed). Loop 70's PR #1187 (issue #609) confirmed merged (`05de225`); both #609 and #722 remain open only because closing requires `issues: write`. All P0/P1 verified resolved; Steps 1–3 analysis complete but **not applied** (blocked on `issues: write`).
- **Waiting for human review**: none new this loop (prior flag unchanged: `command-palette.tsx` dead-code decision from loop 67).
- **Blocked (token upgrade needed)**: Steps 1–3 (needs `issues: write`); pnpm-in-CI cluster #305/#584/#595/#670/#744, CI Node-version bump (Stability 40), CI/CD Health (50), Release & Rollback Safety (55), #650, #728 (need `workflows: write`).
- **Known accepted risk**: 1 moderate `@opentelemetry/core` advisory scoped to build-time `contentlayer2` (documented in commit `9c16f6a`); fixing it would break the build.
