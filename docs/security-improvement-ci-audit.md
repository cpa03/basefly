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

Running `pnpm audit --audit-level=moderate` currently finds 7 vulnerabilities:

| Severity | Package     | Issue                                                  |
| -------- | ----------- | ------------------------------------------------------ |
| high     | cross-spawn | ReDoS (GHSA-3xgq-45jj-v275)                            |
| high     | next        | HTTP request deserialization DoS (GHSA-h25m-26qc-wcjf) |
| moderate | lodash      | Prototype Pollution (GHSA-xxjr-mmjv-4gpg)              |
| moderate | next        | Image Optimizer DoS (GHSA-9g9p-9gw9-jx7f)              |
| moderate | ajv         | ReDoS with $data option (GHSA-2g4f-4pwh-qvx6)          |

These are primarily transitive dependencies from:

- `@clerk/nextjs` → `next@14.2.35`
- `prisma-kysely` → `cross-spawn@7.0.3`, `lodash@4.17.21`

## Recommendations

1. **Immediate**: Add the security audit stage to CI
2. **Short-term**: Update overrides in `pnpm-workspace.yaml` to address remaining vulnerabilities
3. **Long-term**: Consider upgrading to Next.js 16.x which has security fixes

## Security Controls Already in Place

- ✅ Dependabot configured for weekly updates
- ✅ Security overrides in `pnpm-workspace.yaml`
- ✅ CSP headers configured in `packages/common/src/config/csp.ts`
- ✅ Security headers in `next.config.mjs`
- ✅ Rate limiting in `packages/api/src/rate-limiter.ts`
- ✅ Input validation with Zod schemas
- ✅ Protected tRPC procedures with auth middleware

## Implementation Notes

This change requires workflow write permissions. The implementation is ready but requires:

1. Manual merge by someone with workflow permissions, OR
2. GitHub App with `workflows` permission

---

_Document created by security-engineer agent_
