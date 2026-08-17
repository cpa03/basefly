# Issue Manager Audit Report — 2026-08-14 (Loop 119)

**Date**: 2026-08-14T14:10:00Z
**Mode**: ISSUE MANAGER MODE (Phase 0: 0 open PRs; 82 open issues)
**Branch**: `main` @ `4996262`

---

## Decision Summary

Phase 0 entry decision: **0 open PRs** → entered **ISSUE MANAGER MODE** directly (82 open issues, unchanged count from loop 118).

ISSUE MANAGER MODE executed:

- **STEP 1 (normalization)**: label audit re-run for all 82 open issues — **38 issues missing
  priority labels, 12 missing category labels** (identical set to loop 118; no new issues created
  since). Application remains **BLOCKED** — re-probed this loop: `gh issue edit --add-label`
  → 403 `addLabelsToLabelable`; `gh issue comment` → 403 `addComment`. No `issues: write`.
- **STEP 2 (dedupe)**: duplicate clusters re-validated (pnpm CI, E2E testing, router tests, tRPC
  docs, Redis rate limiter) — closing **BLOCKED** (403 on all issue write ops).
- **STEP 3 (consolidation)**: candidate consolidations unchanged — **BLOCKED**.
- **STEP 4 (repair)**: verified **all P0/P1 issues are resolved in code** on `main`. P2 survey
  extended this loop with 11 additional criteria-level verifications (see new table below).
  The pnpm CI migration cluster (#305/#584/#595/#670/#744) remains genuinely open in
  `.github/workflows/iterate.yml` (still `npm ci` at lines 72/342) but is **BLOCKED at the
  workflow-file level** — re-verified this loop with a real push rejection. The shipped patch
  template `docs/ci/iterate-pnpm-fix.patch` was **validated to apply cleanly** against the
  current `iterate.yml` (NEW this loop).
- **No code-level repair target remains within token scope** — consistent with loops 113–118.

---

## Action Log

| Timestamp (UTC) | Action | Target | Result |
| --------------- | ------ | ------ | ------ |
| 2026-08-14T13:55 | Phase 0 decision | 0 open PRs / 82 open issues | ISSUE MANAGER MODE |
| 2026-08-14T13:56 | Permission probe (issue write) | `gh issue edit --add-label` / `gh issue comment` | 403 `addLabelsToLabelable`, 403 `addComment` → issue surface BLOCKED |
| 2026-08-14T13:58 | Permission probe (workflow write) | push `.github/workflows/zz-perm-probe.yml` on test branch | **Rejected**: "refusing to allow a GitHub App to create or update workflow ... without `workflows` permission" |
| 2026-08-14T13:59 | Permission probe (code push) | push `docs/zz-push-probe-119.md` on test branch | **Success** → non-workflow file push OK (probe branch deleted after) |
| 2026-08-14T14:01 | STEP 1 label audit | 82 issues | 38 missing priority / 12 missing category (same set as loop 118) |
| 2026-08-14T14:02 | STEP 4 P0/P1 verification | 10 P0/P1 issues vs `main` code | All verified resolved in code (evidence below) |
| 2026-08-14T14:05 | STEP 4 P2 extended survey | 11 additional P2/P3 issues | New criteria-level evidence table (below) |
| 2026-08-14T14:07 | Patch template validation | `docs/ci/iterate-pnpm-fix.patch` vs current `iterate.yml` | **Applies cleanly** (`git apply --check` pass) |
| 2026-08-14T14:08 | Local cleanup | test branches (`test/workflows-perm-probe-119`, `test/push-probe-119`) | Deleted locally + remotely; `main` reset to `origin/main` |
| 2026-08-14T14:10 | STEP 4 conclusion | repair survey | No actionable code repair within token scope → report only |

---

## STEP 1 — Issue Normalization Plan (BLOCKED)

Unchanged from loop 118. 38 issues missing **priority**, 12 missing **category**. Full lists in
`docs/issue-manager-audit-2026-08-14-loop118.md`. No new issues were created since loop 118
(all 82 created 2026-02-20 → 2026-02-27), so the missing-label set is identical.

> Application requires a token with `issues: write`. Re-verified this loop via both GraphQL
> (`addLabelsToLabelable`) and comment (`addComment`) probes — both 403.

---

## STEP 2 — Duplicate Clusters Identified (BLOCKED)

Unchanged from loop 118:

| Cluster | Issues | Recommendation |
| ------- | ------ | -------------- |
| pnpm CI migration | #305, #584, #595, #670, #744 | Keep #670 (canonical), close rest |
| E2E testing strategy | #501, #628, #724 | Consolidate into #501 (suite exists; CI activation blocked) |
| API router tests | #631, #725 | Consolidate into #631 |
| tRPC docs | #731, #749 | Consolidate into #731 |
| Redis rate limiter | #480 (dup of #496) | Close #480 (P0 already fixed) |

> Closing requires `issues: write` → BLOCKED.

---

## STEP 3 — Consolidation Candidates (BLOCKED)

Unchanged from loop 118. All candidate consolidations require issue write access → BLOCKED.

---

## STEP 4 — Repair Mode Survey

### P0/P1 Issues (10) — All Verified Resolved in `main`

Identical evidence table to loop 118 (see that report): #496 (distributed rate limiter),
#480 (dup), #498 (RBAC), #500 (Clerk auth tests), #501 (Playwright E2E suite; CI activation
blocked by `workflows` perm), #515 (CSRF), #549 (auth tests), #550 (coverage config),
#551 (k8s router tests), #581 (testing consolidation). Re-verified this loop; no changes in
`main` since loop 118 (only the loop-118 docs PR merged).

### NEW this loop — P2/P3 criteria-level verifications (not in loop-118 table)

| Issue | Title (abbrev) | Evidence in `main` (this loop) |
| ----- | -------------- | ------------------------------ |
| #751 | tRPC bundle code splitting | `packages/api/src/edge.ts` uses `lazy(() => import(...))` for admin/customer/k8s routers |
| #752 | Unified CLI logger | `packages/common/src/logger.ts` + `logger.test.ts` + `config/log-level.ts` exist |
| #753 | Route-based code splitting | `dynamic()` used in marketing page (`FeaturesGrid`, `RightsideMarketing`, `Comments`) |
| #706 | Dev Containers | `.devcontainer/devcontainer.json` present |
| #492 | Image `sizes` attribute | `sizes="(max-width: 768px) 100vw, 50vw"` etc. in `blog-posts.tsx`, `site-footer.tsx` |
| #487 | Redis app-layer caching | `packages/common/src/cache/` (index.ts + cache.test.ts) |
| #634 | TypeScript strictness | `strict: true` in `tooling/typescript-config/base.json` (inherited by all packages) |
| #630 | Pre-commit hooks | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged` |
| #611 | Custom 404 pages | `not-found.tsx` in `(auth)`, `(docs)`, `(editor)` route groups |
| #684 | Root build script / turbo pipelines | Root `package.json`: `build`, `lint`, `typecheck`, `ci:check` via turbo |
| #687 | Barrel exports | `packages/api/src/index.ts`, `packages/common/src/index.ts`, `packages/ui/src/index.ts` all present |
| #578 | Duplicate health check endpoint | Single `apps/nextjs/src/app/api/health/route.ts` |
| #636 | ISR for dashboard data | Deliberate design: `export const dynamic = "force-dynamic"` with comment explaining user-scoped data must not be cached (documented in `page.tsx`) |

### Genuinely-open clusters (BLOCKED at workflow-file level)

| Cluster | Current state | Blocking permission |
| ------- | ------------- | ------------------- |
| pnpm CI migration (#305/#584/#595/#670/#744) | `iterate.yml` lines 72/342 still `npm ci \|\| true`; cache still `~/.npm` + `package-lock.json` (lines 58–59) | `workflows` (push rejected this loop) |
| E2E workflow deployment (#501 final criterion) | `docs/ci/e2e-workflow.yml` template exists; not deployed | `workflows` |
| Security scanning CI (#728) | `docs/ci/workflows/security-audit.yml` + `codeql-analysis.yml` templates exist | `workflows` |
| Fast-path CI (#502) | `docs/ci/workflows/quick-check.yml` template exists | `workflows` |
| AI code review (#727) | `docs/ci/workflows/ai-code-review.yml` template exists | `workflows` |
| AI prompt extraction from on-pull.yml (#650) | Prompts still embedded inline (lines 76–435) | `workflows` |

### NEW this loop — Patch template validation

`docs/ci/iterate-pnpm-fix.patch` was validated with `git apply --check` against the current
`iterate.yml` on a throwaway clone: **PATCH APPLIES CLEANLY**. The fix is ready to ship the
moment a token with `workflows` permission is available.

---

## STEP 4 — Selection Rationale

The state machine requires selecting the highest-priority genuinely-open issue. This loop:

1. All P0/P1 issues verified resolved in code (loop-118 evidence re-confirmed; `main` unchanged).
2. The pnpm CI migration cluster (#305/#584/#595/#670/#744) is the highest-priority
   genuinely-open code-level gap, but the fix lives in `.github/workflows/iterate.yml` — a
   workflow file. This loop **re-proved the permission boundary with an actual push rejection**
   (same as loop 118). The corrective patch template ships in `docs/ci/` and applies cleanly.
3. Therefore **no code-level repair target remains** within token scope. Consistent with the
   loops 74–75 conclusion and the loop-116/117/118 pattern of shipping reports + templates when
   blocked.

---

## Blockers (recurring)

1. **No `issues: write`** — normalization (STEP 1), dedupe/close (STEP 2/3) must ship as reports.
   Re-verified this loop via GraphQL (`addLabelsToLabelable`) and comment (`addComment`) — 403.
2. **No `workflows` permission** — CI workflow fixes must ship as templates in `docs/ci/`;
   deployment requires a maintainer token. Re-verified this loop with a real push rejection.
3. **Vercel preview deployment fails for all PRs** (pre-existing project config issue; does not
   block docs-only merges — #1271/#1272/#1273 all merged with the same Vercel failure).

Both issue-level blockers are inherent to the GitHub App installation token used by this
automation; resolution requires a token with the missing scopes.
