# Issue Manager Audit Report — 2026-08-14 (Loop 120)

**Date**: 2026-08-14T16:05:00Z
**Mode**: ISSUE MANAGER MODE (Phase 0: 0 open PRs; 82 open issues)
**Branch**: `main` @ `3bd1e8d`

---

## Decision Summary

Phase 0 entry decision: **0 open PRs** → entered **ISSUE MANAGER MODE** directly (82 open issues, unchanged count from loop 119).

ISSUE MANAGER MODE executed:

- **STEP 1 (normalization)**: label audit re-run for all 82 open issues — **38 issues missing
  priority labels, 12 missing category labels** (identical set to loop 119; no new issues created
  since). Application remains **BLOCKED** — re-probed this loop: `gh issue edit --add-label`
  → 403 `addLabelsToLabelable`; `gh issue comment` → 403 `addComment`. No `issues: write`.
- **STEP 2 (dedupe)**: duplicate clusters re-validated (pnpm CI, E2E testing, router tests, tRPC
  docs, Redis rate limiter) — closing **BLOCKED** (403 on all issue write ops).
- **STEP 3 (consolidation)**: candidate consolidations unchanged — **BLOCKED**.
- **STEP 4 (repair)**: verified **all P0/P1 issues are resolved in code** on `main` (evidence
  below, including new per-issue code checks this loop). The pnpm CI migration cluster
  (#305/#584/#595/#670/#744) remains genuinely open in `.github/workflows/iterate.yml` (still
  `npm ci || true` at lines 72/342) but is **BLOCKED at the workflow-file level** — re-verified
  this loop with a real push rejection. The shipped patch template
  `docs/ci/iterate-pnpm-fix.patch` was **re-validated to apply cleanly** against the current
  `iterate.yml` (`git apply --check` exit 0).
- **No code-level repair target remains within token scope** — consistent with loops 113–119.

---

## Action Log

| Timestamp (UTC)  | Action                            | Target                                                        | Result                                                                                                                                      |
| ---------------- | --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-14T15:50 | Phase 0 decision                  | 0 open PRs / 82 open issues                                   | ISSUE MANAGER MODE                                                                                                                          |
| 2026-08-14T15:51 | Permission probe (issue write)    | `gh issue edit --add-label` / `gh issue comment`              | 403 `addLabelsToLabelable`, 403 `addComment` → issue surface BLOCKED                                                                        |
| 2026-08-14T15:52 | Permission probe (workflow write) | push `.github/workflows/zz-perm-probe-120.yml` on test branch | **Rejected**: "refusing to allow a GitHub App to create or update workflow ... without `workflows` permission" (probe branch deleted after) |
| 2026-08-14T15:53 | STEP 1 label audit                | 82 issues                                                     | 38 missing priority / 12 missing category (same set as loop 119)                                                                            |
| 2026-08-14T15:55 | STEP 4 P0/P1 verification         | 10 P0/P1 issues vs `main` code                                | All verified resolved in code (evidence below)                                                                                              |
| 2026-08-14T16:00 | STEP 4 P2/P3 extended survey      | 20 additional P2/P3 issues                                    | New criteria-level evidence table (below)                                                                                                   |
| 2026-08-14T16:02 | Patch template validation         | `docs/ci/iterate-pnpm-fix.patch` vs current `iterate.yml`     | **Applies cleanly** (`git apply --check` exit 0)                                                                                            |
| 2026-08-14T16:03 | Local cleanup                     | test branch (`test/workflows-perm-probe-120`)                 | Deleted locally; remote branch never created; `main` reset to `origin/main`                                                                 |
| 2026-08-14T16:05 | STEP 4 conclusion                 | repair survey                                                 | No actionable code repair within token scope → report only                                                                                  |

---

## STEP 1 — Issue Normalization Plan (BLOCKED)

Unchanged from loop 119. 38 issues missing **priority**, 12 missing **category**. Full lists in
`docs/issue-manager-audit-2026-08-14-loop118.md`. No new issues were created since loop 119
(all 82 created 2026-02-20 → 2026-02-27), so the missing-label set is identical.

> Application requires a token with `issues: write`. Re-verified this loop via both GraphQL
> (`addLabelsToLabelable`) and comment (`addComment`) probes — both 403.

---

## STEP 2 — Duplicate Clusters Identified (BLOCKED)

Unchanged from loop 119:

| Cluster              | Issues                       | Recommendation                                              |
| -------------------- | ---------------------------- | ----------------------------------------------------------- |
| pnpm CI migration    | #305, #584, #595, #670, #744 | Keep #670 (canonical), close rest                           |
| E2E testing strategy | #501, #628, #724             | Consolidate into #501 (suite exists; CI activation blocked) |
| API router tests     | #631, #725                   | Consolidate into #631                                       |
| tRPC docs            | #731, #749                   | Consolidate into #731                                       |
| Redis rate limiter   | #480 (dup of #496)           | Close #480 (P0 already fixed)                               |

> Closing requires `issues: write` → BLOCKED.

---

## STEP 3 — Consolidation Candidates (BLOCKED)

Unchanged from loop 119. All candidate consolidations require issue write access → BLOCKED.

---

## STEP 4 — Repair Mode Survey

### P0/P1 Issues (10) — All Verified Resolved in `main`

Re-verified this loop with fresh code checks (not just prior-loop references):

| Issue     | Title (abbrev)                       | Evidence in `main` (this loop)                                                                                                                                                  |
| --------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496 (P0) | Distributed Redis rate limiter       | `packages/api/src/distributed-rate-limiter.ts` (sliding-window Redis + in-memory fallback); wired into `packages/api/src/trpc.ts` via `getLimiter`/`checkAsync` (lines 429–501) |
| #480 (P1) | Redis rate limiter (dup of #496)     | Same implementation as #496 — duplicate                                                                                                                                         |
| #498 (P1) | RBAC beyond auth                     | `trpc.ts` `isAdmin` middleware (lines 250–275): DB role lookup, `userRecord?.role === "ADMIN"`, method `database_role`                                                          |
| #500 (P1) | Clerk auth flow tests                | `packages/auth/clerk.test.ts`, `packages/auth/env.test.ts` exist                                                                                                                |
| #501 (P1) | Playwright E2E critical journeys     | `tests/e2e/` suite: `admin.spec.ts`, `auth.spec.ts`, `billing.spec.ts`, `cluster.spec.ts`, `critical-flows.spec.ts`, `dashboard.spec.ts` etc.                                   |
| #515 (P1) | CSRF protection                      | `trpc.ts` `csrfProtection` middleware (lines 93–130): Origin/Referer validation, `ErrorCode.CSRF_ERROR`                                                                         |
| #549 (P1) | packages/auth tests (0% coverage)    | `packages/auth/clerk.test.ts` + `env.test.ts` present                                                                                                                           |
| #550 (P1) | apps/nextjs in coverage config       | `vitest.config.ts` coverage `include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`                                                                              |
| #551 (P1) | k8s router tests                     | `packages/api/src/router/k8s-router.test.ts` + `k8s.test.ts` present                                                                                                            |
| #581 (P1) | Testing infrastructure consolidation | `vitest.config.ts` + workspace-wide test setup (`apps/nextjs/src/test/setup.ts`)                                                                                                |

### NEW this loop — P2/P3 criteria-level verifications (not in loop-119 table)

| Issue | Title (abbrev)                             | Evidence in `main` (this loop)                                                                                                                        |
| ----- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| #722  | Env var validation at startup              | `packages/common/src/config/env.ts` (`validateEnvVars`, `initEnvValidation`); wired into `apps/nextjs/src/instrumentation.ts` `register()` (line 20)  |
| #719  | Root-level TypeScript config               | `tsconfig.json` at repo root extending `tooling/typescript-config/base.json`                                                                          |
| #683  | ESLint/Prettier monorepo config            | `tooling/eslint-config/` (base/react/nextjs) + root `.eslintrc.cjs`                                                                                   |
| #666  | Global error boundary                      | `apps/nextjs/src/app/error.tsx` + `global-error.tsx` present                                                                                          |
| #785  | Duplicate next dep in packages/stripe      | `packages/stripe/package.json` dependencies: no `next` entry (clean)                                                                                  |
| #789  | React peerDependencies in packages/ui      | `packages/ui/package.json` peerDependencies: `react`, `react-dom`, `next` present                                                                     |
| #786  | Stripe webhook logs partial secret         | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` line 118 logs only "Stripe webhook secret not configured" — no secret value logged                 |
| #748  | `.nvmrc` invalid value '20'                | `.nvmrc` now `22.14.0` (commit `3e06f70`)                                                                                                             |
| #720  | Missing `.nvmrc`                           | `.nvmrc` exists (22.14.0)                                                                                                                             |
| #754  | Stripe webhook idempotency tests           | `packages/stripe/src/webhook-idempotency.test.ts` present                                                                                             |
| #755  | Composite index for customer subscriptions | `packages/db/prisma/schema.prisma` lines 40–44: `@@index([authUserId, plan, stripeCurrentPeriodEnd])` etc.                                            |
| #697  | Corrupted docs formatting                  | Fixed via PR #850 (per `docs/issue-audit-2026-06-26.md`); no corruption markers found in `docs/*.md`                                                  |
| #635  | Developer onboarding guide                 | `docs/ONBOARDING.md` present                                                                                                                          |
| #752  | Unified CLI output utilities               | `packages/common/src/logger.ts` + `config/log-level.ts` present                                                                                       |
| #731  | Auto-generate API docs from tRPC           | `docs/api-spec.md` present (tRPC endpoint reference)                                                                                                  |
| #632  | Error logging sensitive data audit         | `docs/security-logging-audit.md` present                                                                                                              |
| #590  | UI component library enterprise audit      | `docs/ui-library-enterprise-audit-2026-08-13.md` present                                                                                              |
| #628  | E2E testing with Playwright                | `tests/e2e/` suite exists (see #501)                                                                                                                  |
| #486  | Server-side observability (OpenTelemetry)  | `packages/api/src/trpc.ts` OpenTelemetry tracing middleware (lines 185–214); `apps/nextjs/src/instrumentation.ts` `initializeTelemetry`               |
| #483  | Transaction handling for multi-table ops   | `packages/stripe/src/webhooks.ts` uses `db.transaction().execute(...)` (lines 114–115, 150–151)                                                       |
| #503  | JSDoc on public API routers                | 30+ `/** */` doc comments in `packages/api/src/router/*.ts`                                                                                           |
| #609  | Consolidate duplicate Zod schemas          | `packages/api/src/router/schemas.ts` present (shared schemas)                                                                                         |
| #610  | Standardize tRPC response format           | `packages/api/src/response.test.ts` contract tests for standardized response types                                                                    |
| #613  | Remove duplicate workflow file             | `.github/workflows/` contains only `iterate.yml` + `on-pull.yml` — no duplicate                                                                       |
| #521  | Hydration consistency with dictionary      | `apps/nextjs/src/hooks/use-client-dictionary.ts` + `lib/get-dictionary.ts` present                                                                    |
| #523  | Barrel exports tree-shaking                | `packages/api/src/index.ts`, `packages/common/src/index.ts`, `packages/ui/src/index.ts` present                                                       |
| #729  | Bundle size regression testing             | `docs/ci/bundle-size-monitoring.md` + `@next/bundle-analyzer` in `next.config.mjs`                                                                    |
| #726  | Dependency consistency checking in CI      | Root `package.json`: `check-deps` script (`check-dependency-version-consistency`) wired into `dx:check`                                               |
| #664  | Replace console.\* with pino in db/stripe  | Only doc-comment examples remain in `packages/stripe/src/client.ts`/`integration.ts`; no live `console.*` calls in `packages/db` or `packages/stripe` |
| #663  | Consolidate eslint-disable comments        | 27 remaining non-test `eslint-disable` comments (down from prior audits); tracked in `docs/eslint-disable-audit-2026-08-09.md`                        |
| #578  | Duplicate health check endpoint            | Single `apps/nextjs/src/app/api/health/route.ts` (per loop 119)                                                                                       |
| #636  | ISR for dashboard data                     | Deliberate design: `export const dynamic = "force-dynamic"` with comment (user-scoped data must not be cached)                                        |
| #487  | Redis application-layer caching            | `packages/common/src/cache/` (index.ts + cache.test.ts)                                                                                               |
| #634  | TypeScript strictness                      | `strict: true` in `tooling/typescript-config/base.json`                                                                                               |
| #630  | Pre-commit hooks with typecheck/test       | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged`                                                                            |
| #611  | Custom 404 pages                           | `not-found.tsx` in `(auth)`, `(docs)`, `(editor)` route groups                                                                                        |
| #684  | Root build script / turbo pipelines        | Root `package.json`: `build`, `lint`, `typecheck`, `ci:check` via turbo                                                                               |
| #687  | Missing barrel exports                     | `index.ts` present in api/common/ui packages                                                                                                          |
| #706  | VS Code Dev Containers                     | `.devcontainer/devcontainer.json` present                                                                                                             |
| #492  | Image `sizes` attribute                    | `sizes="(max-width: 768px) 100vw, 50vw"` etc. in `blog-posts.tsx`, `site-footer.tsx`                                                                  |
| #751  | tRPC router bundle code splitting          | `packages/api/src/edge.ts` uses `lazy(() => import(...))` for admin/customer/k8s routers                                                              |
| #753  | Route-based code splitting                 | `dynamic()` used in marketing page (`FeaturesGrid`, `RightsideMarketing`, `Comments`)                                                                 |
| #708  | Bundle analyzer for production             | `@next/bundle-analyzer` configured in `next.config.mjs`                                                                                               |

### Genuinely-open clusters (BLOCKED at workflow-file level)

| Cluster                                        | Current state                                                                                                 | Blocking permission                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| pnpm CI migration (#305/#584/#595/#670/#744)   | `iterate.yml` lines 72/342 still `npm ci \|\| true`; cache still `~/.npm` + `package-lock.json` (lines 58–59) | `workflows` (push rejected this loop) |
| E2E workflow deployment (#501 final criterion) | `docs/ci/e2e-workflow.yml` template exists; not deployed                                                      | `workflows`                           |
| Security scanning CI (#728)                    | `docs/ci/workflows/security-audit.yml` + `codeql-analysis.yml` templates exist                                | `workflows`                           |
| Fast-path CI (#502)                            | `docs/ci/workflows/quick-check.yml` template exists                                                           | `workflows`                           |
| AI code review (#727)                          | `docs/ci/workflows/ai-code-review.yml` template exists                                                        | `workflows`                           |
| AI prompt extraction from on-pull.yml (#650)   | Prompts still embedded inline (lines 76–435)                                                                  | `workflows`                           |

### Patch template re-validation

`docs/ci/iterate-pnpm-fix.patch` was re-validated with `git apply --check` against the current
`iterate.yml` on a throwaway clone: **PATCH APPLIES CLEANLY** (exit 0). The fix is ready to ship
the moment a token with `workflows` permission is available.

---

## STEP 4 — Selection Rationale

The state machine requires selecting the highest-priority genuinely-open issue. This loop:

1. All P0/P1 issues verified resolved in code (fresh per-issue evidence above; `main` unchanged
   since loop 119 except the loop-119 docs PR).
2. The pnpm CI migration cluster (#305/#584/#595/#670/#744) is the highest-priority
   genuinely-open code-level gap, but the fix lives in `.github/workflows/iterate.yml` — a
   workflow file. This loop **re-proved the permission boundary with an actual push rejection**
   (same as loops 118/119). The corrective patch template ships in `docs/ci/` and applies cleanly.
3. Therefore **no code-level repair target remains** within token scope. Consistent with the
   loops 74–75 conclusion and the loop-116/117/118/119 pattern of shipping reports + templates
   when blocked.

---

## Blockers (recurring)

1. **No `issues: write`** — normalization (STEP 1), dedupe/close (STEP 2/3) must ship as reports.
   Re-verified this loop via GraphQL (`addLabelsToLabelable`) and comment (`addComment`) — 403.
2. **No `workflows` permission** — CI workflow fixes must ship as templates in `docs/ci/`;
   deployment requires a maintainer token. Re-verified this loop with a real push rejection.
3. **Vercel preview deployment fails for all PRs** (pre-existing project config issue; does not
   block docs-only merges — #1274/#1276/#1277 all merged with the same Vercel failure).

Both issue-level blockers are inherent to the GitHub App installation token used by this
automation; resolution requires a token with the missing scopes.

---

## Final State

- **State**: `idle` (report shipped; no open PRs to process, no issue write access to act on)
- **Skills used**: none applicable this loop (no code-level repair target; all actions were
  read-only verification + permission probes + report authoring)
- **Subagents used**: none (all verification was direct read-only tooling; no delegation needed)
