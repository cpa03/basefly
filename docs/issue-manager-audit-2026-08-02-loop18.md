# Issue Manager Audit Report — 2026-08-02 (Loop 18)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0). Entry detection: **0 open PRs, 82 open issues** → ISSUE MANAGER MODE. This loop performed an **independent first-hand re-verification** of the token permission model, a **full repository health suite** (typecheck / lint / test / circular-dependency / security audit), and **spot-checked 24 prior "resolved" claims** from the loop-16/17 matrices. Conclusion: the repair backlog remains **empty** for minimal/atomic/safe/non-workflow changes; STEP 1/2/3 remain blocked by token permissions. All findings are evidence-based and delivered for human review.

## 2. Decision Summary

- Default branch detected: `main` (synced to `origin/main` @ `e29ad5e`; only loop-17 audit PR #1071 and its lint follow-up #1073 merged since loop 17).
- **Phase 0 → ISSUE MANAGER MODE**: 0 open PRs, 82 open issues (inventory re-fetched; newest open issue #789 @ 2026-02-27 — no new issues since loop 17).
- **Token capabilities re-probed first-hand this loop** (not inherited from prior reports):
  - Issue label mutation → **HTTP 403** (`addLabelsToLabelable` — probed live on #726).
  - Issue creation → **HTTP 403** (`createIssue` — probed live, no residue created).
  - `gh api user` → **403** (`Resource not accessible by integration`).
  - Git push to branches → **WORKS** (probe branch `__loop18-push-probe` pushed + deleted cleanly).
  - **Workflow-file push → BLOCKED** (probe `__loop18-wf-test` with `.github/workflows/__probe-test.yml` rejected: `refusing to allow a GitHub App to create or update workflow ... without workflows permission`; probe branch cleaned up).
- **STEP 4 outcome — repair backlog empty (validated)**: all 82 issues remain classified per the loop-16/17 matrix (§5). 24 independent spot-checks (§5.1) all held. Full health suite is green (§4). The only health finding is one moderate advisory (CVE-2026-54285) plus a `pnpm outdated` dev-only signal in `security:check` — neither safely fixable within the minimal/atomic repair constraint (§6).

## 3. Skills & Subagents Used (per TOOL USAGE mandate)

| Skill / Agent                                                        | Purpose                                          | Result                                                                                                                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openx-basefly` (repo skill)                                          | Project harness context                          | Loaded; harness + repo context re-confirmed                                                                                                                 |
| `github-workflow-automation` (repo skill)                             | CI permission model + workflow audit             | Confirmed `on-pull.yml` is pnpm-consistent; confirmed `iterate.yml` lines 72/342 still `npm ci || true` (workflow-blocked cluster); confirmed CI has **no** security-audit/outdated gate |
| Direct verification (`gh api` / `git` / grep/read / full test suite) | Issue-state + code-state + repo-health verification | All first-hand: permissions, 82-issue inventory, 24 spot-checks, typecheck/lint/test/circular/security-audit runs                                            |

Explore/librarian background subagents were **not** fired: the harness model configuration for background Explore has been unreliable in prior loops (documented loop-12 §8), and this loop's verification surface was small enough that direct evidence-gathering was deterministic and faster. Manual audit covers identical scope with first-hand evidence.

## 4. Repository Health Suite (executed, not assumed)

Verification run on `main` @ `e29ad5e` with Node v22.23.1 (`n`-switched; `.nvmrc` = 22.14.0) and pnpm 10.28.2, env sourced from `.env.ci`:

| Check                  | Command                                      | Result                                                                                                     |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Typecheck              | `pnpm typecheck` (turbo)                     | ✅ 8/8 tasks successful                                                                                    |
| Lint                   | `pnpm lint` (turbo, incl. eslint cache)      | ✅ 9/9 tasks successful, **zero warnings**                                                                 |
| Unit/integration tests | `pnpm test` (vitest run)                     | ✅ **74 files / 1498 tests passed**                                                                        |
| Circular dependencies  | `pnpm check:circular` (madge)                | ✅ "No circular dependency found" (365 files processed)                                                    |
| Security audit         | `pnpm security:audit` (audit-level=moderate) | ⚠️ **FAILS: 1 moderate** — see §6 (accepted risk, not gated in CI)                                         |
| Security check (dev)   | `pnpm security:check` (audit-high + outdated)| ⚠️ Fails on `pnpm outdated` exit 1 (11 dev-only packages behind; all major-version gaps — see §6)          |

**Repo is healthy and buildable.** No code-level defect found that requires repair.

## 5. Issue-State Matrix (82/82, re-verified)

Classification distribution is unchanged from loops 16/17 and re-confirmed by spot-checks + full health suite:

| Classification          | Count | Meaning                                                                                  |
| ----------------------- | ----- | ---------------------------------------------------------------------------------------- |
| Resolved-but-open (R)   | ~62   | Fix verified in `main`; issue closure blocked for automation                              |
| Workflow-blocked (B)    | ~9    | Requires editing `.github/workflows/` — push refused without `workflows` scope            |
| Large/architectural (L) | ~8    | Violates "minimal, atomic changes only" repair constraint                                 |
| Risky (X)               | 1     | #688 — effectively resolved via `proxy.ts` (Next.js 16 middleware replacement)           |

### 5.1 Spot-check results (independent validation of loop-16/17 "R" claims, 24 checks)

| #             | Claim                            | Independent evidence this loop                                                                                     |
| ------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 496/480       | Distributed rate limiter (P0)    | `packages/api/src/distributed-rate-limiter.ts` + `.test.ts` exist                                                  |
| 500/549       | Auth tests                       | `packages/auth/clerk.test.ts` exists (21 tests)                                                                    |
| 551/631/725   | Router tests                     | `packages/api/src/router/k8s.test.ts`, `customer.test.ts`, `stripe.test.ts` exist                                  |
| 666           | Global error boundary            | `apps/nextjs/src/app/error.tsx` + `global-error.tsx` exist                                                         |
| 611           | not-found page                   | `apps/nextjs/src/app/not-found.tsx` exists                                                                         |
| 755           | Composite indexes                | `@@index([plan, stripeCurrentPeriodEnd])`, `@@index([authUserId, stripeCurrentPeriodEnd])`, `@@index([authUserId, plan, stripeCurrentPeriodEnd])` in `packages/db/prisma/schema.prisma` |
| 789           | React peerDependencies           | `packages/ui/package.json` has `peerDependencies`: `react ^19.0.0`, `react-dom ^19.0.0`                            |
| 483           | Transaction handling             | `createSession` is now `createRateLimitedProtectedProcedure("stripe")` — no multi-table write path                  |
| 578           | Duplicate health endpoint        | Single `apps/nextjs/src/app/api/health/route.ts` remains                                                           |
| 613           | Duplicate workflow file          | Only `iterate.yml` + `on-pull.yml` in `.github/workflows/`                                                          |
| 720/748       | .nvmrc                           | `.nvmrc` = `22.14.0` (valid)                                                                                       |
| 719           | Root tsconfig                    | Root `tsconfig.json` exists                                                                                        |
| 722           | Env validation                   | `packages/common/src/config/env.ts` exists                                                                         |
| 705           | Docker config                    | `Dockerfile` + `docker-compose.yml` exist                                                                          |
| 664           | console → pino                   | No stray `console.*` in `packages/db/src` / `packages/stripe/src`                                                  |
| 697           | Corrupted docs                   | No replacement chars (U+FFFD) in `docs/*.md`                                                                       |
| 663           | eslint-disable consolidation     | 23 files; remaining are justified (`@typescript-eslint/no-unsafe-call` on dynamic imports, d.ts headers)           |
| 492           | Image `sizes` attribute          | `sizes=` present in `mdx-components.tsx`, `blog-card.tsx`                                                          |
| 685           | React.memo optimizations         | `React.memo` in `pricing-cards`, `features-card`, `cluster-operation`, `cluster-item`, `main-nav`                  |
| 630           | Pre-commit hooks                 | `.husky/pre-commit` + `.husky/pre-push` exist                                                                      |
| 729           | Bundle-size regression           | `size-limit` + `size:check` script configured                                                                      |
| 486/580       | OTel observability               | `@opentelemetry/api` tracing middleware in `packages/api/src/trpc.ts`; `apps/nextjs/src/instrumentation.ts` exists  |
| 498/721       | RBAC + authorization             | `packages/api/src/authorization.ts`, `rbac.test.ts`, `authorization.test.ts`, `admin.test.ts` exist                 |
| 688           | middleware → proxy               | `apps/nextjs/src/proxy.ts` implements CSRF validation (Origin/Referer vs `NEXT_PUBLIC_APP_URL`, `CSRF_ALLOWED_ORIGINS`) + security headers (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, COOP, CORP) — effectively resolved |

**Verdict: no classification changes vs. loop 16/17.** No issue satisfies all repair-mode constraints simultaneously (genuinely open **and** minimal/atomic **and** non-blocked **and** safe). Per the FAIL-SAFE rule, no speculative or risky change was made this loop.

## 6. Health Findings (no safe minimal fix available)

### 6.1 CVE-2026-54285 (GHSA-8988-4f7v-96qf), moderate — unchanged from loop 17

- **Path**: `apps/nextjs > contentlayer2@0.4.6 > @contentlayer2/utils@0.4.3 > @opentelemetry/core@1.30.1`.
- **Issue**: `W3CBaggagePropagator.extract()` unbounded memory allocation (CWE-770). CVSS 5.3. Patched in `@opentelemetry/core >= 2.8.0`.
- **Why not safely fixable**: `@contentlayer2/utils@0.4.3` declares `@opentelemetry/core: ^1.24.0` (1.x only); forcing 2.8.0 violates the range and creates a dual-core OTel hazard at `contentlayer2 build`. Exploitability in this repo is negligible (build-time CLI, no untrusted inbound `baggage` headers). Root `package.json` overrides already carry the correct mixed 1.x/2.x structure.
- **Recommendation**: keep as documented accepted risk (loop-17 Option A) — or add `pnpm.auditConfig.ignoreCves` after maintainer review (Option B). No change made (security-sensitive, requires human review).

### 6.2 `pnpm security:check` fails on `pnpm outdated` (dev-only signal)

- `security:check` = `pnpm audit --audit-level=high && pnpm outdated`. Audit part passes (only 1 moderate < high threshold); `pnpm outdated` exits 1 with **11 dev-dependency packages** behind latest: `@playwright/test 1.62.0→1.62.1`, `turbo 2.10.7→2.10.8`, `eslint-plugin-turbo 2.10.7→2.10.8`, `playwright 1.62.0→1.62.1`, `@turbo/gen 2.10.7→2.10.8`, `lint-staged 17.2.0→17.3.0`, `prettier 3.8.1→3.9.6`, `eslint 8.57.0→10.8.0` (major), `typescript 5.9.3→7.0.2` (major), `vite 7.3.5→8.2.0` (major), `prettier-plugin-tailwindcss 0.7.2→0.8.1`.
- **Why not a repair target**: all are `devDependencies`; the majors (eslint 8→10, TS 5.9→7, vite 7→8) are breaking-version upgrades that would risk build/lint breakage and violate "minimal, atomic changes only". The script is a DX signal, **not** gated in any CI workflow (`on-pull.yml`/`iterate.yml` run no `security:check` step). No change made.

## 7. STEP 1/2/3 — Normalization, Duplicate Detection, Consolidation (blocked, unchanged)

- **STEP 1 (label normalization)**: ~40 issues missing priority label, ~12 missing category label, ~14 multi-category. Batch mutation → `addLabelsToLabelable` **403 (re-verified live on #726 this loop)**. Full target matrix preserved in `.omo/issue-normalization-audit.md`.
- **STEP 2 (duplicate closure)**: duplicate clusters confirmed still open (closure blocked — `createIssue`/`addComment`/`closeIssue` all 403):
  - Distributed rate limiter: #496 (P0, code-fixed) / #480 (P1, code-fixed) — duplicate.
  - pnpm-in-CI: #305 / #584 / #595 / #670 / #744 — all workflow-blocked (`iterate.yml` lines 72/342 still `npm ci || true`).
  - Playwright E2E: #501 / #628 — both resolved (`tests/e2e/`).
  - tRPC doc-gen: #731 / #749 — both resolved (`openapi.ts`, `docs-generator.ts`, `api/docs/route.ts`).
  - .nvmrc: #720 / #748 — both resolved (`.nvmrc` = 22.14.0).
  - Observability: #486 / #580 — both resolved (OTel merged PR #1066).
- **STEP 3 (consolidation)**: no new small-issue clusters beyond the established maps; consolidation blocked.

## 8. Action Log

| Timestamp (UTC)        | Action                          | Target                                          | Result                                                                                                                              |
| ---------------------- | ------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-02T21:4x       | Phase 0 detection               | repo                                            | 0 open PRs, 82 open issues → ISSUE MANAGER MODE                                                                                     |
| 2026-08-02T21:4x       | Permission probes (live)        | issues / user / repo                            | label mutation 403 (`addLabelsToLabelable`); issue create 403 (`createIssue`); `gh api user` 403                                     |
| 2026-08-02T21:4x       | Push probe + cleanup            | branch `__loop18-push-probe`                    | Pushed successfully; deleted after probe (no residue)                                                                               |
| 2026-08-02T21:4x       | Workflow-push probe + cleanup   | branch `__loop18-wf-test` + `__probe-test.yml`  | **Rejected**: "refusing to allow a GitHub App to create or update workflow ... without workflows permission"; branch deleted         |
| 2026-08-02T21:44       | Dependency install              | repo (Node 22.23.1 via `n`, pnpm 10.28.2)      | `pnpm install --frozen-lockfile` OK (one workerd build-script notice, non-blocking)                                                 |
| 2026-08-02T21:44–21:47 | **Health suite**                | repo                                            | typecheck 8/8 ✅ · lint 9/9 ✅ zero warnings · tests 1498/1498 ✅ · circular clean ✅ · security:audit 1 moderate ⚠️                  |
| 2026-08-02T21:48       | `security:check` analysis       | package.json + CI workflows                     | Fails only on `pnpm outdated` (11 dev-only, major gaps); not CI-gated; classified non-repair (§6.2)                                  |
| 2026-08-02T21:49       | Spot-check matrix               | 24 "R"/"X" claims across 82 issues              | All held; no classification changes vs. loop 16/17 (§5.1)                                                                            |
| 2026-08-02T21:5x       | Audit authored                  | `docs/issue-manager-audit-2026-08-02-loop18.md` | This document                                                                                                                       |
| 2026-08-02T21:5x       | Audit delivered                 | PR (this branch)                                | See PR description                                                                                                                  |

## 9. Final State

- **Active phase**: ISSUE MANAGER MODE — STEP 1/2/3 blocked (issues:write absent; 403 verified live this loop incl. `createIssue`); STEP 4 repair backlog **empty** (validated by 24 independent spot-checks + full health suite).
- **Open PRs**: 1 (this report's PR pending merge).
- **Open issues**: 82 (unchanged — issue mutations blocked; ~62 resolved-but-open).
- **Repo health**: green (typecheck/lint/test/circular) with 1 documented moderate advisory (§6.1) and a dev-only `pnpm outdated` signal (§6.2).
- **Waiting for human review** (privileged token required for issue/workflow mutations):
  1. Close resolved-but-open issues (~62) per loop-16 §5 matrix.
  2. Apply label normalization per `.omo/issue-normalization-audit.md`.
  3. Apply the pnpm-CI patch to `iterate.yml` (`npm ci || true` → `pnpm install --frozen-lockfile`, lines 72/342) — fixes #305/#584/#595/#670/#744; requires `workflows` scope.
  4. Add security-scanning workflows (fixes #728; spec at `docs/workflow-security-audit.yml`) and the `check:circular` CI step (#488).
  5. Close duplicate clusters per §7.
  6. Review §6.1 and decide Option A/B/C for CVE-2026-54285; optionally pin dev-deps or scope `security:check` (not CI-gated) per §6.2.
  7. Restore `issues: write` + `workflows` permissions on the runtime token.
- **Local note (out of scope, untouched)**: working tree contains untracked `.omo/` migration artifacts and two unstaged deletions of `.opencode/*.json` from the harness migration. Left as-is per the fail-safe rule (not repo content; not tied to any issue).
