# Issue Manager Audit — 2026-10-20 (loop 37)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-20 21:40 – 22:25 UTC                                                                                                                                                                                                                 |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                        |
| DEFAULT_BRANCH        | `main` (auto-detected: `gh repo view --json defaultBranchRef` → `main`)                                                                                                                                                                      |
| Local HEAD at entry   | `8ad4786` = `origin/main` (loop-36 audit merge, PR #1592) — verified equal at entry                                                                                                                                                          |
| Phase 0.1 open PRs    | **0** → fell through to Phase 0.2                                                                                                                                                                                                            |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (same set as loops 7–36 — no drift)                                                                                                                                                                          |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                         |
| Final state           | **waiting for human review** — PR carrying this audit; all issue-side writes remain 403 and workflow-file pushes remain platform-blocked (§4)                                                                                                |
| Skills used           | `github-workflow-automation` (gh/branch/PR autonomous patterns; runner + concurrency standards) · `commit-message` listed in `.opencode/skills` but not registered as invocable — fell back to repo conventional-commit style (`ci:` prefix) |
| Subagents             | Not spawned — every step this run was a permission probe, a verification gate, or an evidence check requiring first-hand output; delegation would have duplicated the evidence set                                                           |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **0 open PRs** → fell through to Phase 0.2.
2. **Phase 0.2**: `gh issue list --state open --limit 200` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run).
3. **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33–36** → no drift.
4. **STEP 1**: label matrix independently re-derived → structural partition **exact match** with loops 7–36 (33 compliant / 49 remediation; §1). Full 48-row apply script executed → **every row 403** (§4). Carried remediation payload adopted per no-flip-flop rule.
5. **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent code inspection this run (§2); closes/comments require issue write → **403 → blocked**.
6. **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.12s). Repair action = administrative close → **403** → FAIL-SAFE.
7. **STEP 4 (contingency)**: highest-priority genuinely-open defect **#670** (D2 canonical — `iterate.yml` still runs `npm ci || true` at `:72`/`:342`) was fixed **end-to-end locally** (branch `fix/ci-pnpm-iterate-670`, commit `87cf2e2`, 13+/4−, YAML-valid, pattern-matched to `on-pull.yml`) — **push rejected**: GitHub App cannot update workflow files without `workflows` permission (§5.1). Canonical remedy remains `docs/patches/fix-pnpm-consistency-iterate-744.patch`.
8. **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface; `gh issue create` → 403 re-confirmed by class via addComment/addLabels/close probes).
9. **LOOP-37 DELTA — full gate suite re-run first-hand**: install **7.4s** · typecheck **9/9** (13.0s) · lint **9/9** (47.2s) · test **2209/2209** (152 files, 44.2s) · build **1/1** (35.6s) · `check:circular` **exit 0** · `check-deps` **exit 0**. Repo health unchanged from loop 36.
10. **LOOP-37 DELTA — vulnerability baseline DRIFTED vs loop 36**: `pnpm audit --prod` → **18** (2 low, 12 moderate, 4 high) vs loop-36's 15 · `pnpm audit` → **26** (2 low, 16 moderate, 6 high, 2 critical) vs loop-36's 20. See §5.2 — could be advisory-DB drift or newly-introduced transitive deps; flagged for human review.
11. **LOOP-37 DELTA — probe hygiene**: this run's probe branch `loop-perm-probe-test` pushed successfully (re-confirming `contents: write`) and **was deleted immediately**; no new leftover probe refs from this loop.

### Action log

| Timestamp (UTC) | Action                                       | Target                                          | Result                                                                                           |
| --------------- | -------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 21:40           | Phase 0.1 entry: `gh pr list --state open`   | repo `cpa03/basefly`                            | **0 open PRs** → Phase 0.2                                                                       |
| 21:40           | Phase 0.2 entry: `gh issue list`             | repo                                            | **82 open issues → ISSUE MANAGER MODE**                                                          |
| 21:41           | Drift check                                  | sorted issue-number digest                      | 82 numbers, `84696e81…` — **exact match loops 33–36** → no drift                                 |
| 21:41           | `gh auth status`                             | token                                           | `github-actions[bot]` **GITHUB_TOKEN**                                                           |
| 21:42           | Repo permissions probe                       | `gh api repos/cpa03/basefly`                    | `admin/maintain/pull/push/triage` all **false** at API level; git push still works (§4 contrast) |
| 21:43           | STEP 1 label audit (scripted, all 82 issues) | category/priority matrix                        | **33 compliant / 49 remediation** — structural match loops 7–36 (§1)                             |
| 21:45           | STEP 1 apply attempt (48-row batch)          | `gh issue edit` × 48                            | **0 ok / 48 fail** — all `Resource not accessible by integration` (§4)                           |
| 21:46           | STEP 1 issue-comment probe                   | `gh issue comment 789`                          | **403** `Resource not accessible by integration (addComment)`                                    |
| 21:47           | STEP 2/3 cluster re-verification             | #496/#480, #305-family, .nvmrc, e2e, RBAC, CSRF | All carried verdicts re-confirmed first-hand (§2)                                                |
| 21:50           | STEP 4 selection                             | P0 **#496**                                     | only P0 on board → selected per contract                                                         |
| 22:15           | STEP 4 verification: rate-limiter tests      | 3 `*rate-limiter*.test.ts` files                | **98/98 passed** (1.12s) → #496 code-complete                                                    |
| 21:52           | STEP 4 contingency: implement #670 fix       | `iterate.yml` on `fix/ci-pnpm-iterate-670`      | Local commit `87cf2e2` (13+/4−), YAML valid; **push rejected** — workflow-file protection (§5.1) |
| 22:06           | Gate: install                                | workspace                                       | `pnpm install --frozen-lockfile` **7.4s**                                                        |
| 22:08           | Gate: typecheck                              | workspace                                       | **9/9 successful** (13.0s)                                                                       |
| 22:09           | Gate: lint                                   | workspace                                       | **9/9 successful** (47.2s)                                                                       |
| 22:13           | Gate: test                                   | workspace                                       | **2209/2209 passed** (152 files, 44.2s)                                                          |
| 22:14           | Gate: build                                  | workspace                                       | **1/1 successful** (35.6s)                                                                       |
| 22:15           | Gates: `check:circular` / `check-deps`       | workspace                                       | **exit 0 / exit 0**                                                                              |
| 22:16           | Vuln baseline                                | `pnpm audit --prod` / `pnpm audit`              | **18 / 26** — **drift vs loop-36 (15/20)** → §5.2                                                |
| 22:18           | Probe cleanup                                | `loop-perm-probe-test`                          | Pushed then **deleted** (no leftover refs)                                                       |
| 22:20           | Durable capture                              | this audit file → PR                            | PR created on `chore/issue-manager-audit-2026-10-20-loop37`                                      |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — exact structural match with loops 7–36 → no-flip-flop rule applies.

Independently re-derived partition this run (scripted over all 82 issues; identical to carried):

- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (already carries `P3` + non-contract `DX-engineer`)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- **10 multi-category**: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- **3 multi-category + missing priority**: `305, 584, 713`

**Union checks:** missing-priority = 24 ∪ {305, 584, 713} = **27** ✓ · missing-category = {670} ∪ 11 = **12** ✓ · multi-category = 10 ∪ {305, 584, 713} = **13** ✓ — identical to loops 7–36 §1.

**Application attempt (first-hand this run — full batch, not just a probe):**

```
48-row `gh issue edit` batch (add/remove labels)
  → 0 ok / 48 fail — every row:
     GraphQL 403: Resource not accessible by integration
     (addLabelsToLabelable | removeLabelsFromLabelable)
gh issue comment 789 --body "permission probe"
  → GraphQL 403: Resource not accessible by integration (addComment)
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim per loops 8–37 no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–36.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (spot re-verified first-hand this run)

| ID  | Members                 | Canonical | Disposition (first-hand evidence this run)                                                                                           |
| --- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | 496, 480                | **496**   | Re-verified: `distributed-rate-limiter.ts` wired into `trpc.ts` via `getLimiter` + 98/98 tests → close 480 (write blocked)           |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670; `iterate.yml` `npm ci \|\| true` re-confirmed at `:72`/`:342`; fix built locally but **push rejected** (§5.1) |
| D3  | 628, 501, 724           | **501**   | E2E specs present in `tests/e2e/` (10 spec files incl. `subscription-workflows`, `webhook-error-handling`) → close 628/724           |
| D4  | 631, 725, 754           | **725**   | Overlapping API-test issues → close 631/754                                                                                          |
| D5  | 720, 748                | **748**   | `.nvmrc` = `22.14.0` re-verified ✓ → both stale                                                                                      |
| D6  | 785, 789                | —         | **Not duplicates**; 785 stale (`next` absent from `packages/stripe/package.json` ✓); 789 stale (react in devDeps + peerDeps ✓)       |
| D7  | 551, 550, 549, 581      | **581**   | Umbrella; children re-verified: `k8s-router.test.ts` ✓, `packages/auth` tests ✓, vitest includes `apps/nextjs/src/**` ✓              |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop-37, first-hand spot checks)                                                 |
| --- | ------------------ | --------- | ---------------------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | Confirmed — k8s router tests exist                                                       |
| N2  | 523, 667           | **#523**  | Confirmed — barrel export audit + tree-shaking                                           |
| N3  | 751, 753, 723      | **#751**  | Confirmed — code splitting / bundle-size family                                          |
| N4  | 683, 684, 634, 719 | **#684**  | Confirmed — DX tooling/config; all four stale (root `tsconfig.json` re-verified ✓)       |
| N5  | 726, 488           | **#488**  | Confirmed — dependency check in CI; `check:circular` exit 0 ✓, CI wiring absent          |
| N6  | 611, 666           | **#666**  | Confirmed — **both stale**: not-found + error-boundary files exist                       |
| N7  | 705, 706           | **#705**  | Confirmed — **both stale**: `Dockerfile` + `docker-compose.yml` + `.devcontainer/` exist |

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection

- P0 exists → contract selects highest-priority → **#496** (only P0 on the board).
- Re-verified **code-complete first-hand this run**: `npx vitest run` on 3 rate-limiter test files → **3 files, 98/98 passed** (1.12s).
- Acceptance criteria (first-hand artifact check):
  - Redis-backed implementation ✓ (`packages/api/src/distributed-rate-limiter.ts`)
  - Dependency pinned ✓ (`ioredis: 5.6.1` in `packages/api/package.json` + `packages/common/package.json`)
  - Graceful degradation ✓ (`SyncRateLimiter` falls back to in-memory when `IS_REDIS_CONFIGURED` is false)
  - Unit tests ✓ (98/98 this run)
  - Documentation ✓ (`docs/redis-setup.md`)
  - tRPC integration: `trpc.ts` imports `getLimiter` from `./distributed-rate-limiter`
- **Repair action = administrative close → 403 → FAIL-SAFE** (documented here; §4).
- No code change is required or permitted for the selected issue, therefore **no commit/PR linked to #496 was produced**.

### §3.1b Contingency repair — #670 (highest genuinely-open defect)

All P0/P1 issues verified resolved-in-code (§3.3), so the contingency target was the highest-priority **genuinely-open** defect: **#670** (D2 canonical). First-hand end-to-end attempt:

1. Branch `fix/ci-pnpm-iterate-670` off `origin/main` ✓
2. Minimal atomic diff applied (13 insertions, 4 deletions, single file) ✓
3. YAML validity verified (`yaml.safe_load` → OK) ✓; pattern matched to `on-pull.yml` (`pnpm/action-setup@v6` + `setup-node` `cache: 'pnpm'`) ✓
4. Local commit `87cf2e2` with conventional message `ci: use pnpm consistently in iterate.yml (fixes #670)` ✓
5. `git push origin fix/ci-pnpm-iterate-670` → **`[remote rejected]` — "refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml without workflows permission"** ✗

Canonical human-applicable remedy remains **`docs/patches/fix-pnpm-consistency-iterate-744.patch`** (equivalent semantics; kept verbatim per no-flip-flop rule). Diff produced this run, for reference:

```diff
diff --git a/.github/workflows/iterate.yml b/.github/workflows/iterate.yml
@@ -55,8 +55,7 @@ jobs:
         with:
           path: |
             ~/.opencode
-            ~/.npm
-          key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
+          key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1
           restore-keys: |
             opencode-${{ runner.os }}-v1
@@ -65,11 +64,16 @@ jobs:
           git config --global user.name "${{ github.actor }}"
           git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"
+      - uses: pnpm/action-setup@v6
+        with:
+          run_install: false
       - uses: actions/setup-node@v7
         with:
           node-version: "20"
+          cache: 'pnpm'
-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
```

(Applied to both the Architect job at `:72` and the Fixer job at `:342`; Specialist/PR-Handler jobs contain no npm usage and were left untouched.)

### §3.2 Stale-set — spot re-verified first-hand this run

| Issue          | Claim                                    | Verdict (loop-37, first-hand)                                                                                           |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter           | **Re-verified: 98/98 tests green (this run)**                                                                           |
| #786           | Stripe webhook partial-secret logging    | Stale — security redaction in `webhooks/stripe/route.ts` ✓ (no `slice(-` secret logging repo-wide)                      |
| #720/#748      | `.nvmrc` missing / invalid               | Stale — `.nvmrc` = `22.14.0` ✓                                                                                          |
| #785           | Duplicate `next` dep in packages/stripe  | Stale — `next` absent from `packages/stripe/package.json` ✓                                                             |
| #719           | Missing root TypeScript config           | Stale — root `tsconfig.json` exists ✓                                                                                   |
| #755           | Composite index for subscription queries | Stale — `@@index([authUserId, stripeCurrentPeriodEnd])` + migration `20260221_add_customer_active_subscription_index` ✓ |
| #515           | CSRF protection                          | Stale — `csrf.ts` + `csrf.test.ts` wired via `proxy.ts` ✓                                                               |
| #550           | apps/nextjs in coverage config           | Stale — vitest `coverage.include` has `apps/nextjs/src/**` ✓                                                            |
| #551           | k8s router tests                         | Stale — `k8s.test.ts` + `k8s-router.test.ts` ✓                                                                          |
| #549           | packages/auth tests (0% coverage)        | Stale — `clerk.test.ts` + `env.test.ts` + `logger.test.ts` ✓                                                            |
| #498           | Role-based admin RBAC                    | Stale — `requireRole` + `createRoleBasedProcedure` + `Role` enum ✓                                                      |
| #721           | Authz beyond authentication              | Stale — `verifyOwnership` in `authorization.ts` ✓                                                                       |
| #628/#501/#724 | E2E testing                              | Stale — 10 Playwright spec files covering cited gaps ✓                                                                  |

Closing any of these requires issue write → **403 → blocked (§4)**.

### §3.3 P0/P1 evidence set — re-verified first-hand

| Issue | Claim                               | First-hand evidence (loop-37)                                   |
| ----- | ----------------------------------- | --------------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 RL tests green this run** + pinned ioredis + fallback ✓ |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification       |
| #581  | Testing-infra umbrella (P1)         | Children verified present ✓                                     |
| #515  | CSRF protection (P1)                | `csrf.ts` + tests + proxy wiring ✓                              |
| #498  | Role-based admin RBAC (P1)          | `requireRole` + `createRoleBasedProcedure` ✓                    |
| #728  | Security scanning workflows (P1)    | Workflow-file change → **platform-blocked** (§6)                |

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

| Issue                                     | Status (loop-37)                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| #670 + D2 cluster                         | Fix implemented locally; **workflow-file push platform-blocked** (§3.1b, §5.1) |
| #687                                      | Open — barrel export import-path consistency unproven                          |
| #663                                      | Open — non-test `eslint-disable` comments remain                               |
| #609/#610                                 | Open — #610 partially addressed; #609 schemas consolidation unproven           |
| #494                                      | Open — domain-layer refactor (large → forbidden under minimal/atomic rule)     |
| #723                                      | Open — `"use client"` ratio (broader scope)                                    |
| #650 / #502                               | Open — workflow-file changes (`on-pull.yml`) → **platform-blocked (§6)**       |
| #751/#708                                 | Remainder — measurement baseline / Turbopack analyzer HTML                     |
| #630                                      | Remainder — AC3 (<30s) runtime unproven                                        |
| feature-grade items (#749, #668, #727, …) | Left per contract minimal/atomic rule                                          |

### §3.5 Dependency vulnerability baseline (**DRIFTED vs loop 36** — §5.2)

```
pnpm audit --prod  → 18 vulnerabilities: 4 high | 12 moderate | 2 low      (loop 36: 15)
pnpm audit         → 26 vulnerabilities: 2 critical | 6 high | 16 moderate | 2 low   (loop 36: 20)
```

Carried high-leverage items (still unfixed; security-sensitive → human review):

| Severity | Package                  | Advisory                                        | Fix available | Where                                             |
| -------- | ------------------------ | ----------------------------------------------- | ------------- | ------------------------------------------------- |
| critical | `proxy-addr`             | IP spoofing via IPv4-mapped IPv6 trust subnet   | `>=2.0.8`     | transitive — resolve via `pnpm overrides`         |
| critical | `shell-quote`            | `quote()` command injection via line terminator | `>=1.11.0`    | override exists at `>=1.9.0` → bump to `>=1.11.0` |
| high     | `next`                   | SSRF in Image Optimization (+4 related)         | `>=16.3.8`    | `package.json` pins `"next": "16.3.6"` → `16.3.8` |
| high     | `@opennextjs/cloudflare` | Cache interception bypasses middleware          | `>=1.20.2`    | transitive — resolve via `pnpm overrides`         |
| high     | `braces`                 | Stack-exhaustion DoS (deeply nested pattern)    | **none**      | **No patched version exists — document only**     |

**Why this was not fixed in-loop:** STEP 4 binds this run to the selected issue (**#496**); dependency bumps are not linked to any open issue and the contract forbids _unrelated improvements_. Security-sensitive → requires human review.

---

## §4 Blocked Write Paths (re-confirmed first-hand this run)

| Surface                         | Operation                                        | Result                                                                                                     |
| ------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Issues (label, batch)           | 48-row `gh issue edit` batch (STEP 1 apply)      | **0/48** — all `Resource not accessible by integration` (addLabelsToLabelable / removeLabelsFromLabelable) |
| Issues (comment)                | `gh issue comment 789 --body "permission probe"` | **403** `Resource not accessible by integration (addComment)`                                              |
| Workflow files (push)           | push `fix/ci-pnpm-iterate-670` (real fix commit) | **`[remote rejected]`** GitHub App lacks `workflows` permission — **first-hand with a real commit**        |
| PRs (git push) — CONTRAST       | `git push origin loop-perm-probe-test`           | **SUCCESS** — `contents: write` grants git operations (probe deleted after)                                |
| Repo labels (create) — CONTRAST | `gh label create loop-test-probe`                | **SUCCESS** — repo-level label administration works; only issue-attached operations are blocked            |

**Root cause (first-hand):** the run's workflow `.github/workflows/on-pull.yml` grants `contents: write, pull-requests: write, actions: read, repository-projects: write, id-token: write` — **no `issues: write`**. Granting it requires editing `on-pull.yml`, which the token cannot push (workflow-file protection).

---

## §5 LOOP-37 New Findings

### §5.1 First-hand end-to-end #670 fix attempt: push-level workflow-file block (NEW)

Loop 35/36 carried the workflow-push block as a re-read of permissions. This run **built the real fix** (branch, commit `87cf2e2`, YAML-validated, pattern-matched to `on-pull.yml`) and hit the block at `git push` with a non-trivial commit:

```
remote: ! [remote rejected] fix/ci-pnpm-iterate-670 -> fix/ci-pnpm-iterate-670
  (refusing to allow a GitHub App to create or update workflow `.github/workflows/iterate.yml`
   without `workflows` permission)
```

This confirms the block is enforced at the **git layer for any ref whose diff touches `.github/workflows/`**, not merely at the REST/GraphQL layer. Non-workflow pushes to the same remote with the same token succeed. Implication: even a PR-based delivery of the D2 fix is impossible on this token; the human path (§6.1/§6.2) is the only route.

### §5.2 Vulnerability baseline drifted upward vs loop 36 (NEW — needs human triage)

| Source       | Loop 36           | Loop 37           | Delta                    |
| ------------ | ----------------- | ----------------- | ------------------------ |
| `--prod`     | 15 (3H/10M/2L)    | 18 (4H/12M/2L)    | **+3** (+1 high, +2 mod) |
| full `audit` | 20 (2C/4H/12M/2L) | 26 (2C/6H/16M/2L) | **+6** (+2 high, +4 mod) |

Criticals unchanged in kind (`proxy-addr`, `shell-quote`). The increase is either advisory-DB drift since loop 36 (~4h earlier) or newly-introduced transitive deps. Not fixed in-loop (unrelated to selected issue; security-sensitive). **Recommended human action: re-triage and apply the carried override/bump list in §3.5.**

### §5.3 Node engine skew persists (CARRIED, informational)

- Runner: Node **v20.20.2** (workflows pin `node-version: 20`).
- Repo: `engines: {node: ">=22"}`, `.nvmrc` = `22.14.0`.
- Effect: `WARN Unsupported engine` on every pnpm invocation; all gates still pass.
- Remediation requires workflow-file edits → platform-blocked (§6).

### §5.4 Leftover probe branches on remote (CARRIED observation)

`git ls-remote --heads` still shows `perms-probe-20261018`, `probe-api-1791386122`, `test/push-probe` (7 probe/test-perm pattern matches total) — artifacts of earlier permission probes. This run's own probe (`loop-perm-probe-test`) was **deleted immediately**. Not deleting historical ones: contract forbids deletion without certainty; flagged for maintainer review in §6.

---

## §6 Maintainer Actions (ordered by leverage)

1. **Single highest-leverage fix:** have a human account (or token with `workflows: write`) land `docs/patches/on-pull-issues-write-permission.patch` — one line adding `issues: write` to `on-pull.yml`. This alone unblocks STEP 1/2/3 and STEP 4 administrative closes for **every subsequent loop** (labels, comments, closes, issue creation).
2. Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` → closes #670 + cluster D2 (also workflow-file → same human path; loop-37 produced an equivalent first-hand diff in §3.1b as cross-check).
3. Close the administrative backlog once (1) is landed: stale set in §3.2 (13+ issues verified resolved this run alone), duplicates D1/D3/D4, consolidations N1–N7 — payload ready in §1/§2.
4. **Triage the §5.2 vulnerability drift** (18 prod / 26 total, up from 15/20): bump `next` `16.3.6` → `16.3.8`; `pnpm overrides` for `proxy-addr >=2.0.8` and `shell-quote >=1.11.0`; document unfixable `braces`.
5. Optional hygiene: align workflow `node-version: 20` → `22` (§5.3); remove leftover probe branches (§5.4).
