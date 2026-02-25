# Quality Assurance Documentation

## Overview

This document serves as the long-time memory for the Quality Assurance agent working on the basefly repository.

## Active Work

- **Issue #482**: Add E2E tests for critical user flows (P1, quality-assurance)
  - Status: In Progress
  - Deliverables: Playwright configuration, test fixtures, 3+ critical flow tests, CI integration, documentation

## Test Infrastructure

### Current State

- **Unit Tests**: Vitest (19 test files in packages/)
- **E2E Tests**: Playwright (configured and ready)
- **CI**: GitHub Actions workflows

### Previous QA Work (Merged PRs)

- #574: qa: Add integration tests verification for tRPC routers
- #537: qa: add lcov reporter to vitest config for CI coverage integration
- #508: test: Add unit tests for common config modules
- #426: qa: add CI workflow validation tool
- #419: qa: add Quality Assurance checklist to PR template
- #202: test(common): add tests for feature flags module

## E2E Test Implementation

### Critical User Flows Tested

1. **Authentication Flow** (`e2e/auth.spec.ts`)
   - Login page loads correctly
   - Signup page loads correctly
   - Form elements present

2. **Dashboard Flow** (`e2e/dashboard.spec.ts`)
   - Dashboard page redirects to login when not authenticated
   - Marketing page loads correctly
   - Protected routes work correctly

3. **Pricing/Subscription Flow** (`e2e/pricing.spec.ts`)
   - Pricing page loads correctly
   - Subscription plans display
   - Navigation works

### Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `e2e/fixtures.ts` - Test fixtures and helper functions
- `e2e/auth.spec.ts` - Authentication flow tests
- `e2e/dashboard.spec.ts` - Dashboard flow tests
- `e2e/pricing.spec.ts` - Pricing flow tests

### Running E2E Tests Locally

**Prerequisites:**

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm test:e2e:install
```

**Run E2E Tests:**

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
pnpm playwright test e2e/auth.spec.ts

# Run specific test
pnpm playwright test e2e/auth.spec.ts --grep "login page"
```

**Environment Variables:**

- `BASE_URL` - Override default URL (default: http://localhost:3000)
- `E2E_TEST_USER_EMAIL` - Test user email
- `E2E_TEST_USER_PASSWORD` - Test user password

### CI Integration

E2E tests run via `.github/workflows/e2e.yml` workflow:

- Runs on schedule (every 6 hours)
- Can be triggered manually via workflow_dispatch
- Uploads Playwright report on completion

## Notes

- Auth is handled by Clerk (external service)
- Tests use environment variables for URLs
- Playwright handles web server startup automatically in local mode

## Last Updated

2026-02-25
