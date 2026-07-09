# Stale Issue Resolution Report — 2026-07-09

## Overview

During the Issue Manager phase of the ULW loop, all 50+ open issues were analyzed. This report documents which issues have already been resolved and can be closed, and which remain actionable.

## Issues Already Resolved (Should Be Closed)

### #496 — [P0][Security] Replace in-memory rate limiter with distributed store (Redis)

**Status**: ✅ Already implemented

- File `packages/api/src/distributed-rate-limiter.ts` exists
- `packages/api/src/trpc.ts` imports `getIdentifier`, `getLimiter` from `./distributed-rate-limiter`
- Redis-backed distributed rate limiter is active

### #498 — [P1][Security] Replace email-based admin RBAC with role-based access control

**Status**: ✅ Already implemented

- Commit `7f5a386` added `requireRole` middleware and RBAC system
- `packages/api/src/trpc.ts` contains `requireRole`, `createRoleBasedProcedure`
- Related issue #721 also fixed

### #722 — [P1][Security] Add environment variable validation at startup

**Status**: ✅ Already implemented

- Commit `c602afe`, `79007ed`, `5adec30` all implemented env validation
- `packages/common/src/config/env.ts` has `validateEnvVars()`
- Instrumentation hook wires it up at startup

### #785 — [Bug] Fix duplicate next dependency in packages/stripe/package.json

**Status**: ✅ Already fixed

- Current `packages/stripe/package.json` has no duplicate `next` entry
- No `next` dependency exists at all in the file

### #786 — [Security] Stripe webhook logs partial secret

**Status**: ✅ Already fixed

- Commit `69b43e0` removed `STRIPE_WEBHOOK_SECRET.slice(-8)` from rate limiter
- Current code uses static `"stripe-webhook"` identifier
- Commit message explicitly says "Fixes #786"

### #748 — [DX] .nvmrc contains invalid value

**Status**: ✅ Already fixed

- Current `.nvmrc` contains `22.14.0` (valid Node.js version)
- No issue with the value

### #720 — [DX] Missing .nvmrc for Node.js version consistency

**Status**: ✅ Already resolved

- `.nvmrc` file exists at repository root

### #719 — [Architecture] Missing root-level TypeScript configuration

**Status**: ✅ Already resolved

- `tsconfig.json` exists at repository root, extends `./tooling/typescript-config/base.json`

### #666 — [Architecture] Add global error boundary

**Status**: ✅ Already implemented

- `apps/nextjs/src/app/error.tsx` exists
- `apps/nextjs/src/app/global-error.tsx` exists
- Multiple group-level error boundaries exist

### #789 — [Architecture] Add peerDependencies for React in packages/ui

**Status**: ✅ Already resolved

- `packages/ui/package.json` already has `peerDependencies` for `react` and `react-dom`

### #613 — [P2][CI] Remove duplicate GitHub Actions workflow file

**Status**: ✅ Already resolved

- Only 2 workflow files exist: `iterate.yml` and `on-pull.yml`
- They serve different purposes (push vs pull_request)
- No duplicate workflow files

### #611 — [P3][DX] Add not-found.tsx for custom 404 pages

**Status**: ✅ Already resolved

- Not-found pages exist at all group route levels:
  - `apps/nextjs/src/app/[lang]/(marketing)/not-found.tsx`
  - `apps/nextjs/src/app/[lang]/(docs)/not-found.tsx`
  - `apps/nextjs/src/app/[lang]/(editor)/not-found.tsx`
  - `apps/nextjs/src/app/[lang]/(dashboard)/not-found.tsx`
  - `apps/nextjs/src/app/[lang]/(auth)/not-found.tsx`

### #630 — [DX] Enhance pre-commit hooks with typecheck and test

**Status**: ✅ Already implemented

- `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, and `pnpm lint-staged`
- `.husky/pre-push` runs `pnpm dx:quick`

### #683 — [DX] ESLint/Prettier monorepo configuration inconsistency

**Status**: ✅ Already resolved

- All packages extend `@saasfly/eslint-config/base`
- Shared prettier config at `@saasfly/prettier-config`
- Lint passes consistently across all 8 packages

### #578 — [P3][Code Quality] Remove duplicate health check endpoint

**Status**: ✅ Already resolved

- No duplicate health check endpoints found in router code

### #579 — [P2][DX] Improve environment setup error messages

**Status**: ✅ Already implemented

- `dx:setup` script exists with proper error messaging
- `env-validate.js` script provides comprehensive validation output

### #632 — [Security] Audit error logging for sensitive data leakage

**Status**: ✅ Already addressed

- `packages/api/src/sensitive-data-logging.test.ts` scans codebase for sensitive logging
- `apps/nextjs/src/lib/logger.ts` has `redactSensitiveFields()` function
- `packages/common/src/logger.ts` has pino-based redact configuration

### #649 — [Code Quality] Remove eslint-disable comments in k8s.ts router

**Status**: ✅ Already closed

- Issue was already closed

### #785 — Duplicate next dependency

**Status**: ✅ Fixed in current codebase

- No `next` dependency found in `packages/stripe/package.json`

## Issues Already Addressed (Partially or in Related Work)

### #584 — Fix remaining pnpm inconsistencies in GitHub Actions workflows

**Status**: ⚠️ Fixed locally but cannot push (workflows permission required on GitHub token)

- Replaced `npm ci` with `pnpm install --frozen-lockfile` in `iterate.yml`
- Added `pnpm/action-setup@v6`
- Updated cache config from `package-lock.json` to `pnpm-lock.yaml`
- **Blocked**: Push rejected — GITHUB_TOKEN lacks `workflows` permission

### #670 — Fix iterate.yml to use pnpm instead of npm

**Status**: Same as #584 — fix applied but can't push

### #595 — GitHub Actions workflows use npm instead of pnpm

**Status**: Same as #584

### #305 — Standardize workflows to use pnpm

**Status**: Same as #584

## Genuinely Unresolved Issues (High Priority)

### P0-P1 Issues Still Open

| Issue | Title                                             | Priority | Notes               |
| ----- | ------------------------------------------------- | -------- | ------------------- |
| #515  | [Security] CSRF protection                        | P1       | Not implemented     |
| #501  | [Testing] Playwright E2E tests                    | P1       | Not implemented     |
| #500  | [Testing] Clerk auth flow tests                   | P1       | Not implemented     |
| #549  | [Testing] Add tests for packages/auth             | P1       | 0% coverage         |
| #550  | [Testing] Include apps/nextjs in test coverage    | P1       | Not configured      |
| #551  | [Testing] Add tests for k8s router                | P1       | Core business logic |
| #581  | [Testing] Consolidate testing infrastructure      | P1       | Broad scope         |
| #480  | [Security] Redis rate limiter (duplicate of #496) | P1       | Already implemented |

## Recommendations

1. **Close stale issues**: Close issues #496, #498, #722, #785, #786, #748, #720, #719, #666, #789, #613, #611, #630, #683, #578, #579, #632, #649
2. **Grant workflows permission**: The GITHUB_TOKEN needs `workflows: write` to push workflow file changes
3. **Focus on testing**: The largest gap is test coverage (issues #549, #550, #551, #581, #501)
4. **Security**: CSRF protection (#515) is the most impactful unresolved security issue
