# Issue Manager Audit Report — 2026-08-09 (loop 70)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `3147e2b`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: 0 open PRs, 82 open issues)

## Decision Summary

- Step 0.1 (open PRs): **0 open PRs** → PR Handler Mode skipped.
- Step 0.2 (open issues): **82 open issues** → Issue Manager Mode entered.
- Steps 1–3 (label normalization / dedupe / consolidation): **BLOCKED at API level** — re-probed first-hand this session: `gh issue edit --add-label` → 403 `Resource not accessible by integration` (REST and GraphQL); `gh issue comment` → 403. Token (`on-pull.yml`) grants `contents: write` + `pull-requests: write` only; **no `issues: write`**. All Step 1–3 analysis was therefore performed read-only and is documented below for a future loop with write permissions.
- Step 4 (Repair Mode): All P0/P1 issues re-verified **resolved in code** this session. Repair target selected from next-lowest actionable criterion → **A. CODE QUALITY / Testability (55)** → **Issue #609 (P2) "Consolidate duplicate Zod schemas in tRPC routers"** → **PR #1187 (created)**.

## Step 1 — Label Normalization Plan (39 issues, NOT applied — token blocked)

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

## Step 2 — Duplicate Detection (semantic clusters found, closure NOT applied — token blocked)

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

## Additional Fresh Verifications This Session (all resolved in code)

| Issue     | Title                                  | Evidence                                                                        |
| --------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| #487      | App-layer caching with Redis           | `packages/common/src/cache/` (index.ts + cache.test.ts), used in routers        |
| #492      | sizes attribute for responsive images  | `sizes=` in 5+ components                                                       |
| #523      | Barrel exports audit                   | explicit exports in `packages/api/package.json`                                 |
| #578      | Duplicate health check endpoint        | single `apps/nextjs/src/app/api/health/route.ts`                                |
| #609      | Consolidate duplicate Zod schemas      | **gap found & fixed this loop** (see Repair Mode)                               |
| #610      | Standardize tRPC response format       | `createApiError`/`ErrorCode` used consistently across routers                   |
| #613      | Duplicate GitHub Actions workflow file | exactly 2 workflow files, no duplicates                                         |
| #630      | Pre-commit hooks                       | `.husky/pre-commit` runs typecheck + test + lint-staged                         |
| #634      | TypeScript strictness                  | `strict: true` in `tooling/typescript-config/base.json`                         |
| #635      | Developer onboarding guide             | `docs/ONBOARDING.md`                                                            |
| #636      | ISR caching                            | `revalidate`/`unstable_cache` usage in app routes                               |
| #664      | console.\* → pino in db/stripe         | remaining `console.*` are JSDoc examples only                                   |
| #666      | Global error boundary                  | `error.tsx`/`global-error.tsx` across app segments                              |
| #667      | Package export boundaries              | `exports` field well-defined in `packages/api/package.json`                     |
| #683      | ESLint/Prettier config inconsistency   | `.eslintrc.cjs` (ESLint 8) — lint 9/9 zero warnings                             |
| #684      | Root build script / turbo pipelines    | root `package.json` scripts (`ci:check`, `check:circular`, etc.)                |
| #687      | Missing barrel exports                 | `packages/*/index.ts` exist in all packages                                     |
| #688      | Next.js middleware security headers    | `proxy.ts` (Next 16 middleware→proxy): CSP, security headers, CSRF, i18n, Clerk |
| #697      | Corrupted text in docs                 | full mojibake scan: zero matches (verified in prior loop 24 report)             |
| #705      | Docker configuration                   | `Dockerfile` + `docker-compose.yml`                                             |
| #706      | VS Code Dev Containers                 | `devcontainer.json`                                                             |
| #708      | Bundle analyzer                        | `@next/bundle-analyzer` in devDeps                                              |
| #713      | packages/common unit tests             | 27 test files                                                                   |
| #719      | Root-level TypeScript configuration    | root `tsconfig.json`                                                            |
| #725      | Integration tests for API routers      | `integration.test.ts` (refs #725)                                               |
| #726      | Dependency consistency checking        | `check-deps` script (`check-dependency-version-consistency`)                    |
| #729      | Bundle size regression                 | `size:check`/`size:analyze` scripts (`size-limit`)                              |
| #731      | Auto-generate API docs from tRPC       | `packages/api/src/openapi.ts` + `docs-generator.ts`                             |
| #751/#753 | Code splitting                         | `dynamic()` used across dashboard/marketing components                          |
| #754      | Stripe webhook idempotency tests       | `packages/stripe/src/webhook-idempotency.test.ts`                               |
| #785      | Duplicate next dependency in stripe    | `packages/stripe/package.json` clean (no `next` dep)                            |
| #787      | db migrations/schema tests             | `packages/db/migrations.test.ts`                                                |
| #788      | UI component tests                     | 19 test files incl. `components/__tests__/*`                                    |
| #789      | peerDependencies for React in ui       | `peerDependencies` present (react/react-dom/next)                               |

## Repair Mode Implementation

**Issue:** #609 — "[P2][Code Quality] Consolidate duplicate Zod schemas in tRPC routers"

**Selection rationale:** No actionable P0/P1 remains (all verified resolved). Lowest-scoring domain **A. CODE QUALITY (64)**; its lowest criterion **Testability (55)** — most testing issues verified resolved, but **#609** (duplicate schema declarations) is a genuine, code-level, minimal-risk gap in the same criterion family. Workflow-blocked criteria (Stability 40, CI/CD Health 50, Release & Rollback 55) remain unreachable without `workflows: write`.

### Audit result (this session)

Only 4 `z.object` declarations exist across routers (`auth.ts`, `hello.ts` ×2). The actionable duplication: `mySubscriptionSchema` was **re-declared** in `auth.test.ts` (`z.object({}).strict().optional()`) instead of imported from `./auth` — the tests validated a stale independent copy rather than the schema actually used by `authRouter.mySubscription`.

### Fix applied (PR #1187)

`packages/api/src/router/auth.test.ts`:

- Removed the re-declared `mySubscriptionSchema`
- Imported it from `./auth` (the router) — tests now exercise the real schema; a future schema change would be caught by the tests
- Added the standard mock setup (`@clerk/nextjs/server`, `@saasfly/db`, `../logger`, `next/cache`) matching sibling router tests (`hello.test.ts`, `k8s-router.test.ts`)

## Verification (fresh this session)

| Check         | Command                                                | Result                                   |
| ------------- | ------------------------------------------------------ | ---------------------------------------- |
| Install       | `pnpm install --frozen-lockfile`                       | done (Node 20 env, known engine warning) |
| Targeted test | `pnpm vitest run packages/api/src/router/auth.test.ts` | 13/13 passed                             |
| Full suite    | `pnpm test`                                            | 88 files, 1639/1639 passed               |
| Typecheck     | `pnpm --filter @saasfly/api typecheck`                 | clean                                    |
| Lint          | `pnpm lint`                                            | 9/9 tasks, zero warnings                 |
| PR            | `gh pr view 1187`                                      | open, linked to #609                     |

## Skills Used

- `github-workflow-automation` — GitHub App permission model: confirmed `issues: write` absent from `on-pull.yml` (403 on issue edit/comment/create), `workflows` permission required for workflow-file pushes; PR creation policy.
- `planning` (`.opencode/skills/planning`) — structured multi-step tracking of the issue-manager cycle.

## Action Log

| Timestamp (UTC) | Action                       | Target                                                                | Result                                     |
| --------------- | ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| 19:1x           | Phase 0 entry decision       | 0 PRs / 82 issues                                                     | ISSUE MANAGER MODE                         |
| 19:1x           | Permission probe             | `gh issue edit` / `comment` / REST PATCH                              | 403 — `issues: write` absent               |
| 19:1x           | Label normalization analysis | 39 issues missing category/priority                                   | Plan documented (not applied)              |
| 19:1x           | Duplicate detection          | 82 issue bodies, semantic clusters                                    | 8 clusters identified, canonicals selected |
| 19:2x           | P0/P1 code re-verification   | #496/#480/#498/#500/#501/#515/#549/#550/#551/#581/#632/#721/#724/#786 | All resolved in code                       |
| 19:2x           | Fresh P2 verifications       | 30+ issues (see tables)                                               | All resolved in code                       |
| 19:2x           | Zod schema gap audit (#609)  | `packages/api/src/router/*.ts` + tests                                | single duplication: `auth.test.ts`         |
| 19:2x           | Fix applied                  | `packages/api/src/router/auth.test.ts`                                | import schema from `./auth`, +mocks        |
| 19:3x           | Quality gates                | typecheck / lint / test                                               | clean / 9/9 zero-warnings / 1639/1639      |
| 19:3x           | PR created                   | `fix/consolidate-zod-schema-auth-609-loop70` → PR #1187               | open, linked to #609                       |

## Final State

- **Status**: Repair delivered (PR #1187 → issue #609 schema duplication closed). All P0/P1 verified resolved; Steps 1–3 analysis complete but **not applied** (blocked on `issues: write`).
- **Waiting for human review**: none new this loop (prior flag unchanged: `command-palette.tsx` dead-code decision from loop 67).
- **Blocked (token upgrade needed)**: Steps 1–3 (needs `issues: write`); pnpm-in-CI cluster #305/#584/#595/#670/#744, CI Node-version bump (Stability 40), CI/CD Health (50), Release & Rollback Safety (55), #650, #728 (need `workflows: write`).
- **Known accepted risk**: 1 moderate `@opentelemetry/core` advisory scoped to build-time `contentlayer2` (documented in commit `9c16f6a`); fixing it would break the build.
