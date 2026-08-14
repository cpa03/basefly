# E2E Testing with Playwright

This document describes how to run and maintain the end-to-end (E2E) test suite for the Basefly project.

## Overview

Basefly uses [Playwright](https://playwright.dev/) for end-to-end testing. The E2E suite covers the critical user journeys of the application:

- **Authentication** — login page rendering and Clerk sign-in component (`auth.spec.ts`)
- **Subscription & Billing** — pricing plans, checkout, and subscription workflows (`billing.spec.ts`, `subscription-workflows.spec.ts`, `pricing.spec.ts`)
- **Cluster Management** — cluster creation, status, and deletion (`cluster.spec.ts`)
- **Admin & Authorization** — admin dashboard access and authorization boundaries (`admin.spec.ts`, `authorization-bypass.spec.ts`)
- **Critical Flows & Error Handling** — multi-language routes, webhook error handling (`critical-flows.spec.ts`, `webhook-error-handling.spec.ts`)
- **Smoke Tests** — home page, dashboard, and navigation (`home.spec.ts`, `dashboard.spec.ts`)

## Prerequisites

- Node.js `22.14.0` (see `.nvmrc`)
- [pnpm](https://pnpm.io/)
- A local environment configured per `.env.example` (Clerk, Stripe, PostgreSQL keys are required for the flows that touch those services)

## Local Setup

1. Install dependencies and Playwright browsers:

   ```bash
   pnpm install
   pnpm test:e2e:install
   ```

2. Configure your environment:

   ```bash
   cp .env.example .env.local
   # Fill in Clerk, Stripe, and PostgreSQL credentials
   ```

3. Start the application (the Playwright config starts the dev server automatically when running locally):

   ```bash
   pnpm run dev:web
   ```

## Running the Tests

| Command | Description |
|---------|-------------|
| `pnpm test:e2e` | Run the full E2E suite headlessly |
| `pnpm test:e2e:ui` | Run with the interactive Playwright UI |
| `pnpm test:e2e:headed` | Run in headed (visible browser) mode |
| `pnpm test:e2e:report` | Open the last HTML report |
| `pnpm test:e2e:install` | Install the Playwright Chromium browser |

By default, tests run against `http://localhost:3000`. To target a different environment, set the `E2E_BASE_URL` environment variable:

```bash
E2E_BASE_URL=https://preview.example.com pnpm test:e2e
```

## Test Structure

- **Test directory**: `tests/e2e/`
- **Configuration**: `playwright.config.ts`
- **Shared helpers**: `tests/e2e/fixtures.ts` (exports the base `test`/`expect` plus helpers such as `waitForPageReady` and `clearAndFill`)

The Playwright config:

- Runs tests in parallel with Chromium (Desktop Chrome profile)
- Retries failed tests twice on CI
- Captures traces on first retry, screenshots on failure, and video on failure
- Starts the local dev server automatically when run outside CI
- Emits HTML, JSON, and list reporters

## Writing New Tests

1. Create a spec file under `tests/e2e/` (e.g. `my-flow.spec.ts`).
2. Import `test` and `expect` from `./fixtures` so shared helpers are available:

   ```ts
   import { test, expect } from "./fixtures";

   test.describe("My Flow", () => {
     test("loads correctly", async ({ page }) => {
       await page.goto("/en");
       await expect(page).toHaveTitle(/Basefly/i);
     });
   });
   ```

3. Run the suite locally and confirm the new test passes before opening a PR.

## CI Integration

The `e2e` workflow runs the suite in CI. The canonical workflow definition is stored at `docs/ci/e2e-workflow.yml` and must be copied to `.github/workflows/e2e.yml` by a maintainer with `workflows` write permission (a GitHub App token without that permission cannot push workflow files — see Issue #501). See the `docs/ci/security-audit.patch` precedent for the same pattern. Until that copy is made, the workflow is not live in this repository.

The workflow:

- **Triggers**: manual dispatch, pull requests touching `tests/e2e/**`, `playwright.config.ts`, `apps/nextjs/**`, or the workflow itself, and a weekly schedule (Monday 06:00 UTC).
- **Guard**: the job only runs when the `CLERK_SECRET_KEY`, `STRIPE_API_KEY`, and `POSTGRES_URL` secrets are configured. Repositories without E2E credentials get a skipped job instead of a failing one.
- **Flow**: installs dependencies from the lockfile, installs the Playwright Chromium browser, boots the dev server, waits for readiness, runs the suite, and uploads the Playwright report as a build artifact (retained for 7 days).

## Troubleshooting

- **Dev server fails to start**: check `/tmp/dev-server.log` (CI) or the terminal output (local). Confirm all required environment variables from `.env.example` are set.
- **Clerk sign-in component not visible**: the `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` pair must belong to the same Clerk application and be valid for the environment under test.
- **Flaky tests**: re-run with `pnpm test:e2e:headed` to observe the browser, or inspect the trace/video artifacts from the CI report.
- **Tests pass locally but fail in CI**: verify `E2E_BASE_URL` and that the CI environment has the required secrets configured at the repository level.