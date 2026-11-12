# Issue Manager Audit — 2026-11-12

**Evaluation date:** 2026-11-12 (UTC)
**Active phase:** Phase 0 → **ISSUE MANAGER MODE** (0 open PRs; 82 open issues)
**Default branch:** `main`
**Final state:** waiting for human review (permission-blocked closures; prepared plans below)

---

## 1. Decision summary

| Check       | Result                                   | Routing                                            |
| ----------- | ---------------------------------------- | -------------------------------------------------- |
| Open PRs    | **0** (`gh pr list --state open` → `[]`) | Not PR Handler Mode                                |
| Open issues | **82**                                   | **ISSUE MANAGER MODE** entered; Phases 1–3 not run |

Phase 0.3 (empty repo) does not apply. Per the state machine, all lower phases are suppressed while Issue Manager Mode is active.

---

## 2. Permission matrix (first-hand probes, this run)

The workflow token is `github-actions[bot]` (GITHUB_TOKEN). Effective repository permissions from `GET /repos/cpa03/basefly`: `admin/maintain/pull/push/triage = false`, yet git push and PR mutations succeed (workflow-level grants). Issue mutations do **not**.

| Operation               | Endpoint / command                           | Result                           |
| ----------------------- | -------------------------------------------- | -------------------------------- |
| Read issues / PRs       | `gh issue list`, `gh pr list`                | ✅                               |
| Git push (branch)       | `git push -u origin <branch>`                | ✅                               |
| Create PR               | `gh pr create`                               | ✅ (probe #1645)                 |
| Close PR + PR comment   | `gh pr close --comment`                      | ✅                               |
| Comment on **PR**       | `POST …/issues/<pr#>/comments`               | ✅                               |
| Create **issue**        | GraphQL `createIssue` / REST `POST …/issues` | ❌ 403                           |
| Comment on **issue**    | REST/GraphQL `addComment`                    | ❌ 403                           |
| Add **labels** to issue | REST/GraphQL `addLabelsToLabelable`          | ❌ 403                           |
| Close **issue**         | REST `PATCH …/issues/<n>` `state=closed`     | ❌ 403                           |
| Create repo label       | `POST …/labels`                              | ✅ (unused; probe label deleted) |

**Consequence:** Issue Manager Steps 1–3 (normalize, dedupe, consolidate) and issue closure in Step 4 are **blocked**. PR creation works, so a repair PR would be possible _if_ a legitimate unshipped fix existed. Root cause: `.github/workflows/on-pull.yml` declares `contents: write`, `pull-requests: write` but **not** `issues: write` (unlike `iterate.yml`, which does declare it).

Probe hygiene: probe branches `probe/perm-test` and `probe/pr-perm` were deleted remote+local; probe PR #1645 was closed; probe repo label deleted; probe comment attempts all failed with 403 (nothing persisted on issues).

---

## 3. Step 1 — Issue normalization (PREPARED, NOT APPLIED)

**Inventory:** 82 open issues. 43 already carry ≥1 category + ≥1 priority label. **39** need one or both.

**Label taxonomy used (contract):** category ∈ {bug, enhancement, feature, docs, refactor, chore, test, ci, security}; priority ∈ {P0…P3}. Specialist labels (e.g. `DX-engineer`) are left untouched; they do not substitute for a category.

### 3.1 Prepared label additions (39 issues)

| Issue | Labels to add   | Rationale                                                           |
| ----- | --------------- | ------------------------------------------------------------------- |
| #789  | P3              | React peerDeps hygiene                                              |
| #788  | P2              | UI unit tests                                                       |
| #787  | P2              | db migration tests                                                  |
| #786  | P1              | security: partial secret logging (see §5.3 — already fixed in code) |
| #785  | P3              | duplicate dep hygiene (see §5.3 — already clean)                    |
| #755  | enhancement, P2 | composite index perf                                                |
| #754  | test, P2        | Stripe webhook idempotency tests                                    |
| #753  | enhancement, P2 | route-based code splitting                                          |
| #752  | enhancement, P3 | CLI output utilities                                                |
| #751  | enhancement, P2 | tRPC bundle size                                                    |
| #749  | enhancement, P3 | AI API doc generator                                                |
| #748  | bug, P2         | invalid `.nvmrc` (see §5.3 — fixed: `22.14.0`)                      |
| #744  | ci, P2          | pnpm in iterate.yml                                                 |
| #731  | P3              | auto-generate API docs                                              |
| #729  | P3              | bundle size regression tests                                        |
| #728  | P2              | security scanning workflows                                         |
| #727  | P3              | AI code review automation                                           |
| #726  | P3              | dependency consistency CI                                           |
| #725  | P2              | API router integration tests                                        |
| #724  | P2              | e2e coverage gaps                                                   |
| #723  | P2              | client component bundle weight                                      |
| #722  | P2              | env validation at startup                                           |
| #721  | P1              | explicit authorization checks                                       |
| #720  | P3              | missing `.nvmrc` (see §5.3 — fixed)                                 |
| #719  | P3              | root tsconfig                                                       |
| #713  | P2              | packages/common unit tests                                          |
| #697  | docs, P2        | corrupted docs formatting                                           |
| #670  | ci              | pnpm in iterate.yml (has P3 already)                                |
| #668  | P3              | cluster diagnostics AI                                              |
| #636  | P3              | ISR caching                                                         |
| #635  | docs, P3        | onboarding guide (has `documentation` label; add contract `docs`)   |
| #634  | P2              | TypeScript strictness                                               |
| #632  | P1              | sensitive data in error logs                                        |
| #631  | P2              | API router tests                                                    |
| #630  | P3              | pre-commit hooks                                                    |
| #628  | P2              | Playwright E2E                                                      |
| #595  | ci, P2          | npm→pnpm workflows                                                  |
| #584  | P2              | remaining pnpm inconsistencies                                      |
| #305  | P2              | standardize pnpm (has `ci` already)                                 |

**Apply command shape (once `issues: write` is granted):**

```bash
gh issue edit <n> --add-label <labels>   # one row per issue above
```

---

## 4. Steps 2–3 — Duplicate detection & consolidation (PREPARED, NOT APPLIED)

Semantic clusters (title+body similarity). Canonical issue kept; duplicates closed **with a reference comment** (information preserved by linking, not deleting).

| Cluster                       | Canonical     | Close as duplicate of canonical | Notes                                                                                                         |
| ----------------------------- | ------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Distributed rate limiter      | **#496** (P0) | **#480** (P1)                   | Same goal; #496 more specific + P0; both fully shipped (§5.1)                                                 |
| pnpm CI consistency           | **#305**      | #584, #595, #670, #744          | Same workflow-package-manager theme; #305 is the umbrella                                                     |
| `.nvmrc`                      | **#720**      | #748                            | #748 is the “invalid value” variant of #720 “missing”; both resolved in code (§5.3) — close both as completed |
| Playwright / e2e              | **#501** (P1) | #628, #724                      | #501 is the prioritized umbrella; specs exist under `tests/e2e/`                                              |
| API router tests              | **#631**      | #725                            | Same test surface (k8s/customer/stripe routers); files already exist                                          |
| Testing umbrella              | **#581** (P1) | —                               | Close as **completed**: children #549, #550, #551, #500, #501 all have shipped artifacts (§5.2)               |
| Stripe webhook secret logging | **#786**      | —                               | Close as **completed**: no partial-secret logging remains (§5.3)                                              |

### 4.1 Stale / already-shipped closes (evidence in §5.3)

| Issue      | Action          | Evidence                                                                                                                                 |
| ---------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| #613       | Close completed | Duplicate workflow file removed (`0db3181 ci: remove duplicate GitHub Actions workflow file`); only `iterate.yml` + `on-pull.yml` remain |
| #578       | Close completed | Single health route: `apps/nextjs/src/app/api/health/route.ts`                                                                           |
| #785       | Close completed | `packages/stripe/package.json` has no `next` dependency at all                                                                           |
| #720, #748 | Close completed | `.nvmrc` = `22.14.0` (fixes via `de2d52b` / `#758`, `101a729`, `3e06f70`)                                                                |
| #496, #480 | Close completed | Shipped + 109/109 tests (§5.1)                                                                                                           |
| #581       | Close completed | Umbrella children shipped (§5.2)                                                                                                         |

### 4.2 Consolidation (Step 3) — group small similar issues (no information loss)

Do **not** close these; instead add a tracking comment on the canonical linking the group (or open nothing — the canonical already tracks them):

1. **pnpm/CI family:** #305 (canonical), #584, #595, #670, #744 — real remaining work: `iterate.yml` still runs `npm ci || true` at lines 72 and 342 (should be pnpm or removed). Keep #305 open until that lands.
2. **Bundle-size family:** #751 (canonical for tRPC), #723, #753, #729, #708 — related but distinct surfaces; link, don’t merge bodies.
3. **Security hardening family:** #721, #722, #632, #515, #498 — link as a security epic comment on the lowest-numbered open one (#498).

---

## 5. Step 4 — Repair Mode (EXECUTED)

### 5.1 Selection

P0 present → selected **#496** `[P0][Security] Replace in-memory rate limiter with distributed store (Redis)` (highest priority; #480 is its duplicate).

### 5.2 First-hand verification that #496 is fully shipped

| Acceptance criterion      | Status | Evidence                                                                                                                                                        |
| ------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redis-backed rate limiter | ✅     | `packages/api/src/distributed-rate-limiter.ts` — `DistributedRateLimiter` (sliding window via ZSET pipeline)                                                    |
| Wired into request path   | ✅     | `packages/api/src/trpc.ts:439` → `await limiter.checkAsync(identifier)`; also `apps/nextjs/.../webhooks/stripe/route.ts:57`, `apps/nextjs/.../docs/route.ts:85` |
| Env configuration         | ✅     | `REDIS_URL`, `IS_REDIS_CONFIGURED`, `IS_EDGE`, `RATE_LIMIT_PREFIX` from `@saasfly/common`                                                                       |
| Graceful degradation      | ✅     | In-memory `fallback` on Redis init failure or runtime error (`distributed-rate-limiter.ts:239-247`)                                                             |
| Unit tests                | ✅     | **109/109 passed** this run across `rate-limiter.test.ts`, `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts`, `rbac.test.ts`          |
| Documentation             | ✅     | `docs/redis-setup.md` (cites the Redis setup for this feature)                                                                                                  |

**P0/P1 tier sweep (this run):** #496 ✅ shipped · #480 dup of #496 · #498 ✅ role path in `trpc.ts` (`userRecord?.role === "ADMIN"` + `requireRole`) with documented email migration fallback · #515 ✅ `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` + `csrfProtection` middleware in `trpc.ts` + `proxy.ts` gate · #550 ✅ `vitest.config.ts` coverage `include` contains `apps/nextjs/src/**` · #549 ✅ `packages/auth/{clerk,env,logger}.test.ts` · #551 ✅ `k8s-router.test.ts` / `k8s.test.ts` · #500 ✅ `apps/nextjs/src/utils/clerk.test.ts` · #501 ✅ `tests/e2e/*.spec.ts` (12 specs) · #581 ✅ umbrella children shipped.

### 5.3 Additional already-shipped checks (this run)

| Claim                               | Finding                                                                                                                                                                                                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #786 partial secret in webhook logs | Cited path `apps/nextjs/src/app/api/stripe/webhook/route.ts` **does not exist**; live route is `apps/nextjs/src/app/api/webhooks/stripe/route.ts` and logs only `identifier/requestId/resetAt` — **no** `SECRET.slice(-8)` anywhere in the tree (repo-wide grep empty). |
| #785 duplicate `next` dep           | `packages/stripe/package.json` has no `next` dependency (only `@t3-oss/env-nextjs`).                                                                                                                                                                                    |
| #748/#720 `.nvmrc`                  | File content `22.14.0`.                                                                                                                                                                                                                                                 |
| #613 duplicate workflow             | Only `iterate.yml` and `on-pull.yml` exist; deletion commit `0db3181` present.                                                                                                                                                                                          |
| #578 duplicate health endpoint      | Single route file under `app/api/health/`.                                                                                                                                                                                                                              |

### 5.4 Repair-mode decision

**No legitimate, non-speculative code change exists for #496 (or any other open P0/P1).** The contract forbids speculative refactors and unrelated improvements; authoring a “fix” for already-shipped work would be a duplicate change. The only outstanding action is **closing** #496/#480/etc., which is **blocked by §2** (issue close → 403).

No repair PR was opened (nothing to ship). This matches the prior runs’ conclusion (`docs/issue-manager-audit-2026-11-10.md`, `-11-11.md`, `-11-11-loop2.md`).

### 5.5 Real remaining work discovered (not selected — would be speculative under Step 4 rules)

- **#305 cluster:** `.github/workflows/iterate.yml` lines 72 and 342 still run `npm ci || true` in a pnpm monorepo (should be `pnpm install --frozen-lockfile` or removed). This is the concrete delta keeping the pnpm-CI cluster open.

---

## 6. Verification evidence (this run)

| Command                                                  | Result                                                  |
| -------------------------------------------------------- | ------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                         | ✅ Done in 7.8s                                         |
| `pnpm typecheck`                                         | ✅ 9/9 tasks successful                                 |
| `pnpm lint`                                              | ✅ 9/9 tasks successful (0 errors, 0 warnings surfaced) |
| `vitest run` (rate-limiter + rbac, 4 files)              | ✅ **109/109 passed**                                   |
| `vitest run packages/api apps/nextjs/src/lib` (26 files) | ✅ **526/526 passed**                                   |
| `vitest run …/integration.test.ts`                       | ✅ 14/14 passed                                         |

---

## 7. Skills & subagents used (contract §5–6)

| Kind                                     | Name                                                                              | Result                                                                                                                                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Skill                                    | `openx-basefly`                                                                   | Loaded; confirmed harness/agent map and integrated skills                                                                                                                                        |
| Skill (available, not required this run) | `github-workflow-automation`, `planning`, `obra-superpowers-systematic-debugging` | Identified in `.opencode/skills/`; not needed — no workflow edit or debug loop was executed                                                                                                      |
| Subagents                                | —                                                                                 | None spawned; work was sequential permission-probing + verification that required first-hand `gh`/`git` results in this session (parallel explore would have duplicated the probes already done) |

---

## 8. Action log

| Timestamp (UTC) | Action                                                   | Target                                                      | Result                                                            |
| --------------- | -------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| 04:36           | Detect default branch + list open PRs/issues             | repo                                                        | `main`; 0 PRs; 82 issues → **ISSUE MANAGER MODE**                 |
| 04:37           | Inventory label coverage                                 | 82 issues                                                   | 43 OK; 11 missing category; 38 missing priority (39 total to fix) |
| 04:37           | Compute label plan                                       | 39 issues                                                   | Plan saved (`label_actions` table §3.1)                           |
| 04:38           | Apply labels (GraphQL)                                   | 39 issues                                                   | ❌ 403 `Resource not accessible by integration` ×39               |
| 04:38           | Apply labels (REST)                                      | #789                                                        | ❌ 403                                                            |
| 04:38           | Comment on issue (probe)                                 | #789                                                        | ❌ 403                                                            |
| 04:39           | Create issue (probe, GraphQL+REST)                       | —                                                           | ❌ 403                                                            |
| 04:39           | Close issue (probe)                                      | #789                                                        | ❌ 403 (state remains `open`)                                     |
| 04:39           | Git push probe branch                                    | `probe/perm-test`                                           | ✅ pushed, then deleted remote+local                              |
| 04:40           | Create + close probe PR                                  | #1645                                                       | ✅ created, ✅ closed, branch deleted                             |
| 04:40           | Comment on PR (probe)                                    | #1645                                                       | ✅ (PR comments allowed; issue comments not)                      |
| 04:41           | Read permission declaration                              | `iterate.yml` vs `on-pull.yml`                              | `iterate.yml` has `issues: write`; `on-pull.yml` does not         |
| 04:41           | Select repair target                                     | P0 tier                                                     | **#496** selected                                                 |
| 04:42           | Read rate-limiter implementation                         | `rate-limiter.ts`, `distributed-rate-limiter.ts`, `trpc.ts` | Distributed path present + wired via `checkAsync`                 |
| 04:42           | `pnpm install --frozen-lockfile`                         | workspace                                                   | ✅                                                                |
| 04:43           | Spot-check P1s (#498/#515/#550/#549/#551/#500/#501/#581) | code+tests                                                  | All shipped                                                       |
| 04:43           | Rate-limiter + rbac tests                                | 4 files                                                     | ✅ 109/109                                                        |
| 04:44           | Broader vitest                                           | packages/api + apps/nextjs lib                              | ✅ 526/526                                                        |
| 04:44           | Verify #786/#785/#613/#578/#720/#748                     | code+git                                                    | All already fixed                                                 |
| 04:45           | `pnpm typecheck`                                         | monorepo                                                    | ✅ 9/9                                                            |
| 04:45           | `pnpm lint`                                              | monorepo                                                    | ✅ 9/9                                                            |
| 04:46           | Dedup/consolidation analysis                             | 82 issues                                                   | Clusters §4 prepared                                              |
| 04:46           | Branch for audit doc                                     | `docs/issue-manager-audit-2026-11-12`                       | Created from synced `main`                                        |
| 04:47           | Write this audit + open PR                               | docs                                                        | See PR (single branch, synced to `main` first)                    |

---

## 9. Unblock list (for a human with `issues: write`)

1. Add `issues: write` to `.github/workflows/on-pull.yml` permissions (or run the loop under `iterate.yml`, which already has it).
2. Apply §3.1 labels (39 issues).
3. Execute §4 closes with reference comments (duplicates + stale/shipped).
4. Close completed P0/P1s: **#496, #480, #498, #515, #550, #549, #551, #500, #501, #581, #786, #785, #720, #748, #613, #578**.
5. Keep **#305** open and fix `iterate.yml` `npm ci || true` → pnpm (the only concrete code delta found this run).

---

## 10. Final state

**waiting for human review**

- Phase: ISSUE MANAGER MODE (Phase 0 routing)
- Steps 1–3: plans prepared, application blocked (403)
- Step 4: #496 selected, verified fully shipped; no repair PR legitimate; closure blocked (403)
- This document is the execution log required by the OUTPUT & LOGGING contract.
