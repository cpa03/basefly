# Issue Manager Audit Report — 2026-08-10 (loop 79)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `f13c155` at start)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: 0 open PRs, 82 open issues)

## Decision Summary

- Step 0.1 (open PRs): **0 open PRs** → PR Handler Mode skipped.
- Step 0.2 (open issues): **82 open issues** → Issue Manager Mode entered.
- Steps 1–3 (normalization / duplicate detection / consolidation): **token-blocked** — probed this session: `gh issue create` → 403, `gh issue close` → 403 (`closeIssue`), `gh issue edit --add-label` → 403 (`addLabelsToLabelable`), issue comment POST → 403. Root cause identified: this runner is spawned by `on-pull.yml` whose `permissions` block grants `contents` + `pull-requests` only — **no `issues: write`** (only `iterate.yml` declares `issues: write`). No issue mutations are possible with this token. Same constraint as loops 74–78.
- Step 4 (Repair Mode): **executed** — solved **Issue #515** ([P1][Security] CSRF protection) via PR #1208. This was the highest-priority P0/P1 issue with genuine actionable work remaining (all other P0/P1 issues verified resolved — see below).

## Steps 1–3 Findings (documented for closure once token has `issues: write`)

### Verified-resolved issues — evidence gathered this session (extends loops 77–78's 61)

| Issue | Claim                                                       | Verification (this session, against `origin/main`)                                                                                                                                                                                                              |
| ----- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496  | Replace in-memory rate limiter with distributed Redis store | resolved — `packages/api/src/distributed-rate-limiter.ts` (`DistributedRateLimiter`, Redis sliding-window via sorted-set pipeline, `SyncRateLimiter` in-memory fallback) wired into `trpc.ts` (`limiter.checkAsync`), tests `distributed-rate-limiter*.test.ts` |
| #480  | Redis rate limiter (dup of #496)                            | resolved — same implementation as #496                                                                                                                                                                                                                          |
| #498  | Email-based admin RBAC → role-based                         | resolved — `requireRole`/`createRoleBasedProcedure` in `trpc.ts`, DB `User.role` check with email fallback, page guards `apps/nextjs/src/lib/admin-access.ts`, tests `rbac.test.ts`/`authorization.test.ts`                                                     |
| #721  | Explicit authorization checks (dup of #498)                 | resolved — same RBAC implementation as #498                                                                                                                                                                                                                     |
| #500  | Clerk auth flow tests                                       | resolved — `packages/auth/clerk.test.ts` (30 tests: `isClerkEnabled`, `getSessionUser`, `getCurrentUser`, `authOptions`) + `env.test.ts` (6 tests)                                                                                                              |
| #549  | Tests for packages/auth (dup of #500)                       | resolved — same test files as #500                                                                                                                                                                                                                              |
| #550  | Include apps/nextjs in coverage config                      | resolved — `vitest.config.ts` include: `apps/nextjs/src/**/*.{ts,tsx}`                                                                                                                                                                                          |
| #551  | Tests for k8s router                                        | resolved — `packages/api/src/router/k8s.test.ts` + `k8s-router.test.ts`                                                                                                                                                                                         |
| #631  | API router tests (k8s/customer/stripe)                      | resolved — `k8s.test.ts`, `customer.test.ts`, `stripe.test.ts` all exist                                                                                                                                                                                        |
| #725  | Integration tests for API routers                           | resolved — `packages/api/src/router/integration.test.ts`                                                                                                                                                                                                        |
| #501  | Playwright E2E critical journeys                            | resolved — `playwright.config.ts` + `tests/e2e/` (12 specs: auth, admin, billing, cluster, dashboard, pricing, home, critical-flows, authorization-bypass, …)                                                                                                   |
| #628  | E2E testing with Playwright (dup of #501)                   | resolved — same E2E suite as #501                                                                                                                                                                                                                               |
| #724  | Missing E2E coverage for critical flows                     | resolved — coverage now includes billing, cluster lifecycle, authorization-bypass specs                                                                                                                                                                         |
| #713  | Unit tests for packages/common                              | resolved — `email.test.ts`, `icon-sizes.test.ts`, `animation.test.ts` exist                                                                                                                                                                                     |
| #754  | Stripe webhook idempotency tests                            | resolved — `packages/stripe/src/webhook-idempotency.test.ts`                                                                                                                                                                                                    |
| #787  | Unit tests for packages/db                                  | resolved — `migrations.test.ts`, `db-instance.test.ts`, `soft-delete.test.ts`, `user-deletion.test.ts`                                                                                                                                                          |
| #788  | Unit tests for UI components in apps/nextjs                 | resolved — `navbar.test.tsx`, `cluster-create-button.test.tsx`, `dashboard-skeleton.test.tsx`                                                                                                                                                                   |
| #486  | Server-side observability (OpenTelemetry)                   | resolved — `apps/nextjs/src/instrumentation.ts` (`initializeTelemetry` from `@saasfly/common/observability`, comment references issue #486)                                                                                                                     |
| #580  | Monitoring/logging infrastructure (dup of #486)             | resolved — same observability stack as #486                                                                                                                                                                                                                     |
| #688  | Next.js middleware.ts                                       | resolved — middleware exists as `apps/nextjs/src/proxy.ts` (Next.js 16 proxy/middleware) with matcher, security headers, CSRF + Clerk handling                                                                                                                  |
| #611  | not-found.tsx custom 404 pages                              | resolved — `not-found.tsx` present in root, `(auth)`, `(docs)`, `(dashboard)`, `(marketing)`, `(editor)` route groups                                                                                                                                           |
| #613  | Remove duplicate workflow paratterate.yml                   | resolved — `.github/workflows/` contains only `iterate.yml` + `on-pull.yml`                                                                                                                                                                                     |
| #666  | Global error boundary                                       | resolved — `apps/nextjs/src/app/global-error.tsx` + `error.tsx` exist                                                                                                                                                                                           |
| #630  | Pre-commit hooks with typecheck/test                        | resolved — `.husky/pre-commit` runs `pnpm typecheck && pnpm test && pnpm lint-staged`                                                                                                                                                                           |
| #634  | TypeScript strictness                                       | resolved — `tooling/typescript-config/base.json` has `strict: true`, `noUncheckedIndexedAccess`                                                                                                                                                                 |
| #719  | Root-level tsconfig                                         | resolved — `tsconfig.json` at repository root                                                                                                                                                                                                                   |
| #722  | Env var validation at startup                               | resolved — `env:validate` in root build chain, `initEnvValidation()` in `instrumentation.ts`                                                                                                                                                                    |
| #579  | Env setup error messages                                    | resolved — `dx:setup`/`env:validate` scripts, `.nvmrc`, Docker path documented                                                                                                                                                                                  |
| #705  | Docker configuration                                        | resolved — `Dockerfile` + `docker-compose.yml` exist, README documents deployment                                                                                                                                                                               |
| #706  | VS Code Dev Containers                                      | resolved — `.devcontainer/devcontainer.json` exists                                                                                                                                                                                                             |
| #720  | Missing .nvmrc (dup of #748)                                | resolved — `.nvmrc` exists with `22.14.0`                                                                                                                                                                                                                       |
| #748  | .nvmrc invalid value '20'                                   | resolved — `.nvmrc` now contains valid `22.14.0`                                                                                                                                                                                                                |
| #785  | Duplicate `next` in packages/stripe/package.json            | resolved — no `next` key remains in `packages/stripe/package.json`                                                                                                                                                                                              |
| #786  | Stripe webhook logs partial secret                          | resolved — webhook moved to `apps/nextjs/src/app/api/webhooks/stripe/route.ts`, uses non-secret identifier `"stripe-webhook"`, no secret material logged                                                                                                        |
| #664  | console.\* → pino                                           | resolved — only JSDoc-comment examples remain in the previously listed files                                                                                                                                                                                    |
| #752  | Unified CLI output utilities (dup of #664)                  | resolved — pino logger adopted across packages                                                                                                                                                                                                                  |
| #789  | peerDependencies for React in packages/ui                   | resolved — `react`/`react-dom`/`next` in `peerDependencies`                                                                                                                                                                                                     |
| #492  | Image `sizes` attribute                                     | resolved — merged PR #1204 (`fix/image-sizes-492-loop77`)                                                                                                                                                                                                       |
| #488  | Circular dependency detection                               | resolved — merged PR #1206 (`fix/circular-detection-ci-488`), loop 78                                                                                                                                                                                           |

### Duplicate issues to close (canonical still open → needs label + dup-close action)

| Closed-as-dup          | Canonical (open)             | Reason                                                                                                      |
| ---------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| #584, #595, #670, #744 | #305 (pnpm CI consistency)   | identical pnpm/npm workflow fixes; `iterate.yml` lines 72/342 still `npm ci` → canonical remains actionable |
| #749                   | #731 (AI-generated API docs) | #749 (AI API testing + docs) is a superset; scope merged into #731                                          |
| #753                   | #751 (code splitting)        | both bundle-size code splitting (tRPC routers vs dashboard routes)                                          |

### Label normalization plan (blocked, ready to apply)

All 82 open issues mapped to exactly-one canonical category (`bug|enhancement|feature|docs|refactor|chore|test|ci|security`) + exactly-one priority (`P0–P3`). Notable assignments: #496→`security,P0`, #515→`security,P1`, #632→`security,P1`, #728→`security,P1`, #697→`docs,P3`, #748→`chore,P3`, #305→`ci,P2`, #613→`ci,P2`. Script: `/tmp/opencode/normalize.py` (produced 52/52 label mutations → all rejected with 403 by the token).

### Remaining open issues after this loop (37)

#305 (pnpm CI — **workflow-blocked**, needs `workflows: write`), #483 (partially resolved — webhook transactions done, router paths outstanding), #485, #487 (resolved per loop 78 — needs closure), #494, #502, #503, #515 (now resolved via PR #1208), #521, #522, #523 (resolved per loop 78 — needs closure), #578 (resolved per loop 78 — needs closure), #581, #590, #609, #610, #632, #635 (resolved per loop 78 — needs closure), #636, #650, #663, #667, #668, #683, #684 (resolved per loop 78 — needs closure), #685, #687, #697, #708 (resolved per loop 78 — needs closure), #723, #726, #727, #728, #729 (resolved per loop 78 — needs closure), #731, #751, #755.

## Repair Target Selection

Selection rule: P0/P1 issue with genuine actionable work → **Issue #515** ([P1][Security] Add CSRF protection) is the highest-priority P0/P1 remaining after verification (all other P0/P1s — #496, #498, #500, #501, #549, #550, #551, #721, #724, #786 — are implemented and documented above).

- Gap analysis: `apps/nextjs/src/proxy.ts` (middleware) validates Origin for page routes but **explicitly skips `/api/*` and `/trpc/*`** (`isApiRoute`) because server-to-server clients (Stripe webhooks) send no Origin. The tRPC edge route — the primary state-changing API surface — therefore had no CSRF defense beyond Clerk's `SameSite=Lax` cookies.

## Implementation — Issue #515 (PR #1208, DELIVERED)

- **`apps/nextjs/src/lib/csrf.ts`** (new): `validateCSRF()` — OWASP Origin-verification:
  - Only `POST` (state-changing) requests checked; GET/HEAD/OPTIONS pass.
  - Requests without an Origin header (curl, server-to-server) pass — browsers always attach Origin to cross-site POSTs.
  - Origin must match request `Host` or `NEXT_PUBLIC_APP_URL`; malformed Origin rejected.
  - `CSRF_ALLOWED_ORIGINS` (comma-separated) allow-list for legitimate cross-origin consumers.
- **`apps/nextjs/src/app/api/trpc/edge/[trpc]/route.ts`**: guard runs before auth/business logic; rejects mismatched origins with `403 { error: "CSRF validation failed" }` + warning log.
- **`apps/nextjs/src/lib/csrf.test.ts`** (new): 10 unit tests (same-origin allow, cross-origin reject, malformed Origin, no-Origin allow, allow-list, Host matching, multi-origin allow-list).

## Verification

- `pnpm test`: **1703 passed (94 files)** — including the 10 new CSRF tests.
- ESLint + Prettier: clean on all changed files.
- `tsc --noEmit` (apps/nextjs): **zero new errors** — 57 pre-existing errors on `main`, identical before/after this change (verified via stash) and unrelated (contentlayer generated types, locale unions, pre-existing logger call-sites).
- PR: https://github.com/cpa03/basefly/pull/1208 (labels: `security`, `P1`; body references #515 for auto-close on merge).

## Final State

**waiting for human review** — PR #1208 open for review/merge. Issue normalization + closure of 45 verified-resolved/duplicate issues is fully documented above but **blocked on token `issues: write`** (runner spawned by `on-pull.yml`; only `iterate.yml` grants issue permissions). Recommend running the next loop from `iterate.yml` (push/schedule) to apply Steps 1–3.
