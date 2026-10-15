# Issue Manager Audit — 2026-10-15 (loop 19)

## §0 Run Metadata

| Field                 | Value                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-15 (UTC)                                                                                                                   |
| State machine         | Phase 0 → **ISSUE MANAGER MODE** (Phases 1–3 stopped per state machine)                                                            |
| DEFAULT_BRANCH        | `main` (auto-detected; local synced at `cd9df77` = loop-18 PR-handler audit merge)                                                 |
| Phase 0.1 open PRs    | **0** → no PR HANDLER MODE                                                                                                         |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE**                                                                                                    |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 blocked at token 403; STEP 4 delivery blocked on workflow-file push → audit shipped as docs PR)      |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§5) |
| Skills used           | `github-workflow-automation` (GITHUB_TOKEN workflow-file restriction model), `openx-basefly` (repo conventions)                    |
| Subagents             | 0 spawned — all verification first-hand this run (full-suite gates + targeted wiring reads)                                        |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open` → `[]` → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
3. STEP 1: label-matrix recompute → **33 compliant / 49 remediation** — identical to loops 7–18 → **no drift**; apply attempt (`gh issue edit 785 --add-label`) → **403** (§1).
4. STEP 2/3: duplicate clusters D1–D7 re-derived → exact match with loop-17/18; no new clusters from a static issue set.
5. STEP 4: **#496** (only P0) re-verified code-complete (wired into `trpc.ts` via `getLimiter`, `createRateLimitedProcedure`; dedicated test files present). Every other P0/P1 re-verified fixed first-hand (§4).
6. **New this run (loop 19)**: the one remaining _real_ gap — **#670** pnpm consistency in `iterate.yml` — was taken through full repair: branch created from `origin/main`, verified patch `docs/patches/fix-pnpm-consistency-iterate-744.patch` applied cleanly (YAML-valid, matches documented target state), gates re-run fresh (**full suite 2207/2207 in 151 files, typecheck 9/9, lint 9/9, build green**), then `git push` **rejected by GitHub platform**: `refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml without workflows permission` (§5). Branch reverted per contract FAIL-SAFE; fix remains captured in the existing patch + this audit.
7. Verification gates re-run fresh this run: **2207/2207 (151 files)** — one more test than loop 17's 2206; typecheck 9/9, lint 9/9, `pnpm build` 1/1 green.

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–18 → no-drift rule applies.

Remediation breakdown (computed first-hand):

- 25 missing priority only: `789, 788, 787, 786, 785, 731, 729, 728, 727, 726, 725, 724, 723, 722, 721, 720, 719, 668, 636, 634, 632, 631, 630, 628`
- 12 missing category + priority: `755, 754, 753, 752, 751, 749, 748, 744, 697, 635, 595, 670` (670 has P3 but no contract category)
- 12 multi-category: `713, 688, 584, 581, 551, 550, 549, 523, 522, 515, 498, 496, 305` (305 also missing priority)

**Application attempt (first-hand this run):**

```
gh issue edit 785 --add-label "bug"
  → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–18 no-flip-flop rule):**

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

Clusters unchanged from loop 17 (static issue set, no new issues this run):

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
- Re-verified code-complete (below) → repair would be administrative close → **403** → FAIL-SAFE.
- Next actionable gap: **#670** (pnpm in iterate.yml) — the only remaining _real_ code gap found across all 82 issues after first-hand verification.

### #496 — code-complete (evidence, fresh)

- `packages/api/src/distributed-rate-limiter.ts` — `DistributedRateLimiter` + `SyncRateLimiter` (in-memory fallback) implemented (365 lines).
- `packages/api/src/trpc.ts:17,435` — imports `getLimiter`, applies it in `rateLimit()` middleware; `createRateLimitedProcedure` family wired.
- Tests: `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts`, `rate-limiter.test.ts` — all green in the 2207/2207 run.

### #670 — repair attempted, delivery platform-blocked (NEW this run)

1. Branch `fix/issue-670-pnpm-iterate-yml` from `origin/main` (`cd9df77`).
2. `git apply --check docs/patches/fix-pnpm-consistency-iterate-744.patch` → clean; applied.
3. Change (14+/4−): adds `pnpm/action-setup@v6`, `cache: 'pnpm'`, replaces both `npm ci || true` with `pnpm install --frozen-lockfile || true`, fixes cache path `~/.npm`→`~/.pnpm-store` and key `package-lock.json`→`pnpm-lock.yaml`.
4. YAML parse: OK. **Root cause**: repo is pnpm-only (`pnpm-lock.yaml` present, no `package-lock.json`), so `npm ci || true` was a silent no-op — architect/fixer jobs ran with zero workspace deps installed.
5. Gates (fresh, on branch): typecheck **9/9**, lint **9/9**, test **2207/2207 (151 files)**, build **1/1** green.
6. `git merge origin/main` → already up to date.
7. `git push -u origin fix/issue-670-pnpm-iterate-yml` →

```
! [remote rejected] fix/issue-670-pnpm-iterate-yml -> fix/issue-670-pnpm-iterate-yml
  (refusing to allow a GitHub App to create or update workflow `.github/workflows/iterate.yml`
   without `workflows` permission)
```

8. Contract FAIL-SAFE applied: branch reverted and deleted locally; no force-push; patch + audit remain as the durable capture.

**Suggested maintainer action:** apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` with a token/account that has `workflows: write` (or merge a PR from a human fork), then close `#670` and its cluster `D2` (`#305, #595, #584, #744`).

---

## §4 Stale / Already-Implemented Issues (first-hand evidence this run)

| Issue | Claim                                   | Evidence on `main` at `cd9df77`                                                     | Verdict       |
| ----- | --------------------------------------- | ----------------------------------------------------------------------------------- | ------------- |
| #789  | Add React peerDeps in packages/ui       | `packages/ui/package.json` peerDependencies: `next>=14`, `react^19`, `react-dom^19` | Already done  |
| #785  | Duplicate `next` dep in packages/stripe | `packages/stripe/package.json` deps: no `next` entry at all                         | Stale         |
| #786  | Stripe webhook logs partial secret      | `route.ts` logs only booleans/messages; `safeSerializeError` redaction documented   | Already fixed |
| #748  | `.nvmrc` invalid value `20`             | `.nvmrc` = `22.14.0`                                                                | Stale         |
| #720  | `.nvmrc` missing                        | `.nvmrc` exists                                                                     | Stale         |
| #719  | Missing root TypeScript config          | root `tsconfig.json` exists                                                         | Stale         |
| #722  | Env validation at startup               | `createEnv` (@t3-oss) in 4 packages (`apps/nextjs`, `api`, `common`, `auth`)        | Already done  |
| #697  | Corrupted docs formatting               | mojibake grep clean across `docs/**/*.md`; `DX-engineer.md` no duplicate heads      | Already fixed |
| #630  | Pre-commit: add typecheck+test          | `.husky/pre-commit`: typecheck, test, check-deps, lint-staged                       | Already done  |
| #611  | Add `not-found.tsx`                     | `apps/nextjs/src/app/not-found.tsx` exists                                          | Already done  |
| #664  | Replace console.\* in db/stripe w/ pino | Only comment-block examples remain; zero live `console.*` calls                     | Already done  |
| #492  | `sizes` attr for responsive images      | 16 `sizes=` usages; Next/Image throughout; 1 raw `<img>` in mdx-components only     | Largely done  |
| #515  | CSRF protection                         | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` (explicitly references #515)         | Already done  |
| #498  | Role-based admin RBAC                   | `trpc.ts` `isAdmin` middleware: role query + ADMIN_EMAIL migration fallback         | Already done  |
| #550  | apps/nextjs in test coverage            | `vitest.config.ts` includes `apps/nextjs/src/**` in test + coverage                 | Already done  |
| #549  | packages/auth tests                     | `packages/auth/{logger,env,clerk}.test.ts` present                                  | Already done  |
| #551  | k8s router tests                        | `k8s-router.test.ts`, `k8s.test.ts` present                                         | Already done  |
| #501  | Playwright E2E critical journeys        | `tests/e2e/` — 12 specs incl. `critical-flows.spec.ts`                              | Already done  |
| #500  | Clerk auth flow tests                   | `packages/auth/clerk.test.ts` + `tests/e2e/auth.spec.ts`                            | Already done  |
| #486  | OpenTelemetry observability             | `packages/common/src/observability/` present                                        | Likely done   |
| #688  | Next.js middleware.ts                   | `apps/nextjs/src/proxy.ts` (Next 16 middleware rename)                              | Already done  |
| #635  | Developer onboarding guide              | `docs/ONBOARDING.md` exists                                                         | Already done  |

Closing any of these requires issue write → **403 → blocked (§5)**.

---

## §5 Blocked Write Paths (re-confirmed this run)

| Surface              | Operation                          | Result                                                              |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| Issues (comment)     | `gh issue comment 496`             | 403 `Resource not accessible by integration (addComment)`           |
| Issues (labels)      | `gh issue edit 785 --add-label`    | 403 `Resource not accessible by integration (addLabelsToLabelable)` |
| Workflow-file push   | `git push` (iterate.yml change)    | Platform-rejected: GitHub App lacks `workflows` permission          |
| Branch push (non-WF) | `git push` (dry-run, normal files) | **Allowed** — this docs PR is the proof                             |
| `gh pr create`       | —                                  | Allowed (prior loops merged #1561/#1562/#1563)                      |

Root cause: repo Settings → Actions → Workflow permissions is read-only for the integration token; workflow `permissions:` blocks can only further restrict, not elevate. Human maintainer (or a PAT with `issues:write` + `workflows:write`) is required to unblock §1/§2/§3 administrative steps and the #670 patch application.

---

## §6 Fresh Gates (loop 19)

| Gate      | Command                          | Result                                      |
| --------- | -------------------------------- | ------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile` | Done (pnpm 10.28.2)                         |
| Typecheck | `pnpm typecheck`                 | **9/9** successful                          |
| Lint      | `pnpm lint`                      | **9/9** successful                          |
| Test      | `pnpm test`                      | **2207/2207 passed** (151 files, 46.8s)     |
| Build     | `pnpm build`                     | **1/1** successful (Next.js route table OK) |

Note: runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; aligns with open item **#748** (workflows still pin `node-version: "20"`; `.nvmrc` already correct at 22.14.0). Workflow edit to fix that is, again, behind the same `workflows`-permission block (§5).

---

## §7 Final State

- **waiting for human review** — this PR.
- Unblocked only by a maintainer token with `issues:write` (close stale/dups, apply label matrix §1) and `workflows:write` (apply §3 patch for #670, align node versions for #748).
- No destructive actions taken; failed workflow-fix branch reverted cleanly (`dd7a1af` discarded).
