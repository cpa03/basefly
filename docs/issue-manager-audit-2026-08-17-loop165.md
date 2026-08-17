# Issue Manager Audit Report — 2026-08-17 (Loop 165)

## Executive Summary

- **Open PRs**: 0 at phase entry → **ISSUE MANAGER MODE** engaged directly (82 open issues)
- **Token permissions re-probed** (unchanged from loops 159–164):
  - `issues: write` **NOT available** → label normalization, issue comments, issue closing remain **BLOCKED** (probe: `gh issue edit --add-label` → 403 `addLabelsToLabelable`; `gh issue comment` → 403 `addComment`; `gh issue close` → 403 `closeIssue`; `gh issue create` → 403 `createIssue`)
  - `workflows: write` **NOT available** → `.github/workflows/*` changes remain **BLOCKED** (re-probed: push of `iterate.yml` rejected — "refusing to allow a GitHub App to create or update workflow ... without `workflows` permission")
  - `contents: write` + `pull-requests: write` **available** → branch push + PR creation possible
- **REPAIR MODE executed**: Issue **#590** (UI component library audit) solved — `docs/ui-component-inventory.md` created with per-component stability classification (acceptance criterion #1), pushed as **PR #1335**
- **Full 82-issue resolution audit completed** (see matrix below): **61 resolved** (60 previously + #590 this loop), **10 genuinely open** (large features / partial), **11 workflow-blocked**
- **Baseline health**: `pnpm test` **2124/2124 pass** (142 files), `pnpm typecheck` 9/9, `pnpm lint` 9/9 — all green
- **No new issues** created (blocked by token); issue count stable at 82.

---

## Phase 0 — Entry Decision

| Step | Check       | Result                          |
| ---- | ----------- | ------------------------------- |
| 0.1  | Open PRs    | **0** → skip PR HANDLER MODE    |
| 0.2  | Open issues | **82** → **ISSUE MANAGER MODE** |

---

## ISSUE MANAGER MODE

### STEP 1 — Issue Normalization (BLOCKED: no `issues: write`)

Re-probed (`gh issue edit --add-label "P2"` → `GraphQL: Resource not accessible by integration (addLabelsToLabelable)`). No change in capability. Normalization plan (unchanged from loop 163/164): **39 issues** missing category and/or priority labels per the label system (bug|enhancement|feature|docs|refactor|chore|test|ci|security + P0–P3). Full mapping prepared in `/tmp/opencode/normalize_labels.sh` (44 operations) — all 44 failed with 403; script preserved for maintainer.

### STEP 2/3 — Duplicate & Consolidation (BLOCKED: no `issues: write`)

Duplicate clusters re-verified (unchanged from loop 163/164):

| Cluster                       | Issues                           | Canonical           |
| ----------------------------- | -------------------------------- | ------------------- |
| Redis rate limiter            | #480 ≈ #496                      | #496 (P0, resolved) |
| pnpm consistency in workflows | #305 / #584 / #595 / #670 / #744 | #305 (blocked)      |
| Playwright E2E tests          | #628 ≈ #724                      | #501 (resolved)     |
| API router tests              | #631 ≈ #725                      | #725 (resolved)     |
| Node version pinning          | #720 ≈ #748                      | #748 (resolved)     |
| Observability                 | #580 ≈ #486                      | #486 (open, large)  |
| API docs generation           | #749 ≈ #731                      | #731 (resolved)     |
| Bundle size / code splitting  | #723 / #751 / #753               | #723 (partial)      |
| Unit tests for packages       | #713 / #787                      | #713 (resolved)     |

### STEP 4 — REPAIR MODE: #590 (UI component library audit) — SOLVED via PR #1335

**Selection rationale**: All P0/P1 issues verified **resolved in code** (matrix below). Lowest-scoring domain per `docs/diagnostic-score-report-2026-07-18.md` is **D. Delivery & Evolution (68)**, lowest criterion **Release & Rollback Safety (55)** — but every D-domain issue is either workflow-blocked (#522, #502, #728, #726) or already resolved in code (#729 size-limit configured, #630 pre-commit hooks). Among genuinely-open issues, **#590** is the only one whose _entire_ acceptance criteria can be delivered with available permissions (`contents: write`): its acceptance criterion #1 is a documentation deliverable.

**Deliverable**: `docs/ui-component-inventory.md` — per-component inventory of `packages/ui` (54 components + 1 utility) with:

- **Stability tiers**: Core (23 + `button-variants` util, production-used), Extended (12, landing sections), Available (12, standard primitives not yet imported), Marketing/Experimental (7, decorative)
- **Test coverage correction**: 54/54 components have tests (100%) — the 2026-08-13 audit's "15 test files" record is stale
- **Usage counts** verified via grep across `apps/` + `packages/`
- **Recommendations** traceable to #590 (marketing subpath isolation, a11y review for Marketing tier, promotion path)

**Verification**: Docs-only change (no build/lint/test impact). PR #1335 created: https://github.com/cpa03/basefly/pull/1335

---

## Full 82-Issue Resolution Matrix (verified 2026-08-17)

### RESOLVED in code (61 — including #590 this loop)

| Issue    | Title                                             | Evidence                                                                                                                                   |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| #789     | peerDependencies for React in packages/ui         | `packages/ui/package.json` has `peerDependencies: {next, react ^19, react-dom ^19}`                                                        |
| #788     | Unit tests for critical UI components             | `navbar.test.tsx`, `modal.test.tsx`, `cluster-list.test.tsx`, `cluster-item.test.tsx` + 10 more in `apps/nextjs/src/components/__tests__/` |
| #787     | Unit tests for db migrations/schema               | `packages/db/migrations.test.ts` (structure + schema + security DDL checks)                                                                |
| #786     | Stripe webhook logs partial secret                | Rate-limit logger logs only `{identifier, requestId, resetAt}` (verified loop 164)                                                         |
| #785     | Duplicate next dependency in packages/stripe      | No `next` dep, no duplicates in `packages/stripe/package.json`                                                                             |
| #755     | Composite index for customer subscription queries | Migration `20260227_add_customer_subscription_composite_index` + `@@index([authUserId, plan, stripeCurrentPeriodEnd])`                     |
| #754     | Stripe webhook idempotency tests                  | `packages/stripe/src/webhook-idempotency.test.ts`                                                                                          |
| #753     | Route-based code splitting                        | `dynamic()` imports in `cluster-list.tsx`, marketing `page.tsx`                                                                            |
| #752     | Unified CLI output utilities                      | `packages/common/src/logger.ts` (pino, LOG_LEVEL env, redaction) + per-package loggers                                                     |
| #748     | Invalid .nvmrc                                    | `.nvmrc` = `22.14.0`                                                                                                                       |
| #731     | Auto-generate API docs from tRPC                  | `packages/api/src/docs-generator.ts` + `openapi.ts`                                                                                        |
| #729     | Bundle size regression testing                    | `size-limit` configured (`size:check`/`size:analyze` scripts, limits array) + `@next/bundle-analyzer`; only CI wiring missing (blocked)    |
| #725     | Integration tests for API routers                 | `packages/api/src/router/*.test.ts` (stripe, customer, k8s, admin, auth, hello, integration)                                               |
| #724     | E2E coverage for critical flows                   | `tests/e2e/` (12 spec files) + root `playwright.config.ts`                                                                                 |
| #722     | Env var validation at startup                     | `apps/nextjs/src/env.mjs` (@t3-oss/env-nextjs + zod)                                                                                       |
| #721     | Explicit authorization checks                     | `packages/api/src/authorization.ts` + `authorization.test.ts` + `rbac.ts`                                                                  |
| #720     | Missing .nvmrc                                    | Dup of #748 — `.nvmrc` = `22.14.0`                                                                                                         |
| #719     | Root-level TypeScript config                      | `tsconfig.json` at repo root                                                                                                               |
| #713     | Unit tests for packages/common                    | 10+ test files in `packages/common/src/`                                                                                                   |
| #708     | Bundle analyzer                                   | `@next/bundle-analyzer` + `ANALYZE=true` in `next.config.mjs`                                                                              |
| #706     | VS Code Dev Containers                            | `devcontainer.json` at repo root                                                                                                           |
| #705     | Docker configuration                              | `Dockerfile` + `docker-compose.yml`                                                                                                        |
| #697     | Corrupted docs formatting                         | Mojibake scan zero matches (loop 155); `DX-engineer.md` deduped (PR #942)                                                                  |
| #688     | Next.js middleware.ts                             | Next.js **16.2.11** — `apps/nextjs/src/proxy.ts` (middleware replacement): clerkMiddleware, CSP headers, CSRF, request IDs, edge logging   |
| #687     | Missing barrel exports                            | All `packages/*/src/index.ts` exist                                                                                                        |
| #685     | React performance optimizations                   | `useMemo`/`React.memo` in 5+ components                                                                                                    |
| #684     | Root build script + turbo pipelines               | `"build": "pnpm env:validate && turbo build"`                                                                                              |
| #683     | ESLint/Prettier config consistency                | Root `.eslintrc.cjs` + `tooling/eslint-config/{base,nextjs,react}.js` + `tooling/prettier-config`                                          |
| #667     | Package export boundaries                         | `docs/export-boundaries.md`                                                                                                                |
| #666     | Global error boundary                             | 5 `error.tsx` files (verified loop 164)                                                                                                    |
| #664     | console.\* → pino                                 | No real `console.*` in packages/db + packages/stripe (verified loop 164)                                                                   |
| #663     | eslint-disable consolidation                      | Only 4 non-test instances remain (<5, PR #1308)                                                                                            |
| #635     | Developer onboarding guide                        | `docs/ONBOARDING.md`                                                                                                                       |
| #634     | TypeScript strictness                             | All packages extend `tooling/typescript-config/base.json` (`strict: true`, `noUncheckedIndexedAccess`)                                     |
| #632     | Sensitive data logging audit                      | `packages/api/src/sensitive-data-logging.test.ts` + logger redaction patterns                                                              |
| #631     | API router tests (k8s/customer/stripe)            | `k8s-router.test.ts`, `customer-router.test.ts`, `stripe-router.test.ts`                                                                   |
| #630     | Pre-commit hooks with typecheck/test              | `.husky/pre-commit` runs `pnpm typecheck` + `pnpm test`                                                                                    |
| #628     | Playwright E2E                                    | `tests/e2e/` (12 spec files)                                                                                                               |
| #613     | Duplicate workflow file                           | Only `iterate.yml` + `on-pull.yml` exist                                                                                                   |
| #611     | not-found.tsx pages                               | 7 `not-found.tsx` files                                                                                                                    |
| #610     | Standardize tRPC response format                  | `packages/api/src/response.ts` + `response.test.ts` (PR #1268)                                                                             |
| #609     | Consolidate duplicate Zod schemas                 | `packages/api/src/router/schemas.ts` + `schemas-enhanced.test.ts`                                                                          |
| #581     | Testing infrastructure consolidation              | Merged PR #1123                                                                                                                            |
| #579     | Environment setup error messages                  | `scripts/check-package-manager.js` (preinstall guard, references #579) + CONTRIBUTING.md pnpm instructions                                 |
| #578     | Duplicate health check endpoint                   | Single `/api/health` route remains                                                                                                         |
| #551     | k8s router tests                                  | Merged PR #1119                                                                                                                            |
| #550     | apps/nextjs in coverage config                    | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}`                                                                                |
| #549     | packages/auth tests (0% coverage)                 | `packages/auth/clerk.test.ts` + `env.test.ts`: 41 tests pass                                                                               |
| #523     | Barrel exports tree-shaking                       | Subpath exports map in `packages/ui/package.json` (57 subpaths)                                                                            |
| #521     | Hydration consistency                             | Merged PR #1332 (hydration tests for `useClientDictionary`)                                                                                |
| #515     | CSRF protection                                   | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` + proxy.ts CSRF validation                                                                  |
| #503     | JSDoc on public API routers                       | `/** */` docs in `packages/api/src/router/*.ts`                                                                                            |
| #501     | Playwright E2E critical journeys                  | `tests/e2e/` (12 spec files)                                                                                                               |
| #500     | Clerk authentication flow tests                   | `packages/auth/clerk.test.ts` (41 tests)                                                                                                   |
| #498     | RBAC replacing email-based admin                  | Merged PR #1202 (database-backed RBAC in page-level guards)                                                                                |
| #496     | Redis rate limiter (P0)                           | `packages/api/src/distributed-rate-limiter.ts` + merged PRs #627, #1232                                                                    |
| #492     | sizes attribute for images                        | `sizes=` present in `blog-posts.tsx`, `site-footer.tsx`, `sign-in-modal-clerk.tsx`, `video-scroll.tsx`                                     |
| #485     | Suspense boundaries                               | `Suspense` in 5+ files (dashboard, docs layout, pricing)                                                                                   |
| #483     | Transaction handling                              | Merged PRs #1328/#1329/#1330 (RLS-aware transactions)                                                                                      |
| #480     | In-memory rate limiter → Redis                    | Dup of #496 — resolved                                                                                                                     |
| **#590** | **UI component library audit**                    | **FIXED THIS LOOP — PR #1335 (`docs/ui-component-inventory.md`)**                                                                          |

### GENUINELY OPEN (10 — large features or partial; violate REPAIR MODE "minimal, atomic" rule)

| Issue | Title                                 | Status                                                                                        |
| ----- | ------------------------------------- | --------------------------------------------------------------------------------------------- |
| #494  | Domain layer for business logic       | Large architectural refactor                                                                  |
| #487  | Redis application-layer caching       | Large feature (P2)                                                                            |
| #486  | OpenTelemetry observability           | Large feature                                                                                 |
| #580  | Monitoring/logging infrastructure     | Dup of #486                                                                                   |
| #668  | AI-Native cluster diagnostics         | Large feature                                                                                 |
| #636  | ISR caching for dashboard             | Design-flawed: per-user dashboard data must NOT be ISR-cached (privacy) — needs issue rewrite |
| #749  | AI-powered API testing/docs generator | Large feature                                                                                 |
| #727  | AI-Powered Code Review Automation     | Large feature                                                                                 |
| #751  | tRPC router bundle size               | Partial — no lazy router loading on main                                                      |
| #723  | High client component count           | Partial — 35 `"use client"` files; some code splitting in place                               |

### BLOCKED by token permissions (11 — `workflows: write` missing)

| Issue | Title                                                                  |
| ----- | ---------------------------------------------------------------------- |
| #305  | Standardize workflows to pnpm (canonical)                              |
| #584  | Remaining pnpm inconsistencies                                         |
| #595  | Workflows use npm instead of pnpm                                      |
| #670  | iterate.yml pnpm fix                                                   |
| #744  | iterate.yml pnpm consistency (fix prepared loop 164, commit `7c14cdd`) |
| #522  | Vercel deployment workflow                                             |
| #502  | Fast-path CI workflow                                                  |
| #728  | Security scanning workflows                                            |
| #726  | Dependency consistency checking                                        |
| #488  | Circular dependency detection                                          |
| #650  | Extract embedded AI prompts from on-pull.yml                           |

---

## Known Vulnerability (documented, NOT force-fixed)

`pnpm audit` → **1 moderate**: `@opentelemetry/core <2.8.0` (GHSA-8988-4f7v-96qf, W3C Baggage memory allocation) via `contentlayer2@0.4.6 → @contentlayer2/utils@0.4.3 → @effect-ts/otel@0.15.1`.

**Why NOT overridden**: `@effect-ts/otel@0.15.1` (abandoned — effect-ts deprecated) pins peer `@opentelemetry/core` to `^1.13.0`; the patched version requires `>=2.8.0` (2.x has breaking API changes). Upgrading `contentlayer2` to 0.5.8 does **not** help (still depends on `@effect-ts/otel@^0.15.1`). Forcing a 2.x override would break the peer contract and likely break the contentlayer2 build at runtime. The vulnerable path is build-time-only (contentlayer dev server tracing) and does not exercise W3C Baggage propagation in this app's usage. **Recommendation**: track upstream `contentlayer2` for a future release that drops `@effect-ts/otel`; do NOT force-override.

---

## Recommended Actions for Maintainer (with write access)

1. **Grant the automation token `issues: write` and `workflows: write`** (or use a PAT) so future loops can label/close/consolidate issues and push workflow fixes directly.
2. **Apply the #744 iterate.yml pnpm fix**: checkout `fix/744-pnpm-consistency-iterate` (commit `7c14cdd`, prepared loop 164) and push — validated (YAML + CI validator + full suite green).
3. **Bulk-close the 61 verified-resolved issues** using the matrix above (one pass, evidence included).
4. **Close #521** (hydration tests) — resolved by merged PR #1332; auto-close did not trigger on admin merge.
5. **Review PR #1335** (#590 component inventory) and merge.
6. **Re-scope #636** (ISR for dashboard) — per-user data must not be ISR-cached; rewrite as a per-user caching strategy (e.g., React `cache()` + Redis) or close as invalid.
7. **Do NOT merge stale branch** `fix/product-architect-issue-523-docs` (would regress `docs/Product-Architect.md`; carried from loop 159).

---

## Action Log

| Timestamp (UTC)   | Action                    | Target                                                     | Result                                                                             |
| ----------------- | ------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 2026-08-17 ~02:00 | Phase 0 entry check       | `gh pr list` / `gh issue list`                             | 0 PRs, 82 issues → ISSUE MANAGER MODE                                              |
| 2026-08-17 ~02:02 | Permission re-probe       | labels / comments / close / create / workflows             | All **403/blocked** (unchanged); push + PR creation work                           |
| 2026-08-17 ~02:05 | Normalization attempt     | 44 label operations across 39 issues                       | All **FAILED** (403) — script preserved                                            |
| 2026-08-17 ~02:10 | Baseline verification     | `pnpm install`, `pnpm test`, `pnpm typecheck`, `pnpm lint` | Install OK; **2124/2124 tests**, typecheck 9/9, lint 9/9                           |
| 2026-08-17 ~02:15 | Workflow push re-probe    | `iterate.yml` touch + push                                 | **REJECTED** (no `workflows` permission) — reverted                                |
| 2026-08-17 ~02:20 | Vulnerability audit       | `pnpm audit`                                               | 1 moderate (`@opentelemetry/core` via contentlayer2) — documented, not force-fixed |
| 2026-08-17 ~02:25 | 82-issue resolution audit | all open issues                                            | 61 resolved / 10 open / 11 blocked (matrix above)                                  |
| 2026-08-17 ~02:30 | REPAIR MODE #590          | `docs/ui-component-inventory.md`                           | Created (134 lines, stability tiers + corrected coverage)                          |
| 2026-08-17 ~02:32 | Push + PR                 | `docs/590-ui-component-inventory`                          | Pushed; **PR #1335** created (linked to #590)                                      |
| 2026-08-17 ~02:35 | Audit report              | `docs/issue-manager-audit-2026-08-17-loop165.md`           | Written                                                                            |

---

## Final State

- **State**: `waiting for human review`
- **Reason**: ISSUE MANAGER MODE — Steps 1–3 (normalization/dedup/consolidation) remain **blocked** by missing `issues: write` (re-probed). Step 4 (REPAIR MODE) executed: **#590 solved** via PR #1335 (UI component inventory with stability classification). Full 82-issue resolution matrix produced so the maintainer can bulk-close ~61 resolved issues in one pass. All P0/P1 issues verified resolved in code. Build/lint/test green (2124/2124). No destructive actions taken. No branches deleted. The single moderate vulnerability is documented with rationale for NOT force-overriding (dependency contract break risk).
