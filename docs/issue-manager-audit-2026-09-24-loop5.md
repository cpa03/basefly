# Issue Manager Audit — 2026-09-24 (loop5)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 → Step 4 Repair)

## Decision Summary

| Check          | Result                               |
| -------------- | ------------------------------------ |
| Open PRs       | **0** → not PR Handler Mode          |
| Open issues    | **82** → entered Issue Manager Mode  |
| DEFAULT_BRANCH | `main` (detected via `gh repo view`) |

Steps 1–3 (normalization / dedup / consolidation) require issue mutation APIs. The workflow running this session is `on-pull.yml`, whose `GITHUB_TOKEN` has **`contents: write` + `pull-requests: write` but no `issues: write`**. All issue label/comment/close/create calls returned `403 Resource not accessible by integration`. Per FAIL-SAFE, those steps were **documented, not guessed**.

Step 4 (Repair) selected the highest-priority issue with a **verifiable residual gap** that does not require blocked permissions.

## P0/P1 Verification Matrix

| Issue                                 | Priority | Status on `main`             | Evidence                                                                                                                                                                                                       |
| ------------------------------------- | -------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496 Redis rate limiter               | P0       | **Complete**                 | `distributed-rate-limiter.ts`, `checkAsync` in `trpc.ts` + Stripe/docs routes, `REDIS_URL` env, `docs/redis-setup.md`, 98/98 rate-limiter tests                                                                |
| #480 Redis rate limiter (dup of #496) | P1       | **Complete (duplicate)**     | Same implementation as #496                                                                                                                                                                                    |
| #498 Role-based admin RBAC            | P1       | **Complete**                 | `requireRole` / `createRoleBasedProcedure` in `trpc.ts`, DB role primary + email migration fallback, `rbac.test.ts`                                                                                            |
| #515 CSRF protection                  | P1       | **Complete except API docs** | `csrfProtection` in `trpc.ts`, `csrf.ts` + tests (PR #1208). Residual AC _"Documentation for API consumers"_ was missing from `docs/api-spec.md` → **fixed in this PR**                                        |
| #500 Clerk auth flow tests            | P1       | **Complete**                 | `authorization.test.ts`, `auth.test.ts`, `clerk.test.ts`                                                                                                                                                       |
| #501 Playwright E2E                   | P1       | **Blocked on residual AC**   | Config + 11 specs + `docs/e2e-testing.md` exist. AC _"CI integration for E2E tests"_ requires new/edited workflow files — **blocked**: GitHub App token lacks `workflows` permission (same constraint as #728) |
| #549 packages/auth tests              | P1       | **Complete**                 | `packages/auth/{clerk,env,logger}.test.ts`                                                                                                                                                                     |
| #550 apps/nextjs coverage             | P1       | **Complete**                 | `vitest.config.ts` `coverage.include` contains `apps/nextjs/src/**`                                                                                                                                            |
| #551 k8s router tests                 | P1       | **Complete**                 | `k8s-router.test.ts`, `k8s.test.ts`                                                                                                                                                                            |
| #581 Testing consolidation            | P1       | **Children complete**        | Meta-issue over #549/#550/#551/#500/#501; all but #501 CI AC done                                                                                                                                              |

Full unit suite at selection time: **148 files / 2166 tests passed**.

## Repair Action (Step 4)

- **Selected**: #515 (P1, security) — only P0/P1 with a fixable residual AC under current token permissions.
- **Change**: Document CSRF for API consumers in `docs/api-spec.md`:
  - Added missing `CSRF_ERROR` row to the Error Codes table (403).
  - Added `## CSRF Protection` section: rules table, env config (`NEXT_PUBLIC_APP_URL`, `CSRF_ALLOWED_ORIGINS`), error payload, consumer notes.
- **Files**: `docs/api-spec.md` only (documentation-only, no runtime change).

## Steps 1–3 — Blocked (documented, not executed)

### Step 1 Normalization (blocked)

~49 issues missing category and/or priority labels; several have multiple category labels. Prepared fix list (see session). **Not applied** — `gh issue edit` → 403.

### Step 2 Duplicate detection (blocked closes)

| Cluster                  | Canonical                   | Duplicates / related                                       |
| ------------------------ | --------------------------- | ---------------------------------------------------------- |
| Redis rate limiter       | #496 (P0)                   | #480 (P1) — close as duplicate of #496                     |
| pnpm vs npm in workflows | #305                        | #584, #595, #670, #744 — consolidate                       |
| `.nvmrc`                 | #748 (invalid value `'20'`) | #720 (missing) — reconcile; file now exists with `22.14.0` |
| E2E / Playwright         | #501                        | #628, #724 overlap — keep #501 as canonical                |
| API docs generation      | #731                        | #749 overlaps — consolidate                                |

### Step 3 Consolidation (blocked closes)

- Testing family (#500/#501/#549/#550/#551) already grouped under #581.
- Recommendation: close #480→#496, close pnpm cluster into #305, close #720 if #748 is canonical.

## Action Log

| Timestamp (UTC)   | Action                           | Target                              | Result                                                 |
| ----------------- | -------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| 2026-09-24 ~12:20 | Detect DEFAULT_BRANCH            | `cpa03/basefly`                     | `main`                                                 |
| 2026-09-24 ~12:20 | List open PRs                    | `gh pr list`                        | 0 open                                                 |
| 2026-09-24 ~12:20 | List open issues                 | `gh issue list`                     | 82 open                                                |
| 2026-09-24 ~12:21 | Enter Issue Manager Mode         | Phase 0 Step 0.2                    | Active                                                 |
| 2026-09-24 ~12:22 | Probe issue label write          | #789 +label                         | **403** `issues` permission missing                    |
| 2026-09-24 ~12:23 | Probe issue create/close/comment | #789 / new issue                    | **403**                                                |
| 2026-09-24 ~12:23 | Probe git push (code)            | temp branch                         | **OK** (`contents: write`)                             |
| 2026-09-24 ~12:24 | Probe workflow file push         | `.github/workflows/_perm-probe.yml` | **Rejected** — GitHub App lacks `workflows` permission |
| 2026-09-24 ~12:25 | `pnpm install`                   | workspace                           | OK (engine warning: node 20 vs >=22)                   |
| 2026-09-24 ~12:27 | Verify #496 tests                | 3 rate-limiter suites               | **98/98 pass**                                         |
| 2026-09-24 ~12:27 | Verify typecheck/lint            | `@saasfly/api`, `@saasfly/common`   | exit 0                                                 |
| 2026-09-24 ~12:28 | Full unit suite                  | `pnpm test`                         | **2166/2166 pass** (148 files)                         |
| 2026-09-24 ~12:29 | P0/P1 residual gap scan          | #496–#581                           | Only #515 docs + #501 CI residual                      |
| 2026-09-24 ~12:30 | Select repair target             | #515                                | Documentation AC fixable                               |
| 2026-09-24 ~12:31 | Branch from `main`               | `fix/api-spec-csrf-docs-515`        | Created                                                |
| 2026-09-24 ~12:32 | Edit `docs/api-spec.md`          | CSRF section + `CSRF_ERROR` row     | Applied                                                |
| 2026-09-24 ~12:33 | Re-verify build/lint/test        | full suite                          | Pending after edit                                     |
| 2026-09-24 ~12:34 | Push + PR linked to #515         | `fix/api-spec-csrf-docs-515`        | Pending                                                |

## Skills Used

- `.opencode/skills/openx-basefly` — project conventions (monorepo, pnpm, turbo).
- `.opencode/skills/github-workflow-automation` — workflow/permission constraints analysis.
- `.opencode/skills/obra-superpowers-systematic-debugging` — root-caused 403s to workflow `permissions:` block (not rate limit or auth logout).

## Subagents

| Agent            | Task                                 | Outcome                                                                   |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| `explore` (×2)   | Map rate limiter implementation      | **Failed to start** — `ProviderModelNotFoundError: opencode/gpt-5-nano`   |
| `librarian` (×2) | Redis rate limiter patterns research | **Failed to start** — `ProviderModelNotFoundError: opencode/glm-4.7-free` |

All four background tasks failed on model routing; work continued with direct tools (no data loss). Model IDs in `.opencode` agent configs need updating (`gpt-5-nano` → available alias, `glm-4.7-free` → available alias).

## Final State

**waiting for human review**

Reasons a human must act:

1. **Issue mutations blocked** — add `issues: write` to `on-pull.yml` (or run loop via `iterate.yml`, which already declares it) so Steps 1–3 and issue closing can run.
2. **Workflow file pushes blocked** — needs a PAT/App with `workflows` scope to complete #501 CI integration (and #728 security workflows).
3. **Verified-complete P0/P1 issues remain open** — #496, #480, #498, #500, #549, #550, #551 and most of #515/#581 should be closed after this PR merges; the agent cannot close them.
4. **This PR** — documentation-only change for #515; merge after CI green.
