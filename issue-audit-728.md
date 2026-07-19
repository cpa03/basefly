# Issue Normalization & Audit Report

**Date**: 2026-07-19
**Author**: Sisyphus (Auto-maintainer)
**Phase**: ISSUE MANAGER MODE — Complete

---

## Step 1: Label Normalization

### Priority Labels Required
All 20 open issues were missing priority labels. Assigned as follows:

| Issue | Title | Category | Priority | Rationale |
|-------|-------|----------|----------|-----------|
| #789 | Add peerDependencies for React in packages/ui | enhancement | **P3** | Low effort, low impact |
| #788 | Add unit tests for critical UI components | test | **P2** | Medium priority - improves test coverage |
| #787 | Add unit tests for packages/db migrations | test | **P2** | Medium priority - improves DB reliability |
| #786 | Stripe webhook logs partial secret | security | **P1** | ✅ RESOLVED - Security vuln, but already fixed |
| #785 | Fix duplicate next dependency in packages/stripe | bug | **P1** | ✅ RESOLVED - Bug, already fixed |
| #755 | Add composite index for customer subscriptions | enhancement | **P3** | Low priority optimization |
| #754 | Add integration tests for Stripe webhook idempotency | test | **P1** | High - security/reliability impact |
| #753 | Implement route-based code splitting for dashboard | enhancement | **P2** | Medium - performance improvement |
| #752 | Create unified CLI output utilities | enhancement | **P2** | Medium - DX improvement |
| #751 | Optimize tRPC router bundle size | enhancement | **P2** | Medium - performance improvement |
| #749 | AI-powered API endpoint testing generator | enhancement | **P2** | Medium - innovation feature |
| #748 | .nvmrc contains invalid value '20' | bug | **P2** | ✅ RESOLVED - Already fixed (contains 22.14.0) |
| #744 | fix(ci): pnpm consistency in iterate.yml | ci | **P2** | Still open - uses `npm ci` instead of `pnpm install` |
| #731 | Auto-generate API documentation from tRPC | enhancement | **P3** | Low priority enhancement |
| #729 | Add bundle size regression testing | enhancement | **P3** | Low priority - nice to have |
| #728 | Add security scanning workflows to CI | security | **P1** | Still open - implementation in progress |
| #727 | AI-Powered Code Review Automation | enhancement | **P3** | Low priority - innovation |
| #726 | Add dependency consistency checking to CI | ci | **P3** | Low priority - `check-deps` exists but not in CI |
| #725 | Add integration tests for API routers | test | **P2** | Medium priority |
| #724 | Missing e2e test coverage for critical flows | test | **P1** | High - risk of regression |

### Non-Standard Category Labels (8 issues)
These had non-standard labels that should be replaced:
- #755: `database-architect` → `enhancement`
- #754: `quality-assurance` → `test`
- #753: `frontend-engineer` → `enhancement`
- #752: `DX-engineer` → `enhancement`
- #751: `performance-engineer` → `enhancement`
- #749: `Growth-Innovation-Strategist` → `enhancement`
- #748: `DX-engineer` → `bug`
- #744: `Growth-Innovation-Strategist` → `ci`

> **Note**: Label edits blocked by GITHUB_TOKEN scope. Requires `issues: write` permission.

---

## Step 2: Duplicate Detection

| Issue A | Issue B | Verdict | Rationale |
|---------|---------|---------|-----------|
| #749 AI-powered API testing | #731 Auto-generate API docs | **Similar but distinct** | #749 is broader (AI + testing + docs), #731 focuses on schema-based docs generation |
| #751 tRPC code splitting | #753 Frontend code splitting | **Not duplicates** | Different layers (API vs frontend) |
| #788 UI tests | #787 DB tests | **Not duplicates** | Different test targets |
| #754 Webhook tests | #725 API integration tests | **Not duplicates** | Different focus areas |

**No exact duplicates found.**

---

## Step 3: Stale/Resolved Issues (Should be closed)

| Issue | Status | Evidence |
|-------|--------|----------|
| #786 | ✅ **Already fixed** | No `STRIPE_WEBHOOK_SECRET.slice()` found in webhook handler. Rate limit logs use `identifier` and `requestId` only. |
| #785 | ✅ **Already fixed** | `packages/stripe/package.json` has no duplicate `next` entry. Dependencies section doesn't include `next` at all. |
| #789 | ✅ **Already fixed** | `packages/ui/package.json` has React in `peerDependencies` (^19.0.0), not `dependencies`. |
| #748 | ✅ **Already fixed** | `.nvmrc` contains `22.14.0` (valid version), not `20`. |

**Recommendation**: Close issues #785, #786, #789, #748 as completed.

---

## Step 4: Repair Mode — Selected Issue #728

### Status: Implementation Blocked by Token Scope

The implementation for #728 (Add security scanning workflows to CI) was prepared but cannot be pushed because the GITHUB_TOKEN in the on-pull.yml workflow lacks `workflows: write` permission. This is a GitHub security restriction that prevents workflow file modifications via the Actions token.

### What Was Done
1. **Created `.github/workflows/security-audit.yml`** — New security scanning workflow with:
   - `dependency-audit` job: `pnpm audit --audit-level=moderate` on schedule + push to main
   - `codeql` job: CodeQL analysis on JavaScript/TypeScript with security-and-quality queries
   - Manual trigger via `workflow_dispatch`

2. **Modified `.github/workflows/on-pull.yml`** — Added:
   - `pnpm install --frozen-lockfile` dependency installation
   - `pnpm security:audit` vulnerability audit (continue-on-error: true)
   - `pnpm check-deps` dependency consistency check (continue-on-error: true)

3. **Patch file created** at `docs/patches/add-security-scanning-728.patch`

### How to Apply
```bash
# Apply the patch (requires workflows: write permission)
git am docs/patches/add-security-scanning-728.patch

# Or add `workflows: write` to on-pull.yml permissions block:
permissions:
  contents: write
  pull-requests: write
  workflows: write    # <-- add this
  ...
```

### Remaining Work
- [ ] Add `workflows: write` to on-pull.yml permissions block
- [ ] Push the branch and create PR
- [ ] Verify workflows trigger correctly
- [ ] Apply same fix to #744 (pnpm consistency in iterate.yml)

---

## Final State

| State | Value |
|-------|-------|
| Active phase | ISSUE MANAGER MODE (Repair sub-phase) |
| Decision | Label analysis + duplicate detection + stale detection completed |
| Status | **Blocked** — GITHUB_TOKEN lacks `workflows: write` permission |
| Total issues | 20 open |
| Stale (should close) | 4 (#785, #786, #789, #748) |
| Needs priority labels | 20 (all) |
| Needs category fix | 8 |
| Blocked reason | Cannot push workflow files or modify labels with current token scope |
