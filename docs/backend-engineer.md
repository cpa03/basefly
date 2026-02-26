# Backend Engineer Documentation

## Overview

This document serves as the long-term memory for the backend-engineer agent in the Basefly project.

## Project Context

Basefly is a Next.js-based SaaS template with:

- Monorepo structure with Turbo
- Packages: api, auth, db, stripe, common
- tRPC for API routes
- Prisma ORM with PostgreSQL
- Clerk authentication
- Stripe payments

## Active Issues (P1 Priority)

### Issue 479: Centralized Logging Facade

- **Status**: Completed (PR #572 merged)
- **Solution**: Created shared logger in packages/common/src/logger.ts

### Issue 548: Replace console-based logging in packages/db

- **Status**: Completed (PR #587 merged)
- **Problem**: console.log/error statements in seed.ts
- **Solution**: Replaced with logger from packages/db/logger.ts

### Issue 549: Add tests for packages/auth module

- **Status**: Complete (tests exist in main, 20 tests pass)
- **Problem**: Auth module had 0% test coverage
- **Solution**: Created packages/auth/clerk.test.ts with 20 test cases
- **Note**: PR #563 was closed due to conflicts, but work was merged to main separately

### Issue 551: Add tests for k8s router

- **Status**: Complete (PR #674 merged)
- **Problem**: Core business logic needed test coverage
- **Solution**: Added comprehensive tests in packages/api/src/router/k8s.test.ts

- **Status**: Pending
- **Problem**: Auth module has 0% test coverage

VB|### Issue 551: Add tests for k8s router
RB|
BW|- **Status**: Pending
SH|- **Problem**: Core business logic needs test coverage
ZK|
NP|### Issue 578: Remove duplicate health check endpoint
JQ|
BW|- **Status**: Completed (PR #642)
WY|- **Problem**: File named health_check.ts exports helloRouter (greeting endpoint), not health check
TX|- **Solution**: Renamed to hello.ts and hello.test.ts to properly reflect purpose
VB|

## Existing Patterns

### Logger Patterns

Each package (api, db, stripe, auth) has its own logger.ts using pino:

- `packages/api/src/logger.ts` - Basic pino config
- `packages/db/logger.ts` - Custom wrapper with typed methods (LoggerMetadata)
- `packages/stripe/src/logger.ts` - Has requestId support in metadata
- `packages/auth/logger.ts` - Basic pino config

### Common Package Exports

Located in `packages/common/src/index.ts`:

- LOG_LEVEL, IS_DEV, IS_PROD, IS_TEST from config/env.ts
- Various configuration exports

### Using the Logger

Import logger from local package:

```typescript
// or
import { createLoggerWrapper, dbLogger } from "@saasfly/common";

import { logger } from "./logger";
```

## Dependencies

### Pino Versions

- packages/api: pino 10.3.1
- packages/db: pino ^9.6.0
- packages/stripe: pino 10.3.1
- packages/auth: pino ^9.6.0

## Vercel Configuration

### Valid vercel.json Properties

When configuring vercel.json, only use these function properties:

- `memory` - integer (1024-3009 MB)
- `maxDuration` - integer (seconds, depends on plan)

**Invalid properties (do NOT use):**

- `skewProtection` - NOT a valid vercel.json property
- `minDuration` - NOT a valid vercel.json property
- `fluid` - Only valid in dashboard, not in vercel.json

### Example Functions Config

```json
{
  "functions": {
    "apps/nextjs/src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

## Testing Patterns

Tests are located alongside source files with `.test.ts` suffix:

- `packages/common/src/config/*.test.ts`

## Session Notes

### 2026-02-26 Session (Morning)

1. **Issue #633: N+1 Query Audit**
   - Analyzed all API routers (k8s, customer, stripe, admin, auth, hello)
   - Found no N+1 issues - queries are well optimized
   - All queries use indexed columns (authUserId, deletedAt)
   - Composite indexes cover all query patterns
   - Promise.all used for parallel queries where applicable
   - Created PR #698 with documentation
   - All checks pass (typecheck, lint, test: 742 tests)

### 2026-02-26 Session (Early Morning)

1. **Verified Issue #549 & #551**: Tests already exist in main and all 679 tests pass
2. **Created PR #681**: Added Zod output validation to hello router as proof-of-concept for issue #493
   - Added helloOutputSchema
   - Added .output() to procedure chain
   - All checks pass (typecheck, lint, test: 26 tests)
3. **Note on pnpm**: pnpm not installed in environment - installed via npm to run tests

### 2026-02-25 Session (Morning)

### 2026-02-25 Session (Morning)

1. **Reviewed PR #601**: Found it had old main history merged in causing huge diff
2. **Created PR #625**: Clean implementation of structured logging in seed.ts
   - Single commit, atomic change
   - Up to date with main
   - All checks pass (typecheck, lint, test)

### 2026-02-25 Session

1. **Fixed PR #572**: Rebased onto updated main (vercel.json fix) and merged
2. **Created PR #582**: Fixed vercel.json schema - removed invalid properties (skewProtection, minDuration)
3. **Created PR #587**: Replaced console statements in packages/db/seed.ts with logger

### Common Issues

- Vercel rate limiting: "api-deployments-free-per-day" - wait 2 hours or merge without Vercel check
- Console in seed scripts: Can use logger, but eslint-disable-no-console is also acceptable for dev scripts

VN|- Vercel rate limiting: "api-deployments-free-per-day" - wait 2 hours or merge without Vercel check
WP|- Console in seed scripts: Can use logger, but eslint-disable-no-console is also acceptable for dev scripts
BM|
VR|### 2026-02-25 Session (Afternoon)
QX|
NS|1. **Created PR #642**: Fixed issue #578 - renamed misnamed health_check router to hello
PN| - File health_check.ts exported helloRouter (greeting endpoint), not health check
JH| - Renamed to hello.ts and hello.test.ts to eliminate confusion
TT| - All checks pass (typecheck, lint, test: 26 tests)
JQ|
