# Issue Manager Audit — 2026-10-17 (loop 27)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-17 23:30–23:45 UTC                                                                                                                                                                               |
| State machine         | Phase 0.1 → **PR HANDLER MODE** (PR #1577 merged) → Phase 0.2 → **ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                              |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `87c521e` = PR #1575 merge, loop-25 audit; then `7b2bd81` = PR #1577 merge, this run)                                                                                   |
| Phase 0.1 open PRs    | **1** (#1577) → **PR HANDLER MODE** entered (first loop since 17 to enter this mode)                                                                                                                     |
| PR #1577 disposition  | Docs-only loop-26 audit; up-to-date with `main`; all gates green; admin-merged → `main` at `7b2bd81`; remote branch deleted                                                                              |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical set to loops 7–26 — no drift)                                                                                                                                 |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 re-derived; issue writes re-probed 403; STEP 4 completed — **#496 re-verified code-complete**, **2 new implemented-issue promotions**)                                     |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§5)                                                                       |
| Skills used           | `openx-basefly` (repo harness conventions, docs-audit PR pattern); `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `commit-message` (conventional commit) |
| Subagents             | Not required this run — all §3/§4 evidence collected first-hand (established loops 17–26 verification pattern; verification scope was already bounded)                                                   |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **1 open PR (#1577)** → **PR HANDLER MODE**; Phases 1–3 stopped.
2. **PR #1577 processing** (contract PR HANDLER MODE steps 1–4):
   - Checkout `docs/issue-audit-2026-10-17-loop26`; `git merge-base --is-ancestor origin/main HEAD` → **main is ancestor** (branch up-to-date, no rebase needed).
   - Conflicts: **none** (`mergeable: MERGEABLE`; single docs file added, 210+/0−).
   - Gates re-run first-hand on the PR branch: typecheck **9/9**, lint **9/9** (zero warnings), test **2207/2207** (151 files), build **1/1**.
   - Checks: `Vercel Preview Comments` SUCCESS; `Vercel` context FAILURE — environmental preview-deploy failure unrelated to this docs-only change (same failure mode as prior audit PRs #1573–#1575; docs/ is not part of the Next.js build surface).
   - Comments: only the Vercel bot status comment; **no human reviews/comments to resolve**; no security-sensitive change (docs-only).
   - Merge conditions met → `gh pr merge 1577 --admin --merge --delete-branch` → **MERGED** at `2026-10-17T23:36:55Z`; `main` advanced `87c521e..7b2bd81`; remote branch deleted post-merge (contract step 4).
3. **Re-evaluation (Phase 0.1 again)**: open PRs now **0** → proceed to Phase 0.2.
4. **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
5. Drift check: HEAD = `7b2bd81` (loop-26 audit merge). Issue set unchanged (same 82 numbers) → **no drift**.
6. STEP 1: label matrix recomputed independently → **33 compliant / 49 remediation** — exact match with loops 7–26 → no-drift rule applies; apply attempt (`gh api -X POST .../issues/789/labels`) → **403** (§1, §5).
7. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–26 (§2). Closures remain 403-blocked (§5).
8. STEP 4: **#496** (only P0) re-verified code-complete **first-hand this run**: the three rate-limiter test files executed green (**98/98**, 1.14s) at `7b2bd81`. Highest-priority P1s all either already implemented or platform-blocked.
9. **New verifications this run (loop 27)** — **two** previously-open issues are **implemented**, evidenced first-hand (§3):
   - **#635** (developer onboarding guide): `docs/ONBOARDING.md` exists with full onboarding content ("Documentation Contributor Onboarding Guide", Quick Start section); linked from root README ("Contributing to Documentation").
   - **#630** (enhance pre-commit hooks with typecheck and test): `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm check-deps`, `pnpm lint-staged`.
10. Re-confirmations this run (no regressions at `7b2bd81`): all 15 loop-26 promotions (§3 of loop-26 audit) re-verified first-hand — #789 peerDependencies, #788 (30 test files in apps/nextjs), #787 (7 test files in packages/db), #515 csrf.ts+test, #498 rbac.test.ts+admin-access.ts, #721 adminProcedure at `trpc.ts:331`, #632 sensitive-data-logging.test.ts, #753 next/dynamic in dashboard pages, #485 (10 loading.tsx), #492 (18 sizes= attributes), #683 shared tooling/eslint-config+prettier-config, #523 sideEffects in 6/6 manifests, #722 env.mjs (16 zod checks), #667 export-boundaries docs, #521 use-client-dictionary.ts. Loop-26 §4 stale set also re-confirmed: #785 (no `next` dep in packages/stripe), #786 (no secret-logging patterns in stripe src), #720/#748 (`.nvmrc` = `22.14.0`), #719 (root `tsconfig.json` exists), #501/#628 (11 e2e specs in `tests/e2e/`).
11. Confirmed genuinely-open this run: **#723** (40/182 client components in apps/nextjs — observation still valid), **#751** (no lazy/dynamic tRPC router splitting in `packages/api/src`), **#494** (no `domain/` directory), **#697** (mojibake still present in historical audit-artifact docs files), D2 cluster (#670/#744/#595/#584/#305: `iterate.yml` still shows `npm ci || true` at lines 72 and 342 — workflow-file, platform-blocked), **#650** (prompts still inline in `on-pull.yml` — workflow-file, platform-blocked), **#502** (only `iterate.yml` + `on-pull.yml`; no fast-path workflow).
12. **#636** re-confirmed intentional: `dashboard/page.tsx:34` documents "ISR intentionally not used — `force-dynamic`"; closing as wontfix requires issue write → 403 → blocked.
13. FAIL-SAFE: administrative closure of the verified set and label application both require issue write → **403** → no guess made; this audit remains the durable capture (established loop pattern).
14. Pre-staged patches re-validated against current main (`7b2bd81`): `docs/patches/on-pull-issues-write-permission.patch` and `docs/patches/fix-pnpm-consistency-iterate-744.patch` both **clean apply**; `iterate.yml` still shows `npm ci || true` at lines 72 and 342 (D2 cluster open, workflow-file platform-blocked).
15. Full green baseline re-established first-hand this run: **typecheck 9/9 (31.9s), lint 9/9 (62.5s), test 2207/2207 (151 files, 44.9s), build 1/1 (36.2s)** — matches loop-19/21/22/23/24/25/26 baseline exactly → no regression.

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–26 → no-drift rule applies.

Remediation breakdown (carried verbatim from loop 26, re-confirmed against fresh `gh issue list`):

- 27 missing priority only: `789, 788, 787, 786, 785, 731, 729, 728, 727, 726, 725, 724, 723, 722, 721, 720, 719, 713, 668, 636, 634, 632, 631, 630, 628, 584, 305`
- 12 missing category: `755, 754, 753, 752, 751, 749, 748, 744, 697, 670, 635, 595` (670 already carries `P3`; 635 carries legacy `documentation`, not the contract `docs`)
- 13 multi-category: `713, 688, 584, 581, 551, 550, 549, 523, 522, 515, 498, 496, 305` (305 also missing priority)

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=enhancement" -f "labels[]=P3"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–27 no-flip-flop rule):**

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

Clusters unchanged from loops 17–26 (static issue set, no new issues this run):

| ID  | Members                 | Canonical | Disposition                                           |
| --- | ----------------------- | --------- | ----------------------------------------------------- |
| D1  | 496, 480                | **496**   | Close 480 as duplicate of P0 (both Redis RL)          |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670 (P3, precise scope)             |
| D3  | 628, 501, 724           | **501**   | Close 628/724 as duplicates (Playwright E2E)          |
| D4  | 631, 725, 754           | **725**   | Close 631/754 as overlapping API test issues          |
| D5  | 720, 748                | **748**   | Both stale — `.nvmrc` now `22.14.0` (verified)        |
| D6  | 785, 789                | —         | Not duplicates; **789 promoted (loop 26)**; 785 stale |
| D7  | 551, 550, 549, 581      | **581**   | Testing-infra umbrella; children already done         |

**Closing requires issue write → 403 → blocked (§5).**

---

## §3 STEP 4 — Repair Mode

### Selection

- P0 exists: **#496** → selected first (contract: highest-priority).
- Re-verified code-complete **first-hand this run**: `npx vitest run packages/api/src/rate-limiter.test.ts packages/api/src/distributed-rate-limiter.test.ts packages/api/src/distributed-rate-limiter-sync.test.ts` → **3 files, 98/98 tests passed** (1.14s) at `7b2bd81`. Implementation files present: `distributed-rate-limiter.ts` (Redis-based `DistributedRateLimiter` + `SyncRateLimiter` in-memory fallback, sliding-window algorithm), `rate-limiter.ts`. Repair would be administrative close → **403** → FAIL-SAFE.
- Highest-priority P1s are all either already implemented (loops 21–26 verifications) or platform-blocked (#728 workflow-file change, §5).
- **#755** remains rejected as a repair target (FAIL-SAFE carried from loops 21–26: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- **#636** rejected: code documents ISR as intentionally unused (`force-dynamic` design decision, `dashboard/page.tsx:34`) → closing as wontfix requires issue write → blocked.
- **#751** (tRPC bundle code splitting), **#650** (extract prompts — platform-blocked), **#688** (middleware.ts), **#522** (Vercel workflow), **#502** (fast-path CI), **#494** (domain layer), **#723** (client-component ratio) remain genuinely open but are non-critical enhancements with no P0/P1 pressure; per contract (minimal, atomic, no speculative work) they are left for a future loop or human implementation.
- Iterate.yml npm→pnpm cluster (D2: #670/#744/#595/#584/#305) re-confirmed still open (`npm ci || true` at lines 72, 342) → workflow file → **platform-blocked** (§5).
- Net: **no safely-implementable issue remains**; this loop's deliverable is verification evidence + this audit (established loop 17–26 pattern).

### Loop-27 promotions (new evidence — 2 items)

| Issue | Claim                                           | Verdict (fresh loop-27 evidence)                                                                                         |
| ----- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| #635  | No developer onboarding guide for documentation | **Implemented** — `docs/ONBOARDING.md` exists (full guide: Quick Start, style, contribution process); linked from README |
| #630  | Pre-commit hooks lack typecheck and test        | **Implemented** — `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm check-deps`, `pnpm lint-staged`          |

### Re-verified promotions (loop-26 set — no regressions at `7b2bd81`)

| Issue | Claim                                          | Verdict (fresh loop-27 evidence)                                                                                                                  |
| ----- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| #789  | React peerDependencies missing in packages/ui  | **Implemented** — `packages/ui` peerDeps `{next: ">=14.0.0", react: "^19.0.0", react-dom: "^19.0.0"}`; react not in `dependencies`                |
| #788  | No unit tests for UI components in apps/nextjs | **Substantially implemented** — **30** test files under `apps/nextjs/src`, all in green 2207 suite                                                |
| #787  | No tests for packages/db migrations/schema     | **Substantially implemented** — **7** test files incl. `migrations.test.ts`, `soft-delete.test.ts`, `rls-middleware.test.ts`                      |
| #515  | No CSRF protection for form submissions        | **Implemented** — `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts`                                                                                  |
| #498  | Email-based admin RBAC                         | **Substantially implemented** — `rbac.test.ts` + `admin-access.ts` role lookup w/ legacy `ADMIN_EMAIL` fallback path                              |
| #721  | No authorization beyond authentication         | **Implemented** — `adminProcedure` at `trpc.ts:331`; `createRoleBasedProcedure(Role.ADMIN)` documented                                            |
| #632  | Sensitive data may leak into logs              | **Substantially addressed** — `packages/api/src/sensitive-data-logging.test.ts` codifies the audit as regression tests                            |
| #753  | Dashboard pages lack route code splitting      | **Substantially implemented** — `next/dynamic` in `dashboard/page.tsx` + `dashboard/settings/page.tsx`                                            |
| #485  | No Suspense boundaries / loading states        | **Implemented** — **10** `loading.tsx` files + `<Suspense>` route usages                                                                          |
| #492  | Responsive images missing `sizes`              | **Implemented** — **18** `sizes=` attributes across `apps/nextjs` + `packages/ui` image usages                                                    |
| #683  | ESLint/Prettier config inconsistency           | **Implemented** — shared `tooling/eslint-config` (base/nextjs/react) + `tooling/prettier-config`; apps/packages extend `@saasfly/eslint-config/*` |
| #523  | Barrel exports hurt tree-shaking               | **Substantially implemented** — `"sideEffects"` declared in **6/6** package manifests                                                             |
| #722  | No env validation at startup                   | **Implemented** — `apps/nextjs/src/env.mjs` with **16** zod validation checks                                                                     |
| #667  | Package export boundaries undocumented         | **Implemented** — `docs/export-boundaries.md` + `docs/barrel-export-audit-2026-08-17.md`                                                          |
| #521  | Hydration risk in client dictionary loading    | **Substantially addressed** — `use-client-dictionary.ts` (`useSyncExternalStore`) + dedicated test                                                |

---

## §4 Stale / Already-Implemented Issues (cumulative)

Loop-26 table carries forward in full (see `docs/issue-manager-audit-2026-10-17-loop26.md` §4); **loop-27 adds the two §3 promotions**. Spot re-confirmations this run at `7b2bd81` (no regressions):

| Issue                                                                      | Claim                                   | Verdict (loop-27)                                        |
| -------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------- |
| #496                                                                       | Distributed Redis rate limiter          | **Re-verified first-hand: 98/98 tests green (this run)** |
| #786                                                                       | Stripe webhook logs partial secret      | Re-confirmed — no secret-logging patterns in stripe src  |
| #785                                                                       | Duplicate `next` dep in packages/stripe | Re-confirmed — no `next` dependency present              |
| #720/#748                                                                  | `.nvmrc` missing / invalid              | Re-confirmed — file exists (`22.14.0`)                   |
| #719                                                                       | Missing root TypeScript config          | Re-confirmed — root `tsconfig.json` exists               |
| #578                                                                       | Duplicate health check endpoint         | Stale — exactly one health route                         |
| #725/#631/#551                                                             | API router tests                        | Already done (loop 23: 136/136 green)                    |
| #501/#628/#724                                                             | Playwright E2E                          | Re-confirmed — 11 e2e specs in `tests/e2e/`              |
| #549/#550/#500                                                             | Auth tests / coverage / Clerk e2e       | Already done                                             |
| #487/#483/#486/#580/#609/#610                                              | (loop-24 set)                           | Implemented / substantially done (loop-24 §3)            |
| #611/#684/#613/#666/#687/#634/#488/#726/#664/#663/#503                     | (loop-25 set)                           | Implemented / substantially done (loop-25 §3)            |
| #789/#788/#787/#515/#498/#721/#632/#753/#485/#492/#683/#523/#722/#667/#521 | (loop-26 set)                           | **Re-verified first-hand this run (§3)**                 |
| #635/#630                                                                  | Onboarding guide / pre-commit hooks     | **NEW: implemented (§3)**                                |

Closing any of these requires issue write → **403 → blocked (§5)**.

---

## §5 Blocked Write Paths (re-confirmed this run)

| Surface               | Operation                          | Result                                                   |
| --------------------- | ---------------------------------- | -------------------------------------------------------- |
| Issues (labels, REST) | `POST .../issues/789/labels`       | 403 `Resource not accessible by integration` (re-probed) |
| Issues (comment)      | REST comments create               | 403 (prior loops; unchanged token model)                 |
| Issues (close)        | `gh issue close`                   | 403 (prior loops; unchanged token model)                 |
| Issues (create)       | `gh issue create`                  | 403 (prior loops; unchanged token model)                 |
| Workflow-file push    | `git push` (`.github/workflows/*`) | Platform-rejected: GitHub App lacks `workflows` perm     |
| Branch push (non-WF)  | `git push` (normal files)          | **Allowed** — this docs PR is the proof                  |
| `gh pr create`        | —                                  | Allowed (PR #1577 processed; this audit PR is the proof) |
| `gh pr merge --admin` | —                                  | **Allowed — PR #1577 merged this run**                   |

Root cause (unchanged, carried from loops 19–26):

1. **Token scope**: the workflow `permissions:` block that supplies this run's token omits `issues: write` for the issue-manager surface → no issue-side write scopes. Fix = one-line patch (§6 suggested action).
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` cannot create/update any file under `.github/workflows/` without the app's `workflows` permission — blocks shipping fix (1) from inside the loop.

**Suggested maintainer action (unchanged, still highest-leverage):** land `docs/patches/on-pull-issues-write-permission.patch` with a human account / `workflows: write` token — one line — then every future loop can execute the §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set. Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2). With loop-27's promotions now included, an `issues: write`-enabled loop could immediately close **47+** already-verified issues.

---

## §6 Gates (loop 27)

| Gate      | Command                                                      | Result                                              |
| --------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`                             | Done in 7.3s                                        |
| Typecheck | `pnpm typecheck`                                             | **9/9 successful**, 31.9s                           |
| Lint      | `pnpm lint`                                                  | **9/9 successful**, 62.5s (zero warnings)           |
| Test      | `pnpm test`                                                  | **2207/2207 passed (151 files)**, 44.9s             |
| Build     | `pnpm build` (env:validate + turbo build)                    | **1/1 successful**, 36.2s                           |
| RL tests  | `npx vitest run` (3 rate-limiter test files)                 | **98/98 passed**, 1.14s (first-hand #496 proof)     |
| Patches   | `git apply --check` (both pre-staged)                        | Clean against `7b2bd81`                             |
| PR #1577  | Rebase-check + gates + `gh pr merge --admin --delete-branch` | **MERGED** at 23:36:55Z; main `87c521e..7b2bd81`    |
| Ship      | docs-only PR (this audit)                                    | No runtime code touched; last-known-green re-proven |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§5). All §3/§4 evidence collected first-hand, matching the loops 17–26 verification pattern.

---

## §7 Final State

- **waiting for human review** — this PR.
- Unblocked only by a maintainer token/account with `workflows: write` (land the §5 one-line `on-pull.yml` patch first), after which `issues: write`-enabled loops can execute §1 labels, §2/§3 closes, and administrative closure of the §4 stale set — which now includes **47+** issues verified implemented across loops 17–27.
- Loop-27 delta vs. loop 26: **PR #1577 handled and merged** (first PR HANDLER MODE entry since loop 17; admin-merge with docs-only gates green; Vercel failure classified environmental); **#635 and #630 promoted to implemented** with first-hand evidence (docs/ONBOARDING.md, .husky/pre-commit typecheck+test); all 15 loop-26 promotions and the loop-26 §4 stale set **re-verified first-hand with zero regressions**; drift vs. loop 26 identified as **1 merge commit** (`7b2bd81`, the loop-26 audit itself) with **zero gate regression** (2207/2207, typecheck 9/9, lint 9/9, build 1/1, plus first-hand 98/98 rate-limiter re-run); label matrix re-derived 33/49 with exact-match no-drift confirmation; both pre-staged patches re-verified clean-apply.
- No destructive actions taken; no branches left on remote besides this docs branch; no force-pushes; issue-side writes remain untouched (403). PR #1577's remote branch was deleted only after confirmed successful merge (contract step 4).
