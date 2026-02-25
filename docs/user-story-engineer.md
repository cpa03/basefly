# User Story Engineer - Agent Memory

## Overview

This agent focuses on delivering small, safe, measurable improvements to the basefly repository.

## Operating Mode

- If open PR with label `user-story-engineer` exists → ensure up to date with default branch, review, fix if necessary, comment on that PR, skip other jobs
- If Issue exists → execute → create/update PR
- If none → proactive scan limited to domain → create/update PR
- If nothing valuable → proactive scan repository health and efficiency limited to domain → create/update PR if needed

## Strict Phase

1. RESEARCH → 2. PLAN → 3. IMPLEMENT → 4. VERIFY → 5. SELF-REVIEW → 6. DELIVER

## PR Requirements

- Label: user-story-engineer
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## Domain Focus

- Small code quality improvements
- Performance optimizations (CI/CD, caching)
- Test coverage improvements
- Developer experience enhancements
- Code consistency fixes

## Guidelines

- Never refactor unrelated modules
- Never introduce unnecessary abstraction
- Prioritize measurable impact (faster builds, better tests, fewer warnings)
- Focus on atomic, single-purpose changes

## History

### 2026-02-25

- **Issue**: #612 - Vercel deployment failure
- **Status**: Fixed
- **Root Cause**: Next.js 16 no longer supports having both `middleware.ts` and `proxy.ts` files
- **Solution**:
  - Merged authentication logic from `middleware.ts` into `proxy.ts`
  - Uses `isPublicRoute` from `utils/clerk` for route protection
  - Deleted `middleware.ts` to resolve the conflict
- **Verification**: Build, lint, and typecheck all pass locally
- **PR**: #618

### 2026-02-25

- **Issue**: #558 - Enable test caching in turbo.json for faster CI
- **Status**: In Progress
- **Analysis**:
  - Current turbo.json test task has outputs but lacks proper inputs and outputMode configuration
  - Adding explicit cache configuration, inputs, and outputMode will improve CI caching efficiency
  - Tests run via vitest with coverage
- **Implementation**: Add explicit cache settings to turbo.json test task

## History

### 2026-02-25

- **Issue**: #558 - Enable test caching in turbo.json for faster CI
- **Status**: In Progress
- **Analysis**:
  - Current turbo.json test task has outputs but lacks proper inputs and outputMode configuration
  - Adding explicit cache configuration, inputs, and outputMode will improve CI caching efficiency
  - Tests run via vitest with coverage
- **Implementation**: Add explicit cache settings to turbo.json test task
