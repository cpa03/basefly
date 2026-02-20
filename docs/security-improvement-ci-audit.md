# Security Improvement: Add CI Dependency Audit

## Summary

This document proposes adding a security audit stage to the CI workflow to catch dependency vulnerabilities before they reach production.

## Problem

The quality assessment report (`docs/quality-assessment-2026-02-18.md`) identified:

> **Issue 2: Missing Security Audit in CI [P1-security]**
>
> - No `npm audit` or `pnpm audit` in CI workflows
> - No dependency vulnerability scanning

## Proposed Solution

Add a `security-audit` job as Stage 0 in `.github/workflows/iterate.yml` that:

1. Runs before all other jobs (fail fast)
2. Executes `pnpm audit --audit-level=moderate`
3. Blocks downstream jobs if vulnerabilities are found
4. Provides audit summary in GitHub Actions

### Proposed Workflow Addition

```yaml
jobs:
  security-audit:
    name: "Security: Dependency Audit"
    runs-on: ubuntu-24.04-arm
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
          version: 9

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Security Audit
        run: |
          echo "🔒 Running security audit..."
          pnpm audit --audit-level=moderate
          echo "✅ Security audit passed - no moderate or higher vulnerabilities found"

      - name: Audit Summary
        if: always()
        run: |
          echo "### Security Audit Summary" >> $GITHUB_STEP_SUMMARY
          echo "- **Audit Level**: Moderate and above" >> $GITHUB_STEP_SUMMARY
          echo "- **Status**: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY

  architect:
    needs: security-audit
    # ... rest of workflow
```

## Current Vulnerabilities

Running `pnpm audit --audit-level=moderate` currently finds vulnerabilities in transitive dependencies. The `pnpm-workspace.yaml` includes security overrides for known vulnerable packages.

## Recommendations

1. **Immediate**: Add the security audit stage to CI (requires workflow permissions)
2. **Short-term**: Update overrides in `pnpm-workspace.yaml` to address remaining vulnerabilities
3. **Long-term**: Consider upgrading to Next.js 15.x or newer which has security fixes

## Security Controls Already in Place

- ✅ Dependabot configured for weekly updates
- ✅ Security overrides in `pnpm-workspace.yaml` (cross-spawn, lodash, next, ws, etc.)
- ✅ CSP headers configured in `packages/common/src/config/csp.ts`
- ✅ Security headers in `next.config.mjs` (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- ✅ Rate limiting in `packages/api/src/rate-limiter.ts` with token bucket algorithm
- ✅ Input validation with Zod schemas in `packages/api/src/router/schemas.ts`
- ✅ Protected tRPC procedures with auth middleware (`isAuthed`, `isAdmin`)
- ✅ Admin procedures with email-based admin verification
- ✅ Stripe webhook signature verification in `apps/nextjs/src/app/api/webhooks/stripe/route.ts`
- ✅ T3 env validation for environment variables
- ✅ Request ID tracing for debugging
- ✅ security.txt file for vulnerability reporting

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

This change requires workflow write permissions. The implementation is ready but requires:

1. Manual merge by someone with workflow permissions, OR
2. GitHub App with `workflows` permission

## Local Security Audit

Run security audit locally:

```bash
pnpm security:audit
```

Or with full DX check:

```bash
pnpm dx:check
```

---

_Document created by security-engineer agent_
_Last updated: 2026-02-20_
