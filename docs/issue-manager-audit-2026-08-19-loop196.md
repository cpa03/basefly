# Issue Manager Audit Report — 2026-08-19 (Loop 196)

## Executive Summary

- **Open PRs**: 0 at phase entry → **ISSUE MANAGER MODE** engaged directly.
- **Token permissions re-probed** (consistent with loops 159–195):
  - `issues: write` **NOT available** → issue label normalization, comments,
    closing, and creation remain **BLOCKED** (re-verified this loop with real
    attempts: `gh issue edit --add-label` → `403 addLabelsToLabelable`,
    `gh issue comment` → `403 addComment`, `gh issue close` → `403
    closeIssue`, `gh issue create` → `403 createIssue`).
  - `workflows: write` **NOT available** → `.github/workflows/*` changes
    remain blocked (GitHub App workflow-file protection proven in loop 192;
    `iterate.yml` still contains `npm ci` at lines 72 and 342).
  - `contents: write` **available** → branch pushes work (verified with a
    probe push + PR + close + branch delete this loop).
  - `pull-requests: write` **available** → PR creation/merge work (probe PR
    #1398 created, closed, and branch deleted this loop).
- **No new issues or PRs since loop 195**: open issue count unchanged at
  **82**; HEAD is loop 195's merged audit report (PR #1397). No new
  maintainer activity to react to.
- **Baseline health (re-run this loop)**: `pnpm test` **2165/2165 passed**
  (148 files, ~41s); `pnpm lint` **9/9 tasks successful**; `pnpm typecheck`
  **9/9 tasks successful**; CI validator **0 errors / 4 warnings** (all 4
  warnings attributable to the blocked #305 issue in `iterate.yml`).
- **Fresh spot-checks this loop (24 issues re-verified against `main`
  code)**: all remain resolved as previously recorded or newly verified —
  #492 (image sizes), #498 (RBAC), #500 (Clerk tests), #501 (Playwright
  E2E), #515 (CSRF), #549 (auth tests), #550 (coverage config), #551 (k8s
  router tests), #578 (health check dedup), #579 (env setup errors), #610
  (tRPC response format), #630 (pre-commit hooks), #663 (eslint-disable
  consolidation), #683 (ESLint/Prettier configs), #684 (root build script),
  #687 (barrel exports), #713 (common utils tests), #721 (authorization
  checks), #752 (CLI output utils), #754 (webhook idempotency tests), #755
  (composite index), #785 (duplicate next dep), #786 (webhook secret
  logging), #789 (peerDependencies).
- **No repair work possible this loop**: the 6 genuinely unresolved issues
  remain unchanged — 4 are **BLOCKED** on `workflows: write` (#305, #650,
  #522, #502), 1 violates the minimal-change repair constraint (#494), 1 is
  a large P3 feature (#668). No new code-level defect was found that could
  be fixed via PR (defect scan: no TODO/FIXME defects, no console.\* in
  production code, no lint warnings, no failing tests).

---

## Phase 0 — Entry Decision

| Step | Check       | Result                          |
| ---- | ----------- | ------------------------------- |
| 0.1  | Open PRs    | **0** → skip PR HANDLER MODE    |
| 0.2  | Open issues | **82** → **ISSUE MANAGER MODE** |

---

## STEP 1 — Issue Normalization (BLOCKED)

Unchanged from loops 192–195: **54 of 82 issues** need a category and/or
priority label change. Every `gh issue edit --add-label/--remove-label`
call returns `403 Resource not accessible by integration
(addLabelsToLabelable)` — re-verified this loop with a real attempt on
#789. **All label changes remain BLOCKED** — the recommended assignments
are captured in the loop 192 report (STEP 1) for maintainer application
once a token with `issues: write` is available.

---

## STEP 2 — Duplicate Detection (identification complete; closing BLOCKED)

9 duplicate issues across 5 groups (unchanged from loops 178–195; canonical
listed first). Closing remains blocked by `issues: write`:

| Canonical                           | Duplicates             | Rationale                                                                               |
| ----------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| #496 (P0 rate limiter Redis)        | #480                   | Same in-memory→Redis rate limiter scope                                                 |
| #501 (P1 Playwright E2E)            | #628, #724             | All three are "E2E test coverage"; #724's "only 6 flows" claim is stale (11 spec files) |
| #305 (pnpm CI consistency)          | #584, #670, #744, #595 | All five describe the same `npm ci` in workflows; #305 is the oldest and broadest       |
| #725 (API router integration tests) | #631                   | #631 is a subset (k8s/customer/stripe routers) of #725                                  |
| #523 (barrel tree-shaking)          | #667                   | #667 (export boundary audit) overlaps #523's audit scope                                |

---

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

Unchanged from loops 178–195; baseline health re-run confirms no
regressions. Fresh spot-checks executed this loop (all PASS):

| Issue | Priority | Evidence (verified 2026-08-19, loop 196)                                                                                                                           |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #492  | P3       | All `next/image` usages carry `sizes` attrs (blog-card, blog-posts, site-footer, sign-in-modal, video-scroll, comments — verified 7 files, 0 missing).              |
| #498  | P1       | `adminProcedure` + `isAdminEmail` in `packages/api/src/trpc.ts` (lines 254–331); `rbac.test.ts` + `authorization.test.ts` present.                                   |
| #500  | P1       | `packages/auth/clerk.test.ts` present (Clerk session verification coverage).                                                                                        |
| #501  | P1       | 11 E2E spec files in `tests/e2e/` (auth, billing, cluster, admin, subscription-workflows, etc.).                                                                    |
| #515  | P1       | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` present; CSRF wired into tRPC edge route and proxy.                                                                  |
| #549  | P1       | `packages/auth/clerk.test.ts`, `env.test.ts`, `logger.test.ts` present (auth module covered).                                                                       |
| #550  | P1       | `vitest.config.ts` line 16: coverage `include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`.                                                        |
| #551  | P1       | `packages/api/src/router/k8s-router.test.ts` + `k8s.test.ts` present (cluster CRUD covered).                                                                        |
| #578  | P3       | `packages/api/src/router/health_check.ts` no longer exists; single REST endpoint `apps/nextjs/src/app/api/health/route.ts` remains.                                  |
| #579  | P2       | `scripts/check-package-manager.js` (preinstall guard with clear pnpm instructions) + `.nvmrc` = `22.14.0` + CONTRIBUTING.md documents pnpm.                          |
| #610  | P2       | `packages/api/src/response.ts` defines `MutationResult<T>` / `QueryResult<T>`; all routers (admin, customer, k8s, stripe) use `satisfies` contracts.                 |
| #630  | P2       | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged`; `.husky/pre-push` present.                                                               |
| #663  | P2       | Only 6 non-test files use `eslint-disable`, each with explicit justification comments (rate limiter truthy checks, soft-delete unsafe calls, UI purity).             |
| #683  | P2       | `tooling/eslint-config/{base,nextjs,react}.js` + `tooling/prettier-config/index.mjs` present; root `format`/`format:fix` scripts wired.                              |
| #684  | P3       | Root `package.json` line 6: `"build": "pnpm env:validate && turbo build"`.                                                                                           |
| #687  | P3       | `index.ts` present in all packages: common, auth, api, stripe, ui, db (verified via `ls`).                                                                           |
| #713  | P2       | `packages/common/src/email.test.ts`, `icon-sizes.test.ts`, `animation.test.ts` present.                                                                             |
| #721  | P1       | Authorization checks: `isAdminEmail` + `adminProcedure` middleware in `packages/api/src/trpc.ts` (lines 254–331).                                                    |
| #752  | P2       | `tooling/qa/cli-output.js` present and consumed by `validate-ci-workflows.js` + `env-validate.js`.                                                                   |
| #754  | P2       | `packages/stripe/src/webhook-idempotency.test.ts` — 21 tests covering registration, dedup, cleanup, race conditions.                                                 |
| #755  | P2       | `packages/db/prisma/schema.prisma` lines 40–44: `@@index([plan])`, `@@index([authUserId, plan, stripeCurrentPeriodEnd])` etc.                                        |
| #785  | bug      | `packages/stripe/package.json` has **no** `next` dependency at all — duplicate entry removed.                                                                        |
| #786  | security | Webhook route (`apps/nextjs/src/app/api/webhooks/stripe/route.ts`) logs only `requestId`/`identifier`; no secret slicing; signature errors log sanitized `message` only. |
| #789  | enh      | `packages/ui/package.json` uses `peerDependencies: { react: "^19.0.0", react-dom: "^19.0.0" }` (fix merged PR #1365).                                                |

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

- `pnpm test` → **2165/2165 passed** (148 files, ~41s)
- `pnpm lint` → **9/9 tasks successful**
- `pnpm typecheck` → **9/9 tasks successful**
- CI validator (`node tooling/qa/validate-ci-workflows.js`) → **0 errors /
  4 warnings** (all 4 warnings in `iterate.yml`, attributable to #305)

---

## Action Log

| Timestamp (UTC)  | Action                   | Target              | Result                                |
| ---------------- | ------------------------ | ------------------- | ------------------------------------- |
| 2026-08-19 00:10 | Phase 0 entry decision   | repo                | ISSUE MANAGER MODE (0 PRs, 82 issues) |
| 2026-08-19 00:11 | Verify no new issues/PRs | repo                | Unchanged since loop 195 (82 issues)  |
| 2026-08-19 00:12 | Permission probe         | #789 label add      | 403 addLabelsToLabelable (blocked)    |
| 2026-08-19 00:12 | Permission probe         | comment / close     | 403 addComment / closeIssue (blocked) |
| 2026-08-19 00:12 | Permission probe         | issue create        | 403 createIssue (blocked)             |
| 2026-08-19 00:13 | Push capability probe    | perm-probe branch   | Push OK; PR #1398 created+closed; branch deleted |
| 2026-08-19 00:18 | Baseline health — tests  | repo                | 2165/2165 passed (148 files)          |
| 2026-08-19 00:19 | Baseline health — lint   | repo                | 9/9 tasks successful                  |
| 2026-08-19 00:19 | Baseline health — tsc    | repo                | 9/9 tasks successful                  |
| 2026-08-19 00:20 | CI validator             | tooling/qa          | 0 errors / 4 warnings (all #305)      |
| 2026-08-19 00:22 | Spot-check 24 issues     | main code           | All PASS — no regressions             |
| 2026-08-19 00:30 | Defect scan              | src (console/TODO)  | None found (JSDoc examples only)      |
| 2026-08-19 00:31 | Repair-mode scan         | 6 unresolved issues | 4 blocked (workflows), 2 too large    |
| 2026-08-19 00:33 | This audit report        | docs/               | Loop 196 report                       |

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