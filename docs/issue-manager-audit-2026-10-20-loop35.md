# Issue Manager Audit — 2026-10-20 (loop 35)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Evaluation date       | 2026-10-20 08:54 – 09:10 UTC                                                                                                                                                                                       |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                              |
| DEFAULT_BRANCH        | `main` (auto-detected: `gh repo view --json defaultBranchRef` → `main`)                                                                                                                                            |
| Local HEAD at entry   | `498d139` = `origin/main` (loop-34 audit merge, PR #1589) — verified equal at exit (`git rev-parse origin/main HEAD`)                                                                                              |
| Phase 0.1 open PRs    | **0** → fell through to Phase 0.2                                                                                                                                                                                  |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (same set as loops 7–34 — no drift)                                                                                                                                                |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                               |
| Final state           | **waiting for human review** — PR carrying this audit; all issue-side writes remain 403 (§4)                                                                                                                       |
| Skills used           | `openx-basefly` (harness conventions) · `github-workflow-automation` (workflow permission/queue patterns — used to structure the `on-pull.yml` analysis) · `/ulw-loop` command executed verbatim from user message |
| Subagents             | Not spawned — every step this run was a permission probe or a gate execution requiring first-hand output; delegation would have duplicated the evidence set                                                        |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → **0 open PRs** → fell through to Phase 0.2.
2. **Phase 0.2**: `gh issue list --state open` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run).
3. **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33/34** → no drift.
4. **STEP 1**: label matrix recomputed (Python, first-hand) → **33 compliant / 49 remediation** — exact match with loops 7–34 → no-flip-flop rule applies; write probes (GraphQL + REST) → **403** (§1, §4).
5. **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-derived from current issue set; spot checks first-hand (below) → all carried verdicts re-confirmed; closes require issue write → **403 → blocked**.
6. **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.16s). Repair action = administrative close → **403** → FAIL-SAFE.
7. **FAIL-SAFE**: `gh issue create` (uncertainty tracker) → **403** (GraphQL `createIssue`). Durable capture = this audit + PR (issue creation itself is on the blocked surface).
8. **LOOP-35 DELTA — CI zero-jobs failures root-caused**: runs `39348918823` (loop-34 audit PR) and `39363686971` (probe branch) concluded `failure` with **`jobs: []`**. Both head branches were deleted after their merges/probes (absent from `git ls-remote`) → runs failed before job scheduling because the head ref no longer existed. This **explains loop-34's unexplained "zero-job anomaly"**: runs for deleted refs. Benign; no CI regression.
9. **LOOP-35 DELTA — workflow-file push re-probe (fresh)**: branch `fix/on-pull-issues-write-permission` built from `origin/main`, `docs/patches/on-pull-issues-write-permission.patch` applied clean (commit `c7be614`), push → **remote rejected** (same verbatim error as loop 20). Local branch deleted; **no remote branch created** (`git ls-remote` empty). Platform block **re-confirmed**.
10. **LOOP-35 DELTA — Node engine skew observed**: runner executes Node **v20.20.2** (`setup-node node-version: 20` in `on-pull.yml`) while `package.json` `engines` wants `>=22` and `.nvmrc` = `22.14.0` → every pnpm invocation emits `WARN Unsupported engine`. All gates still pass; fixing the skew requires a workflow-file edit (platform-blocked, §6) — recorded as observation only.
11. **LOOP-35 DELTA — pre-commit hooks verified live**: the probe commit triggered husky → `lint-staged` + `dx:quick` (typecheck 9/9 + lint 9/9) + `check-deps`, all green in-hook. Evidence for #630's hook infrastructure (AC3 runtime budget still unproven).
12. **Gates all green (first-hand)**: install **7.2s** · typecheck **9/9** · lint **9/9** · test **2209/2209** (152 files) · build **1/1** · size budgets **green** (JS 621.98/800 kB, CSS 20.13/120 kB, Media 260.03/300 kB) · `check:circular` **exit 0 — "No circular dependency found!"** · `check-deps` **exit 0**.

### Action log

| Timestamp (UTC) | Action                                     | Target                                            | Result                                                                                                       |
| --------------- | ------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 08:54           | Phase 0.1 entry: `gh pr list --state open` | repo `cpa03/basefly`                              | **0 open PRs** → Phase 0.2                                                                                   |
| 08:54           | Phase 0.2 entry: `gh issue list`           | repo                                              | **82 open issues → ISSUE MANAGER MODE**                                                                      |
| 08:55           | Drift check                                | sorted issue-number digest                        | 82 numbers, `84696e81…` — **exact match loops 33/34** → no drift                                             |
| 08:55           | `gh auth status`                           | token                                             | `github-actions[bot]` **GITHUB_TOKEN** (Actions token; no `issues` scope for this workflow)                  |
| 08:56           | STEP 1 matrix recomputation (Python)       | all 82 issues                                     | **33 compliant / 49 remediation** — exact match (no flip-flop)                                               |
| 08:56           | STEP 1 write probe (GraphQL)               | `gh issue edit 789 --add-label P2`                | **403** `Resource not accessible by integration (addLabelsToLabelable)`                                      |
| 08:57           | STEP 4 selection                           | P0 **#496**                                       | only P0 on board → selected per contract                                                                     |
| 08:57           | #496 AC artifact inspection (first-hand)   | `.env.example`, `docs/redis-setup.md`, sources    | `REDIS_URL` + 6 `RATE_LIMIT_*` vars ✓ · setup doc ✓ · `distributed-rate-limiter.ts` + fallback ✓             |
| 08:59           | STEP 4 verification: rate-limiter tests    | 3 `*rate-limiter*.test.ts` files                  | **98/98 passed** (1.16s) → #496 code-complete                                                                |
| 09:00           | Gate: typecheck                            | workspace                                         | **9/9 successful**                                                                                           |
| 09:01           | Gate: lint                                 | workspace                                         | **9/9 successful**                                                                                           |
| 09:02           | Gate: test                                 | workspace                                         | **2209/2209 passed (152 files)**                                                                             |
| 09:03           | Gate: build                                | workspace                                         | **1/1 successful**                                                                                           |
| 09:03           | CI anomaly inspection                      | runs `39348918823`, `39363686971`                 | both `failure` with **`jobs: []`** → root-caused: deleted head refs (see §5.1)                               |
| 09:04           | Root-cause read                            | `.github/workflows/on-pull.yml` permissions block | `contents/pull-requests/actions/repository-projects/id-token` — **no `issues: write`** → 403 root cause      |
| 09:05           | Stale-set spot re-checks (first-hand)      | `.nvmrc`, strict ts, stripe, routes, boundaries   | `22.14.0` ✓ · `strict: true` ✓ · no `next` in stripe ✓ · 1 health route ✓ · 6 not-found + 8 error files ✓    |
| 09:06           | Vulnerability baseline                     | `pnpm audit --prod` / `pnpm audit`                | **15 prod** (3 high) / **20 all-deps** (2 critical, 4 high) — unchanged from loop-34                         |
| 09:07           | **Workflow-push re-probe**                 | `fix/on-pull-issues-write-permission`             | patch clean-applies (commit `c7be614`); push **rejected** (verbatim loop-20 error); local cleanup, no remote |
| 09:07           | **FAIL-SAFE issue creation probe**         | `gh issue create` (uncertainty tracker)           | **403** GraphQL `createIssue` → blocked; durable capture = this doc                                          |
| 09:08           | Health: circular + dep-consistency         | workspace                                         | `check:circular` **exit 0** ("No circular dependency found!") · `check-deps` **exit 0**                      |
| 09:08           | Health: size budgets                       | `apps/nextjs size:check`                          | **green**: JS 621.98/800 kB · CSS 20.13/120 kB · Media 260.03/300 kB                                         |
| 09:09           | Cluster spot re-checks (first-hand)        | D1/D3/D5/N1/N6/N7 evidence                        | titles identical (D1) · 11 e2e specs ✓ · k8s+auth tests ✓ · 28 common tests ✓ · Docker/devcontainer ✓        |
| 09:09           | Pre-commit hook observation                | probe commit `c7be614`                            | husky ran `lint-staged` + `dx:quick` (9/9) + `check-deps` — **all green in-hook**                            |
| 09:10           | Create audit branch + write this file      | `chore/issue-manager-audit-2026-10-20-loop35`     | created from `498d139` (= `origin/main` at entry)                                                            |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh this run, all 82): 33 compliant / 49 remediation** — exact match with loops 7–34 → no-flip-flop rule applies.

Remediation partition (re-derived independently this run):

- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (already carries `P3` + non-contract `DX-engineer`)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- **10 multi-category**: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- **3 multi-category + missing priority**: `305, 584, 713`

**Union checks:** missing-priority = 24 ∪ {305, 584, 713} = **27** ✓ · missing-category = {670} ∪ 11 = **12** ✓ · multi-category = 10 ∪ {305, 584, 713} = **13** ✓ — identical to loops 7–34 §1.

**Application attempt (first-hand this run):**

```
gh issue edit 789 --add-label P2
  → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
gh api -X POST repos/cpa03/basefly/issues/789/labels -f "labels[]=enhancement"
  → REST 403: Resource not accessible by integration
```

(idempotent probe: `enhancement` already present on #789, so a success would have been a no-op)

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim per loops 8–35 no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–34.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (spot re-verified first-hand this run)

| ID  | Members                 | Canonical | Disposition (first-hand evidence this run)                                                                                          |
| --- | ----------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | Titles re-fetched: identical in-memory→Redis RL problem → close 480 (write blocked)                                                 |
| D2  | 305, 595, 670, 584, 744 | **670**   | Consolidate into #670; `iterate.yml` `npm ci \|\| true` still at `:72`/`:342` (workflow-file → blocked)                             |
| D3  | 628, 501, 724           | **501**   | **11 specs** re-counted this run ✓ → close 628/724                                                                                  |
| D4  | 631, 725, 754           | **725**   | Overlapping API-test issues → close 631/754                                                                                         |
| D5  | 720, 748                | **748**   | `.nvmrc` = `22.14.0` re-verified ✓ → both stale                                                                                     |
| D6  | 785, 789                | —         | **Not duplicates**; 785 stale (no `next` in `packages/stripe` re-verified ✓); 789 stale (peerDeps ✓)                                |
| D7  | 551, 550, 549, 581      | **581**   | Umbrella; children re-verified: `router/k8s.test.ts` + `k8s-router.test.ts` ✓, auth tests ✓, vitest includes `apps/nextjs/src/**` ✓ |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop-35, first-hand spot checks)                                                            |
| --- | ------------------ | --------- | --------------------------------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | Confirmed — k8s router tests exist (`packages/api/src/router/k8s.test.ts`, `k8s-router.test.ts`)    |
| N2  | 523, 667           | **#523**  | Confirmed — barrel export audit + tree-shaking                                                      |
| N3  | 751, 753, 723      | **#751**  | Confirmed — code splitting / bundle-size family                                                     |
| N4  | 683, 684, 634, 719 | **#684**  | Confirmed — DX tooling/config; all four stale (root `tsconfig.json` + `strict: true` re-verified ✓) |
| N5  | 726, 488           | **#488**  | Confirmed — dependency check in CI; `check:circular` exit 0 ✓, CI wiring absent                     |
| N6  | 611, 666           | **#666**  | Confirmed — **both stale**: 6 `not-found.tsx` + 8 error-boundary files re-counted ✓                 |
| N7  | 705, 706           | **#705**  | Confirmed — **both stale**: `Dockerfile` + `docker-compose.yml` + `.devcontainer/` all exist ✓      |

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection

- P0 exists → contract selects highest-priority → **#496** (only P0 on the board).
- Re-verified **code-complete first-hand this run**: `npx vitest run` on 3 rate-limiter test files → **3 files, 98/98 passed** (1.16s).
- Acceptance criteria (first-hand artifact check):
  - Redis-backed implementation ✓ (`packages/api/src/distributed-rate-limiter.ts`)
  - Configuration via env vars ✓ (`.env.example`: `REDIS_URL` + 6 `RATE_LIMIT_*`)
  - Graceful degradation ✓ (in-memory fallback wired at `distributed-rate-limiter.ts:158-269`, warns on Redis failure)
  - Unit tests ✓ (98/98 this run)
  - Documentation ✓ (`docs/redis-setup.md`)
  - tRPC integration (from loop 20): `trpc.ts` imports `getLimiter` and applies `rateLimit()` middleware
- **Repair action = administrative close → 403 → FAIL-SAFE** (documented here; §4).
- No code change is required or permitted for the selected issue, therefore **no commit/PR linked to #496 was produced**.

### §3.2 Stale-set — spot re-verified first-hand this run

| Issue          | Claim                                   | Verdict (loop-35, first-hand)                                                    |
| -------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter          | **Re-verified: 98/98 tests green (this run)**                                    |
| #713           | Missing tests for packages/common       | Resolved — **28** `*.test.ts` under `packages/common` (re-counted ✓)             |
| #634           | Strict TS may not be enabled            | Stale — `tooling/typescript-config/base.json` `"strict": true` ✓                 |
| #697           | Corrupted text in docs                  | Stale (carried; docs-only delta since verification)                              |
| #578           | Duplicate health check endpoint         | Stale — exactly **1** health `route.ts` re-counted ✓                             |
| #785           | Duplicate `next` dep in packages/stripe | Stale — `next` absent from `packages/stripe/package.json` ✓                      |
| #720/#748      | `.nvmrc` missing / invalid              | Stale — `.nvmrc` = `22.14.0` ✓                                                   |
| #719           | Missing root TypeScript config          | Stale — root `tsconfig.json` extends `./tooling/typescript-config/base.json` ✓   |
| #501/#628/#724 | Missing Playwright E2E                  | Stale — **11** `.spec.ts` in `tests/e2e/` ✓                                      |
| #611/#666      | Missing 404 / error boundaries          | Stale — 6 `not-found.tsx` + 8 error files ✓                                      |
| #705/#706      | Missing Docker / Dev Containers         | Stale — all three artifacts exist ✓                                              |
| #551/#549/#550 | Missing k8s/auth/coverage tests         | Stale — test files + vitest `apps/nextjs` include ✓                              |
| #663           | eslint-disable consolidation            | **Open** — non-test `eslint-disable` comments remain (10 raw grep hits this run) |
| #667           | Package export boundaries               | **Partial** — `check:circular` exit 0 ✓; AC3 optimization open via #687          |

Closing any of these requires issue write → **403 → blocked (§4)**.

### §3.3 P0/P1 evidence set — re-verified first-hand

| Issue | Claim                               | First-hand evidence (loop-35)                                        |
| ----- | ----------------------------------- | -------------------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 RL tests green this run** + env config + docs + fallback ✓   |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification            |
| #581  | Testing-infra umbrella (P1)         | Children #551/#550/#549/#501 verified present ✓                      |
| #515  | CSRF protection (P1)                | `csrfProtection` middleware in `trpc.ts` (carried, code unchanged)   |
| #498  | Role-based admin RBAC (P1)          | `requireRole` + `createRoleBasedProcedure` (carried, code unchanged) |
| #728  | Security scanning workflows (P1)    | Workflow-file change → **platform-blocked** (§6)                     |

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

| Issue                                     | Status (loop-35)                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| #713                                      | Resolved — administrative close needed (write blocked)                                  |
| #687                                      | Open — barrel export import-path consistency unproven                                   |
| #663                                      | Open — non-test `eslint-disable` comments remain                                        |
| #609/#610                                 | Open — #610 partially addressed; #609 schemas consolidation unproven                    |
| #494                                      | Open — domain-layer refactor (large → forbidden under minimal/atomic rule)              |
| #723                                      | Open — `"use client"` ratio (broader scope)                                             |
| #650 / #502 / D2                          | Open — workflow-file changes (`on-pull.yml`, `iterate.yml`) → **platform-blocked (§6)** |
| #751/#708                                 | Remainder — measurement baseline / Turbopack analyzer HTML                              |
| #630                                      | Remainder — AC3 (<30s) runtime unproven (hook infra verified working this run)          |
| feature-grade items (#749, #668, #727, …) | Left per contract minimal/atomic rule                                                   |

### §3.5 Dependency vulnerability baseline (unchanged from loop-34)

```
pnpm audit --prod  → 15 vulnerabilities: 3 high | 10 moderate | 2 low
pnpm audit         → 20 vulnerabilities: 2 critical | 4 high | 12 moderate | 2 low
```

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

| Surface                 | Operation                                 | Result                                                                                      |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| Issues (label, GraphQL) | `gh issue edit 789 --add-label P2`        | **403** `Resource not accessible by integration (addLabelsToLabelable)` (re-probed)         |
| Issues (label, REST)    | `POST …/issues/789/labels`                | **403** `Resource not accessible by integration` (re-probed)                                |
| Issues (create)         | `gh issue create` (FAIL-SAFE tracker)     | **403** GraphQL `createIssue` (re-probed this run)                                          |
| Workflow files (push)   | push branch touching `.github/workflows/` | **`[remote rejected]`** GitHub App lacks `workflows` permission (re-probed this run, §0 #9) |

**Root cause (first-hand):** the run's workflow `.github/workflows/on-pull.yml` grants `contents: write, pull-requests: write, actions: read, repository-projects: write, id-token: write` — **no `issues: write`**. (`iterate.yml` already declares `issues: write`, but this hourly run executes under `on-pull.yml`, name `pull`, `schedule` trigger.) Granting it requires editing `on-pull.yml`, which the token cannot push (workflow-file protection).

---

## §5 LOOP-35 New Findings

### §5.1 CI zero-jobs failures root-caused (NEW)

| Run           | Head branch                                   | Event          | Conclusion | Jobs     |
| ------------- | --------------------------------------------- | -------------- | ---------- | -------- |
| `39348918823` | `chore/issue-manager-audit-2026-10-20-loop34` | `pull_request` | failure    | **`[]`** |
| `39363686971` | `probe/write-access-1792466353`               | `pull_request` | failure    | **`[]`** |

Both head branches are **absent from `git ls-remote`** (deleted after merge/probe cleanup) → the runs failed before scheduling any job because the head ref no longer existed. Runs whose branches were still alive (e.g. `39347164303`, PR #1588) succeeded. **Conclusion: benign race between post-merge branch deletion and queued `pull_request` runs — not a CI regression.** Loop-34's "zero-job anomaly" is explained by the same mechanism.

### §5.2 Node engine skew (NEW, informational)

- Runner: Node **v20.20.2** (workflows pin `node-version: 20`).
- Repo: `engines: {node: ">=22"}`, `.nvmrc` = `22.14.0`.
- Effect: `WARN Unsupported engine` on every pnpm invocation; all gates still pass.
- Remediation requires workflow-file edits (`on-pull.yml`/`iterate.yml` `node-version`) → platform-blocked (§6).

### §5.3 Pre-commit hook chain verified live (NEW)

Probe commit `c7be614` triggered husky → `lint-staged` (no staged matches message + chain) → `dx:quick` (typecheck 9/9 + lint 9/9, full turbo) → `check-deps` (exit 0). Hook infrastructure for #630 works end-to-end in this environment.

### §5.4 Leftover probe branches on remote (carried observation)

`git ls-remote --heads` shows `perms-probe-20261018`, `probe-api-1791386122`, `test/push-probe` — artifacts of earlier permission probes. Not deleted: contract forbids deletion without certainty; flagged for maintainer review in §6.

---

## §6 Maintainer Actions (ordered by leverage)

1. **Single highest-leverage fix:** have a human account (or token with `workflows: write`) land `docs/patches/on-pull-issues-write-permission.patch` — one line adding `issues: write` to `on-pull.yml`. This alone unblocks STEP 1/2/3 and STEP 4 administrative closes for **every subsequent loop** (labels, comments, closes, issue creation).
2. Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch` to `iterate.yml` → closes #670 + cluster D2 (also workflow-file → same human path).
3. Close the administrative backlog once (1): stale set in §3.2, duplicates D1/D3/D4, consolidations N1–N7 — payload ready in §1/§2.
4. Optional security follow-ups (security-sensitive → human review): bump `next` `16.3.6` → `16.3.8`; `pnpm overrides` for `proxy-addr >=2.0.8` and `shell-quote >=1.11.0`; document unfixable `braces`.
5. Optional hygiene: align workflow `node-version: 20` → `22` (§5.2); remove leftover probe branches (§5.4).
