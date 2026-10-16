# Issue Manager Audit — 2026-10-16 (loop 21)

## §0 Run Metadata

| Field                 | Value                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-16 15:05–15:27 UTC                                                                                                             |
| State machine         | Phase 0 → **ISSUE MANAGER MODE** (Phases 1–3 stopped per state machine)                                                                |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `e828d01` = PR #1567 merge)                                                                           |
| Phase 0.1 open PRs    | **0** → no PR HANDLER MODE                                                                                                             |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (identical set to loop 20 — no drift)                                                                  |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–3 blocked at token 403; STEP 4 completed as verification-only — all P0/P1 proven done or platform-blocked) |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403; workflow-file pushes remain platform-blocked (§5)     |
| Skills used           | `github-workflow-automation` (GITHUB_TOKEN permission model, workflow-file push restrictions)                                          |
| Subagents             | 0 spawned — all verification first-hand this run (targeted greps + reads + test runs; no parallelizable research remained)             |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open` → `[]` → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped.
3. STEP 1: label-matrix recomputed first-hand → **33 compliant / 49 remediation** — identical to loops 7–20 → **no drift**; apply attempt (`gh issue edit 789 --add-label "P2"` and REST `POST /issues/789/labels`) → both **403** (§1, §5).
4. STEP 2/3: duplicate clusters D1–D7 re-derived from the static issue set → exact match with loops 17–20 (§2).
5. STEP 4: **#496** (only P0) re-verified code-complete at `e828d01` and its rate-limiter test suite executed fresh: **54/54 passing** (§3). Administrative close → 403 → FAIL-SAFE.
6. **New verifications this run (loop 21)**: two previously-unverified P1s were audited first-hand and both are **already implemented**:
   - **#721** (explicit authorization checks): `packages/api/src/authorization.ts` (209 lines: `verifyOwnership`, `verifyOwnershipWithFetch`, `createOwnershipVerifier`) + `requireRole` middleware and `createRoleBasedProcedure(role)` in `packages/api/src/trpc.ts:420-423` + `packages/api/src/rbac.test.ts` (RBAC behavioral suite, green).
   - **#632** (sensitive data in error logging): `packages/api/src/sensitive-data-logging.test.ts` (codebase-wide scan for password/secret/token/API-key/PII patterns) — **13/13 tests green** combined with `rbac.test.ts`.
7. **#786** (Stripe webhook logs partial secret) re-spot-checked: `apps/nextjs/src/app/api/stripe/webhook/route.ts` contains **no** `slice(-8)` / secret logging → already fixed (confirms loop 20).
8. **#755** (composite index) evaluated as repair candidate and **rejected under FAIL-SAFE**: the issue self-declares "Priority: Low" and its acceptance criteria require live-database `EXPLAIN ANALYZE` measurements unavailable in this environment — no guess made.
9. **#728** (security scanning workflows in CI) confirmed **platform-blocked**: any implementation is a `.github/workflows/` file change; GitHub App lacks `workflows` permission (loops 19/20) → cannot ship from inside the loop.
10. FAIL-SAFE tracking issue creation attempted (`gh issue create` with `chore`+`P1`) → **403 `createIssue`** → blocked; this audit + the pre-staged patches remain the durable capture.
11. Pre-staged patches re-validated against current main (`e828d01`): `docs/patches/on-pull-issues-write-permission.patch` → **clean apply**; `docs/patches/fix-pnpm-consistency-iterate-744.patch` → **clean apply**.
12. Full green baseline re-established first-hand this run: **typecheck 9/9, lint 9/9, test 2207/2207 (151 files), build 1/1** — matches loop 19's baseline exactly → no code drift.

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82):** **33 compliant / 49 remediation** — exact match with loops 7–20 → no-drift rule applies.

Remediation breakdown (recomputed first-hand from `gh issue list`):

- 25 missing priority only: `789, 788, 787, 786, 785, 731, 729, 728, 727, 726, 725, 724, 723, 722, 721, 720, 719, 668, 636, 635, 634, 632, 631, 630, 628`
- 12 missing category + priority: `755, 754, 753, 752, 751, 749, 748, 744, 697, 595` plus `635` (has legacy `documentation` label, not the contract `docs` label) and `670` (has P3 but no contract category)
- 13 multi-category: `713, 688, 584, 581, 551, 550, 549, 523, 522, 515, 498, 496, 305` (305 also missing priority)

**Application attempts (first-hand this run, both surfaces):**

```
gh issue edit 789 --add-label "P2"
  → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=P2"
  → REST 403: Resource not accessible by integration
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–21 no-flip-flop rule):**

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

Clusters unchanged from loops 17–20 (static issue set, no new issues this run):

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
- Highest-priority **unverified** P1s from loop 20's table were audited this run: **#721** and **#632** — both **already implemented** (below). Remaining P1 `#728` is a workflow-file change → platform-blocked (§5).
- **#755** evaluated and rejected as the repair target (FAIL-SAFE: self-declared Low priority; acceptance criteria need live-DB `EXPLAIN ANALYZE` — cannot be satisfied deterministically in this environment).
- Net: **no safely-implementable issue remains**; this loop's deliverable is verification evidence + this audit (established loop 17–20 pattern).

### #496 — code-complete (evidence, fresh at `e828d01`)

- `packages/api/src/trpc.ts:17,19` — imports `getLimiter` from `./distributed-rate-limiter`.
- `packages/api/src/trpc.ts:435` — `const limiter = getLimiter(endpointType)` applied in `rateLimit()` middleware.
- `packages/api/src/trpc.ts:486` — `createRateLimitedProcedure` exported and wired.
- `packages/api/src/distributed-rate-limiter.ts` (365 lines) — `DistributedRateLimiter` (Redis sliding window), `InMemoryRateLimiter` (fallback), `SyncRateLimiter` (graceful degradation wrapper), `getLimiter` factory.
- Env configuration present: `.env.example:124-133` (`REDIS_URL`, `RATE_LIMIT_*` per endpoint type); docs: `docs/redis-setup.md`.
- **Tests executed this run: `rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts` → 54/54 passing.**

### #721 — ALREADY IMPLEMENTED (new verification, loop 21)

Acceptance criteria vs. code:

| Criterion                            | Evidence                                                                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Explicit authorization middleware    | `requireRole(role)` middleware in `packages/api/src/trpc.ts` (DB role lookup, audit logging, UNAUTHORIZED/FORBIDDEN errors)                                       |
| Role-based access control system     | `Role` enum (USER/ADMIN) from `@saasfly/db`; `createRoleBasedProcedure(role)` factory (`trpc.ts:420-423`)                                                         |
| Authorization guard for admin routes | `adminProcedure` composed with role enforcement; audit-log tests in `rbac.test.ts`                                                                                |
| Authorization checks in TRPC context | `role` field in context; `packages/api/src/authorization.ts` (209 lines: `verifyOwnership`, `verifyOwnershipWithFetch`, `createOwnershipVerifier`)                |
| Tests                                | `packages/api/src/rbac.test.ts` — deny UNAUTHORIZED, deny FORBIDDEN (mismatch + missing role + DB error), allow on match, audit-log emission — **green this run** |

### #632 — ALREADY IMPLEMENTED (new verification, loop 21)

| Criterion                          | Evidence                                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All logger calls audited           | `packages/api/src/sensitive-data-logging.test.ts` scans codebase source files                                                                                       |
| No PII / API keys / tokens in logs | Pattern set covers password, secret, token, API/private/access/refresh keys, bearer, authorization, Clerk/Stripe secrets, DB URLs, SSN, credit card, CVV, .env refs |
| Regression test added              | 4 scan tests + supporting cases — **13/13 green this run** (combined run with `rbac.test.ts`)                                                                       |
| Logger call sites spot-checked     | `packages/api/src/authorization.ts` logger.warn calls log only `requestId`/`userId`/`resourceType`/`resourceId` + `security:true` reason codes — no secrets         |

### #786 — already fixed (re-confirmed, loop 21)

- `apps/nextjs/src/app/api/stripe/webhook/route.ts`: no `slice(-8)`, no `STRIPE_WEBHOOK_SECRET` logging; grep over `packages/api/src` + `packages/stripe/src` for secret/token/key-bearing `logger.*` calls returns only the sanitized `authorization.ts` warnings above.

### on-pull.yml `issues: write` — repair still platform-blocked (carried from loop 20)

1. Pre-staged patch: `docs/patches/on-pull-issues-write-permission.patch` — **re-`git apply --check` clean against `e828d01` this run** (1 insertion at the `permissions:` block of `on-pull.yml`).
2. Companion patch: `docs/patches/fix-pnpm-consistency-iterate-744.patch` — **also clean against `e828d01`** (pnpm replacement for `npm ci || true` at `iterate.yml:72,342`; the npm usage was re-verified present this run).
3. Both remain unshippable from inside the loop: GitHub App cannot create/update any file under `.github/workflows/` without the `workflows` permission (loops 19 & 20 push rejections).

**Suggested maintainer action (single highest-leverage fix):** have a human account (or a PAT/GitHub App token with `workflows: write`) land `docs/patches/on-pull-issues-write-permission.patch` — one line in `on-pull.yml`. That alone unblocks STEP 1/2/3 for every subsequent loop (labels, comments, closes, creates). Second priority: apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` (closes #670 and cluster D2), then administratively close the stale/duplicate sets in §2/§4.

---

## §4 Stale / Already-Implemented Issues

Loop-20 table carries forward; **fresh spot-checks this run** (all at `e828d01`) re-confirm every entry checked:

| Issue | Claim                                   | Verdict (fresh loop-21 evidence)                                                              |
| ----- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| #789  | React peerDeps in packages/ui           | Already done — `peerDependencies: {next: ">=14.0.0", react: "^19.0.0", react-dom: "^19.0.0"}` |
| #785  | Duplicate `next` dep in packages/stripe | Stale — no `next` dependency present                                                          |
| #786  | Stripe webhook logs partial secret      | Already fixed — no secret logging in webhook route (re-confirmed)                             |
| #748  | `.nvmrc` invalid value `20`             | Stale (now `22.14.0`)                                                                         |
| #720  | `.nvmrc` missing                        | Stale (file exists, `22.14.0`)                                                                |
| #719  | Missing root TypeScript config          | Stale — root `tsconfig.json` exists                                                           |
| #722  | Env validation at startup               | Already done (loop 19/20; `pnpm env:validate` gates `pnpm build`)                             |
| #697  | Corrupted docs formatting               | Already fixed                                                                                 |
| #630  | Pre-commit: add typecheck+test          | Already done — `.husky/pre-commit` runs typecheck+test+check-deps+lint-staged                 |
| #611  | Add `not-found.tsx`                     | Already done — `apps/nextjs/src/app/not-found.tsx` exists                                     |
| #664  | Replace console.\* with pino            | Already done — only commented-out doc examples remain in `packages/stripe`                    |
| #492  | `sizes` attr for responsive images      | Largely done                                                                                  |
| #515  | CSRF protection                         | Already done                                                                                  |
| #498  | Role-based admin RBAC                   | Already done (reinforced by loop-21 #721 verification: `requireRole` + RBAC)                  |
| #721  | Explicit authorization checks           | **Already done (NEW loop-21 verification — §3)**                                              |
| #632  | Sensitive data in error logging         | **Already done (NEW loop-21 verification — §3)**                                              |
| #550  | apps/nextjs in test coverage            | Already done                                                                                  |
| #549  | packages/auth tests                     | Already done                                                                                  |
| #551  | k8s router tests                        | Already done                                                                                  |
| #501  | Playwright E2E critical journeys        | Already done                                                                                  |
| #500  | Clerk auth flow tests                   | Already done                                                                                  |
| #486  | OpenTelemetry observability             | Likely done                                                                                   |
| #688  | Next.js middleware.ts                   | Already done                                                                                  |
| #635  | Developer onboarding guide              | Already done — `docs/ONBOARDING.md` referenced from README                                    |
| #496  | Distributed Redis rate limiter          | Already done — **54/54 rate-limiter tests green this run (§3)**                               |

Closing any of these requires issue write → **403 → blocked (§5)**.

---

## §5 Blocked Write Paths (re-confirmed this run)

| Surface               | Operation                                     | Result                                                                              |
| --------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Issues (labels, GQL)  | `gh issue edit 789 --add-label P2`            | 403 `Resource not accessible by integration (addLabelsToLabelable)`                 |
| Issues (labels, REST) | `POST /repos/cpa03/basefly/issues/789/labels` | 403 `Resource not accessible by integration`                                        |
| Issues (comment)      | `gh issue comment 786 --body …`               | 403 `Resource not accessible by integration (addComment)`                           |
| Issues (create)       | `gh issue create` (FAIL-SAFE tracker)         | 403 `Resource not accessible by integration (createIssue)` — **NEW probe this run** |
| Workflow-file push    | `git push` (`on-pull.yml` +1 line)            | Platform-rejected: GitHub App lacks `workflows` permission (loop 20)                |
| Workflow-file push    | `git push` (`iterate.yml` pnpm patch)         | Platform-rejected: same error (loop 19)                                             |
| Branch push (non-WF)  | `git push` (normal files)                     | **Allowed** — probe branch create+delete succeeded; this docs PR is the proof       |
| `gh pr create`        | —                                             | Allowed (prior loops merged #1561/#1562/#1563/#1564/#1567)                          |

Root cause (two independent platform rules, both re-confirmed this run):

1. **Token scope**: `on-pull.yml`'s `permissions:` block omits `issues: write`, so the hourly issue-manager token has no issue-side write scopes. Fix = the one-line patch in §3.
2. **Workflow-file push lock**: the Actions `GITHUB_TOKEN` (a GitHub App token) cannot create/update any file under `.github/workflows/` unless the app holds the `workflows` permission for this repository. This blocks shipping fix (1) from inside the loop itself — a human maintainer must land it.

---

## §6 Gates (loop 21)

| Gate      | Command                                                | Result                                                                                                  |
| --------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Tests     | `pnpm test`                                            | **2207/2207 passed (151 files)**, 49.14s — matches loop-19 baseline exactly                             |
| Typecheck | `pnpm typecheck`                                       | **9/9 successful** (turbo, cached from `ci:check` run this session)                                     |
| Lint      | `pnpm lint`                                            | **9/9 successful** (turbo, cached from `ci:check` run this session)                                     |
| Deps      | `pnpm ci:check` (incl. `check-deps`, `check:circular`) | **exit 0**                                                                                              |
| Build     | `pnpm build` (env:validate + turbo build)              | **1/1 successful**, 39.6s                                                                               |
| Patches   | `git apply --check` (both pre-staged patches)          | Clean against `e828d01`                                                                                 |
| Ship      | docs-only PR (this audit)                              | No runtime code touched; last-known-green = this run: **2207/2207, typecheck 9/9, lint 9/9, build 1/1** |

Runner Node is v20.20.2 while `package.json` engines want `>=22` — warning only; workflow node-pin alignment remains behind the same `workflows`-permission block (§5), tracked as #748.

---

## §7 Final State

- **waiting for human review** — this PR.
- Unblocked only by a maintainer token/account with `workflows: write` (land §3 one-line `on-pull.yml` patch first — it unlocks issue writes for every future loop) and then `issues: write`-enabled loops can execute §1 label matrix, §2/§3 closes, and administrative closure of the §4 stale set.
- Loop-21 delta vs. loop 20: #721 and #632 promoted from "unverified" to "already implemented" with first-hand evidence; #786/#496 re-confirmed with executed tests (54/54); `gh issue create` added to the blocked-surface table; full 2207-test suite re-run green at `e828d01`.
- No destructive actions taken; disposable permission-probe branch created and deleted (never left on remote); no force-pushes.
