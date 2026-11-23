# Issue Manager Audit — 2026-11-23

- **Execution date**: 2026-11-23 (04:11–04:20 UTC)
- **Active phase**: Phase 0 → **ISSUE MANAGER MODE** (Steps 1–4); Phases 1–3 not activated
- **Default branch**: `main` (detected automatically; `HEAD` = `origin/main` = `ce29f10`)
- **Run context**: autonomous loop invocation (`/ulw-loop`), working tree at `ce29f10`

## Decision summary

Phase 0.1 found **0 open PRs** → PR HANDLER MODE not entered. Phase 0.2 found **82 open
issues** → **ISSUE MANAGER MODE**; all other phases stopped per the state machine.

This run independently re-verified the standing blocker and every prior disposition at
fresh HEAD `ce29f10` (the 2026-11-22 loop2 audit's merge):

1. **Issue writes remain 403-blocked** — fresh probes this run: comment
   (`addComment`), label (`addLabelsToLabelable`), and fail-safe issue creation
   (`createIssue`) all rejected — `Resource not accessible by integration`. Root cause
   unchanged: `on-pull.yml` declares `contents/pull-requests/actions/repository-projects/id-token`
   but **no `issues: write`**; Option A (workflow-file patch) remains un-pushable from
   CI; Option B (`iterate.yml`, which does declare `issues: write` at line 13) is still
   `disabled_manually`.
2. **Workflow-file push gate re-probed verbatim** — a throwaway branch touching
   `.github/workflows/iterate.yml` was rejected:
   `refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml without 'workflows' permission`
   (**18th consecutive rejection**; local probe commit reverted, local branch deleted,
   `git ls-remote` confirms no remote ref). Option C gate therefore still closed for
   **#305**, **#728**, **#501**.
3. **Step 1 audit reproduced independently**: exactly **49 non-compliant issues**
   (12 missing category, 13 multi-category, 38 missing priority; union 49) — identical
   row sets to loop2/loop3/loop4/loop22. The per-issue label table in
   `docs/issue-manager-audit-2026-11-21-loop3.md` (§Step 1) remains current.
4. **Steps 2–3 dispositions re-verified first-hand** (table below) with one **delta**:
   **#687 is now SHIPPED** (all 6 packages expose a barrel `index.ts`; `CONTRIBUTING.md`
   §"Export Patterns & Barrel Exports" documents every barrel; 0 `../../../` internal
   path imports across `packages/`; 18 files import via `@saasfly/db`). Prior audits
   listed #687 as an open implementation gap — that gap has closed since.
5. **Step 4 selected P0 #496** and re-verified it **complete on `main`** with fresh
   file-level evidence. No code repair required → no repair PR. The selection deadlock
   persists until a maintainer unblocks issue writes.
6. **Explore subagent unavailable for the 5th consecutive run** — task `bg_81fc9c4c`
   failed at dispatch (`ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free`,
   model retired). All evidence gathered directly with read-only tools; no finding
   depends on the failed delegation.

## Action log

| Timestamp (UTC) | Action                                                              | Target                                                                                  | Result                                                                                                |
| --------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 04:11Z          | Phase 0.1: query open PRs                                           | repo                                                                                    | 0 open → not PR HANDLER MODE                                                                          |
| 04:11Z          | Phase 0.2: query open issues                                        | repo                                                                                    | 82 open → **ISSUE MANAGER MODE**                                                                      |
| 04:11Z          | Detect default branch + auth                                        | `gh repo view`, `gh auth status`                                                        | `main`; token = `github-actions[bot]` (GITHUB_TOKEN)                                                  |
| 04:12Z          | Skill loaded                                                        | `github-workflow-automation`                                                            | applied: workflow permission model (403 root cause), single-branch PR discipline                      |
| 04:12Z          | **Write probes**: comment + label on #789                           | issue #789                                                                              | both **403** (`addComment`, `addLabelsToLabelable`)                                                   |
| 04:13Z          | **Fail-safe probe**: create issue documenting 403 uncertainty       | repo                                                                                    | **403** (`createIssue`) — this document is the substitute record (loop2/3/4/22 precedent)             |
| 04:13Z          | **Step 1 programmatic label audit** (canonical category × priority) | all 82 issues                                                                           | **49** non-compliant — identical row sets to loop2/loop3/loop4/loop22                                 |
| 04:14Z          | **Workflow-file push probe** (throwaway branch, iterate.yml touch)  | `probe/workflows-perm-2026-11-23`                                                       | **rejected verbatim** — GitHub App lacks `workflows` permission; local commit reverted, no remote ref |
| 04:14Z          | Step 2/4 evidence sweep (stale/resolved set)                        | `.nvmrc`, `tsconfig.json`, workflows, stripe pkg, webhook path, e2e specs               | all dispositions re-confirmed (table below)                                                           |
| 04:14Z          | Step 2/4 evidence sweep (shipped set)                               | authorization.ts, trpc.ts, instrumentation.ts, security-logging-audit.md, schema, tests | #721/#722/#632/#496/#755/#789/#787/#788 SHIPPED; #480 duplicate of #496                               |
| 04:15Z          | Step 2 evidence sweep (delta)                                       | barrels, `CONTRIBUTING.md`, `dx:*` scripts                                              | **#687 now SHIPPED** (was open); #635 refined (dx scripts exist, ONBOARDING still docs-only)          |
| 04:15Z          | Verification suite: install                                         | `pnpm install --frozen-lockfile`                                                        | EXIT 0 (7.6s)                                                                                         |
| 04:15Z          | Verification suite: typecheck                                       | `pnpm typecheck`                                                                        | 9/9 turbo tasks, EXIT 0                                                                               |
| 04:15Z          | Verification suite: lint                                            | `pnpm lint`                                                                             | 9/9 turbo tasks, EXIT 0 (0 warnings)                                                                  |
| 04:16Z          | Verification suite: test                                            | `pnpm test`                                                                             | 160/160 files, **2241/2241 tests passed** (49.3s), EXIT 0                                             |
| 04:17Z          | Incidental: pre-commit hooks during probe commit                    | husky lint-staged                                                                       | typecheck + test + lint + `dx:quick` all green during probe commit                                    |
| 04:20Z          | Record findings                                                     | this document                                                                           | committed via this run's single documentation PR                                                      |

**Skills used** (mandatory enumeration of `.opencode/skills/`): `ai-agent-engineer`,
`github-workflow-automation`, `maxritter-claude-codepro-backend-models-standards`,
`modu-ai-moai-adk-moai-tool-opencode`,
`muratcankoylan-agent-skills-for-context-engineering-memory-systems`,
`obra-superpowers-systematic-debugging`, `openx-basefly`, `planning-with-files`,
`proffesor-for-testing-agentic-qe-skill-builder`, `security-research`, `security-review`,
`skill-creator`. **Loaded this run**: `github-workflow-automation` — result: its
workflow permission model confirmed the 403 root cause (`on-pull.yml` lacks
`issues: write`) and the workflow-file push ban; its git/PR discipline governed the
single-branch docs flow below. (`commit-message` is present on disk but not registered
with the skill loader — noted, not loadable.)

**Subagents**: one `explore` dispatch (`bg_81fc9c4c`) — failed at dispatch
(`ProviderModelNotFoundError`, retired model `muse-spark-1.3-contributor-free`), 5th
consecutive run; evidence gathered directly instead.

## Blocker status — unchanged; maintainer options stand

The session token cannot mutate issues (HTTP 403, probed fresh this run: comment,
label, create). Options:

1. **Option A** — add `issues: write` to `on-pull.yml` permissions (ready patch in
   `docs/issue-manager-audit-2026-11-21-loop4.md` §Blocker). CI cannot push it
   (GitHub App lacks `workflows` permission — verbatim rejection re-recorded this run).
2. **Option B** — re-enable workflow `parallel` (`iterate.yml`, declares `issues: write`
   at line 13), `disabled_manually` since 2026-02-27.
3. **Option C** — grant the GitHub App the `Workflows` permission; this also unblocks
   shipping workflow-file fixes (**#305**, **#728** activation, **#501** CI wiring)
   from CI.

The fail-safe "create an issue explaining the uncertainty" remains equally 403-blocked
(probed this run: `createIssue`); this document is the substitute record.

## Step 1 — Issue normalization (49 issues; apply when write access returns)

82 open issues; programmatic audit over canonical sets
`bug|enhancement|feature|docs|refactor|chore|test|ci|security` × `P0|P1|P2|P3`:

- **Missing category (12)**: `595, 635, 670, 697, 744, 748, 749, 751, 752, 753, 754, 755`
- **Multi-category (13)**: `305, 496, 498, 515, 522, 523, 549, 550, 551, 581, 584, 688, 713`
- **Missing priority (38)**: `305, 584, 595, 628, 630, 631, 632, 634, 635, 636, 668, 697,
713, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 744, 748, 749, 751,
752, 753, 754, 755, 785, 786, 787, 788, 789`
- **Union: 49** — identical row sets to loop2/loop3/loop4/loop22 (independently reproduced).

Per-issue proposed labels: apply loop3's table verbatim
(`docs/issue-manager-audit-2026-11-21-loop3.md`, Step 1) — still current at `ce29f10`.

## Step 2 — Duplicate detection & stale closures (fresh evidence, HEAD `ce29f10`)

| Disposition                              | Issues                                   | Fresh evidence (this run)                                                                                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Complete** → close (P0)                | #496; #480 as duplicate                  | `distributed-rate-limiter.ts` (9.5KB) + 3 sibling test files; `ioredis: 5.6.1` (`packages/api/package.json:39`); import `trpc.ts:19,25`; `docs/redis-setup.md`; #480 body = same Redis-limiter scope                             |
| **#305 canonical** → close as duplicates | #595, #584, #670, #744                   | `iterate.yml` still `npm ci` (lines 72, 342) + `hashFiles('**/package-lock.json')` (line 59) — unchanged; `on-pull.yml` clean (pnpm/action-setup@v6, cache: pnpm)                                                                |
| **Stale** → close as resolved            | #720, #748                               | `.nvmrc` = `22.14.0` (valid; fixed by PR #758)                                                                                                                                                                                   |
| **Stale** → close as resolved            | #613                                     | `.github/workflows/` contains only `iterate.yml` and `on-pull.yml`                                                                                                                                                               |
| **Stale** → close as resolved            | #719                                     | root `tsconfig.json` exists (248 bytes; extends base config)                                                                                                                                                                     |
| **Stale** → close as resolved            | #785                                     | `packages/stripe/package.json` has no `next` dependency                                                                                                                                                                          |
| **Stale** → close as resolved            | #786                                     | real webhook path `app/api/webhooks/stripe/route.ts` exists; no `slice(-8)` matches                                                                                                                                              |
| **Resolved** → close                     | #724                                     | `tests/e2e/` contains **11** spec files                                                                                                                                                                                          |
| **#501 canonical**                       | close #628 as duplicate                  | `playwright.config.ts` present; no Playwright reference in `.github/workflows/`; both request the same Playwright E2E suite                                                                                                      |
| **Shipped** → close                      | #721                                     | `packages/api/src/authorization.ts`; `requireRole` (`trpc.ts:351`, queries `User.role`); `createRoleBasedProcedure` (`trpc.ts:426`)                                                                                              |
| **Shipped** → close                      | #722                                     | `initEnvValidation()` wired at `apps/nextjs/src/instrumentation.ts:20`                                                                                                                                                           |
| **Shipped** → close                      | #632                                     | `docs/security-logging-audit.md` cites "Issue: #632", "All acceptance criteria … met" + regression test block                                                                                                                    |
| **Shipped** → close                      | #498                                     | `enum Role` (`packages/db/prisma/enums.ts`); `requireRole`/`createRoleBasedProcedure` middleware                                                                                                                                 |
| **Shipped** → close                      | #500, #549                               | `packages/auth/clerk.test.ts`, `env.test.ts`, `logger.test.ts`                                                                                                                                                                   |
| **Shipped** → close                      | #550                                     | `vitest.config.ts` includes `apps/nextjs/src/**/*.{ts,tsx}`                                                                                                                                                                      |
| **Shipped** → close                      | #551                                     | `packages/api/src/router/k8s-router.test.ts` (18 tests)                                                                                                                                                                          |
| **Shipped** → close                      | #755                                     | migration `20260227_add_customer_subscription_composite_index` + schema `@@index([authUserId, plan, stripeCurrentPeriodEnd])` (schema.prisma:44)                                                                                 |
| **Shipped** → close                      | #789                                     | `packages/ui/package.json` `peerDependencies`: `react: ^19.0.0`, `next >=14`, `react-dom ^19`                                                                                                                                    |
| **Shipped** → close                      | #787, #788                               | `packages/db` 7 test files; `packages/ui` 56 test files                                                                                                                                                                          |
| **Shipped** → close                      | **#687 (NEW this run)**                  | all 6 packages expose `index.ts` (auth/db at root; api/common/stripe/ui under `src/`); `CONTRIBUTING.md:73-80` documents every barrel; 0 `../../../` imports in `packages/`; 18 files import `@saasfly/db`; prior PRs #1449 etc. |
| **Shipped** → close                      | #728 activation content (workflow-gated) | `.github/scripts/security-audit.yml` exists — activation file itself blocked by Option C                                                                                                                                         |
| **Shipped** → close                      | #498/#549/#550/#551/#500/#581 children   | all child evidence re-confirmed this run (above rows)                                                                                                                                                                            |

## Step 3 — Consolidation (carried forward, re-verified + one refinement)

| Action                        | Detail                                                                                                                                                                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#523 → fold into #667**     | same barrel-export audit scope; preserve #523 specifics in the closing comment when applying                                                                                                                                                                                                 |
| **#581 umbrella**             | close after children — children now verified shipped (#549/#550/#551/#500) except **#501**'s CI wiring (workflow-gated)                                                                                                                                                                      |
| **#687 → close (NEW)**        | shipped this run (see Step 2); cross-link from #667 when closing rather than keeping it open                                                                                                                                                                                                 |
| **#631 vs #725 distinct**     | per-router unit tests vs integration-level tests — different levels, not duplicates                                                                                                                                                                                                          |
| **#635 stays open (refined)** | `docs/ONBOARDING.md` exists but is the documentation-contributor guide (0 `dx:` mentions, no pitfalls section); root `package.json` now has **10 `dx:*` scripts** (was "0 matches" in prior audits — scripts landed since) — remaining gap is a _developer_ onboarding guide explaining them |
| **No new issues created**     | every cluster already has a canonical issue; issue creation remains 403-blocked (`createIssue` probed this run)                                                                                                                                                                              |

## Step 4 — Repair mode (highest-priority issue)

**Selection**: P0 exists → **#496** `[P0][Security] Replace in-memory rate limiter with
distributed store (Redis)`.

**Fresh verification at HEAD `ce29f10` (this run)** — complete, no code repair required:

| Acceptance area        | Evidence this run                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Redis-backed limiter   | `packages/api/src/distributed-rate-limiter.ts` (9500 bytes; sliding-window; `Redis` from ioredis)                               |
| Dependency             | `packages/api/package.json:39` → `"ioredis": "5.6.1"`                                                                           |
| Wired into tRPC        | `packages/api/src/trpc.ts:19` import, `:25` type re-export                                                                      |
| Fallback without Redis | `SyncRateLimiter` in module header; `rate-limiter.ts` re-exports                                                                |
| Tests                  | `rate-limiter.test.ts`, `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts` (in suite: 2241/2241 green) |
| Documentation          | `docs/redis-setup.md` exists                                                                                                    |

**Repair verdict: no code changes → no repair PR** (an empty-diff PR would violate "no
PR without change"). **Structural deadlock unchanged**: #496 cannot be closed (403), so
Step 4 re-targets a completed issue every run. Every other P0/P1-tier issue is likewise
shipped (#498, #500, #549, #550, #551, #721, #722, #632, #786, #787, #788, #789, #687),
duplicate (#480), stale, or gated:

- **#501** (P1): Playwright suite exists (11 specs) but no CI workflow runs it →
  requires a `.github/workflows/*` change → **workflow-file push rejected this run**
  (needs Option C).
- **#515** (P1): CSRF shipped as header-origin validation; the literal AC contradicts
  the shipped design; rewriting ACs is an issue edit → **403**.
- **#305 / #728** (P2, next tier): both content-ready but **workflow-file-gated**
  (`#728` activation file already exists at `.github/scripts/security-audit.yml`).

## Verification suite (re-run this run, HEAD `ce29f10`, tree clean)

| Check     | Command                          | Result                                            | Exit |
| --------- | -------------------------------- | ------------------------------------------------- | ---- |
| Install   | `pnpm install --frozen-lockfile` | success (7.6s)                                    | 0    |
| Typecheck | `pnpm typecheck`                 | 9/9 turbo tasks successful                        | 0    |
| Lint      | `pnpm lint`                      | 9/9 turbo tasks successful (0 warnings)           | 0    |
| Test      | `pnpm test`                      | 160/160 files, **2241/2241 tests passed** (49.3s) | 0    |

Pre-existing, untouched: `Unsupported engine` warning (runner node 20.20.2 vs
`package.json` `>=22` — install/tests/typecheck/lint all green regardless); Vercel
preview status red on `main` (environmental, standing finding, not a merge blocker per
repo practice).

## Blocked items (cannot be resolved by this token)

1. **All issue mutations → HTTP 403** — fresh probes this run (comment, label, create).
   Fix options A/B/C above; Option A proven un-pushable from CI (rejection re-recorded);
   Option B workflow `disabled_manually`.
2. **Workflow-file pushes rejected** — verbatim rejection re-recorded this run (18th);
   blocks repair of **#305**, activation of **#728**, and CI wiring for **#501**; needs
   Option C (`Workflows` permission).
3. **Structural selection deadlock** — Step 4 keeps selecting completed P0 #496 until
   item 1 lands.
4. **`pull_request`-triggered `on-pull.yml` runs fail** — standing condition
   (loop2/3/4/22); PRs merged on local suite green per repo practice.
5. **Explore subagent unavailable** — dispatch of `bg_81fc9c4c` failed at start (5th
   consecutive run; this time `ProviderModelNotFoundError` on retired
   `muse-spark-1.3-contributor-free`). Evidence gathered directly; no finding affected.
6. **Push probe hygiene**: the workflow-permission probe branch was created and
   rejected server-side; local commit reverted, local branch deleted, no remote ref
   exists (`git ls-remote` empty). Nothing destructive was performed.

## Findings for the next run

- **When issue writes return**: apply loop3's Step 1 label table verbatim (49 rows;
  re-verified current this run), then Step 2 closures (duplicates + stale/resolved +
  shipped sets — now additionally includes **#687**), then Step 3 consolidations —
  order matters: closures first, then Step 4 can reach actionable work.
- **When `Workflows` permission returns (Option C)**: ship #305 (`iterate.yml`
  npm→pnpm), activate #728 from `.github/scripts/security-audit.yml`, wire Playwright
  into CI (gap under #501).
- **#635 refined**: `dx:*` scripts (10) now exist in root `package.json`; the remaining
  gap is a developer-facing onboarding guide (ONBOARDING.md is docs-contributor-scoped,
  0 `dx:` mentions, no pitfalls section). Prior "dx scripts missing" finding is stale.
- Node engine mismatch persists (`>=22` wanted, runner node 20) — install/tests fine;
  consider an engine-range issue only if a real failure appears.
- Explore subagent should be re-pointed at a live free model (or dropped) — five
  consecutive runs have failed dispatch, latest on a retired model ID.

## Final state

**blocked** — Steps 1–3 await issue-write permission for the workflow token; all three
maintainer options are fully evidenced (loop4 carries the ready-to-apply Option A
patch; this run re-recorded the verbatim workflow-file push rejection). Step 4
completed as "P0 verified complete, no repair needed"; the selection deadlock is
documented with fresh evidence. Normalization (49 rows), duplicate closures, and
consolidations — now including the newly-shipped **#687** — are specified and ready to
apply verbatim once write access returns. One documentation PR carries this record
(suite green above; branch deleted post-merge per operating contract).
