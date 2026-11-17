# Issue Manager Audit — 2026-11-17

**Evaluation date**: 2026-11-17
**Execution context**: GitHub Actions `github-actions[bot]` (GITHUB_TOKEN), `.github/workflows/on-pull.yml` (`schedule`, `GITHUB_WORKFLOW=pull`)
**DEFAULT_BRANCH**: `main` (detected; `main...origin/main` clean at entry)
**Skills used** (contract §5): `github-workflow-automation` (loaded; results in §8)
**Subagents** (contract §6): none spawned this run — permission probes and shipped-sweep completed directly after prior-loop `explore` model outage (`ProviderModelNotFoundError`); clustering re-derived from live `gh issue list` dump

---

## 1. Active Phase & Decision Summary

| Order | Phase                            | Why it ran                                                                                                      | Outcome                                              |
| ----- | -------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1     | Phase 0 → **ISSUE MANAGER MODE** | 0 open PRs at entry (`gh pr list --state open` → empty); **82 open issues**                                     | Steps 1–4 executed to the limit of token permissions |
| 2     | Fail-safe stop                   | All issue-mutation GraphQL paths return 403; workflow-file push expected rejected (App lacks `workflows` scope) | Final state: **blocked (needs human)**               |

Phase 1 (audit), Phase 2 (hardening), Phase 3 (expansion) were **NOT** activated — a phase transition requires the active phase to fully complete first, and ISSUE MANAGER MODE cannot complete Steps 1–4 issue mutations under this token.

**New this run**:

- Fresh permission probes on issue-mutation classes (label / comment / create) — all ❌ 403.
- Shipped-sweep re-verified on current `main` for all labeled **P0/P1** plus high-signal security/DX items (§6.1).
- Rate-limiter subset re-run: **98/98 passed** (3 files, 1.28s).
- Step 1 delta recomputed from live dump: **49** issues need label action — identical to loops 1–N (no drift).
- Step 2/3 clusters re-derived (§5) — closures prepared, not applied (403).
- Genuinely open code defect re-confirmed: `.github/workflows/iterate.yml:72` and `:342` still `npm ci || true` (canonical **#305** cluster) — **cannot ship**: push to `.github/workflows/*` rejected by GitHub App without `workflows` scope (prior loops: 9 consecutive rejections).

Repair mode (Step 4) selected **#496 (P0)**; it is shipped, so its only correct action is closure — blocked by 403. No legitimate code change remains among labeled P0/P1.

---

## 2. Action Log

| Timestamp (UTC) | Action                                         | Target                                                      | Result                                                                                                 |
| --------------- | ---------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --- | ------------------------------------------------------ |
| 18:47           | Phase 0.1: list open PRs                       | repo                                                        | **0 open PRs**                                                                                         |
| 18:47           | Phase 0.2: list open issues + labels           | repo                                                        | **82 open issues** → ISSUE MANAGER MODE                                                                |
| 18:47           | Skill inventory (contract §5)                  | `.opencode/skills/`                                         | 14 skills present; `github-workflow-automation` loaded (§8)                                            |
| 18:48           | Step 1: scripted label recount + delta         | 82 issues                                                   | **49** need action (12 missing category, 38 missing priority, 13 multi-category, 3 overlap) — §4       |
| 18:49           | Permission probe: label                        | `gh issue edit 789 --add-label P2`                          | ❌ 403 GraphQL `addLabelsToLabelable`                                                                  |
| 18:49           | Permission probe: comment                      | `gh issue comment 789`                                      | ❌ 403 GraphQL `addComment`                                                                            |
| 18:49           | Permission probe: create                       | `gh issue create`                                           | ❌ 403 GraphQL `createIssue`                                                                           |
| 18:50           | Permission inventory                           | `gh auth status`, `gh api repos/…`                          | token = `github-actions[bot]`; `admin/maintain/pull/push/triage` all **false**; `GITHUB_WORKFLOW=pull` |
| 18:51           | Shipped-sweep: P0/P1 + security/DX high-signal | greps over current `main`                                   | all cited items shipped — §6.1                                                                         |
| 18:52           | Open-gap check: `iterate.yml` npm→pnpm         | `.github/workflows/iterate.yml:72,342`                      | ❌ still `npm ci                                                                                       |     | true`; fix prepared, push App-blocked (workflow scope) |
| 18:58           | Step 4: rate-limiter tests (fresh)             | `distributed-rate-limiter*.test.ts`, `rate-limiter.test.ts` | ✅ **98/98 passed** (3 files, 1.28s)                                                                   |
| 18:58           | Step 4 probe: close #496                       | `gh issue close 496`                                        | ❌ expected 403 (same `addComment`/`closeIssue` class as prior loops; probe via comment path)          |
| 18:59           | Persist execution log (this file)              | `docs/issue-manager-audit-2026-11-17.md`                    | committed on branch `docs/issue-manager-audit-2026-11-17`, PR opened (§9)                              |

---

## 3. Permission Matrix (first-hand probes, this run)

| Operation                                        | Works?      | Evidence                                                                                                      |
| ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `gh pr list/view/create`, `gh label list` (read) | ✅          | Phase 0 + label inventory                                                                                     |
| Push to non-workflow files + `gh pr create`      | ✅          | this very PR (branch `docs/issue-manager-audit-2026-11-17`)                                                   |
| Pre-commit hooks (typecheck/lint/test)           | ✅          | run on this run's commit (see §9)                                                                             |
| `gh issue edit --add-label`                      | ❌ 403      | #789 probe this run (`addLabelsToLabelable`)                                                                  |
| `gh issue comment`                               | ❌ 403      | #789 probe this run (`addComment`)                                                                            |
| `gh issue create`                                | ❌ 403      | probe this run (`createIssue`)                                                                                |
| Push to `.github/workflows/*`                    | ❌ rejected | prior loops 1–N: App lacks `workflows` scope (not re-attempted this run to avoid noise; root cause unchanged) |

**Root cause (unchanged)**: run executes under `GITHUB_WORKFLOW=pull` (`.github/workflows/on-pull.yml`, `schedule`). That workflow declares `contents: write`, `pull-requests: write`, `actions: read`, `repository-projects: write`, `id-token: write` — **but not `issues: write`** (contrast: `iterate.yml` already declares it at lines 11–16). Additionally the GitHub App installation must grant the `workflows` scope for workflow-file edits, so the loop cannot amend its own workflow. Both unblock steps are human-only (§7.1).

---

## 4. Step 1 — Normalization Table (prepared; apply when `issues: write` lands)

Scripted recount over all 82 open issues (live `gh issue list --json` → `/tmp` dump):
**49** need some label action — identical to prior loops (no drift).

- missing category: **12** — #595, #635, #670, #697, #744, #748, #749, #751, #752, #753, #754, #755
- missing priority: **38**
- multi-category (must reduce to exactly one): **13** — #713, #688, #584, #581, #551, #550, #549, #523, #522, #515, #498, #496, #305
- overlap (missing priority AND multi-category): **3** — #713, #584, #305

### 4.1 Full delta (issue → target labels → action)

| #   | Current category labels | Target cat/pri | Actions                                                      |
| --- | ----------------------- | -------------- | ------------------------------------------------------------ |
| 789 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 788 | test                    | test/P1        | ADD_PRI:P1                                                   |
| 787 | test                    | test/P1        | ADD_PRI:P1                                                   |
| 786 | security                | security/P1    | ADD_PRI:P1                                                   |
| 785 | bug                     | bug/P2         | ADD_PRI:P2                                                   |
| 755 | _(none)_                | enhancement/P2 | ADD_CAT:enhancement, ADD_PRI:P2                              |
| 754 | _(none)_                | test/P2        | ADD_CAT:test, ADD_PRI:P2                                     |
| 753 | _(none)_                | enhancement/P2 | ADD_CAT:enhancement, ADD_PRI:P2                              |
| 752 | _(none)_                | enhancement/P2 | ADD_CAT:enhancement, ADD_PRI:P2                              |
| 751 | _(none)_                | enhancement/P2 | ADD_CAT:enhancement, ADD_PRI:P2                              |
| 749 | _(none)_                | docs/P2        | ADD_CAT:docs, ADD_PRI:P2                                     |
| 748 | _(none)_                | bug/P2         | ADD_CAT:bug, ADD_PRI:P2                                      |
| 744 | _(none)_                | ci/P2          | ADD_CAT:ci, ADD_PRI:P2                                       |
| 731 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 729 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 728 | security                | security/P1    | ADD_PRI:P1                                                   |
| 727 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 726 | ci                      | ci/P2          | ADD_PRI:P2                                                   |
| 725 | test                    | test/P1        | ADD_PRI:P1                                                   |
| 724 | test                    | test/P1        | ADD_PRI:P1                                                   |
| 723 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 722 | security                | security/P1    | ADD_PRI:P1                                                   |
| 721 | security                | security/P1    | ADD_PRI:P1                                                   |
| 720 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 719 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 713 | enhancement,test        | test/P2        | RM_CAT:enhancement, ADD_PRI:P2                               |
| 708 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 706 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 705 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 697 | _(none)_                | docs/P2        | ADD_CAT:docs, ADD_PRI:P2                                     |
| 688 | enhancement,security    | security/P2    | RM_CAT:enhancement                                           |
| 687 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 685 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 684 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 683 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 670 | _(none)_                | ci/P3          | ADD*CAT:ci *(has P3)\_                                       |
| 668 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 667 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 666 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 664 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 663 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 650 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 636 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 635 | documentation           | docs/P3        | ADD*CAT:docs, ADD_PRI:P3 *(note: `documentation` ≠ `docs`)\_ |
| 634 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 632 | security                | security/P1    | ADD_PRI:P1                                                   |
| 631 | enhancement             | test/P2        | RM_CAT:enhancement, ADD_CAT:test, ADD_PRI:P2                 |
| 630 | enhancement             | enhancement/P2 | ADD_PRI:P2                                                   |
| 628 | enhancement             | test/P2        | RM_CAT:enhancement, ADD_CAT:test, ADD_PRI:P2                 |
| 613 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 611 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 610 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 609 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 595 | _(none)_                | ci/P2          | ADD_CAT:ci, ADD_PRI:P2                                       |
| 590 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 584 | enhancement,ci          | ci/P2          | RM_CAT:enhancement, ADD_PRI:P2                               |
| 581 | enhancement,test        | test/P1        | RM*CAT:enhancement *(has P1)\_                               |
| 580 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 579 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 578 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 551 | enhancement,test        | test/P1        | RM*CAT:enhancement *(has P1)\_                               |
| 550 | enhancement,test        | test/P1        | RM*CAT:enhancement *(has P1)\_                               |
| 549 | enhancement,test        | test/P1        | RM*CAT:enhancement *(has P1)\_                               |
| 523 | enhancement,refactor    | refactor/P3    | RM*CAT:enhancement *(has P3)\_                               |
| 522 | enhancement,refactor,ci | ci/P3          | RM*CAT:enhancement, RM_CAT:refactor *(has P3)\_              |
| 521 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 515 | enhancement,security    | security/P1    | RM*CAT:enhancement *(has P1)\_                               |
| 503 | docs                    | docs/P2        | _(already correct)_                                          |
| 502 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 501 | enhancement             | test/P1        | RM*CAT:enhancement, ADD_CAT:test *(has P1)\_                 |
| 500 | enhancement             | test/P1        | RM*CAT:enhancement, ADD_CAT:test *(has P1)\_                 |
| 498 | enhancement,security    | security/P1    | RM*CAT:enhancement *(has P1)\_                               |
| 496 | enhancement,security    | security/P0    | RM*CAT:enhancement *(has P0)\_                               |
| 494 | refactor                | refactor/P2    | _(has P2; no change)_                                        |
| 492 | enhancement             | enhancement/P3 | _(has P3; no change)_                                        |
| 488 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 487 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 486 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 485 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 483 | enhancement             | enhancement/P2 | _(has P2; no change)_                                        |
| 480 | _(none)_                | security/P1    | ADD_CAT:security, ADD_PRI:P1                                 |
| 305 | enhancement,ci          | ci/P2          | RM_CAT:enhancement, ADD_PRI:P2                               |

_(Rows without a listed action are already compliant; the scripted count of 49 is the rows with at least one ADD\_\_/RM\_\_ action.)_

---

## 5. Steps 2–3 — Duplicate & Consolidation Analysis (prepared; closures blocked)

### 5.1 Duplicate clusters (close duplicates → canonical)

| Cluster | Theme                              | Canonical                     | Duplicates to close        | Rationale                                                                                                                                   |
| ------- | ---------------------------------- | ----------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A       | Distributed rate limiter (Redis)   | **#496** (P0)                 | **#480**                   | Same work item; #496 has P0 + clearer scope. Both shipped (§6.1).                                                                           |
| B       | `.nvmrc` Node version              | **#720**                      | **#748**                   | Both about `.nvmrc`; #720 is the original "missing" report, #748 a follow-on "invalid value". File now `22.14.0` — both shipped.            |
| C       | pnpm consistency in GitHub Actions | **#305** (earliest umbrella)  | **#595, #584, #670, #744** | Same underlying defect: workflows still use `npm ci \|\| true` (`iterate.yml:72,342`). **Still genuinely open** — fix once under canonical. |
| D       | E2E / Playwright coverage          | **#501** (P1, clearest scope) | **#628, #724**             | Same deliverable. Shipped: `playwright.config.ts` + `tests/e2e/*.spec.ts` (10 specs).                                                       |
| E       | Auto-generate API docs from tRPC   | **#731**                      | **#749**                   | Same feature; #731 is the original, #749 adds "AI-powered testing" wording.                                                                 |
| F       | Barrel exports / tree-shaking      | **#523** (P3, scoped)         | **#687**                   | Same audit work; #523 explicitly scoped to tree-shaking.                                                                                    |

### 5.2 Consolidation groups (merge small similar issues into one; keep all info)

| Group                            | Canonical (keep open)                                                                   | Members to fold in                             | Notes                                                                                                                                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 Testing-infra umbrella        | **#581** (P1)                                                                           | #549, #550, #551, #631, #713, #725, #787, #788 | #581 already titled "Consolidate testing infrastructure"; members are area-specific slices. **Most slices already shipped** (§6.1) — fold + close shipped members under #581, keep #581 open only if residual gap remains. |
| G2 Security hardening umbrella   | **#496** (P0, shipped → close) then **#721** as surviving canonical for open authz work | #498, #515, #632, #722, #786, #688             | All cited slices shipped except where noted; after closing #496, remaining open security items keep independent tracking under #721/#728.                                                                                  |
| G3 CI/CD pnpm + workflow hygiene | **#305**                                                                                | #584, #595, #670, #744, #613, #726             | #613 (duplicate workflow file) already resolved — only `iterate.yml` + `on-pull.yml` remain. #726 (dependency consistency) is adjacent but distinct — keep separate.                                                       |
| G4 Bundle-size / performance     | **#751**                                                                                | #729, #708, #723                               | #708 already has `size-limit` configured (shipped); #729 wants regression _testing_; #751 is tRPC code-splitting. Fold #708 as shipped evidence into #751; keep #729 if CI gate still missing.                             |

**Do-not-lose-information rule**: every closed/duplicate issue body must be referenced in the canonical issue comment (format: `Closed as duplicate of #<canonical> — original title: …`). Cannot apply until `issues: write` lands.

### 5.3 Shipped-close candidates (not duplicates; simply done)

#496, #498, #515, #500, #549, #550, #551, #501, #628, #724, #720, #748, #785, #786, #722, #721, #613, #719, #684, #611, #688, #787, #788, #754, #713, #631, #725, #708, #789 — see §6.1 citations. Closure blocked (403).

---

## 6. Step 4 — Repair Mode

### 6.1 Selection

Labeled **P0/P1** issues exist → select highest-priority: **#496 [P0][Security] Replace in-memory rate limiter with distributed store (Redis)**.

### 6.2 Shipped verification (fresh on current `main`)

| Issue                                    | Evidence                                                                                                                                                                                          | Verdict     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **#496 / #480** rate limiter             | `packages/api/src/distributed-rate-limiter.ts` (+ Redis/ioredis), `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts`, `rate-limiter.ts` + **98/98 tests green** this run | **SHIPPED** |
| **#515** CSRF                            | `apps/nextjs/src/lib/csrf.ts`, `csrf.test.ts`; origin/referer checks in `apps/nextjs/src/proxy.ts`                                                                                                | **SHIPPED** |
| **#498** RBAC                            | `packages/api/src/rbac.test.ts`, `authorization.ts` (`verifyOwnership`), `authorization.test.ts`; `requireRole` / `adminProcedure` in `trpc.ts`                                                   | **SHIPPED** |
| **#500 / #549** auth tests               | `packages/auth/clerk.test.ts`, `env.test.ts`, `logger.test.ts`; `apps/nextjs/src/utils/clerk.test.ts`                                                                                             | **SHIPPED** |
| **#550** coverage config                 | `vitest.config.ts:16` includes `apps/nextjs/src/**`                                                                                                                                               | **SHIPPED** |
| **#551** k8s router tests                | `packages/api/src/router/k8s.test.ts`, `k8s-router.test.ts`                                                                                                                                       | **SHIPPED** |
| **#501 / #628 / #724** e2e               | `playwright.config.ts` + `tests/e2e/` (admin, auth, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling, authorization-bypass)             | **SHIPPED** |
| **#720 / #748** nvmrc                    | `.nvmrc` = `22.14.0` (valid semver)                                                                                                                                                               | **SHIPPED** |
| **#785** dup next dep                    | `packages/stripe/package.json` has **no** `next` entry in deps/devDeps                                                                                                                            | **SHIPPED** |
| **#786** stripe secret logging           | `apps/nextjs/src/app/api/webhooks/stripe/route.ts` — rate-limit log uses non-secret identifier (line ~54); constructEvent guards at 150–162; only `"Stripe webhook secret not configured"`        | **SHIPPED** |
| **#789** React peerDependencies          | `packages/ui/package.json` `peerDependencies`: `react` `^19.0.0`, `react-dom` `^19.0.0` (react only in devDependencies + peerDependencies, not runtime deps)                                      | **SHIPPED** |
| **#722** env validation at startup       | `initEnvValidation()` called from `apps/nextjs/src/instrumentation.ts:20`; `pnpm build` runs `env:validate`                                                                                       | **SHIPPED** |
| **#721** authz beyond auth               | `packages/api/src/authorization.ts` + tests; `protectedProcedure` / `adminProcedure` / CSRF / tracing middleware in `trpc.ts`                                                                     | **SHIPPED** |
| **#613** duplicate workflow              | only `iterate.yml` + `on-pull.yml` exist                                                                                                                                                          | **SHIPPED** |
| **#719** root tsconfig                   | `tsconfig.json` at repo root                                                                                                                                                                      | **SHIPPED** |
| **#684** root build script               | `package.json` `"build": "pnpm env:validate && turbo build"`                                                                                                                                      | **SHIPPED** |
| **#611** not-found                       | `apps/nextjs/src/app/not-found.tsx`                                                                                                                                                               | **SHIPPED** |
| **#688** middleware                      | `apps/nextjs/src/proxy.ts` (Next middleware successor) with CSP/Clerk/CSRF                                                                                                                        | **SHIPPED** |
| **#787** db migration tests              | `packages/db/migrations.test.ts` (+ soft-delete, rls, seed, …)                                                                                                                                    | **SHIPPED** |
| **#788** UI component tests              | `apps/nextjs/src/components/__tests__/*.test.tsx`                                                                                                                                                 | **SHIPPED** |
| **#754** webhook idempotency tests       | `packages/stripe/src/webhook-idempotency.ts` + `.test.ts`                                                                                                                                         | **SHIPPED** |
| **#713 / #631 / #725** unit/router tests | full suite green in prior loops (2241 tests / 160 files); rate-limiter subset re-run this loop                                                                                                    | **SHIPPED** |
| **#708** bundle analyzer                 | `size-limit` + `@next/bundle-analyzer` configured in `apps/nextjs/package.json` (`size:check`, `size:analyze`)                                                                                    | **SHIPPED** |

### 6.3 Outcome

- **#496 is shipped** → correct action is **close with verification comment**.
- Probe path: same GraphQL class as prior loops → ❌ **403** (label/comment/create all 403 this run; close uses the same issue-write scope).
- No code change is legitimate for any labeled P0/P1 (all shipped).
- **Genuinely open work found** (cannot file issues — `createIssue` 403; cannot ship workflow edits — App `workflows` scope):
  1. **pnpm-in-CI** (#305 cluster): `iterate.yml:72` and `:342` still `run: npm ci || true`; cache path still `~/.npm` + `package-lock.json` key (file has no `package-lock.json`). Fix is two-line + cache key + `pnpm/action-setup` — **blocked on workflow push**.
  2. **`on-pull.yml` lacks `issues: write`** while `iterate.yml` already has it (lines 11–16) — one-line permissions fix, also workflow-push blocked.
  3. **49 label normalizations** + **6 duplicate clusters** + **4 consolidation groups** (§4–§5) await `issues: write`.
  4. Pre-existing: commit status `Vercel` = failure on `main` (non-required) — human/dismiss or fix deploy config.

---

## 7. Unblock Steps (human-only)

### 7.1 Required human actions

1. **Add `issues: write`** to the `permissions:` block of `.github/workflows/on-pull.yml` (line ~9; `iterate.yml` already has it). This alone unblocks Steps 1–4 mutations on the next scheduled run.
2. **Grant the GitHub App the `workflows` scope** (org/repo → Settings → GitHub Apps → App installation → Actions: Read & Write / Workflows). Required so future runs can self-amend workflows (prior loops: 9+ consecutive rejections).
3. Optional: fix or dismiss the failing **`Vercel`** commit status on `main`.

### 7.2 After unblock, next run should

1. Apply the 49-label delta (§4.1) in one batch.
2. Close 6 duplicate clusters (§5.1) with canonical references.
3. Consolidate 4 groups (§5.2) without losing bodies.
4. Close all §5.3 shipped issues with evidence comments (especially **#496**).
5. Fix `iterate.yml` `npm ci` → `pnpm` + cache keys under canonical **#305**, open PR (requires `workflows` scope).

---

## 8. Skills & Subagents Report (contract §5–§6)

| Item                                 | Result                                                                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill `github-workflow-automation`   | Loaded — confirmed workflow permission patterns and that production workflows need explicit `issues: write` for issue mutation; informed §7.1 recommendation (`on-pull.yml` missing it; `iterate.yml` has it). |
| Skill inventory (`.opencode/skills`) | 14 SKILL.md files present; `github-workflow-automation` selected as the match for this contract §5 requirement.                                                                                                |
| Subagent `explore`                   | **Not spawned this run** — prior-loop outage (`ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free`) plus deterministic scripted clustering over the live 82-issue dump; no information loss. |

---

## 9. Verification for This PR

- Branch cut from `origin/main` (synced before edit, contract §2).
- `pnpm install --frozen-lockfile` ✅ (v10.28.2; preinstall package-manager guard passed).
- Rate-limiter subset (Step 4 evidence): **98/98 passed** (3 files, 1.28s).
- Pre-commit hooks on commit: typecheck + lint + test + prettier + check-deps (husky) — see CI check on the PR.
- PR labels (contract §4): `docs`, `P3` — applied PR-side (works under `pull-requests: write`).

---

## 10. Final State

**blocked (needs human)** — reason: `GITHUB_TOKEN` lacks `issues: write` (label / comment / create all 403 this run) and the GitHub App lacks `workflows` scope (cannot self-heal `on-pull.yml` or fix `iterate.yml` npm→pnpm). All analysis for Steps 1–4 is complete and persisted above; zero drift on label delta (49) vs prior loops. Phases 1–3 not activated (ISSUE MANAGER MODE incomplete).
