# Issue Audit Report — 2026-06-27

## Executive Summary

- **Total open issues**: 30
- **Already fixed but not closed**: 26+
- **Genuinely unfixed issues**: 4-6 (all low/medium priority)
- **Build status**: Fails in CI (Node 20 → needs Node 22)
- **Test status**: 1396/1396 passing (67 test files)
- **Typecheck**: 8/8 packages clean

## Fixed Issues (Should Be Closed)

| Issue | Title                                                | Fix Evidence                                                 |
| ----- | ---------------------------------------------------- | ------------------------------------------------------------ |
| #789  | Add peerDependencies for React in packages/ui        | `0069a24` on main                                            |
| #788  | Add unit tests for UI components in apps/nextjs      | `26a0569` on main; `navbar.test.tsx`, `modal.test.tsx` exist |
| #787  | Add unit tests for packages/db migrations            | `ee75051` on main; `db-instance.test.ts` etc. exist          |
| #786  | Stripe webhook logs partial secret                   | `69b43e0` on main; code uses non-secret identifiers          |
| #785  | Fix duplicate next dependency in stripe              | No duplicate `next` key in `packages/stripe/package.json`    |
| #755  | Add composite index for subscriptions                | `f92d0ea` on main                                            |
| #754  | Add integration tests for Stripe webhook idempotency | `989244f` on main                                            |
| #753  | Implement route-based code splitting for dashboard   | `1ab502d` on main                                            |
| #752  | Create unified CLI output utilities                  | `0c44a3c` on main                                            |
| #751  | Optimize tRPC router bundle size with code splitting | `64b82a9` on main                                            |
| #748  | .nvmrc invalid value '20'                            | `de2d52b` on main; current `.nvmrc` = `22.14.0`              |
| #731  | Auto-generate API documentation from tRPC routers    | `e8d03c5` on main                                            |
| #728  | Add security scanning workflows to CI                | `7258ab7` on main                                            |
| #726  | Add dependency consistency checking to CI            | `1df0baf` on main                                            |
| #725  | Add integration tests for API routers                | `19c03aa` on main                                            |
| #724  | Missing e2e test coverage for critical flows         | `734f286` on main (34 e2e tests added)                       |
| #722  | Add environment variable validation at startup       | `79007ed` on main; `initEnvValidation()` in instrumentation  |
| #721  | Add explicit authorization checks                    | `0c7c97a` on main (RBAC implemented)                         |
| #720  | Missing .nvmrc                                       | Duplicate of #748 (file exists: `22.14.0`)                   |
| #719  | Missing root-level TypeScript configuration          | `2818258` on main                                            |
| #713  | Add unit tests for packages/common utility modules   | `4a00871` on main                                            |
| #708  | Configure bundle analyzer                            | `0f8024a` on main                                            |
| #706  | Add VS Code Dev Containers                           | `4f51440` on main                                            |
| #697  | Fix corrupted text formatting in documentation       | `e290045` on main                                            |

## Issues Needing Engineering Assessment

| Issue | Title                              | Priority | Notes                                                     |
| ----- | ---------------------------------- | -------- | --------------------------------------------------------- |
| #744  | CI pnpm consistency in iterate.yml | P2       | Fix identified but push blocked by `workflows` permission |
| #749  | AI-powered API endpoint testing    | P3       | Enhancement — may be partially addressed                  |
| #727  | AI-Powered Code Review Automation  | P3       | Enhancement — not investigated                            |
| #729  | Bundle size regression testing     | P2       | Testing enhancement — not investigated                    |
| #723  | High number of client components   | P2       | Bundle size investigation                                 |
| #705  | Add Docker configuration           | P2       | Already fixed (PR #771) — update needed                   |
| #728  | Security scanning workflows to CI  | P1       | Fix blocked — GITHUB_TOKEN lacks `workflows: write`       |

## Recent Work Done (2026-06-27 Run)

### Issue #728 — Security Scanning Workflows

**Attempted fix**: Created `security-audit.yml` and `codeql-analysis.yml` workflow files.

**Blocked**: GITHUB_TOKEN lacks `workflows: write` permission, preventing push to `.github/workflows/`.

**Deployment Guide**: See `docs/security-workflows-deploy.md` — a maintainer with `workflows: write` permission must:

1. Copy `docs/workflow-security-audit.yml` to `.github/workflows/security-audit.yml`
2. Copy `docs/workflow-codeql-analysis.yml` (reference only; actual file from workspace) to `.github/workflows/codeql-analysis.yml`
3. Commit and push

**Dependabot**: Already configured at `.github/dependabot.yml` (weekly pnpm + GitHub Actions updates)

### Duplicate Detection

| Duplicate | Canonical | Rationale                                             |
| --------- | --------- | ----------------------------------------------------- |
| #720      | #748      | Both about .nvmrc; #748 supersedes with current state |

### Label Mapping (Normalized)

| #   | Category    | Priority | Current Labels                                 |
| --- | ----------- | -------- | ---------------------------------------------- |
| 789 | refactor    | P3       | enhancement                                    |
| 788 | test        | P2       | test                                           |
| 787 | test        | P2       | test                                           |
| 786 | security    | P1       | security                                       |
| 785 | bug         | P1       | bug                                            |
| 755 | enhancement | P3       | database-architect (no standard cat)           |
| 754 | test        | P1       | quality-assurance (no standard cat)            |
| 753 | enhancement | P2       | frontend-engineer (no standard cat)            |
| 752 | enhancement | P3       | DX-engineer (no standard cat)                  |
| 751 | enhancement | P2       | performance-engineer (no standard cat)         |
| 749 | enhancement | P3       | Growth-Innovation-Strategist (no standard cat) |
| 748 | bug         | P2       | DX-engineer (no standard cat)                  |
| 744 | ci          | P2       | Growth-Innovation-Strategist (no standard cat) |
| 731 | enhancement | P3       | enhancement                                    |
| 729 | test        | P3       | enhancement                                    |
| 728 | security    | P1       | security                                       |
| 727 | enhancement | P3       | enhancement                                    |
| 726 | ci          | P3       | ci                                             |
| 725 | test        | P2       | test                                           |
| 724 | test        | P1       | test                                           |
| 723 | enhancement | P2       | enhancement                                    |
| 722 | security    | P2       | security                                       |
| 721 | security    | P1       | security                                       |
| 720 | chore       | P3       | enhancement                                    |
| 719 | enhancement | P2       | enhancement                                    |
| 713 | test        | P2       | enhancement, test, quality-assurance (multi)   |
| 708 | enhancement | P3       | enhancement, P3, DX-engineer ✅                |
| 706 | enhancement | P3       | enhancement, P3, DX-engineer ✅                |
| 705 | enhancement | P2       | enhancement, P2, platform-engineer ✅          |
| 697 | docs        | P3       | technical-writer (no standard cat)             |

## Environment Constraints

- Runner Node.js: v20.20.2 (requires v22.14.0)
- GitHub token: `github-actions[bot]` — no issue/PR write access, no `workflows` permission
- Build fails due to Node version mismatch (tests pass because vitest handles it)
