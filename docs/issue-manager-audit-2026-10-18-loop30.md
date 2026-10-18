# Issue Manager Audit — 2026-10-18 (loop 30)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-18 21:59–22:14 UTC                                                                                                                                                                               |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                    |
| DEFAULT_BRANCH        | `main` (auto-detected; `1feecb8` = PR #1581 merge, loop-29 audit; synced at run start — `git merge --ff-only origin/main` → "Already up to date")                                                        |
| Phase 0.1 open PRs    | **0** → not PR HANDLER MODE (loop-29's audit PR #1581 was merged after loop 29 ended in "waiting for human review" — that loop's final state is now resolved)                                            |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical number set to loops 7–29 — no drift)                                                                                                                          |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 re-derived; all issue-side writes re-probed 403 first-hand; STEP 4 completed — **#496 re-verified 98/98**, full P0/P1 set re-verified, **#708/#751 measurement refined**)  |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§4)                                                                       |
| Skills used           | `openx-basefly` (repo harness conventions, docs-audit PR pattern); `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `commit-message` (conventional commit) |
| Subagents             | Not required this run — bounded, first-hand verification scope (established loops 17–29 pattern); all evidence collected directly                                                                        |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **0 open PRs** → fall through to Phase 0.2. Loop-29's audit PR #1581 merged into `1feecb8` after loop 29 ended waiting-for-review.
2. **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
3. Drift check: issue number set `[305, 480, 483, …, 789]` (82 numbers) identical to loops 7–29 → **no drift**; local `main` already at `origin/main` = `1feecb8` (only delta vs loop 29's `e1d1af3` is the loop-29 audit merge itself).
4. STEP 1: label matrix recomputed independently → **33 compliant / 49 remediation** — exact match with loops 7–29 (all five remediation partitions match item-for-item) → no-drift rule applies; apply attempt re-probed → **403** (§1, §4).
5. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–29 (§2). D1 close actively re-attempted (`PATCH /issues/480 state=closed`) → **403**; #480 re-verified **still OPEN** (probe had no side effect).
6. STEP 4: **#496** (only P0) re-verified code-complete **first-hand this run**: 3 rate-limiter test files → **98/98 passed** (1.13s) at `1feecb8`. Full P0/P1 set re-verified first-hand (§3).
7. **Loop-30 delta — #708 measurement gap refined**: loop 29's suggested action #3 ("configure a bundle analyzer (#708)") is **stale as stated**. First-hand evidence: `@next/bundle-analyzer@16.2.7` is a dependency of `apps/nextjs` (package.json:68), wired in `apps/nextjs/next.config.mjs:254-258` (`enabled: process.env.ANALYZE === "true"`), and size-limit regression checking is fully configured (`apps/nextjs/package.json` `size:check`/`size:analyze` scripts + `size-limit` config with 3 budgets; turbo pipeline entries at `turbo.json:42-46`; landed by `01c2be0` 2026-07-04, repaired for Turbopack by `8694261` 2026-08-17). This run executed `pnpm size:check` → **green**: Client JS **612.99 kB / 800 kB** gzip, Client CSS **20.13 kB / 120 kB**, Static Media **260.03 kB / 300 kB**. **But**: a forced `ANALYZE=true next build` (via `dotenv-cli` with `.env.ci`) produced **no `.next/analyze` report** — `next.config.mjs:156` sets `turbopack: {}`, so Next 16 builds with Turbopack and the webpack-based `@next/bundle-analyzer` wrapper is inert. Refined verdict: **#708 partially implemented** (regression budgets working; chunk-level HTML analysis still missing under Turbopack) — replacing loop 29's "not configured" characterization.
8. **Loop-30 delta — #751 measurement evidence produced**: size-limit numbers above are the first concrete bundle-size measurements recorded in these audits. They satisfy the "bundle analyzer shows reduced initial load" criterion only partially (current absolute sizes vs budgets, no historical baseline); the `≥10% reduction vs pre-lazy-splitting` DoD item still needs a baseline build and Lighthouse remains environmental → **#751 stays partially implemented / measurement-blocked**, but is no longer blocked on analyzer configuration itself.
9. Loop-30 delta — **CI anomaly recorded**: the loop-29 audit branch run (`docs/issue-audit-2026-10-18-loop29`, run `39138816789`) concluded `failure` with **zero jobs** recorded (`conclusion: failure, jobs: []`); the run was nonetheless merged as PR #1581. Runs on `main` in the same window: `success` (14:55), `success` (17:37), `cancelled` (19:43), `in_progress` (21:56, this loop's trigger). Recorded for maintainer attention; not re-runnable (`actions: read` only).
10. Stale-set re-confirmations this run (§3): #697 (zero U+FFFD outside audit docs), #578 (exactly one health route), #785 (no `next` dep in packages/stripe), #720/#748 (`.nvmrc` = `22.14.0`), #719 (root tsconfig.json), #635 (docs/ONBOARDING.md), #501/#628 (11 e2e specs), #664 (0 runtime `console.*` in db/stripe), #731 (`/api/docs` route serving trpc-openapi spec).
11. Permission probes **first-hand this run**: issue label POST → **403**; issue close REST (`PATCH /issues/480`) → **403**; issue comment GraphQL (`addComment` on #496) → **403**; issue read → OK; #480 confirmed OPEN after probe.
12. Root-cause permission block re-verified first-hand: `on-pull.yml:9-14` permissions block lists `contents`, `pull-requests`, `actions: read`, `repository-projects`, `id-token` — **no `issues: write`** (the workflow that runs this loop); `iterate.yml:13` declares `issues: write` but does not run the loop.
13. Pre-staged patches re-validated against `1feecb8`: `docs/patches/on-pull-issues-write-permission.patch` and `docs/patches/fix-pnpm-consistency-iterate-744.patch` both **clean apply**.
14. FAIL-SAFE: STEP 4 administrative closure of #496 and STEP 2/3 closes/consolidations all require issue write → **403** → no guess made; #751/#708 refined classifications recorded here rather than force-closed; this audit remains the durable capture (established loop pattern).
15. Full green baseline re-established first-hand: **typecheck 9/9 (12.5s), lint 9/9 (45.3s, zero warnings), test 2207/2207 (151 files, 43.5s), build 1/1 (33.5s, env:validate passed)** → no regression vs loop-29 baseline.

### Action log

| Timestamp (UTC) | Action                                    | Target                                    | Result                                                                  |
| --------------- | ----------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| 21:59           | Phase 0.1 entry: `gh pr list`             | repo `cpa03/basefly`                      | **0 open PRs** → fall through                                           |
| 21:59           | Phase 0.2 entry: `gh issue list`          | repo                                      | **82 open issues → ISSUE MANAGER MODE**                                 |
| 21:59           | Sync local `main` with `origin/main`      | `main`                                    | Already up to date at `1feecb8` (loop-29 merge)                         |
| 21:59           | Permission probe (issue label)            | issue 789                                 | **403** `Resource not accessible by integration`                        |
| 21:59           | Permission probe (issue close, REST)      | issue #480 (`state=closed`)               | **403**; #480 re-verified **OPEN** (no side effect)                     |
| 21:59           | Permission probe (issue comment, GraphQL) | issue #496                                | **403** GraphQL `addComment`                                            |
| 22:00           | Label matrix recomputation                | all 82 issues                             | **33 compliant / 49 remediation** — exact match (no drift)              |
| 22:01           | D1 duplicate close probe re-check         | issue #480                                | still OPEN; cluster set D1–D7 unchanged                                 |
| 22:01           | `pnpm install --frozen-lockfile`          | workspace                                 | Done in 7.5s                                                            |
| 22:02           | Gate: typecheck                           | workspace                                 | **9/9 successful**, 12.5s                                               |
| 22:03           | Gate: lint                                | workspace                                 | **9/9 successful**, 45.3s (**zero warnings**)                           |
| 22:05           | Gate: test                                | workspace                                 | **2207/2207 passed (151 files)**, 43.5s                                 |
| 22:06           | Gate: build                               | workspace                                 | **1/1 successful**, 33.5s; `env:validate` PASSED                        |
| 22:07           | STEP 4 verification: rate-limiter tests   | `packages/api/src/*rate-limiter*.test.ts` | **98/98 passed** (1.13s) → #496 code-complete                           |
| 22:08           | P0/P1 claim spot-verification             | #551/#515/#498/#501/#500/#549/#550/#581   | all implemented (evidence §3)                                           |
| 22:08           | #751 re-check                             | `packages/api/src/edge.ts`                | `lazy()` splitting present (loop-29 finding stands)                     |
| 22:09           | Stale-set re-confirmation                 | #697/#578/#785/#720/#719/#635/#501        | all stale (evidence §3)                                                 |
| 22:09           | Genuinely-open re-confirmation            | #494/#723/#650/#502/D2                    | all still open; workflow files platform-blocked                         |
| 22:10           | `pnpm size:check`                         | apps/nextjs (size-limit budgets)          | **green**: 612.99/800 kB JS, 20.13/120 kB CSS, 260.03/300 kB media      |
| 22:11           | Forced `ANALYZE=true next build`          | apps/nextjs (dotenv-cli + .env.ci)        | build OK but **no `.next/analyze` report** → analyzer inert (Turbopack) |
| 22:11           | Permission block re-verify                | `on-pull.yml:9-14`                        | no `issues: write` declared → root cause confirmed                      |
| 22:12           | Patch re-validation                       | 2 pre-staged patches                      | clean apply vs `1feecb8`                                                |
| 22:12           | CI run inspection                         | `gh run list` + run `39138816789`         | loop-29 branch run `failure` with `jobs: []` (anomaly, see §0.9)        |
| 22:13           | Create audit branch                       | `docs/issue-audit-2026-10-18-loop30`      | created from `main` (`1feecb8`)                                         |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–29 → no-drift rule applies.

Remediation partition (fresh this run, re-derived independently; equivalent to the carried partition):

- 24 missing priority only: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- 1 missing category only: `670` (already carries `P3` + non-contract `DX-engineer`)
- 11 missing both: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- 10 multi-category: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- 3 multi-category + missing priority: `305, 584, 713`

Union check: missing-priority set = 24 ∪ {305, 584, 713} = **27** ✓; missing-category set = {670} ∪ 11 = **12** ✓; multi-category set = 10 ∪ {305, 584, 713} = **13** ✓ — identical to loop-29 §1.

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=enhancement"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–30 no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–29.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters (re-derived)

Clusters unchanged from loops 17–29 (static issue set, no new issues this run):

| ID  | Members                 | Canonical | Disposition                                           |
| --- | ----------------------- | --------- | ----------------------------------------------------- |
| D1  | 496, 480                | **496**   | Close 480 as duplicate of P0 (both Redis RL)          |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670 (P3, precise scope)             |
| D3  | 628, 501, 724           | **501**   | Close 628/724 as duplicates (Playwright E2E)          |
| D4  | 631, 725, 754           | **725**   | Close 631/754 as overlapping API test issues          |
| D5  | 720, 748                | **748**   | Both stale — `.nvmrc` now `22.14.0` (re-verified)     |
| D6  | 785, 789                | —         | Not duplicates; **789 promoted (loop 26)**; 785 stale |
| D7  | 551, 550, 549, 581      | **581**   | Testing-infra umbrella; children already done         |

Consolidation of D2/D3/D4/D7 small issues into their canonicals also requires issue writes.

**Closing/consolidating requires issue write → 403 → blocked (§4). D1 close was actively re-attempted this run** (`PATCH /issues/480 state=closed` — first-hand body comparison of #480 vs #496 unchanged: identical in-memory→Redis rate-limiter problem statement, #496 = P0 canonical) → **403** `Resource not accessible by integration`; #480 confirmed still OPEN after the probe.

---

## §3 STEP 4 — Repair Mode

### Selection

- P0 exists: **#496** → selected first (contract: highest-priority).
- Re-verified code-complete **first-hand this run**: `npx vitest run packages/api/src/rate-limiter.test.ts packages/api/src/distributed-rate-limiter.test.ts packages/api/src/distributed-rate-limiter-sync.test.ts` → **3 files, 98/98 tests passed** (1.13s) at `1feecb8`. Implementation present: `distributed-rate-limiter.ts` (Redis `DistributedRateLimiter` + `SyncRateLimiter` in-memory fallback, sliding-window), `rate-limiter.ts`. Acceptance-criteria cross-check: `.env.example` `REDIS_URL` + `RATE_LIMIT_*` (env-var config ✓), `docs/redis-setup.md` (documentation ✓), fallback with warning (✓ in `SyncRateLimiter` design at `distributed-rate-limiter.ts:274-277`), tests ✓. Repair would be administrative close → probe `gh issue comment 496` → **403** GraphQL `addComment` → FAIL-SAFE.
- **Full P0/P1 set re-verified first-hand this run** (no P1 left unverified):

| Issue | Claim                               | First-hand evidence at `1feecb8`                                                             |
| ----- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 rate-limiter tests green (this run)** + env/docs acceptance evidence above           |
| #581  | Testing-infra umbrella (P1)         | Children #551/#550/#549/#501/#500 all verified implemented (rows below) → umbrella satisfied |
| #551  | k8s router tests (P1)               | `packages/api/src/router/k8s-router.test.ts` exists; in green 2207 suite                     |
| #550  | apps/nextjs in coverage (P1)        | `vitest.config` includes `apps/nextjs/src/**/*.{ts,tsx}` (line 16) + setup file (line 12)    |
| #549  | packages/auth tests (P1)            | 3 test files: `logger.test.ts`, `env.test.ts`, `clerk.test.ts` (0%-claim stale)              |
| #515  | CSRF protection (P1)                | `apps/nextjs/src/lib/csrf.ts` (+ `csrf.test.ts`)                                             |
| #501  | Playwright E2E (P1)                 | 11 specs in `tests/e2e/`                                                                     |
| #500  | Clerk auth flow tests (P1)          | `apps/nextjs/src/utils/clerk.test.ts` + `packages/auth/clerk.test.ts`                        |
| #498  | Role-based admin RBAC (P1)          | `apps/nextjs/src/lib/admin-access.ts`, `packages/api/src/rbac.test.ts`                       |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification                                    |

- **#708 — classification refined this run (loop-30 delta)**: loop 29 carried "#708 still open (no bundle analyzer configured)" and listed "configure a bundle analyzer" as suggested action #3. First-hand evidence now: `apps/nextjs/package.json:68` → `@next/bundle-analyzer: 16.2.7`; `next.config.mjs:6` + `:254-258` → `withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })`; `size:check`/`size:analyze` scripts + `size-limit` budgets (3 entries); `turbo.json:42-46` pipeline entries; introduced `01c2be0` (2026-07-04) and repaired for Next 16 Turbopack by `8694261` (2026-08-17). This run: `pnpm size:check` **green** (612.99 kB JS / 20.13 kB CSS / 260.03 kB media, all under budgets); forced `ANALYZE=true npx dotenv-cli … next build` **succeeds but writes no `.next/analyze`** — `next.config.mjs:156` has `turbopack: {}`, and Turbopack does not execute the webpack-config hook that `@next/bundle-analyzer` relies on. Verdict: **partially implemented** — budget-based regression checking works; chunk-level HTML analysis requires a Turbopack-compatible path (or a `--webpack` build). Blueprint TODO `docs/blueprint.md:1101` (`- [ ] Run bundle analyzer to identify large chunks`) remains unticked. Recorded rather than closed (FAIL-SAFE: closing requires issue write → 403 anyway).
- **#751 — measurement evidence advanced this run (loop-30 delta)**: loop-29 verdict (core `lazy()` splitting implemented since `64b82a9`, measurement-blocked on #708) stands, but #708 is now shown to be (partially) available: size-limit budgets give absolute measurements (§0.7–8) instead of no data at all. Remaining: historical baseline for `≥10% reduction` DoD and Lighthouse (environmental) → stays **partially implemented / measurement-blocked**; no longer blocked on analyzer configuration.
- **#755** remains rejected as a repair target (FAIL-SAFE carried from loops 21–29: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- **#636** rejected: `apps/nextjs/src/app/[lang]/(dashboard)/dashboard/page.tsx:34-36` documents "ISR intentionally not used — `force-dynamic` … caching user-scoped data would leak it across users" → intentional design decision; closing as wontfix requires issue write → 403 → blocked.
- **#697** rejected (stale): this run found **zero** U+FFFD matches in non-audit docs; loops 24/192/223/229/loop3 recorded the fix commits (`e290045`/`b3b9000`/`c4d98b4`). Administrative close → 403 → blocked.
- **#728** (security scanning workflows) per payload = P1 → requires new files under `.github/workflows/` → **platform-blocked** (§4, `workflows` permission).
- Genuinely open but non-critical (no P0/P1 pressure; left per contract minimal/atomic rule): **#494** (no `domain/` directory — re-verified this run), **#723** (36/127 `.tsx` under `apps/nextjs/src` carry `"use client"` = 28% — matches loops 28–29 exactly), **#502** (only `iterate.yml` + `on-pull.yml` exist → workflow-file, blocked), **#650** (1 inline `ulw-loop` prompt still in `on-pull.yml:76` → workflow-file, blocked), **D2** (`iterate.yml` `npm ci || true` at lines 72, 342 → workflow-file, blocked), **#751** remainder (measurement-baseline-blocked, see above), plus feature-grade items (#749, #668, #636-pending-close, etc.).
- Iterate.yml npm→pnpm cluster (D2) → **platform-blocked** (§4); pre-staged patch `docs/patches/fix-pnpm-consistency-iterate-744.patch` re-verified **clean apply** at `1feecb8`.
- Net: **no safely-implementable issue remains** (all P0/P1 implemented or platform-blocked; remaining candidates are workflow-file-blocked, measurement-baseline-blocked, or intentionally-designed); this loop's deliverable is verification evidence + the **#708/#751 refinement** + the CI anomaly note + this audit (established loop 17–29 pattern).

### Stale-set spot re-confirmations (this run at `1feecb8`)

| Issue          | Claim                                   | Verdict (loop-30, first-hand)                                                   |
| -------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter          | **Re-verified: 98/98 tests green (this run)**                                   |
| #751           | tRPC router code splitting missing      | Partially implemented (loop-29 verdict stands; size evidence added)             |
| #708           | No bundle analyzer configured           | **REFINED: configured + budgets green; HTML report inert (Turbopack)**          |
| #697           | Corrupted text in docs                  | Stale — zero corruption markers outside audit docs                              |
| #578           | Duplicate health check endpoint         | Stale — exactly one health route                                                |
| #785           | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                                            |
| #720/#748      | `.nvmrc` missing / invalid              | Stale — file exists (`22.14.0`)                                                 |
| #719           | Missing root TypeScript config          | Stale — root `tsconfig.json` exists                                             |
| #722           | No env validation at startup            | Stale — `apps/nextjs/src/env.mjs` with 16 zod checks                            |
| #721           | No authorization beyond authentication  | Stale — `adminProcedure` at `trpc.ts:331`                                       |
| #635           | No developer onboarding guide           | Stale — `docs/ONBOARDING.md` exists                                             |
| #664           | console.\* in db/stripe                 | Stale — 0 runtime `console.*`; pino `logger.ts` in both packages                |
| #731           | API docs manually maintained            | Stale — `packages/api/src/openapi.ts` + `apps/nextjs/src/app/api/docs/route.ts` |
| #501/#628/#724 | Missing Playwright E2E                  | Stale — 11 e2e specs in `tests/e2e/`                                            |
| #789           | React peerDependencies missing          | Stale — `{next, react, react-dom}` peerDeps present (loop-26 set)               |

Closing any of these requires issue write → **403 → blocked (§4)**.

---

## §4 Blocked Write Paths (re-confirmed this run, first-hand)

| Surface                             | Operation                           | Result                                                                |
| ----------------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| Issues (label)                      | `POST .../issues/789/labels`        | **403** `Resource not accessible by integration` (re-probed this run) |
| Issues (close, REST)                | `PATCH .../issues/480 state=closed` | **403** (re-probed; #480 stayed OPEN)                                 |
| Issues (comment, GraphQL)           | `gh issue comment 496 --body …`     | **403** GraphQL `addComment` (re-probed this run)                     |
| Issues (create)                     | —                                   | **403** (carried from loops 19–29; same token/scope class)            |
| CI re-run / dispatch                | `gh run rerun` / `gh workflow run`  | **403** (carried; `actions: read` only)                               |
| Workflow-file push                  | `git push` (`.github/workflows/*`)  | Platform-rejected: GitHub App lacks `workflows` perm                  |
| Branch push (non-WF)                | `git push` (normal files)           | **Allowed** (docs-audit branches are the proof)                       |
| PR create / label / comment / merge | —                                   | **Allowed** (loops 26–29 merged 12+ PRs; PR labels applied loop 28+)  |

Root cause (unchanged, carried from loops 19–29; re-verified first-hand this run):

1. **Token scope**: `on-pull.yml:9-14` permissions block declares `contents: write`, `pull-requests: write`, `actions: read`, `repository-projects: write`, `id-token: write` — **no `issues: write`** → no issue-side write scopes, no CI re-runs. Note: `iterate.yml:13` declares `issues: write`, but the loop runs under `on-pull.yml`, which does not.
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` cannot create/update any file under `.github/workflows/` without the app's `workflows` permission — blocks shipping fix (1) from inside the loop.

**Suggested maintainer action (unchanged, still highest-leverage):** land `docs/patches/on-pull-issues-write-permission.patch` with a human account / `workflows: write` token — one line — then every future loop can execute the §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set (including **#496**, verified code-complete). Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2). Third (revised per loop-30 finding): rather than "configure a bundle analyzer" (#708 is configured), give #751 a **historical bundle baseline** (build the pre-`64b82a9` tree or record size-limit output across the lazy-splitting commit) and/or wire a Turbopack-compatible chunk report so the `≥10% reduction` DoD can be verified. Also worth maintainer attention: investigate the loop-29 branch CI run failure with zero jobs (`39138816789`). With loop-26–29 promotions included, an `issues: write`-enabled loop could immediately close **50+** already-verified issues.

---

## §5 Gates (loop 30)

| Gate           | Command                                      | Result                                              |
| -------------- | -------------------------------------------- | --------------------------------------------------- |
| Install        | `pnpm install --frozen-lockfile`             | Done in 7.5s                                        |
| Typecheck      | `pnpm typecheck`                             | **9/9 successful**, 12.5s                           |
| Lint           | `pnpm lint`                                  | **9/9 successful**, 45.3s (**zero warnings**)       |
| Test           | `pnpm test`                                  | **2207/2207 passed (151 files)**, 43.5s             |
| Build          | `pnpm build` (env:validate + turbo build)    | **1/1 successful**, 33.5s                           |
| RL tests       | `npx vitest run` (3 rate-limiter test files) | **98/98 passed**, 1.13s (first-hand #496 proof)     |
| Size budgets   | `pnpm size:check`                            | **green**: 612.99/800, 20.13/120, 260.03/300 kB     |
| Analyzer probe | `ANALYZE=true … next build`                  | build OK, **no `.next/analyze`** → Turbopack-inert  |
| Patches        | `git apply --check` (both pre-staged)        | Clean against `1feecb8`                             |
| Ship           | docs-only PR (this audit)                    | No runtime code touched; last-known-green re-proven |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§4). All §3/§4 evidence collected first-hand, matching the loops 17–29 verification pattern. Vercel deployment status not re-probed this run (environmental outage evidence recorded in loop 28; unaffected by docs-only changes).

---

## §6 Final State

- **waiting for human review** — PR with this audit (labeled `docs` + `P2` per contract — PR-side label write is available even though issue-side is not).
- Unblocked only by a maintainer token/account with `workflows: write` (land the §4 one-line `on-pull.yml` patch first), after which `issues: write`-enabled loops can execute §1 labels, §2/§3 closes (D1's #480 close re-attempted and 403-blocked this run), administrative closure of #496 (verified code-complete), and closure of the §3 stale set. Second: `actions: write` would let loops re-run timed-out CI (cf. the zero-job failure on run `39138816789`).
- Loop-30 delta vs. loop 29: **zero open PRs at entry** (loop-29's own PR #1581 merged to `1feecb8`); **#708 classification corrected** from "not configured" to **configured + budgets green, HTML analyzer inert under Turbopack** (forced `ANALYZE=true` build produced no report); **#751 measurement advanced** with first concrete size-limit numbers (612.99/20.13/260.03 kB vs budgets) while its ≥10% baseline DoD remains open; CI anomaly (zero-job failure on loop-29 branch run) recorded; issue-side writes re-probed 403 across three surfaces including a real D1 close attempt; label matrix re-derived 33/49 with exact-match no-drift confirmation; full P0/P1 set verified first-hand; both pre-staged patches re-verified clean-apply; full green baseline re-proven.
- No destructive actions taken; no force-pushes; issue-side writes remain untouched (403; #480 confirmed OPEN after close probe). Only the docs audit branch was created this run.
