# Issue Manager Audit — 2026-10-28 (loop 54)

**Generated:** 2026-10-28T14:45Z
**Workflow:** `on-pull.yml` (schedule, hourly) — `/ulw-loop` autonomous maintenance
**Active phase:** Phase 0 → STEP 0.2 → **ISSUE MANAGER MODE** (no open PRs; 82 open issues)
**Final state:** ⏸ **waiting for human review** — `issues: write` remediation required (see §8)

---

## 1. Decision summary

| Step                      | Outcome                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 0.1 Open PRs              | 0 found → not PR Handler Mode                                                                                 |
| 0.2 Open issues           | 82 found → **ISSUE MANAGER MODE** entered; Phases 1–3 stopped per state machine                               |
| STEP 1 — Normalize labels | ❌ **BLOCKED** (no `issues: write`) — re-probed this run; 39 unlabeled issues; plan preserved (§4)            |
| STEP 2/3 — Dedupe/close   | ❌ **BLOCKED** (same permission) — analysis refreshed; **6 new staleness findings** beyond loop 53 (§5)       |
| STEP 4 — REPAIR           | ✅ **Ran.** Selected #496 [P0]. Independently verified **already complete**. Full suite green. No code change |
| Health gate               | ✅ tests **2230/2230** · lint **9/9** · build **exit 0** on `main` (§7)                                       |

No issues, labels, or comments were modified: every `gh issue *` write attempt returns
`Resource not accessible by integration` (HTTP 403). No fix PR was opened because the
selected P0 requires **no code change** — an empty/no-op PR would violate the
"minimal, atomic changes / never unstable changes" contract.

**Skills used this run:** `github-workflow-automation` (sync-before-PR, permission and
branch patterns — consistent with this run's PR flow), `commit-message` (conventional
`docs: … (loop N)` style for this doc's commit).
**Subagents:** direct tools used (prior runs' `explore` subagent model
`opencode/muse-spark-1.3-contributor-free` remains unavailable — see loop 53 §2).

---

## 2. Capability findings (re-verified 2026-10-28 ~14:35–14:44Z)

| Probe (this run)                                    | Result                                              |
| --------------------------------------------------- | --------------------------------------------------- |
| `gh issue edit 789 --add-label P2` (GraphQL)        | ❌ 403 `Resource not accessible by integration`     |
| `gh issue create … --label ci --label P1` (GraphQL) | ❌ 403 `createIssue` — FAIL-SAFE issue path blocked |
| `GET /repos/cpa03/basefly` → `.permissions`         | `admin/maintain/pull/push/triage: false`            |
| `gh pr list` / PR create capability                 | ✅ 0 open PRs; PR path proven by #1621/#1622        |
| Root cause                                          | `on-pull.yml` missing `issues: write` (§8)          |

Self-heal remains impossible: the token cannot push files under `.github/workflows/`
(platform restriction, commit `caab1f59`). The FAIL-SAFE rule ("create an issue
explaining the uncertainty") was **attempted literally** this run — `gh issue create`
returned 403 — so the uncertainty is documented here instead (§8).

---

## 3. STEP 4 — REPAIR MODE on #496 [P0] (selected issue)

**Selection:** #496 — unique P0 ("Replace in-memory rate limiter with distributed store (Redis)").
**Outcome: VERIFIED COMPLETE on `main` — no code change required.** Closure blocked (§2).

| Acceptance criterion (from #496 body)       | Evidence in `main` (verified 2026-10-28 ~14:36–14:44Z)                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Redis-backed rate limiter implemented       | `packages/api/src/distributed-rate-limiter.ts`; wired via `packages/api/src/trpc.ts` (import line 19, middleware usage)            |
| Rate limits consistent across instances     | Shared Redis ZSET sliding-window state (`getLimiter`/`getIdentifier` exports)                                                      |
| Configuration via environment variables     | `.env.example:124–133` (`REDIS_URL`, `RATE_LIMIT_{READ,WRITE,STRIPE}_*`)                                                           |
| Graceful degradation when Redis unavailable | `packages/api/src/rate-limiter.ts` in-memory fallback + `logger.warn` (line 76)                                                    |
| Unit tests for rate limiter                 | ✅ **included in full run: 2230/2230 passed** (`distributed-rate-limiter*.test.ts`, `rate-limiter.test.ts`), vitest 4.1.11, exit 0 |
| Documentation for setup/configuration       | `docs/redis-setup.md`, `docs/caching.md` (both linked from `docs/README.md`)                                                       |

**Near-duplicate #480** (P1, same subject): same verdict — stale, close with reference to #496.

---

## 4. STEP 1 — Label normalization (prepared, NOT applied)

39 of 82 open issues lack a category and/or priority label. Authoritative pending
assignments: [issue-manager-blocker-2026-10-27.md §3](./issue-manager-blocker-2026-10-27.md)
(verified unchanged this run — same 39 issue numbers).

Additional deltas observed this run (advisory, add to §3 when unblocked):

- **#713** carries TWO category labels (`enhancement` + `test`) → violates "exactly one" → keep `test`, drop `enhancement`.
- **#635** uses `documentation` instead of the mandated `docs` category → relabel.
- **#670** still missing category only → planned `ci` (P3 already present).

---

## 5. STEP 2/3 — Duplicate & staleness analysis (refreshed, NOT closed)

### 5.1 New staleness findings this loop (beyond loop 53)

| Issue    | Claim                                                       | Status in `main` (evidence, verified this run)                                                                                                               |
| -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **#631** | k8s/customer/stripe router tests missing                    | ✅ **COMPLETE** — `packages/api/src/router/{k8s,customer,stripe}-router.test.ts` exist (k8s 458 lines)                                                       |
| **#748** | `.nvmrc` invalid value '20'                                 | ✅ **FIXED** — `.nvmrc` = `22.14.0`; commits `de2d52b` ("…Issue #748 (#758)"), `101a729`, `3e06f70`                                                          |
| **#720** | `.nvmrc` missing                                            | ✅ **STALE** — file exists (same fix chain as #748)                                                                                                          |
| **#788** | apps/nextjs has NO UI component tests (only 3 hook tests)   | ⚠️ **PREMISE FALSE** — 24 files in `apps/nextjs/src/components/__tests__/`; AC met: Navbar ✓ Modal ✓ ClusterList ✓; StatusBadge: no such component exists    |
| **#721** | Missing explicit authorization checks beyond authentication | ✅ **LIKELY COMPLETE** — `requireRole`/`createRoleBasedProcedure` (`trpc.ts:349,423`), 7 guarded procedures, `rbac.test.ts` (266 lines), blueprint RBAC docs |
| **#786** | Stripe webhook logs partial secret                          | ✅ stale (loop 53 §5: referenced file path doesn't exist; actual webhook route has no secret logging)                                                        |

### 5.2 Partially valid — keep, but premises are stale

| Issue    | Verdict                                                                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **#725** | Integration tests: `integration.test.ts` now covers **rate limiting, CSRF, auth propagation**; remaining gap = concurrency/rollback edge cases → **narrow scope**; **close #631 as its duplicate+complete subset** |
| **#787** | Premise stale (7 db test files exist incl. `migrations.test.ts`, not 2) but **service tests genuinely missing** (`k8sClusterService`/`customerService` untested) → keep, update premise                            |
| **#722** | `validateEnvVars()` implemented + tested (`env.ts:108`, `env-validation.test.ts`) but **no startup caller** in apps/nextjs → keep (wiring gap is the real work)                                                    |

### 5.3 Duplicate clusters (blocker doc §4 re-verified — all members still open)

| Cluster                     | Canonical → close/consolidate                                                    | Update this run                                                             |
| --------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| pnpm/npm CI consistency (6) | **#305** → close #744, #670, #595, #584; keep #579 (distinct)                    | unchanged                                                                   |
| Rate limiter → Redis (2)    | **#496** → close #480                                                            | both complete → close both (§3)                                             |
| E2E / Playwright (3)        | **#501** → close #628, #724                                                      | **whole cluster now stale** — 11 specs incl. `critical-flows.spec.ts` exist |
| .nvmrc (2)                  | ~~#748 canonical~~ → **close BOTH #748 + #720 as fixed** (PR #758)               | **supersedes blocker doc §4**                                               |
| Barrel exports (3)          | **#523** → consolidate #687, #667                                                | unchanged                                                                   |
| API router tests (2)        | **#725** (narrowed) → close #631                                                 | **new cluster found this run**                                              |
| Bundle/code splitting (4)   | keep #753, #751, #723, #729 (distinct angles)                                    | unchanged                                                                   |
| Auth testing (2)            | keep both as distinct — but **both complete** (#500, #549) → close with evidence | updated verdicts                                                            |

### 5.4 Recommended closure set for the next unblocked run

Close with completion references (preserve bodies per contract):
**#496, #480, #498, #500, #501, #515, #549, #550, #551** (loop 53 §5, re-verified) +
**#631, #748, #720, #721, #786, #788, #628, #724** (new this run).
Keep open: **#581** (meta umbrella — thresholds 25/20/20/25, raising to 80% would fail CI),
**#725/#787/#722** (real remaining work, narrowed).

---

## 6. P0/P1 staleness survey (re-verified independently)

| Issue     | Status in `main` (this run)                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #496 (P0) | ✅ complete — §3                                                                                                                                                   |
| #480 (P1) | ✅ duplicate + stale                                                                                                                                               |
| #498 (P1) | ✅ `enum Role` (`schema.prisma:14`), `requireRole`, `audit: true` markers (`trpc.ts:275,316,375`), ADMIN_EMAIL migration path, `rbac.test.ts`, blueprint RBAC docs |
| #500 (P1) | ✅ `packages/auth/clerk.test.ts` (251 lines)                                                                                                                       |
| #501 (P1) | ✅ 11 Playwright specs + `playwright.config.ts`                                                                                                                    |
| #515 (P1) | ✅ CSRF middleware (15 refs in `trpc.ts`), `apps/nextjs/src/lib/csrf.test.ts` (110 lines), `authorization-bypass.spec.ts`                                          |
| #549 (P1) | ✅ `clerk/env/logger.test.ts` in packages/auth                                                                                                                     |
| #550 (P1) | ✅ `vitest.config.ts:16` coverage + `:67` test include cover `apps/nextjs/src/**`                                                                                  |
| #551 (P1) | ✅ `k8s-router.test.ts` (458 lines)                                                                                                                                |
| #581 (P1) | ⚠️ meta-issue → keep open (see §5.4)                                                                                                                               |

---

## 7. Repository health evidence (this run, `main` @ `68b34b0`)

| Gate        | Command                          | Result                                                                                                                                           |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Install     | `pnpm install --frozen-lockfile` | ✅ 7.4s                                                                                                                                          |
| Tests       | `pnpm test`                      | ✅ **157 files, 2230/2230 passed**, exit 0 (43.7s)                                                                                               |
| Lint        | `pnpm lint`                      | ✅ **9/9 tasks**, exit 0 (46.2s)                                                                                                                 |
| Build       | `pnpm build`                     | ✅ **1/1 task**, exit 0 (33.3s)                                                                                                                  |
| Observation | —                                | `pnpm` warns `wanted node>=22, current v20.20.2` — runner toolchain only; `.nvmrc` (22.14.0) and `engines` (>=22) are consistent with each other |

---

## 8. Remediation required (human / PAT with `workflows: write`)

Third consecutive day of the same blocker. Outstanding fix:

```yaml
# .github/workflows/on-pull.yml
permissions:
  contents: write
  issues: write # ← ADD THIS LINE
  pull-requests: write
```

Verification after applying (from blocker doc §7):

```bash
gh issue edit 789 --add-label P2   # should succeed
gh issue comment 789 --body "test" # should succeed
```

Then re-run the loop: STEP 1 (39 label assignments, §4), STEP 2/3 (closures per §5.4,
clusters per §5.3) become executable; Repair Mode will find no remaining P0/P1 code work.

---

## 9. Action log (2026-10-28, UTC)

| Time   | Action                                                        | Target                                     | Result                                         |
| ------ | ------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| ~14:34 | `gh pr list --state open`                                     | repository                                 | 0 open PRs → Step 0.2                          |
| ~14:34 | `gh issue list --state open --limit 200`                      | repository                                 | 82 open issues → ISSUE MANAGER MODE            |
| ~14:35 | Label probe `gh issue edit 789 --add-label P2`                | GITHUB_TOKEN                               | ❌ 403 → STEP 1 BLOCKED                        |
| ~14:35 | Permission probe `gh api repos/…` → `.permissions`            | GITHUB_TOKEN                               | all false; issue writes denied                 |
| ~14:36 | P0/P1 enumeration (1 P0 + 9 P1) + issue bodies #496/#480/#498 | selection for STEP 4                       | #496 selected                                  |
| ~14:36 | Acceptance-criteria verification #496 (files/env/docs/wiring) | `main`                                     | 6/6 criteria met                               |
| ~14:37 | `pnpm install --frozen-lockfile`                              | workspace                                  | ✅ 7.4s                                        |
| ~14:38 | `pnpm test`                                                   | full suite                                 | ✅ 2230/2230, exit 0                           |
| ~14:38 | RBAC/CSRF/coverage/e2e evidence sweep                         | #498/#515/#550/#501/#549/#551              | all complete                                   |
| ~14:39 | `pnpm lint`                                                   | monorepo                                   | ✅ 9/9, exit 0                                 |
| ~14:40 | FAIL-SAFE probe `gh issue create … --label ci --label P1`     | remediation issue                          | ❌ 403 `createIssue` → documented here instead |
| ~14:41 | Cluster membership re-check (22 issues, 8 clusters)           | STEP 2/3                                   | all confirmed open; 2 clusters superseded      |
| ~14:42 | Staleness sweep #631/#748/#720/#788/#787/#725/#721/#722       | STEP 2/3                                   | 6 new stale findings (§5.1)                    |
| ~14:43 | `pnpm build`                                                  | monorepo                                   | ✅ 1/1, exit 0                                 |
| ~14:44 | Branch from `origin/main` (`68b34b0`)                         | docs/issue-manager-audit-2026-10-28-loop54 | ✅ synced to DEFAULT_BRANCH                    |
| ~14:45 | Write audit doc → commit → push → PR (labels `docs`, `P3`)    | loop-54 audit                              | ✅ opened for next PR Handler run              |

---

## 10. Final state

**⏸ waiting for human review** — the only executable deliverable (documentation PR) is
open; all issue-tracker mutations remain blocked by the `issues: write` gap (§8).

_Maintained autonomously by `/ulw-loop` (loop 54). No issues created/labeled/commented/
closed (permission blocker — probe evidence §2). No source code modified — this PR is
documentation-only._
