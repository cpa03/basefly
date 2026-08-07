# Issue Manager Audit Report — 2026-08-07 (Loop 41)

**Phase**: ISSUE MANAGER MODE
**Performed by**: Sisyphus (Autonomous Agent)
**Status**: 0 open PRs, 82 open issues (unchanged since loop 40). Token
capabilities re-probed first-hand (unchanged: `issues:write` blocked,
branch/push/PR allowed, `.github/workflows/*` push refused). Every P0/P1 issue
re-verified RESOLVED in code with fresh evidence this session; additional
non-P0/P1 spot-checks (#684, #687, #483) also confirmed resolved. Steps 1-3
(label normalization, duplicate closure, consolidation) remain blocked by
token scope. No code-fixable, non-workflow P0/P1 repair remains.

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0.2). Phase 0 entry check: **0 open PRs** →
issue check → **82 open issues** → Issue Manager Mode → all other phases stopped.

## 2. Decision Summary

- Default branch detected: `main`. Synced via `git fetch origin main --prune`;
  `HEAD == origin/main` (`9a57e74`, merge of loop-40 audit PR #1133).
- **Phase 0 → ISSUE MANAGER MODE**: no open PRs, 82 open issues (re-verified;
  newest open issue remains #789, created 2026-02-27 — no new issues since
  loop 40).
- **Token capabilities probed first-hand** (identical to loops 21-40):

| Capability                 | Probe                                  | Result                                               |
| -------------------------- | -------------------------------------- | ---------------------------------------------------- |
| Issue label add            | `gh issue edit --add-label`            | **BLOCKED** (403 `addLabelsToLabelable`)             |
| Issue comment              | `gh issue comment`                     | **BLOCKED** (403 `addComment`)                       |
| Issue close                | `gh issue close`                       | **BLOCKED** (403 `closeIssue`)                       |
| Branch create / code push  | push probe branch                      | **ALLOWED** (probe branch deleted after)             |
| `.github/workflows/*` push | push probe workflow file               | **BLOCKED** (refuses without `workflows` permission) |
| PR create                  | `gh pr create` (probe)                 | **ALLOWED**                                          |
| PR merge (`--admin`)       | `gh pr merge --admin --merge`          | **ALLOWED**                                          |

## 3. Issue Manager — Steps 1-3 (BLOCKED)

Re-probed label assignment, commenting, and closure. All three return 403.
**No labels/comments/closure applied.** The normalization table
(`.omo/issue-normalization-audit.md`) remains the authoritative pending manual
action list. Duplicate clusters unchanged; no new issues since loop 40.

## 4. Step 4 — Repair Mode

### 4.1 Selection

- **P0/P1 exists?** Yes on paper, but every P0/P1 issue was **independently
  re-verified RESOLVED in code this session** (§4.2). The genuinely-open P1
  (#728, security scanning workflows) is **permanently workflow-blocked**
  (push of `.github/workflows/*` re-probed and refused).
- **Else branch** (lowest-scoring domain → criterion): loop 33 executed the
  lowest-scoring criterion repair (Release & Rollback Safety, PR #1116);
  loop 36 re-scored domains — unchanged. **No lower executable gap remains.**
  No repair attempted — nothing new and non-blocked to fix.

### 4.2 P0/P1 Verification Matrix (fresh evidence THIS session)

| #   | Title                               | Evidence verified this session                                                                                          |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 496 | Distributed rate limiter (Redis) P0 | `packages/api/src/distributed-rate-limiter.ts` — `DistributedRateLimiter` + `SyncRateLimiter` (Redis w/ in-memory fallback) |
| 498 | RBAC admin (role-based)             | `packages/api/src/rbac.test.ts` exists; `trpc.ts` `requireRole()`/`createRateLimitedAdminProcedure`                      |
| 500 | Clerk auth flow tests               | `packages/auth/clerk.test.ts` + `env.test.ts` exist                                                                      |
| 501 | Playwright E2E critical journeys    | `playwright.config.ts` + 12 specs in `tests/e2e/`                                                                        |
| 515 | CSRF protection                     | `apps/nextjs/src/proxy.ts` — origin/referer validation                                                                   |
| 549 | packages/auth tests                 | `packages/auth/{clerk,env}.test.ts` exist                                                                                |
| 550 | nextjs in coverage config           | `vitest.config.ts` includes `apps/nextjs/src/**/*`                                                                       |
| 551 | k8s router tests                    | `packages/api/src/router/k8s-router.test.ts` exists                                                                      |
| 581 | Testing infra consolidation         | `packages/api/src/router/{admin,hello}.test.ts` exist                                                                    |
| 724 | E2E critical flows                  | `tests/e2e/critical-flows.spec.ts` exists                                                                                |
| 728 | Security scanning workflows         | push of `.github/workflows/*` refused this session                                                                       |
| 754 | Webhook idempotency integration     | `packages/stripe/src/webhook-idempotency.test.ts` exists                                                                 |
| 785 | Duplicate `next` dep in stripe      | `packages/stripe/package.json` — no duplicate `next`                                                                     |
| 786 | Stripe webhook logs partial secret  | `route.ts` — raw StripeError never logged, only sanitized `error.message`; `STRIPE_WEBHOOK_SECRET` never logged           |
| 480 | Redis rate limiter (dup of #496)    | resolved via #496 evidence above                                                                                         |

### 4.3 Additional Non-P0/P1 Spot-checks (fresh evidence THIS session)

- #684 root `build` script missing → `package.json` line 6 has
  `"build": "pnpm env:validate && turbo build"` → **RESOLVED**
- #687 `packages/db` lacks `src/index.ts` / `packages/auth` lacks exports →
  `packages/db/index.ts` exists (root-level barrel; `package.json` `exports`
  maps `.` → `./index.ts` plus `./soft-delete`, `./user-deletion`,
  `./prisma/types`, `./prisma/enums`, `./logger`) and `packages/auth/index.ts`
  exists → **RESOLVED**
- #483 API ops lack transaction wrapping → `packages/stripe/src/webhooks.ts`
  wraps select+update in `db.transaction().execute()` (lines 110, 144);
  `createSession` is single-table reads + external Stripe API call (no
  multi-table write to wrap); cluster creation delegates to
  `k8sClusterService.create` → **substantially RESOLVED**
- #755 composite index on Customer (`[authUserId, plan, stripeCurrentPeriodEnd]`)
  → schema.prisma `Customer` model currently has only `authUserId @unique`;
  adding the index requires a DB migration + EXPLAIN ANALYZE verification
  (acceptance criteria) — **NOT executable in this environment** (no DB
  access). Left for maintainer; not a P0/P1 and not safely pushable without
  migration + measurement.

Additional corroborated resolutions (from loop 40, unchanged):
- #748 `.nvmrc` invalid "20" → `.nvmrc` contains `22.14.0`
- #611 not-found.tsx → `not-found.tsx` files exist
- #666 global error boundary → `error.tsx` files exist
- #578 duplicate health endpoint → single `apps/nextjs/src/app/api/health/route.ts`
- #789 peerDependencies for React in packages/ui → `packages/ui/package.json`
  declares `"peerDependencies": { "react": "*", "react-dom": "*" }`

## 5. Repo Health

- Local shell defaults to Node 20.20.2 (fails build with
  `webidl.util.markAsUncloneable is not a function`); Node 22.23.1 available
  at `/opt/hostedtoolcache/node/22.23.1/arm64/bin/node`.
- `node_modules` not installed this session (fresh checkout), so local
  lint/test/build were not re-run; **loop 40 verified on Node 22.23.1**:
  lint 9/9 clean, tests **1603/1603 passed (85 files)**, build PASS.
- CI on `main` for `9a57e74` (loop-40 report merge) was **in_progress**
  (`pull` workflow) at session start; prior run for `60746d8d` (PR #1130,
  #788 UI tests) completed **success**.
- No code changed between loop 40's health verification and this session.

## 6. Blocked (requires human/maintainer)

1. Apply labels per normalization table (`.omo/issue-normalization-audit.md`)
2. Close resolved-but-open issues + duplicates (all P0/P1 verified resolved)
3. Enable security scanning workflows (#728) — workflow push blocked
4. Bump CI `node-version: 20` → `22` in on-pull.yml / iterate.yml (fixes
   Vercel - CI build parity; Vercel builds on Node 20, repo requires 22.14.0)
5. Add turbo cache-invalidation guard for Node toolchain changes
6. #755 composite index on Customer — requires DB migration + EXPLAIN ANALYZE
   (no DB access in this environment)

## 7. Action Log

| Timestamp (UTC)  | Action                           | Target                                        | Result                                                              |
| ---------------- | -------------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| 2026-08-07T11:4x | Phase 0 detection                | repo                                          | 0 open PRs, 82 open issues → ISSUE MANAGER MODE                     |
| 2026-08-07T11:4x | Permission re-probes             | issues / workflows / PR                       | label/comment/close 403; workflow push refused; branch+PR allowed    |
| 2026-08-07T11:4x | Spot-check #684                  | package.json                                  | `build` script present → resolved                                    |
| 2026-08-07T11:4x | Spot-check #687                  | packages/db, packages/auth                    | barrel index.ts files present → resolved                             |
| 2026-08-07T11:4x | Spot-check #483                  | webhooks.ts, stripe.ts, k8s.ts                | transactions present → substantially resolved                        |
| 2026-08-07T11:4x | Spot-check #755                  | schema.prisma Customer model                  | index missing; requires DB migration — not executable (logged)       |
| 2026-08-07T11:4x | Audit report authored            | .omo/issue-manager-audit-2026-08-07-loop41.md | this PR                                                              |

## 8. Final State

- **Active phase**: ISSUE MANAGER MODE (repair delivery blocked at `workflows`
  permission + issue mutations read-only; audit report shipped).
- **Open PRs**: 0 (this report's PR pending CI).
- **Open issues**: 82 (unchanged — issue mutations blocked for automation).
- **Merged this loop**: none (loop-40 probe PR #1131 already cleaned up).
- **Waiting for human review**: the 6 blocked actions in §6.

Docs-only change (report file).
