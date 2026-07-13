# Issue Audit Report — 2026-07-13

## Summary

Full Issue Manager Mode cycle executed across all 20 open issues. Key findings below.

## Step 1: Issue Normalization

All issues reviewed for category and priority labels. Priority labels need to be applied manually (token lacks `addLabels` permission):

| Issue | Title                                                         | Category                     | Recommended Priority |
| ----- | ------------------------------------------------------------- | ---------------------------- | -------------------- |
| #789  | Add peerDependencies for React in packages/ui                 | enhancement                  | P3                   |
| #788  | Add unit tests for critical UI components                     | test                         | P2                   |
| #787  | Add unit tests for packages/db migrations                     | test                         | P2                   |
| #786  | Stripe webhook logs partial secret                            | security                     | P1                   |
| #785  | Fix duplicate next dependency in packages/stripe/package.json | bug                          | P1                   |
| #755  | Add composite index for customer subscription queries         | database-architect           | P3                   |
| #754  | Add integration tests for Stripe webhook idempotency          | quality-assurance            | P1                   |
| #753  | Implement route-based code splitting                          | frontend-engineer            | P2                   |
| #752  | Create unified CLI output utilities                           | DX-engineer                  | P3                   |
| #751  | Optimize tRPC router bundle size                              | performance-engineer         | P2                   |
| #749  | AI-powered API endpoint testing                               | Growth-Innovation-Strategist | P3                   |
| #748  | .nvmrc contains invalid value '20'                            | DX-engineer                  | P2                   |
| #744  | pnpm consistency in iterate.yml                               | Growth-Innovation-Strategist | P1                   |
| #731  | Auto-generate API documentation                               | enhancement                  | P3                   |
| #729  | Add bundle size regression testing                            | enhancement                  | P3                   |
| #728  | Add security scanning workflows to CI                         | security                     | P1                   |
| #727  | AI-Powered Code Review Automation                             | enhancement                  | P3                   |
| #726  | Add dependency consistency checking to CI                     | ci                           | P2                   |
| #725  | Add integration tests for API routers                         | test                         | P2                   |
| #724  | Missing e2e test coverage for critical flows                  | test                         | P1                   |

## Step 2: Duplicate Detection

No clear duplicates found. Issues cover distinct areas:

- Testing: unit (788, 787), e2e (724), integration (725, 754) — different scopes
- CI: security scanning (728), dependency check (726), pnpm migration (744) — different concerns
- Performance: code splitting (753), bundle size (751), bundle monitoring (729) — different optimizations
- AI/Innovation: API testing (749), docs generation (731), code review (727) — separate features

## Step 3: Consolidation — Resolved Issues

The following issues have fixes merged to `main` but remain open:

| Issue | Status           | Evidence                                                                                                                                                |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #786  | ✅ **RESOLVED**  | commit `69b43e0` removes secret logging from webhook                                                                                                    |
| #785  | ✅ **RESOLVED**  | packages/stripe/package.json no longer has "next" dependency                                                                                            |
| #754  | ✅ **RESOLVED**  | 425-line comprehensive test file exists at packages/stripe/src/webhook-idempotency.test.ts                                                              |
| #748  | ✅ **RESOLVED**  | .nvmrc contains "22.14.0" (valid semver)                                                                                                                |
| #724  | ✅ **RESOLVED**  | 11 e2e test files exist (was 6 at filing): subscription-workflows, critical-flows, webhook-error-handling, authorization-bypass, cluster, billing, etc. |
| #788  | ✅ **RESOLVED**  | UI component tests exist: navbar, modal, cluster, status-badge, etc.                                                                                    |
| #744  | ⚠️ **PARTIALLY** | Migration script exists (scripts/ci-pnpm-migration.sh) but iterate.yml still uses `npm ci`                                                              |
| #728  | ⚠️ **PARTIALLY** | Security workflow templates exist in docs/ci/workflows/ but not in .github/workflows/                                                                   |
| #787  | ⚠️ **PARTIALLY** | 5 test files exist (was 2) but no k8sClusterService or customerService tests                                                                            |

## Step 4: Repair Mode

**Selected issue**: #744 — pnpm consistency in iterate.yml

**Fix applied locally**:

- `.github/workflows/iterate.yml`: `npm ci || true` → `corepack enable && pnpm install --frozen-lockfile || true` (2 jobs)
- Cache path: `~/.npm` → `~/.pnpm-store`
- Cache key: `package-lock.json` → `pnpm-lock.yaml`
- **Verification**: YAML valid, typecheck passes, all 1419 tests pass

**Blocked**: Push rejected — GITHUB_TOKEN lacks `workflows` permission for `.github/workflows/` files.

## Recommendations

1. **Close stale issues**: #786, #785, #754, #748, #724, #788 are all fixed on main
2. **Complete #744**: Push iterate.yml changes with a token that has `workflows` permission
3. **Complete #728**: Deploy security workflows from docs/ci/workflows/ to .github/workflows/
4. **Complete #787**: Add k8sClusterService and customerService DB tests
5. **Address P2 issues**: #788 (tests), #787 (db tests), #753 (code splitting), #751 (tRPC bundle), #726 (CI dependency check), #725 (API integration tests)

## Environment Constraints

- GITHUB_TOKEN: Read-only API, git push to non-workflow files only
- Cannot create/modify issues, labels, comments, PRs
- Cannot push to `.github/workflows/` directory
