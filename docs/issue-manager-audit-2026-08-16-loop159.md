# Issue Manager Audit Report — 2026-08-16 (Loop 159)

## Executive Summary

- **Open PRs**: 0 (verified via `gh pr list --state open --limit 5`)
- **Open issues**: 82 (verified via `gh issue list --state open --limit 100`)
- **Mode**: ISSUE MANAGER MODE (Phase 0 → Issue Manager, since open PRs = 0 and open issues > 0)
- **Token constraints re-verified by direct probe**:
  - `issues: write` **NOT available** → label normalization, issue comments, and issue closing remain **BLOCKED** (probe: `createIssue` → GraphQL 403)
  - `workflows: write` **NOT available** → `.github/workflows/*` changes remain **BLOCKED**
  - `contents: write` + `pull-requests: write` **available** → branch push verified live (probe branch pushed + deleted), PR creation endpoint reachable (fails only on empty diff)
- **Repository health verified by full execution** (Node v22.23.2, per `.nvmrc` = `22.14.0`):
  - `pnpm typecheck` → 9/9 tasks pass
  - `pnpm lint` → 9/9 tasks pass, 0 warnings
  - `pnpm test` → 141 files, **2112 tests pass**
  - `pnpm build` → `@saasfly/nextjs` build succeeds (29.9s)
  - `pnpm check:circular` → exit 0, **"No circular dependency found!"** (1105 files processed)
- **Key correction to loop 158**: Recommendation #3 ("Merge or recreate the #523 barrel-export audit doc on main") is **OBSOLETE** — the #523 audit content is **already complete on `main`** (`docs/Product-Architect.md` §"Issue #523", merged via PR #567, commit `494f20a`). The stale branch `fix/product-architect-issue-523-docs` must **NOT** be merged: it predates newer sections (#686, #719) and merging it would **delete** content from `main`.
- **No new issues** created since the loop 158 cutoff (2026-08-16): issue count stable at 82.

---

## STEP 1 — Issue Normalization (BLOCKED: no `issues: write`)

Re-verified this loop by direct probe (`gh issue create` → `GraphQL: Resource not accessible by integration (createIssue)`). The automation token still **cannot** add labels, comment on, or close issues. The label-normalization matrix from loop 155 remains applicable. **No change in capability.**

## STEP 2/3 — Duplicate & Consolidation (BLOCKED: no `issues: write`)

The 9 semantic clusters from loop 155 remain valid. Closing/consolidation still blocked by token permissions. **No change.**

---

## New Findings This Loop

### #523 — Barrel exports audit doc → **ALREADY COMPLETE on `main`** (loop 158 recommendation corrected)

Loop 158 recommended "merge or recreate the #523 audit doc on `main` (content exists on branch `fix/product-architect-issue-523-docs`)". Verification this loop:

- `git log -S "Issue #523" -- docs/Product-Architect.md` shows the section arrived on `main` via commit `494f20a` ("docs(Product-Ar): Update barrel export audit findings (#567)"), merged through PR #567.
- `docs/Product-Architect.md` on `main` contains the **complete** #523 section (lines 38–64): findings for `packages/ui` + `packages/common` barrels, circular-dependency analysis **VERIFIED SAFE**, typecheck verification, actions checklist.
- `git diff main origin/fix/product-architect-issue-523-docs -- docs/Product-Architect.md` shows the stale branch would **REMOVE** the newer #686 and #719 sections (both present only on `main`) while re-adding an older draft.
- **Conclusion**: The audit doc is fully merged. The branch `fix/product-architect-issue-523-docs` is **stale and must not be merged** (would regress `docs/Product-Architect.md`). Its only unique commit (`1a44c97`) adds no content missing from `main`. **Candidate for branch deletion** (content fully superseded) — deferred to maintainer per FAIL-SAFE (no destructive branch deletion without confirmation).

### #483 — Transaction handling for multi-table operations → **PARTIALLY RESOLVED**

- `packages/db/rls-middleware.ts` now provides `rlsTransaction<T>()` — an RLS-aware transaction wrapper (`SET LOCAL` session scoping, auto-clear, rollback on error) exported from `packages/db/index.ts`, with `rls-middleware.test.ts` coverage.
- **Gap**: `rlsTransaction` is not yet consumed by any router service (`grep rlsTransaction packages/api/src/router/*.ts` → 0 matches). Multi-table writes in `k8s.ts`/`customer.ts` still operate without an explicit transaction wrapper.
- Status: infrastructure built + tested; adoption in routers remains open.

### #634 — TypeScript strictness enforcement → **RESOLVED**

- `tooling/typescript-config/base.json` declares `"strict": true` (verified by direct read). Root `tsconfig.json` + all 7 package configs extend the base.

### #636 — ISR caching for dashboard data → **DESIGN DECISION, NOT A GAP**

- `apps/nextjs/src/app/[lang]/(dashboard)/dashboard/page.tsx` line 34: `// ISR intentionally not used - 'force-dynamic' forces revalidate=0 (Next.js segment ...` — dashboard is per-user (Clerk) + real-time cluster state; ISR would cache user-specific data. The code comment documents the deliberate trade-off.

---

## Re-verified Resolved-but-open Issues (spot-check this loop)

| Issue     | Evidence (direct check)                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| #496/#480 | `packages/api/src/distributed-rate-limiter.ts` + `distributed-rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts` present |
| #515      | `apps/nextjs/src/lib/csrf.ts` present                                                                                                 |
| #722      | `tooling/qa/env-validate.js` present (`env:validate` script in root package.json)                                                     |
| #721/#498 | `packages/api/src/authorization.ts` + `rbac.test.ts` present                                                                          |
| #611      | `not-found.tsx` present in `(editor)`, `(docs)`, `(auth)` route groups                                                                |
| #785      | `packages/stripe/package.json`: `next` appears 0 times across dependencies/devDependencies                                            |
| #786      | No `console.*`/log lines containing `secret` in `packages/stripe/src/webhook*`                                                        |
| #719      | Root `tsconfig.json` present; extends `tooling/typescript-config` (strict)                                                            |
| #487      | `packages/common/src/cache/` present (`cache.test.ts`, `index.ts`)                                                                    |
| #486      | `apps/nextjs/src/instrumentation.ts` present                                                                                          |
| #492      | `sizes=` attributes present in `blog-posts.tsx`, `site-footer.tsx`, `sign-in-modal-clerk.tsx`                                         |
| #503      | JSDoc blocks present in `packages/api/src/router/{admin,auth}.ts`                                                                     |
| #685      | `useMemo`/`memo`/`useCallback` present across `packages/ui/src` (dialog, label, avatar, text-reveal, data-table-empty)                |
| #753      | `dynamic()` code splitting present in `apps/nextjs/src/components/dashboard/cluster-list.tsx`                                         |
| #667      | `docs/export-boundaries.md` present                                                                                                   |
| #684      | Root `"build": "pnpm env:validate && turbo build"` present                                                                            |
| #550      | `vitest.config.ts` coverage `include: ["packages/**/*", "apps/nextjs/src/**/*"]`                                                      |

## Genuinely Open Issues (verified NOT resolved)

| Issue | Title                                                               | Status                                                                                                                            |
| ----- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| #494  | [Architecture] Introduce domain layer for business logic separation | No `domain/` directory in `packages/api/src/` (only `router/`, `trpc.ts`, `authorization.ts`, `distributed-rate-limiter.ts` etc.) |
| #668  | [Innovation] AI-Native: Cluster diagnostics with AI assistance      | No diagnostics module in `packages/api/src/router/`; no merged commit referencing #668                                            |
| #483  | [backend] Add transaction handling for multi-table operations       | Infrastructure (`rlsTransaction`) exists + tested; **adoption in routers not done**                                               |

## Blocked by token permissions (unchanged)

| Issue                                       | Blocker                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| #305, #584, #595, #670, #744                | pnpm consistency in workflows — `workflows: write` missing |
| #522, #502, #728, #726, #488, #650          | workflow changes — `workflows: write` missing              |
| All 82 issues (labeling/commenting/closing) | `issues: write` missing                                    |

---

## Recommended Actions for Maintainer (with write access)

1. **Close the verified-resolved issues** (loop 155/157/158 tables + this loop's spot-checks). ~70 issues with evidence now documented.
2. **Do NOT merge `fix/product-architect-issue-523-docs`** — it would regress `docs/Product-Architect.md` (#686, #719 sections). Safe to **delete** the branch (content fully superseded on `main`).
3. **Close #636 as "won't fix / design decision"** — ISR intentionally skipped for per-user dashboard (documented in code).
4. **Grant the automation token `issues: write` and `workflows: write`** (or use a PAT) so future loops can label/close/consolidate directly.
5. **#483**: adopt `rlsTransaction` in multi-table router mutations (k8s/customer) — the helper is ready and tested.

---

## Final State

- **State**: `waiting for human review`
- **Reason**: All repair-scope issues verified resolved in code; the only genuinely open items (#494, #668, #483-adoption) are Phase 2/3 architecture/feature scope requiring maintainer direction. Issue lifecycle actions (label/close/comment) blocked by token permissions (re-probed). Full health check executed and green (typecheck/lint/2112 tests/build/no-circular). One loop-158 recommendation corrected (#523 already on main).
- **Actions taken**: Full build/test/lint/typecheck/circular execution; live token permission probes; spot-verified 17 issue resolutions; git-history analysis for #523; documented 3 new/refined findings. No issues modified (token lacks permission). No destructive actions. No branches deleted.
