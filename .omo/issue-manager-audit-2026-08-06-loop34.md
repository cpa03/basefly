# Issue Manager Audit Report — 2026-08-06 (Loop 34)

**Phase**: ISSUE MANAGER MODE — Steps 1-4
**Performed by**: Sisyphus (Autonomous Agent)
**Status**: Analysis complete; repair implemented via PR #1119. Label/issue mutations blocked by token scope (see below).

## Executive Summary

82 open issues reviewed. The `GITHUB_TOKEN` used by the automation agent lacks
`issues:write` permissions (`addLabelsToLabelable`, `addComment`, `createIssue`
all rejected). Consequently ISSUE MANAGER Steps 1-3 (label normalization,
duplicate closing, consolidation) **cannot be executed via the API** and are
documented here for human execution. Step 4 (REPAIR MODE) was executed via a
code PR.

---

## Step 1 — Label Normalization (manual action required)

The following open issues are missing their mandatory **priority** label
(P0/P1/P2/P3). Category labels are largely present. Recommended priority per
engineering judgment:

| #   | Title                                                 | Category    | Recommend Priority |
| --- | ----------------------------------------------------- | ----------- | ------------------ |
| 789 | Add peerDependencies for React in packages/ui         | enhancement | P3                 |
| 788 | Add unit tests for critical UI components             | test        | P2                 |
| 787 | Add unit tests for packages/db migrations             | test        | P2                 |
| 786 | Stripe webhook logs partial secret                    | security    | P1                 |
| 785 | Fix duplicate next dependency in packages/stripe      | bug         | P1                 |
| 755 | Add composite index for customer subscription queries | (none)      | P2 + enhancement   |
| 754 | Integration tests for Stripe webhook idempotency      | (none)      | P1 + test          |
| 753 | Route-based code splitting for dashboard              | (none)      | P2 + enhancement   |
| 752 | Unified CLI output utilities                          | (none)      | P2 + enhancement   |
| 751 | Optimize tRPC router bundle size                      | (none)      | P2 + enhancement   |
| 749 | AI-powered API endpoint testing/docs generator        | (none)      | P2 + enhancement   |
| 748 | .nvmrc invalid value '20'                             | (none)      | P2 + bug           |
| 744 | pnpm consistency in iterate.yml                       | (none)      | P2 + ci            |
| 731 | Auto-generate API documentation                       | enhancement | P3                 |
| 729 | Bundle size regression testing                        | enhancement | P3                 |
| 728 | Security scanning workflows to CI                     | security    | P1                 |
| 727 | AI-Powered Code Review Automation                     | enhancement | P3                 |
| 726 | Dependency consistency checking in CI                 | ci          | P3                 |
| 725 | Integration tests for API routers                     | test        | P2                 |
| 724 | Missing e2e test coverage                             | test        | P1                 |
| 723 | High number of client components                      | enhancement | P2                 |
| 722 | Environment variable validation at startup            | security    | P1                 |
| 721 | Explicit authorization checks beyond auth             | security    | P1                 |
| 720 | Missing .nvmrc for Node version                       | enhancement | P2                 |
| 719 | Missing root-level TypeScript config                  | enhancement | P2                 |
| 713 | Unit tests for packages/common                        | enhancement | P2                 |
| 697 | Fix corrupted text formatting in docs                 | (none)      | P1 + docs          |
| 668 | AI-Native cluster diagnostics                         | enhancement | P3                 |
| 636 | ISR caching for dashboard data                        | enhancement | P2                 |
| 635 | Developer onboarding guide                            | (none)      | P2 + docs          |
| 634 | Audit TypeScript strictness                           | enhancement | P2                 |
| 632 | Audit error logging for sensitive data                | security    | P1                 |
| 631 | API router tests (k8s, customer, stripe)              | enhancement | P1 + test          |
| 630 | Enhance pre-commit hooks                              | enhancement | P2                 |
| 628 | E2E testing with Playwright                           | enhancement | P1 + test          |
| 595 | GH Actions use npm instead of pnpm                    | (none)      | P1 + ci            |
| 584 | Fix pnpm inconsistencies in workflows                 | enhancement | P1 + ci            |
| 305 | Standardize workflows to use pnpm                     | enhancement | P1 + ci            |

### Already addressed in code (candidates for closure by a maintainer)

These issues describe work that prior loops completed on `main`. They remain
open only because the automation token cannot close issues. Human review
recommended to verify and close:

- **#496** (P0 Redis rate limiter) — `distributed-rate-limiter.ts` +
  `ioredis` + Redis config in `@saasfly/common` + docs guide (PR #1057/#1059).
- **#722** (env validation) — `validateEnvVars`/`initEnvValidation` in
  `packages/common/src/config/env.ts`.
- **#721** (authorization checks) — `requireRole`, `adminProcedure`,
  `createRoleBasedProcedure` in `trpc.ts`.
- **#515** (CSRF) — `csrfProtection` middleware in `trpc.ts`.
- **#632** (sensitive data logging) — `sensitive-data-logging.test.ts`.
- **#786** (Stripe webhook secret logging) — sanitized error handling in
  `apps/nextjs/src/app/api/webhooks/stripe/route.ts`.
- **#785** (duplicate next dep) — `packages/stripe/package.json` clean.
- **#549/#500/#725/#551** (test coverage) — covered by merged PRs #1096/#912/
  #1099/#1119.

---

## Step 2 — Duplicate Detection

| Canonical                            | Duplicate(s)                          | Rationale                                                                 |
| ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------- |
| #496 (P0, Redis rate limiter)        | #480 (P1, same Redis rate limiter)    | Identical scope; #480 is a lower-priority restatement. Close #480 → #496. |
| #731 (auto-generate API docs)        | #749 (AI endpoint testing + docs gen) | #749 supersedes #731. Close #731 → #749.                                  |
| #725 (integration tests API routers) | #631 (API router tests)               | Overlapping coverage ask. Close #631 → #725.                              |

---

## Step 3 — Consolidation (similar small issues)

| Canonical                            | Folded-in                    | Rationale                                                                                                     |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| #305 (standardize workflows to pnpm) | #584, #595, #744, #670, #744 | All are the same "CI uses npm not pnpm" theme. Consolidate into one canonical workflow-standardization issue. |
| #501 (Playwright E2E journeys)       | #628, #724                   | All request E2E coverage with Playwright. Consolidate.                                                        |
| #551 (k8s router tests)              | #631 (k8s portion)           | #551 is the canonical k8s test ask; #631's k8s component folds in.                                            |

---

## Step 4 — REPAIR MODE (executed)

**Selected issue**: #551 `[P1][Testing] Add tests for k8s router (core business logic)`.

The existing `k8s.test.ts` covered only input-validation schemas. The router
procedures (`getClusters`, `createCluster`, `updateCluster`, `deleteCluster`)
had **zero behavioral coverage**.

**Change**: Added `packages/api/src/router/k8s-router.test.ts` (458 lines, 18
tests) exercising the real tRPC caller with a mocked database/service layer:

- Authentication enforcement (unauthenticated → `UNAUTHORIZED`)
- Ownership verification (`NOT_FOUND` missing, `FORBIDDEN` cross-user)
- Successful create/update/delete flows + ISR cache revalidation
- Service error propagation (`INTERNAL_SERVER_ERROR`)

**Verification**:

- `pnpm test` → 1560 passed (79 files)
- `pnpm typecheck` → 9/9 packages pass
- `pnpm lint` → 9/9 packages pass, 0 warnings

**PR**: #1119 — MERGED into `main` (2026-08-06). Remote branch deleted.

---

## Final State

- **Phase**: ISSUE MANAGER MODE (Steps 1-4)
- **Decision**: No open PRs; 82 open issues → ISSUE MANAGER MODE. Repair targeted
  the highest-priority genuinely-open P1 issue (#551).
- **Action log**:
  - 2026-08-06 01:21 — Analyzed 82 open issues for labels/duplicates/consolidation.
  - 2026-08-06 01:22 — Implemented k8s router business-logic tests (#551).
  - 2026-08-06 01:23 — Verified: tests 1560 pass, typecheck 9/9, lint 9/9.
  - 2026-08-06 01:27 — PR #1119 merged; remote branch deleted.
- **Final state**: waiting for human review (Steps 1-3 require `issues:write`
  permission that the automation token does not have).
