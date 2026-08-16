# Issue Manager Audit Report — 2026-08-16 (Loop 162)

## Executive Summary

- **Open PRs**: 0 at phase entry (verified via `gh pr list --state open --limit 5`)
- **Open issues**: 82 (verified via `gh issue list --state open --limit 100`)
- **Mode**: ISSUE MANAGER MODE (Phase 0 → Issue Manager, since open PRs = 0 and open issues > 0)
- **Token permissions re-probed** (unchanged from loop 161):
  - `issues: write` **NOT available** → label normalization, issue comments, and issue closing remain **BLOCKED** (probe: `gh issue create` → GraphQL 403 `createIssue`)
  - `workflows: write` **NOT available** → `.github/workflows/*` changes remain **BLOCKED**
  - `contents: write` + `pull-requests: write` **available** → branch push + PR creation possible
- **REPAIR MODE executed this loop**: Resolved the **user-deletion half of the RLS deployment blocker** (issue #483 remainder, documented P0 risk in loops 160/161). Added self-service RLS DELETE policies to the pending migration and made `UserDeletionService` RLS-aware. PR #1330 created.
- **NEW VERIFICATION THIS LOOP**: Confirmed the `rateLimit` middleware calls `await limiter.checkAsync()` (Redis-backed path) — **#496/#480 (P0/P1 Redis rate limiter) genuinely resolved in code**, not just file-presence (prior loops only spot-checked file existence). Also verified #500 (auth tests, 90% coverage), #683, #687, #697, #706, #708, #713, #725, #729, #731, #752, #754, #755, #787, #788, #789 all resolved.
- **Repository health verified by full execution** (Node v22.23.2 via nvm, matching `.nvmrc` = `22.14.0`):
  - `pnpm typecheck` → 9/9 tasks pass
  - `pnpm lint` → 9/9 tasks pass, 0 warnings
  - `pnpm test` → 141 files, **2113 tests pass** (was 2112; +1 new migration test)
  - `pnpm build` → `@saasfly/nextjs` build succeeds (29.3s)
  - `pnpm check:circular` → exit 0, **"No circular dependency found!"**
- **No new issues** created (blocked by token); issue count stable at 82.

---

## STEP 1 — Issue Normalization (BLOCKED: no `issues: write`)

Re-probed this loop (`gh issue create --title "token-probe-loop162"` → `GraphQL: Resource not accessible by integration (createIssue)`). The automation token still **cannot** add labels, comment on, or close issues. **No change in capability.**

## STEP 2/3 — Duplicate & Consolidation (BLOCKED: no `issues: write`)

The semantic clusters from loop 155 remain valid. Closing/consolidation still blocked by token permissions. **No change.**

---

## STEP 4 — REPAIR MODE: RLS deployment blocker — user-deletion path (#483 remainder)

**Selection rationale**: All P0/P1 issues verified resolved in code (see verification table below). The highest-risk genuinely-open item is the **RLS deployment blocker** documented in loops 160/161: migration `20260131_add_row_level_security` cannot be deployed because (a) `user-deletion.ts` performs `DELETE` on `Customer`/`User` with **no RLS DELETE policies** (silently deletes 0 rows under RLS), and (b) admin `getStats` aggregates need elevated privileges. Item (a) is fixable at the code level — this loop fixed it.

### Fix implemented: self-service RLS DELETE policies + RLS-aware UserDeletionService

**`packages/db/prisma/migrations/20260131_add_row_level_security/migration.sql`** (pending, not yet deployed — safe to modify):

- **`customers_delete_own`** — `FOR DELETE USING ("authUserId" = current_setting('app.current_user_id', true)::text)`: users can delete their own Customer row only.
- **`users_delete_own`** — `FOR DELETE USING ("id" = current_setting('app.current_user_id', true)::text)`: users can delete their own User record only.
- Migration notes updated: self-service deletion no longer requires RLS bypass; admin cross-tenant aggregates still require an elevated role (documented).

**`packages/db/user-deletion.ts`** — all three methods now run inside `rlsTransaction(db, userId, ...)` so `app.current_user_id` is set before queries (previously plain `db.transaction()` / direct `db`):

- `deleteUser` — soft-delete clusters + DELETE Customer + DELETE User (single RLS-aware transaction)
- `softDeleteUser` — soft-delete clusters + anonymize email (single RLS-aware transaction)
- `getUserSummary` — User/Customer/cluster reads wrapped (3 RLS-aware transactions)

**Tests**:

- `packages/db/migrations.test.ts` — new test asserts `customers_delete_own` + `users_delete_own` DELETE policies exist with `current_setting('app.current_user_id')` scoping.
- `packages/db/user-deletion.test.ts` — `rls-middleware` passthrough mock added; all 21 existing assertions preserved.

### Empirical verification (PostgreSQL 16.15 in Docker, non-superuser role `app_user`)

Full RLS scenario mirroring the migration + new policies, with `app.current_user_id = 'user_123'`:

| Scenario                           | Result                            |
| ---------------------------------- | --------------------------------- |
| SELECT own Customer row            | 1 row ✓ (RLS filtering works)     |
| DELETE own Customer row            | DELETE 1 ✓                        |
| DELETE another user's Customer row | DELETE 0 ✓ (cross-tenant blocked) |
| DELETE own User row                | DELETE 1 ✓                        |
| DELETE another user's User row     | DELETE 0 ✓ (cross-tenant blocked) |

Also verified the existing `users_select_own`/`users_update_own` policies are valid SQL (`User.id` is TEXT, not uuid — `text = text` comparison works; a `uuid = text` pattern would error, but that does not apply here).

### Verification (Node v22.23.2 per `.nvmrc`)

| Check                                 | Result                     |
| ------------------------------------- | -------------------------- |
| `pnpm --filter @saasfly/db typecheck` | pass                       |
| `pnpm --filter @saasfly/db lint`      | pass, 0 warnings           |
| `pnpm typecheck` (full)               | 9/9 tasks pass             |
| `pnpm lint` (full)                    | 9/9 tasks pass, 0 warnings |
| `pnpm test` (full)                    | 141 files, 2113 tests pass |
| `pnpm build`                          | `@saasfly/nextjs` 29.3s    |
| `pnpm check:circular`                 | exit 0, no circular deps   |

Note: `pnpm build` fails under the CI shell's default Node v20.20.2 (`webidl.util.markAsUncloneable is not a function` — Next.js 16 requires Node >= 22). Runs cleanly under Node v22.23.2, matching `.nvmrc`. Environmental, not a code regression.

---

## P0/P1 Issue Verification (this loop — deeper than prior loops)

| Issue               | Title                      | Status       | Evidence                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | -------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496/#480           | Redis rate limiter (P0/P1) | **RESOLVED** | `trpc.ts` rateLimit middleware imports `getLimiter` from `./distributed-rate-limiter` and calls `await limiter.checkAsync(identifier)` (line 439) — the Redis-backed path via `SyncRateLimiter` (uses ioredis when `REDIS_URL` configured, falls back to in-memory). Prior loops only verified file existence; this loop verified the **runtime wiring**. |
| #500                | Clerk auth flow tests (P1) | **RESOLVED** | `packages/auth/clerk.test.ts` (isClerkEnabled 6 tests, getSessionUser 7 tests incl. admin + error paths), `env.test.ts`, `apps/nextjs/src/utils/clerk.test.ts`, `packages/api/src/router/auth.test.ts`, `tests/e2e/auth.spec.ts`. Coverage run: **90% stmts / 100% branch / 100% funcs** for auth package (acceptance: >80%).                             |
| #498/#721           | RBAC / authorization (P1)  | **RESOLVED** | `packages/api/src/authorization.ts` + `rbac.test.ts` (carried from loop 160).                                                                                                                                                                                                                                                                             |
| #515                | CSRF (P1)                  | **RESOLVED** | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` (carried).                                                                                                                                                                                                                                                                                                 |
| #501/#549/#551/#581 | Testing infra (P1)         | **RESOLVED** | Playwright 12 e2e specs; `packages/auth/*.test.ts`; `k8s-router.test.ts`; root vitest config (carried).                                                                                                                                                                                                                                                   |

## Additional issue verification (new this loop)

| Issue     | Title                                 | Status   | Evidence                                                                                                                                         |
| --------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| #683      | ESLint/Prettier monorepo config       | RESOLVED | Root `.eslintrc.cjs` extends `./tooling/eslint-config/base.js`; consistent `lint` scripts; `.husky/pre-commit` runs lint-staged; turbo pipeline. |
| #687      | Barrel exports                        | RESOLVED | All 6 packages have `index.ts` (src/index.ts or root).                                                                                           |
| #697      | Corrupted docs                        | RESOLVED | Fixed via PR #850 (documented in issue-audit-2026-06-26).                                                                                        |
| #706      | Dev Containers                        | RESOLVED | Root `devcontainer.json` present.                                                                                                                |
| #708      | Bundle analyzer                       | RESOLVED | `@next/bundle-analyzer` in apps/nextjs devDeps.                                                                                                  |
| #713      | packages/common tests                 | RESOLVED | 28 test files in packages/common.                                                                                                                |
| #725      | API router integration tests          | RESOLVED | 12 router test files (admin, auth, customer, hello, integration, k8s, stripe, validation, schemas).                                              |
| #729      | Bundle size regression testing        | RESOLVED | `size-limit` with 4 budgets (Client JS 450kB, CSS 120kB, Framework 300kB, Media 200kB) wired via turbo `size:check`.                             |
| #731/#749 | API docs generator                    | RESOLVED | `docs-generator.ts` + `openapi.ts` in packages/api/src.                                                                                          |
| #752      | CLI output utilities                  | RESOLVED | `tooling/qa/cli-output.js` present.                                                                                                              |
| #754      | Stripe webhook idempotency tests      | RESOLVED | `webhook-idempotency.test.ts`: duplicate detection, first-time processing, error handling, cleanup (13 tests).                                   |
| #755      | Customer composite index              | RESOLVED | Migration `20260227_add_customer_subscription_composite_index` creates `Customer_authUserId_plan_stripeCurrentPeriodEnd_idx`.                    |
| #787      | db migration/schema tests             | RESOLVED | `migrations.test.ts` (211 lines): directory structure, schema integrity, SQL invariants, docs sync.                                              |
| #788      | UI component tests                    | RESOLVED | 14 component test files in `apps/nextjs/src/components/__tests__/`.                                                                              |
| #789      | React peerDependencies in packages/ui | RESOLVED | `peerDependencies: { next, react, react-dom }`; react/react-dom in devDeps only.                                                                 |

## Genuinely Open Issues (verified NOT resolved)

| Issue            | Title                                      | Status                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #494             | [Architecture] Domain layer                | Genuinely open — large architectural refactor; violates REPAIR MODE "minimal, atomic changes only"                                                                                                                                                                           |
| #668             | [Innovation] AI-Native cluster diagnostics | Genuinely open — large feature                                                                                                                                                                                                                                               |
| #483 (remainder) | Admin `getStats` cross-tenant aggregates   | **BLOCKED at DB level** — requires `BYPASSRLS` (or explicit admin-role policies). The `User.id` (UUID-format text) does not match Clerk `user_xxx` IDs, so a role-based admin policy cannot be reliably keyed without a deeper data-model change. Documented for maintainer. |

## Blocked by token permissions (unchanged)

| Issue                                       | Blocker                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| #305, #584, #595, #670, #744                | pnpm consistency in workflows — `workflows: write` missing |
| #522, #502, #728, #726, #488, #650          | workflow changes — `workflows: write` missing              |
| All 82 issues (labeling/commenting/closing) | `issues: write` missing                                    |

## Recommended Actions for Maintainer (with write access)

1. **Grant `BYPASSRLS` (or equivalent elevated role) to the app's admin DB connection** for `admin.ts getStats` — the remaining RLS deployment blocker. Required before deploying migration `20260131_add_row_level_security`.
2. **Do not deploy migration `20260131_add_row_level_security`** until item 1 is addressed (user-deletion path is now unblocked via self-service DELETE policies).
3. **Close the verified-resolved issues** (~75 issues now have documented evidence across loops 155–162).
4. **Grant the automation token `issues: write` and `workflows: write`** (or use a PAT) so future loops can label/close/consolidate directly.
5. **Do NOT merge stale branches** `fix/product-architect-issue-523-docs` (would regress `docs/Product-Architect.md`; carried from loop 159).
6. **Approve the CI run for PR #1330** (run 31961660432 is `action_required` — workflow approval gate; local verification is fully green).

---

## Action Log

| Timestamp (UTC)   | Action                           | Target                                                                     | Result                                            |
| ----------------- | -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| 2026-08-16 ~17:00 | Phase 0 entry check              | `gh pr list` / `gh issue list`                                             | 0 PRs, 82 issues → ISSUE MANAGER MODE             |
| 2026-08-16 ~17:01 | Token permission probe           | `gh issue create`                                                          | BLOCKED (`createIssue` GraphQL 403)               |
| 2026-08-16 ~17:02 | Rate limiter wiring verification | `trpc.ts` rateLimit middleware                                             | `checkAsync` Redis path confirmed → #496 resolved |
| 2026-08-16 ~17:05 | Auth coverage run                | `packages/auth`                                                            | 41 tests, 90% stmts / 100% branch → #500 resolved |
| 2026-08-16 ~17:08 | Batch issue verification         | #683/#687/#697/#706/#708/#713/#725/#729/#731/#752/#754/#755/#787/#788/#789 | All resolved (evidence table)                     |
| 2026-08-16 ~17:10 | RLS gap analysis                 | migration + user-deletion.ts                                               | DELETE policies missing → deployment blocker      |
| 2026-08-16 ~17:12 | Empirical RLS test               | PostgreSQL 16 in Docker                                                    | Self-delete works, cross-tenant blocked           |
| 2026-08-16 ~17:15 | Add DELETE policies              | `20260131_add_row_level_security/migration.sql`                            | customers_delete_own + users_delete_own           |
| 2026-08-16 ~17:16 | Adopt `rlsTransaction`           | `user-deletion.ts` (3 methods)                                             | RLS-aware                                         |
| 2026-08-16 ~17:18 | Update tests                     | `user-deletion.test.ts` + `migrations.test.ts`                             | 44 db tests pass                                  |
| 2026-08-16 ~17:24 | Full verification                | typecheck / lint / test / build / circular                                 | 9/9, 9/9, 2113 tests, build ok, no circular       |
| 2026-08-16 ~17:27 | Branch + PR                      | `fix/483-rls-delete-policies` → PR #1330                                   | Created, linked to #483, mergeable                |
| 2026-08-16 ~17:30 | Audit report                     | `docs/issue-manager-audit-2026-08-16-loop162.md`                           | Written                                           |

---

## Final State

- **State**: `waiting for human review`
- **Reason**: REPAIR MODE executed for the RLS deployment blocker's user-deletion path (#483 remainder): self-service DELETE policies added to the pending migration + `UserDeletionService` made RLS-aware, empirically verified in PostgreSQL 16, all checks green on Node 22.23.2. PR #1330 created and mergeable (CI run pending workflow approval). The admin `getStats` blocker remains — requires DB-level `BYPASSRLS` (documented for maintainer). Issue lifecycle actions (label/close/comment) remain blocked by token permissions (re-probed). No destructive actions. No branches deleted. No issues modified (token lacks permission).
