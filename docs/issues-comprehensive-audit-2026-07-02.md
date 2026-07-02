# Issues Comprehensive Audit — 2026-07-02

## Summary

Comprehensive audit of all 19 open GitHub issues. **7 issues are already resolved in code but not closed.**

| Metric                       | Count |
| ---------------------------- | ----- |
| Total open issues            | 19    |
| Already resolved (can close) | 7     |
| Needs code changes           | 2     |
| Testing/monitoring gaps      | 6     |
| Infrastructure/config        | 4     |

---

## Already Resolved (Close Candidates)

| Issue | Title                                              | Resolution Evidence                                                                                                      |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| #719  | Missing root-level TypeScript configuration        | `tsconfig.json` exists at root, extends `tooling/typescript-config/base.json`                                            |
| #720  | Missing .nvmrc for Node.js version consistency     | `.nvmrc` exists with version `22.14.0`                                                                                   |
| #722  | Add environment variable validation at startup     | `initEnvValidation()` implemented in `packages/common/src/config/env.ts`, called in `apps/nextjs/src/instrumentation.ts` |
| #748  | .nvmrc contains invalid value '20'                 | `.nvmrc` now contains `22.14.0` (valid semver). Fixed in commit `3e06f70`                                                |
| #785  | Fix duplicate next dependency in stripe            | No duplicate exists in `packages/stripe/package.json`                                                                    |
| #786  | Stripe webhook logs partial secret                 | No `secret.slice()` in webhook handler. Rate limit log uses only `identifier` and `requestId`                            |
| #789  | Add peerDependencies for React in packages/ui      | React/react-dom already in `peerDependencies` and `devDependencies` (not `dependencies`) in `packages/ui/package.json`   |
| #713  | Add unit tests for packages/common utility modules | All 3 test files exist: `email.test.ts`, `icon-sizes.test.ts`, `animation.test.ts`                                       |

## Needs Code Changes

| Issue | Title                                                   | Type        | Effort                                    |
| ----- | ------------------------------------------------------- | ----------- | ----------------------------------------- |
| #721  | Add explicit authorization checks beyond authentication | Security    | Large — implement RBAC middleware         |
| #723  | High number of client components affecting bundle size  | Performance | Medium — audit 82 `use client` directives |

## Testing/Monitoring Gaps

| Issue | Title                                                    | Notes                                                        |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------ |
| #724  | Missing e2e test coverage for critical flows             | E2E tests need Playwright/browser                            |
| #725  | Add integration tests for API routers                    | Needs tRPC test infrastructure                               |
| #729  | Add bundle size regression testing                       | New tooling needed                                           |
| #754  | Add integration tests for Stripe webhook idempotency     | Webhook idempotency already implemented, needs test coverage |
| #787  | Add unit tests for packages/db migrations and schema     | DB test infrastructure                                       |
| #788  | Add unit tests for critical UI components in apps/nextjs | Component test setup                                         |

## Infrastructure/Config

| Issue | Title                                                                 | Notes                                                                                          |
| ----- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| #705  | Add Docker configuration for containerized deployment                 | New Dockerfile + compose                                                                       |
| #706  | Add VS Code Dev Containers configuration                              | New .devcontainer config                                                                       |
| #708  | Configure bundle analyzer for production optimization                 | Dep + config change                                                                            |
| #726  | Add dependency consistency checking to CI                             | Workflow change — needs `workflows` permission                                                 |
| #728  | Add security scanning workflows to CI                                 | Workflow change — security-audit.yml created locally at `.github/workflows/security-audit.yml` |
| #744  | fix(ci): pnpm consistency in iterate.yml                              | Workflow change — iterate.yml needs pnpm fixes                                                 |
| #731  | Auto-generate API documentation from tRPC routers                     | Enhancement                                                                                    |
| #727  | AI-Powered Code Review Automation                                     | Innovation                                                                                     |
| #749  | Add AI-powered API endpoint testing and documentation generator       | Innovation                                                                                     |
| #751  | Optimize tRPC router bundle size with code splitting                  | Performance                                                                                    |
| #752  | Create unified CLI output utilities for consistent console formatting | DX                                                                                             |
| #753  | Implement route-based code splitting for dashboard pages              | Frontend                                                                                       |
| #755  | Add composite index for customer subscription queries                 | Database                                                                                       |
| #697  | Fix corrupted text formatting in documentation files                  | Docs                                                                                           |
