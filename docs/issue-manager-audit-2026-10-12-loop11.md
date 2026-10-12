# Issue Manager Audit — 2026-10-12 (loop 11)

**Agent:** Sisyphus (autonomous maintainer)
**Skills used:** `github-workflow-automation` (GitHub Actions patterns, token/permission model, `gh` CLI usage)
**Subagents used:** none (all gates run directly; scope was single-issue repair + triage)

---

## Phase Decision

- **Open PRs:** 0 → not PR Handler Mode.
- **Open issues:** 82 → **ISSUE MANAGER MODE** (Phases 1–3 of the outer loop do not run).

---

## Token / Permission Reality (BLOCKING)

Environment token = `github-actions[bot]` GITHUB_TOKEN (workflow `iterate.yml` declares `issues: write`, but the effective token is **scoped down**).

| Operation                             | Result                                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| Read issues/PRs                       | ✅ works                                                                                  |
| `gh issue edit --add-label`           | ❌ GraphQL `addLabelsToLabelable` — Resource not accessible by integration (39/39 failed) |
| `gh issue comment`                    | ❌ GraphQL `addComment` — Resource not accessible by integration                          |
| `gh issue create`                     | ❌ GraphQL `createIssue` — Resource not accessible by integration                         |
| `gh api /user`                        | ❌ 403 Resource not accessible by integration                                             |
| git push / PR / merge / branch delete | ✅ works (contents + pull-requests)                                                       |

**Impact:** STEP 1 (label normalization), STEP 2/3 (duplicate close), and issue creation are all **blocked**. All decisions below are recorded here instead of applied to GitHub. This is the same systemic `issues:write` blocker noted in loops 8–10. **Human/admin action required** to grant the workflow token real `issues: write` (or supply a PAT/App token) before automated issue management can mutate issues.

---

## STEP 1 — Label Normalization (computed, NOT applied — blocked)

82 open issues. 43 already compliant. **39 need a label** (all writes failed):

### Missing CATEGORY (12) — proposed assignment

| Issue | Title                                                 | → Category  | → Priority          |
| ----- | ----------------------------------------------------- | ----------- | ------------------- |
| #755  | Add composite index for customer subscription queries | enhancement | P2                  |
| #754  | Add integration tests for Stripe webhook idempotency  | test        | P2                  |
| #753  | Implement route-based code splitting for dashboard    | enhancement | P2                  |
| #752  | Create unified CLI output utilities                   | chore       | P3                  |
| #751  | Optimize tRPC router bundle size with code splitting  | enhancement | P2                  |
| #749  | AI-powered API endpoint testing + doc generator       | feature     | P3                  |
| #748  | .nvmrc invalid value '20'                             | bug         | P2                  |
| #744  | pnpm consistency in iterate.yml                       | ci          | P3                  |
| #697  | Fix corrupted text formatting in docs                 | docs        | P2                  |
| #670  | Fix iterate.yml to use pnpm                           | ci          | (has P3)            |
| #635  | Create developer onboarding guide                     | docs        | (has documentation) |
| #595  | Workflows use npm instead of pnpm                     | ci          | P2                  |

### Missing PRIORITY only (27) — proposed assignment

| Issue | Title                                          | → Priority |
| ----- | ---------------------------------------------- | ---------- |
| #789  | peerDependencies for React in packages/ui      | P2         |
| #788  | Unit tests for critical UI components          | P2         |
| #787  | Unit tests for packages/db migrations          | P2         |
| #786  | Stripe webhook logs partial secret             | **P1**     |
| #785  | Duplicate next dependency in packages/stripe   | P2         |
| #731  | Auto-generate API docs from tRPC routers       | P3         |
| #729  | Bundle size regression testing                 | P3         |
| #728  | Security scanning workflows to CI              | P2         |
| #727  | AI-Powered Code Review Automation              | P3         |
| #726  | Dependency consistency checking to CI          | P3         |
| #725  | Integration tests for API routers              | P2         |
| #724  | Missing e2e test coverage critical flows       | P2         |
| #723  | High number of client components (bundle)      | P2         |
| #722  | Env var validation at startup                  | P2         |
| #721  | Explicit authorization checks beyond authn     | P1         |
| #720  | Missing .nvmrc                                 | P3         |
| #719  | Missing root-level TypeScript config           | P3         |
| #713  | Unit tests for packages/common utilities       | P2         |
| #668  | Cluster diagnostics with AI assistance         | P3         |
| #636  | ISR caching for dashboard data                 | P3         |
| #634  | Audit/enforce TypeScript strictness            | P2         |
| #632  | Audit error logging for sensitive data leakage | P1         |
| #631  | API router tests (k8s/customer/stripe)         | P2         |
| #630  | Enhance pre-commit hooks w/ typecheck+test     | P3         |
| #628  | Implement E2E testing with Playwright          | P2         |
| #584  | Remaining pnpm inconsistencies in Actions      | P3         |
| #305  | Standardize workflows to use pnpm              | P3         |

---

## STEP 2/3 — Duplicate / Consolidation Analysis (computed, NOT applied — blocked)

Semantic clusters found (canonical kept, others → close-as-duplicate when perms available):

1. **pnpm-in-CI:** #305, #584, #595, #670, #744 (+ stale `iterate.yml`). Canonical **#305**. Close #584, #595, #670, #744.
2. **Redis rate limiter:** #496 (P0) ↔ #480 (P1) — identical scope. Canonical **#496** (already implemented, see Repair below). Close #480.
3. **.nvmrc:** #720 ("missing") vs #748 ("invalid value '20'"). File exists with invalid content → #748 canonical. Close #720.
4. **Playwright E2E:** #628 ↔ #501 ↔ #724. Canonical **#628**. Close #501, #724.
5. **Auth tests:** #500 (Clerk flow) / #549 (packages/auth) — related but distinct scope; keep both, cross-link.

No information lost — all bodies preserved in audit history.

---

## STEP 4 — REPAIR MODE (executed)

**Selected:** #496 `[P0][Security] Replace in-memory rate limiter with distributed store (Redis)` — the single highest-priority (P0) issue.

### Verification that #496 is ALREADY IMPLEMENTED on `main` (614f88d)

| Acceptance criterion                    | Evidence on main                                                                                                                                                                     | Status |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Redis-backed rate limiter               | `DistributedRateLimiter` class, `packages/api/src/distributed-rate-limiter.ts:153`                                                                                                   | ✅     |
| Rate limits consistent across instances | Redis sliding-window via `check()` (line 198)                                                                                                                                        | ✅     |
| Config via env vars                     | `REDIS_URL` / `IS_REDIS_CONFIGURED`, `packages/common/src/config/env.ts:57,62`; listed in `RECOMMENDED_ENV_VARS` (line 90)                                                           | ✅     |
| Graceful degradation to in-memory       | `SyncRateLimiter.ensureInitialized()` → `DistributedRateLimiter` when `IS_REDIS_CONFIGURED && !IS_EDGE`, else `InMemoryRateLimiter` fallback (`distributed-rate-limiter.ts:286-313`) | ✅     |
| Wired into request path                 | `trpc.ts:439` `await limiter.checkAsync(identifier)`                                                                                                                                 | ✅     |
| Unit tests                              | `distributed-rate-limiter.test.ts` — 44/44 pass                                                                                                                                      | ✅     |
| Documentation                           | `docs/redis-setup.md` (194 lines)                                                                                                                                                    | ✅     |

### Stale branch assessment

`fix/issue-496-distributed-rate-limiter` (adef16c) vs main — delta is **fully redundant**:

- `trpc.ts` async wiring → already on main (identical).
- `env.ts` REDIS_URL in RECOMMENDED → already on main.
- `distributed-rate-limiter.test.ts` mock refactor → cosmetic; main's version passes 44/44.
- `stripe/webhooks.test.ts` `db.transaction` mock → moot; `webhooks.ts` uses `rlsTransaction`, not `db.transaction`.

**Action: NO PR opened** (would be a no-op). Branch left intact (never delete without certainty). #496 is functionally complete on main and can be closed by a human once issue perms exist.

### Gates on main (all green)

- typecheck: 9/9 ✅
- lint: 9/9 ✅
- test: 2205/2205 (151 files) ✅
- build: success ✅

---

## Action Log

| Time (UTC) | Action                                 | Target          | Result                                       |
| ---------- | -------------------------------------- | --------------- | -------------------------------------------- |
| 10:00      | `gh issue edit` ×39 (normalize labels) | 39 issues       | ❌ all failed — token `issues:write` blocked |
| 10:00      | `gh issue comment` probe               | #789            | ❌ addComment blocked                        |
| 10:01      | `gh issue create` probe (this audit)   | new issue       | ❌ createIssue blocked                       |
| 10:01      | Analyze #496 acceptance vs main        | #496            | ✅ all 7 criteria met on main                |
| 10:02      | Diff stale branch vs main              | fix/issue-496-… | ✅ delta redundant                           |
| 10:02      | `pnpm typecheck`                       | main            | ✅ 9/9                                       |
| 10:02      | `pnpm lint`                            | main            | ✅ 9/9                                       |
| 10:03      | `pnpm vitest run`                      | main            | ✅ 2205/2205                                 |
| 10:04      | `pnpm build`                           | main            | ✅ success                                   |

---

## Final State

**BLOCKED** on issue mutation (systemic token `issues: write` scope — admin must grant).

Everything actionable that required issue writes is computed and staged above. The one repair candidate (#496) is verified complete on main; no no-op PR was opened. Repository gates are green.

**Recommended next (needs human/admin):**

1. Grant workflow token real `issues: write` (or PAT) → then apply STEP 1 labels + STEP 2/3 dedup closures from tables above.
2. Close #496 and #480 (implemented on main).
3. Optionally delete stale branch `fix/issue-496-distributed-rate-limiter` (redundant) — only after human confirmation.
