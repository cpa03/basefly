# Issue Manager: Normalization Report - 2026-07-29

## Context

- Running in CI environment with read-only GITHUB_TOKEN
- Cannot apply labels, close issues, or create issues via API
- This document captures the full normalization plan

## Normalization Changes Required

### Missing Category Labels (12 issues)

| Issue | Title                                                            | Current Labels               | Recommended Category Label |
| ----- | ---------------------------------------------------------------- | ---------------------------- | -------------------------- |
| #755  | [Database] Add composite index for customer subscription queries | database-architect           | **enhancement**            |
| #754  | [QA] Add integration tests for Stripe webhook idempotency        | quality-assurance            | **test**                   |
| #753  | [Frontend] Implement route-based code splitting                  | frontend-engineer            | **enhancement**            |
| #752  | [DX] Create unified CLI output utilities                         | DX-engineer                  | **enhancement**            |
| #751  | [Performance] Optimize tRPC router bundle size                   | performance-engineer         | **enhancement**            |
| #749  | [Innovation] AI-powered API endpoint testing                     | Growth-Innovation-Strategist | **enhancement**            |
| #748  | [DX] .nvmrc contains invalid value '20'                          | DX-engineer                  | **bug**                    |
| #744  | fix(ci): pnpm consistency in iterate.yml                         | Growth-Innovation-Strategist | **ci**                     |
| #697  | Fix corrupted text formatting in documentation                   | technical-writer             | **docs**                   |
| #670  | [DX] Fix iterate.yml to use pnpm instead of npm                  | P3, DX-engineer              | **ci**                     |
| #635  | [Docs] Create developer onboarding guide                         | documentation                | **docs**                   |
| #595  | GitHub Actions workflows use npm instead of pnpm                 | platform-engineer            | **ci**                     |

### Missing Priority Labels (~30 issues)

| Issue                       | Title                                              | Recommended Priority      |
| --------------------------- | -------------------------------------------------- | ------------------------- |
| **Security Issues**         |                                                    |                           |
| #786                        | Stripe webhook logs partial secret                 | **P1** (security leak)    |
| #728                        | Add security scanning workflows to CI              | **P2**                    |
| #722                        | Add environment variable validation at startup     | **P2**                    |
| #721                        | Add explicit authorization checks beyond auth      | **P1** (auth critical)    |
| #632                        | Audit error logging for sensitive data leakage     | **P1** (data leak risk)   |
| **Bug**                     |                                                    |                           |
| #785                        | Fix duplicate next dependency in packages/stripe   | **P2**                    |
| **Architecture/Quality**    |                                                    |                           |
| #719                        | Missing root-level TypeScript configuration        | **P1** (blocking quality) |
| #789                        | Add peerDependencies for React in packages/ui      | **P2**                    |
| #755                        | Add composite index for customer subscription      | **P2**                    |
| #753                        | Route-based code splitting for dashboard           | **P2**                    |
| #723                        | High number of client components affecting bundle  | **P2**                    |
| **Testing**                 |                                                    |                           |
| #788                        | Add unit tests for critical UI components          | **P2**                    |
| #787                        | Add unit tests for packages/db migrations          | **P2**                    |
| #729                        | Add bundle size regression testing                 | **P2**                    |
| #725                        | Add integration tests for API routers              | **P2**                    |
| #724                        | Missing e2e test coverage for critical flows       | **P2**                    |
| #754                        | Add integration tests for Stripe webhook           | **P2**                    |
| #713                        | Add unit tests for packages/common utility modules | **P2**                    |
| #631                        | Add API router tests for k8s, customer, stripe     | **P2**                    |
| #628                        | Implement E2E testing with Playwright              | **P2**                    |
| **CI/CD**                   |                                                    |                           |
| #726                        | Add dependency consistency checking to CI          | **P2**                    |
| #744                        | fix(ci): pnpm consistency in iterate.yml           | **P2**                    |
| #584                        | Fix remaining pnpm inconsistencies in workflows    | **P2**                    |
| **DX/Enhancements**         |                                                    |                           |
| #752                        | Create unified CLI output utilities                | **P2**                    |
| #751                        | Optimize tRPC router bundle size                   | **P2**                    |
| #748                        | .nvmrc contains invalid value '20'                 | **P2**                    |
| #720                        | Missing .nvmrc for Node.js version consistency     | **P2**                    |
| #634                        | Audit and enforce TypeScript strictness            | **P2**                    |
| #630                        | Enhance pre-commit hooks with typecheck and test   | **P2**                    |
| #636                        | Add ISR caching for dashboard data                 | **P2**                    |
| **Innovation/Low Priority** |                                                    |                           |
| #731                        | Auto-generate API documentation from tRPC routers  | **P3**                    |
| #727                        | AI-Powered Code Review Automation                  | **P3**                    |
| #749                        | AI-powered API endpoint testing                    | **P3**                    |
| #668                        | Cluster diagnostics with AI assistance             | **P3**                    |

## Duplicate Detection Analysis

### Potential Duplicates / Overlaps

1. **#748 vs #720**: Both about .nvmrc. #748 says invalid value '20', #720 says missing .nvmrc. These are related but distinct - #748 is a bug fix for wrong value, #720 is a feature request to add it. Keep both as they address different states.

2. **#744 vs #670 vs #584 vs #595**: All about pnpm/npm consistency in CI workflows. These should be consolidated into a single issue tracking the pnpm migration across all workflow files.

3. **#754 vs #631 vs #725 vs #713 vs #628 vs #787 vs #788 vs #729**: All testing-related. These are test coverage for different areas of the codebase. Keep separate as they target different modules.

4. **#731 vs #749**: Both about AI/Auto-generation. #731 is about tRPC API docs, #749 is about endpoint testing. Related but distinct.

5. **#663 vs #683**: Both about eslint. #663 is about eslint-disable comments, #683 is about monorepo configuration inconsistency. Different aspects of the same problem - could be consolidated.

### Consolidation Candidates

- **Group 1 (pnpm/CI)**: #744, #670, #584, #595 → Consolidate into a single P2 issue: "Standardize all GitHub Actions workflows to use pnpm consistently"
- **Group 2 (ESLint)**: #663, #683 → Consolidate into "ESLint configuration cleanup across monorepo"
- **Group 3 (Testing gaps)**: #787, #788, #725, #713 → These are module-specific; keep separate

## Priority Selection for Repair Mode

Highest priority issues to tackle:

1. **#786** (P1 Security) - Stripe webhook logs partial secret - critical security fix
2. **#721** (P1 Security) - Add explicit authorization checks - auth gap
3. **#632** (P1 Security) - Audit error logging for sensitive data leakage
4. **#719** (P1 Architecture) - Missing root-level TypeScript configuration
5. **#785** (P2 Bug) - Duplicate next dependency in packages/stripe
