# Issue Manager Audit Report — 2026-08-03 (Loop 21)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0). Entry detection: **0 open PRs, 82 open issues** → ISSUE MANAGER MODE. This loop performed a **first-hand re-verification** of the repository state on the current `main` (`371dd74`, the merge of PR #1077 "docs: add issue manager audit report for 2026-08-03 loop 20" — the only merge since loop 20's report). All prior classifications are re-confirmed; no classification changes. STEP 1/2/3 remain blocked by token permissions (re-probed live this loop). STEP 4 repair backlog remains **empty** for minimal/atomic/safe/non-workflow changes. The complete label-normalization matrix for all 82 issues is delivered in §7.1 for a privileged process.

## 2. Decision Summary

- Default branch detected: `main` (HEAD `371dd74` — merge of PR #1077, loop 20 audit report).
- **Phase 0 → ISSUE MANAGER MODE**: 0 open PRs (verified via `gh pr list --state open`), 82 open issues (verified via `gh issue list --state open --limit 100`). Newest open issue #789 @ 2026-02-27 — no new issues since loop 18.
- **Token capabilities re-probed first-hand this loop** (fresh evidence, not inherited):
  - `gh auth status` → `github-actions[bot]` via `GITHUB_TOKEN` (a `ghs_` Actions token).
  - Issue label mutation (`addLabelsToLabelable` on #789) → **HTTP 403** (`Resource not accessible by integration`) via both `gh issue edit` and direct REST `POST /issues/789/labels`.
  - Issue comment creation (`addComment`) → **HTTP 403** via both `gh issue comment` and REST `POST /issues/789/comments`.
  - Issue closure (`closeIssue`) → **HTTP 403**.
  - Issue creation (`createIssue`) → **HTTP 403**.
  - Git push to feature branches → **works** (`contents: write` + `pull-requests: write` in `on-pull.yml`).
  - Workflow-file push → **BLOCKED** (established loop 18; `on-pull.yml` grants no `workflows` scope).
- **STEP 4 outcome — repair backlog empty (re-validated)**: all 82 issues remain classified per the loop-16/17/18/19/20 matrix. Independent re-checks this loop (§5) all held. Full health suite is green (§4). The only health finding is the known moderate advisory (CVE-2026-54285) and a dev-only `pnpm outdated` signal in `security:check` — neither safely fixable within the minimal/atomic repair constraint (§6).

## 3. Skills & Subagents Used (per TOOL USAGE mandate)

| Skill / Agent                                      | Purpose                                             | Result                                                                                                                                                                    |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github-workflow-automation` (repo skill)          | CI permission model + workflow audit                | Confirmed `on-pull.yml` is the active workflow and pnpm-consistent; `iterate.yml` (disabled_manually) still `npm ci \|\| true` at lines 72/342 (workflow-blocked cluster) |
| `openx-basefly` (repo skill)                       | Project harness context                             | Loaded; harness + repo context re-confirmed                                                                                                                               |
| Direct verification (`gh api`/`gh issue`/git/grep) | Issue-state + code-state + repo-health verification | All first-hand: permissions, 82-issue inventory, spot-checks, full health suite (typecheck/lint/test/circular/security-audit)                                             |

Explore/librarian background subagents were **not** fired: the verification surface was small and deterministic, and direct evidence-gathering was faster than agent round-trips. Manual audit covers identical scope with first-hand evidence.

## 4. Repository Health Suite (executed, not assumed)

Verification run on `main` @ `371dd74` with Node v20.20.2, pnpm 10.28.2, `pnpm install --frozen-lockfile` (7.7s, cache) completed:

| Check                  | Command                                      | Result                                                             |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Typecheck              | `pnpm typecheck` (turbo)                     | ✅ 8/8 tasks successful                                            |
| Lint                   | `pnpm lint` (turbo, incl. eslint cache)      | ✅ 9/9 tasks successful, **zero warnings**                         |
| Unit/integration tests | `pnpm test` (vitest run)                     | ✅ **76 files / 1511 tests passed** (unchanged vs. loop 20)        |
| Circular dependencies  | `pnpm check:circular` (madge)                | ✅ exit 0 — no circular dependency found                           |
| Security audit         | `pnpm security:audit` (audit-level=moderate) | ⚠️ **FAILS: 1 moderate** — see §6 (accepted risk, not gated in CI) |

**Repo is healthy and buildable.** No merge since loop 20 (only PR #1077, a docs-only change). No code-level defect found that requires repair.

## 5. Issue-State Verification (independent re-checks, fresh evidence this loop)

Classification distribution is unchanged from loops 16–20:

| Classification          | Count | Meaning                                                                          |
| ----------------------- | ----- | -------------------------------------------------------------------------------- |
| Resolved-but-open (R)   | ~62   | Fix verified in `main`; issue closure blocked for automation (no `issues:write`) |
| Workflow-blocked (B)    | ~9    | Requires editing `.github/workflows/` — push refused without `workflows` scope   |
| Large/architectural (L) | ~8    | Violates "minimal, atomic changes only" repair constraint                        |
| Risky (X)               | 1     | #688 — effectively resolved via `proxy.ts` (Next.js 16 middleware replacement)   |

### 5.1 First-hand spot-checks this loop (fresh evidence, not inherited)

| #                   | Claim                              | Independent evidence this loop                                                                                                                                                                                                                                                                             |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 496/480             | Distributed rate limiter (Redis)   | `packages/api/src/distributed-rate-limiter.ts` (359 lines: `DistributedRateLimiter`, `InMemoryRateLimiter`, `SyncRateLimiter`, `getLimiter`) wired into `trpc.ts` (`rateLimit` middleware) + `distributed-rate-limiter.test.ts` — RESOLVED, duplicates of each other                                       |
| 498/721             | RBAC + authorization               | `Role` enum with `@default(USER)` in `packages/db/prisma/schema.prisma`; `createRoleBasedProcedure` + `isAdmin` (role-first with `ADMIN_EMAIL` migration fallback) in `trpc.ts`; `rbac.test.ts` — RESOLVED                                                                                                 |
| 500/549             | Clerk auth flow tests              | `packages/auth/clerk.test.ts` + `router/auth.test.ts` — RESOLVED                                                                                                                                                                                                                                           |
| 501/628/724         | Playwright E2E                     | `playwright.config.ts` at root + `tests/e2e/` — **12 files (11 spec + fixtures)**: admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling — RESOLVED                                                                |
| 515                 | CSRF protection                    | `packages/api/src/trpc.ts` `csrfProtection` middleware (origin vs `NEXT_PUBLIC_APP_URL`, `ErrorCode.CSRF_ERROR`) — RESOLVED                                                                                                                                                                                |
| 550                 | apps/nextjs in coverage config     | Root `vitest.config.ts` coverage includes `apps/nextjs/src/**/*.{ts,tsx}` — RESOLVED                                                                                                                                                                                                                       |
| 551/631             | k8s router tests                   | `packages/api/src/router/k8s.test.ts` (519 lines) — RESOLVED                                                                                                                                                                                                                                               |
| 786                 | Stripe webhook logs partial secret | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` — logger receives only sanitized `{message, requestId}`; comment "use a non-secret identifier"; no secret in logs — RESOLVED                                                                                                                            |
| 785                 | Duplicate `next` dep in stripe     | `packages/stripe/package.json` — no `next` dependency in `dependencies`/`devDependencies` — RESOLVED                                                                                                                                                                                                       |
| 722                 | Env validation at startup          | `apps/nextjs/src/instrumentation.ts` + `packages/common/src/config/env.ts` `validateEnvVars()` — RESOLVED                                                                                                                                                                                                  |
| 708                 | Bundle analyzer                    | `@next/bundle-analyzer` in `apps/nextjs/package.json` + `withBundleAnalyzer` in `next.config.mjs` — RESOLVED (new first-hand check this loop)                                                                                                                                                              |
| 787                 | db migrations/schema tests         | `packages/db/migrations.test.ts` + `user-deletion.test.ts` + `rls-middleware.test.ts` — RESOLVED (new first-hand check this loop)                                                                                                                                                                          |
| 752                 | CLI output utilities               | No `cli*` module in `packages/common/src/` — **still OPEN** (enhancement, P3)                                                                                                                                                                                                                              |
| 731/749             | tRPC doc-gen                       | `packages/api/src/openapi.ts` + `docs-generator.ts` + `apps/nextjs/src/app/api/docs/route.ts` — RESOLVED                                                                                                                                                                                                   |
| 720/748             | .nvmrc                             | `.nvmrc` = `22.14.0` (valid full semver) — both RESOLVED, duplicates of each other                                                                                                                                                                                                                         |
| 486                 | OpenTelemetry                      | `packages/common/src/observability/` + `apps/nextjs/src/instrumentation.ts` — RESOLVED                                                                                                                                                                                                                     |
| 613                 | Duplicate workflow file            | `.github/workflows/` contains only `iterate.yml` + `on-pull.yml` — RESOLVED                                                                                                                                                                                                                                |
| 305/584/595/670/744 | pnpm consistency in CI             | `iterate.yml` lines 58/59/72/342 still `~/.npm` + `package-lock.json` cache key + `npm ci \|\| true`; `on-pull.yml` (the **active** workflow) is pnpm-consistent (`pnpm/action-setup@v6`); `iterate.yml` is `disabled_manually` → defect **dormant** but file-level open; push blocked (`workflows` scope) |
| 688                 | Middleware / request handling      | `apps/nextjs/src/proxy.ts` (Next.js 16 middleware replacement: CSRF, CSP via `getMinifiedCSPHeader`, request-id) — effectively RESOLVED (risky/X classification retained)                                                                                                                                  |
| 728                 | Security scanning workflows        | Spec exists at `docs/workflow-security-audit.yml`; no security workflow in `.github/workflows/` (only `iterate.yml` + `on-pull.yml`) — workflow-blocked                                                                                                                                                    |
| 488                 | Circular dependency detection      | `check:circular` script in root `package.json` runs clean (exit 0); CI step absent — script resolved, CI step workflow-blocked                                                                                                                                                                             |

**Verdict: no classification changes vs. loops 16–20.** No issue satisfies all repair-mode constraints simultaneously (genuinely open **and** minimal/atomic **and** non-blocked **and** safe). Per the FAIL-SAFE rule, no speculative or risky change was made this loop.

## 6. Health Findings (no safe minimal fix available)

### 6.1 CVE-2026-54285 (GHSA-8988-4f7v-96qf), moderate — unchanged from loops 17–20

- **Path**: `apps/nextjs > contentlayer2@0.4.6 > @contentlayer2/utils@0.4.3 > @opentelemetry/core@1.30.1`.
- **Issue**: `W3CBaggagePropagator.extract()` unbounded memory allocation (CWE-770). CVSS 5.3. Patched in `@opentelemetry/core >= 2.8.0`.
- **Why not safely fixable**: `@contentlayer2/utils@0.4.3` declares `@opentelemetry/core: ^1.24.0` (1.x only); forcing 2.8.0 violates the range and creates a dual-core OTel hazard at `contentlayer2 build`. Exploitability is negligible (build-time CLI, no untrusted inbound `baggage` headers). Root `package.json` overrides already carry the correct mixed 1.x/2.x structure.
- **Recommendation**: keep as documented accepted risk — or add `pnpm.auditConfig.ignoreCves` after maintainer review. No change made (security-sensitive, requires human review).

### 6.2 `pnpm security:check` fails on `pnpm outdated` (dev-only signal)

- `security:check` = `pnpm audit --audit-level=high && pnpm outdated`. Audit passes (only 1 moderate < high threshold); `pnpm outdated` exits 1 with dev-only packages behind latest, including breaking majors (`eslint 8→10`, `typescript 5.9→7`, `vite 7→8`).
- **Why not a repair target**: all `devDependencies`; the majors are breaking-version upgrades that risk build/lint breakage and violate "minimal, atomic changes only". The script is a DX signal, **not** gated in any CI workflow. No change made.

## 7. STEP 1/2/3 — Normalization, Duplicate Detection, Consolidation (blocked, with complete deliverable matrix)

- **STEP 1 (label normalization)**: mutation → `addLabelsToLabelable` **403 (re-verified live on #789 this loop, both `gh issue edit` and REST)**. The complete, verified target matrix for all 82 open issues is below — ready for a privileged process to apply in one pass (`gh issue edit N --add-label "CAT,PRIO"` plus removal of conflicting category labels).
- **STEP 2 (duplicate closure)**: duplicate clusters confirmed still open (closure blocked — `createIssue`/`addComment`/`closeIssue` all 403):
  - Distributed rate limiter: #496 (P0, code-fixed) / #480 (P1, code-fixed) — duplicate.
  - pnpm-in-CI: #305 / #584 / #595 / #670 / #744 — all workflow-blocked (`iterate.yml` lines 72/342 still `npm ci || true`; dormant because workflow is disabled).
  - Playwright E2E: #501 / #628 / #724 — all resolved (`tests/e2e/`, 12 files).
  - tRPC doc-gen: #731 / #749 — both resolved (`packages/api/src/openapi.ts`, `docs-generator.ts`, `apps/nextjs/src/app/api/docs/route.ts`).
  - .nvmrc: #720 / #748 — both resolved (`.nvmrc` = 22.14.0).
  - Observability: #486 / #580 — #486 resolved (OTel merged PR #1066); #580 umbrella largely addressed (pino logger + OTel), remaining monitoring scope is large-P2.
- **STEP 3 (consolidation)**: no new small-issue clusters beyond the established maps; consolidation blocked (issue mutations 403).

### 7.1 Verified normalization matrix (82 issues — deliverable for privileged process)

Category must be **exactly one** of `bug|enhancement|feature|docs|refactor|chore|test|ci|security`; priority **exactly one** of `P0|P1|P2|P3`. Specialist/role labels (DX-engineer, frontend-engineer, …) are kept as-is.

| #   | Current labels                                        | Add            | Remove               | Notes                                                                             |
| --- | ----------------------------------------------------- | -------------- | -------------------- | --------------------------------------------------------------------------------- |
| 789 | enhancement                                           | P1             | —                    | peerDependencies packaging correctness (verified resolved-by-code; P1 while open) |
| 788 | test                                                  | P2             | —                    | resolved (DoD met)                                                                |
| 787 | test                                                  | P2             | —                    | resolved (migrations.test.ts verified this loop)                                  |
| 786 | security                                              | P1             | —                    | resolved                                                                          |
| 785 | bug                                                   | P1             | —                    | resolved                                                                          |
| 755 | database-architect                                    | enhancement,P2 | —                    |                                                                                   |
| 754 | quality-assurance                                     | test,P2        | —                    | resolved                                                                          |
| 753 | frontend-engineer                                     | enhancement,P2 | —                    | bundle cluster w/ #723/#751                                                       |
| 752 | DX-engineer                                           | enhancement,P3 | —                    | OPEN (no CLI utils in common; verified this loop)                                 |
| 751 | performance-engineer                                  | enhancement,P2 | —                    | bundle cluster w/ #723/#753                                                       |
| 749 | Growth-Innovation-Strategist                          | enhancement,P3 | —                    | tRPC doc-gen cluster w/ #731 (resolved)                                           |
| 748 | DX-engineer                                           | bug,P2         | —                    | resolved                                                                          |
| 744 | Growth-Innovation-Strategist                          | ci,P2          | —                    | pnpm cluster w/ #305                                                              |
| 731 | enhancement                                           | P3             | —                    | resolved                                                                          |
| 729 | enhancement                                           | P2             | —                    | resolved                                                                          |
| 728 | security                                              | P2             | —                    | workflow-blocked                                                                  |
| 727 | enhancement                                           | P3             | —                    |                                                                                   |
| 726 | ci                                                    | P2             | —                    | script exists; CI step workflow-blocked                                           |
| 725 | test                                                  | P2             | —                    |                                                                                   |
| 724 | test                                                  | P2             | —                    | E2E cluster w/ #501 (resolved)                                                    |
| 723 | enhancement                                           | P2             | —                    | bundle cluster canonical                                                          |
| 722 | security                                              | P2             | —                    | resolved                                                                          |
| 721 | security                                              | P1             | —                    | resolved                                                                          |
| 720 | enhancement                                           | P3             | —                    | resolved                                                                          |
| 719 | enhancement                                           | P2             | —                    | resolved                                                                          |
| 713 | enhancement,test,quality-assurance                    | P2             | enhancement          | category=test                                                                     |
| 708 | enhancement,P3,DX-engineer                            | —              | —                    | OK (bundle analyzer verified this loop)                                           |
| 706 | enhancement,P3,DX-engineer                            | —              | —                    | OK                                                                                |
| 705 | enhancement,P2,platform-engineer                      | —              | —                    | OK                                                                                |
| 697 | technical-writer                                      | docs,P3        | —                    |                                                                                   |
| 688 | enhancement,P2,security                               | —              | enhancement          | category=security (risky/X: resolved via proxy.ts)                                |
| 687 | enhancement,P3,DX-engineer                            | —              | —                    | OK                                                                                |
| 685 | enhancement,P2,frontend-engineer                      | —              | —                    | OK                                                                                |
| 684 | enhancement,P3,DX-engineer                            | —              | —                    | OK                                                                                |
| 683 | enhancement,P2,DX-engineer                            | —              | —                    | OK                                                                                |
| 670 | P3,DX-engineer                                        | ci             | —                    | pnpm cluster w/ #305                                                              |
| 668 | enhancement                                           | P3             | —                    |                                                                                   |
| 667 | enhancement,P3,DX-engineer                            | —              | —                    | OK (barrel cluster w/ #523/#687)                                                  |
| 666 | enhancement,P2,frontend-engineer                      | —              | —                    | resolved                                                                          |
| 664 | enhancement,P2,DX-engineer                            | —              | —                    | resolved                                                                          |
| 663 | enhancement,P2,DX-engineer                            | —              | —                    | residual disables justified                                                       |
| 650 | enhancement,P3,DX-engineer                            | —              | —                    | OK                                                                                |
| 636 | enhancement                                           | P2             | —                    |                                                                                   |
| 635 | documentation                                         | docs,P3        | documentation        |                                                                                   |
| 634 | enhancement                                           | P2             | —                    |                                                                                   |
| 632 | security                                              | P2             | —                    | resolved                                                                          |
| 631 | enhancement                                           | P2             | —                    | resolved                                                                          |
| 630 | enhancement                                           | P3             | —                    |                                                                                   |
| 628 | enhancement                                           | P2             | —                    | E2E cluster w/ #501 (resolved)                                                    |
| 613 | enhancement,P2                                        | —              | —                    | resolved                                                                          |
| 611 | enhancement,P3                                        | —              | —                    | resolved                                                                          |
| 610 | enhancement,P2                                        | —              | —                    |                                                                                   |
| 609 | enhancement,P2                                        | —              | —                    | resolved                                                                          |
| 595 | platform-engineer                                     | ci,P2          | —                    | pnpm cluster w/ #305                                                              |
| 590 | enhancement,P2,frontend-engineer                      | —              | —                    | OK                                                                                |
| 584 | enhancement,ci                                        | P2             | enhancement          | category=ci; pnpm cluster w/ #305                                                 |
| 581 | enhancement,P1,test,backend-engineer                  | —              | enhancement          | category=test; umbrella (sub-issues resolved)                                     |
| 580 | enhancement,P2,backend-engineer                       | —              | —                    | observability umbrella (large-P2)                                                 |
| 579 | enhancement,P2,DX-engineer                            | —              | —                    | OK (resolved per loop-19 §5.1)                                                    |
| 578 | enhancement,P3,backend-engineer                       | —              | —                    | resolved                                                                          |
| 551 | enhancement,P1,test,backend-engineer                  | —              | enhancement          | category=test; resolved                                                           |
| 550 | enhancement,P1,test                                   | —              | enhancement          | category=test; resolved                                                           |
| 549 | enhancement,P1,test,backend-engineer                  | —              | enhancement          | category=test; resolved                                                           |
| 523 | enhancement,P3,refactor                               | —              | enhancement          | category=refactor; barrel cluster canonical                                       |
| 522 | enhancement,P3,refactor,ci,devops-engineer            | —              | enhancement,refactor | category=ci                                                                       |
| 521 | enhancement,P2,frontend-engineer                      | —              | —                    | OK                                                                                |
| 515 | enhancement,P1,security                               | —              | —                    | category=security; resolved                                                       |
| 503 | P2,docs                                               | —              | —                    | OK                                                                                |
| 502 | enhancement,P2                                        | —              | —                    | OK                                                                                |
| 501 | enhancement,P1                                        | —              | —                    | resolved (E2E)                                                                    |
| 500 | enhancement,P1                                        | —              | —                    | resolved                                                                          |
| 498 | enhancement,P1,security                               | —              | —                    | category=security; resolved                                                       |
| 496 | enhancement,P0,security                               | —              | —                    | category=security; resolved                                                       |
| 494 | P2,refactor,backend-engineer,modularity-engineer      | —              | —                    | OK                                                                                |
| 492 | enhancement,P3,frontend-engineer,performance-engineer | —              | —                    | resolved                                                                          |
| 488 | enhancement,P2,DX-engineer,modularity-engineer        | —              | —                    | script+CLI run clean; CI step workflow-blocked                                    |
| 487 | enhancement,P2,backend-engineer,performance-engineer  | —              | —                    | large-P2                                                                          |
| 486 | enhancement,P2,devops-engineer,backend-engineer       | —              | —                    | resolved                                                                          |
| 485 | enhancement,P2,frontend-engineer                      | —              | —                    | resolved                                                                          |
| 483 | enhancement,P2,database-architect,backend-engineer    | —              | —                    | resolved                                                                          |
| 480 | enhancement,P1,security-engineer,backend-engineer     | security       | enhancement          | category=security; resolved; duplicate of #496                                    |
| 305 | enhancement,ci,devops-engineer                        | P2             | enhancement          | category=ci; pnpm cluster canonical                                               |

## 8. Action Log

| Timestamp (UTC)  | Action                        | Target                                          | Result                                                                                                                    |
| ---------------- | ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-03T05:2x | Phase 0 detection             | repo                                            | 0 open PRs, 82 open issues → ISSUE MANAGER MODE                                                                           |
| 2026-08-03T05:2x | Permission probes (live)      | issues / workflows                              | label mutation on #789 403 (`addLabelsToLabelable`, gh + REST); comment 403 (`addComment`); close 403; issue creation 403 |
| 2026-08-03T05:31 | Dependency install            | repo (pnpm 10.28.2)                             | `pnpm install --frozen-lockfile` OK (7.7s, cache)                                                                         |
| 2026-08-03T05:3x | **Health suite**              | repo                                            | typecheck 8/8 ✅ · lint 9/9 ✅ zero warnings · tests 76/1511 ✅ · circular clean ✅ · security:audit 1 moderate ⚠️ (§6.1) |
| 2026-08-03T05:4x | Spot-check matrix             | 21 "R"/"X"/"B" claims across 82 issues          | All held; no classification changes vs. loops 16–20 (§5.1)                                                                |
| 2026-08-03T05:4x | New first-hand checks         | #708 #787 #752                                  | #708 bundle analyzer resolved · #787 db tests resolved · #752 still open (no CLI utils)                                   |
| 2026-08-03T05:5x | Normalization matrix authored | all 82 issues                                   | Complete verified CAT+PRIO matrix delivered (§7.1)                                                                        |
| 2026-08-03T05:5x | Audit authored                | `docs/issue-manager-audit-2026-08-03-loop21.md` | This document                                                                                                             |
| 2026-08-03T05:5x | Audit delivered               | PR (this branch)                                | See PR description                                                                                                        |

## 9. Final State

- **Active phase**: ISSUE MANAGER MODE — STEP 1/2/3 blocked (issues:write absent; 403 verified live this loop); STEP 4 repair backlog **empty** (validated by independent spot-checks + full health suite).
- **Open PRs**: 1 (this report's PR pending merge).
- **Open issues**: 82 (unchanged — issue mutations blocked; ~62 resolved-but-open).
- **Repo health**: green (typecheck/lint/test/circular) with 1 documented moderate advisory (§6.1) and a dev-only `pnpm outdated` signal (§6.2).
- **Waiting for human review** (privileged token required for issue/workflow mutations):
  1. Apply the §7.1 normalization matrix (add category + priority labels; remove conflicting category labels) — single-pass script provided above.
  2. Close resolved-but-open issues (~62) per the loop-16 §5 matrix + this loop's §5.1 evidence, with "resolved by PR #NNN" references.
  3. Close duplicate clusters per §7 (list provided).
  4. Apply the pnpm-CI patch to `iterate.yml` (`npm ci || true` → `pnpm install --frozen-lockfile`, lines 72/342; proven fix at `cd9eb30`) before re-enabling the workflow — fixes #305/#584/#595/#670/#744; requires `workflows` scope.
  5. Add security-scanning workflows (#728; spec at `docs/workflow-security-audit.yml`) and the `check:circular` CI step (#488).
  6. Review §6.1 and decide Option A/B for CVE-2026-54285; optionally pin dev-deps or scope `security:check` per §6.2.
  7. Restore `issues: write` + `workflows` permissions on the runtime token.
- **Local note (out of scope, untouched)**: working tree contains untracked `.omo/` migration artifacts and two unstaged deletions of `.opencode/*.json` from the harness migration. Left as-is per the fail-safe rule (not repo content; not tied to any issue).
