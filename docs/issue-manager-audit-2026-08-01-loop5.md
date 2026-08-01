# Issue Manager Audit Report — 2026-08-01 (Loop 5)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0). Entry detection found **0 open PRs and 82 open issues** → entered ISSUE MANAGER MODE. Executed STEP 2 (duplicate detection + resolution re-verification) and STEP 4 (repair-mode selection). STEP 1 (label normalization) and STEP 3 (consolidation) remain blocked by token permissions (see §3).

## 2. Decision Summary

- Default branch detected: `main`.
- **Phase 0 → ISSUE MANAGER MODE**: 0 open PRs, 82 open issues.
- **STEP 2 — Duplicate detection**: confirmed the **5-issue pnpm-CI cluster** (#305, #584, #595, #670, #744) all target the same defect: `iterate.yml` runs `npm ci || true` in a pnpm-only repo (no `package-lock.json` exists, so the install **always silently fails**), plus wrong cache path (`~/.npm`) and cache key (`package-lock.json`). The cluster is **genuinely unresolved** and maps directly to the lowest-scoring domain D (Delivery & Evolution, 68) / CI-CD Health criterion (65).
- **STEP 4 — Repair-mode selection**: no genuinely-open P0/P1 issue exists (re-verified, see §4). Contract fallback (lowest domain → lowest criterion) selects the pnpm-CI cluster. **Attempted the fix** (branch, edits, YAML validation, commit) — **push rejected by GitHub**: the automation token lacks `workflows` permission (`refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml`). **Fix is blocked at the delivery layer**, not by code complexity.
- **Alternative candidates exhausted**: every remaining small, deterministic, code-deliverable issue was verified **already resolved on `main`** but never auto-closed (PR bodies used "issue #N" phrasing, not "fixes #N", and the automation token cannot close issues). Full evidence map in §4.2.
- **Delivered**: this audit report (docs PR) documenting the blocked fix, the full resolution evidence map, and the privileged-action list required to close the loop.

## 3. Permissions & Skills Used (per TOOL USAGE mandate)

| Skill / Agent                              | Purpose                                                               | Result                                          |
| ------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------- |
| `github-workflow-automation` (repo skill)  | CI workflow permission model (on-pull.yml grants, iterate.yml intent) | Informed the push-block diagnosis               |
| Direct verification (gh api / grep / read) | Issue-state re-verification, label matrix, code evidence              | Full evidence map (§4.2)                        |
| `pnpm audit`, `pnpm test`, `pnpm lint`     | Health baseline                                                       | Audit clean; 73 files / 1482 tests ✅; lint 9/9 |

**Subagent note:** Explore-agent model ID (`opencode/gpt-5-nano`) is stale/broken in the harness config (documented in loop-3 §8); all verification performed directly with identical coverage. Issue-mutation skills unusable — token is read-only for issues (verified 403 this loop).

## 4. STEP 2 — Duplicate Detection & Resolution Re-Verification

### 4.1 Duplicate clusters

| Cluster                | Issues                                                                | Status                                                                                                        |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| pnpm in CI (iterate)   | #305, #584, #595, #670, #744                                          | **Genuinely open** — blocked by `workflows` permission (§5)                                                   |
| .nvmrc / Node version  | #720 (missing), #748 (invalid '20')                                   | Both RESOLVED — `.nvmrc` now `22.14.0`; duplicates of each other                                              |
| Security scanning CI   | #728 (P1)                                                             | BLOCKED — requires `workflows` permission (loops 3–4)                                                         |
| Testing infrastructure | #581 (umbrella), #500, #549, #550, #551, #725, #724, #787, #754, #788 | All RESOLVED (see §4.2)                                                                                       |
| Bundle / performance   | #723, #729, #708, #523                                                | #708/#729 partially addressed (size-limit config + bundle analyzer present); CI wiring requires workflow edit |
| Observability          | #486 (OTel), #580 (monitoring)                                        | Genuinely open (instrumentation.ts only validates env) — large scope, P2, not atomic repair candidates        |

No **new** duplicate clusters introduced since loop 4 (verified via `createdAt` scan — the newest issues are 2026-02-27).

### 4.2 Resolution evidence map (verified on `main` this loop)

| Issue          | Title                                 | Verdict           | Evidence                                                                                          |
| -------------- | ------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| #496 (P0)      | Distributed rate limiter (Redis)      | ✅ RESOLVED       | `packages/api/src/distributed-rate-limiter.ts` wired into `trpc.ts`                               |
| #480 (P1)      | Redis rate limiter (dup of #496)      | ✅ RESOLVED (dup) | Same implementation; canonical #496                                                               |
| #498 (P1)      | RBAC role-based access                | ✅ RESOLVED       | `requireRole`/`adminProcedure` + admin router tests                                               |
| #515 (P1)      | CSRF protection                       | ✅ RESOLVED       | `csrfProtection` middleware in `trpc.ts`                                                          |
| #500/#549 (P1) | Clerk auth flow tests / auth coverage | ✅ RESOLVED       | `packages/auth/clerk.test.ts` (27 tests)                                                          |
| #501/#628 (P1) | Playwright E2E journeys               | ✅ RESOLVED       | 11 spec files in `tests/e2e/`                                                                     |
| #550 (P1)      | apps/nextjs in coverage               | ✅ RESOLVED       | `vitest.config.ts` includes `apps/nextjs/src/**`                                                  |
| #551 (P1)      | k8s router tests                      | ✅ RESOLVED       | `packages/api/src/router/k8s.test.ts` + integration tests                                         |
| #581 (P1)      | Testing infra umbrella                | ✅ RESOLVED       | All sub-issues resolved; router middleware integration tests merged (#1041)                       |
| #725 (P1)      | API router integration tests          | ✅ RESOLVED       | `packages/api/src/router/integration.test.ts` (PR #1041)                                          |
| #786 (P1)      | Stripe webhook partial secret log     | ✅ RESOLVED       | `webhooks/stripe/route.ts` logs sanitized message + requestId only (never raw StripeError)        |
| #632 (P1)      | Sensitive logging audit               | ✅ RESOLVED       | `packages/common/src/logger.ts` redaction + tests                                                 |
| #721 (P1)      | Explicit authorization checks         | ✅ RESOLVED       | `verifyOwnership`/`requireRole`/`adminProcedure`                                                  |
| #611           | Root not-found.tsx                    | ✅ RESOLVED       | `apps/nextjs/src/app/not-found.tsx` (PR #1048) — **never auto-closed**                            |
| #719           | Root tsconfig                         | ✅ RESOLVED       | `tsconfig.json` exists                                                                            |
| #722           | Env validation at startup             | ✅ RESOLVED       | `packages/common/src/config/env.ts`, `env.mjs` files, `instrumentation.ts`                        |
| #748           | .nvmrc invalid '20'                   | ✅ RESOLVED       | `.nvmrc` = `22.14.0`                                                                              |
| #720           | Missing .nvmrc                        | ✅ RESOLVED       | `.nvmrc` exists                                                                                   |
| #785           | Duplicate next dep (stripe)           | ✅ RESOLVED       | `packages/stripe/package.json` — no `next` dependency at all                                      |
| #789           | React peerDeps (packages/ui)          | ✅ RESOLVED       | `peerDependencies: { react, react-dom }` present                                                  |
| #787           | DB migration/schema tests             | ✅ RESOLVED       | `packages/db/migrations.test.ts` (PR #1046) — **never auto-closed**                               |
| #755           | Composite index (customer)            | ✅ RESOLVED       | Migrations `20260227_add_customer_subscription_composite_index`, `20260606_..._plan_period_index` |
| #754           | Stripe webhook idempotency tests      | ✅ RESOLVED       | `packages/stripe/src/webhook-idempotency.test.ts` (425 lines)                                     |
| #609           | Duplicate Zod schemas                 | ✅ RESOLVED       | `schemas.ts` centralized; k8s/customer import from it (PR #1039)                                  |
| #610           | tRPC response format                  | ✅ RESOLVED       | PR #1023 (insertCustomer response standardization)                                                |
| #663           | eslint-disable consolidation          | ✅ RESOLVED       | PR #954                                                                                           |
| #664           | console → pino                        | ✅ RESOLVED       | PR #964; remaining `console.*` only in JSDoc comments                                             |
| #666           | Global error boundary                 | ✅ RESOLVED       | `error.tsx` + `global-error.tsx`                                                                  |
| #483           | Stripe webhook transactions           | ✅ RESOLVED       | `db.transaction()` in `webhooks.ts`                                                               |
| #485           | Suspense boundaries                   | ✅ RESOLVED       | `Suspense` used in dashboard/docs layouts                                                         |
| #492           | Image sizes attribute                 | ✅ RESOLVED       | `sizes=` present in mdx-components, blog cards                                                    |
| #636           | ISR caching                           | ✅ RESOLVED       | `export const revalidate = 60` in dashboard page                                                  |
| #667           | Package export boundaries             | ✅ RESOLVED       | `db/index.ts`, `auth/index.ts`, `stripe/src/index.ts` proper barrels (PR #905 for auth)           |
| #687           | Missing barrel exports                | ✅ RESOLVED       | Same as #667                                                                                      |
| #578           | Duplicate health endpoint             | ✅ RESOLVED       | Single `apps/nextjs/src/app/api/health/route.ts`                                                  |
| #613           | Duplicate workflow file               | ✅ RESOLVED       | Only `iterate.yml` + `on-pull.yml` remain                                                         |
| #683           | ESLint/Prettier monorepo config       | ✅ RESOLVED       | Root `.eslintrc.cjs` extends tooling base (PR #972)                                               |
| #634           | TS strictness audit                   | ✅ RESOLVED       | `tooling/typescript-config/base.json` → `"strict": true`                                          |
| #630           | Pre-commit hooks                      | ✅ RESOLVED       | `.husky/pre-commit` runs `pnpm typecheck && pnpm test`                                            |
| #684           | Root build script / turbo pipelines   | ✅ RESOLVED       | `package.json` build + turbo.json pipelines                                                       |
| #697           | Corrupted docs formatting             | ✅ RESOLVED       | Commits `e290045`, `b3b9000`                                                                      |
| #713           | packages/common unit tests            | ✅ RESOLVED       | 6 test files in `packages/common/src/`                                                            |
| #579           | Env setup error messages              | ✅ RESOLVED       | `.nvmrc` + `env:verify` script (clear pnpm-missing message) + CONTRIBUTING                        |
| #503           | JSDoc on API routers                  | ✅ RESOLVED       | All routers have JSDoc blocks; `health_check.ts` (cited) no longer exists                         |
| #752           | Unified CLI output utilities          | ✅ RESOLVED       | `packages/common/src/logger.ts` (pino, levels, redaction, tests)                                  |

**Conclusion: no genuinely-open P0/P1 issue and no genuinely-open small deterministic code-deliverable issue remains.** The only genuinely-open defects are (a) the pnpm-CI cluster — blocked by `workflows` permission, and (b) large P2 feature work (#486/#580 observability, #487 Redis caching, #494 domain layer, #590 UI audit, #753/#751/#723 bundle work) — out of scope for minimal atomic repair.

## 5. STEP 4 — Repair Mode Attempt (pnpm-CI cluster)

### 5.1 Selection

- No genuinely-open P0/P1 (verified §4).
- Contract fallback: lowest-scoring domain **D. Delivery & Evolution (68)** → lowest criterion **CI/CD Health (65)** (score report 2026-07-18: "Two CI workflows exist… Node.js version mismatch", "no security scanning", plus the pnpm-consistency defect).
- The 5-issue pnpm cluster is the highest-value atomic target: deterministic, exactly specified by 5 issues, no runtime API change.

### 5.2 Implementation (attempted)

Branch `fix/iterate-yml-pnpm-consistency` from `main` (up-to-date, zero conflicts):

1. **Architect job** (`iterate.yml` lines ~54–76):
   - `actions/cache`: path `~/.npm` → `~/.pnpm-store`; key `hashFiles('**/package-lock.json')` → `hashFiles('**/pnpm-lock.yaml')`
   - Added `pnpm/action-setup@v6` (run_install: false) before `setup-node` (mirrors `on-pull.yml`)
   - `run: npm ci || true` → `run: pnpm install --frozen-lockfile || true`
2. **Fixer job** (lines ~339–350): same `pnpm/action-setup` + `pnpm install --frozen-lockfile || true` replacement.
3. YAML validated (`python3 yaml.safe_load` ✅), no remaining `npm ci`/`package-lock.json`/`~/.npm` references.

### 5.3 Result — BLOCKED at push

```
! [remote rejected] fix/iterate-yml-pnpm-consistency ->
  (refusing to allow a GitHub App to create or update workflow
   `.github/workflows/iterate.yml` without `workflows` permission)
```

- The `on-pull.yml` automation token grants `contents: write` + `pull-requests: write` but **not** `workflows: write`.
- GitHub hard-blocks **any** push touching `.github/workflows/*` without that permission. This is the same wall documented for #728 (loops 3–4) and the CI Node-version alignment.
- Branch deleted locally after the block (`git branch -D`); no remote artifacts left behind.
- Per the FAIL-SAFE rule, the fix is **not** guessed around (e.g., no attempt to smuggle workflow changes through a non-workflow path).

### 5.4 Verification baseline (all green)

| Check             | Result                                         |
| ----------------- | ---------------------------------------------- |
| `pnpm audit`      | **No known vulnerabilities** (loop-4 fix held) |
| `pnpm test`       | ✅ 73 files / 1482 tests pass                  |
| `pnpm lint`       | ✅ 9/9 tasks, 0 warnings                       |
| `pnpm check-deps` | ✅ clean                                       |
| `pnpm install`    | ✅ frozen lockfile, no changes                 |

## 6. STEP 1 / STEP 3 — Normalization & Consolidation (blocked)

- Issue mutations remain **blocked** for the automation token: `addLabelsToLabelable`, `closeIssue`, `addComment`, `createIssue` all returned 403 this loop (re-verified on #789).
- **STEP 1 (labels)**: 12 issues missing a category label (#755, #754, #753, #752, #751, #749, #748, #744, #697, #670, #635, #595); 13 issues have multi-category labels (#713, #688, #584, #581, #551, #550, #549, #523, #522, #515, #498, #496, #305); 38 issues missing a priority label. All require a privileged token to fix.
- **STEP 3 (consolidation)**: the pnpm-CI cluster consolidation (5 issues → 1 canonical, or close 4 as duplicates of #744) requires `closeIssue` — blocked.
- **Resolved-but-open closures**: #611, #787, and ~40 other resolved issues (see §4.2) remain OPEN because merged PRs did not auto-close them. Requires privileged `closeIssue` with "resolved by PR #NNN" reference.

## 7. Action Log

| Timestamp (UTC)  | Action                                           | Target                                       | Result                                                      |
| ---------------- | ------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| 2026-08-01T18:4x | Phase 0 detection                                | repo                                         | 0 open PRs, 82 open issues → ISSUE MANAGER MODE             |
| 2026-08-01T18:4x | Full issue inventory export + label matrix       | 82 issues                                    | 12 missing category, 13 multi-category, 38 missing priority |
| 2026-08-01T18:5x | Permission matrix probe                          | issue mutations                              | 403 on addLabels/close/comment/create                       |
| 2026-08-01T18:5x | Duplicate detection + resolution re-verification | 82 issues                                    | pnpm-CI cluster open; ~45 verified resolved (§4.2)          |
| 2026-08-01T19:0x | Baseline: install / test / lint / audit          | repo                                         | 1482 tests ✅, lint 9/9 ✅, audit clean                     |
| 2026-08-01T19:1x | Repair attempt: branch + iterate.yml edits       | fix/iterate-yml-pnpm-consistency             | Committed `0040591`, YAML valid                             |
| 2026-08-01T19:1x | Push attempt                                     | remote branch                                | ❌ rejected — `workflows` permission missing                |
| 2026-08-01T19:1x | Cleanup                                          | local branch                                 | Branch deleted; no remote artifacts                         |
| 2026-08-01T19:2x | Audit report authored + PR                       | docs/issue-manager-audit-2026-08-01-loop5.md | This PR                                                     |

## 8. New Findings & Recommendations

1. **`workflows` permission is the single blocking constraint** for the highest-value repairs: pnpm-CI cluster (#305/#584/#595/#670/#744), security-scanning deploy (#728), CI Node 20→22 alignment (`.nvmrc` 22.14.0 vs workflow `node-version: "20"`), and #726/#729/#502 CI wiring. A privileged process (or a token with `workflows: write`) can merge the exact diff captured in §5.2.
2. **~45 issues are resolved but OPEN** because auto-close did not fire (PR bodies phrased "issue #NNN" instead of "fixes #NNN"). A privileged cleanup pass with "resolved by PR #NNN" closure comments would reduce the open-issue count from 82 to ~35 with zero code changes.
3. **Label normalization backlog** (12 missing category / 13 multi-category / 38 missing priority) is fully mapped (§6) and ready for a privileged token to apply.
4. **Vercel check remains red** on every PR (external free-tier daily deploy quota) — non-blocking precedent; do not gate merges on it.
5. **Next repair candidates** (once permissions allow): pnpm-CI fix (§5.2 diff), then Release & Rollback Safety (55) — no CHANGELOG / versioned releases / rollback automation.

## 9. Final State

- **Active phase**: ISSUE MANAGER MODE (repair blocked at delivery layer; audit report shipped).
- **Open PRs**: 0 (this report's PR pending CI).
- **Open issues**: 82 (unchanged — issue mutations blocked for automation).
- **Merged this loop**: none (no PR-deliverable code fix was possible within `contents`+`pull-requests` permissions; the only genuine defect cluster requires `workflows`).
- **Waiting for human review**: grant `workflows: write` (or merge §5.2 diff via privileged token); close ~45 resolved-but-open issues; apply label normalization + consolidation; close #611/#787 with PR references.
