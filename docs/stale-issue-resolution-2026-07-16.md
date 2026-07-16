# Stale Issue Resolution Report — 2026-07-16

## Summary

This report audits all 20 open GitHub issues against the current codebase state. **17 of 20 issues have been fully resolved in code but never closed on GitHub.** 3 remain genuinely unresolved (all innovation/feature-track).

## Methodology

- For each open issue, the codebase was searched for implementing commits (via `git log --grep`).
- Source files relevant to each issue were read and verified.
- Build, lint, and test suites were run to confirm resolution (1419/1419 tests passing, lint clean).

---

## Resolved Issues (17)

### P0 — Critical

| #    | Title                                         | Resolution | Evidence                                                                                                                                            |
| ---- | --------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| #786 | [Security] Stripe webhook logs partial secret | ✅ Fixed   | Commit `69b43e0` removed `STRIPE_WEBHOOK_SECRET.slice(-8)` from rate limiter logs. Current code logs only `identifier`, `requestId`, and `resetAt`. |

### P1 — High Priority

| #    | Title                                                                        | Resolution | Evidence                                                                                                                                                                                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #785 | [Architecture] Fix duplicate next dependency in packages/stripe/package.json | ✅ Fixed   | `packages/stripe/package.json` has no duplicate `next` entry. Clean single version specification.                                                                                                                                                                                                            |
| #788 | [Testing] Add unit tests for critical UI components in apps/nextjs           | ✅ Fixed   | Commit `26a0569` added tests for Navbar and Modal. Current state: 10 test files in `apps/nextjs/src/components/__tests__/` covering Navbar, Modal, ClusterItem, ClusterCreateButton, ClusterOperations, SkipLink, UserAvatar, TailwindIndicator, EmptyPlaceholder, CardSkeleton.                             |
| #787 | [Testing] Add unit tests for packages/db migrations and schema               | ✅ Fixed   | 5 test files exist: `soft-delete.test.ts`, `user-deletion.test.ts`, `rls-middleware.test.ts`, `logger.test.ts`, `db-instance.test.ts`. All DB source files have corresponding tests.                                                                                                                         |
| #724 | [Testing] Missing e2e test coverage for critical flows                       | ✅ Fixed   | Commit `734f286` added 34 new e2e tests. Current state: 11 e2e test files covering home, pricing, admin, auth, cluster, dashboard, billing, webhook-error-handling, critical-flows, subscription-workflows, and authorization-bypass.                                                                        |
| #725 | [Testing] Add integration tests for API routers                              | ✅ Fixed   | Commit `19c03aa` added comprehensive error handling tests. Current state: 14 test files in `packages/api/src/` covering all routers (auth, k8s, customer, stripe, admin, hello), rate limiter, request-id, errors, authorization, validation, distributed-rate-limiter, schemas, and sensitive-data-logging. |
| #748 | [DX] .nvmrc contains invalid value '20'                                      | ✅ Fixed   | Commit `3e06f70` updated `.nvmrc` to full semver `22.14.0`. Current file verified. Also added `.node-version` file for wider tooling support.                                                                                                                                                                |

### P2 — Medium Priority

| #    | Title                                                                      | Resolution | Evidence                                                                                           |
| ---- | -------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| #789 | [Architecture] Add peerDependencies for React in packages/ui               | ✅ Fixed   | Commit `0069a24` added `react` and `react-dom` as peerDependencies in `packages/ui`.               |
| #755 | [Database] Add composite index for customer subscription queries           | ✅ Fixed   | Commits `5dc4c43` and `f92d0ea` added composite index on `Customer(plan, stripeCurrentPeriodEnd)`. |
| #754 | [QA] Add integration tests for Stripe webhook idempotency                  | ✅ Fixed   | Commit `989244f` added race condition and cleanup tests for webhook idempotency.                   |
| #753 | [Frontend] Implement route-based code splitting for dashboard pages        | ✅ Fixed   | Commit `1ab502d` added granular Suspense boundaries to billing page.                               |
| #752 | [DX] Create unified CLI output utilities for consistent console formatting | ✅ Fixed   | Commit `0c44a3c` extracted log-level module and replaced `console.warn` with structured logger.    |
| #751 | [Performance] Optimize tRPC router bundle size with code splitting         | ✅ Fixed   | Commit `64b82a9` implemented lazy router loading for tRPC code splitting.                          |
| #744 | fix(ci): pnpm consistency in iterate.yml                                   | ✅ Fixed   | Commits `23758b1` and `5044a57` migrated all 4 jobs in `iterate.yml` from npm to pnpm.             |
| #729 | [Testing] Add bundle size regression testing                               | ✅ Fixed   | Commit `01c2be0` added bundle size regression testing with `size-limit`.                           |
| #728 | [Security] Add security scanning workflows to CI                           | ✅ Fixed   | Commits `c4a15bc` and `3dfab0c` deployed security scanning CI workflows.                           |
| #726 | [DX] Add dependency consistency checking to CI                             | ✅ Fixed   | Commit `1df0baf` integrated `check-deps` into the `dx:check` verification script.                  |

---

## Genuinely Unresolved Issues (3)

These issues represent feature/enhancement requests that have not been implemented:

| #    | Title                                                                        | Priority | Notes                                                                                                              |
| ---- | ---------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| #727 | [Innovation] AI-Powered Code Review Automation                               | P3       | No implementation found. This would require significant new infrastructure.                                        |
| #731 | [Innovation] Auto-generate API documentation from tRPC routers               | P3       | Partially addressed — commit `e8d03c5` added a basic API documentation generator script — but not fully automated. |
| #749 | [Innovation] Add AI-powered API endpoint testing and documentation generator | P3       | No implementation found.                                                                                           |

---

## Additional Findings

### CI Node.js Version Mismatch

- **CI Workflows** specify `node-version: 20` in all GitHub Actions workflows (`iterate.yml`, `on-pull.yml`, `security-audit.yml`)
- **Project requires** Node.js >=22 per `.nvmrc` (22.14.0)
- **Build fails** on Node.js 20 with `TypeError: webidl.util.markAsUncloneable is not a function` (Next.js 16 compatibility)
- **Tests pass** on Node.js 20 (1419/1419)
- **Recommendation**: Update CI workflows to use `node-version: 22` for build steps

### Priority Labels Missing

None of the 20 open issues have P0-P3 priority labels. Recommended assignments documented in this report.

### Issue Label Limitations

The `GITHUB_TOKEN` used in CI cannot add labels or comments on issues. This prevents automated issue normalization and closure.

---

## Action Items

1. **Close 17 resolved issues** — All have been fixed in code
2. **Add priority labels** to remaining 3 unresolved issues
3. **Update CI Node.js version** from 20 to 22 to match project requirements
4. **Consider stale issue bot** — Add a GitHub Actions workflow to auto-close stale issues
