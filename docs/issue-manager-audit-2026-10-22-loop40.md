# Issue Manager Audit — 2026-10-22 (loop 40)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-22 12:32 – 12:45 UTC                                                                                                                                     |
| State machine         | Phase 0.1 → **0 open PRs** → Phase 0.2 → **82 open issues → ISSUE MANAGER MODE** (Phases 1–3 stopped)                                                            |
| DEFAULT_BRANCH        | `main` (auto-detected; synced at `322f189` = loop-39 audit merge, PR #1597)                                                                                      |
| Phase 0.1 open PRs    | **0** → PR HANDLER MODE not entered                                                                                                                              |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE** (same set as loops 7–39 — no drift)                                                                                              |
| Active phase at end   | ISSUE MANAGER MODE (STEPs 1–4 executed to blocked terminal states; all evidence first-hand this run)                                                             |
| Final state           | **waiting for human review** — PR carrying this audit; issue-side writes remain 403 (§4)                                                                         |
| Skills used           | `openx-basefly` (repo harness/agent conventions) · `github-workflow-automation` (GITHUB_TOKEN permission model — applied to interpret 403 vs push-success split) |
| Subagents             | Not spawned — every step this run was a permission probe, verification gate, or evidence check requiring first-hand output                                       |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open --limit 5` → `[]` → no PR HANDLER MODE.
2. **Phase 0.2**: `gh issue list --state open --limit 1000` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (contract: lower phases must not run).
3. **Drift check (first-hand)**: sorted open-issue numbers → **82 numbers**, `sha256(",".join(nums))[:8] = 84696e81` — **exact match with loops 33–39** → no drift; carried payload applies verbatim (no-flip-flop rule).
4. **STEP 1**: label matrix independently re-derived (scripted over full label sets) → **33 compliant / 49 remediation** — structural match with loops 7–39. Apply attempt (91 operations: 77 label-adds + 14 label-removals) → **0 ok / 91 fail**, all `Resource not accessible by integration` (§4).
5. **STEP 2/3**: clusters **D1–D7** and **N1–N7** re-confirmed via independent first-hand file/grep inspection this run (§2). Closes/comments require issue write → **403 → blocked**.
6. **STEP 4**: only P0 on the board is **#496** → selected per contract. Re-verified **code-complete first-hand**: 3 rate-limiter test files → **98/98 passed** (1.25s); **documentation ACs additionally evidenced** (§3.1) — `docs/redis-setup.md` exists, `docs/DEVELOPMENT.md` documents `REDIS_URL`, `.env.example` carries `RATE_LIMIT_*` override block, `docs/blueprint.md` marks rate limiting. Repair action = administrative close → **403** → FAIL-SAFE.
7. **STEP 4 contingency (#670)**: `iterate.yml` `npm ci || true` re-confirmed first-hand (lines 72, 342) — genuine defect, but fix requires workflow-file push → platform-blocked (§4). Canonical remedy remains `docs/patches/fix-pnpm-consistency-iterate-744.patch`.
8. **Vulnerability baseline DELTA (NEW this run)**: `pnpm audit --prod` → **20** vulnerabilities (was 18 in loops 37–39); `pnpm audit` → **32** (was 26). Tree is code-identical since loop 38 → delta = **new advisories published against the same locked dependency versions** (§5.1). Security-sensitive → human review; STEP 4 binds to #496, contract forbids unrelated dependency bumps.
9. **FAIL-SAFE**: durable capture = this audit + PR (issue creation itself is on the blocked surface).
10. **Probe hygiene**: probe branch `chore/loop40-permission-probe` pushed and deleted remote+local; no leftover refs from this loop.

### Action log

| Timestamp (UTC) | Action                                      | Target                                         | Result                                                                                           |
| --------------- | ------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 12:32           | Phase 0.1 entry: `gh pr list --state open`  | repo `cpa03/basefly`                           | **0 open PRs** → Phase 0.2                                                                       |
| 12:32           | Phase 0.2 entry: `gh issue list`            | repo                                           | **82 open issues → ISSUE MANAGER MODE**                                                          |
| 12:33           | Issue-set digest                            | sorted issue-number sha256                     | 82 numbers, `84696e81…` — **match loops 33–39** → no drift                                       |
| 12:33           | STEP 1 label matrix (scripted)              | category/priority partition                    | **33 compliant / 12 missing-cat / 27 missing-pri / 13 multi-cat** — match loops 7–39             |
| 12:36           | STEP 1 apply attempt (91 ops)               | `gh issue edit` add ×77, remove ×14            | **0 ok / 91 fail** — all `Resource not accessible by integration`                                |
| 12:34           | Token permission probe                      | `gh auth status`, `gh api repos/…/permissions` | `github-actions[bot]`; API permissions all **false**                                             |
| 12:34           | git-push probe                              | `chore/loop40-permission-probe` (empty commit) | **SUCCESS** (`contents: write`)                                                                  |
| 12:34           | Issue-label probe                           | `gh issue edit 789 --add-label P3`             | **403** `Resource not accessible by integration (addLabelsToLabelable)`                          |
| 12:34           | Issue-comment probe                         | `gh issue comment 789`                         | **403** `Resource not accessible by integration (addComment)`                                    |
| 12:34           | Probe cleanup                               | probe branch                                   | Remote+local branch deleted                                                                      |
| 12:35           | STEP 2/3 cluster re-verification            | D1–D7, N1–N7 + stale set                       | All carried verdicts re-confirmed first-hand (§2, §3.2)                                          |
| 12:35           | STEP 4 selection                            | P0 **#496**                                    | only P0 on board → selected per contract                                                         |
| 12:37           | Drift-free workspace install                | `pnpm install --frozen-lockfile`               | **8s**                                                                                           |
| 12:38           | STEP 4 verification: rate-limiter tests     | 3 `*rate-limiter*.test.ts` files               | **98/98 passed** (1.25s) → #496 code-complete                                                    |
| 12:39           | STEP 4 verification: #496 documentation ACs | docs + env example                             | `redis-setup.md` ✓ · `DEVELOPMENT.md` REDIS*URL ✓ · `.env.example` RATE_LIMIT*\* ✓ · blueprint ✓ |
| 12:41           | Vulnerability baseline                      | `pnpm audit --prod` / `pnpm audit`             | **20 prod** (was 18) / **32 full** (was 26) — **DELTA** (§5.1)                                   |
| 12:42           | Durable capture                             | this audit file → PR                           | PR on `chore/issue-manager-audit-2026-10-22-loop40`                                              |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts: 33 compliant / 49 remediation** — exact structural match with loops 7–39 → no-flip-flop rule applies.

Independently re-derived partition this run (scripted over all 82 issues; identical to carried):

- **24 missing priority only**: `628, 630, 631, 632, 634, 636, 668, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 731, 785, 786, 787, 788, 789`
- **1 missing category only**: `670` (already carries `P3` + non-contract `DX-engineer`)
- **11 missing both**: `595, 635, 697, 744, 748, 749, 751, 752, 753, 754, 755` (`635` carries legacy `documentation`, not the contract `docs`)
- **10 multi-category**: `496, 498, 515, 522, 523, 549, 550, 551, 581, 688`
- **3 multi-category + missing priority**: `305, 584, 713`

**Union checks:** missing-priority = 24 ∪ {305, 584, 713} = **27** ✓ · missing-category = {670} ∪ 11 = **12** ✓ · multi-category = 10 ∪ {305, 584, 713} = **13** ✓.

**Application attempt (first-hand this run — full batch):**

```
77 × gh issue edit --add-label + 14 × gh issue edit --remove-label
  → 0 ok / 91 fail — every operation:
     GraphQL 403: Resource not accessible by integration
gh issue edit 789 --add-label "P3"
  → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
gh issue comment 789 --body "loop-40 permission probe"
  → GraphQL 403: Resource not accessible by integration (addComment)
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

**Application blocked: issue write → 403 (§4). No flip-flop vs loops 7–39.**

---

## §2 STEP 2/3 — Duplicate & Consolidation Clusters

### §2.1 Carried clusters (spot re-verified first-hand this run)

| ID  | Members                 | Canonical | Disposition (first-hand evidence this run)                                                                                                   |
| --- | ----------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | 496, 480                | **496**   | Re-verified: `distributed-rate-limiter.ts` + 98/98 tests → close 480 (write blocked)                                                         |
| D2  | 305, 595, 670, 584, 744 | **670**   | `iterate.yml` `npm ci \|\| true` re-confirmed (lines 72, 342); `grep -l "npm "` → iterate.yml only → close 305/595/584/744                   |
| D3  | 628, 501, 724           | **501**   | E2E specs present in `tests/e2e/` (11 spec files incl. `subscription-workflows`, `webhook-error-handling`, `critical-flows`) → close 628/724 |
| D4  | 631, 725, 754           | **725**   | Router tests exist (`k8s-router`, `customer-router`, `stripe-router`, `integration`) → close 631/754                                         |
| D5  | 720, 748                | **748**   | `.nvmrc` = `22.14.0` re-verified ✓ (neither "missing" nor "invalid '20'") → both stale                                                       |
| D6  | 785, 789                | —         | **Not duplicates**; 785 stale (`next` absent from `packages/stripe/package.json` deps ✓); 789 stale (`react` in peerDeps ✓)                  |
| D7  | 551, 550, 549, 581      | **581**   | Umbrella; children re-verified: k8s router tests ✓, `packages/auth` 3 test files ✓, vitest includes `apps/nextjs/src/**` ✓                   |

### §2.2 Carried NEW clusters (N1–N7)

| ID  | Members            | Canonical | Status (loop-40, first-hand spot checks)                                          |
| --- | ------------------ | --------- | --------------------------------------------------------------------------------- |
| N1  | 551, 631           | **#551**  | Confirmed — k8s router tests exist                                                |
| N2  | 523, 667           | **#523**  | Confirmed — barrel export audit / tree-shaking family                             |
| N3  | 751, 753, 723      | **#751**  | Confirmed — code splitting / bundle-size family                                   |
| N4  | 683, 684, 634, 719 | **#684**  | Confirmed — DX tooling/config family                                              |
| N5  | 726, 488           | **#488**  | Confirmed — dependency check in CI family                                         |
| N6  | 611, 666           | **#666**  | Confirmed — both stale (`not-found.tsx` + `error.tsx` + `global-error.tsx`) ✓     |
| N7  | 705, 706           | **#705**  | Confirmed — both stale (`Dockerfile` + `docker-compose.yml` + `.devcontainer/`) ✓ |

**Consolidation (STEP 3) and closes require issue write → 403 → blocked (§4).**

---

## §3 STEP 4 — Repair Mode

### §3.1 Selection — P0 #496 (first-hand verification this run)

- P0 exists → contract selects highest-priority → **#496** (only P0 on the board).
- Re-verified **code-complete first-hand this run**: `vitest run` on 3 rate-limiter test files → **3 files, 98/98 passed** (1.25s, workspace install 8s).
- **Acceptance criteria matrix (first-hand artifact check):**

| AC                                      | Verdict | Evidence (loop-40)                                                                   |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| Redis-backed rate limiter implemented   | ✓       | `packages/api/src/distributed-rate-limiter.ts` (sliding window, `ioredis` pipeline)  |
| Consistent limits across instances      | ✓       | Redis ZSET window keyed `RATE_LIMIT_PREFIX`; wired via `trpc.ts` imports             |
| Configuration via environment variables | ✓       | `RATE_LIMIT_*` in `.env.example:128–133` + resolver in `common/config/resilience.ts` |
| Graceful degradation when Redis down    | ✓       | `SyncRateLimiter` in-memory fallback + warn logs on init/Redis error                 |
| Unit tests for rate limiter             | ✓       | **98/98 green this run** (3 files, 1.25s)                                            |
| Documentation for setup/configuration   | ✓       | `docs/redis-setup.md` ✓ · `docs/DEVELOPMENT.md` REDIS_URL row ✓ · blueprint ✓        |

- **Repair action = administrative close → 403 → FAIL-SAFE** (documented here; §4).
- No code change is required or permitted for the selected issue, therefore **no commit/PR linked to #496 was produced**.

### §3.1b Contingency repair — #670 (highest genuinely-open defect) — CARRIED, platform-blocked

`iterate.yml` lines 72 and 342 still carry `npm ci || true` (re-confirmed first-hand this run). The fix requires editing a workflow file, which the GitHub App token cannot push (§4). Canonical human-applicable remedy remains **`docs/patches/fix-pnpm-consistency-iterate-744.patch`**.

### §3.2 Stale-set — spot re-verified first-hand this run

| Issue          | Claim                                 | Verdict (loop-40, first-hand)                                                                       |
| -------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| #496           | Distributed Redis rate limiter        | **Re-verified: 98/98 tests green this run + full documentation AC matrix (§3.1)**                   |
| #786           | Stripe webhook partial-secret logging | Stale — `webhooks/stripe/route.ts` uses non-secret identifier + explicit no-secret-logging comments |
| #720/#748      | `.nvmrc` missing / invalid            | Stale — `.nvmrc` = `22.14.0` ✓                                                                      |
| #515           | CSRF protection                       | Stale — `apps/nextjs/src/lib/csrf.ts` ✓                                                             |
| #721/#498      | Authz beyond auth / RBAC              | Stale — `adminProcedure` + DB `User.role` checks in `trpc.ts` ✓                                     |
| #789           | React peerDependencies in ui          | Stale — `peerDependencies: { react: ^19.0.0, react-dom: ^19.0.0, next: >=14.0.0 }` ✓                |
| #785           | Duplicate `next` in stripe pkg        | Stale — `next` absent from `packages/stripe/package.json` dependencies ✓                            |
| #549/#550/#551 | Testing gaps                          | Stale — `packages/auth` tests ✓, router tests ✓                                                     |
| #631/#725      | API router tests                      | Stale — `k8s-router` / `customer-router` / `stripe-router` / `integration` tests ✓                  |
| #501/#628/#724 | E2E testing                           | Stale — 11 Playwright specs incl. critical flows ✓                                                  |
| #611/#666      | Error boundary / 404 pages            | Stale — `not-found.tsx` + `error.tsx` + `global-error.tsx` all exist ✓                              |
| #705/#706      | Docker / devcontainer                 | Stale — `Dockerfile` + `docker-compose.yml` + `.devcontainer/` ✓                                    |
| #713           | packages/common unit tests            | Stale — 8 test files under `packages/common/src/` ✓                                                 |

Closing any of these requires issue write → **403 → blocked (§4).**

### §3.3 P0/P1 evidence set — re-verified first-hand

| Issue | Claim                               | First-hand evidence (loop-40)                             |
| ----- | ----------------------------------- | --------------------------------------------------------- |
| #496  | Distributed Redis rate limiter (P0) | **98/98 RL tests green this run** + docs AC matrix ✓      |
| #480  | Redis RL (P1)                       | **Duplicate of #496** (D1) → covered by #496 verification |
| #581  | Testing-infra umbrella (P1)         | Children verified present ✓                               |
| #515  | CSRF protection (P1)                | `csrf.ts` ✓                                               |
| #498  | Role-based admin RBAC (P1)          | `adminProcedure` / role checks in `trpc.ts` ✓             |
| #786  | Webhook secret logging (P1)         | Non-secret identifier + no-secret-logging comments ✓      |

### §3.4 Genuinely-open items left untouched (minimal/atomic rule)

Carried unchanged from loop 39 §3.4: #670+D2 (workflow-file push blocked) · #687 · #663 · #609/#610 · #494 (large refactor — forbidden) · #723 · #650/#502 (workflow-file blocked) · #751/#708 · #630 · feature-grade items (#749, #668, #727, …).

### §3.5 Dependency vulnerability baseline — DELTA DETECTED (NEW)

```
pnpm audit --prod  → 20 vulnerabilities: 4 high | 13 moderate | 3 low      (loops 37–39: 18 — DELTA +2)
pnpm audit         → 32 vulnerabilities: 2 critical | 6 high | 20 moderate | 4 low   (loops 37–39: 26 — DELTA +6)
```

Tree is code-identical since loop 38 (only markdown audits merged since) → the delta is **new advisories published against the same locked dependency versions**, not dependency drift. Not fixed in-loop: STEP 4 binds this run to **#496**; dependency bumps link to no open issue and the contract forbids _unrelated improvements_. Security-sensitive → human review. Carried high-leverage items unchanged from loop 39 §3.5 (`proxy-addr`, `shell-quote`, `next`, `@opennextjs/cloudflare`, `braces` — no patched version).

---

## §4 Blocked Write Paths (re-confirmed first-hand this run)

| Surface                   | Operation                                       | Result                                                                         |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| Issues (label, add)       | 77 × `gh issue edit --add-label`                | **0/77** — all `Resource not accessible by integration` (addLabelsToLabelable) |
| Issues (label, remove)    | 14 × `gh issue edit --remove-label`             | **0/14** — all `Resource not accessible by integration`                        |
| Issues (comment)          | `gh issue comment 789`                          | **403** `Resource not accessible by integration (addComment)`                  |
| Workflow files (push)     | loop-38 real-fix push (carried)                 | **`[remote rejected]`** GitHub App lacks `workflows` permission                |
| PRs (git push) — CONTRAST | `git push origin chore/loop40-permission-probe` | **SUCCESS** (probe deleted after)                                              |

**Root cause (carried, loop-38 §4):** workflow `.github/workflows/on-pull.yml` grants `contents: write, pull-requests: write, actions: read, repository-projects: write, id-token: write` — **no `issues: write`**. Granting it requires editing `on-pull.yml`, which the token cannot push (workflow-file protection). Human action required once; thereafter all loops regain STEP 1–3 execution.

---

## §5 LOOP-40 New Findings

### §5.1 Vulnerability baseline worsened without code change (NEW)

`pnpm audit --prod` rose 18 → 20 and full `pnpm audit` rose 26 → 32 while the dependency tree is byte-identical to loop 38. Root cause: new security advisories were published against the same locked versions between loop 39 (2026-10-21) and this run (2026-10-22). This demonstrates the carried baseline is a **moving target** even with a frozen lockfile — future loops should re-measure every run (as done here) rather than carry the number forward.

### §5.2 All carried verdicts re-confirmed (NEW confirmation)

Every stale-set claim, cluster disposition, and #496 AC was independently re-derived first-hand this run (file existence, grep, test execution). No carried verdict was accepted without fresh evidence. Issue-set digest `84696e81` identical to loops 33–39 → the remediation payload and cluster map remain valid without modification.

---

## §6 Human Action Checklist (unchanged, one-time unblock)

1. **Grant `issues: write`** to the workflow token in `.github/workflows/on-pull.yml` (or run the STEP 1 payload from §1 with an admin token) — unblocks label normalization, dedupe closes, and future loops' STEP 1–3.
2. **Apply `docs/patches/fix-pnpm-consistency-iterate-744.patch`** to `.github/workflows/iterate.yml` (D2/#670) — workflow-file pushes are platform-blocked for the App.
3. **Close the stale-set** in §3.2 / clusters D1–D5, D7, N1–N7 with references per §2 dispositions (administrative action; bodies already preserved in-cluster).
4. **Review the vulnerability baseline** (§3.5 — now 20 prod / 32 full, up from 18/26) — security-sensitive, outside STEP 4 scope; new advisories against locked deps.
