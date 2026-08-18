# Issue Manager Audit Report — 2026-08-18 (Loop 176)

## Executive Summary

- **Open PRs**: 0 at phase entry → **ISSUE MANAGER MODE** engaged (82 open issues)
- **#DELIVERED (merged)**: fixed **1 genuine logic defect** in the
  `useInputValidation` hook (`apps/nextjs/src/hooks/use-form-ux.ts`):
  - **"Validate on blur" never ran with default options** — the `onBlur`
    handler only set `isTouched` and never executed validation. Its comment
    claimed _"Validation happens via onChange capturing the last value"_, but
    `onChange` only validates when `validateOnChange && isTouched`
    (`validateOnChange` defaults to `false` → validation **never runs**), and
    `onChange` did not store the value anywhere. Fixed by tracking the latest
    value in a `valueRef` and validating it (debounced) from `onBlur` when
    `validateOnBlur` is enabled; `reset` clears the stored value.
  - Added **7 regression tests** (`use-form-ux.test.ts`). Verified the tests
    **fail on the pre-fix code** (2 failures) and **pass with the fix** (7/7).
  - Delivered as **PR #1369**, fully verified (typecheck 9/9, lint 9/9, tests
    2155/2155, prettier clean), **MERGED** as commit `276f4ef`. Remote branch
    deleted.
- **Token permissions re-probed** (unchanged from loops 159–175):
  - `issues: write` **NOT available** → issue label normalization, comments,
    closing, and creation remain **BLOCKED** (403 on `addLabelsToLabelable`
    and `addComment`)
  - `workflows: write` **NOT available** → pushing changes to
    `.github/workflows/*` is refused. Blocks #305/#502/#522/#650/#670/#726/
    #728/#744 permanently under this token.
  - `contents: write` + `pull-requests: write` **available** → branch push,
    PR creation, and PR merge all worked this loop
- **Baseline health verified**: `pnpm typecheck` 9/9 ✅, `pnpm lint` 9/9 ✅,
  `pnpm test` **2155/2155** ✅ (146 files, +7 from this loop's tests)
- **CI landscape** (unchanged): only active workflow is `on-pull.yml`
  (`pull` — AI orchestration, concludes `action_required` = agent task, not a
  failure gate); `iterate.yml` disabled manually; Vercel check on PRs is
  rate-limited/failing for environmental reasons (same failure observed on
  PRs #1365/#1367 — not code-related). No traditional CI gate blocks merges.

---

## Phase 0 — Entry Decision

| Step | Check       | Result                          |
| ---- | ----------- | ------------------------------- |
| 0.1  | Open PRs    | **0** → skip PR HANDLER MODE    |
| 0.2  | Open issues | **82** → **ISSUE MANAGER MODE** |

---

## ISSUE MANAGER MODE

### STEP 1 — Issue Normalization (BLOCKED: no `issues: write`)

Issue-mutation operations remain blocked (403 `addLabelsToLabelable` /
`addComment`). 44 issues still lack category and/or priority labels (mapping
preserved in the loop 166 report). **PR label mutation works** — `bug` + `P2`
labels applied to PR #1369 successfully.

### STEP 2/3 — Duplicate Detection & Consolidation (BLOCKED: no `issues: write`)

Duplicate clusters unchanged from loop 171 (see that report for the full
table). Closing/canonicalization requires `issues: write` — blocked.

### STEP 4 — REPAIR MODE

**Selection rationale**: All P0/P1 issues verified resolved in code (matrix in
loop 171). Fallback rule: lowest-scoring DOMAIN = **D. Delivery & Evolution
(68)** → lowest-scoring CRITERION = **CI/CD Health (65)** → #305 (pnpm
consistency) — **workflow-permission-blocked** (drafted fix reverted in loop
175). Next deliverable criterion: **B. System Quality (74)** →
**Performance Efficiency (70)** → #723/#729/#751/#523/#685 exhausted or
resolved in prior loops.

**Delivered this loop — genuine logic defect (no open issue tracks it; found
via utility audit, same class as loops 174/175 defects):**

| #   | Defect                                                                                                                                                                                                                                                                                                                        | Location                                                      | Fix                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `useInputValidation` documented `validateOnBlur` (default `true`) but `onBlur` never ran validation — only set `isTouched`. `onChange` validates only when `validateOnChange && isTouched` (`validateOnChange` defaults `false`), so with default options validation **never executed** and invalid values were never flagged | `apps/nextjs/src/hooks/use-form-ux.ts` (`useInputValidation`) | Added `valueRef` tracking the latest value; `onBlur` now validates it (debounced) when `validateOnBlur`; `reset` clears the ref. Added 7 regression tests |

**Regression-test proof**: the new test suite was run against the pre-fix
code (`git stash` of the hook) — **2 tests failed** ("validates the last value
on blur with default options", "reset restores the initial state"), confirming
the tests genuinely capture the defect. With the fix, 7/7 pass.

**Also scanned and verified clean this loop** (no action needed):

- `mdx-components.tsx` — heading/paragraph/list/link/blockquote/code styles
  correct, `useMDXComponent` from `next-contentlayer2/hooks`, no defects
- `docs/[[...slug]]/page.tsx` — static params, MDX rendering, no defects
- `blog-posts.tsx`, `pricing-cards.tsx`, `billing-form-button.tsx` — clean
- `rls-middleware.ts` — `SET LOCAL` correctly scoped inside `rlsTransaction`;
  the exported `setRlsSession` docstring shows non-transaction usage which
  would silently no-op, but the function is only used inside transactions in
  production code (documented risk, no code change this loop)
- `logger.ts` — `SENSITIVE_FIELD_PATTERNS` redaction active
- `csrf.ts`, `proxy.ts`, `request-id.ts`, `response.ts`, `health-check.ts`
  (edge-safe via `@vercel/postgres-kysely`) — clean
- `trpc.ts` + routers + webhooks — rate limiter wired (`checkAsync`), clean
- i18n config — locales `["en","zh","ko","ja"]` match dictionaries

---

## Issue Resolution Matrix (verified against code this loop)

All issues below were verified **already resolved in the codebase** (commit
history and/or current source). Closing them requires `issues: write` —
**BLOCKED** under this token. Matrix unchanged from loop 175 (see that report
for the full table); no new resolutions this loop.

**Blocked clusters (cannot fix under this token):**

- **Workflow-file changes** (pnpm consistency): #305, #584, #595, #670, #744,
  #728, #726, #502, #522, #650 — all require `workflows: write`
- **Large refactor**: #494 (`packages/domain/` does not exist)

---

## Loop Statistics

| Metric                 | Value                           |
| ---------------------- | ------------------------------- |
| PRs created            | 1 (#1369)                       |
| PRs merged             | 1 (#1369, squash)               |
| Defects fixed          | 1 (blur validation never ran)   |
| Regression tests added | 7                               |
| Issues closed          | 0 (blocked: `issues: write`)    |
| Workflow files changed | 0 (blocked: `workflows: write`) |
| Typecheck              | 9/9 ✅                          |
| Lint                   | 9/9 ✅                          |
| Tests                  | 2155/2155 ✅ (146 files)        |
