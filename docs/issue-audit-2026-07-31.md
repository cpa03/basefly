# Issue Audit Report — 2026-07-31

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0 → Issue Manager; entered because 0 open PRs and 82 open issues were found).

## 2. Decision Summary

- **82 open issues**, 0 open PRs. Default branch detected: `main`.
- Executed Issue Manager workflow: normalization plan → duplicate detection → consolidation → repair mode.
- **Permission constraint confirmed**: the automation token (`github-actions[bot]`, running under `on-pull.yml`) has read-only access to issues. GraphQL mutations `addLabelsToLabelable`, `addComment`, and `closeIssue` all return `Resource not accessible by integration`. `contents` and `pull-requests` are writable (branch push and PR creation verified).
- Therefore label changes, issue closures, and issue creation are **documented here for application by a privileged process**, while the repair-mode fix is implemented and delivered via PR (this report is delivered in the same PR).

## 3. Correction to Previous Report (2026-07-31)

`docs/issue-manager-audit-2026-07-31.md` (merged via PR #1030) claims:

> **Fix applied:** `.github/workflows/iterate.yml` — completed the pnpm migration

**This is inaccurate.** PR #1030 was docs-only (`docs/issue-manager-audit-2026-07-31.md`). Verification on 2026-07-31:

```
.github/workflows/iterate.yml:58:  ~/.npm
.github/workflows/iterate.yml:59:  key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
.github/workflows/iterate.yml:72:  - run: npm ci || true
.github/workflows/iterate.yml:342: - run: npm ci || true
```

The iterate.yml pnpm migration is **NOT merged**. Canonical issue #305 (and duplicates #670, #744, #584, #595) remain open and valid. This report's normalization mapping below covers them.

## 4. Label Normalization Plan

Mandated scheme: exactly one category (`bug|enhancement|feature|docs|refactor|chore|test|ci|security`) + exactly one priority (`P0|P1|P2|P3`).

### 4.1 Issues missing priority labels (38 issues)

| Issue | Priority | Category (current) | Issue | Priority | Category (current) |
| ----- | -------- | ------------------ | ----- | -------- | ------------------ |
| #789  | P2       | enhancement        | #752  | P3       | enhancement        |
| #788  | P2       | test               | #751  | P3       | enhancement        |
| #787  | P2       | test               | #749  | P3       | feature            |
| #786  | P1       | security           | #748  | P2       | bug                |
| #785  | P2       | bug                | #744  | P2       | ci                 |
| #755  | P2       | enhancement        | #731  | P3       | enhancement        |
| #754  | P2       | test               | #729  | P3       | enhancement        |
| #753  | P3       | enhancement        | #728  | **P1**   | security           |
| #727  | P3       | enhancement        | #725  | P2       | test               |
| #726  | P2       | ci                 | #724  | P2       | test               |
| #723  | P2       | enhancement        | #722  | **P1**   | security           |
| #721  | **P1**   | security           | #720  | P3       | enhancement        |
| #719  | P2       | enhancement        | #713  | P2       | test               |
| #697  | P2       | docs               | #668  | P3       | enhancement        |
| #636  | P3       | enhancement        | #635  | P3       | docs               |
| #634  | P2       | enhancement        | #632  | **P1**   | security           |
| #631  | P2       | enhancement        | #630  | P3       | enhancement        |
| #628  | P2       | enhancement        | #595  | P2       | ci                 |
| #584  | P2       | ci                 | #305  | P2       | ci                 |
| #670  | P2       | ci                 |       |          |                    |

### 4.2 Issues with redundant category labels (remove extras)

| Issue | Keep     | Remove                |
| ----- | -------- | --------------------- |
| #713  | test     | enhancement           |
| #584  | ci       | enhancement           |
| #305  | ci       | enhancement           |
| #523  | refactor | enhancement           |
| #522  | ci       | enhancement, refactor |
| #515  | security | enhancement           |
| #581  | test     | enhancement           |
| #551  | test     | enhancement           |
| #550  | test     | enhancement           |
| #549  | test     | enhancement           |
| #498  | security | enhancement           |
| #496  | security | enhancement           |
| #688  | security | enhancement           |
| #480  | security | enhancement           |

### 4.3 Issues missing category labels (add category)

| Issue | Add         |
| ----- | ----------- |
| #755  | enhancement |
| #754  | test        |
| #753  | enhancement |
| #752  | enhancement |
| #751  | enhancement |
| #749  | feature     |
| #748  | bug         |
| #744  | ci          |
| #697  | docs        |
| #635  | docs        |
| #595  | ci          |
| #670  | ci          |

## 5. Resolution Evidence (verified on 2026-07-31)

The following open issues are **resolved in `main`** and should be closed with the cited evidence:

| Issue     | Title                                        | Resolution Evidence                                                                                                                                                                      |
| --------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496 (P0) | Replace in-memory rate limiter with Redis    | `packages/api/src/distributed-rate-limiter.ts` active in `packages/api/src/trpc.ts`; merged via PR #627 (`f7f73e1`), activated in `5881602`; tests in `distributed-rate-limiter.test.ts` |
| #480 (P1) | Redis-based rate limiter (duplicate of #496) | Same evidence as #496                                                                                                                                                                    |
| #501 (P1) | Playwright E2E tests                         | 11 spec files in `tests/e2e/` incl. `critical-flows.spec.ts`, `auth.spec.ts`, `billing.spec.ts`; `playwright.config.ts` + `test:e2e` scripts in root package.json                        |
| #628      | E2E testing with Playwright                  | Same evidence as #501                                                                                                                                                                    |
| #724      | Missing e2e coverage                         | Same evidence as #501                                                                                                                                                                    |
| #720      | Missing .nvmrc                               | `.nvmrc` exists with `22.14.0`                                                                                                                                                           |
| #748      | .nvmrc invalid value '20'                    | `.nvmrc` = `22.14.0` (valid)                                                                                                                                                             |
| #785      | Duplicate next dep in packages/stripe        | No `next` key duplication in `packages/stripe/package.json`                                                                                                                              |
| #786      | Stripe webhook logs partial secret           | Route refactored to `apps/nextjs/src/app/api/webhooks/stripe/route.ts`; logs use non-secret identifier, no `slice(-8)` of `STRIPE_WEBHOOK_SECRET`                                        |
| #719      | Missing root-level tsconfig                  | `tsconfig.json` present at repo root                                                                                                                                                     |
| #688      | Create middleware.ts                         | `apps/nextjs/src/proxy.ts` present (Next.js 16 renamed middleware)                                                                                                                       |
| #722      | Env variable validation at startup           | `apps/nextjs/src/env.mjs` and `packages/common/src/env.mjs` with T3 env validation                                                                                                       |
| #721      | Explicit authorization checks                | `requireRole` middleware + `createRoleBasedProcedure` in `packages/api/src/trpc.ts`; behavioral tests in `packages/api/src/rbac.test.ts`                                                 |
| #498 (P1) | Email-based admin RBAC → role-based          | Merged via PR #1031 (`5aff78e`)                                                                                                                                                          |
| #515 (P1) | CSRF protection                              | `csrfProtection` middleware (origin/referer validation) in `packages/api/src/trpc.ts`                                                                                                    |
| #549 (P1) | Tests for packages/auth (0% coverage)        | `packages/auth/clerk.test.ts` exists (Auth Module suite)                                                                                                                                 |
| #550 (P1) | Include apps/nextjs in coverage config       | `vitest.config.ts` coverage include: `["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`                                                                                       |
| #551 (P1) | Tests for k8s router                         | `packages/api/src/router/k8s.test.ts` exists                                                                                                                                             |
| #725      | Integration tests for API routers            | Router test files exist: admin, auth, customer, hello, k8s, stripe, validation                                                                                                           |
| #631      | Router tests for k8s/customer/stripe         | Same evidence as #725                                                                                                                                                                    |

**Partially resolved (keep open, update description):**

| Issue     | Status                                                                                                                                                                  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #500 (P1) | Clerk auth flow tests: `packages/auth/clerk.test.ts` covers `isClerkEnabled` + logger; session verification / JWT / admin checks still untested — narrow scope and keep |
| #663      | eslint-disable comments reduced to 31 outside tests (was higher) — partial                                                                                              |
| #787      | packages/db has 5 test files (soft-delete, rls-middleware, logger, db-instance, user-deletion); migration/schema tests still missing                                    |
| #788      | apps/nextjs has component tests (navbar, modal, cluster, skip-link, empty-placeholder) — remaining coverage gap                                                         |

## 6. Duplicates & Consolidation

| Canonical                               | Duplicates             | Rationale                                                                                                                                                     |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #305 (pnpm CI consistency)              | #670, #744, #584, #595 | All describe npm→pnpm migration in GitHub Actions (iterate.yml and related). **Note:** #305 itself is NOT resolved — iterate.yml still uses `npm ci` (see §3) |
| #723 (client components bundle size)    | #753, #751             | #753 (route-based code splitting) and #751 (tRPC router bundle) are tactics for the same bundle-size goal; fold into #723 as sub-tasks                        |
| #731 (auto-generate API docs from tRPC) | #749                   | #749 (AI-powered API docs/testing generator) overlaps on tRPC doc generation; fold into #731                                                                  |

## 7. Repair Mode — Solution

**Target issue:** #728 [Security] Add security scanning workflows to CI (P1 — highest-priority open issue after resolution/consolidation; previous P0/P1 issues #496, #498, #515, #721, #722, #549, #550, #551, #501, #480 are resolved in `main`, see §5).

**Design doc:** `docs/security-improvement-ci-audit.md` already specified `security-audit.yml` and `codeql-analysis.yml`, but neither file ever existed in git history (only `codeql-config.yml`, `dependabot.yml`, and root `security:*` scripts were present). The doc's "✅ Deployed" status claims were inaccurate.

**Delivery constraint:** the automation token running under `on-pull.yml` lacks `workflows: write` (its `permissions:` block declares only `contents`, `pull-requests`, `actions`, `repository-projects`, `id-token`). Pushing `.github/workflows/*` files is rejected by GitHub ("refusing to allow a GitHub App to create or update workflow ... without `workflows` permission"). The two workflow files were therefore **not** deliverable in this PR; their complete, ready-to-apply contents are embedded below (§7.2), and applying them requires either:

1. A privileged run with `workflows: write` (e.g., adding `workflows: write` to `on-pull.yml`'s `permissions:` block first — itself a workflow change), or
2. Manual application by a maintainer.

**Design (verified against current `main`):**

1. **`.github/workflows/security-audit.yml`** (new):
   - `dependency-audit` — **blocking**: `pnpm audit --prod --audit-level=high`. Verified exit 0 on current `main`.
   - `full-audit` — **informational** (`continue-on-error`): `pnpm audit --audit-level=moderate`. Surfaces all advisories incl. dev dependencies without blocking merges.
   - `outdated-check` — **informational**: `pnpm outdated || true`.
2. **`.github/workflows/codeql-analysis.yml`** (new): GitHub CodeQL for `javascript-typescript` using existing `.github/codeql-config.yml` (security-and-quality queries, paths: apps/packages/tooling). Blocking.
3. Action versions follow current repo convention (`actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6`).

### 7.1 Verification performed

- `pnpm audit --prod --audit-level=high` → **exit 0** (blocking gate passes on current main)
- `pnpm audit --audit-level=moderate` → exit 1 (expected — informational job only)
- `pnpm audit --prod --audit-level=moderate` → exit 1 (2 moderate, un-patchable, see below)
- Both workflow YAML definitions validated via `yaml.safe_load`
- Root test suite: **1454 tests / 71 files, all pass** (`pnpm test`)

### 7.2 Ready-to-apply workflow files

**`.github/workflows/security-audit.yml`:**

```yaml
name: Security Audit

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  schedule:
    - cron: "0 6 * * 1" # Weekly on Monday at 06:00 UTC
  workflow_dispatch:

permissions:
  contents: read

jobs:
  # Blocking gate: fail when high/critical vulnerabilities exist in production
  # dependencies. Passes today (baseline: 2 known moderate advisories in
  # @opentelemetry/core, un-patchable via overrides — peer dependencies of the
  # unmaintained contentlayer2/@effect-ts stack).
  dependency-audit:
    name: Production Dependency Audit
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup pnpm
        uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Production Security Audit
        run: pnpm audit --prod --audit-level=high

      - name: Audit Summary
        if: always()
        run: |
          echo "### Production Dependency Audit" >> "$GITHUB_STEP_SUMMARY"
          echo "- **Gate**: high/critical vulnerabilities in production dependencies" >> "$GITHUB_STEP_SUMMARY"
          echo "- **Status**: ${{ job.status }}" >> "$GITHUB_STEP_SUMMARY"

  # Informational: surface the full audit (incl. dev dependencies) without
  # blocking merges. Known baseline: 5 moderate + 2 high advisories, all in the
  # contentlayer2 -> @effect-ts/otel -> @opentelemetry/* stack (peer deps).
  full-audit:
    name: Full Dependency Audit (informational)
    runs-on: ubuntu-latest
    timeout-minutes: 15
    continue-on-error: true

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup pnpm
        uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Full Security Audit
        run: pnpm audit --audit-level=moderate

      - name: Audit Summary
        if: always()
        run: |
          echo "### Full Dependency Audit" >> "$GITHUB_STEP_SUMMARY"
          echo "- **Gate**: moderate and above across all dependencies (informational)" >> "$GITHUB_STEP_SUMMARY"
          echo "- **Status**: ${{ job.status }}" >> "$GITHUB_STEP_SUMMARY"

  # Informational: track dependency drift without blocking merges.
  outdated-check:
    name: Outdated Dependencies (informational)
    runs-on: ubuntu-latest
    timeout-minutes: 15
    continue-on-error: true

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup pnpm
        uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Check Outdated Packages
        run: pnpm outdated || true
```

**`.github/workflows/codeql-analysis.yml`:**

```yaml
name: "CodeQL Security Analysis"

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  schedule:
    - cron: "0 0 * * 0" # Weekly on Sunday at 00:00 UTC
  workflow_dispatch:

permissions:
  contents: read
  security-events: write
  actions: read

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    timeout-minutes: 30

    strategy:
      fail-fast: false
      matrix:
        language: ["javascript-typescript"]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v7

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          config-file: .github/codeql-config.yml

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

**Known vulnerabilities (baseline, documented in workflow comments):**

```
pnpm audit --audit-level=moderate → 7 advisories (5 moderate, 2 high)
  high:      @opentelemetry/propagator-jaeger <2.9.0 (GHSA: DoS in JaegerPropagator)
  moderate:  @opentelemetry/core <2.8.0 (GHSA-8988-4f7v-96qf: unbounded memory in W3C Baggage)
```

Both advisories flow through the unmaintained `contentlayer2 → @effect-ts/otel → @opentelemetry/*` stack, where `@opentelemetry/core`/`@opentelemetry/propagator-jaeger` are **peer dependencies** — pnpm overrides cannot patch them (verified empirically; override entries in `pnpm-workspace.yaml` have no effect on peer resolution). Proper remediation requires replacing `contentlayer2` (dev tooling) — a separate refactor outside this issue's scope. The blocking production gate (`--prod --audit-level=high`) passes today.

## 8. Recommended Next Actions (for a privileged process)

1. Apply the label mapping in §4 to all 82 open issues.
2. Close the resolved issues in §5 with the cited evidence (20 issues).
3. Close duplicates per §6 (9 issues) referencing canonical issues.
4. Re-target #305: implement the iterate.yml pnpm migration (design already documented in `docs/issue-manager-audit-2026-07-31.md` §3).
5. Fix the inaccurate "Fix applied" claim in `docs/issue-manager-audit-2026-07-31.md`.
6. Grant `workflows: write` to the automation workflow (`on-pull.yml` `permissions:` block) or use a privileged app token, then create the two workflow files from §7.2 to close #728.

---

_Evaluation date: 2026-07-31. Generated by the autonomous repository-maintenance loop (Issue Manager Mode)._
