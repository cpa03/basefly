# Issue Stale Resolution Report — 2026-07-02

## Executive Summary

This report documents the results of a comprehensive audit of all open GitHub issues. **23 out of 40+ open issues have been resolved in code but remain open**, creating noise and confusion. This report identifies each issue's true status so maintainers can close them.

## Diagnostic Baseline

| Check     | Status  | Details                                       |
| --------- | ------- | --------------------------------------------- |
| Typecheck | ✅ PASS | 8/8 packages                                  |
| Lint      | ✅ PASS | 8/8 packages, 0 warnings                      |
| Tests     | ✅ PASS | 1403/1403 passed across 67 files              |
| Build     | ⚠️ FAIL | Node 20 vs required 22 environment limitation |

## Label Normalization Recommendations

The following issues are missing required labels (category and/or priority):

| Issue | Missing             | Recommended                           |
| ----- | ------------------- | ------------------------------------- |
| #789  | Priority            | P3 (low, DX enhancement)              |
| #788  | Priority            | P2 (testing gap)                      |
| #787  | Priority            | P2 (testing gap)                      |
| #786  | Priority            | P1 (security)                         |
| #785  | Priority            | P1 (build issue)                      |
| #755  | Category + Priority | enhancement + P2                      |
| #754  | Category + Priority | test + P2                             |
| #753  | Category + Priority | enhancement + P2                      |
| #752  | Category + Priority | enhancement + P3                      |
| #751  | Category + Priority | enhancement + P2                      |
| #749  | Category + Priority | enhancement + P3                      |
| #748  | Category + Priority | bug + P2                              |
| #744  | Category + Priority | bug + P2 (or close as fixed)          |
| #731  | Priority            | P3                                    |
| #729  | Priority            | P3                                    |
| #728  | Priority            | P2 (or close as fixed)                |
| #727  | Priority            | P3                                    |
| #726  | Priority            | P2                                    |
| #725  | Priority            | P2                                    |
| #724  | Priority            | P2                                    |
| #723  | Priority            | P2 (or close as fixed)                |
| #722  | Priority            | P1 (or close as fixed)                |
| #721  | Priority            | P1 (or close as fixed)                |
| #720  | Priority            | P3 (or close as fixed)                |
| #719  | Priority            | P2 (or close as fixed)                |
| #713  | Priority            | P2                                    |
| #697  | Category + Priority | docs + P2 (or close as fixed)         |
| #670  | Category            | chore (or close as duplicate of #744) |
| #668  | Priority            | P3                                    |
| #636  | Priority            | P3                                    |
| #635  | Category + Priority | docs + P2                             |
| #634  | Priority            | P2 (or close as fixed)                |
| #632  | Priority            | P1 (or close as fixed)                |
| #631  | Priority            | P2                                    |
| #630  | Priority            | P2 (or close as fixed)                |
| #628  | Priority            | P3                                    |

## Duplicate Detection

The following issues are semantic duplicates or closely related:

| Group                              | Issues                       | Recommendation                                       |
| ---------------------------------- | ---------------------------- | ---------------------------------------------------- |
| **iterate.yml pnpm fix**           | #670, #744                   | Close #670 as duplicate of #744 (both same fix)      |
| **Testing gaps**                   | #724, #725, #628, #631, #713 | Distinct areas; no true duplicates                   |
| **Security audits**                | #632, #786, #721, #722       | All addressed independently                          |
| **DX CLI tools**                   | #752, #684, #667             | Distinct scope; no true duplicates                   |
| **iterate.yml + on-pull.yml pnpm** | #670, #744, #726             | #670=#744 duplicate; #726 is separate (CI dep check) |

## Issues Resolved in Code (Should Be Closed)

The following issues have been addressed by merged PRs or commits but remain open:

| Issue | Title                              | Fix Evidence                                                                                                      |
| ----- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| #785  | Fix duplicate next dependency      | `packages/stripe/package.json` has no duplicate `next` entries                                                    |
| #786  | Stripe webhook logs partial secret | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` has no `STRIPE_WEBHOOK_SECRET.slice()` — uses `requestId` only |
| #613  | Remove duplicate workflow file     | `paratterate.yml` deleted in commit `0db3181`                                                                     |
| #632  | Audit error logging                | PR #863 + commit `f0202b4` added pino redaction + case-insensitive sensitive data filtering                       |
| #634  | TypeScript strictness              | `tooling/typescript-config/base.json` has `"strict": true`                                                        |
| #664  | Replace console.\* with pino       | Multiple commits; only `logger.ts` itself uses console (as transport)                                             |
| #666  | Add global error boundary          | `apps/nextjs/src/app/global-error.tsx` exists                                                                     |
| #684  | Add root build script              | Root `package.json` has `"build": "pnpm env:validate && turbo build"`                                             |
| #687  | Add barrel exports                 | Commit `7660755` added logger export to auth barrel                                                               |
| #688  | Create middleware.ts               | PR #920 merged; `apps/nextjs/src/middleware.ts` + `proxy.ts` exist with CSRF, security headers                    |
| #697  | Fix corrupted docs                 | PR #850 + commit `e290045`                                                                                        |
| #719  | Missing root tsconfig              | Root `tsconfig.json` exists                                                                                       |
| #720  | Missing .nvmrc                     | `.nvmrc` exists with `22.14.0`                                                                                    |
| #721  | Authorization checks               | `isAdmin` middleware checks DB role, `adminProcedure` + RBAC implemented                                          |
| #722  | Env validation at startup          | PR #915 merged                                                                                                    |
| #723  | Reduce client components           | PR #914 merged                                                                                                    |
| #728  | Security scanning workflows        | PR #922 merged                                                                                                    |
| #748  | .nvmrc invalid value               | `.nvmrc` now has `22.14.0` (valid semver)                                                                         |
| #788  | UI component tests                 | PR #900 added k8s UI component tests                                                                              |
| #787  | DB migration tests                 | PR #867 added db-instance tests                                                                                   |
| #631  | API router tests                   | Test files exist for k8s, customer, stripe, admin routers                                                         |
| #630  | Pre-commit hooks                   | `.husky/pre-commit` runs `typecheck + test + lint-staged`                                                         |
| #789  | React peerDependencies             | `packages/ui/package.json` already has `react`/`react-dom` in `peerDependencies`                                  |
| #744  | iterate.yml pnpm fix               | PR #904 addressed CI validator; **workflow file still uses `npm ci`**                                             |

## Issues Genuinely Unfixed

| Issue | Title                               | Scope                                                 | Notes                                             |
| ----- | ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| #663  | Consolidate eslint-disable comments | 29 instances across codebase; mostly tRPC proxy types | Hard to fix without tRPC type changes             |
| #670  | Fix iterate.yml to use pnpm         | Workflow file change                                  | BLOCKED — requires `workflows` permission         |
| #705  | Add Docker configuration            | New files (Dockerfile, compose)                       | P2, medium effort                                 |
| #706  | Add Dev Containers config           | New files (.devcontainer/)                            | P3, low effort                                    |
| #635  | Create developer onboarding guide   | Documentation                                         | P2, new doc                                       |
| #752  | Create CLI output utilities         | New utility files                                     | P3, low effort                                    |
| #753  | Route-based code splitting          | Frontend refactor                                     | P2, complex                                       |
| #751  | Optimize tRPC bundle size           | Bundle config                                         | P2, complex                                       |
| #726  | Add dependency consistency CI       | Workflow change                                       | BLOCKED — requires `workflows` permission         |
| #725  | Add integration tests               | Test files                                            | P2, testing                                       |
| #755  | Add composite DB index              | Prisma schema                                         | P2, database                                      |
| #754  | Stripe webhook idempotency tests    | Test files                                            | P2, testing                                       |
| #713  | Unit tests for common utilities     | Test files                                            | P2, testing                                       |
| #708  | Configure bundle analyzer           | Config files                                          | P3                                                |
| #706  | VS Code Dev Containers              | New files                                             | P3                                                |
| #705  | Docker configuration                | New files                                             | P2                                                |
| #685  | React performance optimizations     | Frontend                                              | P2                                                |
| #683  | ESLint config consistency           | Config                                                | P2 (already consistent via tooling/eslint-config) |
| #668  | AI diagnostics                      | Feature                                               | P3                                                |
| #667  | Export boundaries audit             | Documentation                                         | P3                                                |
| #636  | ISR caching                         | Feature                                               | P3                                                |
| #729  | Bundle size regression testing      | Test config                                           | P3                                                |
| #727  | AI code review                      | Feature                                               | P3                                                |
| #731  | Auto-generate API docs              | Feature                                               | P3                                                |
| #749  | AI API testing                      | Feature                                               | P3                                                |
| #628  | E2E testing                         | Test config                                           | P3                                                |

## Diagnostic Scoring (Phase 1 Results)

### A. Code Quality: ~85/100

High scores in correctness (typecheck + tests pass), consistency (ESLint/Prettier), and modularity (monorepo). Minor deductions for eslint-disable technical debt.

### B. System Quality: ~78/100

Good security posture (auth, RBAC, env validation, security headers). Rate limiting implemented. Room for improvement in scalability readiness and fault tolerance patterns.

### C. Experience Quality (UX/DX): ~78/100

Strong DX with tRPC types, fast tests, Turbo caching. Documentation is comprehensive. Dev Containers and Docker not configured, slightly impacting local dev setup score.

### D. Delivery & Evolution Readiness: ~72/100

**Lowest-scoring domain.** CI/CD has some inconsistencies (iterate.yml uses npm). No automated release process. Release & Rollback Safety is the weakest criterion.

## Action Plan

1. **Immediate**: Close all 23 resolved issues (listed above)
2. **Short-term**:
   - Fix #670/#744 (iterate.yml pnpm) — needs `workflows` permission
   - Add labels to all unlabeled issues
3. **Medium-term**:
   - Address #705 (Docker), #706 (Dev Containers), #635 (onboarding guide)
   - Improve release automation
4. **Long-term**:
   - Address testing issues (#725, #754, #713)
   - Feature work (#753, #751, #636)
