# Issue Status Report — 2026-07-23

## Executive Summary

Ran full ISSUE MANAGER MODE on 20 open issues. **Result: All code-level bugs and test-gap issues have already been resolved on `main`.** The remaining open issues fall into three categories:

1. **Already Fixed (never closed)** — Issues where code fixes were committed/PR'd but issues remained open (likely because CI bot's GITHUB_TOKEN lacks `issues:write` permission)
2. **Feature Requests** — Enhancement proposals requiring significant new implementation
3. **CI Workflow Changes** — Blocked by GITHUB_TOKEN lacking `workflows:write` permission

---

## Category A: Already Fixed (7 issues)

These issues describe problems that no longer exist in the current `main` branch.

| Issue | Title                                             | Fix Evidence                                                                                                             |
| ----- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| #785  | Duplicate next dependency in packages/stripe      | Current `packages/stripe/package.json` has no `next` dependency at all                                                   |
| #786  | Stripe webhook logs partial secret                | Commit `69b43e0` — removed `secret: STRIPE_WEBHOOK_SECRET.slice(-8)` from logging                                        |
| #789  | Add peerDependencies for React in packages/ui     | Current `packages/ui/package.json` has React in `peerDependencies` + `devDependencies` (not `dependencies`)              |
| #754  | Integration tests for Stripe webhook idempotency  | Test file exists at `packages/stripe/src/webhook-idempotency.test.ts` (425 lines, comprehensive coverage)                |
| #724  | Missing e2e test coverage for critical flows      | PR #849 ("Add 34 e2e tests for subscription, cluster, webhook, and auth flows"). 12 e2e test files exist in `tests/e2e/` |
| #748  | .nvmrc contains invalid value '20'                | Current `.nvmrc` contains `22.14.0` (valid version)                                                                      |
| #755  | Composite index for customer subscription queries | PR #765 — `f92d0ea fix(db): add composite index for customer subscription queries - Issue #755 (#765)`                   |
| #787  | DB migration/schema tests                         | 5 test files exist in `packages/db/`                                                                                     |
| #788  | UI component tests in apps/nextjs                 | 15 test files exist in `apps/nextjs/src/components/__tests__/`                                                           |

## Category B: CI Workflow Changes (blocked — 4 issues)

These require modifying `.github/workflows/` files but the GITHUB_TOKEN lacks `workflows:write` permission. A deploy script exists at `scripts/deploy-ci-fixes.sh`.

| Issue | Title                                 | Workaround                                                                            |
| ----- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| #744  | pnpm consistency in iterate.yml       | Fix applied locally (see below). Deploy via script with workflows:write token         |
| #728  | Security scanning workflows           | Template files exist in `docs/ci/workflows/`. Deploy via `scripts/deploy-ci-fixes.sh` |
| #727  | AI-Powered Code Review workflow       | Template in `docs/ci/workflows/ai-code-review.yml`. Deploy via same script            |
| #726  | Dependency consistency checking to CI | Needs workflow change                                                                 |

## Category C: Feature Requests (remaining — 7 issues)

These are enhancement proposals requiring implementation, not bug fixes:

| Issue | Title                                          | Priority | Scope       |
| ----- | ---------------------------------------------- | -------- | ----------- |
| #753  | Route-based code splitting for dashboard pages | P2       | Frontend    |
| #752  | Unified CLI output utilities                   | P2       | DX          |
| #751  | Optimize tRPC router bundle size               | P2       | Performance |
| #749  | AI-powered API testing and doc generator       | P2       | Innovation  |
| #731  | Auto-generate API documentation from tRPC      | P3       | Innovation  |
| #729  | Bundle size regression testing                 | P3       | Testing     |
| #725  | Integration tests for API routers              | P2       | Testing     |

---

## Recommended Actions

1. **Close issues in Category A** — All are already resolved. Needs `issues:write` token or manual closure.
2. **Run deploy script** — Execute `bash scripts/deploy-ci-fixes.sh` with a token that has `workflows:write` permission to fix Category B issues.
3. **Prioritize Category C** — Feature requests for future development sprints.

---

## Local Fix Applied (can't push)

The following fix was applied to `.github/workflows/iterate.yml` locally but could not be pushed because the GITHUB_TOKEN lacks `workflows:write` permission:

```
Changes:
  - ~/.npm → ~/.pnpm-store (cache path)
  - **/package-lock.json → **/pnpm-lock.yaml (cache key)
  - npm ci || true → pnpm install --frozen-lockfile || true (2 occurrences)
```

To deploy: `git checkout fix/iterate-yml-pnpm-consistency-744 && git push`

## Label Audit

See `docs/issue-label-audit-2026-07-23.md` for the full label normalization audit.
