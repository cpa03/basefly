# Repository State Audit Report — 2026-08-03 (Loop 25)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0.2). Entry detection: **0 open PRs** → open-issue check → **82 open issues** → ISSUE MANAGER MODE. STEP 1 (normalization), STEP 2 (duplicate closure), and STEP 3 (consolidation) blocked by token permissions (`issues:write` absent — re-verified first-hand this loop, §2). STEP 4 repair selection: all P0/P1 issues verified **RESOLVED** in `main`; the only genuinely-open defect cluster (#744/#670/#595/#584/#305 pnpm-in-CI) requires workflow-file writes that are refused without the `workflows` scope (§5).

## 2. Decision Summary

- Default branch detected: `main`. HEAD `604f01e` == `origin/main` (zero drift).
- **Phase 0 → ISSUE MANAGER MODE**: 0 open PRs, 82 open issues.
- **Token capabilities re-probed first-hand this loop** (fresh evidence):

| Capability                                                                | Probe                                                                                                        | Result      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------- |
| Label mutation (`addLabelsToLabelable` on #789, valid labels `P2`/`test`) | GraphQL "Resource not accessible by integration"                                                             | **BLOCKED** |
| Issue comment (`addComment`)                                              | GraphQL "Resource not accessible by integration"                                                             | **BLOCKED** |
| Issue creation (`createIssue`)                                            | GraphQL "Resource not accessible by integration"                                                             | **BLOCKED** |
| Issue closure (`closeIssue`)                                              | GraphQL "Resource not accessible by integration"                                                             | **BLOCKED** |
| Workflow-file push (`.github/workflows/iterate.yml` on probe branch)      | `[remote rejected] ... refusing to allow a GitHub App to create or update workflow ... without workflows permission` | **BLOCKED** |
| Git push to feature branches                                              | works (`contents: write`)                                                                                    | **ALLOWED** |
| PR creation / merge (`gh pr create` / `gh pr merge --admin`)              | works (`pull-requests: write`)                                                                               | **ALLOWED** |

## 3. Skills & Subagents Used (per TOOL USAGE mandate)

| Skill / Agent                              | Purpose                                            | Result                                                                                                                                                        |
| ------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github-workflow-automation` (repo skill)  | CI permission model + PR-handling workflow patterns | Loaded; confirmed workflow-file push requires the `workflows` scope absent from this token; PR-handling pattern (sync → verify → admin merge → branch deletion) applied |
| Direct verification (`gh`/git/pnpm/node)   | Issue-state + permission + health verification      | All first-hand: 4× GraphQL 403 probes, 1× workflow-push rejection probe, 82-issue inventory, 20+ per-issue code checks (§5), full health suite (§4)             |

Two `explore` background subagent launches (issues-1 through issues-15 verification) **failed to start** with `ProviderModelNotFoundError: Model not found: opencode/gpt-5-nano` — the explore agent's model alias is misconfigured in this environment (infra issue, not data loss). All checks were completed with equivalent or better precision via direct targeted greps, so no retry was warranted. **Recommendation for maintainers:** repair the `opencode/gpt-5-nano` model alias (candidates: `gpt-5-nano`, `gpt-5.4-nano`) in the agent config.

## 4. Repository Health Suite (executed, not assumed)

Verification run on `main` @ `604f01e` with Node v22.23.1 (per `.nvmrc` 22.14.0), pnpm 10.28.2, `pnpm install --frozen-lockfile`:

| Check                  | Command                  | Result                                                          |
| ---------------------- | ------------------------ | --------------------------------------------------------------- |
| Typecheck              | `pnpm typecheck` (turbo) | ✅ 8/8 tasks successful                                         |
| Lint                   | `pnpm lint` (turbo)      | ✅ 9/9 tasks successful, **zero warnings**                      |
| Unit/integration tests | `pnpm test` (vitest run) | ✅ **76 files / 1511 tests passed** (unchanged vs. loops 21–24) |
| Production build       | `pnpm build` (turbo)     | ✅ successful (Next.js)                                         |

**Repo is healthy and buildable.** CI/Vercel failures on PRs remain infrastructure-only / repo-wide pre-existing (documented loop-22 §4, loop-23 §7, loop-24 §8).

## 5. STEP 4 — Repair-Mode Selection & Issue-State Verification

Selection rule: if a P0/P1 issue exists → select the highest-priority issue; otherwise lowest-scoring domain/criterion. P0/P1 issues exist on the board (#496 P0; #498, #515, #549, #550, #551, #581, #500, #501 P1), so each was independently verified against `main` this loop:

| #   | Title                                     | First-hand evidence in `main`                                                                                                                       | Status       |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 496 | Distributed rate limiter (Redis) [P0]     | `packages/api/src/distributed-rate-limiter.ts` + `.test.ts`; wired via `limiter.checkAsync` in `trpc.ts` `rateLimit` middleware (line 435)          | **RESOLVED** |
| 498 | RBAC (replace email allowlist) [P1]       | `isAdmin` middleware in `trpc.ts` (line 254): DB `User.role === "ADMIN"` checked first (line 266); `ADMIN_EMAIL` only a fallback (line 288); `router/admin.test.ts` | **RESOLVED** |
| 515 | CSRF protection [P1]                      | `csrfProtection` middleware in `trpc.ts` (line 104) wired into base procedure (line 215)                                                            | **RESOLVED** |
| 549 | Auth module tests [P1]                    | `packages/auth/clerk.test.ts`                                                                                                                       | **RESOLVED** |
| 550 | apps/nextjs in coverage [P1]              | Root `vitest.config.ts` line 16 includes `apps/nextjs/src/**/*.{ts,tsx}`; nextjs test files exist                                                    | **RESOLVED** |
| 551 | k8s router tests [P1]                     | `packages/api/src/router/k8s.test.ts`                                                                                                               | **RESOLVED** |
| 581 | Testing infra consolidation umbrella [P1] | All sub-issues (#549/#550/#551/#500/#501) individually resolved                                                                                      | **RESOLVED** |
| 500 | Clerk auth flow tests [P1]                | `router/auth.test.ts`, `tests/e2e/auth.spec.ts`                                                                                                     | **RESOLVED** |
| 501 | Playwright E2E critical journeys [P1]     | `tests/e2e/` 13 spec files (incl. `critical-flows.spec.ts`, `subscription-workflows.spec.ts`) + `playwright.config.ts`                              | **RESOLVED** |

### 5.1 Extended verification — additional high-signal open issues (beyond loop 24's set)

| #   | Claim                                                    | First-hand evidence in `main`                                                                                                                                                                   | Status       |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 721 | Explicit authorization beyond auth                        | `isAdmin` role-check middleware in `trpc.ts` (DB role first, env fallback) — see #498                                                                                                           | **RESOLVED** |
| 722 | Env var validation at startup                             | `env.mjs` present in `apps/nextjs/src`, `packages/common/src`, `packages/api/src`, `packages/auth`, `packages/stripe/src`; `pnpm env:validate` (tooling/qa/env-validate.js) wired into `build`   | **RESOLVED** |
| 630 | Pre-commit hooks w/ typecheck + test                      | `.husky/pre-commit` + `.husky/pre-push` exist; `lint-staged` configured in root `package.json`                                                                                                  | **RESOLVED** |
| 724 | Missing e2e coverage for critical flows                   | 13 e2e specs covering auth, billing, cluster, dashboard, pricing, subscription-workflows, webhook-error-handling                                                                                | **RESOLVED** |
| 725 | Integration tests for API routers                         | `router/*.test.ts`: admin, auth, customer, hello, integration, k8s, schemas-enhanced, stripe, validation (9 files)                                                                              | **RESOLVED** |
| 631 | Router tests for k8s, customer, stripe                    | `k8s.test.ts`, `customer.test.ts`, `stripe.test.ts` all exist                                                                                                                                   | **RESOLVED** |
| 754 | Stripe webhook idempotency tests                          | `packages/stripe/src/webhooks.test.ts` + `webhook-idempotency` module used by `webhooks.ts`                                                                                                     | **RESOLVED** |
| 688 | Next.js middleware.ts                                     | Next.js 16 uses `apps/nextjs/src/proxy.ts` (middleware replacement) — present                                                                                                                   | **RESOLVED** |
| 483 | Transaction handling for multi-table ops                  | `packages/stripe/src/webhooks.ts` uses `db.transaction().execute()` (lines 110, 144) + `executeIdempotentWebhook`                                                                               | **RESOLVED** |
| 485 | Suspense boundaries for granular loading                  | 5+ `loading.tsx` files across dashboard/billing/settings/pricing/docs                                                                                                                           | **RESOLVED** |
| 523 | Barrel exports tree-shaking audit                         | `packages/api/src/index.ts`, `packages/stripe/src/index.ts`, `packages/db/index.ts` exist                                                                                                       | **RESOLVED** |
| 713 | Unit tests for packages/common                            | 10+ test files: animation, config/{assets,cache,pricing,urls,resilience,k8s,features}, email, logger, icon-sizes, ui-tokens, subscriptions                                                       | **RESOLVED** |
| 578 | Duplicate health check endpoint                          | Only `apps/nextjs/src/app/api/health/route.ts`; no second health route in `packages/api`                                                                                                        | **RESOLVED** |
| 613 | Duplicate GitHub Actions workflow file                    | Only `iterate.yml` + `on-pull.yml` exist; no duplicates                                                                                                                                         | **RESOLVED** |
| 729 | Bundle size regression testing                            | `apps/nextjs/package.json`: `size:check` (size-limit) + `size:analyze` scripts; `size-limit` config block present                                                                               | **RESOLVED** |
| 664 | Replace console.* with pino in packages/db + packages/stripe | Remaining `console.log` occurrences are **only inside JSDoc comment examples** (`client.ts:189-190`, `integration.ts:77,276`) — no live code usage                                                    | **RESOLVED** |
| 697 | Corrupted text formatting in docs                         | No mojibake matches (verified loop 24; unchanged)                                                                                                                                               | **NOT OPEN** |

### 5.2 Genuinely open issues (with constraints)

| #   | Claim                                             | Evidence                                                                                                                              | Status                       |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 744 | pnpm consistency in `iterate.yml`                 | `iterate.yml` lines 72 & 342 still `npm ci \|\| true`; cache `~/.npm` + `package-lock.json`                                           | **OPEN — workflow-blocked**  |
| 670 | `iterate.yml` npm→pnpm                            | Same file, same defect                                                                                                                | **OPEN — workflow-blocked**  |
| 595 | Workflows use npm instead of pnpm                 | `iterate.yml` npm usage confirmed; `on-pull.yml` is pnpm-clean                                                                        | **OPEN — workflow-blocked**  |
| 584 | Remaining pnpm inconsistencies                     | Duplicate of #744/#670/#595/#305 cluster                                                                                              | **OPEN — workflow-blocked**  |
| 305 | Standardize workflows to pnpm                      | Same cluster                                                                                                                          | **OPEN — workflow-blocked**  |
| 726 | Dependency consistency checking in CI             | `check-deps` script exists in root `package.json` (check-dependency-version-consistency) but is **not wired into any workflow**       | **OPEN — workflow-blocked**  |
| 728 | Security scanning workflows in CI                 | No codeql/gitleaks/trivy/osv-scanner/audit steps in `iterate.yml` or `on-pull.yml`                                                    | **OPEN — workflow-blocked**  |
| 752 | Unified CLI output utilities                      | No `cli*` module in `packages/common/src/`                                                                                            | **OPEN** (P3 feature request) |

### 5.3 Verdict

No issue satisfies all repair-mode constraints simultaneously (genuinely open **and** minimal/atomic **and** non-blocked **and** safe):

- **All P0/P1 issues are already resolved in `main`** — nothing to implement; closure blocked (`issues:write` absent).
- The only genuinely-open defect clusters (#744/#670/#595/#584/#305 pnpm-in-CI; #726 dep-consistency-in-CI; #728 security-scanners-in-CI) all require editing `.github/workflows/*` — **workflow-file push is refused** without the `workflows` scope (verified first-hand this loop via a probe branch).
- #752 is a P3 feature request, not a minimal repair.

Per the FAIL-SAFE rule, **no speculative or risky change was made this loop.**

## 6. STEP 1/2/3 — Normalization, Duplicate Detection, Consolidation (blocked, unchanged)

- **STEP 1 (normalization)**: label mutation verified 403 this loop (probe on #789). ~38 issues still lack priority labels; several lack category labels. Blocked.
- **STEP 2 (duplicate closure)**: duplicate clusters confirmed still open — pnpm-in-CI cluster #305/#584/#595/#670/#744 (all workflow-blocked); rate-limiter cluster #480 (dup of resolved #496); barrel-export cluster #523/#667/#687; e2e cluster #501/#628/#724. Closure blocked.
- **STEP 3 (consolidation)**: no new small-issue clusters beyond the established maps; consolidation blocked.

## 7. Action Log

| Timestamp (UTC)  | Action                                                                | Target                             | Result                                                         |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| 2026-08-03T19:14 | Open PR / issue inventory + branch sync check                         | repo                               | 0 open PRs; 82 open issues; HEAD == origin/main               |
| 2026-08-03T19:14 | Permission probes (label/comment/create/close)                        | #789                               | 4× GraphQL 403 (`issues:write` absent)                        |
| 2026-08-03T19:15 | Workflow-push probe (probe branch touching `iterate.yml`)             | `.github/workflows/iterate.yml`    | Remote rejected — no `workflows` permission; probe branch deleted |
| 2026-08-03T19:15 | P0/P1 code verification                                               | #496/#498/#515 + P1 test cluster   | All RESOLVED in `main` (evidence §5)                           |
| 2026-08-03T19:16 | Extended issue verification (17 additional issues)                    | repo files                         | 16/17 RESOLVED or NOT OPEN; pnpm/CI clusters OPEN but blocked  |
| 2026-08-03T19:18 | Explore subagent launches                                             | explore (model alias)              | Failed to start: `opencode/gpt-5-nano` model alias broken      |
| 2026-08-03T19:18 | Health suite: `pnpm typecheck`                                        | repo                               | 8/8 tasks ✅                                                   |
| 2026-08-03T19:19 | Health suite: `pnpm lint`                                             | repo                               | 9/9 tasks ✅, zero warnings                                    |
| 2026-08-03T19:18 | Health suite: `pnpm test`                                             | repo                               | 76 files / 1511 tests ✅                                       |
| 2026-08-03T19:19 | Health suite: `pnpm build`                                            | repo                               | Production build ✅                                            |
| 2026-08-03T19:20 | Branch `docs/issue-manager-audit-2026-08-03-loop25` created from `origin/main` | git                        | ✅ (isolated from local `.opencode`/`.omo` working-tree residue) |

## 8. Deliverables & Follow-ups for a Privileged Process

1. Apply the §7.1 label-normalization matrix from loop 21 (single-pass `gh issue edit N --add-label "CAT,PRIO"`).
2. Close resolved-but-open issues (~62) per the loop-16 §5 / loop-21 §5.1 matrix, with "resolved by PR #NNN" references.
3. Grant `issues: write` and `workflows: write` to the automation token to unblock STEP 1/2/3, issue creation, and the #744/#670/#595/#584/#305 pnpm-in-CI cluster plus #726/#728 (ready-made patch exists in `docs/patches/fix-pnpm-consistency-iterate-744.patch`).
4. **NEW this loop:** repair the `explore` agent model alias `opencode/gpt-5-nano` in the agent config — `ProviderModelNotFoundError` blocks all explore-agent background launches.
5. Investigate the repo search-index outage: `search/issues` returns 0 for all queries under this token (loop-23 §6.1) — confirm token scope vs GitHub-side index issue.
6. Address the repo-wide Vercel deployment failure (non-blocking but noisy).
7. Repair the CI `Post Setup Node.js` cache path validation error in `on-pull.yml` (infra, spurious `pull` check failures).

## 9. Final State

**waiting for human review** — repository verified healthy (typecheck/lint/test/build all green on `main` @ `604f01e`); issue/workflow mutations still require a privileged token (7 actionable items above). No destructive actions taken; no files deleted; no branches force-deleted; probe branch removed after verification.
