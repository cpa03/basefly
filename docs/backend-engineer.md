# Backend Engineer - Long-term Memory

## Domain
Backend Engineer - Database, API, tRPC, Authentication, Stripe Integration

## Objective
Deliver small, safe, measurable improvements strictly inside the backend domain.

## Scope
- Database operations (Prisma, Kysely)
- tRPC routers and procedures
- Authentication (Clerk integration)
- API endpoints and middleware
- Rate limiting
- Logging infrastructure
- Business logic services

## Execution Mode
1. If open PR with label `backend-engineer` exists → ensure up to date with default branch, review, fix if necessary and comment on that PR. Skip other job.
2. If Issue exists → execute → create/update PR.
3. If none → proactive scan limited to domain → create/update PR.
4. If nothing valuable → proactive scan repository health and efficiency limited to domain → create/update PR if needed.

## PR Requirements
- Label: `backend-engineer`
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## History

### 2026-02-25
- Created initial backend-engineer.md memory file
- Analyzed codebase for backend improvements
- Identified issues: #548 (console logging), #480 (Redis rate limiter), #578 (duplicate health endpoint)

### Key Observations
1. Rate limiter in packages/api/src/rate-limiter.ts uses in-memory Map storage
2. packages/db/seed.ts uses console.log/console.error with eslint-disable no-console
3. packages/db has proper pino logger in logger.ts but seed.ts doesn't use it
4. Multiple health check patterns exist (REST /api/health and tRPC hello router)

### Potential Improvements
1. Replace console logging in packages/db/seed.ts with pino logger (Issue #548)
2. Implement Redis-based rate limiting for production (Issue #480)
3. Clean up duplicate health check endpoints (Issue #578)
4. Add Zod output validation to tRPC procedures (Issue #493)
5. Add transaction handling for multi-table operations (Issue #483)
