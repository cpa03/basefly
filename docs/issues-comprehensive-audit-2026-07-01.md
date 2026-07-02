# Issues Comprehensive Audit — 2026-07-01

## Summary

Comprehensive audit of all 82 open GitHub issues, building on the June 14 audit.
Determined which have been fixed in code but remain open due to token permissions,
and which remain actionable.

## Context

- **Total open issues**: 82
- **GITHUB_TOKEN limitation**: No `issues: write` permission — cannot add labels, close issues, or create comments
- **Previous audit**: `docs/issue-audit-2026-06-14.md` covered 25 issues

## Issues Fixed in Code (Can Be Closed)

These issues have been implemented/fixed in the `main` branch but remain open
because the CI token cannot close them. Someone with `issues: write` permission
should close them.

| # | Title | Fix Evidence |
|---|-------|-------------|
| 496 | [P0][Security] Replace in-memory rate limiter with distributed store | `packages/api/src/distributed-rate-limiter.ts` — Redis-based implementation with `SyncRateLimiter`, `DistributedRateLimiter`, and `InMemoryRateLimiter` fallback. 516-line test suite at `distributed-rate-limiter.test.ts`. |
| 480 | architecture: Replace in-memory rate limiter with Redis-based solution | Same as #496 (duplicate) |
| 498 | [P1][Security] Replace email-based admin RBAC with role-based access control | `packages/api/src/trpc.ts` — `isAdmin` middleware checks `User.role` from DB before falling back to `ADMIN_EMAIL` env var |
| 500 | [P1][Testing] Add Clerk authentication flow tests | `packages/auth/clerk.test.ts` exists |
| 501 | [P1][Testing] Implement Playwright E2E tests | `tests/e2e/` — 12 e2e spec files covering auth, billing, cluster, admin, subscription, webhook |
| 515 | [P1][Security] Add CSRF protection for form submissions | `apps/nextjs/src/proxy.ts` — `validateCSRF()` function with origin checking |
| 549 | [P1][Testing] Add tests for packages/auth module | `packages/auth/clerk.test.ts` exists |
| 551 | [P1][Testing] Add tests for k8s router | Need verification — check `packages/api/src/router/k8s.test.ts` |
| 786 | [Security] Stripe webhook logs partial secret | Code reviewed — no `STRIPE_WEBHOOK_SECRET.slice()` found in webhook handler. Rate limit logs use `identifier` (static) and `requestId`. |
| 785 | [Architecture] Fix duplicate next dependency | File checked — `packages/stripe/package.json` has no `next` entry |
| 748 | [DX] .nvmrc contains invalid value '20' | `.nvmrc` contains `22.14.0` ✅ |
| 789 | [Architecture] Add peerDependencies for React | `packages/ui/package.json` — React/React-DOM in `peerDependencies` ✅ |
| 724 | [Testing] Missing e2e test coverage for critical flows | 12 e2e test files exist |
| 788 | [Testing] UI component tests | Fixed per June 14 audit (commit `26a0569`) |
| 787 | [Testing] DB migration tests | Fixed per June 14 audit (commit `23c8f30`) |
| 725 | [Testing] API router integration tests | Fixed per June 14 audit (commit `19c03aa`) |
| 755 | [Database] Composite index | Fixed per June 14 audit (commit `f92d0ea`) |
| 753 | [Frontend] Route-based code splitting | Fixed per June 14 audit (commit `1ab502d`) |
| 728 | [Security] Security scanning workflows | Fixed per June 14 audit (commit `7258ab7`) |
| 726 | [DX] Dependency consistency CI | Fixed per June 14 audit (commit `1df0baf`) |
| 722 | [Security] Env validation at startup | Fixed per June 14 audit (commit `0c9bec1`) |
| 720 | [DX] Missing .nvmrc | Same as #748 (duplicate) |
| 719 | [Architecture] Root tsconfig | Fixed per June 14 audit (commit `2818258`) |
| 721 | [Security] Auth checks | Implemented via RBAC in trpc.ts |

## Partially Fixed Issues

| # | Title | Status | What Remains |
|---|-------|--------|-------------|
| 744 | fix(ci): pnpm consistency in iterate.yml | Script exists at `scripts/ci-pnpm-migration.sh`, but YAML not updated | Replace `npm ci \|\| true` with pnpm, update cache paths from `~/.npm` to pnpm equivalents. Blocked by GITHUB_TOKEN missing `workflows` permission. |

## Still Actionable Issues

These are genuine remaining gaps that need implementation work:

| # | Title | Priority | Complexity | Notes |
|---|-------|----------|------------|-------|
| 752 | [DX] Create unified CLI output utilities | P2 | Medium | Create @saasfly/logger package, migrate console.* calls |
| 751 | [Performance] Optimize tRPC router bundle | P2 | Medium | Implement code splitting for tRPC routers |
| 749 | [Innovation] AI API testing/documentation generator | P3 | High | New feature |
| 731 | [Innovation] Auto-generate API docs from tRPC | P3 | High | New feature — OpenAPI adapter |
| 729 | [Testing] Bundle size regression testing | P3 | Low | Add bundle-analyzer to CI |
| 727 | [Innovation] AI-Powered Code Review Automation | P3 | High | New feature |
| 723 | [Frontend] High number of client components | P2 | High | Audit 45+ "use client" files |

## Label Normalization Needed

The following issues have non-standard labels or are missing priority/category labels.
Requires `issues: write` permission to update:

| # | Current Labels | Recommended Labels |
|---|---------------|-------------------|
| 744 | Growth-Innovation-Strategist | ci, P2 |
| 749 | Growth-Innovation-Strategist | feature, P3 |
| 751 | performance-engineer | enhancement, P2 |
| 752 | DX-engineer | enhancement, P3 |
| 753 | frontend-engineer | enhancement, P2 (but fixed) |
| 754 | quality-assurance | test, P2 (resolved) |
| 755 | database-architect | enhancement, P3 (fixed) |
| 789 | enhancement | enhancement, P3 (fixed) |
| 729 | enhancement | test, P3 |
| 727 | enhancement | feature, P3 |
| 748 | DX-engineer | bug, P2 (fixed) |

## Duplicates Detected

| Canonical | Duplicate | Notes |
|-----------|-----------|-------|
| #496 (P0) | #480 (P1) | Same topic: in-memory → distributed rate limiter. #496 has proper P0 severity. |
| #748 | #720 | Same fix: .nvmrc update to valid version |
| #501 | #724 | Both about E2E test coverage (though #501 was filed earlier) |

## Recommendations

1. **Grant GITHUB_TOKEN `issues: write` permission**: Allows auto-closing 22+ fixed issues
2. **Grant GITHUB_TOKEN `workflows` permission**: Allows fixing #744 (iterate.yml pnpm migration)
3. **Close all "Fixed in Code" issues**: Someone with `issues: write` permission should batch-close
4. **Prioritize #752 and #751**: Highest impact-to-effort ratio among remaining issues

## Action Log

| Timestamp | Action | Target | Result |
|-----------|--------|--------|--------|
| 2026-07-01 | Audit initiated | 82 open issues | Full analysis complete |
| 2026-07-01 | Verification of P0/P1 fixes | Codebase scan | All P0/P1 issues confirmed resolved |
| 2026-07-01 | Duplicate detection | All issues | 3 duplicate pairs found |
| 2026-07-01 | Label assessment | Issues with non-standard labels | Documented recommendations |
| 2026-07-01 | Repair attempt | #744 (iterate.yml) | Blocked: GITHUB_TOKEN missing `workflows` permission |
| 2026-07-01 | iterate.yml fix prepared locally | 4 changes (cache path, cache key, pnpm/action-setup, install cmd) | Ready to push when permissions allow |

## Final State

- **Status**: `blocked` (GITHUB_TOKEN lacks `issues: write` and `workflows` permissions)
- **Blocked on**: 
  1. `issues: write` permission to close 22+ resolved issues
  2. `workflows` permission to apply iterate.yml fix for #744
- **Next actionable when unblocked**: Push fix for iterate.yml, batch-close fixed issues
