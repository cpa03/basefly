# Issue Manager Audit Report — 2026-08-02 (Loop 19)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0). Entry detection: **0 open PRs, 82 open issues** → ISSUE MANAGER MODE. This loop performed an **independent first-hand re-verification** of the repository state: token permission model, a full health suite (typecheck / lint / test / circular-dependency / security audit), and targeted re-checks of the highest-risk open issues (#785–#789, the pnpm-in-CI cluster, and P0/P1 security claims). Conclusion: the repair backlog remains **empty** for minimal/atomic/safe/non-workflow changes; STEP 1/2/3 remain blocked by token permissions. All findings are evidence-based and delivered for human review.

## 2. Decision Summary

- Default branch detected: `main` (HEAD `d382698`, synced to `origin/main` — only the loop-18 audit PR #1074 merged since loop 17's follow-up).
- **Phase 0 → ISSUE MANAGER MODE**: 0 open PRs, 82 open issues (inventory re-fetched via `gh issue list --state open --limit 100`; newest open issue #789 @ 2026-02-27 — no new issues since loop 18).
- **Token capabilities re-probed first-hand this loop** (not inherited from prior reports):
  - `gh api user` → **403** (`Resource not accessible by integration`).
  - Issue label mutation (`addLabelsToLabelable` on #789) → **HTTP 403**.
  - Issue comment creation (`addComment` on #789) → **HTTP 403**.
  - Auth identity: `github-actions[bot]` (GITHUB_TOKEN).
  - Git push to branches → **works** (established loops 12–18; no re-probe residue created this loop).
  - Workflow-file push → **BLOCKED** (established loop 18 first-hand: "refusing to allow a GitHub App to create or update workflow ... without workflows permission"; unchanged).
- **STEP 4 outcome — repair backlog empty (validated)**: all 82 issues remain classified per the loop-16/17/18 matrix. Independent re-checks this loop (§5.1) all held. Full health suite is green (§4). The only health findings are the known moderate advisory (CVE-2026-54285) and a dev-only `pnpm outdated` signal in `security:check` — neither safely fixable within the minimal/atomic repair constraint (§6).

## 3. Skills & Subagents Used (per TOOL USAGE mandate)

| Skill / Agent                                                        | Purpose                                             | Result                                                                                                                  |
| -------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --- | -------------------------------- |
| `openx-basefly` (repo skill)                                         | Project harness context                             | Loaded; harness + repo context re-confirmed                                                                             |
| `github-workflow-automation` (repo skill)                            | CI permission model + workflow audit                | Confirmed `on-pull.yml` is pnpm-consistent (`pnpm/action-setup@v6`); confirmed `iterate.yml` lines 72/342 still `npm ci |     | true` (workflow-blocked cluster) |
| Direct verification (`gh api` / `git` / grep/read / full test suite) | Issue-state + code-state + repo-health verification | All first-hand: permissions, 82-issue inventory, spot-checks, typecheck/lint/test/circular/security-audit runs          |

Explore/librarian background subagents were **not** fired: the harness model configuration for background Explore has been unreliable in prior loops (documented loop-12 §8), and this loop's verification surface was small enough that direct evidence-gathering was deterministic and faster. Manual audit covers identical scope with first-hand evidence.

## 4. Repository Health Suite (executed, not assumed)

Verification run on `main` @ `d382698` with Node v22.23.1 (`n`-switched; `.nvmrc` = 22.14.0) and pnpm 10.28.2, `pnpm install --frozen-lockfile` completed:

| Check                  | Command                                      | Result                                                             |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Typecheck              | `pnpm typecheck` (turbo)                     | ✅ 8/8 tasks successful                                            |
| Lint                   | `pnpm lint` (turbo, incl. eslint cache)      | ✅ 9/9 tasks successful, **zero warnings**                         |
| Unit/integration tests | `pnpm test` (vitest run)                     | ✅ **74 files / 1498 tests passed**                                |
| Circular dependencies  | `pnpm check:circular` (madge)                | ✅ "No circular dependency found" (365+ files processed)           |
| Security audit         | `pnpm security:audit` (audit-level=moderate) | ⚠️ **FAILS: 1 moderate** — see §6 (accepted risk, not gated in CI) |

**Repo is healthy and buildable.** No code-level defect found that requires repair.

## 5. Issue-State Verification (independent re-checks)

Classification distribution is unchanged from loops 16/17/18 and re-confirmed by this loop's independent checks + full health suite:

| Classification          | Count | Meaning                                                                        |
| ----------------------- | ----- | ------------------------------------------------------------------------------ |
| Resolved-but-open (R)   | ~62   | Fix verified in `main`; issue closure blocked for automation                   |
| Workflow-blocked (B)    | ~9    | Requires editing `.github/workflows/` — push refused without `workflows` scope |
| Large/architectural (L) | ~8    | Violates "minimal, atomic changes only" repair constraint                      |
| Risky (X)               | 1     | #688 — effectively resolved via `proxy.ts` (Next.js 16 middleware replacement) |

### 5.1 Independent spot-checks this loop (fresh evidence, not inherited)

| #            | Claim                              | Independent evidence this loop                                                                                                                                                                                                                 |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 785          | Duplicate `next` dep in stripe     | `packages/stripe/package.json` — **no** `next` dependency present in `dependencies` or `devDependencies`                                                                                                                                       |
| 786          | Stripe webhook logs partial secret | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` — separate try/catch around `constructEvent`; only sanitized `error.message` logged (`logger.error` never receives the raw StripeError or `Stripe-Signature`); no `secret.slice()` anywhere |
| 787          | db migration/schema tests          | `packages/db/migrations.test.ts`, `user-deletion.test.ts`, `rls-middleware.test.ts`, `logger.test.ts` exist                                                                                                                                    |
| 788          | UI component tests                 | `apps/nextjs/src/components/__tests__/` — `navbar`, `cluster-create-button`, `cluster-item`, `skip-link` test files exist                                                                                                                      |
| 789          | React peerDependencies in ui       | `packages/ui/package.json` `peerDependencies` `react ^19.0.0` / `react-dom ^19.0.0` (verified loop 18)                                                                                                                                         |
| 754          | Stripe webhook idempotency tests   | `packages/stripe/src/webhook-idempotency.test.ts` exists                                                                                                                                                                                       |
| 724/501/628  | E2E coverage                       | `tests/e2e/` — 12 spec files (`critical-flows.spec.ts`, `admin.spec.ts`, `auth.spec.ts`, `billing.spec.ts`, `cluster.spec.ts`, ...)                                                                                                            |
| 731/749      | tRPC API doc generation            | `packages/api/src/openapi.ts`, `packages/api/src/docs-generator.ts`, `apps/nextjs/src/app/api/docs/route.ts` exist                                                                                                                             |
| 550          | nextjs in coverage config          | Root `vitest.config.ts` coverage `include: ["packages/**/*", "apps/nextjs/src/**/*.{ts,tsx}"]`; test `include` also lists `apps/nextjs/src/**/*.test.{ts,tsx}`                                                                                 |
| 581          | Testing infra consolidation        | Root `vitest.config.ts` with coverage thresholds (25/20/20/25), happy-dom env, setup file                                                                                                                                                      |
| 515          | CSRF protection                    | `apps/nextjs/src/proxy.ts` — `validateCSRF` (Origin/Referer vs `NEXT_PUBLIC_APP_URL`, `CSRF_ALLOWED_ORIGINS`) + security headers                                                                                                               |
| 498/721      | RBAC + authorization               | `packages/api/src/authorization.ts` + `rbac.test.ts` + `authorization.test.ts` + `admin.test.ts` exist                                                                                                                                         |
| 722          | Env validation at startup          | `packages/common/src/config/env.ts` — `missing` / `missingRecommended` arrays, per-var push, `valid` flag                                                                                                                                      |
| 485          | Suspense boundaries                | `Suspense` used in 6+ page/layout files (`dashboard/page.tsx`, `billing/page.tsx`, `pricing/page.tsx`, marketing/docs layouts, `page-progress.tsx`)                                                                                            |
| 755          | Composite indexes                  | `packages/db/prisma/schema.prisma` — 5 composite indexes on `Customer` including `[plan, stripeCurrentPeriodEnd]`, `[authUserId, stripeCurrentPeriodEnd]`, `[authUserId, plan, stripeCurrentPeriodEnd]`                                        |
| 748/720      | .nvmrc                             | `.nvmrc` = `22.14.0` (valid Node LTS; matches health-suite runtime)                                                                                                                                                                            |
| 705          | Docker config                      | `Dockerfile`, `docker-compose.yml` exist                                                                                                                                                                                                       |
| 666          | Global error boundary              | `apps/nextjs/src/app/error.tsx` + `global-error.tsx` exist                                                                                                                                                                                     |
| 611          | not-found page                     | `apps/nextjs/src/app/not-found.tsx` exists                                                                                                                                                                                                     |
| 578          | Duplicate health endpoint          | Single `apps/nextjs/src/app/api/health/route.ts` remains                                                                                                                                                                                       |
| 613          | Duplicate workflow file            | Only `iterate.yml` + `on-pull.yml` in `.github/workflows/`                                                                                                                                                                                     |
| 579          | Env setup error messages           | `packages/common/src/config/env.ts` — explicit missing-variable error messaging                                                                                                                                                                |
| 664          | console → pino in db/stripe        | No stray `console.*` in `packages/db/src` / `packages/stripe/src` (matches remain in doc comments only)                                                                                                                                        |
| 609          | Duplicate Zod schemas              | `packages/api/src/router/schemas.ts` canonical; routers import from `./schemas`                                                                                                                                                                |
| 663          | eslint-disable consolidation       | Residual disables justified (`no-unsafe-call` on dynamic imports, d.ts headers) — no net regression                                                                                                                                            |
| 488 (script) | Circular dependency detection      | `madge` devDep + `check:circular` script run clean this loop; **CI step still missing (workflow-blocked)**                                                                                                                                     |

**Verdict: no classification changes vs. loops 16/17/18.** No issue satisfies all repair-mode constraints simultaneously (genuinely open **and** minimal/atomic **and** non-blocked **and** safe). Per the FAIL-SAFE rule, no speculative or risky change was made this loop.

## 6. Health Findings (no safe minimal fix available)

### 6.1 CVE-2026-54285 (GHSA-8988-4f7v-96qf), moderate — unchanged from loops 17/18

- **Path**: `apps/nextjs > contentlayer2@0.4.6 > @contentlayer2/utils@0.4.3 > @opentelemetry/core@1.30.1`.
- **Issue**: `W3CBaggagePropagator.extract()` unbounded memory allocation (CWE-770). CVSS 5.3. Patched in `@opentelemetry/core >= 2.8.0`.
- **Why not safely fixable**: `@contentlayer2/utils@0.4.3` declares `@opentelemetry/core: ^1.24.0` (1.x only); forcing 2.8.0 violates the range and creates a dual-core OTel hazard at `contentlayer2 build`. Exploitability in this repo is negligible (build-time CLI, no untrusted inbound `baggage` headers). Root `package.json` overrides already carry the correct mixed 1.x/2.x structure.
- **Recommendation**: keep as documented accepted risk — or add `pnpm.auditConfig.ignoreCves` after maintainer review. No change made (security-sensitive, requires human review).

### 6.2 `pnpm security:check` fails on `pnpm outdated` (dev-only signal)

- `security:check` = `pnpm audit --audit-level=high && pnpm outdated`. Audit part passes (only 1 moderate < high threshold); `pnpm outdated` exits 1 with dev-only packages behind latest, including breaking majors (`eslint 8→10`, `typescript 5.9→7`, `vite 7→8`).
- **Why not a repair target**: all are `devDependencies`; the majors are breaking-version upgrades that would risk build/lint breakage and violate "minimal, atomic changes only". The script is a DX signal, **not** gated in any CI workflow. No change made.

## 7. STEP 1/2/3 — Normalization, Duplicate Detection, Consolidation (blocked, unchanged)

- **STEP 1 (label normalization)**: ~40 issues missing priority label, ~12 missing category label, ~14 multi-category. Batch mutation → `addLabelsToLabelable` **403 (re-verified live on #789 this loop)**. Full target matrix preserved in `.omo/issue-normalization-audit.md`.
- **STEP 2 (duplicate closure)**: duplicate clusters confirmed still open (closure blocked — `createIssue`/`addComment`/`closeIssue` all 403):
  - Distributed rate limiter: #496 (P0, code-fixed) / #480 (P1, code-fixed) — duplicate.
  - pnpm-in-CI: #305 / #584 / #595 / #670 / #744 — all workflow-blocked (`iterate.yml` lines 72/342 still `npm ci || true`, re-verified this loop).
  - Playwright E2E: #501 / #628 — both resolved (`tests/e2e/`).
  - tRPC doc-gen: #731 / #749 — both resolved (`openapi.ts`, `docs-generator.ts`, `api/docs/route.ts`).
  - .nvmrc: #720 / #748 — both resolved (`.nvmrc` = 22.14.0).
  - Observability: #486 / #580 — both resolved (OTel merged PR #1066).
- **STEP 3 (consolidation)**: no new small-issue clusters beyond the established maps; consolidation blocked.

## 8. Action Log

| Timestamp (UTC)        | Action                   | Target                                          | Result                                                                                                                   |
| ---------------------- | ------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 2026-08-02T22:4x       | Phase 0 detection        | repo                                            | 0 open PRs, 82 open issues → ISSUE MANAGER MODE                                                                          |
| 2026-08-02T22:4x       | Permission probes (live) | issues / user                                   | `gh api user` 403; label mutation on #789 403 (`addLabelsToLabelable`); comment creation on #789 403 (`addComment`)      |
| 2026-08-02T22:45       | Dependency install       | repo (Node 22.23.1 via `n`, pnpm 10.28.2)       | `pnpm install --frozen-lockfile` OK (workerd build-script notice, non-blocking)                                          |
| 2026-08-02T22:45–22:46 | **Health suite**         | repo                                            | typecheck 8/8 ✅ · lint 9/9 ✅ zero warnings · tests 74 files/1498 ✅ · circular clean ✅ · security:audit 1 moderate ⚠️ |
| 2026-08-02T22:46       | Spot-check matrix        | 23 "R"/"X"/"B" claims across 82 issues          | All held; no classification changes vs. loops 16/17/18 (§5.1)                                                            |
| 2026-08-02T22:47       | Audit authored           | `docs/issue-manager-audit-2026-08-02-loop19.md` | This document                                                                                                            |
| 2026-08-02T22:4x       | Audit delivered          | PR (this branch)                                | See PR description                                                                                                       |

## 9. Final State

- **Active phase**: ISSUE MANAGER MODE — STEP 1/2/3 blocked (issues:write absent; 403 verified live this loop); STEP 4 repair backlog **empty** (validated by independent spot-checks + full health suite).
- **Open PRs**: 1 (this report's PR pending merge).
- **Open issues**: 82 (unchanged — issue mutations blocked; ~62 resolved-but-open).
- **Repo health**: green (typecheck/lint/test/circular) with 1 documented moderate advisory (§6.1) and a dev-only `pnpm outdated` signal (§6.2).
- **Waiting for human review** (privileged token required for issue/workflow mutations):
  1. Close resolved-but-open issues (~62) per loop-16 §5 matrix.
  2. Apply label normalization per `.omo/issue-normalization-audit.md`.
  3. Apply the pnpm-CI patch to `iterate.yml` (`npm ci || true` → `pnpm install --frozen-lockfile`, lines 72/342) — fixes #305/#584/#595/#670/#744; requires `workflows` scope.
  4. Add security-scanning workflows (fixes #728; spec at `docs/workflow-security-audit.yml`) and the `check:circular` CI step (#488).
  5. Close duplicate clusters per §7.
  6. Review §6.1 and decide Option A/B for CVE-2026-54285; optionally pin dev-deps or scope `security:check` (not CI-gated) per §6.2.
  7. Restore `issues: write` + `workflows` permissions on the runtime token.
- **Local note (out of scope, untouched)**: working tree contains untracked `.omo/` migration artifacts and two unstaged deletions of `.opencode/*.json` from the harness migration. Left as-is per the fail-safe rule (not repo content; not tied to any issue).
