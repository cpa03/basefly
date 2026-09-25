# Issue Manager Audit — 2026-09-25 (loop8)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 → Step 0.2). Steps 1–3 analyzed-and-documented (issue API 403 → blocked), **Step 4 evaluated → FAIL-SAFE (no repair possible without guessing)**.

## Decision Summary

| Check             | Result                                                                        |
| ----------------- | ----------------------------------------------------------------------------- |
| Open PRs (0.1)    | **0** → not PR Handler Mode                                                   |
| Open issues (0.2) | **82** → **ISSUE MANAGER MODE**                                               |
| DEFAULT_BRANCH    | `main` (local `main` == `origin/main` at `b2af2a2`)                           |
| Issue mutations   | **403 all** (GraphQL `addLabelsToLabelable` + REST PATCH) → Steps 1–3 blocked |
| Step 4 selection  | **No repairable issue** — every P0/P1/P2 verified stale or permission-blocked |
| Repair            | **none** — FAIL-SAFE: documented, not guessed                                 |

## Permission Probes (this session)

| Probe                            | Result                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `gh issue edit 789 --add-label`  | **403** `addLabelsToLabelable` (GraphQL)                                                     |
| `gh api -X PATCH .../issues/789` | **403** `Resource not accessible by integration`                                             |
| `gh api user`                    | **403** (token identity scoped to job)                                                       |
| `git push --dry-run origin main` | **OK** (auth accepted)                                                                       |
| `gh pr create` / `gh pr merge`   | not needed this cycle (no code delta to ship)                                                |
| Workflow-file push               | **REJECTED** (carried over from loop5/loop6 probes: GitHub App lacks `workflows` permission) |

Token: `github-actions[bot]` GITHUB_TOKEN from `on-pull.yml`
(`permissions: {contents: write, pull-requests: write, actions: read, repository-projects: write, id-token: write}` — **no `issues: write`**).
Per FAIL-SAFE, blocked actions were documented, not guessed.

## Step 1 — Label Normalization: PREPARED, NOT APPLIED (403)

### Missing category (12)

`#755, #754, #753, #752, #751, #749, #748, #744, #697, #670, #635, #595`
(specialist-only labels such as `DX-engineer` / `platform-engineer`; `#635` carries non-canonical `documentation` → add `docs`)

Proposed: `ci` → #744, #670, #595 · `docs` → #697, #635 · `test` → #754 · `enhancement` → #753, #751, #755, #752 · `bug` → #748 · `feature` → #749

### Missing priority (38)

`#789, #788, #787, #786, #785, #755, #754, #753, #752, #751, #749, #748, #744, #731, #729, #728, #727, #726, #725, #724, #723, #722, #721, #720, #719, #713, #697, #668, #636, #635, #634, #632, #631, #630, #628, #595, #584, #305`

(loop7 listed 37 — this pass also catches **#584**, which has `enhancement,ci` but no priority.)

Proposed (aligned with loop7 for continuity; #584 added):

- **P1** — #786, #728, #722, #721, #632
- **P2** — #788, #787, #754, #753, #751, #744, #755, #785, #725, #724, #723, #713, #697, #634, #631, #628, #595, #584, #305
- **P3** — #789, #752, #749, #748, #731, #729, #727, #726, #720, #719, #668, #636, #635, #630

### Multiple category labels (keep most specific, drop `enhancement`)

`#713, #584, #522, #581, #551, #550, #549, #305`

## Step 2 — Duplicate Detection: VERDICTS READY, CLOSURES BLOCKED (403)

| Cluster                  | Canonical     | Verdicts                                                                                                                                                                                                 |
| ------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redis rate limiter       | **#496 (P0)** | #480 → DUPLICATE. Both IMPLEMENTED (`distributed-rate-limiter.ts`, 3 test suites, `docs/redis-setup.md`)                                                                                                 |
| pnpm vs npm in workflows | **#305**      | #584, #595, #670, #744 → DUPLICATE. Fix **BLOCKED** (`.github/workflows/*` push rejected; `iterate.yml` lines 54–58, 72, 342 still npm)                                                                  |
| `.nvmrc`                 | #748          | #720 → STALE (file exists, `22.14.0`); #748 → STALE (value no longer `20`)                                                                                                                               |
| E2E / Playwright         | #501          | #628 → STALE (config + 11 specs in `tests/e2e/`); #724 → STALE (flows now covered by auth/subscription/billing/webhook/authz-bypass specs); #501 residual = CI integration → **BLOCKED** (workflow file) |
| API router tests         | #725          | #631, #551, #754 → STALE (router + idempotency suites exist); #725 itself STALE (`integration.test.ts` covers rate-limit, CSRF, auth, concurrency)                                                       |
| API-docs generation      | #731          | #749 → OVERLAP (related-keep; both P3 innovation)                                                                                                                                                        |
| Barrel exports           | #687          | #523, #667 → STALE (`index.ts` everywhere; `docs/export-boundaries.md`, `barrel-export-audit-2026-08-17.md`, `madge` in `ci:check`)                                                                      |

## Step 3 — Consolidation: NO ACTION POSSIBLE (403)

- Testing family **#500/#501/#549/#550/#551** already grouped under **#581** — every child verified **STALE** except #501's CI-integration residual (workflow-blocked). Recommend closing #581 + children as completed.
- pnpm cluster (4 issues) → fold into #305; all workflow-blocked for repair.
- `.nvmrc` pair (#720/#748) → both stale, recommend close.

## Step 4 — Repair Selection: FULL TRACE (FAIL-SAFE → no PR)

Exhaustive verification of every P0/P1, then every P2 candidate, against the working tree:

| Issue                                                                  | Pri   | Verdict                       | Evidence                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | ----- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #496 rate limiter                                                      | P0    | **STALE — implemented**       | `packages/api/src/distributed-rate-limiter.ts`, `trpc.ts:439 checkAsync`, env-config commit `e74bbe9`, 3 test suites, `docs/redis-setup.md`                                                      |
| #480 (dup)                                                             | P1    | **STALE — duplicate of #496** | same implementation                                                                                                                                                                              |
| #498 RBAC                                                              | P1    | **STALE — implemented**       | `Role` enum + `role @default(USER)` in `schema.prisma`, `requireRole` `trpc.ts:349`, `admin-access.ts`, `rbac.test.ts`                                                                           |
| #515 CSRF                                                              | P1    | **STALE — implemented**       | `apps/nextjs/src/lib/csrf.ts`, `csrfProtection` `trpc.ts:104`, docs merged via PR #1503                                                                                                          |
| #786 secret log                                                        | P1    | **STALE — fixed**             | webhook route logs "non-secret identifier" only; redaction comments `route.ts:153–163`; no `slice(-8)` anywhere                                                                                  |
| #722 env validation                                                    | P1    | **STALE — implemented**       | `apps/nextjs/src/env.mjs` (`createEnv` + zod), `packages/common/src/env.mjs`                                                                                                                     |
| #721 authorization                                                     | P1    | **STALE — implemented**       | `requireRole`, `adminProcedure`, `createRoleBasedProcedure` (`trpc.ts:349/422`)                                                                                                                  |
| #632 sensitive logging                                                 | P1    | **STALE — implemented**       | `sensitive-data-logging.test.ts` (codebase scanner), `logger.test.ts` "issue #632" redaction suites                                                                                              |
| #500 auth tests                                                        | P1    | **STALE**                     | `tests/e2e/auth.spec.ts`, `apps/nextjs/src/utils/clerk.test.ts`, `packages/auth/clerk.test.ts`                                                                                                   |
| #501 Playwright                                                        | P1    | **BLOCKED**                   | specs exist; CI integration needs workflow file → push rejected                                                                                                                                  |
| #549 auth module tests                                                 | P1    | **STALE**                     | `packages/auth/{clerk,env,logger}.test.ts`                                                                                                                                                       |
| #550 nextjs coverage                                                   | P1    | **STALE**                     | `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}`                                                                                                                                   |
| #551 k8s tests                                                         | P1    | **STALE**                     | `k8s.test.ts`, `k8s-router.test.ts`                                                                                                                                                              |
| #581 testing meta                                                      | P1    | **STALE (children done)**     | see above; only #501 residual remains (blocked)                                                                                                                                                  |
| #785 dup next dep                                                      | P2    | **STALE**                     | no `next` entry in `packages/stripe/package.json`                                                                                                                                                |
| #788 UI tests                                                          | P2    | **STALE**                     | 15+ tests incl. `navbar.test.tsx`, `modal.test.tsx`, `cluster-list.test.tsx` (all four ACs covered)                                                                                              |
| #787 db tests                                                          | P2    | **STALE**                     | `migrations.test.ts` covers migration structure + schema integrity (incl. #755's exact indexes)                                                                                                  |
| #755 composite index                                                   | P2    | **STALE**                     | `@@index([authUserId, plan, stripeCurrentPeriodEnd])` already in `schema.prisma:44`                                                                                                              |
| #754 idempotency tests                                                 | P2    | **STALE**                     | `packages/stripe/src/webhook-idempotency.test.ts` — 25+ cases incl. duplicate-skip & error paths                                                                                                 |
| #725 API integration tests                                             | P2    | **STALE**                     | `router/integration.test.ts`: rate-limit, CSRF, auth, concurrency describes                                                                                                                      |
| #724 e2e coverage                                                      | P2    | **STALE**                     | 11 specs incl. `subscription-workflows`, `webhook-error-handling`, `authorization-bypass`                                                                                                        |
| #631 router tests                                                      | P2    | **STALE**                     | `k8s/customer/stripe-router.test.ts` exist                                                                                                                                                       |
| #628 Playwright                                                        | P2    | **STALE**                     | Playwright configured, specs run                                                                                                                                                                 |
| #697 docs corruption                                                   | P2    | **STALE**                     | fence-balance scan clean across `docs/**` + `README*`; U+FFFD hits are audit reports quoting the scan (loop223/229 verified); README fixed by PR #1505                                           |
| #613 dup workflow                                                      | P2    | **STALE**                     | only `iterate.yml` + `on-pull.yml` exist                                                                                                                                                         |
| #683 eslint config                                                     | P2    | **STALE**                     | root `.eslintrc.cjs` (`root: true`) extends `tooling/eslint-config`                                                                                                                              |
| #664 pino logger                                                       | P2    | **STALE**                     | only commented examples remain; `packages/stripe/src/logger.ts` in use                                                                                                                           |
| #666 error boundary                                                    | P2    | **STALE**                     | `app/error.tsx` + `app/global-error.tsx` exist                                                                                                                                                   |
| #688 middleware                                                        | P2    | **STALE**                     | Next 16 rename: `apps/nextjs/src/proxy.ts` (CSRF-wired) is the middleware                                                                                                                        |
| #610 response format                                                   | P2    | **STALE**                     | `response.ts` + all 4 routers import it                                                                                                                                                          |
| #609 Zod dup                                                           | P2    | **STALE**                     | schemas centralized; routers import `./schemas`                                                                                                                                                  |
| #634 TS strictness                                                     | P2    | **STALE**                     | `tooling/typescript-config/base.json`: `"strict": true` + `noUncheckedIndexedAccess`; all tsconfigs extend; 12 remaining are justified `@ts-expect-error` (not `@ts-ignore`) in `soft-delete.ts` |
| #635 onboarding guide                                                  | P2    | **STALE**                     | `docs/ONBOARDING.md` exists (referenced by README)                                                                                                                                               |
| #632/#722/#721                                                         | P2→   | see P1 above                  |                                                                                                                                                                                                  |
| #579 pnpm error msg                                                    | P2    | **STALE**                     | `preinstall: node scripts/check-package-manager.js` in `package.json:28`                                                                                                                         |
| #578 dup health                                                        | P2→P3 | **STALE**                     | single `/api/health` route only                                                                                                                                                                  |
| #705 Docker                                                            | P2    | **STALE**                     | `Dockerfile` + `docker-compose.yml` exist                                                                                                                                                        |
| #590 UI audit                                                          | P2    | **STALE**                     | `docs/ui-library-enterprise-audit-2026-08-13.md`                                                                                                                                                 |
| #580 monitoring                                                        | P2    | **STALE**                     | `instrumentation.ts` — Sentry init "(issue #580)"                                                                                                                                                |
| #486 OpenTelemetry                                                     | P2    | **STALE**                     | `instrumentation.ts` — OTel init "(issue #486)"                                                                                                                                                  |
| #483 transactions                                                      | P2    | **STALE**                     | `rlsTransaction` across auth/customer/k8s/stripe routers                                                                                                                                         |
| #485 Suspense                                                          | P2    | **STALE**                     | Suspense in layouts/pages across app                                                                                                                                                             |
| #708 bundle analyzer                                                   | P3    | **STALE**                     | `@next/bundle-analyzer` wired in `next.config.mjs`, `size-limit` scripts                                                                                                                         |
| #667/#523 barrel audits                                                | P3    | **STALE**                     | export docs + madge circular check                                                                                                                                                               |
| #611 not-found                                                         | P3    | **STALE**                     | 7 `not-found.tsx` files exist                                                                                                                                                                    |
| #630 pre-commit hooks                                                  | P3    | **STALE**                     | `pre-commit` runs typecheck/test/check-deps/lint-staged                                                                                                                                          |
| #684 root build script                                                 | P3    | **STALE**                     | `package.json` root scripts (`build`, `ci:check`, turbo)                                                                                                                                         |
| #719 root tsconfig                                                     | P3    | **STALE**                     | `tsconfig.json` exists                                                                                                                                                                           |
| #789 ui peerDeps                                                       | P3    | **STALE**                     | `peerDependencies` present (`react`, `react-dom`, `next`)                                                                                                                                        |
| #706 devcontainer                                                      | P3    | **STALE**                     | `.devcontainer/` exists                                                                                                                                                                          |
| #305/#670/#595/#584/#744, #502, #728, #726, #522, #488, #650           | P2/P3 | **BLOCKED**                   | real gaps only in `.github/workflows/*` → push rejected                                                                                                                                          |
| #494, #487, #521, #685, #753, #723, #636, #668, #749, #731, #727, #729 | P2/P3 | **UNCERTAIN / not atomic**    | architecture/feature-scale or runtime-verification scope; excluded from minimal-repair mandate                                                                                                   |

**Selection outcome:** No P0/P1/P2 issue offers a repairable gap under this session's permissions.
Per **FAIL-SAFE RULE**: STOP → documented here (issue creation itself is 403) → **no repair PR created**.

## Skills & Subagents Used

**Skills**

- `openx-basefly` (loaded): agent/model inventory → explained subagent failures below; project conventions confirmed.
- `github-workflow-automation`, `obra-superpowers-systematic-debugging`, `planning-with-files` (identified in `.opencode/skills`): not loaded — no workflow edits (permission-rejected) and no debugging task materialized.
- Contract self-check: findings verified against working tree directly (greps/reads listed per row above), not from issue bodies alone.

**Subagents** — 4 spawn attempts, **all failed on infrastructure** (`ProviderModelNotFoundError`):

| Task                         | Agent     | Error                             |
| ---------------------------- | --------- | --------------------------------- |
| Verify duplicate groups (×2) | `explore` | `opencode/gpt-5-nano` not found   |
| Verify duplicate groups      | `general` | `iflowcn/big-pickle` not found    |
| Verify P1 candidates         | `oracle`  | `opencode/glm-4.7-free` not found |

Provider suggests only `mimo-v2.6-flash-free`, `ling-3.0-flash-fin-free`, `muse-spark-1.3-contributor-free`.
All verification was therefore performed **by the orchestrator directly** (table above). Recommend fixing agent model IDs in `.opencode/oh-my-opencode.json` / `opencode.json`.

## Action Log

| Time (UTC)             | Action                              | Target                         | Result                                                   |
| ---------------------- | ----------------------------------- | ------------------------------ | -------------------------------------------------------- |
| 2026-09-25 14:16       | Phase 0.1 — open PR query           | `gh pr list`                   | **0** → not PR Handler                                   |
| 2026-09-25 14:16       | Phase 0.2 — open issue query        | `gh issue list`                | **82** → ISSUE MANAGER MODE                              |
| 2026-09-25 14:17       | Inventory snapshot                  | `/tmp/opencode/issues.json`    | 82 issues saved                                          |
| 2026-09-25 14:18       | Subagent spawn (verify duplicates)  | `explore` ×2, `general`        | **FAILED** — model not found                             |
| 2026-09-25 14:19       | Step 1 batch label edit (39 issues) | `gh issue edit --add-label`    | **403** all — documented                                 |
| 2026-09-25 14:20       | Permission diagnosis                | workflow perms + REST probe    | `issues: write` absent; REST PATCH 403                   |
| 2026-09-25 14:21       | Subagent spawn (P1 verification)    | `oracle`                       | **FAILED** — model not found                             |
| 2026-09-25 14:22       | P0/P1 verification sweep            | working tree                   | all stale/blocked (table above)                          |
| 2026-09-25 14:23       | Loop6/7 precedent review            | prior audit reports            | workflow-push rejection confirmed                        |
| 2026-09-25 14:24–14:29 | P2/P3 verification sweep            | ~40 candidates vs working tree | all stale / blocked / non-atomic                         |
| 2026-09-25 14:29       | Sync check                          | `git fetch origin main`        | local == remote `b2af2a2`                                |
| 2026-09-25 14:30       | FAIL-SAFE decision                  | Step 4                         | no repair; document                                      |
| 2026-09-25 14:31       | Write audit log                     | this file                      | Committed on `docs/issue-manager-audit-2026-09-25-loop8` |

## Final State

**waiting for human review** — blocked actions requiring human/admin action:

1. **Apply Step 1 labels** (12 category + 38 priority) — needs `issues: write` or manual application.
2. **Close duplicates/stale issues** (~60 verified stale; clusters in Step 2) — needs `issues: write`.
   Highest-value closures: #496, #480, #786, #722, #721, #632, #498, #515, #500, #549, #550, #551, #581 (children), #697, #785, #788, #787, #755, #754, #725, #724, #631, #628, #613, #683, #664, #666, #688, #610, #609, #634, #635, #579, #705, #590, #580, #486, #483, #485, #708, #667, #523, #611, #630, #684, #719, #789, #706, #720, #748, #713, #697.
3. **pnpm CI family** (#305 + 4 dupes): real `npm ci` remains in `iterate.yml:72,342` — needs `workflows` permission (or manual edit).
4. **#501 CI integration for E2E** — needs `workflows` permission.
5. **FAIL-SAFE issue** describing this uncertainty could not be created (issues API 403) — this file is the durable record instead.
6. **Fix agent model IDs** (`gpt-5-nano`, `glm-4.7-free`, `iflowcn/big-pickle` do not resolve) to restore subagent orchestration.
