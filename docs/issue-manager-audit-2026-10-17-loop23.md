# Issue Manager Audit — 2026-10-17 (loop 23)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-17 09:50–10:05 UTC                                                                                                                                                                                    |
| State machine         | Phase 0 → **ISSUE MANAGER MODE** (Phases 1–3 stopped per state machine)                                                                                                                                       |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `7d79b5d` = PR #1572 merge)                                                                                                                                                  |
| Phase 0.1 open PRs    | **0** → no PR HANDLER MODE                                                                                                                                                                                    |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical set to loops 7–22 — no drift)                                                                                                                                      |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 blocked at token 403; STEP 4 completed — all P0/P1 proven done or platform-blocked; 8 new already-implemented findings)                                                         |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§5)                                                                            |
| Skills used           | `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `openx-basefly` (repo harness conventions)                                                                     |
| Subagents             | 6 explore agents attempted (2 batches × 3) — all failed: `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free`. Fell back to fully first-hand verification (established loops 17–22 pattern) |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open` → `[]` → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
3. **Drift check**: `git log 51bb2e3..origin/main` → **1 commit** (`7d79b5d` = loop-22 audit merge #1572). Issue set itself unchanged (same 82 numbers) → **no drift**.
4. STEP 1: label-matrix recomputed first-hand → **33 compliant / 49 remediation** — identical to loops 7–22 → **no drift**; apply attempt (`gh api -X POST .../issues/789/labels` + `gh issue edit 789 --add-label`) → both **403** (§1, §5).
5. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–22 (§2).
6. STEP 4: **#496** (only P0) re-verified code-complete at `7d79b5d` and its rate-limiter test suites executed fresh: **54/54 passing** (§3).
7. **New verifications this run (loop 23)** — eight previously-open issues are **already implemented** or **stale**, evidenced first-hand:
   - **#725/#631** (API router tests for k8s/customer/stripe): `packages/api/src/router/` holds `k8s.test.ts`, `k8s-router.test.ts`, `customer.test.ts`, `customer-router.test.ts`, `stripe.test.ts`, `stripe-router.test.ts` plus `integration.test.ts`, `admin.test.ts`, `auth.test.ts`, `validation.test.ts` — combined run **136/136 green**.
   - **#634** (TypeScript strictness): `tooling/typescript-config/base.json` sets `"strict": true` and `"noUncheckedIndexedAccess": true`; **all 7** tsconfigs (root + apps/nextjs + 6 packages) extend `@saasfly/typescript-config/base.json`.
   - **#687** (barrel exports): all 6 packages (`api`, `auth`, `db`, `ui`, `stripe`, `common`) have `index.ts` + `exports` in package.json.
   - **#666** (global error boundary): `apps/nextjs/src/app/error.tsx`, `global-error.tsx`, and `not-found.tsx` all exist.
   - **#705** (Docker configuration): root `Dockerfile` + `docker-compose.yml` exist (Postgres + pgAdmin services per README).
   - **#578** (duplicate health check endpoint): **stale** — exactly one health route exists (`apps/nextjs/src/app/api/health/route.ts`); no duplicate to remove.
   - **#613** (duplicate GitHub Actions workflow file): **stale** — only `iterate.yml` and `on-pull.yml` exist, clearly distinct (trigger/purpose).
   - **#684** (root build script + turbo pipelines): **already done** — root `"build": "pnpm env:validate && turbo build"`; `turbo.json` defines standardized `build/dev/format/lint/typecheck/test/size:check/size:analyze` tasks.
8. **Additional evidence gathered this run (loop 23)**:
   - **#753** (route-based code splitting): substantially done — `next/dynamic` used in `dashboard/page.tsx`, `dashboard/settings/page.tsx`, `cluster-list.tsx`, marketing `page.tsx`, editor `cluster/[clusterId]/page.tsx`; `next.config.mjs` has `experimental.optimizePackageImports`.
   - **#663** (eslint-disable consolidation): substantially consolidated — only **9** non-test `eslint-disable` occurrences in production source (6 files; 2 of them generated `cloudflare-env.d.ts`).
   - **#726/#488** (dependency consistency + circular detection in CI): **partial** — `check-deps` (`check-dependency-version-consistency`) and `check:circular` (`madge --circular`) exist and are wired into `ci:check`/`dx:check` scripts, but **neither workflow file invokes `ci:check`**; `iterate.yml` still runs `npm ci || true` at lines 72/342 (the known #670/#744 inconsistency).
   - **#751** (tRPC bundle code splitting): **not implemented** — `packages/api/src/root.ts` composes a single merged `appRouter = mergeRouters(edgeRouter)` with no lazy mounting.
   - **#636** (ISR caching for dashboard): **intentionally not done** — `dashboard/page.tsx` documents "ISR intentionally not used — `force-dynamic` forces revalidate=0" → design decision, stale/wontfix candidate.
   - **#650** (extract AI prompts from on-pull.yml): **not implemented** — `on-pull.yml` is 438 lines with the full loop prompt embedded as a `PROMPT` heredoc (lines 76–435); `.github/prompts/agent-operating-contract.md` exists but the workflow's main prompt remains inline.
   - **#683** (ESLint/Prettier monorepo consistency): substantially done — single root `.eslintrc.cjs`; no divergent per-package eslint/prettier configs found.
   - **#729** (bundle size regression testing): substantially done for apps/nextjs — `size-limit` configured in `apps/nextjs/package.json` with `size:check`/`size:analyze` scripts and turbo tasks.
9. FAIL-SAFE: administrative closure of the stale/verified set and label application both require issue write → **403** → no guess made; this audit + the pre-staged patches remain the durable capture.
10. Pre-staged patches re-validated against current main (`7d79b5d`): `docs/patches/on-pull-issues-write-permission.patch` → **clean apply**; `docs/patches/fix-pnpm-consistency-iterate-744.patch` → **clean apply**.
11. Full green baseline re-established first-hand this run: **typecheck 9/9, lint 9/9, test 2207/2207 (151 files), build 1/1** — matches loop-19/21/22 baseline exactly → no regression.

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–22 → no-drift rule applies.

Remediation breakdown (recomputed first-hand from `gh issue list`):

- 24 missing priority only: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- 12 missing category: `595, 635, 670, 697, 744, 748, 749, 751, 752, 753, 754, 755` (670 already carries `P3`; 635 carries legacy `documentation`, not the contract `docs`)
- 13 multi-category: `713, 688, 584, 581, 551, 550, 549, 523, 522, 515, 498, 496, 305` (305 also missing priority)

**Application attempts (first-hand this run, both surfaces):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=P2"
  → REST 403: Resource not accessible by integration
gh issue edit 789 --add-label "P3"
  → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–23 no-flip-flop rule):**

```bash
# format: issue_number:category,priority
# SEMANTICS: for APPLY rows, REPLACE all category labels with the payload category
# and ensure exactly the payload priority.
APPLY=(
  789:enhancement,P3 788:test,P2 787:test,P2 786:security,P1 785:bug,P3
  755:enhancement,P2 754:test,P2 753:enhancement,P2 752:enhancement,P3 751:enhancement,P2
  749:feature,P3 748:bug,P2 744:ci,P2 731:feature,P3 729:test,P3 728:security,P1
  727:feature,P3 726:ci,P3 725:test,P2 724:test,P2 723:enhancement,P3
  722:security,P1 721:security,P1 720:docs,P2 719:chore,P2 713:test,P3
  697:docs,P2 668:feature,P3 636:enhancement,P3 635:docs,P2 634:refactor,P2
  632:security,P2 631:test,P3 630:chore,P3 628:test,P2 595:ci,P3 584:ci,P2 305:ci,P2
  670:ci            # has P3 + non-contract DX-engineer label; ADD category ci (keep P3)
)
# multi-category: replace all category labels with the single primary
MULTI=(713:test 688:security 584:ci 581:test 551:test 550:test 549:test 523:refactor
       522:ci 515:security 498:security 496:security 305:ci)
```

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters (re-derived)

Clusters unchanged from loops 17–22 (static issue set, no new issues this run):

| ID  | Members                 | Canonical | Disposition                                    |
| --- | ----------------------- | --------- | ---------------------------------------------- |
| D1  | 496, 480                | **496**   | Close 480 as duplicate of P0 (both Redis RL)   |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670 (P3, precise scope)      |
| D3  | 628, 501, 724           | **501**   | Close 628/724 as duplicates (Playwright E2E)   |
| D4  | 631, 725, 754           | **725**   | Close 631/754 as overlapping API test issues   |
| D5  | 720, 748                | **748**   | Both stale — `.nvmrc` now `22.14.0` (verified) |
| D6  | 785, 789                | —         | Not duplicates; both stale (§4)                |
| D7  | 551, 550, 549, 581      | **581**   | Testing-infra umbrella; children already done  |

Loop-23 note: D4's canonical **#725** is now **verified already-implemented** (§3, 136/136 green) — the whole cluster is close-ready once issue write is restored.

**Closing requires issue write → 403 → blocked (§5).**

---

## §3 STEP 4 — Repair Mode

### Selection

- P0 exists: **#496** → selected first (contract: highest-priority).
- Re-verified code-complete + tests executed fresh (below) → repair would be administrative close → **403** → FAIL-SAFE.
- Highest-priority P1s are all either already implemented (loops 21–23 verifications) or platform-blocked (#728 workflow-file change, §5).
- **#755** remains rejected as a repair target (FAIL-SAFE carried from loops 21–22: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- **#726/#488** evaluated as repair candidates: scripts already exist (`check-deps`, `check:circular` via madge) and are wired into `ci:check`; the remaining gap is workflow invocation + the `iterate.yml` npm→pnpm fix — but `iterate.yml` is a workflow file → **platform-blocked** (§5).
- **#636** rejected: code documents ISR as intentionally unused (`force-dynamic` design decision) → closing as wontfix requires issue write → blocked.
- **#751** (tRPC bundle code splitting) and **#650** (extract prompts) remain genuinely open but are non-critical enhancements with no P0/P1 pressure; per contract (minimal, atomic, no speculative work) they are left for a future loop or human implementation.
- Net: **no safely-implementable issue remains**; this loop's deliverable is verification evidence + this audit (established loop 17–23 pattern).

### #496 — code-complete (evidence, fresh at `7d79b5d`)

- `packages/api/src/trpc.ts:17` imports `getLimiter` from `./distributed-rate-limiter`; `:435` applies `getLimiter(endpointType)` in the `rateLimit()` middleware; `:485` exports `createRateLimitedProcedure`.
- `packages/api/src/distributed-rate-limiter.ts` — `DistributedRateLimiter` (Redis sliding window), `InMemoryRateLimiter` (fallback), `SyncRateLimiter` (graceful degradation wrapper), `getLimiter` factory.
- Env configuration present: `.env.example:124-133` (`REDIS_URL`, `RATE_LIMIT_*` per endpoint type); docs: `docs/redis-setup.md`.
- **Tests executed this run: `rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts` → 54/54 passing.**

### #725/#631 — ALREADY IMPLEMENTED (new verification, loop 23)

| Criterion                               | Evidence                                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| k8s router tests                        | `packages/api/src/router/k8s.test.ts` + `k8s-router.test.ts`                              |
| customer router tests                   | `packages/api/src/router/customer.test.ts` + `customer-router.test.ts`                    |
| stripe router tests                     | `packages/api/src/router/stripe.test.ts` + `stripe-router.test.ts`                        |
| Integration / admin / auth / validation | `integration.test.ts`, `admin.test.ts`, `auth.test.ts`, `validation.test.ts` also present |
| Tests green                             | Combined run of all 6 k8s/customer/stripe suites → **136/136 passing this run**           |
| Cluster D4 note                         | #631 and #754 are subsets of #725's scope → all three close-ready                         |

### #634 — ALREADY IMPLEMENTED (new verification, loop 23)

| Criterion              | Evidence                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| Central strict config  | `tooling/typescript-config/base.json` — `"strict": true`, `"noUncheckedIndexedAccess": true`           |
| All workspaces inherit | Root `tsconfig.json` + `apps/nextjs` + all 6 `packages/*` extend the shared base (verified one-by-one) |
| No per-package drift   | No leaf config redefines `strict` to `false`                                                           |

### #687 — ALREADY IMPLEMENTED (new verification, loop 23)

- All 6 packages have barrel `index.ts` (`api/src`, `auth/`, `db/`, `ui/src`, `stripe/src`, `common/src`) and expose `exports` (and/or `main`) in package.json.

### #666 — ALREADY IMPLEMENTED (new verification, loop 23)

- `apps/nextjs/src/app/error.tsx`, `global-error.tsx`, `not-found.tsx` all exist (App Router error-boundary convention).

### #705 — ALREADY IMPLEMENTED (new verification, loop 23)

- Root `Dockerfile` + `docker-compose.yml` exist (README documents Postgres + pgAdmin services).

### #578 / #613 — STALE (new verification, loop 23)

- **#578**: exactly one health route (`apps/nextjs/src/app/api/health/route.ts`) — no duplicate exists.
- **#613**: only two workflow files (`iterate.yml`, `on-pull.yml`) with distinct triggers/purposes — no duplicate workflow file exists.

### #684 — ALREADY IMPLEMENTED (new verification, loop 23)

- Root `package.json` has `"build": "pnpm env:validate && turbo build"`; `turbo.json` defines standardized pipeline tasks (`build`, `dev`, `format`, `lint`, `typecheck`, `test`, `size:check`, `size:analyze`).

### Additional loop-23 evidence (§4 promotions, not full §3 tables)

- **#753**: substantially done (`next/dynamic` on 5 dashboard/marketing/editor pages + `optimizePackageImports` in `next.config.mjs`).
- **#663**: substantially consolidated (9 non-test `eslint-disable` in production source).
- **#683**: substantially done (single root `.eslintrc.cjs`; no divergent per-package configs).
- **#729**: substantially done for apps/nextjs (`size-limit` configured with `size:check`/`size:analyze`).
- **#726/#488**: partial — scripts exist and are wired into `ci:check`, but workflows do not invoke `ci:check`; `iterate.yml` still has `npm ci || true` at lines 72/342.
- **#751**: not implemented (single merged `appRouter`).
- **#636**: intentionally not done (documented `force-dynamic` design decision) → wontfix candidate.
- **#650**: not implemented (`on-pull.yml` still embeds the 360-line PROMPT heredoc).

### on-pull.yml `issues: write` — repair still platform-blocked (carried from loop 20)

1. Pre-staged patch: `docs/patches/on-pull-issues-write-permission.patch` — **re-`git apply --check` clean against `7d79b5d` this run** (1 insertion at the `permissions:` block of `on-pull.yml`).
2. Companion patch: `docs/patches/fix-pnpm-consistency-iterate-744.patch` — **also clean against `7d79b5d`** (pnpm replacement for `npm ci || true` at `iterate.yml:72,342` — the npm usage was re-verified present this run).
3. Both remain unshippable from inside the loop: GitHub App cannot create/update any file under `.github/workflows/` without the `workflows` permission (loops 19–22 push rejections).

**Suggested maintainer action (single highest-leverage fix):** have a human account (or a PAT/GitHub App token with `workflows: write`) land `docs/patches/on-pull-issues-write-permission.patch` — one line in `on-pull.yml`. That alone unblocks STEP 1/2/3 for every subsequent loop (labels, comments, closes, creates). Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2), then administratively close the stale/duplicate/verified sets in §2/§4 (now including the 8 loop-23 promotions).

---

## §4 Stale / Already-Implemented Issues

Loop-22 table carries forward; **fresh additions and spot-checks this run** (all at `7d79b5d`):

| Issue | Claim                                   | Verdict (fresh loop-23 evidence)                                                                    |
| ----- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| #725  | Integration tests for API routers       | **Already implemented (NEW loop-23 verification — §3; 136/136 green across k8s/customer/stripe)**   |
| #631  | API router tests k8s/customer/stripe    | **Already implemented (NEW loop-23 — subset of #725; same 136/136 evidence)**                       |
| #634  | TypeScript strictness across packages   | **Already implemented (NEW loop-23 — strict+noUncheckedIndexedAccess in shared base, 7/7 inherit)** |
| #687  | Barrel exports across packages          | **Already implemented (NEW loop-23 — 6/6 packages have index.ts + exports)**                        |
| #666  | Global error boundary                   | **Already implemented (NEW loop-23 — error.tsx + global-error.tsx + not-found.tsx exist)**          |
| #705  | Docker configuration                    | **Already implemented (NEW loop-23 — Dockerfile + docker-compose.yml exist)**                       |
| #578  | Duplicate health check endpoint         | **Stale (NEW loop-23 — only one health route exists; nothing to remove)**                           |
| #613  | Duplicate GH Actions workflow file      | **Stale (NEW loop-23 — only iterate.yml + on-pull.yml, distinct purposes)**                         |
| #684  | Root build script + turbo pipelines     | **Already implemented (NEW loop-23 — root build script + standardized turbo tasks)**                |
| #753  | Route-based code splitting dashboard    | **Substantially done (NEW loop-23 — next/dynamic ×5 + optimizePackageImports)**                     |
| #663  | Consolidate eslint-disable comments     | **Substantially consolidated (NEW loop-23 — 9 non-test occurrences in production source)**          |
| #683  | ESLint/Prettier monorepo consistency    | **Substantially done (NEW loop-23 — single root .eslintrc.cjs, no per-package divergence)**         |
| #729  | Bundle size regression testing          | **Substantially done for apps/nextjs (NEW loop-23 — size-limit + size:check wired)**                |
| #726  | Dependency consistency checking in CI   | **Partial (NEW loop-23 — check-deps in ci:check script, but workflows don't invoke ci:check)**      |
| #488  | Circular dependency detection in CI     | **Partial (NEW loop-23 — madge check:circular in ci:check, same workflow gap)**                     |
| #751  | tRPC bundle code splitting              | **Not implemented (NEW loop-23 — single merged appRouter, no lazy mounting)**                       |
| #636  | ISR caching for dashboard               | **Intentionally not done (NEW loop-23 — force-dynamic design decision documented in code)**         |
| #650  | Extract AI prompts from on-pull.yml     | **Not implemented (NEW loop-23 — 438-line workflow with inline PROMPT heredoc)**                    |
| #789  | React peerDeps in packages/ui           | Already done — `peerDependencies` present (loop-21 evidence stands)                                 |
| #785  | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                                                                |
| #786  | Stripe webhook logs partial secret      | Already fixed — no secret logging in webhook route                                                  |
| #748  | `.nvmrc` invalid value `20`             | Stale (now `22.14.0`)                                                                               |
| #720  | `.nvmrc` missing                        | Stale (file exists, `22.14.0`)                                                                      |
| #719  | Missing root TypeScript config          | Stale — root `tsconfig.json` exists                                                                 |
| #722  | Env validation at startup               | Already done (`pnpm env:validate` gates `pnpm build`)                                               |
| #697  | Corrupted docs formatting               | Already fixed                                                                                       |
| #630  | Pre-commit: add typecheck+test          | Already done — `.husky/pre-commit` runs typecheck+test+check-deps+lint-staged                       |
| #611  | Add `not-found.tsx`                     | Already done — `apps/nextjs/src/app/not-found.tsx` exists                                           |
| #664  | Replace console.\* with pino            | Already done — only commented-out doc examples remain                                               |
| #492  | `sizes` attr for responsive images      | Largely done                                                                                        |
| #515  | CSRF protection                         | Already done                                                                                        |
| #498  | Role-based admin RBAC                   | Already done                                                                                        |
| #721  | Explicit authorization checks           | Already done (loop-21 §3)                                                                           |
| #632  | Sensitive data in error logging         | Already done (loop-21 §3)                                                                           |
| #788  | Unit tests for critical UI components   | Already done (loop-22 §3; 18 test files)                                                            |
| #787  | Unit tests for packages/db migrations   | Already done (loop-22 §3)                                                                           |
| #754  | Stripe webhook idempotency tests        | Already done (loop-22 §3)                                                                           |
| #713  | packages/common utility tests           | Substantially complete (loop-22 §3; 28 test files)                                                  |
| #550  | apps/nextjs in test coverage            | Already done                                                                                        |
| #549  | packages/auth tests                     | Already done                                                                                        |
| #551  | k8s router tests                        | Already done (loop-23 reinforces via #725: k8s.test.ts + k8s-router.test.ts)                        |
| #501  | Playwright E2E critical journeys        | Already done                                                                                        |
| #500  | Clerk auth flow tests                   | Already done                                                                                        |
| #486  | OpenTelemetry observability             | Likely done                                                                                         |
| #688  | Next.js middleware.ts                   | Already done                                                                                        |
| #635  | Developer onboarding guide              | Already done — `docs/ONBOARDING.md` referenced from README                                          |
| #496  | Distributed Redis rate limiter          | Already done — **54/54 rate-limiter tests green this run (§3)**                                     |

Closing any of these requires issue write → **403 → blocked (§5)**.

---

## §5 Blocked Write Paths (re-confirmed this run)

| Surface               | Operation                                     | Result                                                                                                   |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Issues (labels, REST) | `POST /repos/cpa03/basefly/issues/789/labels` | 403 `Resource not accessible by integration`                                                             |
| Issues (labels, GQL)  | `gh issue edit 789 --add-label P3`            | 403 `Resource not accessible by integration (addLabelsToLabelable)` — re-probed this run                 |
| Issues (comment)      | `gh issue comment …`                          | 403 (loop-21 probe stands)                                                                               |
| Issues (create)       | `gh issue create` (FAIL-SAFE tracker)         | 403 (loop-21 probe stands)                                                                               |
| Workflow-file push    | `git push` (`.github/workflows/*`)            | Platform-rejected: GitHub App lacks `workflows` permission (loops 19–22)                                 |
| Branch push (non-WF)  | `git push` (normal files)                     | **Allowed** — this docs PR is the proof                                                                  |
| `gh pr create`        | —                                             | Allowed (prior loops merged #1561–#1564, #1567, #1569, #1572)                                            |
| Subagent (explore)    | `task(subagent_type="explore")` × 6           | Failed: `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free` — fell back to first-hand |

Root cause (two independent platform rules, both carried from loops 19–22):

1. **Token scope**: `on-pull.yml`'s `permissions:` block (re-read this run: `contents: write`, `pull-requests: write`, `actions: read`, `repository-projects: write`, `id-token: write`) omits `issues: write`, so the hourly issue-manager token has no issue-side write scopes. Fix = the one-line patch in §3.
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` (a GitHub App token) cannot create/update any file under `.github/workflows/` unless the app holds the `workflows` permission for this repository. This blocks shipping fix (1) from inside the loop itself — a human maintainer must land it.

---

## §6 Gates (loop 23)

| Gate      | Command                                       | Result                                                                                                  |
| --------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`              | Done in 7.5s (cache warm); engine warning only (runner Node v20.20.2 vs engines ≥22)                    |
| Tests     | `pnpm test`                                   | **2207/2207 passed (151 files)**, 57.6s — matches loop-19/21/22 baseline exactly                        |
| Typecheck | `pnpm typecheck`                              | **9/9 successful** (cold turbo this run: 19.4s)                                                         |
| Lint      | `pnpm lint`                                   | **9/9 successful** (cold turbo this run: 61.7s)                                                         |
| Build     | `pnpm build` (env:validate + turbo build)     | **1/1 successful**, 69.4s                                                                               |
| #496      | targeted rate-limiter suites                  | **54/54 passed**                                                                                        |
| #725/#631 | targeted k8s/customer/stripe router suites    | **136/136 passed**                                                                                      |
| Patches   | `git apply --check` (both pre-staged patches) | Clean against `7d79b5d`                                                                                 |
| Ship      | docs-only PR (this audit)                     | No runtime code touched; last-known-green = this run: **2207/2207, typecheck 9/9, lint 9/9, build 1/1** |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§5), tracked as #748.

---

## §7 Final State

- **waiting for human review** — this PR.
- Unblocked only by a maintainer token/account with `workflows: write` (land §3 one-line `on-pull.yml` patch first — it unlocks issue writes for every future loop) and then `issues: write`-enabled loops can execute §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set (now including the 8 loop-23 promotions: #725, #631, #634, #687, #666, #705, #578, #613, #684).
- Loop-23 delta vs. loop 22: **#725/#631, #634, #687, #666, #705, #684 promoted to "already implemented"** and **#578, #613 to "stale"** with first-hand evidence (136/136 router tests, shared-tsconfig audit, barrel-export audit, error-boundary file check, Docker file check, turbo pipeline check); **#753, #663, #683, #729 promoted to "substantially done"**; **#726/#488 documented as partial** (scripts exist, workflow invocation missing); **#751, #650 confirmed not implemented**; **#636 documented as intentionally-not-done** (force-dynamic design decision); drift vs. loop 22 identified as 1 commit (loop-22 audit merge) with **zero gate regression** (2207/2207 re-run green at `7d79b5d`); label matrix re-derived 33/49 with exact-match no-drift confirmation.
- No destructive actions taken; no branches left on remote besides this docs branch; no force-pushes; issue-side writes remain untouched (403).
