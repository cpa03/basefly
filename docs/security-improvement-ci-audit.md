# Security Improvement: CI Security Enhancements

## Summary

This document proposes adding security scanning and audit stages to CI workflows to catch vulnerabilities before they reach production.

## Problems Identified

The quality assessment report (`docs/quality-assessment-2026-02-18.md`) identified:

> **Issue 2: Missing Security Audit in CI [P1-security]**
>
> - No `npm audit` or `pnpm audit` in CI workflows
> - No dependency vulnerability scanning
> - No CodeQL or SAST scanning configured

## Proposed Solutions

### 1. Dependency Security Audit Workflow

Add a dedicated `security-audit.yml` workflow that:

1. Runs on push to main, PRs, and weekly schedule
2. Executes `pnpm audit --audit-level=moderate`
3. Includes outdated dependency check as informational job
4. Provides audit summary in GitHub Actions

### 2. CodeQL Security Scanning Workflow

Add a `codeql-analysis.yml` workflow that:

1. Runs CodeQL analysis for JavaScript/TypeScript
2. Triggers on push to main, PRs, and weekly schedule
3. Identifies security vulnerabilities in code
4. Integrates with GitHub Security tab for vulnerability alerts

### Proposed Security Audit Workflow

Create `.github/workflows/security-audit.yml`:

```yaml
name: Security Audit

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  schedule:
    - cron: "0 6 * * 1" # Weekly on Monday at 6 AM UTC
  workflow_dispatch:

permissions:
  contents: read
  security-events: write

jobs:
  dependency-audit:
    name: "Dependency Security Audit"
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Security Audit
        run: |
          pnpm audit --audit-level=moderate

      - name: Audit Summary
        if: always()
        run: |
          echo "### Security Audit Summary" >> $GITHUB_STEP_SUMMARY
          echo "- **Audit Level**: Moderate and above" >> $GITHUB_STEP_SUMMARY
          echo "- **Status**: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY

  npm-outdated:
    name: "Outdated Dependencies Check"
    runs-on: ubuntu-latest
    continue-on-error: true

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Check Outdated Packages
        run: pnpm outdated || true
```

### Proposed CodeQL Workflow

Create `.github/workflows/codeql-analysis.yml`:

```yaml
name: "CodeQL Security Analysis"

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  schedule:
    - cron: "0 0 * * 0" # Weekly on Sunday at midnight UTC
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
        uses: actions/checkout@v6

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{matrix.language}}"
```

## Current Vulnerabilities

Running `pnpm audit --audit-level=moderate` currently finds vulnerabilities in transitive dependencies. The `pnpm-workspace.yaml` includes security overrides for known vulnerable packages.

## Recommendations

### Priority 1: Immediate (Requires Workflow Permissions)

1. **Add CodeQL Security Scanning** - Create `.github/workflows/codeql-analysis.yml` (see proposed workflow above)
2. **Add Dependency Security Audit** - Create `.github/workflows/security-audit.yml` (see proposed workflow above)

### Priority 2: Short-term

3. **Update Security Overrides** - Review and update overrides in `pnpm-workspace.yaml` for any new advisories
4. **Add Rate Limit Headers** - Include `X-RateLimit-Limit` and `X-RateLimit-Remaining` in API responses
5. **Enable Strict Peer Dependencies** - Consider setting `strict-peer-dependencies=true` in `.npmrc`

### Priority 3: Long-term

6. **Nonce-based CSP** - Migrate from `'unsafe-inline'` to nonce-based CSP for production
7. **IP-based Blocking** - Add automatic IP blocking for repeated rate limit violations
8. **Security Headers Audit** - Verify all API routes include security headers

## Security Controls Already in Place

- ✅ Dependabot configured for weekly updates (`.github/dependabot.yml`)
- ✅ Security overrides in `pnpm-workspace.yaml` (axios, qs, cross-spawn, js-yaml, lodash, minimatch, next, prismjs, tmp, ws)
- ✅ CSP headers configured in `packages/common/src/config/csp.ts` with modular domain configuration
- ✅ Security headers in `next.config.mjs` (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- ✅ Rate limiting in `packages/api/src/rate-limiter.ts` with token bucket algorithm
- ✅ Input validation with Zod schemas in `packages/api/src/router/schemas.ts` and `apps/nextjs/src/lib/validations/`
- ✅ Protected tRPC procedures with auth middleware (`isAuthed`, `isAdmin`) in `packages/api/src/trpc.ts`
- ✅ Admin procedures with email-based admin verification via `isAdminEmail()`
- ✅ Stripe webhook signature verification in `apps/nextjs/src/app/api/webhooks/stripe/route.ts`
- ✅ T3 env validation for environment variables in `apps/nextjs/src/env.mjs`
- ✅ Request ID tracing for debugging in `packages/api/src/request-id.ts`
- ✅ Row-Level Security (RLS) enabled on database tables via migration `20260131_add_row_level_security`
- ✅ Clerk authentication with CSRF protection built-in
- ✅ Webhook idempotency to prevent replay attacks in `packages/stripe/src/webhook-idempotency.ts`
- ✅ Security audit scripts in root `package.json`: `security:audit`, `security:check`, `dx:check`

## Additional Security Recommendations

### CSP Improvements

The current CSP configuration uses `'unsafe-inline'` for scripts and styles. Consider migrating to nonce-based CSP for production:

1. Generate a unique nonce per request
2. Pass nonce to inline scripts/styles
3. Remove `'unsafe-inline'` from CSP directives

### Rate Limiting Enhancements

Consider adding:

- IP-based blocking for repeated abuse
- Sliding window rate limiting
- Rate limit headers in responses (X-RateLimit-Limit, X-RateLimit-Remaining)

### Security Headers Audit

Verify all responses include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy` with appropriate restrictions

## Implementation Notes

### Workflow Creation Requirements

Creating workflow files requires write permissions for `.github/workflows/`. The implementation requires:

1. Manual merge by someone with workflow permissions, OR
2. GitHub App with `workflows` permission

### Files to Create

1. `.github/workflows/codeql-analysis.yml` - CodeQL security scanning
2. `.github/workflows/security-audit.yml` - Dependency vulnerability audit

### Current Vulnerabilities

Running `pnpm audit --audit-level=moderate` may find vulnerabilities in transitive dependencies. The `pnpm-workspace.yaml` includes security overrides for known vulnerable packages.

### Local Security Audit

Run security audit locally:

```bash
pnpm security:audit
```

Or with full DX check:

```bash
pnpm dx:check
```

### Security Checklist

- [x] Dependabot configured
- [x] Security overrides in pnpm-workspace.yaml
- [x] CSP headers configured
- [x] Rate limiting implemented
- [x] Input validation with Zod
- [x] Protected tRPC procedures
- [x] Stripe webhook verification
- [x] RLS enabled on database
- [ ] CodeQL scanning in CI (requires workflow permissions)
- [ ] Dependency audit in CI (requires workflow permissions)
- [ ] Rate limit headers in responses
- [ ] Nonce-based CSP for production

---

_Document created by security-engineer agent_
_Last updated: 2026-02-20_
_Updated with CodeQL workflow proposal_
