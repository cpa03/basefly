# Issue Manager Audit Report — 2026-08-18 (Loop 194)

## Executive Summary

- **Open PRs**: 0 at phase entry → **ISSUE MANAGER MODE** engaged directly.
- **Token permissions re-probed** (consistent with loops 159–193):
  - `issues: write` **NOT available** → issue label normalization, comments,
    closing, and creation remain **BLOCKED** (re-verified this loop with a
    real attempt: `gh issue edit 789 --add-label P3` → `403
addLabelsToLabelable`).
  - `workflows: write` **NOT available** → `.github/workflows/*` changes
    remain blocked (push rejection proven in loop 192).
  - `contents: write` + `pull-requests: write` **available** → branch pushes
    and PR creation/merge work.
- **No new issues or PRs since loop 193**: open issue count unchanged at
  **82**; HEAD is loop 193's merged audit report (PR #1395). No new
  maintainer activity to react to.
- **Baseline health (re-run this loop)**: `pnpm test` **2165/2165 passed**
  (148 files); `pnpm lint` **9/9 tasks successful**; `pnpm typecheck` **9/9
  tasks successful**; CI validator **0 errors / 4 warnings** (all 4 warnings
  attributable to the blocked #305 issue in `iterate.yml`).
- **Fresh spot-checks this loop** (18 issues re-verified against `main`
  code): all remain resolved as previously recorded — #488 (circular-dep
  CI), #492 (image sizes), #498 (RBAC), #500 (Clerk auth e2e), #501
  (Playwright E2E), #503 (JSDoc), #515 (CSRF), #549 (auth tests), #550
  (nextjs coverage config), #551 (k8s router tests), #578 (no duplicate
  health router), #610 (response.ts), #630 (pre-commit hooks), #663
  (eslint-disable count down to 5), #705 (Docker), #706 (devcontainer),
  #708 (bundle analyzer), #752 (CLI output utils), #785/#786/#789 (stripe
  dep/webhook/UI peerDeps).
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
(addLabelsToLabelable)` — re-verified this loop with a real attempt on
#789. **All label changes remain BLOCKED** — the recommended assignments
are captured in the loop 192 report (STEP 1) for maintainer application
once a token with `issues: write` is available.

---

## STEP 2 — Duplicate Detection (identification complete; closing BLOCKED)

9 duplicate issues across 5 groups (unchanged from loops 178–193; canonical
listed first). Closing remains blocked by `issues: write`:

| Canonical                           | Duplicates             | Rationale                                                                               |
| ----------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| #496 (P0 rate limiter Redis)        | #480                   | Same in-memory→Redis rate limiter scope                                                 |
| #501 (P1 Playwright E2E)            | #628, #724             | All three are "E2E test coverage"; #724's "only 6 flows" claim is stale (11 spec files) |
| #305 (pnpm CI consistency)          | #584, #670, #744, #595 | All five describe the same `npm ci` in workflows; #305 is the oldest and broadest       |
| #725 (API router integration tests) | #631                   | #631 is a subset (k8s/customer/stripe routers) of #725                                  |
| #523 (barrel tree-shaking)          | #667                   | #667 (export boundary audit) overlaps #523's audit scope                                |

---

## STEP 3 — Verified-Resolved Issues (69 issues)

Unchanged from loops 178–193; baseline health re-run confirms no
regressions. Fresh spot-checks executed this loop (all PASS):

| Issue | Priority | Evidence (verified 2026-08-18, loop 194)                                                                                                |
| ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| #488  | P2       | `check:circular` (madge) in root `package.json` (lines 7, 29, 46) — wired into `ci:check` and `dx:check`.                               |
| #492  | P3       | `sizes="36px"` present in `apps/nextjs/src/components/site-footer.tsx` (line 37).                                                       |
| #498  | P1       | `requireRole` at `packages/api/src/trpc.ts` (lines 345–349, 423) + `packages/api/src/rbac.test.ts` present.                             |
| #500  | P1       | `tests/e2e/auth.spec.ts` + `authorization-bypass.spec.ts` present (Clerk flows covered).                                                |
| #501  | P1       | `tests/e2e/` — 11 spec files + `fixtures.ts`; `playwright.config.ts` present.                                                           |
| #503  | P2       | JSDoc blocks present in routers: `admin.ts` (2), `auth.ts` (2), `customer.ts` (4).                                                      |
| #515  | P1       | CSRF middleware: `apps/nextjs/src/lib/csrf.ts` present; CSRF referer validation referenced in `packages/api/src/trpc.ts` (lines 81–96). |
| #549  | P1       | `packages/auth/{clerk,env,logger}.test.ts` present (0% coverage claim stale).                                                           |
| #550  | P1       | `vitest.config.ts` line 16: `include: ["packages/**/*", "apps/nextjs/src/**/*"]`; setup at `apps/nextjs/src/test/setup.ts`.             |
| #551  | P1       | `packages/api/src/router/k8s-router.test.ts` present.                                                                                   |
| #578  | P3       | No `health*.ts` router in `packages/api/src/router/`; `hello.ts` present (renamed health_check, commit 25694e0).                        |
| #610  | P2       | `packages/api/src/response.ts` present (documented `MutationResult`/`QueryResult` contracts).                                           |
| #630  | P2       | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm lint-staged`.                                                             |
| #663  | P2       | Only **5** `eslint-disable` comments remain across non-test source (down from 6 in loop 189), each justified.                           |
| #705  | P2       | `Dockerfile` + `docker-compose.yml` present at repo root.                                                                               |
| #706  | P3       | `.devcontainer/devcontainer.json` present (Node 22 image, github-cli + docker-in-docker).                                               |
| #708  | P3       | `@next/bundle-analyzer` 16.2.7 + `build:analyze` script in `apps/nextjs/package.json`.                                                  |
| #752  | DX       | `tooling/qa/cli-output.js` present (shared CLI output formatting).                                                                      |
| #785  | P2       | `packages/stripe/package.json` contains no `next` dependency — phantom issue confirmed.                                                 |
| #786  | P1       | `packages/stripe/src/webhooks.ts` — no secret/whsec logging; pino logger only.                                                          |
| #789  | P1       | `packages/ui/package.json` declares `peerDependencies: react ^19.0.0`, `react-dom ^19.0.0`.                                             |

---

## STEP 4 — Repair Mode

**Selection**: Highest-priority open issue is #496 (P0, security) — verified
**already resolved** in `main` (98/98 rate limiter tests pass; acceptance
criteria all met: Redis-backed limiter, env config, graceful fallback, unit
tests, docs at `docs/redis-setup.md`). All P0/P1 issues are resolved.

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

- `pnpm test` → **2165/2165 passed** (148 files, ~38s)
- `pnpm lint` → **9/9 tasks successful**
- `pnpm typecheck` → **9/9 tasks successful**
- CI validator (`node tooling/qa/validate-ci-workflows.js`) → **0 errors /
  4 warnings** (all 4 warnings in `iterate.yml`, attributable to #305)

---

## Action Log

| Timestamp (UTC)  | Action                   | Target              | Result                                |
| ---------------- | ------------------------ | ------------------- | ------------------------------------- |
| 2026-08-18 21:05 | Phase 0 entry decision   | repo                | ISSUE MANAGER MODE (0 PRs, 82 issues) |
| 2026-08-18 21:06 | Verify no new issues/PRs | repo                | Unchanged since loop 193 (82 issues)  |
| 2026-08-18 21:07 | Permission probe         | #789 label edit     | 403 addLabelsToLabelable (blocked)    |
| 2026-08-18 21:12 | Baseline health — tests  | repo                | 2165/2165 passed (148 files)          |
| 2026-08-18 21:14 | Baseline health — lint   | repo                | 9/9 tasks successful                  |
| 2026-08-18 21:14 | Baseline health — tsc    | repo                | 9/9 tasks successful                  |
| 2026-08-18 21:15 | CI validator             | tooling/qa          | 0 errors / 4 warnings (all #305)      |
| 2026-08-18 21:16 | Spot-check 21 issues     | main code           | All PASS — no regressions             |
| 2026-08-18 21:17 | Defect scan              | src (TODO/console)  | None found (JSDoc examples only)      |
| 2026-08-18 21:18 | Repair-mode scan         | 5 unresolved issues | 3 blocked (workflows), 2 too large    |
| 2026-08-18 21:19 | This audit report        | docs/               | Loop 194 report                       |

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
  3. Close the 9 duplicates (STEP 2) and the 69 verified-resolved issues
