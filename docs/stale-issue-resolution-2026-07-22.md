# Stale Issue Resolution Report — 2026-07-22

## Summary

Automated audit of all open GitHub issues to identify stale/resolved items and label normalization needs.

**Total open issues**: ~50
**Issues confirmed resolved but not closed**: 12+
**Issues missing priority labels**: 30+
**Issues missing category labels**: 15+

## Permissions Note

Due to GITHUB_TOKEN limitations (`issues: write` not granted), issues could not be closed or labeled directly. This report documents findings for manual action.

---

## Resolved Issues (Stale — Fix Confirmed in Code)

| Issue | Title                                          | Fix Evidence                                                                                              |
| ----- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| #786  | Stripe webhook logs partial secret             | Commit `69b43e0` — removed `STRIPE_WEBHOOK_SECRET.slice(-8)` from logs                                    |
| #785  | Duplicate `next` dependency in packages/stripe | Current `packages/stripe/package.json` has no duplicate entries; `next` removed entirely                  |
| #722  | Environment variable validation at startup     | Commit `5adec30` — `validateEnvironment()` added to `packages/common/src/config/env.ts`                   |
| #788  | Unit tests for UI components in apps/nextjs    | Commit `fa6ef04` — ClusterList component tests added; other component tests exist                         |
| #666  | Global error boundary for Next.js              | Commit `1c75196` — root `error.tsx` added                                                                 |
| #688  | Next.js edge middleware for security           | Commits `db1070a`/`880281e` — middleware with security headers implemented                                |
| #723  | Reduce unnecessary 'use client' directives     | Commit `cf06794` — client component count reduced                                                         |
| #683  | ESLint/Prettier monorepo configuration         | Commit `7c5def7` — eslint-disable comments consolidated                                                   |
| #789  | peerDependencies for React in packages/ui      | Current `packages/ui/package.json` has React in both `peerDependencies` and `devDependencies`             |
| #748  | Invalid .nvmrc value                           | Current `.nvmrc` contains `22.14.0` (valid)                                                               |
| #631  | API router tests for k8s/customer/stripe       | Test files exist: `k8s.test.ts` (519 lines), `customer.test.ts` (305 lines), `stripe.test.ts` (187 lines) |
| #664  | Replace console._ with pino in packages/_      | All remaining `console.*` references are in JSDoc comments only; actual code uses pino                    |

## Issues Requiring Label Normalization

### Missing Priority Labels (P0-P3)

Issues that have a category label but no priority label:

| Issue | Category      | Recommended Priority |
| ----- | ------------- | -------------------- |
| #789  | enhancement   | P3                   |
| #788  | test          | P2                   |
| #787  | test          | P2                   |
| #786  | security      | P1                   |
| #785  | bug           | P2                   |
| #731  | enhancement   | P3                   |
| #729  | enhancement   | P3                   |
| #728  | security      | P1                   |
| #727  | enhancement   | P3                   |
| #726  | ci            | P2                   |
| #725  | test          | P2                   |
| #724  | test          | P2                   |
| #723  | enhancement   | P2                   |
| #722  | security      | P1                   |
| #721  | security      | P1                   |
| #720  | enhancement   | P3                   |
| #719  | enhancement   | P2                   |
| #713  | test          | P2                   |
| #668  | enhancement   | P3                   |
| #636  | enhancement   | P3                   |
| #635  | documentation | P3                   |
| #634  | enhancement   | P2                   |
| #632  | security      | P1                   |
| #631  | enhancement   | P2                   |
| #630  | enhancement   | P2                   |
| #628  | enhancement   | P2                   |

### Missing Category + Priority Labels

Issues with only role/domain labels, missing both category and priority:

| Issue | Current Labels               | Recommended Category | Recommended Priority |
| ----- | ---------------------------- | -------------------- | -------------------- |
| #755  | database-architect           | enhancement          | P2                   |
| #754  | quality-assurance            | test                 | P2                   |
| #753  | frontend-engineer            | enhancement          | P2                   |
| #752  | DX-engineer                  | enhancement          | P3                   |
| #751  | performance-engineer         | enhancement          | P2                   |
| #749  | Growth-Innovation-Strategist | enhancement          | P3                   |
| #748  | DX-engineer                  | bug                  | P2                   |
| #744  | Growth-Innovation-Strategist | ci                   | P2                   |
| #697  | technical-writer             | docs                 | P3                   |
| #670  | DX-engineer, P3              | ci                   | P3 (already set)     |

---

## PR #996 Processing Summary

- **Title**: [Security] Add security scanning workflows to CI
- **Result**: Closed — blocked by missing `workflows` permission on GITHUB_TOKEN
- **Branch**: `fix/security-scanning-ci-v2`
- **Action taken**:
  - Rebased on latest `main` (no conflicts)
  - Updated `docs/security-improvement-ci-audit.md` to reflect pending deployment status
  - Ran full verification: typecheck (8/8) ✅, lint (9/9) ✅, tests (1432/1432) ✅
  - Workflow files (`security-audit.yml`, `codeql-analysis.yml`) created locally but could not be pushed
  - Commented on PR with full details and closed

## Remaining Action Items

1. **Someone with `workflows` permission** needs to add `.github/workflows/security-audit.yml` and `.github/workflows/codeql-analysis.yml` (content documented in PR #996 description)
2. **Someone with `issues: write` permission** needs to:
   - Close the 12+ confirmed-resolved issues listed above
   - Add priority labels per recommendations
   - Add category labels to issues missing them
3. **Build fix**: The pre-existing build failure (`webidl.util.markAsUncloneable`) requires Node.js >=22 (project uses v20 in this environment)

## Disposition

| Phase                               | Status                                                  |
| ----------------------------------- | ------------------------------------------------------- |
| PR Handler Mode                     | ✅ Complete (1 PR processed, closed)                    |
| Issue Manager — Normalization       | ⚠️ Blocked (no `issues: write` permission)              |
| Issue Manager — Duplicate Detection | ⚠️ Blocked                                              |
| Issue Manager — Consolidation       | ⚠️ Blocked                                              |
| Issue Manager — Repair Mode         | ⚠️ Blocked (workflow files need `workflows` permission) |

---

_Audit performed by Sisyphus orchestration agent_
_Last updated: 2026-07-22_
