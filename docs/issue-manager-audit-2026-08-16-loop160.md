# Issue Manager Audit Report — 2026-08-16 (Loop 160)

## Executive Summary

- **Open PRs**: 0 (verified via `gh pr list --state open --limit 5`)
- **Open issues**: 82 (verified via `gh issue list --state open --limit 100`)
- **Mode**: ISSUE MANAGER MODE (Phase 0 → Issue Manager, since open PRs = 0 and open issues > 0)
- **Token permissions re-probed** (unchanged from loop 159):
  - `issues: write` **NOT available** → label normalization, issue comments, and issue closing remain **BLOCKED** (probe: `gh issue create` → GraphQL 403 `createIssue`)
  - `workflows: write` **NOT available** → `.github/workflows/*` changes remain **BLOCKED**
  - `contents: write` + `pull-requests: write` **available** → branch push + PR creation possible
- **REPAIR MODE executed this loop**: Adopted `rlsTransaction` in `packages/stripe/src/webhooks.ts` (issue #483, item 3) — the first runtime adoption of the RLS-aware transaction infrastructure.
- **NEW CRITICAL FINDING**: RLS is enabled in migration `20260131_add_row_level_security` (K8sClusterConfig, Customer, User tables), but **no runtime code sets `app.current_user_id`** — the app breaks once that migration is deployed (all SELECTs return empty, all INSERTs fail RLS `WITH CHECK`).
- **Repository health verified by full execution**:
  - `pnpm typecheck` → 9/9 tasks pass
  - `pnpm lint` → 9/9 tasks pass, 0 warnings
  - `pnpm test` → 141 files, **2112 tests pass**
  - `pnpm check:circular` → exit 0, **"No circular dependency found!"**
- **No new issues** created (blocked by token); issue count stable at 82.

---

## STEP 1 — Issue Normalization (BLOCKED: no `issues: write`)

Re-probed this loop (`gh issue create` → `GraphQL: Resource not accessible by integration (createIssue)`). The automation token still **cannot** add labels, comment on, or close issues. **No change in capability.**

## STEP 2/3 — Duplicate & Consolidation (BLOCKED: no `issues: write`)

The semantic clusters from loop 155 remain valid. Closing/consolidation still blocked by token permissions. **No change.**

---

## STEP 4 — REPAIR MODE: Issue #483 (transaction handling, P2)

**Selection rationale**: All P0/P1 issues verified resolved in code (see below). #483 is the highest-priority genuinely-open issue with a concrete, minimal fix path: the `rlsTransaction` infrastructure (built + tested in prior loops) had **zero runtime adopters**.

### Fix implemented: RLS-aware webhook transactions

`packages/stripe/src/webhooks.ts`:

- `handleCheckoutSessionCompleted` and `handleInvoicePaymentSucceeded` previously used `db.transaction().execute(...)` — a plain transaction that **does not set the RLS session variable**.
- Replaced both with `rlsTransaction(db, userId, ...)`, which executes `SET LOCAL app.current_user_id = <userId>` inside the transaction before running the callback.
- **Why this matters**: the `Customer` table has RLS enabled (`customers_select_own` / `customers_update_own` policies keyed on `current_setting('app.current_user_id')`). Without the session variable, the `SELECT` inside the transaction returns **zero rows** and the subscription update is **silently skipped** once RLS is active.
- `handleEvent` signature unchanged → no consumer breakage (`apps/nextjs/src/app/api/webhooks/stripe/route.ts` unaffected).

`packages/stripe/src/webhooks.test.ts`:

- Mock updated: `rlsTransaction` added to the `@saasfly/db` mock (invokes callback with the mocked `db`).
- Transaction-atomicity test now asserts `rlsTransaction` is called with `(db, "user_123", expect.any(Function))` — verifying the RLS context is keyed to the webhook's resolved `userId`.

### Verification

| Check                                                  | Result                     |
| ------------------------------------------------------ | -------------------------- |
| `pnpm --filter @saasfly/stripe typecheck`              | pass                       |
| `pnpm --filter @saasfly/stripe lint`                   | pass, 0 warnings           |
| `pnpm vitest run packages/stripe/src/webhooks.test.ts` | 12/12 pass                 |
| `pnpm typecheck` (full)                                | 9/9 tasks pass             |
| `pnpm lint` (full)                                     | 9/9 tasks pass, 0 warnings |
| `pnpm test` (full)                                     | 141 files, 2112 tests pass |
| `pnpm check:circular`                                  | exit 0, no circular deps   |

---

## NEW CRITICAL FINDING — RLS enabled but session context never set at runtime

**Severity**: P0 (production-breaking once migration `20260131_add_row_level_security` is deployed)

**Evidence**:

- `packages/db/prisma/migrations/20260131_add_row_level_security/migration.sql` enables `ROW LEVEL SECURITY` on `K8sClusterConfig`, `Customer`, and `User`, with policies referencing `current_setting('app.current_user_id', true)`.
- `grep -rn "setRlsSession|rlsTransaction|createRlsHelper" apps/ packages/` (excluding tests + the middleware itself) → **only the export statement in `packages/db/index.ts`** matches. Zero runtime call sites.
- `packages/db/db-instance.ts` exports a plain `createKysely<DB>()` — no session handling.
- `packages/api/src/trpc.ts` `createTRPCContext` sets `userId` but never calls `setRlsSession`.
- Routers (`k8s.ts`, `customer.ts`, `stripe.ts`) and services (`soft-delete.ts`) query the RLS-protected tables via the global `db` without RLS context.

**Impact** (after the RLS migration is applied to a deployed database):

- `SELECT` on `K8sClusterConfig`/`Customer`/`User` → returns **zero rows** (`'' = authUserId` is NULL → filtered).
- `INSERT` (e.g. `createCluster`, `insertCustomer`) → **errors** with RLS violation (`WITH CHECK` fails).
- `UPDATE` (e.g. `updateUserName`, `updateCluster`) → affects **zero rows** silently.
- `getClusters` → silently returns `[]`; Stripe billing flow treats all users as FREE.

**This loop's fix** addresses the webhook path (Customer updates in `checkout.session.completed` / `invoice.payment_succeeded`). The router/service path remains open — see Recommended Actions #4.

---

## P1 Issue Verification (new this loop)

| Issue | Title                                     | Status                 | Evidence                                                                                                                                                                                                 |
| ----- | ----------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #500  | Add Clerk authentication flow tests       | **PARTIALLY RESOLVED** | `apps/nextjs/src/utils/clerk.test.ts` + `tests/e2e/auth.spec.ts` exist; dedicated auth-flow unit coverage of the API layer not confirmed                                                                 |
| #501  | Implement Playwright E2E tests            | **RESOLVED**           | `playwright.config.ts` + `tests/e2e/` with 12 spec files (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) |
| #549  | Add tests for packages/auth (0% coverage) | **RESOLVED**           | `packages/auth/env.test.ts` + `packages/auth/clerk.test.ts` present                                                                                                                                      |
| #551  | Add tests for k8s router                  | **RESOLVED**           | `packages/api/src/router/k8s.test.ts` + `k8s-router.test.ts` present                                                                                                                                     |
| #581  | Consolidate testing infrastructure        | **RESOLVED**           | Root `vitest.config.ts` with coverage includes, `test:e2e` scripts, 141 test files / 2112 tests green                                                                                                    |

---

## Re-verified Resolved-but-open Issues (carried from loop 159, spot-checked)

| Issue     | Evidence                                                       |
| --------- | -------------------------------------------------------------- |
| #496/#480 | `packages/api/src/distributed-rate-limiter.ts` + tests present |
| #515      | `apps/nextjs/src/lib/csrf.ts` present                          |
| #722      | `tooling/qa/env-validate.js` present                           |
| #721/#498 | `packages/api/src/authorization.ts` + `rbac.test.ts` present   |
| #611      | `not-found.tsx` present in route groups                        |
| #785      | `packages/stripe/package.json`: no `next` dependency           |
| #786      | No secret-logging in `packages/stripe/src/webhook*`            |
| #719      | Root `tsconfig.json` present, strict                           |
| #487      | `packages/common/src/cache/` present                           |
| #486      | `apps/nextjs/src/instrumentation.ts` present                   |
| #492      | `sizes=` attributes in blog-posts/site-footer/sign-in-modal    |
| #503      | JSDoc in `packages/api/src/router/{admin,auth}.ts`             |
| #685      | `useMemo`/`memo`/`useCallback` in `packages/ui/src`            |
| #753      | `dynamic()` code splitting in `cluster-list.tsx`               |
| #667      | `docs/export-boundaries.md` present                            |
| #684      | Root `"build": "pnpm env:validate && turbo build"`             |
| #550      | vitest coverage includes `apps/nextjs/src/**/*`                |

## Genuinely Open Issues (verified NOT resolved)

| Issue | Title                                      | Status                                                                                                                                                   |
| ----- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #494  | [Architecture] Introduce domain layer      | No `domain/` directory in `packages/api/src/`                                                                                                            |
| #668  | [Innovation] AI-Native cluster diagnostics | No diagnostics module; no merged commit                                                                                                                  |
| #483  | [backend] Transaction handling             | **PARTIALLY RESOLVED this loop**: webhook path adopted (`rlsTransaction`); router path (k8s/customer/stripe) + webhook-event table atomicity remain open |

## Blocked by token permissions (unchanged)

| Issue                                       | Blocker                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| #305, #584, #595, #670, #744                | pnpm consistency in workflows — `workflows: write` missing |
| #522, #502, #728, #726, #488, #650          | workflow changes — `workflows: write` missing              |
| All 82 issues (labeling/commenting/closing) | `issues: write` missing                                    |

---

## Recommended Actions for Maintainer (with write access)

1. **Apply the RLS session-context fix at the router/service layer** (P0): every operation against RLS-protected tables must run inside `rlsTransaction` (or set the session variable transaction-scoped). Candidates: `k8s.ts` (getClusters/createCluster/updateCluster/deleteCluster), `customer.ts` (insertCustomer/queryCustomer/updateUserName), `stripe.ts` (createSession reads), `soft-delete.ts` service methods. Note `setRlsSession` uses `SET LOCAL` and is therefore only effective inside a transaction — do NOT set it on the pooled connection per-request.
2. **Do not deploy migration `20260131_add_row_level_security`** until the router/service layer adoption (item 1) is complete.
3. **Close the verified-resolved issues** (loop 155/157/158/159 tables + this loop's spot-checks). ~70 issues now have documented evidence.
4. **#483 remainder**: wrap the Stripe webhook-event registration + customer update in a single atomic unit (currently `registerWebhookEvent` and the customer update are separate), and adopt `rlsTransaction` in the k8s/customer router mutations.
5. **Grant the automation token `issues: write` and `workflows: write`** (or use a PAT) so future loops can label/close/consolidate directly.
6. **Do NOT merge `fix/product-architect-issue-523-docs`** — stale branch that would regress `docs/Product-Architect.md` (carried from loop 159).

---

## Action Log

| Timestamp (UTC)   | Action                 | Target                                           | Result                                 |
| ----------------- | ---------------------- | ------------------------------------------------ | -------------------------------------- |
| 2026-08-16 ~15:10 | Phase 0 entry check    | `gh pr list` / `gh issue list`                   | 0 PRs, 82 issues → ISSUE MANAGER MODE  |
| 2026-08-16 ~15:11 | Token permission probe | `gh issue create`                                | BLOCKED (`createIssue` GraphQL 403)    |
| 2026-08-16 ~15:12 | P1 issue verification  | #500/#501/#549/#551/#581                         | 4 resolved, 1 partial (files verified) |
| 2026-08-16 ~15:13 | RLS gap analysis       | migrations + runtime grep                        | CRITICAL: session context never set    |
| 2026-08-16 ~15:14 | Adopt `rlsTransaction` | `packages/stripe/src/webhooks.ts`                | 2 transaction blocks RLS-aware         |
| 2026-08-16 ~15:15 | Update tests           | `packages/stripe/src/webhooks.test.ts`           | mock + assertions updated              |
| 2026-08-16 ~15:16 | Full verification      | typecheck/lint/test/circular                     | 9/9, 9/9, 2112 tests, no circular      |
| 2026-08-16 ~15:17 | Audit report           | `docs/issue-manager-audit-2026-08-16-loop160.md` | written                                |

---

## Final State

- **State**: `waiting for human review`
- **Reason**: REPAIR MODE executed for #483 (webhook path) with all checks green; PR created. The critical RLS router/service gap (#483 remainder + new P0 finding) requires maintainer direction on scope (touches the shared `SoftDeleteService` API). Issue lifecycle actions (label/close/comment) remain blocked by token permissions (re-probed). Full health check executed and green.
- **Actions taken**: Full build/test/lint/typecheck/circular execution; live token permission probes; P1 issue verification; RLS gap analysis; #483 webhook-path adoption (`rlsTransaction`); tests updated; audit report written. No issues modified (token lacks permission). No destructive actions. No branches deleted.
