# Issue Manager Audit Report — 2026-08-18 (Loop 193)

## Executive Summary

- **Open PRs**: 0 at phase entry → **ISSUE MANAGER MODE** engaged directly.
- **Token permissions re-probed** (consistent with loops 159–192):
  - `issues: write` **NOT available** → issue label normalization, comments,
    closing, and creation remain **BLOCKED**.
  - `workflows: write` **NOT available** → `.github/workflows/*` changes
    remain blocked (proven by real push rejection in loop 192).
  - `contents: write` + `pull-requests: write` **available** → branch pushes
    and PR creation/merge work.
- **No new issues or PRs since loop 192**: open issue count unchanged at
  **82**; HEAD is loop 192's merged audit report (PR #1394). No new
  maintainer activity to react to.
- **Baseline health (re-run this loop)**: `pnpm test` **2165/2165 passed**
  (148 files); CI validator **0 errors / 4 warnings** (all 4 warnings
  attributable to the blocked #305 issue in `iterate.yml`).
- **Fresh spot-checks this loop** (17 issues re-verified against `main`
  code): all remain resolved as previously recorded — #483 (Stripe
  transactions), #486 (OTEL), #487 (Redis cache), #502 (fast-path CI
  documented), #521 (hydration), #579 (env error messages), #580
  (monitoring), #581 (test infra), #590 (UI audit doc), #609 (Zod
  consolidation), #610 (tRPC error formatter), #634 (TS strict), #636 (ISR
  decision documented), #664 (no console in db), #666 (error boundary),
  #683 (ESLint root config), #684 (root build), #685 (React perf), #687
  (barrel exports), #688 (proxy), #719 (root tsconfig), #722 (env
  validation), #754 (Stripe idempotency), #755 (composite index).
- **No repair work possible this loop**: the 5 genuinely unresolved issues
  remain unchanged — 3 are **BLOCKED** on `workflows: write` (#305, #650,
  #522), 1 violates the minimal-change repair constraint (#494), 1 is a
  large P3 feature (#668). No new code-level defect was found that could be
  fixed via PR.

---

## Phase 0 — Entry Decision

| Step | Check       | Result                          |
| ---- | ----------- | ------------------------------- |
| 0.1  | Open PRs    | **0** → skip PR HANDLER MODE    |
| 0.2  | Open issues | **82** → **ISSUE MANAGER MODE** |

---

## STEP 1 — Issue Normalization (BLOCKED)

Unchanged from loop 192: **54 of 82 issues** need a category and/or
priority label change. Every `gh issue edit --add-label/--remove-label`
call returns `403 Resource not accessible by integration
(addLabelsToLabelable)`. **All label changes remain BLOCKED** — the
recommended assignments are captured in the loop 192 report (STEP 1) for
maintainer application once a token with `issues: write` is available.

---

## STEP 2 — Duplicate Detection (identification complete; closing BLOCKED)

9 duplicate issues across 5 groups (unchanged from loops 178–192; canonical
listed first). Closing remains blocked by `issues: write`:

| Canonical                           | Duplicates             | Rationale                                                                               |
| ----------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| #496 (P0 rate limiter Redis)        | #480                   | Same in-memory→Redis rate limiter scope                                                 |
| #501 (P1 Playwright E2E)            | #628, #724             | All three are "E2E test coverage"; #724's "only 6 flows" claim is stale (12 spec files) |
| #305 (pnpm CI consistency)          | #584, #670, #744, #595 | All five describe the same `npm ci` in workflows; #305 is the oldest and broadest       |
| #725 (API router integration tests) | #631                   | #631 is a subset (k8s/customer/stripe routers) of #725                                  |
| #523 (barrel tree-shaking)          | #667                   | #667 (export boundary audit) overlaps #523's audit scope                                |

---

## STEP 3 — Verified-Resolved Issues (68 issues)

Unchanged from loops 178–192; baseline health re-run confirms no
regressions. Fresh spot-checks executed this loop (all PASS):

| Issue | Priority | Evidence (verified 2026-08-18, loop 193)                                                                                                                                              |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #483  | P2       | Stripe transaction handling present: `packages/stripe/src/{stripe-instance,webhooks,plans,client,integration}.ts` use `$transaction`/tx patterns; `webhooks.test.ts` covers tx paths. |
| #486  | P1       | OpenTelemetry wired: `packages/common/src/observability/index.ts`, `packages/api/src/trpc.ts`, `apps/nextjs/src/instrumentation.ts`; `observability/index.test.ts` exists.            |
| #487  | P1       | Redis cache implemented: `packages/common/src/cache/index.ts` + `cache.test.ts`; env config in `env.ts`; used by `distributed-rate-limiter.ts`.                                       |
| #502  | P2       | Fast-path CI documented in `docs/ci-cd.md` (lines 158, 196 — "fast-path jobs", commit message `ci: add fast-path quick-check workflow (closes #502)`).                                |
| #521  | P2       | Hydration handling present in `mode-toggle.tsx`, `keyboard-shortcuts-help.tsx`, `modal-provider.tsx`, `command-palette.tsx`, `layout.tsx`; `use-client-dictionary.test.ts` exists.    |
| #579  | P2       | Human-readable env validation messages in `packages/common/src/config/env.ts` (lines 136–182: "Missing required/recommended environment variables").                                  |
| #580  | P2       | Monitoring/health: `apps/nextjs/src/lib/health-check.ts` + `health-check.test.ts`; observability package present.                                                                     |
| #581  | P2       | Test infra: `test:coverage` script + `@vitest/coverage-v8` in root package.json.                                                                                                      |
| #590  | P2       | UI audit doc exists: `docs/client-component-audit-2026-08-17.md`.                                                                                                                     |
| #609  | P1       | Zod schemas consolidated: `packages/api/src/router/schemas.ts`.                                                                                                                       |
| #610  | P2       | tRPC response format: `errorFormatter` configured in `packages/api/src/trpc.ts` (line 66).                                                                                            |
| #634  | P1       | TS strict: `"strict": true` in `tooling/typescript-config/base.json` (line 9).                                                                                                        |
| #636  | P2       | ISR decision documented in dashboard page: "ISR intentionally not used — `force-dynamic` forces revalidate=0" (deliberate freshness-over-cache choice).                               |
| #664  | P2       | `packages/db/src` contains no `console.*` calls (pino logging only).                                                                                                                  |
| #666  | P1       | Error boundary exists: `apps/nextjs/src/app/error.tsx`.                                                                                                                               |
| #683  | P2       | Root ESLint config: `.eslintrc.cjs` present.                                                                                                                                          |
| #684  | P2       | Root build: `"build": "pnpm env:validate && turbo build"` in package.json.                                                                                                            |
| #685  | P2       | React perf: 44 files use `memo`/`useMemo`/`useCallback` across `apps/nextjs/src/components` + `packages/ui/src`.                                                                      |
| #687  | P2       | Barrel exports exist: `packages/{api,common,ui}/src/index.ts`.                                                                                                                        |
| #688  | P1       | Middleware replaced by `apps/nextjs/src/proxy.ts` (Next.js 16 pattern); no `middleware.ts`.                                                                                           |
| #719  | P2       | Root `tsconfig.json` present (workspace references).                                                                                                                                  |
| #722  | P1       | Env validation: `packages/common/src/config/env.ts` + tests.                                                                                                                          |
| #754  | P1       | Stripe webhook idempotency: `webhook-idempotency.ts` + test; `webhooks.test.ts` covers tx paths.                                                                                      |
| #755  | P2       | Composite index on customer: `@@index([authUserId, plan, stripeCurrentPeriodEnd])` in Prisma schema.                                                                                  |

---

## STEP 4 — Repair Mode

**Selection**: Highest-priority open issue is #496 (P0, security) — verified
**already resolved** in `main` (98/98 rate limiter tests pass; acceptance
criteria all met: Redis-backed limiter, env config, graceful fallback, unit
tests, docs at `docs/redis-setup.md`).

**Work delivered in prior loops** (all merged): #728 security-workflow
deploy script fix (PR #1392), #632 error-logging audit PASS (PR #1393),
loop 192 audit report (PR #1394).

**This loop — no new repair work possible**:

| Issue                                        | Scope        | Why not fixed this loop                                                                    |
| -------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------ |
| #305 (pnpm in `iterate.yml`)                 | CI           | **BLOCKED** — `workflows` permission required (push rejection proven in loop 192)          |
| #650 (extract AI prompts from `on-pull.yml`) | DX           | **BLOCKED** — same `workflows` permission restriction                                      |
| #522 (Vercel deployment workflow)            | CI           | **BLOCKED** — new workflow file requires `workflows` permission                            |
| #494 (domain layer)                          | Architecture | Large new `packages/domain` package — violates "minimal, atomic changes" repair constraint |
| #668 (AI cluster diagnostics)                | P3 feature   | Large feature (tRPC endpoint + UI + LLM integration); P3 priority                          |

**Fail-safe note**: All P0/P1 issues are resolved or addressed to the
maximum extent permitted by the token. The remaining CI/DX work requires
`workflows` permission (proven by real push rejection in loop 192). No
speculative changes were made.

---

## Baseline Health (re-run this loop)

- `pnpm test` → **2165/2165 passed** (148 files, ~43s)
- Rate limiter suites → **98/98 passed** (re-verified in prior loops;
  covered by the full run)
- CI validator (`node tooling/qa/validate-ci-workflows.js`) → **0 errors /
  4 warnings** (all 4 warnings in `iterate.yml`, attributable to #305)

---

## Action Log

| Timestamp (UTC)  | Action                   | Target              | Result                                |
| ---------------- | ------------------------ | ------------------- | ------------------------------------- |
| 2026-08-18 20:20 | Phase 0 entry decision   | repo                | ISSUE MANAGER MODE (0 PRs, 82 issues) |
| 2026-08-18 20:21 | Verify no new issues/PRs | repo                | Unchanged since loop 192 (82 issues)  |
| 2026-08-18 20:22 | Baseline health — tests  | repo                | 2165/2165 passed (148 files)          |
| 2026-08-18 20:23 | CI validator             | tooling/qa          | 0 errors / 4 warnings (all #305)      |
| 2026-08-18 20:24 | Spot-check 24 issues     | main code           | All PASS — no regressions             |
| 2026-08-18 20:25 | Repair-mode scan         | 5 unresolved issues | 3 blocked (workflows), 2 too large    |
| 2026-08-18 20:26 | This audit report        | docs/               | Loop 193 report                       |

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
  2. `workflows: write` permission → deploy `security-audit.yml` (#728),
     fix `iterate.yml` pnpm consistency (#305/#744), extract AI prompts
     (#650), Vercel deploy workflow (#522)
- **Open items for maintainer**:
  1. Run `bash scripts/deploy-security-workflows.sh` with a
     `workflows: write` token to complete #728
  2. Apply the label normalization table (loop 192 STEP 1) with an
     `issues: write` token
  3. Close the 9 duplicates (STEP 2) and the 68 verified-resolved issues
