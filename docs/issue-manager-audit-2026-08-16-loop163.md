# Issue Manager Audit Report — 2026-08-16 (Loop 163)

## Executive Summary

- **Open PRs**: 0 at phase entry (verified via `gh pr list --state open --limit 5`)
- **Open issues**: 82 (verified via `gh issue list --state open --limit 100`)
- **Mode**: ISSUE MANAGER MODE (Phase 0 → Issue Manager, since open PRs = 0 and open issues > 0)
- **Token permissions re-probed** (unchanged from loop 162):
  - `issues: write` **NOT available** → label normalization, issue comments, and issue closing remain **BLOCKED** (probe: `gh issue create` → GraphQL 403 `createIssue`; `gh issue edit --add-label` → 403 `addLabelsToLabelable`)
  - `workflows: write` **NOT available** → `.github/workflows/*` changes remain **BLOCKED** (push rejection: "refusing to allow a GitHub App to create or update workflow ... without `workflows` permission")
  - `contents: write` + `pull-requests: write` **available** → branch push + PR creation possible
- **REPAIR MODE executed this loop**: Fixed **#521 (hydration tests missing)** — added 9 unit tests for `useClientDictionary` / `extractLocaleFromPathname`, exported the previously module-private `extractLocaleFromPathname`. PR **#1332** created.
- **REPAIR MODE prepared (push-blocked)**: Re-created the **#584/#595 iterate.yml pnpm fix** on local branch `fix/584-595-pnpm-iterate-workflow` (2 commits), byte-matching the canonical fix in `docs/ci/iterate-pnpm-fix.md`. Push rejected (no `workflows` permission) — same blocker as loops 159–162.
- **NEW VERIFICATION THIS LOOP**: Confirmed the `useClientDictionary` hydration hook is genuinely untested (0 test files referenced it before this loop) and that the module-level dictionary store leaks state across tests (root cause of initial test failures — fixed with `vi.resetModules()` per test).
- **No new issues** created (blocked by token); issue count stable at 82.

---

## STEP 1 — Issue Normalization (BLOCKED: no `issues: write`)

Re-probed this loop (`gh issue edit --add-label` → `GraphQL: Resource not accessible by integration (addLabelsToLabelable)`). The automation token still **cannot** add labels, comment on, or close issues. **No change in capability.**

Label normalization plan (39 issues missing category/priority labels) — documented for maintainer:

**Missing PRIORITY label:**

| Issue | Priority | Issue | Priority | Issue | Priority |
| ----- | -------- | ----- | -------- | ----- | -------- |
| #305  | P2       | #668  | P3       | #727  | P3       |
| #584  | P2       | #713  | P2       | #728  | P1       |
| #628  | P1       | #719  | P2       | #729  | P3       |
| #630  | P3       | #720  | P2       | #731  | P3       |
| #631  | P1       | #721  | P1       | #785  | P1       |
| #632  | P1       | #722  | P1       | #786  | P1       |
| #634  | P2       | #723  | P2       | #787  | P2       |
| #636  | P3       | #724  | P1       | #788  | P2       |
|       |          | #725  | P1       | #789  | P2       |
|       |          | #726  | P2       |       |          |

**Missing CATEGORY label:**

| Issue | Category | Issue | Category    |
| ----- | -------- | ----- | ----------- |
| #595  | ci       | #744  | ci          |
| #635  | docs     | #748  | bug         |
| #670  | ci       | #749  | feature     |
| #697  | docs     | #751  | enhancement |
|       |          | #752  | enhancement |
|       |          | #753  | enhancement |
|       |          | #754  | test        |
|       |          | #755  | enhancement |

Note: #635 currently carries a `documentation` label; per the ULW taxonomy it should be `docs` (category label must be exactly one of: bug | enhancement | feature | docs | refactor | chore | test | ci | security).

## STEP 2/3 — Duplicate & Consolidation (BLOCKED: no `issues: write`)

Duplicate/cluster analysis (closure still blocked by token permissions):

| Cluster                       | Issues                       | Rationale                                                                        |
| ----------------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| Redis rate limiter            | #480 ≈ #496                  | Exact duplicates (both: distributed Redis rate limiter). #496 is P0, #480 is P1. |
| pnpm consistency in workflows | #305, #584, #595, #670, #744 | Same root cause: `npm ci` / npm usage in CI workflows; repo is pnpm-only.        |
| E2E testing                   | #628 ≈ #724                  | Same acceptance area (E2E test coverage).                                        |
| API router tests              | #631 ≈ #725                  | Same acceptance area (API router integration tests).                             |
| Node version pinning          | #720 ≈ #748                  | Same acceptance area (.nvmrc / Node version).                                    |
| Sensitive data logging        | #632 ≈ #786                  | Same acceptance area (no sensitive data in logs).                                |

All P0/P1 members of these clusters verified resolved in code (see verification table in loop 162 and below).

---

## STEP 4 — REPAIR MODE: #521 (hydration tests) — DONE, PR #1332

**Selection rationale**: #521 is a P2 issue with a concrete, minimal acceptance criterion ("Tests added for hydration scenarios"). The `useClientDictionary` hook had **zero** test coverage and contained a module-private `extractLocaleFromPathname` that was untestable. This is a minimal, atomic change — fits REPAIR MODE constraints.

### Fix implemented

**`apps/nextjs/src/hooks/use-client-dictionary.ts`**: exported `extractLocaleFromPathname` (was module-private). No behavior change.

**`apps/nextjs/src/hooks/use-client-dictionary.test.ts`** (new, 9 tests):

1. `extractLocaleFromPathname` — extracts valid locale from first path segment (`/en/dashboard` → `en`, `/zh/dashboard` → `zh`, etc.)
2. `extractLocaleFromPathname` — falls back to `en` for unknown first segments (`/fr/dashboard` → `en`)
3. `extractLocaleFromPathname` — falls back to `en` for root/empty pathnames (`/` → `en`, `""` → `en`)
4. `extractLocaleFromPathname` — falls back to `en` when first segment is not a locale (`/dashboard` → `en`, `/api/trpc/edge` → `en`)
5. `useClientDictionary` — SSR-safe initial render: `isLoading` true + `dict` null (server and client snapshots both return null → no hydration mismatch)
6. `useClientDictionary` — loads the dictionary for the current locale after mount (`/en/dashboard` → en dictionary)
7. `useClientDictionary` — loads the zh dictionary when pathname locale is zh
8. `useClientDictionary` — falls back to the en dictionary when the locale import fails (ko import forced to throw)
9. `useClientDictionary` — reloads the dictionary when the pathname locale changes (rerender with `/en` → `/zh`)

**Key implementation detail**: the hook keeps a **module-level store** (`dictionaryStore`). Initial test runs failed because a pending async import from one test resolved _after_ `vi.clearAllMocks()` in `afterEach`, loading the **real** dictionary into the shared store and polluting the next test. Fixed by calling `vi.resetModules()` + re-importing the hook in `beforeEach` so every test gets a fresh module instance. The locale-change test uses `act()` + `rerender()` to trigger the effect re-run.

### Verification

| Check                                                 | Result                                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm vitest run apps/nextjs/src/hooks/`              | 4 files, **18/18 tests pass**                                          |
| `pnpm exec eslint` on changed files                   | clean, 0 warnings                                                      |
| `pnpm exec tsc --noEmit -p apps/nextjs/tsconfig.json` | 0 new errors (52 pre-existing on main, unchanged — verified via stash) |

### PR

- **PR #1332** (`test/521-hydration-dictionary-tests` → `main`): created, `MERGEABLE`, linked to #521 ("Closes #521").
- CI: `on-pull.yml` run is `action_required` (workflow approval gate — external, same as PR #1330 in loop 162). Vercel check failed due to external deployment rate limit ("retry in 24 hours") — not a code issue.

---

## STEP 4 (blocked): #584/#595 iterate.yml pnpm fix

Re-created the fix on local branch `fix/584-595-pnpm-iterate-workflow` (2 commits: `8e934d1`, `4f29c61`), byte-matching the canonical fix documented in `docs/ci/iterate-pnpm-fix.md`:

- Replace `npm ci || true` (lines 72, 342) with `pnpm/action-setup@v6` + `setup-node` (`node-version: "20"`, `cache: 'pnpm'`) + `pnpm install --frozen-lockfile || true`
- Replace `actions/cache` (`~/.npm` keyed on `**/package-lock.json`) with pnpm store cache (`~/.local/share/pnpm/store`, key `hashFiles('**/pnpm-lock.yaml')`)

Verified locally: YAML parses ✓, `node tooling/qa/validate-ci-workflows.js` → "All workflow files are valid!" ✓, `pnpm install --frozen-lockfile --offline` succeeds ✓.

**Push REJECTED**: `refusing to allow a GitHub App to create or update workflow '.github/workflows/iterate.yml' without 'workflows' permission`. Same blocker as loops 159–162. The fix remains available for the maintainer via `docs/patches/fix-pnpm-consistency-iterate-744.patch` or `bash scripts/deploy-ci-fixes.sh` (both require `workflows: write`).

---

## Genuinely Open Issues (verified NOT resolved)

| Issue            | Title                                      | Status                                                                                                                  |
| ---------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| #494             | [Architecture] Domain layer                | Genuinely open — large architectural refactor; violates REPAIR MODE "minimal, atomic changes only"                      |
| #668             | [Innovation] AI-Native cluster diagnostics | Genuinely open — large feature                                                                                          |
| #483 (remainder) | Admin `getStats` cross-tenant aggregates   | **BLOCKED at DB level** — requires `BYPASSRLS` (or explicit admin-role policies). Documented for maintainer (loop 162). |
| #584/#595        | pnpm consistency in iterate.yml            | Genuinely open — fix prepared (local branch + patch), push blocked by missing `workflows` permission.                   |
| #521             | Hydration tests                            | **FIXED this loop** — PR #1332 created (pending CI approval + merge).                                                   |
| #522/#727        | Workflow-file changes                      | Blocked — `workflows: write` missing.                                                                                   |
| #523/#749        | Audit / feature-scale                      | Genuinely open — large scope.                                                                                           |

## Blocked by token permissions (unchanged)

| Issue                                       | Blocker                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| #305, #584, #595, #670, #744                | pnpm consistency in workflows — `workflows: write` missing |
| #522, #502, #728, #726, #488, #650          | workflow changes — `workflows: write` missing              |
| All 82 issues (labeling/commenting/closing) | `issues: write` missing                                    |

## Recommended Actions for Maintainer (with write access)

1. **Grant the automation token `issues: write` and `workflows: write`** (or use a PAT) so future loops can label/close/consolidate issues and push workflow fixes directly.
2. **Apply the #584/#595 iterate.yml pnpm fix** via `bash scripts/deploy-ci-fixes.sh` or `docs/patches/fix-pnpm-consistency-iterate-744.patch` (both require `workflows: write`).
3. **Approve the CI run for PR #1332** (run 31973618124 is `action_required` — workflow approval gate; local verification is fully green: 18/18 hooks tests, ESLint clean, 0 new type errors).
4. **Close the verified-resolved issues** (~75 issues now have documented evidence across loops 155–163).
5. **Grant `BYPASSRLS` (or equivalent elevated role) to the app's admin DB connection** for `admin.ts getStats` — the remaining RLS deployment blocker (#483 remainder).
6. **Do NOT merge stale branches** `fix/product-architect-issue-523-docs` (would regress `docs/Product-Architect.md`; carried from loop 159).

---

## Action Log

| Timestamp (UTC)   | Action                     | Target                                                              | Result                                                                  |
| ----------------- | -------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 2026-08-16 ~21:00 | Phase 0 entry check        | `gh pr list` / `gh issue list`                                      | 0 PRs, 82 issues → ISSUE MANAGER MODE                                   |
| 2026-08-16 ~21:02 | Token permission probe     | `gh issue edit --add-label` / `git push` workflow file              | BLOCKED (`addLabelsToLabelable` 403, `workflows` push rejection)        |
| 2026-08-16 ~21:05 | Label normalization plan   | 39 issues missing category/priority labels                          | Plan documented (table above); mutation blocked                         |
| 2026-08-16 ~21:08 | Duplicate/cluster analysis | #480/#496, pnpm cluster, #628/#724, #631/#725, #720/#748, #632/#786 | 6 clusters documented; closure blocked                                  |
| 2026-08-16 ~21:15 | #521 gap analysis          | `use-client-dictionary.ts` + test search                            | 0 tests referenced the hook; `extractLocaleFromPathname` module-private |
| 2026-08-16 ~21:20 | Export + test file         | `use-client-dictionary.ts` / `use-client-dictionary.test.ts`        | 9 tests written; 3 initially failing                                    |
| 2026-08-16 ~21:30 | Root-cause probes          | module-level store + `vi.clearAllMocks()` timing                    | Cross-test store pollution confirmed via probes                         |
| 2026-08-16 ~21:35 | Fix test isolation         | `vi.resetModules()` in `beforeEach` + `act()`/`rerender()`          | 9/9 pass                                                                |
| 2026-08-16 ~21:36 | Verification               | hooks suite / eslint / tsc                                          | 18/18 pass, ESLint clean, 0 new type errors                             |
| 2026-08-16 ~21:40 | Branch + PR                | `test/521-hydration-dictionary-tests` → PR #1332                    | Created, linked to #521, MERGEABLE                                      |
| 2026-08-16 ~21:45 | #584/#595 fix re-created   | `fix/584-595-pnpm-iterate-workflow` (local, 2 commits)              | Matches canonical fix; push REJECTED (workflows)                        |
| 2026-08-16 ~21:50 | Audit report               | `docs/issue-manager-audit-2026-08-16-loop163.md`                    | Written                                                                 |

---

## Final State

- **State**: `waiting for human review`
- **Reason**: REPAIR MODE executed for #521 (hydration tests): 9 unit tests added, `extractLocaleFromPathname` exported, PR #1332 created and mergeable (CI pending workflow approval; Vercel rate-limited externally). The #584/#595 iterate.yml pnpm fix was re-created and locally verified but remains push-blocked by missing `workflows` permission (patch available for maintainer). Issue lifecycle actions (label/close/comment) remain blocked by token permissions (re-probed). No destructive actions. No branches deleted. No issues modified (token lacks permission).
