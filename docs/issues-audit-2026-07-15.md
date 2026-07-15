# Issue Audit Report — 2026-07-15

**Mode:** Issue Manager (ULW Loop)
**Evaluator:** Sisyphus (Autonomous Orchestrator)
**Token Limitations:** GITHUB_TOKEN lacks `issues:write` and `pull-requests:write` for label/comment operations. All changes below are documented for manual application.

---

## STEP 1 — Issue Normalization

### Label Requirements (per operating contract)
- **Category** (exactly one): `bug | enhancement | feature | docs | refactor | chore | test | ci | security`
- **Priority** (exactly one): `P0 | P1 | P2 | P3`

### Issues Needing Priority Labels

| Issue | Title | Current Category | Recommended Priority | Rationale |
|-------|-------|-----------------|---------------------|-----------|
| #789 | Add peerDependencies for React | `enhancement` | P3 | Low impact, nice-to-have |
| #788 | Add unit tests for UI components | `test` | P2 | Important but not urgent |
| #787 | Add unit tests for packages/db | `test` | P2 | Important but not urgent |
| #786 | Stripe webhook logs partial secret | `security` | P1 | Security vulnerability — **already fixed** |
| #785 | Fix duplicate next dependency | `bug` | P0 | Duplicate JSON key can break builds — **already fixed** |
| #755 | Add composite index | `enhancement` | P3 | Low priority optimization |
| #754 | Stripe webhook idempotency tests | `test` | P1 | Critical reliability — **already has tests** |
| #753 | Route code splitting for dashboard | `enhancement` | P2 | Performance improvement |
| #752 | Unified CLI output utilities | `enhancement` | P3 | Nice-to-have DX |
| #751 | tRPC router code splitting | `enhancement` | P2 | **Already fixed** (PR #896) |
| #749 | AI-powered API testing | `enhancement` | P3 | Low priority innovation |
| #748 | .nvmrc invalid value | `bug` | P2 | **Already fixed** (PR #758) |
| #744 | pnpm consistency in iterate.yml | `ci` | P1 | CI inconsistency causing build issues |
| #731 | Auto-generate API docs | `enhancement` | P3 | Low priority |
| #729 | Bundle size regression testing | `test` | P3 | Low priority |
| #728 | Security scanning workflows | `security` | P1 | Security gap in CI |
| #727 | AI-Powered Code Review | `enhancement` | P3 | Low priority |
| #726 | Dependency consistency checking | `ci` | P2 | CI improvement |
| #725 | Integration tests for API routers | `test` | P2 | Important testing gap |
| #724 | Missing e2e test coverage | `test` | P1 | Critical user flows untested |

### Issues with Non-Standard Category Labels

The following issues have specialist labels (e.g., `DX-engineer`, `frontend-engineer`) that are not part of the standard category system. These labels should be KEPT as secondary labels but the standard category should be ADDED:

| Issue | Current Label(s) | Standard Category to Add |
|-------|-----------------|-------------------------|
| #755 | `database-architect` | `enhancement` |
| #754 | `quality-assurance` | `test` |
| #753 | `frontend-engineer` | `enhancement` |
| #752 | `DX-engineer` | `enhancement` |
| #751 | `performance-engineer` | `enhancement` |
| #749 | `Growth-Innovation-Strategist` | `enhancement` |
| #748 | `DX-engineer` | `bug` |
| #744 | `Growth-Innovation-Strategist` | `ci` |
| #729 | (none standard) | `test` |

---

## STEP 2 — Duplicate Detection

### Verdict: No exact duplicates found

All 20 open issues address distinct topics. No two issues have identical scope or proposed solutions.

### Near-overlap Analysis

**#731 (Auto-generate API docs) vs #749 (AI-powered API testing & docs):**
- #731 focuses specifically on auto-generating API documentation from tRPC schemas using OpenAPI adapters
- #749 proposes a broader AI-powered system that generates both tests AND documentation
- **Recommendation:** #731 is a subset of #749's scope. Consolidate #731 into #749.

**#753 (Frontend route code splitting) vs #751 (tRPC code splitting):**
- Both address code splitting but at different layers (UI vs API)
- #751 is **already fixed** (PR #896)
- **Recommendation:** Keep #753 as-is; #751 should be closed as resolved

---

## STEP 3 — Consolidation Opportunities

### Testing Meta-Issue
Issues #724 (E2E tests), #725 (API integration tests), #787 (DB tests), #788 (UI tests), and #754 (Stripe idempotency) are all about improving test coverage in different areas. They are sufficiently distinct in scope to warrant separate issues but could benefit from cross-referencing.

### CI Pipeline Modernization
Issues #726 (dependency consistency CI), #728 (security scanning CI), and #744 (pnpm consistency) all touch CI workflows. They are distinct but could be grouped as a "CI Modernization" epic.

---

## STEP 4 — Issues Verified as Already Fixed (Should Be Closed)

| Issue | Title | Fix Evidence | 
|-------|-------|-------------|
| #785 | Duplicate next dependency | `packages/stripe/package.json` has no `next` in dependencies — never existed in git history |
| #786 | Stripe webhook logs partial secret | Fixed in commit `69b43e0`, merged via PR #796 |
| #748 | .nvmrc invalid value | Fixed in commit `de2d52b`, merged via PR #758 — `.nvmrc` now contains `22.14.0` |
| #789 | peerDependencies for React | Already implemented — `packages/ui/package.json` uses `peerDependencies` for React |
| #751 | tRPC router code splitting | Fixed via PR #896 (merged 2026-06-26) |
| #754 | Stripe webhook idempotency tests | Comprehensive test file already exists at `packages/stripe/src/webhook-idempotency.test.ts` |

---

## Summary

| Metric | Count |
|--------|-------|
| Total open issues | 20 |
| Already fixed (should close) | 6 |
| Need priority labels | 20 |
| Need category normalization | 7 |
| Exact duplicates | 0 |
| Near-overlap (consolidate) | 1 pair (#731 → #749) |
| Highest priority actionable | #744 (P1 - CI pnpm migration) |

## Label Application Commands (for manual execution)

```bash
# Priority labels
gh issue edit 789 --add-label "P3"
gh issue edit 788 --add-label "P2"
gh issue edit 787 --add-label "P2"
gh issue edit 786 --add-label "P1"
gh issue edit 785 --add-label "P0"
gh issue edit 755 --add-label "P3"
gh issue edit 754 --add-label "P1"
gh issue edit 753 --add-label "P2"
gh issue edit 752 --add-label "P3"
gh issue edit 751 --add-label "P2"
gh issue edit 749 --add-label "P3"
gh issue edit 748 --add-label "P2"
gh issue edit 744 --add-label "P1"
gh issue edit 731 --add-label "P3"
gh issue edit 729 --add-label "P3"
gh issue edit 728 --add-label "P1"
gh issue edit 727 --add-label "P3"
gh issue edit 726 --add-label "P2"
gh issue edit 725 --add-label "P2"
gh issue edit 724 --add-label "P1"

# Close resolved issues
gh issue close 785 --comment "Already fixed - packages/stripe/package.json has no duplicate next dependency"
gh issue close 786 --comment "Already fixed in commit 69b43e0 (PR #796)"
gh issue close 748 --comment "Already fixed in commit de2d52b (PR #758) - .nvmrc now contains 22.14.0"
gh issue close 789 --comment "Already implemented - packages/ui uses peerDependencies for React"
gh issue close 751 --comment "Already fixed in PR #896 - tRPC lazy router loading implemented"
gh issue close 754 --comment "Tests already exist at packages/stripe/src/webhook-idempotency.test.ts"
```
