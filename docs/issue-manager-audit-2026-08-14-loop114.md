# Issue Manager Audit Report — 2026-08-14 (Loop 114)

**Date**: 2026-08-14T09:00:00Z
**Mode**: ISSUE MANAGER MODE (Phase 0: 0 open PRs, 82 open issues)
**Branch**: `main` @ `4aaa64b`

---

## Decision Summary

Phase 0 entry decision: **no open PRs**, **82 open issues** → entered **ISSUE MANAGER MODE**.
Executed STEP 1 (normalization), STEP 2 (dedupe), STEP 3 (consolidate) as far as token
permissions allow, then STEP 4 (repair mode). The repair executed a verified security fix
(PR #1266); the primary stability repair target (CI Node version) is **blocked** by token
permissions (see below).

---

## Action Log

| Timestamp (UTC)  | Action                      | Target                                                         | Result                                                                                                 |
| ---------------- | --------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 2026-08-14T08:55 | Phase 0 triage              | 0 open PRs / 82 open issues                                    | ISSUE MANAGER MODE                                                                                     |
| 2026-08-14T08:56 | Full issue inventory        | 82 issues via `gh issue list`                                  | Label/priority gap analysis complete                                                                   |
| 2026-08-14T08:57 | Verify resolved-in-code     | 60+ issues cross-checked against `main`                        | ~56 confirmed resolved / 9 duplicates / ~9 genuinely open                                              |
| 2026-08-14T08:58 | STEP 1 label normalization  | 39 issues needing category/priority labels                     | **BLOCKED** — `addLabels` 403 (token lacks `issues: write`) — map recorded below                       |
| 2026-08-14T08:59 | STEP 2/3 dedupe+consolidate | 9 duplicate + 1 consolidate candidate                          | **BLOCKED** — `closeIssue`/`addComment` 403 — map recorded below                                       |
| 2026-08-14T09:00 | Full verification run       | `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm audit`       | typecheck 9/9, lint 9/9, tests 138 files / 2079 pass; **2 vulnerabilities found (1 high, 1 moderate)** |
| 2026-08-14T09:01 | STEP 4 repair selection     | Lowest criterion: B1 Stability (70) → CI Node version mismatch | **BLOCKED** — push of `.github/workflows/` rejected (no `workflows` permission) — patch recorded below |
| 2026-08-14T09:02 | STEP 4 repair (fallback)    | `puppeteer` dead dependency (HIGH advisory)                    | Fixed — commit `1ae07b1`, pushed to `fix/remove-unused-puppeteer`                                      |
| 2026-08-14T09:03 | Verify repair               | typecheck / lint / test / audit                                | 9/9, 9/9, 2079 pass; **high-severity 1 → 0**                                                           |
| 2026-08-14T09:04 | **Create PR #1266**         | `fix/remove-unused-puppeteer` → `main`                         | OPEN, MERGEABLE, labels `bug`+`security`+`P1`; Vercel check pending                                    |

---

## STEP 1 — Label Normalization (computed, application BLOCKED)

The following labels are missing per issue (category + priority per the mandatory label
system). Recorded here so a future run with `issues: write` can apply them:

| Issue | Add             | Rationale                                    |
| ----- | --------------- | -------------------------------------------- |
| #305  | P2              | ci, enhancement present; pnpm consistency P2 |
| #584  | P2              | dup of #305                                  |
| #595  | ci, P2          | platform-engineer only; dup of #305          |
| #628  | P2              | dup of #501                                  |
| #630  | P2              | enhancement only                             |
| #631  | P2              | enhancement only                             |
| #632  | P1              | security logging audit (sensitive data)      |
| #634  | P2              | enhancement only                             |
| #635  | docs, P2        | had `documentation` (non-standard)           |
| #636  | P3              | resolved-by-design; would close              |
| #668  | P3              | enhancement only                             |
| #670  | ci              | dup of #305                                  |
| #697  | docs, P2        | technical-writer only                        |
| #713  | P2              | enhancement,test present                     |
| #719  | P2              | enhancement only                             |
| #720  | P2              | enhancement only                             |
| #721  | P1              | security only                                |
| #722  | P1              | security only                                |
| #723  | P2              | enhancement only                             |
| #724  | P2              | dup of #501                                  |
| #725  | P2              | dup of #631                                  |
| #726  | P2              | ci only                                      |
| #727  | P3              | enhancement only                             |
| #728  | P1              | security only                                |
| #729  | P2              | enhancement only                             |
| #731  | P3              | enhancement only                             |
| #744  | ci, P2          | dup of #305                                  |
| #748  | bug, P3         | DX-engineer only; invalid .nvmrc (resolved)  |
| #749  | enhancement, P3 | dup of #731                                  |
| #751  | enhancement, P3 | performance-engineer only                    |
| #752  | enhancement, P3 | DX-engineer only                             |
| #753  | enhancement, P3 | frontend-engineer only                       |
| #754  | test, P2        | quality-assurance only                       |
| #755  | enhancement, P2 | database-architect only                      |
| #785  | P1              | bug only; duplicate next dep (resolved)      |
| #786  | P1              | security only (resolved)                     |
| #787  | P2              | test only (resolved)                         |
| #788  | P2              | test only (resolved)                         |
| #789  | P2              | enhancement only (resolved)                  |

---

## STEP 2/3 — Duplicate & Consolidation Map (closure BLOCKED)

| Issue to close | Canonical | Reason                                             |
| -------------- | --------- | -------------------------------------------------- |
| #480 [P1]      | #496      | Duplicate — in-memory rate limiter → Redis         |
| #584 [ci]      | #305      | Duplicate — pnpm consistency in workflows          |
| #595           | #305      | Duplicate — GitHub Actions use npm instead of pnpm |
| #670 [P3]      | #305      | Duplicate — iterate.yml pnpm fix                   |
| #744           | #305      | Duplicate — iterate.yml pnpm fix                   |
| #628           | #501      | Duplicate — Playwright E2E implementation          |
| #724           | #501      | Duplicate — e2e coverage for critical flows        |
| #725           | #631      | Duplicate — integration tests for API routers      |
| #749           | #731      | Duplicate — AI-powered API docs/testing generator  |

Consolidation: **#631** (API router tests: k8s/customer/stripe) is the canonical umbrella
for #725 (generic) and #754 (Stripe webhook idempotency — has dedicated tests).

---

## Verified Resolved in Code (new this loop, beyond loop-113 list)

Re-verified against `main` (loop-113 report already covers #496/#480/#498/#515/#501/#500/
#549/#550/#551/#581/#578/#666/#613/#683/#492/#486/#580/#688/#705/#706/#708/#635/#503/
#663/#684/#752/#685/#485/#787/#636/#483/#723/#753):

| Issue | Title                       | Evidence                                                                 |
| ----- | --------------------------- | ------------------------------------------------------------------------ |
| #609  | Consolidate Zod schemas     | `packages/api/src/router/schemas.ts` (single source of truth, #609)      |
| #611  | not-found.tsx               | `apps/nextjs/src/app/not-found.tsx`                                      |
| #630  | Pre-commit hooks            | `.husky/pre-commit` runs typecheck + test + lint-staged                  |
| #632  | Sensitive logging audit     | PR #1061 merged; `docs/security-logging-audit.md`                        |
| #634  | TS strictness               | `tooling/typescript-config/base.json` `"strict": true`                   |
| #664  | console.\* → pino           | Only JSDoc `console.log` remain in stripe; `logger.ts` (pino) exists     |
| #667  | Export boundaries           | PR #1233 merged (docs)                                                   |
| #687  | Barrel exports              | All packages have `index.ts` (api/ui/common/stripe/auth/db)              |
| #697  | Docs corruption             | PR #1219 merged (README corruption artifact removed)                     |
| #713  | common utils tests          | `packages/common/src/**/*.test.ts` (observability, config/\*)            |
| #719  | Root tsconfig               | Root `tsconfig.json` exists                                              |
| #720  | Missing .nvmrc              | `.nvmrc` = `22.14.0`                                                     |
| #721  | Authz checks                | `packages/api/src/authorization.ts` used in trpc/customer/admin          |
| #722  | Env validation              | `packages/*/src/env.mjs` + PR #1189 (unit tests)                         |
| #726  | Dependency consistency      | `check-deps` script in root `package.json` (wired into dx:check)         |
| #728  | Security scanning CI        | `security:audit`/`security:check` scripts + synced template (PR #1261)   |
| #729  | Bundle size regression      | `size-limit` + `size:check`/`size:analyze` scripts                       |
| #748  | Invalid .nvmrc              | `.nvmrc` now `22.14.0` (valid)                                           |
| #754  | Stripe webhook idempotency  | `packages/stripe/src/webhook-idempotency.test.ts`                        |
| #755  | Composite index             | Schema `@@index([authUserId, plan, stripeCurrentPeriodEnd])` + migration |
| #785  | Duplicate next dep (stripe) | `packages/stripe/package.json` deps clean (no `next`)                    |
| #786  | Webhook secret logging      | No secret value logged in `packages/stripe/src`                          |
| #788  | UI component tests          | PRs #1243/#1247/#1250-#1253 merged                                       |
| #789  | peerDependencies (ui)       | `packages/ui/package.json` has `next`/`react`/`react-dom` peers          |

**Genuinely open (repair candidates, not workflow-blocked)**: #487 (Redis app caching, P2),
#494 (domain layer, P2), #523 (barrel export audit, P3), #610 (tRPC response format, P2),
#668/#727/#731 (AI innovation, P3), #751 (tRPC bundle size, P3).

---

## STEP 4 — Repair Mode

### Selection

No P0/P1 issues remain genuinely open (all verified resolved). Per contract → lowest-scoring
domain/criterion: **Domain B (System Quality, 77.3) / B1 Stability (70)** — CI Node version
mismatch; **Domain D (Delivery & Evolution, 77.0) / D1 CI/CD Health (70)** — workflow issues.

### Target 1: CI Node version mismatch — **BLOCKED**

`engines: {"node": ">=22"}`, `.nvmrc: 22.14.0`, Node 20 EOL (2026-04) — but CI pins
`node-version: 20` in **5 locations**: `on-pull.yml:55`, `iterate.yml:70/266/340/395`.
Documented as P0 in `docs/ci/diagnostic-report-2026-07-09.md`; never fixed. Patch prepared
(switch all to `node-version-file: '.nvmrc'`, matching `docs/ci/bundle-size-monitoring.md`
convention; YAML-validated) but **push rejected**: _"refusing to allow a GitHub App to create
or update workflow `.github/workflows/iterate.yml` without `workflows` permission"_.
Last workflow change on main was 2026-07-20 (via dependabot, separate permissions).

### Target 2 (executed): Remove unused `puppeteer` (HIGH advisory) — PR #1266

`pnpm audit` reported **1 high** (GHSA-jmr9-qjv8-65gv, extract-zip ≤2.0.1, no patched
version) via `apps__nextjs > puppeteer > @puppeteer/browsers > extract-zip`. `puppeteer` is a
**dead dependency** — zero source references (repo-wide grep; only `package.json` +
`pnpm-workspace.yaml`). Removed it → vulnerability eliminated.

- **Files**: `apps/nextjs/package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` (463 del)
- **Verification**: typecheck 9/9, lint 9/9, tests 138 files / 2079 pass, audit high 1→0
- **Remaining moderate**: `@contentlayer2/utils>@opentelemetry/core: 1.30.1` — **intentional**
  scoped override for v1-API compatibility (documented in root `pnpm.overrides`); bumping to
  ≥2.8.0 risks breaking `@contentlayer2`. Accepted risk, not changed.
- **PR**: https://github.com/cpa03/basefly/pull/1266 — OPEN, MERGEABLE, labels applied
  (`bug`, `security`, `P1`). Auto-merge could not be enabled (returns null); Vercel check
  pending at time of writing. Merge deferred until CI green (contract: all checks green).

---

## Blocked Actions (token permissions, FAIL-SAFE)

Direct API verification this loop:

1. **Label normalization** → `addLabels` 403
2. **Close issues** → `closeIssue` 403
3. **Comment on issues** → `addComment` 403
4. **Create issues** → `createIssue` 403
5. **Push `.github/workflows/`** → refused without `workflows` permission
6. **Auto-merge** → `gh pr merge --auto` returns null (not enabled)

These require a token with `issues: write` and `workflows: write` (the `iterate.yml`
workflow's token has `issues: write` but this session ran under `on-pull.yml` permissions:
`contents`/`pull-requests`/`actions: read`/`repository-projects`/`id-token` only).

No destructive action was taken; no guesses were made. All information preserved above.

---

## Final State

**Status**: `waiting for human review` — PR #1266 (puppeteer removal, eliminates 1 HIGH
vulnerability) is open and mergeable, awaiting CI. Issue normalization (STEP 1), dedupe
(STEP 2/3), and the CI Node version fix (STEP 4 target 1) are blocked on token permissions
(`issues: write` / `workflows: write`); exact label maps, duplicate maps, and the prepared
Node version patch are recorded above for a future run with appropriate permissions.
