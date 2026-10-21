# Issue Manager Audit — 2026-10-21 (loop 38)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-21 15:40 – 16:05 UTC                                                                                                                                                                                           |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                  |
| DEFAULT_BRANCH        | `main` (auto-detected)                                                                                                                                                                                                 |
| Local HEAD at entry   | `dec0f11` = `origin/main` (loop-37 audit merge, PR #1594) — verified equal at entry                                                                                                                                    |
| Phase 0.1 open PRs    | **0** → fell through to Phase 0.2                                                                                                                                                                                      |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (same set as loops 7–37 — no drift)                                                                                                                                                    |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                   |
| Final state           | **waiting for human review** — PR carrying this audit; all issue-side writes remain 403 and workflow-file pushes remain platform-blocked (§4)                                                                          |
| Skills used           | `github-workflow-automation` (gh/branch/PR autonomous patterns; runner + concurrency standards) · `commit-message` skill present in `.opencode/skills` but invoked via repo conventional-commit style (`docs:` prefix) |
| Subagents             | Not spawned — every step this run was a permission probe, a verification gate, or an evidence check requiring first-hand output; delegation would have duplicated the evidence set                                     |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **0 open PRs** → fell through to Phase 0.2.
2. **Phase 0.2**: `gh issue list --state open --limit 500` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run).
3. **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33–37** → no drift.
4. **STEP 1**: label matrix independently re-derived → structural partition **exact match** with loops 7–37 (33 compliant / 49 remediation; §1). Carried 39-row payload executed → **0 ok / 39 fail**, all 403 (§4). Payload carried verbatim per no-flip-flop rule.
5. **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent code inspection this run (§2); closes/comments require issue write → **403 → blocked**.
6. **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.19s). Repair action = administrative close → **403** → FAIL-SAFE.
7. **STEP 4 (contingency)**: **#670** (D2 canonical) fix **re-attempted first-hand**: `docs/patches/fix-pnpm-consistency-iterate-744.patch` applied cleanly to `iterate.yml`, YAML validated, committed on `fix/ci-pnpm-iterate-670-loop38` (pre-commit hooks ran typecheck+test+check-deps — all green), **push rejected again**: GitHub App cannot update workflow files without `workflows` permission (§5.1). Local branch deleted; no leftover refs.
8. **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface; `gh issue create` / `addComment` / `addLabelsToLabelable` → 403 re-confirmed by class this run).
9. **LOOP-38 DELTA — full gate suite re-run first-hand**: install **7.6s** · typecheck **9/9** (13.9s) · lint **9/9** (50.3s) · test **2214/2214** (153 files, 47.9s) · build **1/1** (39.5s) · `check:circular` **exit 0** · `check-deps` **exit 0**. Repo health **improved in test count vs loop 37** (2209→2214, 152→153 files — attributable to merged UI work in #1593/#1594 window).
10. **LOOP-38 DELTA — vulnerability baseline STABILIZED vs loop 37**: `pnpm audit --prod` → **18** (2 low, 12 moderate, 4 high) — **unchanged** from loop 37 · `pnpm audit` → **26** (2 low, 16 moderate, 6 high, 2 critical) — **unchanged** from loop 37. The loop-36→37 upward drift did **not** continue (§5.2).
11. **LOOP-38 DELTA — probe hygiene**: this run's probe branch `perm-probe-DELETE-ME` pushed successfully (re-confirming `contents: write`) and **was deleted immediately**; no new leftover probe refs from this loop.

### Action log

| Timestamp (UTC) | Action                                       | Target                                            | Result                                                                                                     |
| --------------- | -------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 15:40           | Phase 0.1 entry: `gh pr list --state open`   | repo `cpa03/basefly`                              | **0 open PRs** → Phase 0.2                                                                                 |
| 15:40           | Phase 0.2 entry: `gh issue list`             | repo                                              | **82 open issues → ISSUE MANAGER MODE**                                                                    |
| 15:41           | Drift check                                  | sorted issue-number digest                        | 82 numbers, `84696e81…` — **exact match loops 33–37** → no drift                                           |
| 15:41           | `gh auth status`                             | token                                             | `github-actions[bot]` **GITHUB_TOKEN**                                                                     |
| 15:42           | Repo permissions probe                       | `gh api repos/cpa03/basefly`                      | `admin/maintain/pull/push/triage` all **false** at API level; git push still works (§4 contrast)           |
| 15:43           | STEP 1 label audit (scripted, all 82 issues) | category/priority matrix                          | **33 compliant / 49 remediation** — structural match loops 7–37 (§1)                                       |
| 15:45           | STEP 1 apply attempt (39-row batch)          | `gh issue edit` × 39                              | **0 ok / 39 fail** — all `Resource not accessible by integration` (§4)                                     |
| 15:45           | STEP 1 issue-comment probe                   | `gh issue comment 789`                            | **403** `Resource not accessible by integration (addComment)`                                              |
| 15:46           | STEP 2/3 cluster re-verification             | D1–D7, N1–N7 + stale set                          | All carried verdicts re-confirmed first-hand (§2, §3.2)                                                    |
| 15:47           | STEP 4 selection                             | P0 **#496**                                       | only P0 on board → selected per contract                                                                   |
| 15:53           | STEP 4 verification: rate-limiter tests      | 3 `*rate-limiter*.test.ts` files                  | **98/98 passed** (1.19s) → #496 code-complete                                                              |
| 15:56           | STEP 4 contingency: re-attempt #670 fix      | `iterate.yml` on `fix/ci-pnpm-iterate-670-loop38` | Patch applied ✓, YAML valid ✓, commit ✓ (hooks green), **push rejected** — workflow-file protection (§5.1) |
| 15:54           | Gate: install                                | workspace                                         | `pnpm install --frozen-lockfile` **7.6s**                                                                  |
| 15:54           | Gate: typecheck                              | workspace                                         | **9/9 successful** (13.9s)                                                                                 |
| 15:54           | Gate: lint                                   | workspace                                         | **9/9 successful** (50.3s)                                                                                 |
| 15:55           | Gate: test                                   | workspace                                         | **2214/2214 passed** (153 files, 47.9s)                                                                    |
| 15:55           | Gate: build                                  | workspace                                         | **1/1 successful** (39.5s)                                                                                 |
| 15:55           | Gates: `check:circular` / `check-deps`       | workspace                                         | **exit 0 / exit 0**                                                                                        |
| 15:56           | Vuln baseline                                | `pnpm audit --prod` / `pnpm audit`                | **18 / 26** — **unchanged vs loop 37** → stabilized (§5.2)                                                 |
| 15:57           | Probe cleanup                                | `perm-probe-DELETE-ME`                            | Pushed then **deleted** (no leftover refs)                                                                 |
| 16:00           | Durable capture                              | this audit file → PR                              | PR created on `chore/issue-manager-audit-2026-10-21-loop38`                                                |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — exact structural match with loops 7–37 → no-flip-flop rule applies.

Independently re-derived partition this run (scripted over all 82 issues; identical to carried):

- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (already carries `P3` + non-contract `DX-engineer`)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- **10 multi-category**: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- **3 multi-category + missing priority**: `305, 584, 713`

**Union checks:** missing-priority = 24 ∪ {305, 584, 713} = **27** ✓ · missing-category = {670} ∪ 11 = **12** ✓ · multi-category = 10 ∪ {305, 584, 713} = **13** ✓ — identical to loops 7–37 §1.

**Application attempt (first-hand this run — full batch, not just a probe):**

```
39-row `gh issue edit` batch (add labels per payload)
  → 0 ok / 39 fail — every row:
     GraphQL 403: Resource not accessible by integration
     (addLabelsToLabelable)
gh issue comment 789 --body "loop38 probe"
  → GraphQL 403: Resource not accessible by integration (addComment)
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim per loops 8–38 no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–37.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (spot re-verified first-hand this run)

| ID  | Members                 | Canonical | Disposition (first-hand evidence this run)                                                                                                   |
| --- | ----------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | Re-verified: `distributed-rate-limiter.ts` wired into `trpc.ts` + 98/98 tests → close 480 (write blocked)                                    |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670; `iterate.yml` `npm ci \|\| true` re-confirmed at `:72`/`:342`; fix re-built + **push rejected again** (§5.1)          |
| D3  | 628, 501, 724           | **501**   | E2E specs present in `tests/e2e/` (12 spec files incl. `subscription-workflows`, `webhook-error-handling`, `critical-flows`) → close 628/724 |
| D4  | 631, 725, 754           | **725**   | Overlapping API-test issues → close 631/754                                                                                                  |
| D5  | 720, 748                | **748**   | `.nvmrc` = `22.14.0` re-verified ✓ → both stale                                                                                              |
| D6  | 785, 789                | —         | **Not duplicates**; 785 stale (`next` absent from `packages/stripe/package.json` ✓); 789 stale (`react` in peerDeps, not deps ✓)             |
| D7  | 551, 550, 549, 581      | **581**   | Umbrella; children re-verified: `k8s-router.test.ts`+`k8s.test.ts` ✓, `packages/auth` 3 test files ✓, vitest includes `apps/nextjs/src/**` ✓ |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop-38, first-hand spot checks)                                                                 |
| --- | ------------------ | --------- | -------------------------------------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | Confirmed — k8s router tests exist                                                                       |
| N2  | 523, 667           | **#523**  | Confirmed — barrel export audit + tree-shaking                                                           |
| N3  | 751, 753, 723      | **#751**  | Confirmed — code splitting / bundle-size family                                                          |
| N4  | 683, 684, 634, 719 | **#684**  | Confirmed — DX tooling/config; all four stale (root `tsconfig.json` re-verified ✓)                       |
| N5  | 726, 488           | **#488**  | Confirmed — dependency check in CI; `check:circular` exit 0 ✓, CI wiring absent                          |
| N6  | 611, 666           | **#666**  | Confirmed — **both stale**: `not-found.tsx` + `error.tsx` + `global-error.tsx` exist across route groups |
| N7  | 705, 706           | **#705**  | Confirmed — **both stale**: `Dockerfile` + `docker-compose.yml` + `.devcontainer/` exist                 |

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection

- P0 exists → contract selects highest-priority → **#496** (only P0 on the board).
- Re-verified **code-complete first-hand this run**: `npx vitest run` on 3 rate-limiter test files → **3 files, 98/98 passed** (1.19s).
- Acceptance criteria (first-hand artifact check):
  - Redis-backed implementation ✓ (`packages/api/src/distributed-rate-limiter.ts`)
  - Dependency pinned ✓ (`ioredis` in `packages/api/package.json` + `packages/common/package.json`)
  - Graceful degradation ✓ (`SyncRateLimiter` falls back to in-memory when `IS_REDIS_CONFIGURED` is false)
  - Unit tests ✓ (98/98 this run)
  - Documentation ✓ (`docs/redis-setup.md`)
  - tRPC integration: `trpc.ts` imports from `./distributed-rate-limiter`
- **Repair action = administrative close → 403 → FAIL-SAFE** (documented here; §4).
- No code change is required or permitted for the selected issue, therefore **no commit/PR linked to #496 was produced**.

### §3.1b Contingency repair — #670 (highest genuinely-open defect) — RE-ATTEMPTED

All P0/P1 issues verified resolved-in-code (§3.3), so the contingency target remains **#670** (D2 canonical). First-hand end-to-end re-attempt this loop:

1. Branch `fix/ci-pnpm-iterate-670-loop38` off `origin/main` ✓
2. `docs/patches/fix-pnpm-consistency-iterate-744.patch` applied cleanly ✓
3. YAML validity verified (`yaml.safe_load` → `YAML_OK`) ✓
4. Commit created (husky pre-commit ran typecheck 9/9 + test 2214/2214 + check-deps exit 0 — all green) ✓
5. `git push origin fix/ci-pnpm-iterate-670-loop38` → **`[remote rejected]` — "refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml without workflows permission"** ✗
6. Local branch deleted; no leftover refs ✓

Canonical human-applicable remedy remains **`docs/patches/fix-pnpm-consistency-iterate-744.patch`**. Equivalent semantics to loop-37's §3.1b diff; both Architect job (`:72`) and Fixer job (`:342`) covered; Specialist/PR-Handler jobs contain no npm usage and are left untouched.

### §3.2 Stale-set — spot re-verified first-hand this run

| Issue          | Claim                                    | Verdict (loop-38, first-hand)                                                                            |
| -------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter           | **Re-verified: 98/98 tests green (this run)**                                                            |
| #786           | Stripe webhook partial-secret logging    | Stale — repo-wide grep for `slice(-8)` secret logging → **zero matches**                                 |
| #720/#748      | `.nvmrc` missing / invalid               | Stale — `.nvmrc` = `22.14.0` ✓                                                                           |
| #785           | Duplicate `next` dep in packages/stripe  | Stale — `next` absent from `packages/stripe/package.json` ✓ (deps: common/db/env-nextjs/stripe/zod only) |
| #719           | Missing root TypeScript config           | Stale — root `tsconfig.json` exists ✓                                                                    |
| #755           | Composite index for subscription queries | Stale — `@@index([authUserId, stripeCurrentPeriodEnd])` in `schema.prisma` ✓                             |
| #515           | CSRF protection                          | Stale — `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` ✓                                                 |
| #550           | apps/nextjs in coverage config           | Stale — `vitest.config.ts:16` include has `apps/nextjs/src/**/*.{ts,tsx}` ✓                              |
| #551           | k8s router tests                         | Stale — `k8s.test.ts` + `k8s-router.test.ts` ✓                                                           |
| #549           | packages/auth tests (0% coverage)        | Stale — `clerk.test.ts` + `env.test.ts` + `logger.test.ts` ✓                                             |
| #498           | Role-based admin RBAC                    | Stale — `rbac.test.ts` + wiring in `trpc.ts` ✓                                                           |
| #721           | Authz beyond authentication              | Stale — `authorization.ts` + `authorization.test.ts` (`verifyOwnership`) ✓                               |
| #628/#501/#724 | E2E testing                              | Stale — 12 Playwright spec files covering cited gaps ✓                                                   |
| #611/#666      | not-found + error boundaries             | Stale — `not-found.tsx`/`error.tsx` in every route group + `global-error.tsx` + root files ✓             |
| #705/#706      | Docker + devcontainer                    | Stale — `Dockerfile` + `docker-compose.yml` + `.devcontainer/` ✓                                         |
| #789           | React peerDependencies                   | Stale — `react`/`react-dom`/`next` in `peerDependencies`, absent from `dependencies` ✓                   |

Closing any of these requires issue write → **403 → blocked (§4)**.

### §3.3 P0/P1 evidence set — re-verified first-hand

| Issue | Claim                               | First-hand evidence (loop-38)                             |
| ----- | ----------------------------------- | --------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 RL tests green this run** + fallback wiring ✓     |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification |
| #581  | Testing-infra umbrella (P1)         | Children verified present ✓                               |
| #515  | CSRF protection (P1)                | `csrf.ts` + tests ✓                                       |
| #498  | Role-based admin RBAC (P1)          | `rbac.test.ts` + `trpc.ts` wiring ✓                       |
| #728  | Security scanning workflows (P1)    | Workflow-file change → **platform-blocked** (§6)          |

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

| Issue                                     | Status (loop-38)                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| #670 + D2 cluster                         | Fix re-attempted; **workflow-file push platform-blocked again** (§3.1b, §5.1) |
| #687                                      | Open — barrel export import-path consistency unproven                         |
| #663                                      | Open — non-test `eslint-disable` comments remain                              |
| #609/#610                                 | Open — #610 partially addressed; #609 schemas consolidation unproven          |
| #494                                      | Open — domain-layer refactor (large → forbidden under minimal/atomic rule)    |
| #723                                      | Open — `"use client"` ratio (broader scope)                                   |
| #650 / #502                               | Open — workflow-file changes (`on-pull.yml`) → **platform-blocked (§6)**      |
| #751/#708                                 | Remainder — measurement baseline / Turbopack analyzer HTML                    |
| #630                                      | Remainder — AC3 (<30s) runtime unproven                                       |
| feature-grade items (#749, #668, #727, …) | Left per contract minimal/atomic rule                                         |

### §3.5 Dependency vulnerability baseline (**UNCHANGED vs loop 37 — stabilized**, §5.2)

```
pnpm audit --prod  → 18 vulnerabilities: 4 high | 12 moderate | 2 low      (loop 37: 18 — unchanged)
pnpm audit         → 26 vulnerabilities: 2 critical | 6 high | 16 moderate | 2 low   (loop 37: 26 — unchanged)
```

Carried high-leverage items (still unfixed; security-sensitive → human review):

| Severity | Package                  | Advisory                                        | Fix available | Where                                             |
| -------- | ------------------------ | ----------------------------------------------- | ------------- | ------------------------------------------------- |
| critical | `proxy-addr`             | IP spoofing via IPv4-mapped IPv6 trust subnet   | `>=2.0.8`     | transitive — resolve via `pnpm overrides`         |
| critical | `shell-quote`            | `quote()` command injection via line terminator | `>=1.11.0`    | override exists at `>=1.9.0` → bump to `>=1.11.0` |
| high     | `next`                   | SSRF in Image Optimization (+4 related)         | `>=16.3.8`    | pin bump `16.3.6` → `16.3.8`                      |
| high     | `@opennextjs/cloudflare` | Cache interception bypasses middleware          | `>=1.20.2`    | transitive — resolve via `pnpm overrides`         |
| high     | `braces`                 | Stack-exhaustion DoS (deeply nested pattern)    | **none**      | **No patched version exists — document only**     |

**Why this was not fixed in-loop:** STEP 4 binds this run to the selected issue (**#496**); dependency bumps are not linked to any open issue and the contract forbids _unrelated improvements_. Security-sensitive → requires human review.

---

## §4 Blocked Write Paths (re-confirmed first-hand this run)

| Surface                      | Operation                                        | Result                                                                                              |
| ---------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Issues (label, batch)        | 39-row `gh issue edit` batch (STEP 1 apply)      | **0/39** — all `Resource not accessible by integration` (addLabelsToLabelable)                      |
| Issues (comment)             | `gh issue comment 789 --body "loop38 probe"`     | **403** `Resource not accessible by integration (addComment)`                                       |
| Issues (create)              | `gh issue create --title "permission probe"`     | **403** `Resource not accessible by integration (createIssue)`                                      |
| Workflow files (push)        | push `fix/ci-pnpm-iterate-670-loop38` (real fix) | **`[remote rejected]`** GitHub App lacks `workflows` permission — **first-hand with a real commit** |
| PRs (git push) — CONTRAST    | `git push origin perm-probe-DELETE-ME`           | **SUCCESS** — `contents: write` grants git operations (probe deleted after)                         |
| PR creation (API) — CONTRAST | `gh pr create` validation path                   | Reaches branch-validation stage (not a permission denial) — usable for non-workflow branches        |

**Root cause (first-hand):** the run's workflow `.github/workflows/on-pull.yml` grants `contents: write, pull-requests: write, actions: read, repository-projects: write, id-token: write` — **no `issues: write`**. Granting it requires editing `on-pull.yml`, which the token cannot push (workflow-file protection).

---

## §5 LOOP-38 New Findings

### §5.1 Workflow-file push block re-confirmed with a fresh commit (CARRIED, re-verified)

Loop 37 built the real fix and hit the block. This run **re-applied the canonical patch** (`docs/patches/fix-pnpm-consistency-iterate-744.patch` — clean apply), committed (pre-commit gates green), and hit the identical rejection:

```
! [remote rejected] fix/ci-pnpm-iterate-670-loop38 -> fix/ci-pnpm-iterate-670-loop38
  (refusing to allow a GitHub App to create or update workflow `.github/workflows/iterate.yml`
   without `workflows` permission)
```

The block is deterministic and persists. Loop-37's `fix/ci-pnpm-iterate-670` branch was **never persisted** (not in `git ls-remote`) — consistent with the rejection. Human path (§6.1/§6.2) remains the only route.

### §5.2 Vulnerability baseline STABILIZED vs loop 37 (NEW — positive delta)

| Source       | Loop 36           | Loop 37           | Loop 38           | Delta L37→L38      |
| ------------ | ----------------- | ----------------- | ----------------- | ------------------ |
| `--prod`     | 15 (3H/10M/2L)    | 18 (4H/12M/2L)    | 18 (4H/12M/2L)    | **0 — stabilized** |
| full `audit` | 20 (2C/4H/12M/2L) | 26 (2C/6H/16M/2L) | 26 (2C/6H/16M/2L) | **0 — stabilized** |

The loop-36→37 upward drift did **not** continue. Baseline is flat for the first time in three loops. Criticals unchanged in kind (`proxy-addr`, `shell-quote`). Still unfixed; carried fix list in §3.5 awaits human security review.

### §5.3 Node engine skew persists (CARRIED, informational)

- Runner: Node **v20.20.2** (workflows pin `node-version: 20`).
- Repo: `engines: {node: ">=22"}`, `.nvmrc` = `22.14.0`.
- Effect: `WARN Unsupported engine` on every pnpm invocation; all gates still pass.
- Remediation requires workflow-file edits → platform-blocked (§6).

### §5.4 Leftover probe/test branches on remote (CARRIED observation)

`git ls-remote --heads` shows **7 probe/perm-pattern branches** (`perms-probe-20261018`, `probe-api-1791386122`, `test/nonworkflow-perm`, `test/perm-check-1792078424`, `test/pr-check-1787024322`, `test/push-probe`, `test/push-test-nonworkflow`) plus feature-ish `test/api-router-tests-20260226`, `test/auth-tests` and many historical `docs/issue-manager-audit-*` branches. This run's own probe (`perm-probe-DELETE-ME`) was **deleted immediately**. Not deleting historical ones: contract forbids deletion without certainty; flagged for maintainer review in §6.

### §5.5 Test-suite growth since loop 37 (NEW — positive, informational)

Loop 37 recorded **2209 tests / 152 files**. Loop 38 measures **2214 tests / 153 files** on current `main` (`dec0f11`). Delta attributable to UI work merged around PRs #1593/#1594 (ShimmerButton tactile micro-UX). No regressions; full suite green.

---

## §6 Maintainer Actions (ordered by leverage)

1. **Single highest-leverage fix:** have a human account (or token with `workflows: write`) land `docs/patches/on-pull-issues-write-permission.patch` — one line adding `issues: write` to `on-pull.yml`. This alone unblocks STEP 1/2/3 and STEP 4 administrative closes for **every subsequent loop** (labels, comments, closes, issue creation).
2. Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` → closes #670 + cluster D2 (also workflow-file → same human path; loop-38 re-confirmed the patch applies cleanly and the block is deterministic).
3. Close the administrative backlog once (1) is landed: stale set in §3.2 (16+ issues verified resolved this run alone), duplicates D1/D3/D4, consolidations N1–N7 — payload ready in §1/§2.
4. **Triage the §3.5 vulnerability list** (18 prod / 26 total — now stable across loops 37–38): bump `next` `16.3.6` → `16.3.8`; `pnpm overrides` for `proxy-addr >=2.0.8` and `shell-quote >=1.11.0`; document unfixable `braces`.
5. Optional cleanup: delete the 7 historical probe branches + evaluate the 2 `test/*` branches and stale `docs/issue-manager-audit-*` branches listed in §5.4.
