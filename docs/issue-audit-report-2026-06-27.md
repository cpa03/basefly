# Issue Audit Report — 2026-06-27

## Executive Summary

- **Total open issues**: 30
- **Already fixed but not closed**: 26+
- **Genuinely unfixed issues**: 4-6 (all low/medium priority)
- **Build status**: Fails in CI (Node 20 → needs Node 22)
- **Test status**: 1396/1396 passing (67 test files)
- **Typecheck**: 8/8 packages clean

## Fixed Issues (Should Be Closed)

| Issue | Title                                                | Fix Evidence                                                 |
| ----- | ---------------------------------------------------- | ------------------------------------------------------------ |
| #789  | Add peerDependencies for React in packages/ui        | `0069a24` on main                                            |
| #788  | Add unit tests for UI components in apps/nextjs      | `26a0569` on main; `navbar.test.tsx`, `modal.test.tsx` exist |
| #787  | Add unit tests for packages/db migrations            | `ee75051` on main; `db-instance.test.ts` etc. exist          |
| #786  | Stripe webhook logs partial secret                   | `69b43e0` on main; code uses non-secret identifiers          |
| #785  | Fix duplicate next dependency in stripe              | No duplicate `next` key in `packages/stripe/package.json`    |
| #755  | Add composite index for subscriptions                | `f92d0ea` on main                                            |
| #754  | Add integration tests for Stripe webhook idempotency | `989244f` on main                                            |
| #753  | Implement route-based code splitting for dashboard   | `1ab502d` on main                                            |
| #752  | Create unified CLI output utilities                  | `0c44a3c` on main                                            |
| #751  | Optimize tRPC router bundle size with code splitting | `64b82a9` on main                                            |
| #748  | .nvmrc invalid value '20'                            | `de2d52b` on main; current `.nvmrc` = `22.14.0`              |
| #731  | Auto-generate API documentation from tRPC routers    | `e8d03c5` on main                                            |
| #728  | Add security scanning workflows to CI                | `7258ab7` on main                                            |
| #726  | Add dependency consistency checking to CI            | `1df0baf` on main                                            |
| #725  | Add integration tests for API routers                | `19c03aa` on main                                            |
| #724  | Missing e2e test coverage for critical flows         | `734f286` on main (34 e2e tests added)                       |
| #722  | Add environment variable validation at startup       | `79007ed` on main; `initEnvValidation()` in instrumentation  |
| #721  | Add explicit authorization checks                    | `0c7c97a` on main (RBAC implemented)                         |
| #720  | Missing .nvmrc                                       | Duplicate of #748 (file exists: `22.14.0`)                   |
| #719  | Missing root-level TypeScript configuration          | `2818258` on main                                            |
| #713  | Add unit tests for packages/common utility modules   | `4a00871` on main                                            |
| #708  | Configure bundle analyzer                            | `0f8024a` on main                                            |
| #706  | Add VS Code Dev Containers                           | `4f51440` on main                                            |
| #697  | Fix corrupted text formatting in documentation       | `e290045` on main                                            |

## Issues Needing Engineering Assessment

| Issue | Title                              | Priority | Notes                                                     |
| ----- | ---------------------------------- | -------- | --------------------------------------------------------- |
| #744  | CI pnpm consistency in iterate.yml | P2       | Fix identified but push blocked by `workflows` permission |
| #749  | AI-powered API endpoint testing    | P3       | Enhancement — may be partially addressed                  |
| #727  | AI-Powered Code Review Automation  | P3       | Enhancement — not investigated                            |
| #729  | Bundle size regression testing     | P2       | Testing enhancement — not investigated                    |
| #723  | High number of client components   | P2       | Bundle size investigation                                 |
| #705  | Add Docker configuration           | P2       | Infrastructure enhancement                                |

## Label Recommendations

All 30 issues need the following label corrections:

- Category labels (bug/enhancement/test/ci/security) — ~26 have them
- Priority labels (P0/P1/P2/P3) — ~25 are missing priority labels
- Apply via `gh` CLI when token permissions allow

## Environment Constraints

- Runner Node.js: v20.20.2 (requires v22.14.0)
- GitHub token: `github-actions[bot]` — no issue/PR write access, no `workflows` permission
- Build fails due to Node version mismatch (tests pass because vitest handles it)
