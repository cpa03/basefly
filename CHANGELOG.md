# Changelog

All notable changes to the Basefly project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- Fixed CVE-2026-2391 (qs package arrayLimit bypass) via pnpm override

### Documentation

- Enhanced SECURITY.md with supported versions table, severity levels with SLAs, vulnerability report template, and safe harbor statement
- Enhanced CONTRIBUTING.md with branch naming conventions, commit message guidelines (Conventional Commits), PR checklist, and additional resources
- Removed outdated GraphQL reference from roadmap (not in current tech stack)
- Added this CHANGELOG.md

## [1.0.0] - 2026-01-31

### Added

- Row-level security for multi-tenant data protection
- Database check constraints for data validation
- Database triggers for automated maintenance
- Composite indexes for multi-column queries (authUserId + deletedAt, authUserId + stripeCurrentPeriodEnd)
- Webhook idempotency protection to prevent duplicate Stripe event processing
- Request ID tracking middleware for distributed tracing
- Rate limiting with token bucket algorithm (100 req/min read, 20 req/min write, 10 req/min Stripe)
- Circuit breaker pattern for Stripe API resilience
- Retry logic with exponential backoff for external service calls
- Timeout protection (30s default) for all external API calls
- Comprehensive error standardization with typed error codes

### Changed

- Improved type safety in database layer (removed 8 instances of "as any")
- Enhanced Clerk error handling with proper initialization checks
- Consolidated dependency overrides in pnpm-workspace.yaml
- Optimized package imports for better tree-shaking

### Fixed

- Foreign key constraints added to User table (RESTRICT delete policy)
- Soft delete pattern implemented with partial unique indexes
- Application-level cascade deletion with audit trail preservation
- Clerk key validation middleware added
- Browser console errors resolved
- TypeScript errors resolved (removed @ts-ignore suppressions)

## [0.9.0] - 2026-01-10

### Added

- Integration resilience patterns (circuit breakers, retries, timeouts)
- API documentation in docs/api-spec.md
- Comprehensive test coverage for critical paths
- UI/UX accessibility improvements (ARIA labels, keyboard navigation)
- Status badge component with accessibility support
- Responsive table-to-card pattern for mobile
- Loading skeleton pattern for perceived performance

### Changed

- Database migration strategy improved with proper rollback capability
- Error handling standardized across all routers
- Bundle optimization with direct imports (avoiding namespace imports)

### Security

- Security headers implemented (HSTS, CSP, X-Frame-Options, etc.)
- Stripe webhook signature verification
- Input validation with Zod schemas at API boundaries
- Environment variable validation with Zod (@t3-oss/env-nextjs)

## [0.8.0] - 2024-01-07

### Added

- Kubernetes cluster management (CRUD operations)
- Subscription plan management (FREE, PRO, BUSINESS)
- Stripe billing integration with webhook handlers
- Clerk authentication integration
- tRPC API with type-safe endpoints
- Prisma ORM with PostgreSQL
- Kysely query builder for type-safe SQL
- Tailwind CSS with shadcn/ui components
- Multi-language support (English, Chinese, German, Vietnamese)
- Monorepo structure with Turbo

### Infrastructure

- CI/CD workflows for automated testing and deployment
- Turbo caching for build optimization
- ESLint and Prettier configuration
- Vitest testing framework

---

## Release Notes Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New features

### Changed

- Changes to existing functionality

### Deprecated

- Soon-to-be removed features

### Removed

- Now removed features

### Fixed

- Bug fixes

### Security

- Security improvements
```
