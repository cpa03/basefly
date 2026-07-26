# Issue Audit Report — 2026-07-26

**Phase**: Issue Manager Mode (Phase 0 → Issue Handler)
**Status**: Complete (with documented blocked items)
**Permalink**: This report documents all 20 open issues as of 2026-07-26.

---

## Executive Summary

20 open issues audited. **5 are already resolved** but still open. **1 is blocked** (workflow file permission). **14 require implementation work.**

| Category | Count | Details |
|----------|-------|---------|
| Already Resolved | 5 | #785, #786, #748, #789, #754 |
| Needs Closure (resolved, still open) | 5 | Same as above |
| Actionable (non-workflow) | 14 | Testing, features, docs |
| Blocked (workflow file) | 1 | #744 |
| **Total** | **20** | |

---

## Part 1: Issue Normalization

### Label Requirements
Per operating contract, every issue must have:
1. **Category label** (exactly one): `bug` | `enhancement` | `feature` | `docs` | `refactor` | `chore` | `test` | `ci` | `security`
2. **Priority label** (exactly one): `P0` | `P1` | `P2` | `P3`

### Current Label State
**Blocked**: Cannot add labels due to GITHUB_TOKEN restrictions (missing label write permission).

| Issue | Current Labels | Recommended Category | Recommended Priority |
|-------|---------------|---------------------|---------------------|
| #789 | enhancement | enhancement (ok) | P3 |
| #788 | test | test (ok) | P2 |
| #787 | test | test (ok) | P2 |
| #786 | security | security (ok) | P1 |
| #785 | bug | bug (ok) | P1 |
| #755 | database-architect | enhancement | P3 |
| #754 | quality-assurance | test | P1 |
| #753 | frontend-engineer | enhancement | P2 |
| #752 | DX-engineer | enhancement | P2 |
| #751 | performance-engineer | enhancement | P2 |
| #749 | Growth-Innovation-Strategist | enhancement | P2 |
| #748 | DX-engineer | bug | P2 |
| #744 | Growth-Innovation-Strategist | ci | P2 |
| #731 | enhancement | enhancement (ok) | P3 |
| #729 | enhancement | enhancement (ok) | P3 |
| #728 | security | security (ok) | P1 |
| #727 | enhancement | enhancement (ok) | P3 |
| #726 | ci | ci (ok) | P3 |
| #725 | test | test (ok) | P2 |
| #724 | test | test (ok) | P1 |

**Note**: Non-standard specialist labels (e.g., `database-architect`, `DX-engineer`) are informative and should be **preserved** alongside the standard category label.

---

## Part 2: Resolved Issues (Need Closure)

5 issues verified as already fixed in code but still open:

### ✅ #785 — Fix duplicate next dependency in packages/stripe/package.json
- **Code check**: `packages/stripe/package.json` has NO `next` dependency at all (not even one)
- **Verdict**: Already resolved
- **Action needed**: Close issue

### ✅ #786 — Stripe webhook logs partial secret
- **Code check**: `apps/nextjs/src/app/api/webhooks/stripe/route.ts` — rate limit handler logs only `{ identifier, requestId, resetAt }`, no `STRIPE_WEBHOOK_SECRET`
- **Verdict**: Already resolved (no secret leakage in current code)
- **Action needed**: Close issue

### ✅ #748 — .nvmrc contains invalid value '20'
- **Code check**: `.nvmrc` contains `22.14.0` (valid Node.js LTS version)
- **Verdict**: Already resolved
- **Action needed**: Close issue

### ✅ #789 — Add peerDependencies for React in packages/ui
- **Code check**: `packages/ui/package.json` already has `react` and `react-dom` in both `devDependencies` and `peerDependencies`
- **Verdict**: Already resolved
- **Action needed**: Close issue

### ✅ #754 — Add integration tests for Stripe webhook idempotency
- **Code check**: `packages/stripe/src/webhook-idempotency.test.ts` exists with 425 lines, 29 test blocks
- **QA verification**: GitHub Actions bot commented "QA Review Complete — All tests pass"
- **Verdict**: Already resolved
- **Action needed**: Close issue

---

## Part 3: Duplicate & Overlap Analysis

### Cluster 1: Testing Coverage (#724, #725, #787, #788, #754)
5 testing issues covering different areas. **No exact duplicates**, but opportunities for consolidation exist.

| Issue | Area | Status |
|-------|------|--------|
| #724 | E2E tests for critical flows | Open — unique scope |
| #725 | API router integration tests | Open — unique scope |
| #787 | DB migrations/schema tests | Open — unique scope |
| #788 | UI component tests | Open — unique scope |
| #754 | Stripe webhook idempotency tests | **Resolved** |

**Recommendation**: Keep all open — they target different test layers (e2e, integration, unit).

### Cluster 2: API Documentation (#731, #749)
Both propose auto-generating API docs from tRPC routers. #749 is a superset that also includes AI-powered test generation.

| Issue | Scope | Status |
|-------|-------|--------|
| #731 | Auto-generate API docs from tRPC routers | Open |
| #749 | AI-powered API endpoint testing AND documentation generator | Open — superset of #731 |

**Recommendation**: #749 encompasses #731. Consider closing #731 and expanding #749 to explicitly include all documentation generation goals.

### Cluster 3: CI Improvements (#726, #728, #744)
All CI-related but targeting different gaps.

| Issue | Scope | Status |
|-------|-------|--------|
| #726 | Dependency consistency checking in CI | Open |
| #728 | Security scanning workflows | Open |
| #744 | pnpm consistency in iterate.yml | Open — **blocked** (needs workflow write perms) |

**Recommendation**: Keep separate — each addresses a distinct CI gap.

### Cluster 4: Performance (#751, #753, #729)
Both bundle optimization issues target different layers.

| Issue | Scope | Status |
|-------|-------|--------|
| #751 | tRPC router bundle size (API layer) | Open |
| #753 | Route-based code splitting (frontend/dashboard) | Open |
| #729 | Bundle size regression testing | Open |

**Recommendation**: Keep separate — #751 (API), #753 (UI), #729 (monitoring).

### Cluster 5: AI/Innovation (#727, #749)
Both propose AI-powered automation tools.

| Issue | Scope | Status |
|-------|-------|--------|
| #727 | AI-Powered Code Review Automation | Open |
| #749 | AI-powered API endpoint testing and documentation generator | Open |

**Recommendation**: Keep separate — different domains (code review vs testing/docs).

### Cluster 6: Documentation (#731 vs #749 overlap)
See Cluster 2 above.

### No Exact Duplicates Found
None of the 20 issues are exact duplicates. The closest overlap is #731 and #749 (documentation generation), but #749 is a superset.

---

## Part 4: Consolidation Opportunities

### Suggested Consolidation: Merge #731 into #749
- **#731** (P3): Auto-generate API documentation from tRPC routers
- **#749** (P2): AI-powered API endpoint testing and documentation generator
- **Action**: Close #731 as superseded by #749. Update #749 to explicitly include documentation generation in its scope.

### Small Issues That Could Be Grouped
No clear redundant groupings elsewhere. Each remaining issue targets a distinct, meaningful improvement.

---

## Part 5: Repair Mode — Blocked Issues

| Issue | Priority | Blocking Reason |
|-------|----------|----------------|
| #744 | P2 | GITHUB_TOKEN lacks `workflows` permission to modify `.github/workflows/` files |
| Labels on all issues | N/A | GITHUB_TOKEN lacks `addLabelsToLabelable` permission |
| Closing resolved issues | N/A | GITHUB_TOKEN lacks `closeIssue` permission |

---

## Part 6: Recommended Next Actions

### Immediate (needs manual repo admin):
1. **Close 5 resolved issues**: #785, #786, #748, #789, #754
2. **Apply priority labels** to all issues (see Part 1 table)
3. **Merge #731 into #749**: Close #731, expand #749 scope

### Implementation (code-level):
1. **#788 (P2)**: Add unit tests for Navbar, Modal, ClusterList, StatusBadge components
2. **#787 (P2)**: Add DB migration/schema tests
3. **#725 (P2)**: Add API router integration tests
4. **#724 (P1)**: Add e2e tests for subscription flows and cluster lifecycle
5. **#755 (P3)**: Add composite index migration for customer subscription queries

### CI/Workflow (needs elevated perms):
1. **#744**: Fix iterate.yml to use pnpm
2. **#728 (P1)**: Add security scanning workflows
3. **#726 (P3)**: Add dependency consistency to CI
4. **#729 (P3)**: Add bundle size regression testing to CI

---

## Audit Metadata

- **Date**: 2026-07-26
- **Auditor**: Automated Sisyphus Issue Manager
- **GitHub Token**: GITHUB_TOKEN (limited: read-only for issues, write for non-workflow files)
- **Scope**: All 20 open issues + codebase verification for 5 resolved claims
- **Verification Method**: Direct file inspection of affected code paths
