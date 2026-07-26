# Issue Normalization & Action Plan — 2026-07-26

## Status

- **GITHUB_TOKEN**: Read-only (cannot add labels, close issues, create PRs, or modify workflow files)
- **Actionable via this doc**: All findings documented for manual execution

---

## A. Label Normalization (Requires Write Token)

Every issue must have exactly one **category label** and exactly one **priority label**.

### Standard Labels Available

- **Category**: `bug`, `enhancement`, `feature`, `docs`, `refactor`, `chore`, `test`, `ci`, `security`
- **Priority**: `P0`, `P1`, `P2`, `P3`

### Issues Needing Category Labels

| Issue | Current Labels               | Missing Category      | Recommended       |
| ----- | ---------------------------- | --------------------- | ----------------- |
| #755  | database-architect           | ✅ enhancement needed | Add `enhancement` |
| #754  | quality-assurance            | ✅ test needed        | Add `test`        |
| #753  | frontend-engineer            | ✅ category           | Add `enhancement` |
| #752  | DX-engineer                  | ✅ category           | Add `enhancement` |
| #751  | performance-engineer         | ✅ category           | Add `enhancement` |
| #749  | Growth-Innovation-Strategist | ✅ category           | Add `enhancement` |
| #748  | DX-engineer                  | ✅ category           | Add `bug`         |
| #744  | Growth-Innovation-Strategist | ✅ category           | Add `ci`          |
| #697  | technical-writer             | ✅ category           | Add `docs`        |
| #670  | P3, DX-engineer              | ✅ category           | Add `ci`          |

### Issues Needing Priority Labels

| Issue | Current Labels                       | Missing Priority | Recommended      |
| ----- | ------------------------------------ | ---------------- | ---------------- |
| #789  | enhancement                          | ✅ Priority      | P3               |
| #788  | test                                 | ✅ Priority      | P2               |
| #787  | test                                 | ✅ Priority      | P2               |
| #786  | security                             | ✅ Priority      | P0               |
| #785  | bug                                  | ✅ Priority      | P1               |
| #755  | database-architect                   | ✅ Priority      | P2               |
| #754  | quality-assurance                    | ✅ Priority      | P1               |
| #753  | frontend-engineer                    | ✅ Priority      | P2               |
| #752  | DX-engineer                          | ✅ Priority      | P3               |
| #751  | performance-engineer                 | ✅ Priority      | P2               |
| #749  | Growth-Innovation-Strategist         | ✅ Priority      | P3               |
| #748  | DX-engineer                          | ✅ Priority      | P2               |
| #744  | Growth-Innovation-Strategist         | ✅ Priority      | P2               |
| #731  | enhancement                          | ✅ Priority      | P3               |
| #729  | enhancement                          | ✅ Priority      | P3               |
| #728  | security                             | ✅ Priority      | P1               |
| #727  | enhancement                          | ✅ Priority      | P3               |
| #726  | ci                                   | ✅ Priority      | P3               |
| #725  | test                                 | ✅ Priority      | P2               |
| #724  | test                                 | ✅ Priority      | P1               |
| #723  | enhancement                          | ✅ Priority      | P2               |
| #722  | security                             | ✅ Priority      | P1               |
| #721  | security                             | ✅ Priority      | P1               |
| #720  | enhancement                          | ✅ Priority      | P2               |
| #719  | enhancement                          | ✅ Priority      | P2               |
| #713  | enhancement, test, quality-assurance | ✅ Priority      | P2               |
| #697  | technical-writer                     | ✅ Priority      | P2               |
| #668  | enhancement                          | ✅ Priority      | P2               |
| #636  | enhancement                          | ✅ Priority      | P2               |
| #635  | documentation                        | ✅ Priority      | P2               |
| #634  | enhancement                          | ✅ Priority      | P2               |
| #632  | security                             | ✅ Priority      | P1               |
| #631  | enhancement                          | ✅ Priority      | P2               |
| #630  | enhancement                          | ✅ Priority      | P2               |
| #628  | enhancement                          | ✅ Priority      | P2               |
| #613  | enhancement, P2                      | ✅ Priority      | P2 (already has) |

---

## B. Stale Issues (Code Already Fixed — Ready to Close)

These issues describe problems already resolved in the codebase.

| Issue | Title                                          | Fix Evidence                                                                                                                                       | Action |
| ----- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| #786  | Stripe webhook logs partial secret             | Commit `69b43e0` removed `secret: STRIPE_WEBHOOK_SECRET.slice(-8)` from rate limiter. Current code logs only `{ identifier, requestId, resetAt }`. | Close  |
| #785  | Fix duplicate next dependency in stripe        | `packages/stripe/package.json` has no `next` dependency.                                                                                           | Close  |
| #748  | .nvmrc contains invalid value                  | `.nvmrc` exists with valid `22.14.0`.                                                                                                              | Close  |
| #720  | Missing .nvmrc for Node.js version consistency | `.nvmrc` exists with `22.14.0`.                                                                                                                    | Close  |
| #724  | Missing e2e test coverage                      | 12 e2e test files exist in `tests/e2e/`.                                                                                                           | Close  |
| #628  | Implement E2E testing with Playwright          | Superseded by #724 fix. 12 e2e tests exist.                                                                                                        | Close  |
| #725  | Add integration tests for API routers          | 8 test files in `packages/api/src/router/*.test.ts`.                                                                                               | Close  |
| #631  | Add API router tests for k8s, customer, stripe | Superseded by #725 fix. Tests exist.                                                                                                               | Close  |
| #713  | Add unit tests for packages/common             | 25 test files exist in `packages/common/src/`.                                                                                                     | Close  |
| #730  | Duplicate React import issues                  | Already fixed (mentioned in audit report as resolved)                                                                                              | Close  |

---

## C. Duplicate Issues (Merge Candidates)

| Primary (Older) | Duplicate (Newer) | Topic                              |
| --------------- | ----------------- | ---------------------------------- |
| #670            | #744              | Fix iterate.yml pnpm inconsistency |
| #631            | #725              | API router tests                   |
| #731            | #749              | AI-generated API docs/testing      |
| #628            | #724              | E2E testing                        |

**Action**: Close duplicates, ensure primary issue has all relevant context from duplicate.

---

## D. P0/P1 Actionable Issues (Priority Order)

### P0 — Critical

None currently actionable (the only P0 candidate #786 is stale/fixed).

### P1 — High (Most Impactful First)

| Rank | Issue     | Description                                          | Effort  | Impact               |
| ---- | --------- | ---------------------------------------------------- | ------- | -------------------- |
| 1    | #728      | Add security scanning workflows to CI                | Medium  | Security posture     |
| 2    | #744/#670 | Fix iterate.yml pnpm consistency (npm ci → pnpm)     | Trivial | CI correctness       |
| 3    | #722      | Add environment variable validation at startup       | Small   | Security/Reliability |
| 4    | #721      | Add explicit authorization checks beyond auth        | Medium  | Security             |
| 5    | #632      | Audit error logging for sensitive data leakage       | Medium  | Security/Compliance  |
| 6    | #754      | Add integration tests for Stripe webhook idempotency | Medium  | Test coverage        |

---

## E. Fix Applied Locally: iterate.yml pnpm Consistency (#744/#670)

The fix has been committed locally but **cannot be pushed** because the GITHUB_TOKEN lacks `workflows` permission.

### Branch

`fix/iterate-yml-pnpm-consistency` (commit `333b9eb`)

### Changes

File: `.github/workflows/iterate.yml`

**Line 72 (architect job):**

```diff
-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
```

**Line 342 (Fixer job):**

```diff
-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
```

### Verification

- Typecheck: 8/8 ✅
- Tests: 69 test files, 1432/1432 passed ✅
- Lint: 9/9 tasks passed ✅

### How to Apply

```bash
# Option 1: Check out the local branch
git checkout fix/iterate-yml-pnpm-consistency
git push origin fix/iterate-yml-pnpm-consistency  # Requires workflows write permission

# Option 2: Apply the two-line diff manually (shown above)
```

---

## F. Pre-existing Environment Issue: Node.js v20 vs v22

The build fails on both `main` and all branches with:

```
TypeError: webidl.util.markAsUncloneable is not a function
```

**Cause**: Next.js 16 requires Node.js >=22, but the CI environment uses Node v20.20.2.
**Fix**: Either upgrade the CI runner to Node 22, or use `nvm use 22` before building.
**Status**: Pre-existing, not caused by any open PR.

---

## G. Action Items Summary

| #   | Action                           | Requires              | Effort  |
| --- | -------------------------------- | --------------------- | ------- |
| 1   | Push iterate.yml fix             | Workflows write token | 1 min   |
| 2   | Add priority labels to 34 issues | Write API token       | 5 min   |
| 3   | Close 10 stale issues            | Write API token       | 5 min   |
| 4   | Merge 4 duplicate issue pairs    | Write API token       | 5 min   |
| 5   | Add security scanning CI (#728)  | Code + CI config      | 2-4 hrs |
| 6   | Add env var validation (#722)    | Code changes          | 1-2 hrs |
| 7   | Add authorization checks (#721)  | Code changes          | 2-4 hrs |
| 8   | Audit error logging (#632)       | Code review           | 1-2 hrs |
| 9   | Fix Node.js v20 env              | CI config change      | 10 min  |

---

_Generated by Sisyphus (ISSUE MANAGER MODE) on 2026-07-26_
