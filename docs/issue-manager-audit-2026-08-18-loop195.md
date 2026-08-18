# Issue Manager Audit Report — 2026-08-18 (Loop 195)

## Executive Summary

- **Open PRs**: 0 at phase entry → **ISSUE MANAGER MODE** engaged directly.
- **Token permissions re-probed** (consistent with loops 159–194):
  - `issues: write` **NOT available** → issue label normalization, comments,
    closing, and creation remain **BLOCKED** (re-verified this loop with real
    attempts: `gh issue edit --add-label` → `403 addLabelsToLabelable`,
    `gh issue comment` → `403 addComment`, `gh issue close` → `403
closeIssue`).
  - `workflows: write` **NOT available** → `.github/workflows/*` changes
    remain blocked (GitHub App workflow-file protection proven in loop 192;
    no re-attempt needed this loop).
  - `contents: write` **available** → branch pushes work (verified with a
    probe push + delete this loop).
  - `pull-requests: write` **available** → PR creation/merge work (2 PRs
    merged in loop 192; this loop delivers the audit report PR).
- **No new issues or PRs since loop 194**: open issue count unchanged at
  **82**; HEAD is loop 194's merged audit report (PR #1396). No new
  maintainer activity to react to.
- **Baseline health (re-run this loop)**: `pnpm test` **2165/2165 passed**
  (148 files, ~42s); `pnpm lint` **9/9 tasks successful**; `pnpm typecheck`
  **9/9 tasks successful**; CI validator **0 errors / 4 warnings** (all 4
  warnings attributable to the blocked #305 issue in `iterate.yml`).
- **Fresh spot-checks this loop (18 issues re-verified against `main`
  code)**: all remain resolved as previously recorded or newly verified —
  #483 (RLS transactions), #485 (Suspense), #496 (distributed rate
  limiter), #521 (dictionary loading), #580 (pino), #581 (test config),
  #609 (zod schemas), #611 (not-found), #613 (no duplicate workflows),
  #634 (TS strict), #635 (ONBOARDING), #664 (console.\* only in JSDoc),
  #666 (error boundaries), #688 (security headers via next.config), #697
  (no doc corruption), #719 (root tsconfig), #722 (env validation), #726
  (depcheck), #729 (bundle analyzer), #748/#720 (.nvmrc valid).
- **No repair work possible this loop**: the 5 genuinely unresolved issues
  remain unchanged — 3 are **BLOCKED** on `workflows: write` (#305, #650,
  #522), 1 violates the minimal-change repair constraint (#494), 1 is a
  large P3 feature (#668). #502 (fast-path CI) also requires a new workflow
  file → blocked. No new code-level defect was found that could be fixed
  via PR (defect scan: no TODO/FIXME defects, no console.\* in production
  code, no lint warnings, no failing tests).

---

## Phase 0 — Entry Decision

| Step | Check       | Result                          |
| ---- | ----------- | ------------------------------- |
| 0.1  | Open PRs    | **0** → skip PR HANDLER MODE    |
| 0.2  | Open issues | **82** → **ISSUE MANAGER MODE** |

---

## STEP 1 — Issue Normalization (BLOCKED)

Unchanged from loops 192–194: **54 of 82 issues** need a category and/or
priority label change. Every `gh issue edit --add-label/--remove-label`
call returns `403 Resource not accessible by integration
(addLabelsToLabelable)` — re-verified this loop with a real attempt on the
11 issues missing both category and priority (#755, #754, #753, #752,
#751, #749, #748, #744, #697, #670, #595). **All label changes remain
BLOCKED** — the recommended assignments are captured in the loop 192
report (STEP 1) for maintainer application once a token with `issues:
write` is available.

---

## STEP 2 — Duplicate Detection (identification complete; closing BLOCKED)

9 duplicate issues across 5 groups (unchanged from loops 178–194; canonical
listed first). Closing remains blocked by `issues: write`:

| Canonical                           | Duplicates             | Rationale                                                                               |
| ----------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| #496 (P0 rate limiter Redis)        | #480                   | Same in-memory→Redis rate limiter scope                                                 |
| #501 (P1 Playwright E2E)            | #628, #724             | All three are "E2E test coverage"; #724's "only 6 flows" claim is stale (11 spec files) |
| #305 (pnpm CI consistency)          | #584, #670, #744, #595 | All five describe the same `npm ci` in workflows; #305 is the oldest and broadest       |
| #725 (API router integration tests) | #631                   | #631 is a subset (k8s/customer/stripe routers) of #725                                  |
| #523 (barrel tree-shaking)          | #667                   | #667 (export boundary audit) overlaps #523's audit scope                                |

## STEP 3 — Consolidated / Verified-Resolved Issues

### Consolidated clusters (similar small issues — consolidation BLOCKED)

The following clusters of similar small issues remain open (merging
requires `issues: write`). Canonical issue absorbs the others' scope:

| Cluster                         | Canonical | Members (scope folded in)                                                     |
| ------------------------------- | --------- | ----------------------------------------------------------------------------- |
| Bundle-size measurement         | #729      | #708 (bundle analyzer config)                                                 |
| Barrel exports / package bounds | #523      | #667 (export boundary audit), #687 (missing index)                            |
| API documentation generation    | #731      | #749 (AI-powered API docs/testing generator)                                  |
| .nvmrc Node version             | #720      | #748 (invalid value '20' — now 22.14.0, valid)                                |
| Logging / observability         | #580      | #664 (console.\* → pino), #632 (sensitive-data audit, report merged PR #1393) |

### Verified-resolved issues (69 issues)

Unchanged from loops 178–194; baseline health re-run confirms no
regressions. Fresh spot-checks executed this loop (all PASS):

| Issue | Priority | Evidence (verified 2026-08-18, loop 195)                                                                                                                                      |
| ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #483  | P2       | `rlsTransaction(db, userId, ...)` RLS-aware transactions in `packages/stripe/src/webhooks.ts` (lines 114, 150).                                                               |
| #485  | P2       | `Suspense` used in 5+ app files: `(docs)/layout.tsx`, `(marketing)/layout.tsx`, `pricing/page.tsx`, `dashboard/page.tsx`, `billing/page.tsx`.                                 |
| #496  | P0       | `packages/api/src/{rate-limiter,distributed-rate-limiter,distributed-rate-limiter-sync}.ts` + tests present; 98/98 rate limiter tests pass.                                   |
| #521  | P2       | `apps/nextjs/src/lib/get-dictionary.ts` present (client dictionary loading).                                                                                                  |
| #580  | P2       | pino logger: `packages/stripe/src/logger.ts`, `packages/common/src/logger.ts` (+ `logger.test.ts`).                                                                           |
| #581  | P1       | `vitest.config.ts` + consolidated `tooling/qa/` (cli-output, env-validate, validate-ci-workflows).                                                                            |
| #609  | P2       | Only 3 `z.object` schemas in `packages/api/src/router/*.ts` — no material duplication.                                                                                        |
| #611  | P3       | `apps/nextjs/src/app/not-found.tsx` present.                                                                                                                                  |
| #613  | P2       | `.github/workflows/` contains only `iterate.yml` + `on-pull.yml` — no duplicates.                                                                                             |
| #634  | P2       | `tooling/typescript-config/base.json`: `"strict": true` + `"noUncheckedIndexedAccess": true`; root `tsconfig.json` present.                                                   |
| #635  | P2       | `docs/ONBOARDING.md` present.                                                                                                                                                 |
| #664  | P2       | All 4 `console.*` hits in `packages/stripe/src` are **JSDoc comment examples** (client.ts 189–190, integration.ts 77, 276); `packages/db/src` has zero.                       |
| #666  | P2       | `apps/nextjs/src/app/error.tsx` + `global-error.tsx` present.                                                                                                                 |
| #688  | P2       | Security headers (X-Frame-Options, CSP, cross-origin) implemented in `apps/nextjs/next.config.*` (lines 157–230); middleware.ts approach removed for Next.js 16 build compat. |
| #697  | P2       | No actual doc corruption — the 3 grep matches are audit reports quoting scan patterns (loop24, loop155, loop192).                                                             |
| #719  | P2       | Root `tsconfig.json` present (extends `tooling/typescript-config/base.json`).                                                                                                 |
| #722  | P1       | Env validation: `packages/common/src/env.mjs` + `packages/api/src/env.mjs` present (t3-env pattern).                                                                          |
| #726  | P2       | `depcheck` wired as `dx:unused` in root `package.json` (line 49).                                                                                                             |
| #729  | P3       | `@next/bundle-analyzer` 16.2.7 in `apps/nextjs/package.json` + `docs/ci/bundle-size-monitoring.md` present.                                                                   |
| #748  | P1       | `.nvmrc` = `22.14.0` (valid Node.js version).                                                                                                                                 |
| #720  | P3       | `.nvmrc` present at repo root.                                                                                                                                                |

---

## STEP 4 — Repair Mode

**Selection**: Highest-priority open issue is #496 (P0, security) — verified
**already resolved** in `main` (98/98 rate limiter tests pass; Redis-backed
limiter, env config, graceful fallback, unit tests all present). All P0/P1
issues are resolved.

**This loop — no new repair work possible**:

| Issue                                        | Scope        | Why not fixed this loop                                                                    |
| -------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------ |
| #305 (pnpm in `iterate.yml`)                 | CI           | **BLOCKED** — `workflows` permission required (GitHub App workflow-file protection)        |
| #650 (extract AI prompts from `on-pull.yml`) | DX           | **BLOCKED** — same `workflows` permission restriction                                      |
| #522 (Vercel deployment workflow)            | CI           | **BLOCKED** — new workflow file requires `workflows` permission                            |
| #502 (fast-path CI workflow)                 | CI           | **BLOCKED** — new workflow file requires `workflows` permission                            |
| #494 (domain layer)                          | Architecture | Large new `packages/domain` package — violates "minimal, atomic changes" repair constraint |
| #668 (AI cluster diagnostics)                | P3 feature   | Large feature (tRPC endpoint + UI + LLM integration); P3 priority                          |

**Fail-safe note**: All P0/P1 issues are resolved or addressed to the
maximum extent permitted by the token. The remaining CI/DX work requires
`workflows` permission (proven by real push rejection in loop 192). No
speculative changes were made.

---

## Baseline Health (re-run this loop)

- `pnpm test` → **2165/2165 passed** (148 files, ~42s)
- `pnpm lint` → **9/9 tasks successful**
- `pnpm typecheck` → **9/9 tasks successful**
- CI validator (`node tooling/qa/validate-ci-workflows.js`) → **0 errors /
  4 warnings** (all 4 warnings in `iterate.yml`, attributable to #305)

---

## Action Log

| Timestamp (UTC)  | Action                   | Target              | Result                                |
| ---------------- | ------------------------ | ------------------- | ------------------------------------- |
| 2026-08-18 23:00 | Phase 0 entry decision   | repo                | ISSUE MANAGER MODE (0 PRs, 82 issues) |
| 2026-08-18 23:01 | Verify no new issues/PRs | repo                | Unchanged since loop 194 (82 issues)  |
| 2026-08-18 23:02 | Permission probe         | #755–#595 label add | 403 addLabelsToLabelable (blocked)    |
| 2026-08-18 23:02 | Permission probe         | comment / close     | 403 addComment / closeIssue (blocked) |
| 2026-08-18 23:03 | Push capability probe    | perm-probe branch   | Push OK; branch deleted after probe   |
| 2026-08-18 23:05 | Baseline health — tests  | repo                | 2165/2165 passed (148 files)          |
| 2026-08-18 23:06 | Baseline health — lint   | repo                | 9/9 tasks successful                  |
| 2026-08-18 23:06 | Baseline health — tsc    | repo                | 9/9 tasks successful                  |
| 2026-08-18 23:07 | CI validator             | tooling/qa          | 0 errors / 4 warnings (all #305)      |
| 2026-08-18 23:08 | Spot-check 18 issues     | main code           | All PASS — no regressions             |
| 2026-08-18 23:10 | Defect scan              | src (console/TODO)  | None found (JSDoc examples only)      |
| 2026-08-18 23:11 | Repair-mode scan         | 6 unresolved issues | 4 blocked (workflows), 2 too large    |
| 2026-08-18 23:12 | This audit report        | docs/               | Loop 195 report                       |

---

## Skills & Subagents Used

- **Skills**: None of the project skills in `.opencode/skills` matched this
  issue-management loop (no agent-config, workflow-automation, security-
  research, or planning-with-files task was executed). The
  `github-workflow-automation` skill was evaluated in loop 192 for the #728
  workflow deployment; the blocker is a token permission, not workflow
  design — the skill would not change the outcome.
- **Subagents**: None spawned — all work this loop was direct tool
  execution (issue-state verification, spot-checks, baseline health, audit
  report). The issue set and codebase state were already mapped from prior
  loops; no parallel exploration was needed.

---

## Final State

- **State**: `waiting for human review`
- **Blocked on**:
  1. `issues: write` permission → label normalization (54 issues),
     duplicate closing (9 issues / 5 groups), issue consolidation
     (5 clusters)
  2. `workflows: write` permission → fix `iterate.yml` pnpm consistency
     (#305/#744), extract AI prompts (#650), Vercel deploy workflow
     (#522), fast-path CI (#502), deploy `security-audit.yml` (#728)
- **Open items for maintainer**:
  1. Apply the label normalization table (loop 192 STEP 1) with an
     `issues: write` token
  2. Close the 9 duplicates (STEP 2) and the 69 verified-resolved issues
  3. Merge the 5 consolidation clusters (STEP 3) once `issues: write`
     is available
  4. Run `bash scripts/deploy-security-workflows.sh` with a
     `workflows: write` token to complete #728
