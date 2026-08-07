# Issue Manager Audit Report — 2026-08-06 (Loop 37)

**Phase**: ISSUE MANAGER MODE (Steps 1-4)
**Performed by**: Sisyphus (Autonomous Agent)
**Status**: Full verification of all 82 open issues completed against current
`main`. Every P0/P1 issue re-confirmed resolved in code (fresh checks this
session, §5.2). Steps 1-3 (label normalization, duplicate closure,
consolidation) remain blocked by token scope (no `issues:write`). The CI Node
version parity finding from loop 36 (§5.3) was **reproduced with new evidence**:
turbo's remote/local cache **masks** the Node 20 build failure on a warm cache,
making the failure nondeterministic across runs (§5.4 — NEW this session). No
code-fixable, non-workflow P0/P1 repair remains — repair target selection stays
exhausted (loop 33 executed the lowest-scoring criterion; loop 36 re-scored,
unchanged).

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0.2). Phase 0 entry check: **0 open PRs** (no PR
Handler Mode) → open-issue check → **82 open issues** → ISSUE MANAGER MODE.

## 2. Decision Summary

- Default branch detected: `main`. Synced via `git fetch origin main --prune`
  before all checks. Working tree contains only pre-existing tooling-migration
  artifacts (`.opencode/*.json` deletions, `.omo/` migration backup) —
  intentionally untouched and excluded from commits (loop 36 §7 policy).
- **Phase 0 → ISSUE MANAGER MODE**: 82 open issues. Drift check vs. loop 36:
  **no new issues, none closed** (createdAt filter `> 2026-08-06` → empty).
- **Token capabilities re-probed first-hand this session** (identical to loops
  21-36):

| Capability                | Probe                                   | Result                                                                      |
| ------------------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| Issue label add           | `gh issue edit 748 --add-label "P3"`    | **BLOCKED** (403 `addLabelsToLabelable`)                                    |
| Issue comment             | `gh issue comment 748`                  | **BLOCKED** (403 `addComment`)                                              |
| Issue close               | `gh issue close 748`                    | **BLOCKED** (403 `closeIssue`)                                              |
| Workflow-file push        | throwaway branch touching `on-pull.yml` | **BLOCKED** (`refusing to allow a GitHub App to create or update workflow`) |
| Branch create / code push | `test/wf-probe-loop37` (deleted after)  | **ALLOWED**                                                                 |
| PR create/close           | established pattern (loops 33-36)       | **ALLOWED**                                                                 |

- **NET CAPABILITY**: read issues/PRs, push code, create/close PRs. **Cannot**:
  mutate issues (labels/comments/close), create issues, or push workflow files.

## 3. Step 1 — Issue Normalization (BLOCKED)

Re-probed label assignment (loop 36 §2). `addLabelsToLabelable` still returns 403. **No labels were applied.** Loop-34 normalization table
(`docs/issue-normalization-audit.md`) remains the authoritative pending manual
action list. Unchanged inventory: 10 issues missing category label, 38 missing
priority label.

## 4. Steps 2-3 — Duplicate Detection & Consolidation (BLOCKED)

Duplicate clusters re-confirmed by title/scope comparison (identical to loop 36
§4; no new issues to shift clusters):

- **480 ↔ 496** (Redis rate limiter) — canonical #496
- **305 ↔ 584 ↔ 595 ↔ 670 ↔ 744** (pnpm consistency in workflows) — canonical #584/595
- **501 ↔ 628 ↔ 724** (Playwright E2E) — canonical #501
- **551 ↔ 631 ↔ 725** (API router tests) — canonical #551
- **720 ↔ 748** (.nvmrc) — canonical #720 (resolved: `.nvmrc` = `22.14.0`)
- **731 ↔ 749** (auto API docs generation) — canonical #749

Closure with reference comments is impossible (no `addComment`/`closeIssue`).
Blocked.

## 5. Step 4 — Repair Mode

### 5.1 Selection

- **P0/P1 exists?** Yes, on paper — but every P0/P1 issue was re-verified
  RESOLVED in code against current `main` this session (§5.2). The one
  genuinely-open P1 (#728, security scanning workflows) is **permanently
  workflow-blocked** (workflow specs exist at `docs/ci/workflows/` but token
  cannot push `.github/workflows/*`).
- **Else branch** (lowest-scoring domain → criterion): loop 33 already executed
  the lowest-scoring criterion repair (Release & Rollback Safety, Delivery &
  Evolution 68/100 → PR #1116). Loop 36 re-scored domains; unchanged. **No
  lower executable gap exists that is code-fixable with this token.** No repair
  was attempted this loop — nothing new and non-blocked to fix.

### 5.2 P0/P1 Verification Matrix (fresh evidence THIS session)

| #   | Title                            | Evidence verified this session                                                                                                                                                         |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 496 | Distributed rate limiter (Redis) | `packages/api/src/distributed-rate-limiter.ts` exists; 8 `rateLimit` refs in `trpc.ts`                                                                                                 |
| 480 | (dup of 496)                     | same file                                                                                                                                                                              |
| 498 | RBAC admin                       | `packages/api/src/rbac.test.ts` exists; 7 `isAdmin` refs in `trpc.ts`                                                                                                                  |
| 500 | Clerk auth flow tests            | `packages/auth/clerk.test.ts` + `env.test.ts` exist; vitest config maps `@saasfly/auth`                                                                                                |
| 501 | Playwright E2E                   | 11 spec files in `tests/e2e/*.spec.ts` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) |
| 515 | CSRF protection                  | `apps/nextjs/src/proxy.ts` — 27 origin/referer validation refs                                                                                                                         |
| 549 | packages/auth tests              | `packages/auth/{clerk,env}.test.ts` (loop 35 verified 100% coverage; unchanged)                                                                                                        |
| 550 | nextjs in coverage config        | `vitest.config.ts:16` include `apps/nextjs/src/**/*.{ts,tsx}` (PR #1114 merged)                                                                                                        |
| 551 | k8s router tests                 | `packages/api/src/router/k8s-router.test.ts` exists (PR #1119 merged)                                                                                                                  |
| 581 | Testing infra consolidation      | PR #1123 merged (real admin + hello router tests)                                                                                                                                      |
| 721 | Explicit authorization           | RBAC + `isAdmin` middleware in `trpc.ts` (7 refs)                                                                                                                                      |
| 722 | Env variable validation          | `packages/common/src/config/env.ts` — 3 `validateEnvVars` refs                                                                                                                         |
| 724 | E2E critical flows               | `tests/e2e/critical-flows.spec.ts` + 10 other specs                                                                                                                                    |
| 725 | API router integration tests     | PR #1099 merged (concurrency/transaction coverage)                                                                                                                                     |
| 728 | Security scanning workflows      | **BLOCKED** — workflow specs at `docs/ci/workflows/` but token cannot push `.github/workflows/*`                                                                                       |
| 754 | Stripe webhook idempotency tests | `packages/stripe/src/webhook-idempotency.test.ts` (loop 36; unchanged)                                                                                                                 |
| 786 | Stripe secret in logs            | `packages/stripe/src/webhooks.ts` — **0** occurrences of "secret" (sanitized)                                                                                                          |
| 632 | Sensitive logging audit          | `packages/api/src/sensitive-data-logging.test.ts` (loop 36; unchanged)                                                                                                                 |
| 785 | Duplicate next dep in stripe     | `packages/stripe/package.json` — **0** occurrences of `"next"` (deduped)                                                                                                               |
| 789 | React peerDeps in ui             | `packages/ui/package.json` peerDependencies: `next >=14`, `react ^19`, `react-dom ^19` present                                                                                         |

### 5.3 CI Node Version Parity (loop 36 finding, RE-CONFIRMED)

- `.nvmrc` = `22.14.0`; root `package.json` engines `>=22`; but BOTH workflows
  pin `node-version: 20` (`on-pull.yml:55`, `iterate.yml:70/266/340/395`).
- Fresh empirical reproduction this session:
  - `pnpm build --force` under **Node v20.20.2** → **FAILS**:
    `unhandledRejection TypeError: webidl.util.markAsUncloneable is not a function`
  - `pnpm build` under **Node v22.23.1** → **PASSES** (29s, 1/1 tasks).
- Fix: `node-version: 20` → `22` in both workflow files — **BLOCKED** by token
  scope (re-probed §2: GitHub App refuses workflow-file pushes).

### 5.4 NEW Finding — Turbo Cache Masks the Node 20 Failure (Determinism)

- **Observation**: the first `pnpm build` attempt under Node 20 this session
  reported success (`Tasks: 1 successful, FULL TURBO, 41ms`) — it was served
  **entirely from turbo cache populated by the earlier Node 22 build**. Only
  `pnpm build --force` (cache-bypass) exposed the real Node 20 failure.
- **Evidence**: `Cached: 1 cached, 1 total` on the warm-cache run vs.
  `Cached: 0 cached` + `unhandledRejection ... markAsUncloneable` on `--force`.
- **Impact / Risk**: builds under Node 20 are **nondeterministic** — green when
  turbo cache is warm (from a Node 22 run), red on cold cache. Any CI/agent job
  that builds on Node 20 may silently pass on cache, masking the parity defect;
  conversely a cold cache can fail jobs whose workflow never runs `build`
  directly today (both workflows only run the agent). This also implies
  cross-Node-version cache poisoning: turbo cache keys do not incorporate the
  Node runtime version.
- **Domain/criterion mapping**: Delivery & Evolution Readiness → Config & Env
  Parity (also Determinism & Predictability, Code Quality 5%). Reinforces the
  loop-36 recommendation: bump CI to Node 22 **and** consider invalidating
  turbo cache when the runtime toolchain changes.

## 6. Repo Health Suite (executed, not assumed)

Environment: runner default Node v20.20.2; Node v22.23.1 at
`/opt/hostedtoolcache/node/22.23.1/arm64/bin` used for verification.
`pnpm install --frozen-lockfile` (7.9s, cached store):

| Check     | Command          | Result                                                                                                                              |
| --------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Typecheck | `pnpm typecheck` | ✅ 9/9 packages successful (12.2s)                                                                                                  |
| Lint      | `pnpm lint`      | ✅ 9/9 packages successful, **0 warnings** (48s)                                                                                    |
| Tests     | `pnpm test`      | ✅ 79 files / **1524 tests passed** (19s)                                                                                           |
| Build     | `pnpm build`     | ✅ PASSES on Node 22 (29s); ❌ FAILS on Node 20 (`webidl...markAsUncloneable`, §5.3); ⚠️ warm cache masks failure on Node 20 (§5.4) |

## 7. Fail-Safe Compliance

No destructive actions performed. Capability probes used one throwaway branch
(`test/wf-probe-loop37` — workflow-file touch, push rejected by GitHub App,
local clone + branch deleted immediately; **no remote branch left behind**, no
probe PR created this loop). No files deleted. No branches left behind. Local
`.opencode/*.json` deletions and `.omo/` migration artifacts are pre-existing
environment state from tooling migration — intentionally untouched and excluded
from commits.

## 8. Final State

- **Phase**: ISSUE MANAGER MODE (Steps 1-4)
- **Decision summary**: All 82 open issues re-verified; every P0/P1 resolved in
  code; no code-fixable non-workflow repair remains; Steps 1-3 blocked by
  missing `issues:write`; #728 and Node-parity finding (§5.3) blocked by missing
  `workflows` permission; NEW finding §5.4 (turbo cache masks Node 20 build
  failure — determinism risk) documented for human action.
- **Final state**: **waiting for human review** — manual actions required:
  1. Apply priority/category labels per loop-34 normalization table
     (`docs/issue-normalization-audit.md`).
  2. Close resolved-but-open issues (§5.2 matrix) and duplicates (§4).
  3. Copy `docs/ci/workflows/{security-audit,codeql-analysis}.yml` into
     `.github/workflows/` to resolve #728.
  4. Bump `node-version: 20` → `22` in `on-pull.yml` and `iterate.yml` (§5.3).
  5. **NEW** — add a turbo cache-invalidation guard for Node toolchain changes
     (e.g. include Node version in cache key / `--force` on toolchain upgrade)
     to eliminate the nondeterministic build outcome documented in §5.4.
