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

- **Status**: Pending
- **Problem**: Auth module has 0% test coverage

### Issue 551: Add tests for k8s router

- **Status**: Pending
- **Problem**: Core business logic needs test coverage

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

### 2026-02-25 Session

1. **Fixed PR #572**: Rebased onto updated main (vercel.json fix) and merged
2. **Created PR #582**: Fixed vercel.json schema - removed invalid properties (skewProtection, minDuration)
3. **Created PR #587**: Replaced console statements in packages/db/seed.ts with logger

### Common Issues

- Vercel rate limiting: "api-deployments-free-per-day" - wait 2 hours or merge without Vercel check
- Console in seed scripts: Can use logger, but eslint-disable-no-console is also acceptable for dev scripts
