# Issue Manager Audit — 2026-10-23 (loop 45)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-23 23:36 – 23:55 UTC                                                                                                                                                                                                                                                                                                                                                                                   |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                                                                                                                                                                                                                                                                          |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `08b04cc` = PR #1604 merge; `git fetch` re-confirmed `origin/main` = HEAD — 0 commits behind)                                                                                                                                                                                                                                                                                 |
| Phase 0.1 open PRs    | **0** → PR HANDLER MODE not entered                                                                                                                                                                                                                                                                                                                                                                            |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (same set as loops 7–44 — no drift)                                                                                                                                                                                                                                                                                                                                            |
| Runner context        | `on-pull.yml` (`name: pull`), job `ci`, **event = `schedule`**, `GITHUB_WORKFLOW_REF=cpa03/basefly/.github/workflows/on-pull.yml@refs/heads/main`, `GITHUB_RUN_NUMBER=4920`, run `40040643967`                                                                                                                                                                                                                 |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                                                                                                                                                                                                                                                                           |
| Final state           | **waiting for human review** — PR carrying this audit; issue-side writes remain 403 (§4)                                                                                                                                                                                                                                                                                                                       |
| Skills used           | `github-workflow-automation` (permissions model + concurrency/queue references → informed the §4 root-cause analysis: `on-pull.yml` top-level `permissions:` block lacks `issues: write`, and workflow-trigger semantics explain why `schedule`-event tokens carry the reduced grant)                                                                                                                          |
| Subagents             | 1 attempted, **1 failed**: `category=quick` bg `bg_1d442729` → **`ProviderModelNotFoundError: Model not found: opencode/muse-spark-1.3-contributor-free`** (provider suggests `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`); session `ses_e94dd3b64ffeNhInuT26bE8GSS` — **4th consecutive loop** of subagent start failure (loops 42–44 identical). All verification executed first-hand this run |

### Decision summary (why this phase ran)

1.  **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → no PR HANDLER MODE.
2.  **Phase 0.2**: `gh issue list --state open --limit 1000` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run when a phase is activated).
3.  **Drift check (first-hand)**: `sha256(",".join(sorted(nums)))[:8] = 84696e81` — **exact match with loops 33–44** → no drift; carried payload and cluster map apply verbatim (no-flip-flop rule).
4.  **STEP 1**: label matrix independently re-derived this run (jq script over full label sets, §1) → **33 compliant / 49 remediation** — structural match with loops 7–44. Application attempt (probe `gh issue edit 789 --add-label P3`) → **403** `Resource not accessible by integration` (addLabelsToLabelable) (§4).
5.  **STEP 2/3**: clusters **D1–D7** re-verified first-hand this run (§2.1); N1/N4/N6/N7 spot-verified first-hand, N2/N3/N5 carried (evidence unchanged since loop 43). Duplicate-close probe (`gh issue close 480 --comment …`) → **403** addComment → blocked.
6.  **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.12s, vitest 4.1.11). Repair action = administrative close → `gh issue close 496 --comment …` → **403** addComment → FAIL-SAFE (documented here; §4).
7.  **STEP 4 contingency (#670)**: `iterate.yml` `npm ci || true` re-confirmed first-hand (lines 72, 342) — genuine defect; workflow-file push remains platform-blocked (§4, carried from loop 38). Canonical remedy remains `docs/patches/fix-pnpm-consistency-iterate-744.patch` (present; `docs/patches/` now holds 3 files incl. `iterate-yml-pnpm-consistency.md`).
8.  **Stale-set NEW addition (loop 45)**: **#613** (duplicate workflow `paratterate.yml`) → stale — `.github/workflows/` contains only `iterate.yml` + `on-pull.yml`; no `paratterate.yml` exists (§3.2).
9.  **Vulnerability baseline: FULL-AUDIT JUMP (loop-45 NEW)**: `pnpm audit --prod` → **31** vulnerabilities (5 critical | 7 high | 15 moderate | 4 low) — **unchanged from loop 44**; `pnpm audit` → **52** (7 critical | 15 high | 23 moderate | 7 low) — **+6 vs loop 44's 46** (high 13→15, moderate 21→23, low 5→7; criticals stable at 7). Tree unchanged (only markdown audits merged since loop 38) → advisory-database churn, not dependency change (§3.5).
10. **Vercel systemic failure re-confirmed (5/5)**: `Vercel` deployment status = `failure` on #1600/#1601/#1602/#1603/**#1604** — now including the loop-44 audit PR itself (§5.3).
11. **Zero-job `pull_request` anomaly sharpened (loop-45 NEW)**: REST endpoint `GET /actions/runs/{id}/jobs` for failed run `40024959648` returns **HTTP 404 Not Found** (not an empty list) — the run's job records are entirely absent from the API surface; schedule run `40040643967` (this run) provisions the `pull` job normally (§5.1).
12. **FAIL-SAFE**: durable capture = this audit + PR (issue creation/close is on the blocked surface).
13. **Probe hygiene**: three direct 403 probes this run (label add on #789, close #480, close #496); no probe branches created; workspace on `docs/issue-manager-audit-2026-10-23-loop45` branched from current `main`; only untracked harness artifacts (`.omo/run-continuation/*.json` from the failed subagent task) present — all commits are explicit-path.

### Action log

| Timestamp (UTC) | Action                                     | Target                                            | Result                                                                                                                                |
| --------------- | ------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 23:36           | Phase 0.1 entry: `gh pr list --state open` | repo `cpa03/basefly`                              | **0 open PRs** → Phase 0.2                                                                                                            |
| 23:36           | Phase 0.2 entry: `gh issue list`           | repo                                              | **82 open issues → ISSUE MANAGER MODE**                                                                                               |
| 23:37           | Issue-set digest                           | sorted issue-number sha256                        | 82 numbers, `84696e81…` — **match loops 33–44** → no drift                                                                            |
| 23:37           | Sync check                                 | `git fetch origin main`                           | `origin/main` = HEAD = `08b04cc` → 0 behind; worktree clean (tracked)                                                                 |
| 23:37           | Runner introspection                       | `env \| grep ^GITHUB_`                            | workflow `pull` (on-pull.yml), job `ci`, event `schedule`, run number 4920 → explains token permission set                            |
| 23:37           | Token identity                             | `gh auth status`                                  | `github-actions[bot]`; `GITHUB_TOKEN` (`ghs_…`)                                                                                       |
| 23:37           | Workflow inventory                         | `gh workflow list --all`                          | `parallel` = **disabled_manually**; `pull` + Dependabot active (unchanged)                                                            |
| 23:37           | STEP 1 label matrix                        | jq script over 82 issues                          | **33 compliant / 49 remediation** — structural match loops 7–44 (§1)                                                                  |
| 23:38           | STEP 1 label probe                         | `gh issue edit 789 --add-label P3`                | **403** `Resource not accessible by integration (addLabelsToLabelable)`                                                               |
| 23:38           | on-pull.yml permissions re-read            | `sed -n '1,20p' .github/workflows/on-pull.yml`    | `permissions:` = contents, pull-requests, actions, repository-projects, id-token — **no `issues: write`** (§4)                        |
| 23:38           | STEP 2 duplicate-close probe               | `gh issue close 480 --comment …`                  | **403** `Resource not accessible by integration (addComment)` → blocked                                                               |
| 23:38           | D2 defect check                            | `grep "npm ci" .github/workflows/iterate.yml`     | lines **72, 342** still `npm ci \|\| true` → D2/#670 confirmed genuine                                                                |
| 23:38           | Patch inventory                            | `ls docs/patches/`                                | `fix-pnpm-consistency-iterate-744.patch` + `on-pull-issues-write-permission.patch` + `iterate-yml-pnpm-consistency.md` present ✓      |
| 23:38           | D5 `.nvmrc` check                          | `cat .nvmrc`                                      | `22.14.0` ✓ (neither "missing" nor "invalid '20'") → #720/#748 stale                                                                  |
| 23:38           | D6 dependency JSON checks                  | `jq` on stripe/ui `package.json`                  | `next` absent from stripe deps ✓; ui `peerDependencies: {next >=14, react ^19, react-dom ^19}` ✓ → #785/#789 stale                    |
| 23:38           | D7 test-infrastructure checks              | `ls packages/auth/*.test.ts`, `vitest.config.ts`  | 3 auth test files ✓; `vitest.config.ts:16` includes `apps/nextjs/src/**` ✓                                                            |
| 23:38           | D3/D4 evidence                             | `find tests/e2e`, `find packages/api/src`         | **11 e2e specs** + fixtures ✓; **12 router test files** ✓ (incl. k8s/customer/stripe)                                                 |
| 23:39           | Workspace install                          | `pnpm install --frozen-lockfile`                  | **7.6s** (engine warning: node v20 vs wanted >=22 — pre-existing)                                                                     |
| 23:39           | STEP 4 verification: rate-limiter tests    | 3 `*rate-limiter*.test.ts` files                  | **98/98 passed** (1.12s, vitest 4.1.11) → #496 code-complete                                                                          |
| 23:39           | #496 AC evidence                           | `.env.example`, `resilience.ts`, `redis-setup.md` | 6 `RATE_LIMIT_*` entries; `RATE_LIMIT_ENV_VARS` (line 112); doc + implementation file present ✓                                       |
| 23:39           | Stale-set verification                     | first-hand `ls`/`grep`/`find` over 10 areas       | #613, #786, #720/#748, #515, #721/#498, #713, #719, #549–551, #631/#725, #501/#628/#724, #611/#666, #705/#706 all re-confirmed (§3.2) |
| 23:39           | STEP 4 repair attempt                      | `gh issue close 496 --comment …`                  | **403** `Resource not accessible by integration (addComment)` → FAIL-SAFE (§4)                                                        |
| 23:39           | Vulnerability baseline                     | `pnpm audit --prod` / `pnpm audit`                | **31 prod** (5c/7h/15m/4l — unchanged vs loop 44) / **52 full** (7c/15h/23m/7l — **+6 vs 44's 46**) → full-audit jump (§3.5)          |
| 23:40           | Vercel status check                        | statuses on merge SHAs #1600–#1604                | `failure` on all 5 (incl. loop-44 PR #1604) → systemic (§5.3)                                                                         |
| 23:40           | CI anomaly probe                           | `gh api /actions/runs/40024959648/jobs`           | **HTTP 404 Not Found** — job records absent from API (sharper than loop 44's `jobs: []`) (§5.1)                                       |
| 23:40           | Schedule-run health                        | `gh run view 40040643967`                         | `pull` job `in_progress` → schedule path healthy (§5.1)                                                                               |
| 23:40           | Subagent spawn                             | `category=quick` bg `bg_1d442729`                 | **FAILED** `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free` — 4th consecutive loop (§5.2)                       |
| 23:41           | Background-failure notification            | system reminder for `bg_1d442729`                 | exact error string captured (first-hand) → §5.2 evidence upgraded from `status=error` to full provider error                          |
| 23:40           | Skill load                                 | `github-workflow-automation`                      | permissions/concurrency model references applied to §4 root-cause + §5.1 analysis                                                     |
| 23:41           | Branch create                              | `docs/issue-manager-audit-2026-10-23-loop45`      | branched from `08b04cc` (current `main`)                                                                                              |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — exact structural match with loops 7–44 → no-flip-flop rule applies.

Independently re-derived partition this run (scripted over all 82 issues; identical to carried):

- **33 compliant**: `480, 483, 485, 486, 487, 488, 492, 494, 500, 501, 502, 503, 521, 578, 579, 580, 590, 609, 610, 611, 613, 650, 663, 664, 666, 667, 683, 684, 685, 687, 705, 706, 708`
- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (already carries `P3` + non-contract `DX-engineer`)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- **13 multi-category**: `305(ci,enhancement) · 496(enhancement,security) · 498(enhancement,security) · 515(enhancement,security) · 522(ci,enhancement,refactor) · 523(enhancement,refactor) · 549/550/551/581(enhancement,test) · 584(ci,enhancement) · 688(enhancement,security) · 713(enhancement,test)` — of these, `305, 584, 713` also lack priority
- **0 multi-priority**

**Union checks:** missing-priority = 24 ∪ {305, 584, 713} = **27** ✓ · missing-category = {670} ∪ 11 = **12** ✓ · multi-category = 13 ✓ · 33 + 27 + 12 + 13 − overlaps(13 includes the 3 missing-pri ones) = 82 ✓.

**Application attempt (first-hand this run):**

```
gh issue edit 789 --add-label "P3"
   → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim per no-flip-flop rule):**

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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–44.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (re-verified first-hand this run)

| ID  | Members                 | Canonical | Disposition (first-hand evidence this run)                                                                                                                                                                                                                            |
| --- | ----------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | Re-verified: 3 rate-limiter test files + **98/98 tests green this run** (23:39) → close 480 (attempted: 403 §4)                                                                                                                                                       |
| D2  | 305, 595, 670, 584, 744 | **670**   | `iterate.yml` `npm ci \|\| true` re-confirmed (lines 72, 342); workflow file only → close 305/595/584/744 (write blocked)                                                                                                                                             |
| D3  | 628, 501, 724           | **501**   | E2E specs present: **11 spec files + fixtures.ts** in `tests/e2e/` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) → close 628/724                                    |
| D4  | 631, 725, 754           | **725**   | **Router test files verified**: 12 files incl. `k8s-router`, `customer-router`, `stripe-router`, `integration`, `k8s`, `customer`, `stripe`, `admin`, `auth`, `validation` under `packages/api/src/router/` → close 631/754                                           |
| D5  | 720, 748                | **748**   | `.nvmrc` = `22.14.0` re-verified ✓ (neither "missing" nor "invalid '20'"); fix commit `de2d52b` references Issue #748 → both stale/closable                                                                                                                           |
| D6  | 785, 789                | —         | **Not duplicates**; 785 stale (`next` absent from `packages/stripe/package.json` dependencies ✓ — deps are `@saasfly/common, @saasfly/db, @t3-oss/env-nextjs, stripe, zod`); 789 stale (`peerDependencies: { next: >=14.0.0, react: ^19.0.0, react-dom: ^19.0.0 }` ✓) |
| D7  | 551, 550, 549, 581      | **581**   | Umbrella; children re-verified: k8s router tests ✓, `packages/auth` **3 test files** ✓ (`logger.test.ts`, `env.test.ts`, `clerk.test.ts`), `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}` ✓                                                           |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop-45)                                                                                                 |
| --- | ------------------ | --------- | ---------------------------------------------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | Confirmed first-hand — k8s router tests exist (`k8s-router.test.ts`, `k8s.test.ts`)                              |
| N2  | 523, 667           | **#523**  | Carried — barrel export audit / tree-shaking family (evidence unchanged since loop 43)                           |
| N3  | 751, 753, 723      | **#751**  | Carried — code splitting / bundle-size family (evidence unchanged since loop 43)                                 |
| N4  | 683, 684, 634, 719 | **#684**  | `719` stale confirmed first-hand (root `tsconfig.json` present ✓); rest carried                                  |
| N5  | 726, 488           | **#488**  | Carried — dependency check in CI family (evidence unchanged since loop 43)                                       |
| N6  | 611, 666           | **#666**  | Confirmed both stale first-hand — `error.tsx` + `not-found.tsx` in ≥5 route groups + `global-error.tsx` (root) ✓ |
| N7  | 705, 706           | **#705**  | Confirmed both stale first-hand — `Dockerfile` + `docker-compose.yml` + `.devcontainer/devcontainer.json` ✓      |

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection — P0 #496 (first-hand verification this run)

- P0 exists → contract selects highest-priority → **#496** (only P0 on the board; #480 is its duplicate).
- Re-verified **code-complete first-hand this run**: `pnpm exec vitest run` on 3 rate-limiter test files → **3 files, 98/98 passed** (1.12s).
- **Acceptance criteria matrix (first-hand artifact check, loop 45):**

| AC                                      | Verdict | Evidence (loop-45)                                                                                                  |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| Redis-backed rate limiter implemented   | ✓       | `packages/api/src/distributed-rate-limiter.ts` + `distributed-rate-limiter-sync.test.ts` + `rate-limiter.test.ts`   |
| Consistent limits across instances      | ✓       | `SyncRateLimiter` sync tests green (part of the 98)                                                                 |
| Configuration via environment variables | ✓       | 6 `RATE_LIMIT_*` entries in `.env.example`; `RATE_LIMIT_ENV_VARS` in `packages/common/src/config/resilience.ts:112` |
| Graceful degradation when Redis down    | ✓       | in-memory fallback path exercised by `rate-limiter.test.ts` (legacy suite, 98 total)                                |
| Unit tests for rate limiter             | ✓       | **98/98 green this run** (3 files, 1.12s)                                                                           |
| Documentation for setup/configuration   | ✓       | `docs/redis-setup.md` present ✓                                                                                     |

- **Repair action = administrative close → `gh issue close 496 --comment …` → 403 → FAIL-SAFE** (documented here; §4).
- No code change is required or permitted for the selected issue, therefore **no commit/PR linked to #496 was produced**.

### §3.1b Contingency repair — #670 (highest genuinely-open defect) — CARRIED, platform-blocked

`iterate.yml` lines 72 and 342 still carry `npm ci || true` (re-confirmed first-hand this run). The fix requires editing a workflow file, which the GitHub App token cannot push (§4: App lacks `workflows` permission; carried from loop-38 real-fix push). Canonical human-applicable remedy remains **`docs/patches/fix-pnpm-consistency-iterate-744.patch`** (verified present this run; companion write-up `docs/patches/iterate-yml-pnpm-consistency.md` also present).

### §3.2 Stale-set — spot re-verified first-hand this run

| Issue          | Claim                                    | Verdict (loop-45, first-hand)                                                                                                                                                                                           |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter           | **Re-verified: 98/98 tests green this run + AC matrix (§3.1)**                                                                                                                                                          |
| #786           | Stripe webhook partial-secret logging    | Stale — `webhooks/stripe/route.ts`: all 7 `logger.*` calls inspected (lines 60–201); explicit `safeSerializeError` redaction comment at signature-verification site; only `eventType`/`requestId`/`identifier` payloads |
| #720/#748      | `.nvmrc` missing / invalid               | Stale — `.nvmrc` = `22.14.0` ✓                                                                                                                                                                                          |
| #515           | CSRF protection                          | Stale — `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` ✓ + wired in `api/trpc/edge/[trpc]/route.ts` (`import { validateCSRF }`, line 10) ✓                                                                              |
| #721/#498      | Authz beyond auth / RBAC                 | Stale — `adminProcedure` (`trpc.ts:331`), DB `method: "database_role"` (`trpc.ts:277`) ✓                                                                                                                                |
| #789           | React peerDependencies in ui             | Stale — `peerDependencies: { next: >=14.0.0, react: ^19.0.0, react-dom: ^19.0.0 }` ✓                                                                                                                                    |
| #785           | Duplicate `next` in stripe pkg           | Stale — `next` absent from `packages/stripe/package.json` dependencies ✓                                                                                                                                                |
| #549/#550/#551 | Testing gaps                             | Stale — `packages/auth` 3 test files ✓, router tests ✓, `vitest.config.ts:16` includes `apps/nextjs/src/**` ✓                                                                                                           |
| #631/#725      | API router tests                         | Stale — 12 router test files incl. k8s/customer/stripe routers ✓                                                                                                                                                        |
| #501/#628/#724 | E2E testing                              | Stale — 11 Playwright specs incl. critical flows ✓                                                                                                                                                                      |
| #611/#666      | Error boundary / 404 pages               | Stale — `error.tsx` + `not-found.tsx` across ≥5 route groups + `global-error.tsx` ✓                                                                                                                                     |
| #705/#706      | Docker / devcontainer                    | Stale — `Dockerfile` + `docker-compose.yml` + `.devcontainer/devcontainer.json` ✓                                                                                                                                       |
| #713           | packages/common unit tests               | Stale — **28** test files under `packages/common/src/` ✓                                                                                                                                                                |
| #719           | Root TypeScript configuration            | Stale — root `tsconfig.json` present ✓                                                                                                                                                                                  |
| **#613**       | **Duplicate workflow `paratterate.yml`** | **Stale (loop-45 NEW) — `.github/workflows/` contains only `iterate.yml` + `on-pull.yml`; no `paratterate.yml` exists ✓**                                                                                               |

Closing any of these requires issue write → **403 → blocked (§4).**

### §3.3 P0/P1 evidence set — re-verified first-hand

| Issue | Claim                               | First-hand evidence (loop-45)                       |
| ----- | ----------------------------------- | --------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 RL tests green this run** + AC matrix ✓     |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → close attempted → 403  |
| #581  | Testing-infra umbrella (P1)         | Children verified present ✓                         |
| #515  | CSRF protection (P1)                | `csrf.ts` + `csrf.test.ts` + edge-route wiring ✓    |
| #498  | Role-based admin RBAC (P1)          | `adminProcedure` / DB `role` checks in `trpc.ts` ✓  |
| #786  | Webhook secret logging (P1)         | All 7 logger calls inspected — no secret material ✓ |

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

Carried unchanged from loop 44 §3.4: #670+D2 (workflow-file push blocked) · #687 · #663 · #609/#610 · #494 (large refactor — forbidden) · #723 · #650/#502 (workflow-file blocked) · #751/#708 · #630 · feature-grade items (#749, #668, #727, …).

### §3.5 Dependency vulnerability baseline — FULL-AUDIT JUMP (loop-45 NEW)

```
pnpm audit --prod  → 31 vulnerabilities: 5 critical | 7 high | 15 moderate | 4 low   (loop 44: 31 — UNCHANGED)
pnpm audit         → 52 vulnerabilities: 7 critical | 15 high | 23 moderate | 7 low  (loop 44: 46 — DELTA +6)
```

Loop 44 recorded +1/+2 upward movement; loop 45 shows the prod baseline **holding at 31** while the **full audit jumps +6** (high 13→15, moderate 21→23, low 5→7), with criticals stable at **5 prod / 7 full**. Tree is code-identical to loop 38 (only markdown audits merged since) → movement is **advisory-database churn against the same locked versions**, concentrated in dev/test dependency advisories. Baseline remains elevated and security-sensitive → human review. Not fixed in-loop: STEP 4 binds this run to **#496**; dependency bumps link to no open issue and the contract forbids _unrelated improvements_.

---

## §4 Blocked Write Paths (re-confirmed first-hand this run)

| Surface                   | Operation                                               | Result                                                                                         |
| ------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Issues (label, add)       | `gh issue edit 789 --add-label P3`                      | **403** `Resource not accessible by integration (addLabelsToLabelable)` (first-hand this run)  |
| Issues (comment/close)    | `gh issue close 480 --comment …`                        | **403** `Resource not accessible by integration (addComment)` (first-hand, STEP 2 target)      |
| Issues (comment/close)    | `gh issue close 496 --comment …`                        | **403** `Resource not accessible by integration (addComment)` (first-hand, STEP 4 target)      |
| Workflow files (push)     | loop-38 real-fix push (carried)                         | **`[remote rejected]`** GitHub App lacks `workflows` permission (not re-probed: probe hygiene) |
| PRs (git push) — CONTRAST | branch push + `gh pr create` + `gh pr edit --add-label` | Expected SUCCESS (`contents: write` + `pull-requests: write`, per loop 44 first-hand)          |

**Root cause (carried):** this run executes under `on-pull.yml` (`name: pull`, hourly `schedule`), whose top-level `permissions:` block (verified this run: `contents, pull-requests, actions, repository-projects, id-token`) lacks `issues: write`. The only workflow granting it (`iterate.yml`, `name: parallel`) remains **`disabled_manually`** — re-verified this run via `gh workflow list --all` (last run 2026-02-27, dormant ~8 months). Two viable human unblocks, both zero-code:

1.  **Re-enable the `parallel` workflow** (Actions UI) after triaging the 2026-02-27 Architect-stage failure.
2.  **Apply `docs/patches/on-pull-issues-write-permission.patch`** to `.github/workflows/on-pull.yml` via human/admin commit.

---

## §5 LOOP-45 Findings

### §5.1 Zero-job `pull_request` run failures — API evidence sharpened (UPDATE)

Loop 44 established that `pull_request` runs of `pull` conclude `failure` with an empty jobs array. Loop 45 probed deeper: `GET /repos/…/actions/runs/40024959648/jobs` returns **HTTP 404 Not Found** — the run's job records are not merely empty, they are **absent from the API surface entirely**, and the run's log endpoint returns `log not found` (loop 44). Meanwhile:

- This run's **schedule** execution (`40040643967`) provisions the `pull` job normally (`in_progress` at probe time).
- The 5 most recent `pull_request` runs (2× loop-44 audit PR, 3× loop-43 audit PR) are all `failure`.

**Impact**: red CI on every PR with no retrievable job/log data — human must inspect the Actions UI (raw log view) to root-cause; the REST API cannot expose it. Merge decisions continue to rely on locally executed gates (pre-commit: typecheck + full suite + check-deps + prettier).

### §5.2 Subagent model retirement — 4th consecutive loop (UPDATE)

Loop 44 showed both `category=quick` and `subagent_type=explore` failing. Loop 45 spawned `category=quick` (bg `bg_1d442729`) → hard failure with the exact provider error: **`ProviderModelNotFoundError: Model not found: opencode/muse-spark-1.3-contributor-free`** (suggested substitutes: `beam-free`, `deepseek-v4.1-flash-free`, `flint-40b-free`), thrown in `SessionPrompt.getModel` before any work started (0s duration, session `ses_e94dd3b64ffeNhInuT26bE8GSS`). This is the **4th consecutive loop** the delegation layer is down. All verification was executed first-hand. Fix = update agent→model mappings in `AGENTS.md`/`.opencode/` (retired model ID still referenced for the `explore` agent there).

### §5.3 Vercel preview failures continue repo-wide (UPDATE — 5/5)

Re-checked first-hand: `Vercel` deployment status = `failure` on **#1600** (merge 2026-10-22T20:58Z), **#1601** (02:15Z), **#1602** (13:20Z), **#1603** (18:19Z), and now **#1604** (21:13Z — the loop-44 audit PR itself). 5/5 merged PRs — systemic, non-attributable to merged changes (all diffs docs/UI-only). External Vercel namespace (`donis-projects-f77cd16a`) remains broken for previews; merge decisions treat this status as systemic.

### §5.4 PR-surface permission contrast

Issue-surface writes 403 on all three probes this run (§4), while PR-surface operations (branch push, `gh pr create`, `gh pr edit --add-label`) succeeded for loop 44's PR #1604 (first-hand last run) and are the expected path for this audit's PR.

### §5.5 Tracked prettier-cache file with literal quote characters in its filename (carried, re-checked)

`git status --short` this run reports only untracked `.omo/run-continuation/*.json` harness artifacts — the `'node_modules/.cache/.prettiercache'` phantom-dirty hazard recorded in loop 43/44 does not appear in this run's status output (tracked file unmodified). Hazard remains until untracked (§6 item 7).

---

## §6 Human Action Checklist (updated for loop 45)

1.  **Re-enable the `parallel` workflow** (Actions UI) after triaging the 2026-02-27 Architect failure — restores `issues: write` immediately (§4); **or** apply `docs/patches/on-pull-issues-write-permission.patch` to `on-pull.yml` via admin commit. Either action permanently unblocks STEP 1–3 (label normalization + dedupe closes).
2.  **Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch`** to `.github/workflows/iterate.yml` (D2/#670) — workflow-file pushes are platform-blocked for the App.
3.  **Close the stale-set** in §3.2 (now incl. **#613**) / clusters D1–D5, D7, N1–N7 with references per §2 dispositions (administrative action) — or let the re-enabled `parallel` stage-1 prompt execute the §1 payload.
4.  **Review the vulnerability baseline** (§3.5 — **31 prod / 52 full**, prod flat but full audit +6 this loop; prod criticals 5, full criticals 7) — security-sensitive, outside STEP 4 scope. Open a dedicated dependency-refresh issue/PR.
5.  **Refresh agent model IDs** (§5.2) — **4th consecutive loop** of subagent start failure; both category-routed and direct delegation remain down until `AGENTS.md`/`.opencode/` mappings are updated.
6.  **Repair the Vercel preview integration** (§5.3 — now **5/5** failures, incl. the loop-44 audit PR) — re-connect the project or refresh its tokens in the `donis-projects-f77cd16a` namespace.
7.  **Untrack the quote-named prettier cache** (§5.5) — `git rm` the `'node_modules/.cache/.prettiercache'` file (literal quotes in the filename) so worktree cleanliness checks stop reporting phantom modifications.
8.  **Investigate zero-job `pull_request` run failures** (§5.1 — now with 404-on-`/jobs` evidence) — open a failed run in the Actions UI and read its raw log; the REST API returns 404 for both jobs and logs of these runs. Until fixed, PR CI signal is effectively Vercel-only (and Vercel itself is red — item 6).
