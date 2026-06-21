# Issue Audit & Normalization Report

**Generated**: 2026-06-21
**Phase**: ISSUE MANAGER MODE — Steps 1-3

## Step 1: Normalization Recommendations

Issues below are grouped by missing label types. Priority and category added per engineering judgment.

### Security Issues (missing priority labels)

| #   | Title                                          | Current Labels | Recommended                        |
| --- | ---------------------------------------------- | -------------- | ---------------------------------- |
| 786 | Stripe webhook logs partial secret             | security       | Add **P0** — active secret leakage |
| 722 | Add environment variable validation at startup | security       | Add **P1**                         |
| 721 | Add explicit authorization checks              | security       | Add **P1**                         |
| 728 | Add security scanning workflows to CI          | security       | Add **P2**                         |
| 632 | Audit error logging for sensitive data leakage | security       | Add **P1**                         |

### Bug Issues (missing priority labels)

| #   | Title                                            | Current Labels | Recommended                      |
| --- | ------------------------------------------------ | -------------- | -------------------------------- |
| 785 | Fix duplicate next dependency in packages/stripe | bug            | Add **P1** — blocks clean builds |
| 748 | .nvmrc contains invalid value '20'               | DX-engineer    | Add **bug, P2**                  |

### Test Issues (missing priority labels)

| #   | Title                                          | Current Labels                       | Recommended      |
| --- | ---------------------------------------------- | ------------------------------------ | ---------------- |
| 788 | Add unit tests for critical UI components      | test                                 | Add **P2**       |
| 787 | Add unit tests for packages/db migrations      | test                                 | Add **P2**       |
| 754 | Add integration tests for Stripe webhook       | quality-assurance                    | Add **test, P2** |
| 729 | Add bundle size regression testing             | enhancement                          | Add **P3**       |
| 725 | Add integration tests for API routers          | test                                 | Add **P2**       |
| 724 | Missing e2e test coverage                      | test                                 | Add **P3**       |
| 713 | Add unit tests for packages/common             | enhancement, test, quality-assurance | Add **P2**       |
| 631 | Add API router tests for k8s, customer, stripe | enhancement                          | Add **test, P2** |
| 628 | Implement E2E testing with Playwright          | enhancement                          | Add **test, P3** |

### Enhancement Issues (missing priority labels)

| #   | Title                                                 | Labels                           | Recommended                 |
| --- | ----------------------------------------------------- | -------------------------------- | --------------------------- |
| 789 | Add peerDependencies for React in packages/ui         | enhancement                      | Add **P2**                  |
| 755 | Add composite index for customer subscription queries | database-architect               | Add **enhancement, P2**     |
| 753 | Route-based code splitting for dashboard pages        | frontend-engineer                | Add **enhancement, P2**     |
| 752 | Create unified CLI output utilities                   | DX-engineer                      | Add **enhancement, P3**     |
| 751 | Optimize tRPC router bundle size with code splitting  | performance-engineer             | Add **enhancement, P2**     |
| 749 | AI-powered API endpoint testing generator             | Growth-Innovation-Strategist     | Add **enhancement, P3**     |
| 744 | fix(ci): pnpm consistency in iterate.yml              | Growth-Innovation-Strategist     | Add **ci, P2**              |
| 731 | Auto-generate API documentation from tRPC routers     | enhancement                      | Add **P3**                  |
| 727 | AI-Powered Code Review Automation                     | enhancement                      | Add **P3**                  |
| 726 | Add dependency consistency checking to CI             | ci                               | Add **P2**                  |
| 723 | High number of client components                      | enhancement                      | Add **P2**                  |
| 720 | Missing .nvmrc for Node.js version consistency        | enhancement                      | Add **P3**                  |
| 719 | Missing root-level TypeScript configuration           | enhancement                      | Add **P2**                  |
| 697 | Fix corrupted text formatting in docs                 | technical-writer                 | Add **docs, P2**            |
| 668 | AI-Native: Cluster diagnostics with AI                | enhancement                      | Add **P3**                  |
| 636 | Add ISR caching for dashboard data                    | enhancement                      | Add **P2**                  |
| 635 | Create developer onboarding guide                     | documentation                    | Add **P2**                  |
| 634 | Audit and enforce TypeScript strictness               | enhancement                      | Add **P2**                  |
| 630 | Enhance pre-commit hooks                              | enhancement                      | Add **P2**                  |
| 595 | GitHub Actions use npm instead of pnpm                | platform-engineer                | Add **enhancement, ci, P2** |
| 584 | Fix remaining pnpm inconsistencies in CI              | enhancement, ci                  | Add **P2**                  |
| 305 | Standardize workflows to use pnpm                     | enhancement, ci, devops-engineer | Add **P2**                  |
| 670 | Fix iterate.yml to use pnpm                           | P3, DX-engineer                  | Add **ci**                  |
| 503 | Add JSDoc comments to public API routers              | P2, docs                         | Add **documentation**       |

---

## Step 2: Duplicate Detection

### Duplicate Group 1: .nvmrc Issues

- #748 — ".nvmrc contains invalid value '20'"
- #720 — "Missing .nvmrc for Node.js version consistency"
- **Analysis**: #720 is the original issue about missing .nvmrc; #748 addresses the problem that the created .nvmrc has invalid content. These are sequential, not duplicate.
- **Action**: No dedup needed — distinct lifecycle phases of the same file.

### Duplicate Group 2: pnpm Consistency in CI

- #595 — "GitHub Actions workflows use npm instead of pnpm"
- #670 — "Fix iterate.yml to use pnpm instead of npm"
- #584 — "Fix remaining pnpm inconsistencies in GitHub Actions workflows"
- #744 — "fix(ci): pnpm consistency in iterate.yml"
- #305 — "ci: standardize workflows to use pnpm consistently"
- **Analysis**: These span the same root cause. #595 is the most comprehensive. #670, #584, #744, #305 are narrower or duplicates.
- **Action**: Close #670, #744, #305 in favor of #595 (most comprehensive). Keep #584 if it addresses different files.

### Duplicate Group 3: E2E Testing

- #501 — "Implement Playwright E2E tests for critical user journeys"
- #628 — "Implement E2E testing with Playwright"
- **Analysis**: Same topic, #501 has better specificity ("critical user journeys").
- **Action**: Close #628 in favor of #501.

### Duplicate Group 4: Rate Limiting with Redis

- #496 — "Replace in-memory rate limiter with distributed store (Redis)" [P0]
- #480 — "Replace in-memory rate limiter with Redis-based solution" [P1]
- **Analysis**: Same requirement. #496 is the P0 canonical version.
- **Action**: Close #480 in favor of #496.

### Duplicate Group 5: Authorization

- #721 — "Add explicit authorization checks beyond authentication"
- #498 — "Replace email-based admin RBAC with role-based access control"
- **Analysis**: Different scopes — #721 is about adding authZ checks, #498 is about the RBAC model. Not exact duplicates.
- **Action**: Keep both, link them as related.

### Duplicate Group 6: Test Coverage Overlaps

- #550 — "Include apps/nextjs in test coverage configuration"
- #788 — "Add unit tests for critical UI components in apps/nextjs"
- #725 — "Add integration tests for API routers"
- **Analysis**: #550 is config-level, #788 and #725 are implementation. Distinct.
- **Action**: No dedup.

---

## Step 3: Consolidation Recommendations

### Proposal A: Security Hardening Epic

Consolidate related security issues into a tracked epic:

- #496 — [P0] Distributed rate limiter
- #786 — [P0] Stripe webhook secret logging
- #515 — [P1] CSRF protection
- #722 — [P1] Env validation
- #721 — [P1] AuthZ checks
- #632 — [P1] Error logging audit
- #498 — [P1] RBAC

### Proposal B: CI Pipeline Health Epic

Consolidate CI-related issues:

- #595 — pnpm consistency
- #613 — Remove duplicate workflow
- #726 — Dependency consistency check
- #684 — Standardize turbo pipelines

### Proposal C: Testing Coverage Epic

Consolidate testing gaps:

- #581 — Testing infrastructure
- #551 — k8s router tests
- #549 — Auth module tests
- #550 — Next.js coverage config
- #631 — API router tests
- #713 — Common module tests
- #725 — Integration tests
- #724 — E2E coverage
- #501 / #628 — Playwright E2E

---

## Summary Statistics

- **Total open issues**: 82 (repo-level count)
- **Issues analyzed**: ~60 visible via API
- **Missing priority labels**: ~35 issues
- **Missing standard category labels**: ~15 issues (using specialist labels only)
- **Duplicate groups identified**: 4 groups (~10 issues could be deduped)
- **Consolidation epics proposed**: 3

## Recommended Next Actions

1. Apply missing labels via repo admin
2. Close duplicates: #670, #744, #305, #628, #480
3. Create epic tracking issues for Security, CI, and Testing
4. Begin Repair Mode on highest-priority issue
