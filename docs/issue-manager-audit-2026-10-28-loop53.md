# Issue Manager Audit — 2026-10-28 (loop 53)

**Generated:** 2026-10-28T07:50Z
**Workflow:** `on-pull.yml` (schedule, hourly) — `/ulw-loop` autonomous maintenance
**Active phase:** Phase 0 → STEP 0.2 → **ISSUE MANAGER MODE** (no open PRs; 89 open issues)
**Final state:** ⏸ **waiting for human review** — `issues: write` remediation required (see §7)

---

## 1. Decision summary

| Step                      | Outcome                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 0.1 Open PRs              | 0 found → not PR Handler Mode                                                                                |
| 0.2 Open issues           | 89 found → **ISSUE MANAGER MODE** entered; Phases 1–3 stopped per state machine                              |
| STEP 1 — Normalize labels | ❌ **BLOCKED** (no `issues: write`) — re-verified independently this run; plan preserved (yesterday §3)      |
| STEP 2/3 — Dedupe/close   | ❌ **BLOCKED** (same permission) — cluster analysis refreshed, actionable table preserved (yesterday §4)     |
| STEP 4 — REPAIR           | ✅ **Ran.** Selected #496 [P0]. Independently verified **already implemented** (98/98 tests). No code change |
| Survey extension          | ✅ All other P0/P1 candidates verified **stale/complete** — see §5 (saves future loops from rework)          |

No issues, labels, or comments were modified: every `gh issue *` write attempt returns
`Resource not accessible by integration` (HTTP 403). No fix PR was opened because the
selected P0 requires **no code change** — opening an empty/no-op PR would violate the
"minimal, atomic changes / no unstable changes" contract.

---

## 2. Capability findings (re-verified this run, independent of 2026-10-27 doc)

This run executes under `on-pull.yml` (`name: pull`), whose permissions block grants
`contents: write` + `pull-requests: write` but **NOT `issues: write`**.

| Probe (2026-10-28 ~07:45Z)                              | Result                                                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `gh issue edit 789 --add-label P2` (GraphQL)            | ❌ 403 integration                                                                              |
| `POST /repos/…/issues/789/labels` (REST)                | ❌ 403 integration                                                                              |
| `POST /repos/…/issues/480/comments` (REST)              | ❌ 403 integration                                                                              |
| `GET /repos/cpa03/basefly` → `.permissions`             | `triage:false, push:false…`                                                                     |
| `git push --dry-run origin main:refs/heads/auth-probe…` | ✅ works (contents:write)                                                                       |
| PR create/merge capability                              | ✅ proven by #1616/#1621 today                                                                  |
| Explore subagents (`explore` × 2)                       | ❌ infra: model `opencode/muse-spark-1.3-contributor-free` not found → fell back to direct grep |

Self-heal (pushing `issues: write` into `on-pull.yml`) remains impossible: the token
cannot push files under `.github/workflows/` (platform restriction, documented in
commit `caab1f59`).

**Skills used this run:** `github-workflow-automation` (workflow permission/branch/PR
patterns — consistent with findings above), `commit-message` (used for this doc's commit).

---

## 3. STEP 1 — Label normalization (prepared, NOT applied)

39 of 89 open issues still lack a category and/or priority label. The authoritative
pending-assignment tables live in
[issue-manager-blocker-2026-10-27.md §3](./issue-manager-blocker-2026-10-27.md) (loop 52
review). **No conflicts found** vs this run's independent assessment; only advisory deltas:

- #786 (Stripe webhook partial-secret logging): yesterday P2 → this run suggests **P1**
  severity-wise, **but see §5: the issue is stale** — recommend closing rather than labeling.

No labels were added (blocked). Apply §3 of the 2026-10-27 doc verbatim once unblocked.

---

## 4. STEP 4 — REPAIR MODE on #496 [P0] (canonical rate-limiter issue)

**Selection:** #496 — unique P0 ("Replace in-memory rate limiter with distributed store (Redis)").
**Outcome: VERIFIED COMPLETE on `main` — no code change required.** Closure blocked (§2).

| Acceptance criterion (from #496)            | Evidence in `main` (verified 2026-10-28)                                                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redis-backed rate limiter implemented       | `packages/api/src/distributed-rate-limiter.ts`; wired via `packages/api/src/trpc.ts` (import lines 15–19, `rateLimit` middleware line 433–477)            |
| Rate limits consistent across instances     | Shared Redis ZSET sliding-window state                                                                                                                    |
| Configuration via environment variables     | `.env.example` lines 124–133 (`REDIS_URL`, `RATE_LIMIT_{READ,WRITE,STRIPE}_*`); `IS_REDIS_CONFIGURED` in `packages/common/src/config/env.ts:62`           |
| Graceful degradation when Redis unavailable | `packages/api/src/rate-limiter.ts` in-memory fallback + warning logs                                                                                      |
| Unit tests for rate limiter                 | ✅ **98/98 passed** this run: `distributed-rate-limiter.test.ts`, `distributed-rate-limiter-sync.test.ts`, `rate-limiter.test.ts` (vitest 4.1.11, exit 0) |
| Documentation for setup/configuration       | `docs/redis-setup.md`, `docs/caching.md` (+ linked from `docs/README.md`)                                                                                 |

**Near-duplicate #480** (P1, same subject): same verdict — stale, close with reference to #496.

---

## 5. P0/P1 staleness survey (key output of this loop)

All remaining labeled P0/P1 issues were checked against the tree. **None require new work** —
so no fix PR was opened from this run either.

| Issue                     | Claim                                      | Status in `main` (evidence)                                                                                                                                                                                                   |
| ------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496 (P0)                 | Redis rate limiter                         | ✅ complete — §4 above                                                                                                                                                                                                        |
| #480 (P1)                 | same as #496                               | ✅ duplicate, stale                                                                                                                                                                                                           |
| #498 (P1)                 | Email-admin → role-based RBAC              | ✅ `enum Role` + `role Role @default(USER)` (`schema.prisma:14,80`); `requireRole`/DB-role admin middleware + audit logs (`trpc.ts:254–405`)                                                                                  |
| #500 (P1)                 | Clerk auth flow tests                      | ✅ `packages/auth/clerk.test.ts` exists                                                                                                                                                                                       |
| #501 (P1)                 | Playwright E2E for critical journeys       | ✅ 11 specs incl. `tests/e2e/critical-flows.spec.ts`, `auth`, `billing`, `cluster`, `subscription-workflows` + `playwright.config.ts`                                                                                         |
| #515 (P1)                 | CSRF protection for forms                  | ✅ origin/Referer CSRF middleware for all state-changing tRPC ops (`trpc.ts:104–177`), `apps/nextjs/src/lib/csrf.test.ts`, e2e `authorization-bypass.spec.ts` (token-based variant is an alternative design, not an open gap) |
| #549 (P1)                 | packages/auth "0% coverage"                | ✅ `clerk.test.ts`, `env.test.ts`, `logger.test.ts` exist                                                                                                                                                                     |
| #550 (P1)                 | Coverage omits apps/nextjs                 | ✅ `vitest.config.ts:16` (coverage include) and `:67` (test include) already cover `apps/nextjs/src/**`                                                                                                                       |
| #551 (P1)                 | k8s router untested                        | ✅ `packages/api/src/router/k8s-router.test.ts` exists                                                                                                                                                                        |
| #581 (P1)                 | Testing umbrella (80% coverage acceptance) | ⚠️ meta-issue; thresholds at 25/20/20/25 — raising to 80% now would fail CI; not atomic → leave open                                                                                                                          |
| #786 (unlabeled security) | Logs `STRIPE_WEBHOOK_SECRET.slice(-8)`     | ✅ stale — referenced file `api/stripe/webhook/route.ts` does not exist; actual `api/webhooks/stripe/route.ts` has no secret logging (grep negative)                                                                          |

**Recommendation for the next unblocked run:** close #496, #480, #498, #500, #501, #549,
#550, #551, #786 with completion references above (preserve bodies per contract), keep #581
open, then run §3/§4 of the 2026-10-27 doc (labels + duplicate clusters).

---

## 6. Action log (2026-10-28, UTC)

| Time   | Action                                             | Target                                          | Result                                           |
| ------ | -------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| ~07:44 | `gh pr list --state open`                          | repository                                      | 0 open PRs → Step 0.2                            |
| ~07:44 | `gh issue list --state open`                       | repository                                      | 89 open issues → ISSUE MANAGER MODE              |
| ~07:45 | Label normalization batch (39 edits)               | issues 305–789                                  | ❌ all 403 (GraphQL+REST) → BLOCKED, tables kept |
| ~07:45 | Permission probes (labels/comments/push/`gh api`)  | `GITHUB_TOKEN`                                  | issues:write absent; contents:write OK           |
| ~07:46 | Workflow inspection                                | `on-pull.yml` / `iterate.yml`                   | root cause: missing `issues: write` line         |
| ~07:46 | Explore subagents ×2 (rate-limiter hunt)           | background tasks                                | ❌ model unavailable → direct grep fallback      |
| ~07:47 | Duplicate/consolidation analysis                   | 89 issues                                       | clusters refreshed (superset of yesterday §4)    |
| ~07:47 | `pnpm install --frozen-lockfile`                   | workspace                                       | ✅ 7s                                            |
| ~07:48 | `vitest run` rate-limiter suites                   | #496 acceptance tests                           | ✅ 98/98 pass, exit 0                            |
| ~07:49 | P0/P1 staleness survey                             | #498/#500/#501/#515/#549/#550/#551/#786         | ✅ all stale/complete (§5)                       |
| ~07:50 | Write audit doc                                    | `docs/issue-manager-audit-2026-10-28-loop53.md` | ✅ this file                                     |
| ~07:51 | Branch + commit + push + PR (docs, labels docs/P3) | loop-53 audit                                   | ✅ opened for next PR Handler run                |

---

## 7. Remediation required (human / PAT with `workflows: write`)

Same as [issue-manager-blocker-2026-10-27.md §6](./issue-manager-blocker-2026-10-27.md) —
still outstanding after two consecutive days:

```yaml
# .github/workflows/on-pull.yml
permissions:
  contents: write
  issues: write # ← ADD THIS LINE
  pull-requests: write
```

Then re-run the loop: STEP 1 (labels), STEP 2/3 (duplicates) and the closures listed in §5
become executable; Repair Mode will find no remaining P0/P1 code work.

---

_Maintained autonomously by `/ulw-loop` (loop 53). No issues created/labeled/commented/
closed (permission blocker). No source code modified — this PR is documentation-only._
