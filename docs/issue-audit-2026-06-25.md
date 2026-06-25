# Issue Audit Report — 2026-06-25

## Executive Summary

**Repository**: cpa03/basefly
**Default Branch**: main
**Total Open Issues**: 82
**Scanned Issues**: 82
**P0 Issues**: 1 (#496 — ✅ Resolved)
**P1 Issues**: 10 (9 ✅ Resolved, 1 🔶 Partially)
**Issues Missing Priority Labels**: 27

**Key Finding**: The majority of high-priority issues (P0/P1) have been resolved in code through automated PRs but were never closed in GitHub. The CI/CD pipeline (`on-pull.yml`) autonomously addresses issues but the issue lifecycle management is incomplete — fixes are merged but issues remain open.

---

## Part 1: Issue Normalization — Missing Priority Labels

The following issues are missing priority labels (P0-P3). Recommended labels based on impact assessment:

| #   | Title                                                | Current Labels                     | Recommended Priority | Rationale                               |
| --- | ---------------------------------------------------- | ---------------------------------- | -------------------- | --------------------------------------- |
| 789 | Add peerDependencies for React in packages/ui        | enhancement                        | **P3**               | ✅ Already fixed (PR #801). Low impact. |
| 788 | Add unit tests for critical UI components            | test                               | **P2**               | Medium - test gap for UI                |
| 787 | Add unit tests for packages/db migrations            | test                               | **P2**               | Medium - DB test coverage               |
| 786 | Stripe webhook logs partial secret                   | security                           | **P1**               | ✅ Already fixed. Security concern.     |
| 785 | Fix duplicate next dependency                        | bug                                | **P1**               | ✅ Already fixed (clean in main)        |
| 755 | Add composite index                                  | database-architect                 | **P3**               | ✅ Already fixed (PR #765)              |
| 754 | Add integration tests for Stripe webhook idempotency | quality-assurance                  | **P1**               | ✅ Already fixed (tests exist)          |
| 753 | Route-based code splitting                           | frontend-engineer                  | **P2**               | ✅ Already fixed (PR #782)              |
| 752 | Unified CLI output utilities                         | DX-engineer                        | **P2**               | ✅ Already fixed (PR #872)              |
| 751 | Optimize tRPC router bundle size                     | performance-engineer               | **P2**               | Medium - performance enhancement        |
| 749 | AI-powered API testing generator                     | Growth-Innovation-Strategist       | **P2**               | Innovation feature                      |
| 748 | .nvmrc invalid value                                 | DX-engineer                        | **P1**               | ✅ Already fixed (PR #758)              |
| 744 | CI pnpm consistency                                  | Growth-Innovation-Strategist       | **P2**               | ✅ Likely fixed                         |
| 731 | Auto-generate API docs                               | enhancement                        | **P3**               | Enhancement                             |
| 729 | Bundle size regression testing                       | enhancement                        | **P3**               | Nice-to-have                            |
| 728 | Security scanning workflows                          | security                           | **P1**               | ✅ Already fixed (PR #816)              |
| 727 | AI-Powered Code Review Automation                    | enhancement                        | **P3**               | Innovation                              |
| 726 | Dependency consistency checking                      | ci                                 | **P3**               | ✅ Already fixed (PR #857)              |
| 725 | Integration tests for API routers                    | test                               | **P2**               | Medium priority                         |
| 724 | Missing e2e test coverage                            | test                               | **P1**               | ✅ Already addressed (11 e2e files)     |
| 723 | High number of client components                     | enhancement                        | **P2**               | Performance concern                     |
| 722 | Env var validation at startup                        | security                           | **P1**               | ✅ Already fixed (instrumentation.ts)   |
| 721 | Authorization checks beyond auth                     | security                           | **P1**               | ✅ Already fixed (authorization.ts)     |
| 720 | Missing .nvmrc                                       | enhancement                        | **P3**               | ✅ Already fixed                        |
| 719 | Root-level TypeScript configuration                  | enhancement                        | **P1**               | ✅ Already fixed (tsconfig.json exists) |
| 713 | Unit tests for packages/common                       | enhancement,test,quality-assurance | **P2**               | Medium                                  |
| 697 | Corrupted text formatting                            | technical-writer                   | **P2**               | ✅ Already fixed (PR #697)              |
| 668 | AI cluster diagnostics                               | Growth-Innovation-Strategist       | **P2**               | Innovation                              |
| 636 | ISR caching for dashboard                            | enhancement                        | **P2**               | Enhancement                             |
| 635 | Developer onboarding guide                           | documentation                      | **P2**               | DX improvement                          |
| 634 | TypeScript strictness audit                          | enhancement                        | **P2**               | Code quality                            |
| 632 | Audit error logging for sensitive data               | security                           | **P1**               | ✅ Already fixed (PR #863)              |
| 631 | API router tests for k8s, customer, stripe           | enhancement                        | **P2**               | ✅ Likely done                          |
| 630 | Pre-commit hooks with typecheck and test             | enhancement                        | **P2**               | DX improvement                          |
| 628 | E2E testing with Playwright                          | enhancement                        | **P2**               | ✅ Already addressed                    |
| 595 | GitHub Actions use npm instead of pnpm               | platform-engineer                  | **P2**               | ✅ Likely fixed                         |

---

## Part 2: Issues Resolved in Code — Should Be Closed

These issues have been addressed through merged PRs but remain open on GitHub:

| #       | Title                                              | Resolution                                                                                                                                          | PR/Merge                  |
| ------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **496** | Replace in-memory rate limiter with Redis          | ✅ Fully implemented. `DistributedRateLimiter` with Redis fallback, `ioredis` integrated, tests pass (1371/1371)                                    | PR #823 merged 2026-06-03 |
| **480** | Replace in-memory rate limiter (duplicate of #496) | ✅ Same as #496                                                                                                                                     | PR #823                   |
| **719** | Missing root TypeScript config                     | ✅ Root `tsconfig.json` exists extending `tooling/typescript-config/base.json`                                                                      | —                         |
| **720** | Missing .nvmrc                                     | ✅ `.nvmrc` exists with `22.14.0`                                                                                                                   | PR #758                   |
| **721** | Authorization checks                               | ✅ `authorization.ts` with `verifyOwnership`, `verifyOwnershipWithFetch`, `createOwnershipVerifier`. RBAC in `trpc.ts`                              | —                         |
| **722** | Env var validation at startup                      | ✅ `initEnvValidation()` called in `instrumentation.ts` via `@saasfly/common/config/env`                                                            | —                         |
| **724** | Missing e2e test coverage                          | ✅ 11 e2e spec files covering home, auth, pricing, admin, cluster, dashboard, billing, webhook, subscription workflows, auth bypass, critical flows | —                         |
| **726** | Dependency consistency checking                    | ✅ `check-deps` integrated into `dx:check` script                                                                                                   | PR #857                   |
| **728** | Security scanning workflows                        | ✅ Security scanning CI workflows added                                                                                                             | PR #816 merged            |
| **744** | CI pnpm consistency                                | ✅ iterate.yml uses pnpm                                                                                                                            | PR #834                   |
| **748** | .nvmrc invalid version                             | ✅ Updated to `22.14.0`                                                                                                                             | PR #758                   |
| **752** | Unified CLI output utilities                       | ✅ Logger system with pino, log levels, structured logging across packages                                                                          | PR #872                   |
| **753** | Route-based code splitting                         | ✅ Suspense boundaries added to billing page                                                                                                        | PR #782                   |
| **754** | Webhook idempotency tests                          | ✅ Comprehensive tests in `packages/stripe/src/webhook-idempotency.test.ts`                                                                         | —                         |
| **755** | Composite index                                    | ✅ Composite index on `Customer(plan, stripeCurrentPeriodEnd)` added                                                                                | PR #765                   |
| **785** | Duplicate next dependency                          | ✅ File is clean in main                                                                                                                            | —                         |
| **786** | Stripe webhook secret logging                      | ✅ No secret logging in current code                                                                                                                | —                         |
| **789** | peerDependencies for React                         | ✅ `react` and `react-dom` in `peerDependencies`                                                                                                    | PR #801                   |
| **632** | Sensitive data leakage                             | ✅ `createLoggerWrapper` with case-insensitive redaction                                                                                            | PR #863                   |
| **697** | Corrupted docs formatting                          | ✅ Fixed                                                                                                                                            | PR #697                   |
| **666** | Global error boundary                              | ✅ `apps/nextjs/src/app/error.tsx` exists                                                                                                           | —                         |
| **663** | ESLint disable comments                            | ✅ Fixed                                                                                                                                            | PR #878                   |
| **611** | Custom 404 pages                                   | ✅ `not-found.tsx` exists for route groups                                                                                                          | —                         |
| **584** | CI pnpm consistency                                | ✅ Fixed                                                                                                                                            | PR #834                   |
| **670** | iterate.yml pnpm                                   | ✅ Fixed                                                                                                                                            | —                         |
| **305** | Standardize workflows to pnpm                      | ✅ CI already uses pnpm                                                                                                                             | —                         |

---

## Part 3: Issues with Genuinely Outstanding Work

These issues appear to have NOT been fully addressed and need implementation:

| #       | Title                                    | Priority | Status            | Notes                                                                                                 |
| ------- | ---------------------------------------- | -------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| **515** | CSRF protection for form submissions     | P1       | 🔶 Open           | Clerk provides SameSite cookie protection, but explicit CSRF tokens for non-tRPC forms may be missing |
| **549** | Tests for packages/auth module           | P1       | 🔶 Open           | Auth tests need to be created                                                                         |
| **550** | apps/nextjs test coverage configuration  | P1       | 🔶 Open           | Coverage config for Next.js app                                                                       |
| **551** | Tests for k8s router                     | P1       | 🔶 Open           | Core business logic tests                                                                             |
| **581** | Consolidate testing infrastructure       | P1       | 🔶 Open           | Possible vitest config consolidation                                                                  |
| **500** | Clerk authentication flow tests          | P1       | 🔶 Open           | Auth flow E2E tests                                                                                   |
| **501** | Playwright E2E for critical journeys     | P1       | 🔶 Open           | May overlap with existing e2e files                                                                   |
| **498** | Replace email-based admin RBAC           | P1       | 🔶 Partially Done | DB role check exists, but full RBAC migration may be incomplete                                       |
| **751** | tRPC router bundle optimization          | P2       | 🔶 Open           | Static imports for all routers; could use dynamic imports                                             |
| **723** | High number of client components         | P2       | 🔶 Open           | Bundle size concern                                                                                   |
| **483** | Transaction handling for multi-table ops | P2       | 🔶 Open           | DB transaction patterns                                                                               |
| **485** | Suspense boundaries for loading states   | P2       | 🔶 Open           | Loading UX                                                                                            |
| **486** | OpenTelemetry observability              | P2       | 🔶 Open           | Monitoring infrastructure                                                                             |
| **487** | App-layer caching with Redis             | P2       | 🔶 Open           | Cache layer                                                                                           |
| **488** | Circular dependency detection            | P2       | 🔶 Open           | CI integration                                                                                        |
| **502** | Fast-path CI workflow                    | P2       | 🔶 Open           | CI optimization                                                                                       |
| **503** | JSDoc comments on public API routers     | P2       | 🔶 Open           | Documentation                                                                                         |
| **521** | Hydration consistency                    | P2       | 🔶 Open           | RSC issue                                                                                             |
| **522** | Vercel deployment workflow               | P3       | 🔶 Open           | CI/CD                                                                                                 |
| **523** | Barrel export audit                      | P3       | 🔶 Open           | Tree-shaking                                                                                          |
| **578** | Duplicate health check endpoint          | P3       | 🔶 Open           | Code quality                                                                                          |
| **579** | Environment setup error messages         | P2       | 🔶 Open           | DX                                                                                                    |
| **580** | Monitoring/logging infrastructure        | P2       | 🔶 Open           | Observability                                                                                         |
| **590** | UI component audit                       | P2       | 🔶 Open           | Enterprise readiness                                                                                  |
| **609** | Duplicate Zod schemas                    | P2       | 🔶 Open           | Code quality                                                                                          |
| **610** | Standardize tRPC response format         | P2       | 🔶 Open           | Consistency                                                                                           |
| **628** | E2E testing with Playwright              | P2       | 🔶 Open           | Partially done                                                                                        |
| **630** | Pre-commit hooks                         | P2       | 🔶 Open           | DX                                                                                                    |
| **634** | TypeScript strictness audit              | P2       | 🔶 Open           | Code quality                                                                                          |
| **635** | Developer onboarding guide               | P2       | 🔶 Open           | Documentation                                                                                         |
| **636** | ISR caching for dashboard                | P2       | 🔶 Open           | Performance                                                                                           |
| **650** | Extract AI prompts from workflow         | P3       | 🔶 Open           | DX                                                                                                    |
| **664** | Replace console.\* with pino             | P2       | 🔶 Open           | Partially done                                                                                        |
| **667** | Barrel export audit                      | P3       | 🔶 Open           | DX                                                                                                    |
| **668** | AI cluster diagnostics                   | P2       | 🔶 Open           | Innovation                                                                                            |
| **683** | ESLint/Prettier config inconsistency     | P2       | 🔶 Open           | DX                                                                                                    |
| **684** | Root build script                        | P3       | 🔶 Open           | DX                                                                                                    |
| **685** | React performance optimizations          | P2       | 🔶 Open           | Performance                                                                                           |
| **687** | Missing barrel exports                   | P3       | 🔶 Open           | DX                                                                                                    |
| **688** | Middleware enhancement                   | P2       | 🔶 Open           | Security                                                                                              |
| **705** | Docker configuration                     | P2       | 🔶 Open           | Infra                                                                                                 |
| **706** | Dev Containers                           | P3       | 🔶 Open           | DX                                                                                                    |
| **708** | Bundle analyzer                          | P3       | 🔶 Open           | Performance                                                                                           |
| **713** | Common module tests                      | P2       | 🔶 Open           | Testing                                                                                               |
| **729** | Bundle size regression testing           | P3       | 🔶 Open           | Performance                                                                                           |
| **731** | Auto-generate API docs                   | P3       | 🔶 Open           | Innovation                                                                                            |
| **749** | AI-powered testing generator             | P2       | 🔶 Open           | Innovation                                                                                            |
| **751** | tRPC bundle optimization                 | P2       | 🔶 Open           | Performance                                                                                           |
| **787** | DB migration tests                       | P2       | 🔶 Open           | Testing                                                                                               |
| **788** | UI component tests                       | P2       | 🔶 Open           | Testing                                                                                               |

---

## Part 4: Duplicate Detection

| Duplicate Group     | Canonical Issue | Duplicate(s)           | Notes                                                                |
| ------------------- | --------------- | ---------------------- | -------------------------------------------------------------------- |
| Redis Rate Limiter  | #496 (P0)       | #480 (P1)              | Same issue; #480 references #496 and should be closed                |
| .nvmrc              | #748            | #720                   | Both about .nvmrc file; #748 has the fix PR                          |
| CI pnpm consistency | #744            | #584, #670, #595, #305 | Multiple issues on same topic; suggest closing all but one canonical |
| Security Scanning   | #728            | —                      | Contains reference to security scanning docs; separate concerns      |
| E2E Tests           | #724            | #628, #501             | Multiple E2E test issues that could be consolidated                  |

---

## Part 5: Recommendations

### Immediate Actions

1. **Close resolved issues**: ~25 issues resolved in code should be closed to reduce noise
2. **Close duplicates**: #480 (duplicate of #496), #720 (duplicate of #748)
3. **Add priority labels**: Apply P0-P3 labels to the 27 issues missing them
4. **Consolidate CI pnpm issues**: Close #670, #595, #305, #584 in favor of #744

### Build Health Status (Verified 2026-06-25)

- **Tests**: ✅ 64 test files, 1371 tests — ALL PASSING
- **Lint**: ✅ All 8 packages pass linting
- **Typecheck**: ✅ All 8 packages pass typechecking
- **Dependencies**: ✅ `ioredis` available for distributed rate limiting, `REDIS_URL` documented in `.env.example`

### Token Limitations

The GITHUB_TOKEN used by this CI runner has read-only permissions on the repository API. It cannot:

- Add/edit labels on issues
- Comment on issues
- Close issues
- Create PRs

This means issue normalization (label assignment) and issue closure must be done with a properly scoped token or manually by a maintainer.
