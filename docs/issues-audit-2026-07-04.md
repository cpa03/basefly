# Open Issues Audit — 2026-07-04

**Auditor**: Sisyphus (automated agent)
**Methodology**: Code inspection, git history analysis, build/test/lint verification

---

## Summary

| Status                      | Count | Issues                                         |
| --------------------------- | ----- | ---------------------------------------------- |
| ✅ Already fixed in code    | 4     | #785, #786, #748, #789                         |
| ❌ Never existed / invalid  | 1     | #785 (duplicate `next` never in file)          |
| 🔴 Blocked (workflow perms) | 3     | #744, #728, #726                               |
| 🟡 Partially addressed      | 5     | #788, #787, #724, #725, #754                   |
| 🟢 Genuinely open           | 7     | #755, #753, #752, #751, #749, #731, #729, #727 |

---

## Detailed Issue Status

### #785 — [Architecture] Fix duplicate next dependency

**Status: ❌ Never existed**

- Git history shows `packages/stripe/package.json` never contained a `next` dependency
- Initial commit (`aaf8c60`) through HEAD: no `next` entry ever

### #786 — [Security] Stripe webhook logs partial secret

**Status: ✅ Fixed in commit `69b43e0` (2026-05-25)**

- Commit message: "fix(security): remove partial secret logging from Stripe webhook rate limiter"
- Current code logs only `identifier`, `requestId`, `resetAt` — no secrets

### #748 — [DX] .nvmrc contains invalid value '20'

**Status: ✅ Fixed in commit `de2d52b` (#758)**

- Current `.nvmrc` contains `22.14.0` (valid semver)

### #789 — [Architecture] Add peerDependencies for React

**Status: ✅ Already implemented**

- `packages/ui/package.json` has `react` and `react-dom` in `peerDependencies`, not `dependencies`

### #744 — fix(ci): pnpm consistency in iterate.yml

**Status: 🔴 Blocked (workflow permission)**

- Fix prepared on branch `fix/ci-pnpm-consistency-744` (commit `fbb9771`)
- Cannot push: GITHUB_TOKEN lacks `workflows` permission
- **Required action**: Use PAT or manual PR with `workflows` permission

### #728 — [Security] Add security scanning workflows to CI

**Status: 🔴 Blocked (workflow permission)**

- No `pnpm audit`, CodeQL, or SAST in CI
- Requires creating/modifying workflow files

### #726 — [DX] Add dependency consistency checking to CI

**Status: 🔴 Blocked (workflow permission)**

- `check-deps` script exists in package.json but not in CI
- Requires modifying workflow files

### #788 — [Testing] Add unit tests for critical UI components

**Status: 🟡 Partially addressed**

- Navbar test: ✅ `navbar.test.tsx` exists
- Modal test: ✅ `modal.test.tsx` exists
- ClusterList test: ❌ Missing
- StatusBadge test: ❌ Missing

### #787 — [Testing] Add unit tests for packages/db

**Status: 🟡 Partially addressed**

- 5 test files exist (soft-delete, user-deletion, logger, rls-middleware, db-instance)
- Missing: k8sClusterService, customerService, webhook idempotency tests

### #724 — [Testing] Missing e2e test coverage

**Status: 🟡 Partially addressed**

- 11 E2E test files exist including subscription-workflows, billing, webhook-error-handling
- Significantly more coverage than when issue was filed

### #725 — [Testing] Add integration tests for API routers

**Status: 🟡 Partially addressed**

- 14 API test files exist covering auth, customer, k8s, stripe, admin, rate-limiting
- Missing: rate limiting behavior tests, concurrent operation tests

### #754 — [QA] Add integration tests for Stripe webhook idempotency

**Status: 🟡 Partially addressed**

- Webhook error handling E2E test exists
- Dedicated idempotency integration test is still missing

### #755 — [Database] Add composite index

**Status: 🟢 Open (P3)**

- No migration has been created for the composite index

### #753 — [Frontend] Route-based code splitting

**Status: 🟢 Open (P2)**

- No dynamic imports implemented for dashboard routes

### #752 — [DX] Create unified CLI output utilities

**Status: 🟢 Open (P2)**

- No shared logger package exists yet

### #751 — [Performance] Optimize tRPC router bundle size

**Status: 🟢 Open (P2)**

- No code splitting for tRPC routers implemented

### #749 — [Innovation] AI-powered API endpoint testing

**Status: 🟢 Open (P2)**

- No AI doc generation implemented

### #731 — [Innovation] Auto-generate API documentation

**Status: 🟢 Open (P3) — Partially overlapping with #749**

- Could be consolidated with #749

### #729 — [Testing] Add bundle size regression testing

**Status: 🟢 Open (P3)**

- Bundle analyzer not in CI

### #727 — [Innovation] AI-Powered Code Review Automation

**Status: 🟢 Open (P3)**

- No AI review tool integrated

---

## System Health Metrics

| Metric                   | Result                                     |
| ------------------------ | ------------------------------------------ |
| Build                    | ✅ Passes                                  |
| Lint (8/8 packages)      | ✅ Zero errors, zero warnings              |
| Typecheck (8/8 packages) | ✅ Clean                                   |
| Tests (68 files)         | ✅ 1412/1412 passing                       |
| Total test files         | 68                                         |
| Open issues              | 20 (4 stale, 3 blocked, 5 partial, 8 open) |

---

## Recommendations

1. **Close stale issues**: #785, #786, #748, #789
2. **Consolidate**: #731 into #749 (overlapping scope)
3. **Prioritize blocked CI issues**: Need a PAT with `workflows` permission for #744, #728, #726
4. **Address testing gaps**: Focus on #787 (DB service tests) and #788 (ClusterList, StatusBadge)
