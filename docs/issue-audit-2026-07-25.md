# Issue Audit Report — 2026-07-25

**Evaluator:** Sisyphus (Autonomous Issue Manager)
**Token Scope:** GITHUB_TOKEN (no issue write/comment permissions)

---

## Executive Summary

20 open issues exist. **6 are code-resolved** (fixes merged to `main`) but remain open due to token permissions. **1 issue (#744) is confirmed still unresolved in code.** The remaining 13 are enhancement/feature requests requiring new implementation work.

---

## STEP 1 — Normalization Recommendations

Since the GITHUB_TOKEN lacks `issues: write` permission, labels cannot be modified. Below are the recommended labels for each issue.

| # | Title | Current Labels | Recommended Category | Recommended Priority | Code Status |
|---|-------|---------------|---------------------|---------------------|-------------|
| 789 | Add peerDependencies for React in packages/ui | enhancement | **enhancement** | **P3** | ✅ FIXED (peerDependencies exists) |
| 788 | Add unit tests for critical UI components in apps/nextjs | test | **test** | **P2** | ✅ FIXED (14 test files exist) |
| 787 | Add unit tests for packages/db migrations and schema | test | **test** | **P2** | ✅ FIXED (5 test files exist) |
| 786 | Stripe webhook logs partial secret | security | **security** | **P1** | ✅ FIXED (PR #1001 merged) |
| 785 | Fix duplicate next dependency in packages/stripe/package.json | bug | **bug** | **P1** | ✅ FIXED (package.json cleaned) |
| 755 | Add composite index for customer subscription queries | database-architect | **enhancement** | **P2** | ❌ Unresolved |
| 754 | Add integration tests for Stripe webhook idempotency | quality-assurance | **test** | **P2** | ❌ Unresolved |
| 753 | Implement route-based code splitting for dashboard pages | frontend-engineer | **enhancement** | **P2** | ❌ Unresolved |
| 752 | Create unified CLI output utilities for console formatting | DX-engineer | **enhancement** | **P3** | ❌ Unresolved |
| 751 | Optimize tRPC router bundle size with code splitting | performance-engineer | **enhancement** | **P2** | ❌ Unresolved |
| 749 | Add AI-powered API endpoint testing and documentation generator | Growth-Innovation-Strategist | **enhancement** | **P3** | ❌ Unresolved |
| 748 | .nvmrc contains invalid value '20' | DX-engineer | **bug** | **P2** | ✅ FIXED (now `22.14.0`) |
| 744 | fix(ci): pnpm consistency in iterate.yml | Growth-Innovation-Strategist | **bug** / **ci** | **P2** | ❌ **STILL BROKEN** |
| 731 | Auto-generate API documentation from tRPC routers | enhancement | **enhancement** | **P3** | ❌ Unresolved |
| 729 | Add bundle size regression testing | enhancement | **test** | **P3** | ❌ Unresolved |
| 728 | Add security scanning workflows to CI | security | **security** | **P2** | ✅ FIXED (PR #1002 merged) |
| 727 | AI-Powered Code Review Automation | enhancement | **enhancement** | **P3** | ❌ Unresolved |
| 726 | Add dependency consistency checking to CI | ci | **ci** | **P3** | ❌ Unresolved (check-deps exists but not in CI) |
| 725 | Add integration tests for API routers | test | **test** | **P2** | ✅ LARGELY FIXED (13 test files exist) |
| 724 | Missing e2e test coverage for critical flows | test | **test** | **P1** | ❌ Unresolved |

---

## STEP 2 — Duplicate Detection

| Cluster | Issues | Verdict |
|---------|--------|---------|
| AI/Innovation features | #749, #731, #727 | **Not duplicates.** Each targets different functionality (API testing, docs gen, code review). Could be tracked under a shared epic but not duplicates. |
| Testing gaps | #788, #787, #754, #725, #724, #729 | **Not duplicates.** Each covers a distinct testing layer (UI unit, DB unit, integration, API, e2e, bundle size). |
| Performance | #753, #751 | **Not duplicates.** Code splitting vs bundle size optimization are distinct concerns. |

**No true duplicates found.** All issues target distinct areas.

---

## STEP 3 — Consolidation Analysis

All issues are sufficiently distinct in scope. **No consolidation recommended.**

Issues #788 and #787 (UI + DB test gaps) could theoretically combine into a "comprehensive test coverage" epic, but they target different packages with different testing patterns. Keeping them separate enables targeted PRs.

---

## STEP 4 — Repair Mode Selection

**Selection criteria:** No P0/P1 labels exist (token cannot write labels). #786 (P1) and #785 (P1) are already fixed. Highest-impact atomic fix available: **#744 — pnpm consistency in iterate.yml**.

### #744 Verification

**File:** `.github/workflows/iterate.yml`

**Evidence of unresolved state:**
- Line 58: Cache path `~/.npm` (should be `~/.local/share/pnpm/store`)
- Line 59: Cache key uses `package-lock.json` (should be `pnpm-lock.yaml`)
- Lines 72, 342: `npm ci || true` (should be `pnpm install --frozen-lockfile || true`)

**Action taken:**
- PR #1009 created (`fix/744-update-deploy-scripts`) with updated `scripts/ci-pnpm-migration.sh`
- Direct .github/workflows modification blocked by GITHUB_TOKEN `workflows: write` restriction
- Maintainers can apply via: `bash scripts/ci-pnpm-migration.sh --apply`

---

## Appendix: Permission Limitations

The GITHUB_TOKEN (`github-actions[bot]`) cannot:
- Add/edit labels on issues
- Comment on issues
- Close issues

All issue management actions beyond git push and PR creation are blocked. This is a known platform limitation for `GITHUB_TOKEN` from `pull_request` and `push` events in forked/public repositories without explicit `issues: write` permission at the workflow level. See `.github/workflows/iterate.yml` lines 11-16 — `issues: write` is declared but the actual token issued by GitHub Actions may not honor it depending on the triggering event.
