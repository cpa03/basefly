# Issue Manager Audit — 2026-10-17 (loop 25)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-17 18:55–19:20 UTC                                                                                                                                             |
| State machine         | Phase 0 → **ISSUE MANAGER MODE** (Phases 1–3 stopped per state machine)                                                                                                |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `8007421` = PR #1574 merge, loop-24 audit)                                                                                            |
| Phase 0.1 open PRs    | **0** → no PR HANDLER MODE                                                                                                                                             |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical set to loops 7–24 — no drift)                                                                                               |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 re-derived; issue writes re-probed 403; STEP 4 completed — **11 new already-implemented promotions**, largest single-loop delta to date) |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§5)                                     |
| Skills used           | `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions); `openx-basefly` (repo harness conventions)                              |
| Subagents             | Not used — first-hand verification (established loops 17–24 pattern)                                                                                                   |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open --limit 1000` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
3. **Drift check**: `git log 8007421..origin/main` → **0 commits** (HEAD = `8007421`, loop-24 audit merge). Issue set unchanged (same 82 numbers) → **no drift**.
4. STEP 1: label matrix recomputed → **33 compliant / 49 remediation** — exact match with loops 7–24 → no-drift rule applies; apply attempt (`gh api -X POST .../issues/789/labels`) → **403** (§1, §5).
5. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–24 (§2). Closures remain 403-blocked (§5).
6. STEP 4: **#496** (only P0) remains code-complete (loop-24: 98/98 rate-limiter tests green; no code drift this run). Highest-priority P1s all either already implemented or platform-blocked.
7. **New verifications this run (loop 25)** — **eleven** previously-open issues are **implemented or substantially done**, evidenced first-hand (§3). Highlights:
   - **#611** (custom 404 pages): `not-found.tsx` present at root **and** all five `[lang]` route groups (marketing, docs, auth, editor, dashboard).
   - **#684** (root build script): `package.json` has `"build": "pnpm env:validate && turbo build"`.
   - **#613** (duplicate workflow file): `paratterate.yml` **removed** — only `iterate.yml` + `on-pull.yml` remain.
   - **#666** (global error boundary): `apps/nextjs/src/app/global-error.tsx` exists **plus** five route-group `error.tsx` files.
   - **#687** (barrel exports): `src/index.ts` present in **all four** packages (`api`, `common`, `stripe`, `ui`).
   - **#634** (TypeScript strictness): `tooling/typescript-config/base.json` sets `"strict": true` **and** `"noUncheckedIndexedAccess": true`; all package tsconfigs extend `@saasfly/typescript-config/base.json`.
   - **#488** (circular dependency detection): `check:circular` (madge) wired into root `ci:check` script.
   - **#726** (dependency consistency): `check-deps` (check-dependency-version-consistency) wired into root `ci:check` script.
   - **#664** (console._ → pino): **fully done** — zero runtime `console._`calls remain in`packages/db`+`packages/stripe`; the 4 grep hits are JSDoc usage-example comments only.
   - **#663** (eslint-disable consolidation): reduced from **34 across 14 files** to **8 across 7 files** (2 of which are auto-generated `cloudflare-env.d.ts`).
   - **#503** (JSDoc on public API routers): substantial coverage present — `customer.ts` 11 markers, `stripe.ts` 9 markers.
8. FAIL-SAFE: administrative closure of the verified set and label application both require issue write → **403** → no guess made; this audit remains the durable capture (established loop pattern).
9. Pre-staged patches re-validated against current main (`8007421`): `docs/patches/on-pull-issues-write-permission.patch` → **clean apply**; `docs/patches/fix-pnpm-consistency-iterate-744.patch` → **clean apply**.
10. Full green baseline re-established first-hand this run: **typecheck 9/9, lint 9/9, test 2207/2207 (151 files), build 1/1** — matches loop-19/21/22/23/24 baseline exactly → no regression.

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–24 → no-drift rule applies.

Remediation breakdown (carried verbatim from loop 24, re-confirmed against fresh `gh issue list`):

- 27 missing priority only: `789, 788, 787, 786, 785, 731, 729, 728, 727, 726, 725, 724, 723, 722, 721, 720, 719, 713, 668, 636, 634, 632, 631, 630, 628, 584, 305`
- 12 missing category: `755, 754, 753, 752, 751, 749, 748, 744, 697, 670, 635, 595` (670 already carries `P3`; 635 carries legacy `documentation`, not the contract `docs`)
- 13 multi-category: `713, 688, 584, 581, 551, 550, 549, 523, 522, 515, 498, 496, 305` (305 also missing priority)

**Application attempt (first-hand this run):**

```
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=P2"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–25 no-flip-flop rule):**

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

Clusters unchanged from loops 17–24 (static issue set, no new issues this run):

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
- Re-verified code-complete (loop-24 executed 98/98 rate-limiter tests; zero code drift this run at `8007421`) → repair would be administrative close → **403** → FAIL-SAFE.
- Highest-priority P1s are all either already implemented (loops 21–25 verifications) or platform-blocked (#728 workflow-file change, §5).
- **#755** remains rejected as a repair target (FAIL-SAFE carried from loops 21–24: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- **#636** rejected: code documents ISR as intentionally unused (`force-dynamic` design decision) → closing as wontfix requires issue write → blocked.
- **#751** (tRPC bundle code splitting), **#650** (extract prompts), **#688** (middleware.ts), **#522** (Vercel workflow), **#502** (fast-path CI) remain genuinely open but are non-critical enhancements with no P0/P1 pressure; per contract (minimal, atomic, no speculative work) they are left for a future loop or human implementation.
- Iterate.yml npm→pnpm cluster (D2: #670/#744/#595/#584/#305) re-confirmed still open (`npm ci` at lines 72, 342) → workflow file → **platform-blocked** (§5).
- Net: **no safely-implementable issue remains**; this loop's deliverable is verification evidence + this audit (established loop 17–25 pattern).

### Loop-25 promotions (new evidence — 11 items)

| Issue | Claim                                 | Verdict (fresh loop-25 evidence)                                                                                                 |
| ----- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ | --------------------- |
| #611  | Custom 404 pages missing              | **Implemented** — `not-found.tsx` at root + `[lang]/(marketing                                                                   | docs | auth | editor | dashboard)` (6 files) |
| #684  | Root build script missing             | **Implemented** — `"build": "pnpm env:validate && turbo build"` in root `package.json`                                           |
| #613  | `paratterate.yml` duplicate workflow  | **Implemented** — file removed; only `iterate.yml` + `on-pull.yml` remain                                                        |
| #666  | No global error boundary              | **Implemented** — `apps/nextjs/src/app/global-error.tsx` + 5 route-group `error.tsx` files                                       |
| #687  | Missing barrel exports                | **Implemented** — `src/index.ts` present in `api`, `common`, `stripe`, `ui` (4/4)                                                |
| #634  | TS strictness not enforced            | **Implemented** — shared `base.json` has `"strict": true` + `"noUncheckedIndexedAccess": true`; all packages extend it           |
| #488  | Circular dependency detection missing | **Implemented** — `check:circular` (madge) wired into root `ci:check`                                                            |
| #726  | check-deps not integrated             | **Substantially implemented** — `check-deps` wired into root `ci:check`; remaining gap is workflow invocation (platform-blocked) |
| #664  | console.\* → pino across db/stripe    | **Fully done** — 0 runtime `console.*` calls; 4 grep hits are JSDoc usage-example comments only                                  |
| #663  | Consolidate eslint-disable comments   | **Substantially reduced** — 34/14 files → **8/7 files** (2 auto-generated `cloudflare-env.d.ts`)                                 |
| #503  | JSDoc on public API routers           | **Substantially implemented** — `customer.ts` 11 markers, `stripe.ts` 9 markers                                                  |

---

## §4 Stale / Already-Implemented Issues (cumulative)

Loop-24 table carries forward in full (see `docs/issue-manager-audit-2026-10-17-loop24.md` §4); **loop-25 adds the eleven §3 promotions**. Spot re-confirmations this run at `8007421` (no regressions):

| Issue                                                  | Claim                                   | Verdict (loop-25)                                         |
| ------------------------------------------------------ | --------------------------------------- | --------------------------------------------------------- |
| #496                                                   | Distributed Redis rate limiter          | Already done — loop-24: 98/98 tests green; no drift       |
| #786                                                   | Stripe webhook logs partial secret      | Already fixed — redacted logging in webhook route         |
| #785                                                   | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                      |
| #720/#748                                              | `.nvmrc` missing / invalid              | Stale — file exists (`22.14.0`)                           |
| #719                                                   | Missing root TypeScript config          | Stale — root `tsconfig.json` exists (extends shared base) |
| #578                                                   | Duplicate health check endpoint         | Stale — exactly one health route                          |
| #725/#631/#551                                         | API router tests                        | Already done (loop 23: 136/136 green)                     |
| #501/#628/#724                                         | Playwright E2E                          | Already done (config + 11 e2e specs)                      |
| #549/#550/#500                                         | Auth tests / coverage / Clerk e2e       | Already done                                              |
| #487/#483/#486/#580/#609/#610                          | (loop-24 set)                           | Implemented / substantially done (loop-24 §3)             |
| #611/#684/#613/#666/#687/#634/#488/#726/#664/#663/#503 | (loop-25 set)                           | **NEW: implemented / substantially done (§3)**            |

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
| `gh pr create`        | —                                    | Allowed (prior loops merged through #1574)               |

Root cause (unchanged, carried from loops 19–24):

1. **Token scope**: the workflow `permissions:` block that supplies this run's token omits `issues: write` for the issue-manager surface → no issue-side write scopes. Fix = one-line patch (§6 suggested action).
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` cannot create/update any file under `.github/workflows/` without the app's `workflows` permission — blocks shipping fix (1) from inside the loop.

**Suggested maintainer action (unchanged, still highest-leverage):** land `docs/patches/on-pull-issues-write-permission.patch` with a human account / `workflows: write` token — one line — then every future loop can execute the §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set. Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2). With loop-25's 11 new promotions, an `issues: write`-enabled loop could immediately close **30+** already-verified issues.

---

## §6 Gates (loop 25)

| Gate      | Command                                   | Result                                              |
| --------- | ----------------------------------------- | --------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`          | Done in 7.5s (cache warm)                           |
| Tests     | `pnpm test`                               | **2207/2207 passed (151 files)**, 54.3s             |
| Typecheck | `pnpm typecheck`                          | **9/9 successful**, 18.5s                           |
| Lint      | `pnpm lint`                               | **9/9 successful**, 57.9s                           |
| Build     | `pnpm build` (env:validate + turbo build) | **1/1 successful**, 63.4s                           |
| Patches   | `git apply --check` (both pre-staged)     | Clean against `8007421`                             |
| Ship      | docs-only PR (this audit)                 | No runtime code touched; last-known-green re-proven |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§5).

---

## §7 Final State

- **waiting for human review** — this PR.
- Unblocked only by a maintainer token/account with `workflows: write` (land the §5 one-line `on-pull.yml` patch first), after which `issues: write`-enabled loops can execute §1 labels, §2/§3 closes, and administrative closure of the §4 stale set — which now includes **30+** issues verified implemented across loops 17–25.
- Loop-25 delta vs. loop 24: **#611, #684, #613, #666, #687, #634, #488, #726, #664, #663, #503 promoted to implemented/substantially-done** with first-hand evidence (not-found.tsx set, root build script, paratterate.yml removal, global-error.tsx, barrel exports, strict base.json, ci:check wiring, console elimination, eslint-disable reduction, JSDoc coverage); drift vs. loop 24 identified as **0 commits** (HEAD = loop-24 audit merge) with **zero gate regression** (2207/2207, typecheck 9/9, lint 9/9, build 1/1 re-run green at `8007421`); label matrix re-derived 33/49 with exact-match no-drift confirmation; both pre-staged patches re-verified clean-apply.
- No destructive actions taken; no branches left on remote besides this docs branch; no force-pushes; issue-side writes remain untouched (403).
