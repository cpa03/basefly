# Issue Manager Audit Report — 2026-08-16 (Loop 161)

## Executive Summary

- **Open PRs**: 0 at phase entry (verified via `gh pr list --state open --limit 5`)
- **Open issues**: 82 (verified via `gh issue list --state open --limit 100`)
- **Mode**: ISSUE MANAGER MODE (Phase 0 → Issue Manager, since open PRs = 0 and open issues > 0)
- **Token permissions re-probed** (unchanged from loops 159/160):
  - `issues: write` **NOT available** → label normalization, issue comments, and issue closing remain **BLOCKED** (probe: `gh issue create` → GraphQL 403 `createIssue`)
  - `workflows: write` **NOT available** → `.github/workflows/*` changes remain **BLOCKED**
  - `contents: write` + `pull-requests: write` **available** → branch push + PR creation possible
- **REPAIR MODE executed this loop**: Completed the **P0 RLS adoption at the router/service layer** (issue #483 remainder) flagged by loop 160. Every runtime operation against RLS-protected tables (`K8sClusterConfig`, `Customer`, `User`) now runs inside `rlsTransaction(db, userId, ...)`, which sets `SET LOCAL app.current_user_id` before executing. PR #1329 created.
- **Repository health verified by full execution** (Node v22.23.2, matching `.nvmrc` = `22.14.0`):
  - `pnpm typecheck` → 9/9 tasks pass
  - `pnpm lint` → 9/9 tasks pass, 0 warnings
  - `pnpm test` → 141 files, **2112 tests pass**
  - `pnpm build` → `@saasfly/nextjs` build succeeds (31.7s)
  - `pnpm check:circular` → exit 0, **"No circular dependency found!"**
- **No new issues** created (blocked by token); issue count stable at 82.

---

## STEP 1 — Issue Normalization (BLOCKED: no `issues: write`)

Re-probed this loop (`gh issue create --title "token-probe-loop161"` → `GraphQL: Resource not accessible by integration (createIssue)`). The automation token still **cannot** add labels, comment on, or close issues. **No change in capability.**

## STEP 2/3 — Duplicate & Consolidation (BLOCKED: no `issues: write`)

The semantic clusters from loop 155 remain valid. Closing/consolidation still blocked by token permissions. **No change.**

---

## STEP 4 — REPAIR MODE: P0 RLS adoption at the router/service layer (#483 remainder)

**Selection rationale**: Loop 160 resolved the webhook path of #483 and flagged a **P0 critical finding**: RLS is enabled in migration `20260131_add_row_level_security` (`K8sClusterConfig`, `Customer`, `User`), but **zero runtime call sites set `app.current_user_id`**. Once the migration deploys, all SELECTs return zero rows and all INSERT/UPDATEs fail RLS `WITH CHECK`. Loop 160's recommended action #1: "Apply the RLS session-context fix at the router/service layer (P0)". This loop executed exactly that.

### Fix implemented: RLS-aware transactions at every runtime call site

`rlsTransaction(db, userId, cb)` runs the callback inside `db.transaction()` after executing `SET LOCAL app.current_user_id = <userId>` — required because RLS policies evaluate `current_setting('app.current_user_id')` per-row and `SET LOCAL` only works inside a transaction block.

**`packages/db/soft-delete.ts`** — all 8 `SoftDeleteService` methods wrapped (covers `k8sClusterService` used by the k8s router):
`softDelete`, `restore`, `findActive`, `findAllActive`, `findDeleted`, `create`, `countActive`, `countDeleted`.

**`packages/api/src/router/k8s.ts`** — `updateCluster` direct `db.updateTable("K8sClusterConfig")` wrapped. (`getClusters`/`createCluster`/`deleteCluster`/`verifyClusterOwnership` are already covered via `k8sClusterService`.)

**`packages/api/src/router/customer.ts`** — `updateUserName` (User), `insertCustomer` (Customer), `queryCustomer` (Customer) wrapped.

**`packages/api/src/router/stripe.ts`** — `createSession` (parallel Customer + User reads) and `userPlans` (Customer read) wrapped. Also added a missing `userId` auth guard (mirrors `userPlans`), which the type checker required once `userId` was passed to `rlsTransaction`.

**`packages/api/src/router/auth.ts`** — `mySubscription` (Customer read) wrapped.

**`packages/api/src/trpc.ts`** — `isAdmin` and `requireRole` middleware `User` reads wrapped. **Critical**: without RLS context, `SELECT role FROM User WHERE id = ...` returns zero rows, so database-backed admin/RBAC checks silently fail (falls back to `ADMIN_EMAIL`, or FORBIDDEN for `requireRole`).

**`apps/nextjs`** — `lib/admin-access.ts` `isAdminUser` (User read) and the editor cluster page `getClusterForUser` (K8sClusterConfig read) wrapped.

**Test mocks** — added `rlsTransaction: (db, userId, cb) => cb(db)` passthrough to all `@saasfly/db` mocks (soft-delete, k8s-router, customer-router, stripe-router, admin, rbac, integration, hello, auth, edge, validation, admin-access) so existing query-chain assertions remain valid.

### Deliberately NOT wrapped (documented, needs elevated privileges)

- **`admin.ts` `getStats`** — cross-tenant aggregate counts. Wrapping with the admin's own `userId` would silently change semantics to self-only counts. The correct fix is a `BYPASSRLS` DB role (the migration notes already document elevated privileges for user deletion). **Do NOT deploy the RLS migration without addressing this.**
- **`user-deletion.ts`** — `deleteUser` performs `DELETE FROM User`/`Customer`; RLS has no DELETE policies on these tables. Migration notes: "User deletion service needs elevated privileges (RLS bypass)". DB-level fix required.
- **`seed.ts`** — dev-only script.

### Verification (Node v22.23.2 per `.nvmrc`)

| Check                                 | Result                     |
| ------------------------------------- | -------------------------- |
| `pnpm --filter @saasfly/db typecheck` | pass                       |
| `pnpm typecheck` (full)               | 9/9 tasks pass             |
| `pnpm lint` (full)                    | 9/9 tasks pass, 0 warnings |
| `pnpm test` (full)                    | 141 files, 2112 tests pass |
| `pnpm build`                          | `@saasfly/nextjs` 31.7s    |
| `pnpm check:circular`                 | exit 0, no circular deps   |

Note: `pnpm build` fails under the CI shell's default Node v20.20.2 (`webidl.util.markAsUncloneable is not a function` — Next.js 16 requires Node >= 22). Runs cleanly under the toolchain's Node v22.23.2, matching `.nvmrc`. Environmental, not a code regression.

---

## Issue Status Verification (carried from loop 160, no change)

| Issue | Title                                           | Status                                                                                                                                                            |
| ----- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #483  | Transaction handling for multi-table operations | **SUBSTANTIALLY RESOLVED** — webhook path (loop 160) + router/service layer (this loop). Remaining: admin `getStats` + user deletion need `BYPASSRLS` (DB-level). |
| #494  | Domain layer                                    | Genuinely open (no `domain/` dir)                                                                                                                                 |
| #668  | AI-Native cluster diagnostics                   | Genuinely open                                                                                                                                                    |

## Blocked by token permissions (unchanged)

| Issue                                       | Blocker                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| #305, #584, #595, #670, #744                | pnpm consistency in workflows — `workflows: write` missing |
| #522, #502, #728, #726, #488, #650          | workflow changes — `workflows: write` missing              |
| All 82 issues (labeling/commenting/closing) | `issues: write` missing                                    |

## Recommended Actions for Maintainer (with write access)

1. **Grant `BYPASSRLS` (or equivalent elevated role) to the app's admin DB connection** for `admin.ts getStats` and `user-deletion.ts`, OR add explicit admin-role RLS policies. Required before deploying migration `20260131_add_row_level_security`.
2. **Do not deploy migration `20260131_add_row_level_security`** until item 1 is addressed.
3. **Close the verified-resolved issues** (~70 issues now have documented evidence across loops 155–161).
4. **Grant the automation token `issues: write` and `workflows: write`** (or use a PAT) so future loops can label/close/consolidate directly.
5. **Do NOT merge stale branches** `fix/product-architect-issue-523-docs` (would regress `docs/Product-Architect.md`; carried from loop 159).

---

## Action Log

| Timestamp (UTC)   | Action                  | Target                                             | Result                                      |
| ----------------- | ----------------------- | -------------------------------------------------- | ------------------------------------------- |
| 2026-08-16 ~16:00 | Phase 0 entry check     | `gh pr list` / `gh issue list`                     | 0 PRs, 82 issues → ISSUE MANAGER MODE       |
| 2026-08-16 ~16:01 | Token permission probe  | `gh issue create`                                  | BLOCKED (`createIssue` GraphQL 403)         |
| 2026-08-16 ~16:05 | RLS gap re-verification | grep runtime call sites vs RLS tables              | Confirmed zero adopters (loop 160 finding)  |
| 2026-08-16 ~16:10 | Adopt `rlsTransaction`  | `packages/db/soft-delete.ts` (8 methods)           | All RLS-aware                               |
| 2026-08-16 ~16:11 | Adopt `rlsTransaction`  | `k8s.ts` / `customer.ts` / `stripe.ts` / `auth.ts` | All RLS-aware                               |
| 2026-08-16 ~16:12 | Adopt `rlsTransaction`  | `trpc.ts` isAdmin + requireRole                    | Middleware User reads RLS-aware             |
| 2026-08-16 ~16:13 | Adopt `rlsTransaction`  | `apps/nextjs` admin-access.ts + editor page        | RLS-aware                                   |
| 2026-08-16 ~16:14 | Update test mocks       | 12 test files (`@saasfly/db` mocks)                | Passthrough added                           |
| 2026-08-16 ~16:20 | Full verification       | typecheck / lint / test / build / circular         | 9/9, 9/9, 2112 tests, build ok, no circular |
| 2026-08-16 ~16:25 | Branch + PR             | `fix/483-rls-router-service-adoption` → PR #1329   | Created, linked to #483                     |
| 2026-08-16 ~16:30 | Audit report            | `docs/issue-manager-audit-2026-08-16-loop161.md`   | Written                                     |

---

## Final State

- **State**: `waiting for human review`
- **Reason**: REPAIR MODE executed for the P0 RLS gap (#483 remainder) with all checks green on Node 22.23.2; PR #1329 created and mergeable (CI checks pending completion at report time). Issue lifecycle actions (label/close/comment) remain blocked by token permissions (re-probed). Admin `getStats` + user-deletion still require DB-level `BYPASSRLS` — documented for maintainer. No destructive actions. No branches deleted. No issues modified (token lacks permission).
