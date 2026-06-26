# Issue Tracker Audit Report — 2026-06-26

## Summary

- **Total open issues**: 82
- **Build**: ✅ Clean (8 typecheck, 8 lint tasks)
- **Tests**: ✅ 1371/1371 passing (64 test files)
- **Token constraints**: Cannot modify issue labels/comments, cannot push workflow files

## Priority Label Recommendations

The following issues need priority labels (P0-P3) applied. Recommended priorities based on issue content:

### P1 (High) — Missing Priority Labels

| Issue | Title                                                | Reason                                   |
| ----- | ---------------------------------------------------- | ---------------------------------------- |
| #786  | Stripe webhook logs partial secret                   | Security issue (already fixed in code)   |
| #785  | Fix duplicate next dependency                        | Bug (already fixed in code)              |
| #754  | Add integration tests for Stripe webhook idempotency | Security/Reliability (already fixed)     |
| #728  | Add security scanning workflows to CI                | Security — **needs workflow permission** |
| #724  | Missing e2e test coverage for critical flows         | User-facing (already partially fixed)    |
| #722  | Add environment variable validation at startup       | Security (already fixed)                 |
| #721  | Add explicit authorization checks                    | Security (already fixed)                 |
| #632  | Audit error logging for sensitive data               | Security (already fixed)                 |

### P2 (Medium) — Missing Priority Labels

| Issue | Title                                         |
| ----- | --------------------------------------------- |
| #788  | Add unit tests for critical UI components     |
| #787  | Add unit tests for packages/db migrations     |
| #753  | Route-based code splitting for dashboard      |
| #752  | Create unified CLI output utilities           |
| #751  | Optimize tRPC router bundle size              |
| #748  | .nvmrc contains invalid value (already fixed) |
| #744  | fix(ci): pnpm consistency in iterate.yml      |
| #725  | Add integration tests for API routers         |
| #723  | High number of client components              |
| #719  | Missing root-level TypeScript configuration   |
| #713  | Add unit tests for packages/common            |
| #697  | Fix corrupted text formatting (already fixed) |
| #634  | Audit and enforce TypeScript strictness       |
| #631  | Add API router tests for k8s/customer/stripe  |
| #628  | Implement E2E testing with Playwright         |

### P3 (Low) — Missing Priority Labels

| Issue | Title                                          |
| ----- | ---------------------------------------------- |
| #789  | Add peerDependencies for React (already fixed) |
| #755  | Add composite index (already fixed)            |
| #749  | AI-powered API endpoint testing                |
| #731  | Auto-generate API documentation                |
| #729  | Add bundle size regression testing             |
| #727  | AI-Powered Code Review Automation              |
| #726  | Add dependency consistency checking to CI      |
| #720  | Missing .nvmrc (already fixed)                 |
| #668  | AI-Native: Cluster diagnostics                 |
| #636  | Add ISR caching for dashboard data             |
| #635  | Create developer onboarding guide              |
| #630  | Enhance pre-commit hooks                       |

## Duplicate and Overlapping Issues

### Group A: CI pnpm Consistency — 5 DUPLICATE ISSUES

All describe the same problem: iterate.yml uses `npm ci` instead of `pnpm install`.

| Issue | Date   | Status               |
| ----- | ------ | -------------------- |
| #305  | Feb 20 | OPEN — earliest      |
| #584  | Feb 25 | OPEN                 |
| #595  | Feb 25 | OPEN                 |
| #670  | Feb 25 | OPEN — has P3 label  |
| #744  | Feb 27 | OPEN — most detailed |

**Recommendation**: Close #584, #595, #670, #744 as duplicates of #305. Fix blocked by `workflows` permission.

### Group B: E2E Testing — 3 OVERLAPPING

| Issue     | Title                                 | Status                                   |
| --------- | ------------------------------------- | ---------------------------------------- |
| #501 (P1) | Implement Playwright E2E tests        | Partially done (11 test files now exist) |
| #628      | Implement E2E testing with Playwright | Overlaps with #501                       |
| #724      | Missing e2e test coverage             | Partially done                           |

**Recommendation**: Close #628 as duplicate of #501. Update #724 with current coverage gaps.

### Group C: API Router Testing — 3 OVERLAPPING

| Issue     | Title                                        |
| --------- | -------------------------------------------- |
| #551 (P1) | Add tests for k8s router                     |
| #631      | Add API router tests for k8s/customer/stripe |
| #725      | Add integration tests for API routers        |

**Recommendation**: Consolidate into #551 (has P1 label). Close #631 and #725 as duplicates.

### Group D: Rate Limiter Redis — 2 DUPLICATE (RESOLVED)

| Issue     | Title                                                 |
| --------- | ----------------------------------------------------- |
| #480      | Replace in-memory rate limiter with Redis             |
| #496 (P0) | Replace in-memory rate limiter with distributed store |

**Status**: Resolved — `packages/api/src/distributed-rate-limiter.ts` exists with Redis support.

### Group E: .nvmrc — 2 DUPLICATE (RESOLVED)

| Issue | Title                              |
| ----- | ---------------------------------- |
| #720  | Missing .nvmrc                     |
| #748  | .nvmrc contains invalid value '20' |

**Status**: Resolved — `.nvmrc` contains `22.14.0`. Fix committed in `de2d52b`.

### Group F: Secret Logging — 2 OVERLAP (RESOLVED)

| Issue | Title                                          |
| ----- | ---------------------------------------------- |
| #632  | Audit error logging for sensitive data leakage |
| #786  | Stripe webhook logs partial secret             |

**Status**: Resolved — webhook route no longer logs secrets. Fix in `f0202b4`.

### Group G: Bundle Analysis — 2 RELATED

| Issue     | Title                                                 |
| --------- | ----------------------------------------------------- |
| #708 (P3) | Configure bundle analyzer for production optimization |
| #729      | Add bundle size regression testing                    |

**Recommendation**: Keep both but link them. Different focus (tooling vs CI regression).

### Group H: Security Middleware — 3 OVERLAPPING (RESOLVED)

| Issue     | Title                             |
| --------- | --------------------------------- |
| #498 (P1) | Replace email-based admin RBAC    |
| #688 (P2) | Create Next.js middleware.ts      |
| #721      | Add explicit authorization checks |

**Status**: Resolved — RBAC implemented in `trpc.ts`, middleware exists, E2E tests for authorization.

## Issues Already Resolved in Code (Still Open)

These issues have been addressed by merged PRs but were not auto-closed:

| Issue | Title                                  | Fix Commit/PR                        |
| ----- | -------------------------------------- | ------------------------------------ |
| #632  | Audit error logging for sensitive data | `f0202b4`                            |
| #666  | Add global error boundary              | PR #672                              |
| #663  | Consolidate eslint-disable comments    | PR #878                              |
| #664  | Replace console.\* with pino (stripe)  | `9aa624e`                            |
| #685  | React performance optimizations        | `2a65066` (PR #702)                  |
| #697  | Fix corrupted text formatting          | PR #850                              |
| #722  | Env variable validation at startup     | `5adec30`                            |
| #748  | .nvmrc invalid value                   | PR #758                              |
| #754  | Stripe webhook idempotency tests       | PR #802                              |
| #755  | Composite index for subscriptions      | `5dc4c43`                            |
| #785  | Duplicate next dependency              | Resolved (no duplicate in file)      |
| #786  | Stripe webhook logs partial secret     | Fixed in current code                |
| #789  | Add peerDependencies for React         | Already in package.json              |
| #496  | Distributed rate limiter (Redis)       | `distributed-rate-limiter.ts` exists |
| #498  | Admin RBAC                             | `0c7c97a`                            |
| #515  | CSRF protection                        | `408b9e3`                            |
| #550  | Include apps/nextjs in test config     | Already in vitest config             |

## Repository Health

| Metric    | Result                           |
| --------- | -------------------------------- |
| Typecheck | ✅ 8/8 packages pass             |
| Lint      | ✅ 8/8 packages pass             |
| Tests     | ✅ 1371/1371 pass (64 files)     |
| P0 issues | 1 open (#496 — resolved in code) |
| P1 issues | 13 open (most resolved in code)  |

## Action Items

1. **Issue label write access**: No token has issue modification permissions. Need a PAT with `issues: write` scope.
2. **Workflows permission**: No token has `workflows` permission. Fixing iterate.yml pnpm issue requires this.
3. **Close resolved issues**: ~15 issues are resolved in code but still open. Need someone to close them.
4. **Deduplicate**: 5 issues about pnpm CI consistency, 3 about E2E testing, 3 about API testing.
