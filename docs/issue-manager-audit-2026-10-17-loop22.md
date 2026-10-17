# Issue Manager Audit — 2026-10-17 (loop 22)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-17 00:45–01:05 UTC                                                                                                                            |
| State machine         | Phase 0 → **ISSUE MANAGER MODE** (Phases 1–3 stopped per state machine)                                                                               |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `51bb2e3` = PR #1570 merge)                                                                                          |
| Phase 0.1 open PRs    | **0** → no PR HANDLER MODE                                                                                                                            |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical set to loops 7–21 — no drift)                                                                              |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 blocked at token 403; STEP 4 completed — all P0/P1 proven done or platform-blocked; 3 new already-implemented findings) |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§5)                    |
| Skills used           | `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `openx-basefly` (repo harness conventions)             |
| Subagents             | 0 spawned — all verification first-hand this run (targeted greps + reads + test runs; work was single-threaded verification, not research)            |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open` → `[]` → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open --limit 1000` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
3. **Drift check (new this run)**: `git log e828d01..origin/main` → **3 commits** (`8efe434` loop-21 audit docs, `9b03ceb` its merge #1569, `51bb2e3` PR #1570 DataTable tokens + micro-UX accessibility). Issue set itself unchanged (same 82 numbers).
4. STEP 1: label-matrix recomputed first-hand → **33 compliant / 49 remediation** — identical to loops 7–21 → **no drift**; apply attempt (`gh api -X POST .../issues/789/labels`) → **403** (§1, §5).
5. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–21 (§2).
6. STEP 4: **#496** (only P0) re-verified code-complete at `51bb2e3` and its rate-limiter test suites executed fresh: **54/54 passing** (§3).
7. **New verifications this run (loop 22)** — three previously-open testing issues are **already implemented**, evidenced by existing test files and green runs:
   - **#788** (unit tests for critical UI components in apps/nextjs): `apps/nextjs/src/components/__tests__/` now holds **18 test files** including `navbar.test.tsx`, `modal.test.tsx`, `cluster-list.test.tsx` (all three named acceptance criteria); `StatusBadge` is exercised inside `cluster-list.test.tsx` / `cluster-item.test.tsx`. Definition of Done ("minimum 4 new UI component test files") is exceeded 4.5×.
   - **#787** (unit tests for packages/db migrations and schema): `packages/db/migrations.test.ts` plus 6 sibling suites (`logger`, `user-deletion`, `seed`, `soft-delete`, `rls-middleware`, `db-instance`).
   - **#754** (integration tests for Stripe webhook idempotency): `packages/stripe/src/webhook-idempotency.test.ts` exists and is green.
   - Cross-cutting: **#713** (packages/common utility tests) — 28 test files now exist under `packages/common/src/`.
8. Combined targeted execution of the six most issue-relevant suites (db migrations, data-table, navbar, modal, cluster-list, stripe webhook idempotency): **86/86 passing**.
9. FAIL-SAFE: administrative closure of the stale/verified set and label application both require issue write → **403** → no guess made; this audit + the pre-staged patches remain the durable capture.
10. Pre-staged patches re-validated against current main (`51bb2e3`): `docs/patches/on-pull-issues-write-permission.patch` → **clean apply**; `docs/patches/fix-pnpm-consistency-iterate-744.patch` → **clean apply**.
11. Full green baseline re-established first-hand this run (fresh `pnpm install --frozen-lockfile`, then cold turbo): **typecheck 9/9, lint 9/9, test 2207/2207 (151 files), build 1/1** — matches loop-19/21 baseline exactly despite the #1570 UI drift → no regression.

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–21 → no-drift rule applies.

Remediation breakdown (recomputed first-hand from `gh issue list`):

- 24 missing priority only: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- 12 missing category: `595, 635, 670, 697, 744, 748, 749, 751, 752, 753, 754, 755` (670 already carries `P3`; 635 carries legacy `documentation`, not the contract `docs`)
- 13 multi-category: `713, 688, 584, 581, 551, 550, 549, 523, 522, 515, 498, 496, 305` (305 also missing priority)

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=P2"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–22 no-flip-flop rule):**

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

Clusters unchanged from loops 17–21 (static issue set, no new issues this run):

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
- Highest-priority P1s are all either already implemented (loop-21: #721, #632; this run's stale-set promotions in §4) or platform-blocked (#728 workflow-file change, §5).
- **#755** remains rejected as a repair target (FAIL-SAFE carried from loop 21: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- Net: **no safely-implementable issue remains**; this loop's deliverable is verification evidence + this audit (established loop 17–22 pattern).

### #496 — code-complete (evidence, fresh at `51bb2e3`)

- `packages/api/src/trpc.ts` imports `getLimiter` from `./distributed-rate-limiter` and applies it in the `rateLimit()` middleware; `createRateLimitedProcedure` is exported and wired.
- `packages/api/src/distributed-rate-limiter.ts` — `DistributedRateLimiter` (Redis sliding window), `InMemoryRateLimiter` (fallback), `SyncRateLimiter` (graceful degradation wrapper), `getLimiter` factory.
- Env configuration present: `.env.example` (`REDIS_URL`, `RATE_LIMIT_*` per endpoint type); docs: `docs/redis-setup.md`.
- **Tests executed this run: `rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts` → 54/54 passing.**

### #788 — ALREADY IMPLEMENTED (new verification, loop 22)

| Criterion                      | Evidence                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Navbar component test          | `apps/nextjs/src/components/__tests__/navbar.test.tsx`                                                                 |
| Modal component test           | `apps/nextjs/src/components/__tests__/modal.test.tsx`                                                                  |
| ClusterList component test     | `apps/nextjs/src/components/__tests__/cluster-list.test.tsx`                                                           |
| StatusBadge coverage           | Exercised inside `cluster-list.test.tsx` and `cluster-item.test.tsx`                                                   |
| DoD ≥4 UI test files           | **18 files** in `apps/nextjs/src/components/__tests__/` (far exceeds DoD)                                              |
| Rendering/interaction verified | Combined run of navbar/modal/cluster-list (+ db migrations, data-table, stripe idempotency) → **86/86 green this run** |

### #787 — ALREADY IMPLEMENTED (new verification, loop 22)

- `packages/db/migrations.test.ts` plus 6 sibling suites (`logger.test.ts`, `user-deletion.test.ts`, `seed.test.ts`, `soft-delete.test.ts`, `rls-middleware.test.ts`, `db-instance.test.ts`).
- `migrations.test.ts` executed green inside the 86/86 combined run this loop.

### #754 — ALREADY IMPLEMENTED (new verification, loop 22)

- `packages/stripe/src/webhook-idempotency.test.ts` exists; executed green inside the 86/86 combined run this loop.

### #713 — substantially complete (new evidence, loop 22)

- `packages/common/src/` now holds **28 test files** covering config modules, cache, observability, email, icon-sizes, ui-tokens, animation — the issue's "utility modules" scope is covered. Administrative close remains 403-blocked.

### on-pull.yml `issues: write` — repair still platform-blocked (carried from loop 20)

1. Pre-staged patch: `docs/patches/on-pull-issues-write-permission.patch` — **re-`git apply --check` clean against `51bb2e3` this run** (1 insertion at the `permissions:` block of `on-pull.yml`).
2. Companion patch: `docs/patches/fix-pnpm-consistency-iterate-744.patch` — **also clean against `51bb2e3`**.
3. Both remain unshippable from inside the loop: GitHub App cannot create/update any file under `.github/workflows/` without the `workflows` permission (loops 19–21 push rejections).

**Suggested maintainer action (single highest-leverage fix):** have a human account (or a PAT/GitHub App token with `workflows: write`) land `docs/patches/on-pull-issues-write-permission.patch` — one line in `on-pull.yml`. That alone unblocks STEP 1/2/3 for every subsequent loop (labels, comments, closes, creates). Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2), then administratively close the stale/duplicate sets in §2/§4.

---

## §4 Stale / Already-Implemented Issues

Loop-21 table carries forward; **fresh additions and spot-checks this run** (all at `51bb2e3`):

| Issue | Claim                                   | Verdict (fresh loop-22 evidence)                                                           |
| ----- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| #788  | Unit tests for critical UI components   | **Already implemented (NEW loop-22 verification — §3; 18 test files, 86/86 green)**        |
| #787  | Unit tests for packages/db migrations   | **Already implemented (NEW loop-22 verification — §3; migrations.test.ts green)**          |
| #754  | Stripe webhook idempotency tests        | **Already implemented (NEW loop-22 verification — §3; webhook-idempotency.test.ts green)** |
| #713  | packages/common utility tests           | **Substantially complete (NEW loop-22 evidence — §3; 28 test files)**                      |
| #789  | React peerDeps in packages/ui           | Already done — `peerDependencies` present (loop-21 evidence stands)                        |
| #785  | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                                                       |
| #786  | Stripe webhook logs partial secret      | Already fixed — no secret logging in webhook route                                         |
| #748  | `.nvmrc` invalid value `20`             | Stale (now `22.14.0`)                                                                      |
| #720  | `.nvmrc` missing                        | Stale (file exists, `22.14.0`)                                                             |
| #719  | Missing root TypeScript config          | Stale — root `tsconfig.json` exists                                                        |
| #722  | Env validation at startup               | Already done (`pnpm env:validate` gates `pnpm build`)                                      |
| #697  | Corrupted docs formatting               | Already fixed                                                                              |
| #630  | Pre-commit: add typecheck+test          | Already done — `.husky/pre-commit` runs typecheck+test+check-deps+lint-staged              |
| #611  | Add `not-found.tsx`                     | Already done — `apps/nextjs/src/app/not-found.tsx` exists                                  |
| #664  | Replace console.\* with pino            | Already done — only commented-out doc examples remain                                      |
| #492  | `sizes` attr for responsive images      | Largely done                                                                               |
| #515  | CSRF protection                         | Already done                                                                               |
| #498  | Role-based admin RBAC                   | Already done                                                                               |
| #721  | Explicit authorization checks           | Already done (loop-21 §3)                                                                  |
| #632  | Sensitive data in error logging         | Already done (loop-21 §3)                                                                  |
| #550  | apps/nextjs in test coverage            | Already done                                                                               |
| #549  | packages/auth tests                     | Already done                                                                               |
| #551  | k8s router tests                        | Already done                                                                               |
| #501  | Playwright E2E critical journeys        | Already done                                                                               |
| #500  | Clerk auth flow tests                   | Already done                                                                               |
| #486  | OpenTelemetry observability             | Likely done                                                                                |
| #688  | Next.js middleware.ts                   | Already done                                                                               |
| #635  | Developer onboarding guide              | Already done — `docs/ONBOARDING.md` referenced from README                                 |
| #496  | Distributed Redis rate limiter          | Already done — **54/54 rate-limiter tests green this run (§3)**                            |

Closing any of these requires issue write → **403 → blocked (§5)**.

---

## §5 Blocked Write Paths (re-confirmed this run)

| Surface               | Operation                                     | Result                                                                   |
| --------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| Issues (labels, REST) | `POST /repos/cpa03/basefly/issues/789/labels` | 403 `Resource not accessible by integration`                             |
| Issues (labels, GQL)  | `gh issue edit … --add-label`                 | 403 (loop-21 probe stands; REST re-probe this run confirms same token)   |
| Issues (comment)      | `gh issue comment …`                          | 403 (loop-21 probe stands)                                               |
| Issues (create)       | `gh issue create` (FAIL-SAFE tracker)         | 403 (loop-21 probe stands)                                               |
| Workflow-file push    | `git push` (`.github/workflows/*`)            | Platform-rejected: GitHub App lacks `workflows` permission (loops 19–21) |
| Branch push (non-WF)  | `git push` (normal files)                     | **Allowed** — this docs PR is the proof                                  |
| `gh pr create`        | —                                             | Allowed (prior loops merged #1561–#1564, #1567, #1569)                   |

Root cause (two independent platform rules, both carried from loops 19–21):

1. **Token scope**: `on-pull.yml`'s `permissions:` block omits `issues: write`, so the hourly issue-manager token has no issue-side write scopes. Fix = the one-line patch in §3.
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` (a GitHub App token) cannot create/update any file under `.github/workflows/` unless the app holds the `workflows` permission for this repository. This blocks shipping fix (1) from inside the loop itself — a human maintainer must land it.

---

## §6 Gates (loop 22)

| Gate      | Command                                       | Result                                                                                                  |
| --------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`              | Done in 7.8s (cache warm); engine warning only (runner Node v20.20.2 vs engines ≥22)                    |
| Tests     | `pnpm test`                                   | **2207/2207 passed (151 files)** — matches loop-19/21 baseline exactly                                  |
| Typecheck | `pnpm typecheck`                              | **9/9 successful** (cold turbo this run: 33.7s)                                                         |
| Lint      | `pnpm lint`                                   | **9/9 successful** (cold turbo this run: 63.8s)                                                         |
| Build     | `pnpm build` (env:validate + turbo build)     | **1/1 successful**, 36.9s                                                                               |
| #496      | targeted rate-limiter suites                  | **54/54 passed**                                                                                        |
| #788 etc. | targeted db/ui/nextjs/stripe suites           | **86/86 passed**                                                                                        |
| Patches   | `git apply --check` (both pre-staged patches) | Clean against `51bb2e3`                                                                                 |
| Ship      | docs-only PR (this audit)                     | No runtime code touched; last-known-green = this run: **2207/2207, typecheck 9/9, lint 9/9, build 1/1** |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§5), tracked as #748.

---

## §7 Final State

- **waiting for human review** — this PR.
- Unblocked only by a maintainer token/account with `workflows: write` (land §3 one-line `on-pull.yml` patch first — it unlocks issue writes for every future loop) and then `issues: write`-enabled loops can execute §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set.
- Loop-22 delta vs. loop 21: **#788, #787, #754 promoted to "already implemented"** and **#713 to "substantially complete"** with first-hand evidence (existing test files + green runs: 86/86 combined, 54/54 for #496); drift vs. loop 21 identified as 3 commits (loop-21 audit merge + PR #1570) with **zero gate regression** (2207/2207 re-run green at `51bb2e3`); label matrix re-derived 33/49 with exact-match no-drift confirmation.
- No destructive actions taken; no branches left on remote besides this docs branch; no force-pushes; issue-side writes remain untouched (403).
