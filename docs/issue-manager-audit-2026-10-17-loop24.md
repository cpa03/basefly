# Issue Manager Audit — 2026-10-17 (loop 24)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-17 16:41–17:05 UTC                                                                                                                                                |
| State machine         | Phase 0 → **ISSUE MANAGER MODE** (Phases 1–3 stopped per state machine)                                                                                                   |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `b1dc256` = PR #1573 merge, loop-23 audit)                                                                                               |
| Phase 0.1 open PRs    | **0** → no PR HANDLER MODE                                                                                                                                                |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical set to loops 7–23 — no drift)                                                                                                  |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 blocked at token 403 — re-probed; STEP 4 completed — all P0/P1 code-complete or platform-blocked; **6 new already-implemented promotions**) |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§5)                                        |
| Skills used           | `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `openx-basefly` (repo harness conventions)                                 |
| Subagents             | Not used — first-hand verification (established loops 17–23 pattern; prior explore-agent model remains unavailable)                                                       |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open --limit 1000` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
3. **Drift check**: `git log 965b2c4..origin/main` → **1 commit** (`b1dc256` = loop-23 audit merge #1573). Issue set unchanged (same 82 numbers) → **no drift**.
4. STEP 1: label matrix recomputed → **33 compliant / 49 remediation** — identical to loops 7–23 → no-drift; apply attempt (`gh api -X POST .../issues/789/labels`) → **403** (§1, §5).
5. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–23 (§2). Closures remain 403-blocked (§5).
6. STEP 4: **#496** (only P0) re-verified code-complete; targeted rate-limiter suites executed fresh: **98/98 passing** (§3, three files). Highest-priority P1s all either already implemented (loops 21–23 verifications) or platform-blocked.
7. **New verifications this run (loop 24)** — six previously-open issues are **already implemented** or **substantially done**, evidenced first-hand:
   - **#487** (Redis application-layer caching): `packages/common/src/cache/index.ts` implements `CacheService` (getOrSet/set/get/invalidate, TTL, metrics, Redis-with-fallback) and the module header explicitly references issue #487; `cache.test.ts` present.
   - **#483** (transaction handling for multi-table ops): `rlsTransaction(db, userId, trx => ...)` used across `packages/api/src/router/auth.ts`, `k8s.ts`, and `customer.ts` (create/update/delete paths).
   - **#486** (OpenTelemetry observability): `packages/common/src/observability/index.ts` exists; wired via `packages/api/src/trpc.ts` and `apps/nextjs/src/lib/health-check.ts` (promotes loop 23 "likely done" → **implemented**).
   - **#580** (monitoring/logging infrastructure): centralized `packages/api/src/logger.ts` re-exports shared `apiLogger` from `@saasfly/common` — structured pino logging across the API layer.
   - **#609** (consolidate duplicate Zod schemas): shared `packages/api/src/router/schemas.ts` with `schemas-enhanced.test.ts`; routers import shared schemas (hello/auth carry only minimal local `z.object`).
   - **#610** (standardize tRPC response format): `packages/api/src/response.ts` defines `MutationResult` / `SuccessWith<T>` / `FailureResult`; routers return `satisfies MutationResult` (`{ success: true }` pattern in k8s/customer/stripe).
8. FAIL-SAFE: administrative closure of the stale/verified set and label application both require issue write → **403** → no guess made; this audit remains the durable capture (established loop pattern).
9. Pre-staged patches re-validated against current main (`b1dc256`): `docs/patches/on-pull-issues-write-permission.patch` → **clean apply**; `docs/patches/fix-pnpm-consistency-iterate-744.patch` → **clean apply**.
10. Full green baseline re-established first-hand this run: **typecheck 9/9, lint 9/9, test 2207/2207 (151 files), build 1/1** — matches loop-19/21/22/23 baseline exactly → no regression.

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–23 → no-drift rule applies.

Remediation breakdown (carried verbatim from loop 23, re-confirmed against fresh `gh issue list`):

- 24 missing priority only: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- 12 missing category: `595, 635, 670, 697, 744, 748, 749, 751, 752, 753, 754, 755` (670 already carries `P3`; 635 carries legacy `documentation`, not the contract `docs`)
- 13 multi-category: `713, 688, 584, 581, 551, 550, 549, 523, 522, 515, 498, 496, 305` (305 also missing priority)

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=P2"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–24 no-flip-flop rule):**

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

Clusters unchanged from loops 17–23 (static issue set, no new issues this run):

| ID  | Members                 | Canonical | Disposition                                    |
| --- | ----------------------- | --------- | ---------------------------------------------- |
| D1  | 496, 480                | **496**   | Close 480 as duplicate of P0 (both Redis RL)   |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670 (P3, precise scope)      |
| D3  | 628, 501, 724           | **501**   | Close 628/724 as duplicates (Playwright E2E)   |
| D4  | 631, 725, 754           | **725**   | Close 631/754 as overlapping API test issues   |
| D5  | 720, 748                | **748**   | Both stale — `.nvmrc` now `22.14.0` (verified) |
| D6  | 785, 789                | —         | Not duplicates; both stale (§4)                |
| D7  | 551, 550, 549, 581      | **581**   | Testing-infra umbrella; children already done  |

**Closing requires issue write → 403 → blocked (§5).**

---

## §3 STEP 4 — Repair Mode

### Selection

- P0 exists: **#496** → selected first (contract: highest-priority).
- Re-verified code-complete + tests executed fresh (below) → repair would be administrative close → **403** → FAIL-SAFE.
- Highest-priority P1s are all either already implemented (loops 21–24 verifications) or platform-blocked (#728 workflow-file change, §5).
- **#755** remains rejected as a repair target (FAIL-SAFE carried from loops 21–22: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- **#726/#488** evaluated as repair candidates: scripts already exist (`check-deps`, `check:circular` via madge) and are wired into `ci:check`; the remaining gap is workflow invocation + the `iterate.yml` npm→pnpm fix — but `iterate.yml` is a workflow file → **platform-blocked** (§5).
- **#636** rejected: code documents ISR as intentionally unused (`force-dynamic` design decision) → closing as wontfix requires issue write → blocked.
- **#751** (tRPC bundle code splitting) and **#650** (extract prompts) remain genuinely open but are non-critical enhancements with no P0/P1 pressure; per contract (minimal, atomic, no speculative work) they are left for a future loop or human implementation.
- Net: **no safely-implementable issue remains**; this loop's deliverable is verification evidence + this audit (established loop 17–24 pattern).

### #496 — code-complete (evidence, fresh at `b1dc256`)

- `packages/api/src/trpc.ts` imports `getLimiter` from `./distributed-rate-limiter` and applies it in the `rateLimit()` middleware.
- `packages/api/src/distributed-rate-limiter.ts` — `DistributedRateLimiter` (Redis sliding window via ioredis ZSET), `InMemoryRateLimiter` (fallback), `SyncRateLimiter` (graceful degradation), `getLimiter` factory.
- Env configuration: `REDIS_URL` / `IS_REDIS_CONFIGURED` / `RATE_LIMIT_*` in `@saasfly/common` config; docs: `docs/redis-setup.md`.
- **Tests executed this run: `rate-limiter.test.ts` + `distributed-rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts` → 98/98 passing.**

### Loop-24 promotions (new evidence)

| Issue | Claim                                | Verdict (fresh loop-24 evidence)                                                                                                                 |
| ----- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| #487  | Application-layer caching with Redis | **Implemented** — `packages/common/src/cache/index.ts` CacheService (Redis + fallback, TTL, metrics); module links #487; `cache.test.ts` present |
| #483  | Transaction handling multi-table ops | **Implemented** — `rlsTransaction` used in `auth.ts`, `k8s.ts`, `customer.ts` router write paths                                                 |
| #486  | OpenTelemetry observability          | **Implemented** — `packages/common/src/observability/index.ts` + wiring in `trpc.ts` / `health-check.ts`                                         |
| #580  | Monitoring/logging infrastructure    | **Substantially implemented** — centralized `packages/api/src/logger.ts` → shared `apiLogger` (pino)                                             |
| #609  | Consolidate duplicate Zod schemas    | **Substantially consolidated** — shared `router/schemas.ts` + `schemas-enhanced.test.ts`; minimal local schemas                                  |
| #610  | Standardize tRPC response format     | **Implemented** — `response.ts` `MutationResult`/`SuccessWith`/`FailureResult`; `satisfies MutationResult` across routers                        |

---

## §4 Stale / Already-Implemented Issues (cumulative)

Loop-23 table carries forward in full (see `docs/issue-manager-audit-2026-10-17-loop23.md` §4); **loop-24 adds the six §3 promotions**. Spot re-confirmations this run at `b1dc256` (no regressions):

| Issue                         | Claim                                   | Verdict (loop-24)                                          |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| #496                          | Distributed Redis rate limiter          | Already done — **98/98 rate-limiter tests green this run** |
| #786                          | Stripe webhook logs partial secret      | Already fixed — redacted logging in webhook route          |
| #785                          | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                       |
| #720                          | `.nvmrc` missing                        | Stale — file exists (`22.14.0`)                            |
| #748                          | `.nvmrc` invalid value                  | Stale — value is `22.14.0`                                 |
| #719                          | Missing root TypeScript config          | Stale — root `tsconfig.json` exists                        |
| #578                          | Duplicate health check endpoint         | Stale — exactly one health route                           |
| #725/#631/#551                | API router tests                        | Already done (loop 23: 136/136 green)                      |
| #501/#628/#724                | Playwright E2E                          | Already done (config + 11 e2e specs)                       |
| #549/#550/#500                | Auth tests / coverage / Clerk e2e       | Already done                                               |
| #487/#483/#486/#580/#609/#610 | (loop-24 set)                           | **NEW: implemented / substantially done (§3)**             |

Closing any of these requires issue write → **403 → blocked (§5)**.

---

## §5 Blocked Write Paths (re-confirmed this run)

| Surface               | Operation                            | Result                                                   |
| --------------------- | ------------------------------------ | -------------------------------------------------------- |
| Issues (labels, REST) | `POST .../issues/789/labels`         | 403 `Resource not accessible by integration` (re-probed) |
| Issues (comment)      | `gh issue comment …` / REST comments | 403 (re-probed this run)                                 |
| Issues (close)        | `gh issue close 496`                 | 403 `closeIssue` (re-probed this run)                    |
| Issues (create)       | `gh issue create`                    | 403 (re-probed this run)                                 |
| Workflow-file push    | `git push` (`.github/workflows/*`)   | Platform-rejected: GitHub App lacks `workflows` perm     |
| Branch push (non-WF)  | `git push` (normal files)            | **Allowed** — this docs PR is the proof                  |
| `gh pr create`        | —                                    | Allowed (prior loops merged through #1573)               |

Root cause (unchanged, carried from loops 19–23):

1. **Token scope**: the workflow `permissions:` block that supplies this run's token omits `issues: write` for the issue-manager surface → no issue-side write scopes. Fix = one-line patch (§3 suggested action).
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` cannot create/update any file under `.github/workflows/` without the app's `workflows` permission — blocks shipping fix (1) from inside the loop.

**Suggested maintainer action (unchanged, still highest-leverage):** land `docs/patches/on-pull-issues-write-permission.patch` with a human account / `workflows: write` token — one line — then every future loop can execute the §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set. Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2).

---

## §6 Gates (loop 24)

| Gate      | Command                                   | Result                                              |
| --------- | ----------------------------------------- | --------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`          | Done in 7.4s (cache warm); engine warning only      |
| Tests     | `pnpm test`                               | **2207/2207 passed (151 files)**, 41.9s             |
| Typecheck | `pnpm typecheck`                          | **9/9 successful**, 27.6s                           |
| Lint      | `pnpm lint`                               | **9/9 successful**, 53.3s                           |
| Build     | `pnpm build` (env:validate + turbo build) | **1/1 successful**, 33.0s                           |
| #496      | targeted rate-limiter suites (3 files)    | **98/98 passed**                                    |
| Patches   | `git apply --check` (both pre-staged)     | Clean against `b1dc256`                             |
| Ship      | docs-only PR (this audit)                 | No runtime code touched; last-known-green re-proven |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§5).

---

## §7 Final State

- **waiting for human review** — this PR.
- Unblocked only by a maintainer token/account with `workflows: write` (land the §5 one-line `on-pull.yml` patch first), after which `issues: write`-enabled loops can execute §1 labels, §2/§3 closes, and administrative closure of the §4 stale set.
- Loop-24 delta vs. loop 23: **#487, #483, #486, #580, #609, #610 promoted to implemented/substantially-done** with first-hand evidence (CacheService module, rlsTransaction call sites, observability module, apiLogger wiring, shared schemas.ts, response.ts MutationResult); drift vs. loop 23 identified as 1 commit (loop-23 audit merge) with **zero gate regression** (2207/2207, typecheck 9/9, lint 9/9, build 1/1 re-run green at `b1dc256`); label matrix re-derived 33/49 with exact-match no-drift confirmation; both pre-staged patches re-verified clean-apply.
- No destructive actions taken; no branches left on remote besides this docs branch; no force-pushes; issue-side writes remain untouched (403).
