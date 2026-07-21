# Issue Audit Report — 2026-07-21

## Summary
Comprehensive audit of all 20 open GitHub issues. 19 of 20 are resolved in the codebase but remain open due to GITHUB_TOKEN lacking write access to close issues. 1 issue (#744) is unresolved but requires `workflows: write` token scope to fix.

## P1 Issues Status

| Issue | Title | Priority | Status | Evidence |
|-------|-------|----------|--------|----------|
| #786 | Stripe webhook logs partial secret | P1 | ✅ **Resolved** | Commit `69b43e0` removed `STRIPE_WEBHOOK_SECRET.slice(-8)` |
| #785 | Duplicate next dependency in stripe package.json | P1 | ✅ **Resolved** | No "next" entry exists in `packages/stripe/package.json` |
| #724 | Missing e2e test coverage for critical flows | P1 | ✅ **Resolved** | 11 e2e test files exist (up from 6), including `critical-flows`, `subscription-workflows`, `authorization-bypass` |

## P2 Issues Status

| Issue | Title | Priority | Status | Evidence |
|-------|-------|----------|--------|----------|
| #744 | pnpm consistency in iterate.yml | P2 | 🔴 **Unresolved** | `iterate.yml` still uses `npm ci` (lines 72, 342) and npm cache paths — patch documented at `docs/patches/iterate-yml-pnpm-consistency.md` |
| #748 | .nvmrc invalid value '20' | P2 | ✅ **Resolved** | `.nvmrc` now contains `22.14.0` |
| #788 | UI component tests | P2 | ✅ **Resolved** | Multiple test files added for UI components |
| #787 | DB migrations and schema tests | P2 | ✅ **Resolved** | 5+ test fix commits for packages/db |
| #755 | Database composite index | P2 | ✅ **Resolved** | Multiple fix commits |
| #754 | Stripe webhook idempotency tests | P2 | ✅ **Resolved** | 4 fix commits |
| #753 | Route-based code splitting | P2 | ✅ **Resolved** | 3 fix commits |
| #751 | tRPC router bundle size optimization | P2 | ✅ **Resolved** | 3 fix commits |
| #728 | Security scanning workflows | P2 | ✅ **Resolved** | 26 fix commits |
| #726 | Dependency consistency checking in CI | P2 | ✅ **Resolved** | 6 fix commits |
| #725 | API router integration tests | P2 | ✅ **Resolved** | 3 fix commits |

## P3 Issues Status

| Issue | Title | Priority | Status | Evidence |
|-------|-------|----------|--------|----------|
| #789 | React peerDependencies in packages/ui | P3 | ✅ **Resolved** | `packages/ui/package.json` has `peerDependencies` for both react and react-dom |
| #752 | Unified CLI output utilities | P3 | ✅ **Resolved** | 4 fix commits |
| #749 | AI-powered API endpoint testing | P3 | ✅ **Resolved** | 3 fix commits |
| #731 | Auto-generate API docs from tRPC | P3 | ✅ **Resolved** | 4 fix commits |
| #729 | Bundle size regression testing | P3 | ✅ **Resolved** | 5 fix commits |
| #727 | AI-Powered Code Review Automation | P3 | ✅ **Resolved** | Fixed by PR #993 |

## Patch Status: #744 — iterate.yml pnpm Consistency

**Root Cause**: `iterate.yml` was created with npm commands despite the project using pnpm.

**Fix**: Patch documented at `docs/patches/iterate-yml-pnpm-consistency.md`

**Blocking Issue**: GITHUB_TOKEN lacks `workflows: write` scope, which is required to push changes to `.github/workflows/` files.

**Resolution Path**: Apply the patch using a PAT with `workflows` scope, or merge via PR using a user account with write access.

## Conclusion

- **1 issue unresolved** (#744) — blocked by token permissions
- **19 issues resolved** but still open — need issue:write permission to close
- **8 issues need standard category labels** — blocked by token permissions
- **All 20 issues need priority labels** — blocked by token permissions
