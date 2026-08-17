# Issue Manager Audit Report — 2026-08-16 (Loop 156)

## Executive Summary

- **Open PRs**: 0 (PR #1322 merged this loop)
- **Open issues**: 82
- **Mode**: PR HANDLER → ISSUE MANAGER MODE (Phase 0 → PR Handler for #1322, then Issue Manager since open issues > 0)
- **This loop's work**:
  1. **PR #1322 merged** (`docs: issue manager audit report 2026-08-16 loop 155`) — docs-only report, verified against `main` (typecheck 9/9, lint 9/9, tests 141 files/2112 tests). Vercel check failure confirmed **environmental** (identical failure on merged docs PRs #1320/#1321; docs-only change cannot affect the Next.js build).
  2. **Independent verification of loop 155 findings** — every claim re-checked against `main` (commit `3a5a829`).
  3. **New findings** — 2 issues missed by loop 155 are **resolved in code**: #609 and #683. One evidence path correction: #498.
  4. **Token blockers re-confirmed** by direct probe: `issues: write` and `workflows: write` remain unavailable.

---

## STEP 1 — Issue Normalization (BLOCKED: no `issues: write`)

Re-verified this loop: the automation token (`GITHUB_TOKEN`, github-actions bot) cannot add labels, comment, or close issues. All 39 label-normalization entries from loop 155 remain applicable. **No change.**

## STEP 2/3 — Duplicate & Consolidation (BLOCKED: no `issues: write`)

The 9 semantic clusters from loop 155 remain valid. Closing/consolidation still blocked by token permissions. **No change.**

## STEP 4 — Repair Mode Findings

### Selection

No P0/P1-labeled issue exists (verified: 0 issues with `P0` or `P1` labels). All P0/P1 issues were verified resolved in code in loop 155 and re-confirmed this loop. The highest-priority actionable cluster remains the pnpm CI consistency issues (#305/#584/#595/#670/#744).

### pnpm CI fix — still BLOCKED (re-verified by direct probe)

A probe push of a trivial workflow-file change to `iterate.yml` was rejected:

```
refusing to allow a GitHub App to create or update workflow
`.github/workflows/iterate.yml` without `workflows` permission
```

The patch from loop 155 (documented in `issue-manager-audit-2026-08-16-loop155.md`) remains ready for a maintainer with `workflows: write`. **No change.**

### No other repair target exists

After re-verifying every open issue this loop, no genuinely-open, non-blocked, repair-scope issue remains.

---

## New Findings This Loop (missed by loop 155)

| Issue | Title                                                                | Evidence (verified against `main` @ `3a5a829`)                                                                                                                                                                                                                                                                                                                                             |
| ----- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #609  | [P2][Code Quality] Consolidate duplicate Zod schemas in tRPC routers | `packages/api/src/router/schemas.ts` is the single source of truth (comment references "issue #609"); `k8s.ts`, `customer.ts`, `stripe.ts` all import `enhanced*Schema` from `./schemas`. Only router-specific inline schemas remain (`auth.ts` `mySubscriptionSchema`, `hello.ts` input/output) — not duplicates. **RESOLVED**                                                            |
| #683  | [DX] ESLint/Prettier monorepo configuration inconsistency            | Commit `d018b32` "[DX] Standardize ESLint config and add missing lint script - Issue #683" created root `.eslintrc.cjs` extending `./tooling/eslint-config/base.js`; all 7 packages extend `@saasfly/eslint-config/*`; `tooling/eslint-config/` and `tooling/prettier-config/` exist; root `prettier: @saasfly/prettier-config`; `lint-staged` + husky pre-commit configured. **RESOLVED** |

## Evidence Correction

| Issue | Loop 155 claim                              | Correct evidence                                                                                                                                                                                                                                                                      |
| ----- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #498  | `packages/api/src/rbac.ts` + `rbac.test.ts` | `rbac.ts` does not exist. Actual RBAC is in `packages/api/src/trpc.ts` (lines 250–292): `isAdmin` middleware checks the user's DB `role` ("ADMIN") first, falls back to `ADMIN_EMAIL` env var for backward compatibility. Issue remains **RESOLVED** — only the cited path was wrong. |

---

## Re-verified Resolved-but-open Issues (spot-check)

Re-confirmed against `main` this loop (subset of loop 155's table):

| Issue | Evidence                                                                                   |
| ----- | ------------------------------------------------------------------------------------------ |
| #496  | `packages/api/src/distributed-rate-limiter.ts` exists                                      |
| #748  | `.nvmrc` = `22.14.0`                                                                       |
| #785  | `packages/stripe/package.json` has 0 `next` deps                                           |
| #789  | `packages/ui/package.json` peerDeps: `react ^19.0.0`, `react-dom ^19.0.0`, `next >=14.0.0` |
| #722  | `packages/common/src/config/env-validation.test.ts` + `env.ts`                             |
| #721  | `packages/api/src/authorization.ts` + `authorization.test.ts`                              |
| #515  | `apps/nextjs/src/lib/csrf.ts`                                                              |
| #688  | `apps/nextjs/src/proxy.ts` (Next 16 middleware)                                            |
| #666  | `apps/nextjs/src/app/error.tsx` + `global-error.tsx`                                       |
| #611  | `apps/nextjs/src/app/not-found.tsx`                                                        |
| #630  | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged`                 |

---

## Blocked by token permissions (unchanged from loop 155)

| Issue                                       | Blocker                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| #305, #584, #595, #670, #744                | pnpm consistency in workflows — `workflows: write` missing (patch ready) |
| #522, #502, #728, #726, #488, #650          | workflow changes — `workflows: write` missing                            |
| All 82 issues (labeling/commenting/closing) | `issues: write` missing                                                  |

---

## Recommended Actions for Maintainer (with write access)

1. **Close #609 and #683** — verified resolved in code this loop (evidence above).
2. **Batch-close the ~52 resolved issues** (loop 155 table + #609/#683) with a closing comment referencing these reports.
3. **Apply the label normalization matrix** (loop 155 STEP 1) — 39 issues.
4. **Close/consolidate the 9 duplicate clusters** (loop 155 STEP 2/3) — 13 issues.
5. **Apply the pnpm patch** to `iterate.yml` (loop 155 STEP 4) — resolves 5 issues.
6. **Grant the automation token `issues: write` and `workflows: write`** (or use a PAT) so future loops can perform these actions directly.

---

## Final State

- **State**: `waiting for human review`
- **Reason**: All repair-scope work is either already done (issues resolved in code — now 52 documented) or blocked by token permissions (`issues: write`, `workflows: write`). Both blockers re-verified by direct probe this loop.
- **Actions taken**: Merged PR #1322 (docs report), deleted its remote branch. No issues modified (token lacks permission). No destructive actions.
