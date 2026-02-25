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

- **Status**: In Progress
- **Problem**: Each package implements its own logging solution with pino, leading to inconsistent formats
- **Solution**: Create shared logger in packages/common/src/logger.ts

### Issue 549: Add tests for packages/auth module

- **Status**: Pending
- **Problem**: Auth module has 0% test coverage

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

## Dependencies

### Pino Versions

- packages/api: pino 10.3.1
- packages/db: pino ^9.6.0
- packages/stripe: pino 10.3.1
- packages/auth: pino ^9.6.0

## Testing Patterns

Tests are located alongside source files with `.test.ts` suffix:

- `packages/common/src/config/*.test.ts`

## Work In Progress

### Centralized Logger Implementation

1. Create `packages/common/src/logger.ts`
2. Add pino dependency to common package
3. Export from common package
4. Migrate all packages to use centralized logger
