# Issue Manager Audit — 2026-09-27 (loop10)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 → Step 0.1 found **0 open PRs** → Step 0.2 found **82 open issues**).
No other phase ran. DEFAULT_BRANCH = `main` (detected: local == `origin/main` = `8038f84` at start).

## Decision Summary

| Check | Result |
| --- | --- |
| Open PRs (0.1) | **0** → no PR handler |
| Open issues (0.2) | **82** → **ISSUE MANAGER MODE** |
| DEFAULT_BRANCH | `main` @ `8038f84` |
| Issue mutations (labels/close/comment) | **403 blocked** (first-hand probes this session) |
| `git push` (contents) | **ALLOWED** (first-hand: temp branch created + deleted) |
| `.github/workflows/*` push | **REJECTED** (first-hand this session: GitHub App lacks `workflows` permission) |
| PR create + PR labels | **ALLOWED** (`pull-requests: write`) |
| Step 4 selection | all P0/P1 **verified stale** → first actionable P2 = **#683** → repaired → **PR #1514** |
| Subagents | **4/4 spawn attempts failed** (`ProviderModelNotFoundError`) → executed directly |

## Permission Probes (first-hand, this session)

| Probe | Result |
| --- | --- |
| `gh issue edit 789 --add-label P2` | **403** `addLabelsToLabelable` — `Resource not accessible by integration` |
| `gh issue comment 789 --body` | **403** `addComment` |
| `git push origin perm-write-test` (temp branch) | **OK** — created, then deleted |
| `git push origin ci/iterate-pnpm-consistency` | **REJECTED**: `refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml without 'workflows' permission` |
| `gh pr create` (#1514) | **OK** |
| `gh pr edit 1514 --add-label chore,P2` | **OK** — PR labels land (issue-label API is what is blocked) |
| `gh api repos/cpa03/basefly` permissions | `{admin:false, maintain:false, pull:false, push:false, triage:false}` (API view; git push nonetheless works — workflow grants `contents: write`) |

Token: `github-actions[bot]` `GITHUB_TOKEN` from `on-pull.yml` =
`{contents: write, pull-requests: write, actions: read, repository-projects: write, id-token: write}`
— **no `issues: write`, no `workflows`**. Sibling `iterate.yml` already grants `issues: write`; parity fix below.

### Carry-forward fix (unpushable — apply manually)

```diff
 # .github/workflows/on-pull.yml
  permissions:
    contents: write
    pull-requests: write
+   issues: write
    actions: read
    repository-projects: write
    id-token: write
```

## Step 1 — Label Normalization: PREPARED, NOT APPLIED (403)

Independent programmatic audit of all 82 issues (exact-match of loop9's counts):

| State | Count | Issues |
| --- | --- | --- |
| Compliant (1 category + 1 priority) | 33 | — |
| Missing category | **12** | #755 #754 #753 #752 #751 #749 #748 #744 #697 #670 #635 #595 |
| Multiple categories | **13** | #713 #688 #584 #581 #551 #550 #549 #523 #522 #515 #498 #496 #305 |
| Missing priority | **38** | #789 #788 #787 #786 #785 #755 #754 #753 #752 #751 #749 #748 #744 #731 #729 #728 #727 #726 #725 #724 #723 #722 #721 #720 #719 #713 #697 #668 #636 #635 #634 #632 #631 #630 #628 #595 #584 #305 |
| Multiple priorities | 0 | — |

**Proposed category (missing only):** `ci` → #744 #670 #595 · `docs` → #697 #635 (drop non-canonical `documentation` on #635) · `test` → #754 · `bug` → #748 · `feature` → #749 · `enhancement` → #755 #753 #752 #751

**Proposed priority (aligned with loop9 for continuity):**

- **P1** — #786 #728 #722 #721 #632
- **P2** — #788 #787 #754 #753 #751 #744 #755 #785 #725 #724 #723 #713 #697 #634 #631 #628 #595 #584 #305
- **P3** — #789 #752 #749 #748 #731 #729 #727 #726 #720 #719 #668 #636 #635 #630

**Multi-category resolution (keep most specific):** #713→`test` · #688→`security` · #584→`ci` · #581→`test` · #551→`test` · #550→`test` · #549→`test` · #523→`refactor` · #522→`ci` (also drop `refactor`) · #515→`security` · #498→`security` · #496→`security` · #305→`ci`

## Step 2 — Duplicate Detection: VERDICTS VERIFIED, CLOSURES BLOCKED (403)

| Cluster | Canonical | Verdicts (evidence this session) |
| --- | --- | --- |
| Redis rate limiter | **#496 (P0)** | #480 → **DUPLICATE**; both **STALE — implemented**: `packages/api/src/distributed-rate-limiter.ts` (Redis + `SyncRateLimiter` in-memory fallback), wired in `trpc.ts`, 104 tests (`rate-limiter.test.ts` 50, `distributed-rate-limiter.test.ts` 46, `*-sync.test.ts` 8), `.env.example` has `REDIS_URL` + `RATE_LIMIT_*`, `docs/redis-setup.md` cites #496 |
| pnpm vs npm in workflows | **#305** | #584 #595 #670 #744 → **DUPLICATE**; gap **REAL** (`iterate.yml:72,342` = `npm ci \|\| true`, cache key `package-lock.json`) — fix prepared, **push REJECTED** (see below). `on-pull.yml` already fully pnpm (`pnpm/action-setup@v6`, `cache: 'pnpm'`, 0 npm refs) |
| E2E / Playwright | **#501** | #628 #724 → **STALE** (`playwright.config.ts` + `tests/e2e/` specs exist; verified loop9 + spec files present in this checkout) |
| API router tests | **#631** | #725 #551 → **STALE** (`k8s-router.test.ts` 18 tests, `customer-router.test.ts`, `stripe-router.test.ts`, `router/integration.test.ts` all exist) |
| `.nvmrc` | **#720 vs #748** | both **STALE** — `.nvmrc` exists and is valid (`22.14.0`) |
| Stripe webhook secret logging | **#786** | vs #632 (broad audit — related, keep both); **#786 STALE**: webhook route comments explicitly prevent logging partial signatures; `safeSerializeError` redacts |
| Duplicate `next` dep | **#785** | **STALE** — `packages/stripe/package.json` has no duplicate/`next` dependency |
| Duplicate workflow file | **#613** | **STALE** — only `iterate.yml` + `on-pull.yml` exist, no duplicate |

## Step 3 — Consolidation: READY, BLOCKED (403)

1. **pnpm-CI family** → one canonical **#305**; when `issues: write` is restored, close #584, #595, #670, #744 as duplicates (bodies above preserve all unique prescriptions: lines 72/342, cache path, cache key).
2. **Testing family** → consolidation issue **#581 already exists** (members #549 #550 #551 #500 #501). Verified all members are **STALE** (auth tests: `packages/auth/clerk.test.ts` 40+ cases incl. `isClerkEnabled`/`getSessionUser`/admin; coverage config includes `apps/nextjs/src/**` in `vitest.config.ts`; k8s tests exist; Playwright exists) → on restore, close members as completed and then #581 itself.

## Step 4 — Repair Mode: EXECUTED → PR #1514

### Selection walk (stale = code already satisfies the issue)

| Tier | Issues checked | Result |
| --- | --- | --- |
| **P0** | #496 | **STALE** (implemented — evidence above) |
| **P1 (labeled)** | #581 #551 #550 #549 #515 #501 #500 #498 #480 | **ALL STALE** (#515: origin/referer CSRF validation in `trpc.ts` + `CSRF_ERROR` + integration tests; #498: `requireRole` + audit logging + `rbac.test.ts`; #550: coverage includes `apps/nextjs`; #549/#500: `clerk.test.ts` etc.; #581: members stale) |
| **P1 (proposed)** | #786 #722 #721 #632 #728 | #786/#722/#721/#632 **STALE**; #728 **BLOCKED** (workflow-file push) |
| **P2** | #785 #613 → stale; pnpm cluster → push-blocked; **#683** | **SELECTED** — repo-wide `pnpm format` fails on 34 files (reproduced first-hand) |

### Repair execution (issue #683, partial — format symptom only)

- Branch `style/repo-prettier-format` from `main@8038f84` (synced before; re-fetched after: `main` unchanged)
- `prettier --write` with each package's own format globs → exactly **34 files** (1 `packages/common`, 30 `packages/ui`, 3 `apps/nextjs`)
- No config/rule changes; formatting only

| Verification | Result |
| --- | --- |
| `pnpm format` | ✅ exit 0 (was failing on `main`) |
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ 9/9 tasks, **0 warnings** |
| `pnpm test` | ✅ **148 files / 2171 tests passed** |
| `pnpm build` | ✅ exit 0 |
| Push | ✅ accepted (non-workflow file) |
| PR | **#1514** — labels `chore` + `P2` applied; body marks it partial for #683 (config-unification ACs remain) |

### Unpushable fix preserved (pnpm standardization, canonical #305)

Branch `ci/iterate-pnpm-consistency` (commit `bd1bc08`) was **rejected by GitHub** (workflow-file
permission). The exact patch is reproduced here so it survives this ephemeral checkout — apply
manually or from an account with `workflows` permission:

```diff
 # .github/workflows/iterate.yml
           path: |
             ~/.opencode
-            ~/.npm
-          key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
+            ~/.pnpm-store
+          key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1

-      - run: npm ci || true          # line 72  (architect job)
+      - run: pnpm install --frozen-lockfile || true

-      - run: npm ci || true          # line 342 (Fixer job)
+      - run: pnpm install --frozen-lockfile || true
```

Verifies locally: YAML parses; zero genuine npm references remain. This is the exact prescribed
solution from #670 + #744 and satisfies #305/#584/#595 acceptance criteria.

## Orchestration & Skills Report (contract §5–6)

- **Skills identified** (`.opencode/skills`): `github-workflow-automation`, `skill-creator`, `planning`,
  `obra-superpowers-systematic-debugging`, `maxritter-claude-codepro-backend-models-standards`,
  `modu-ai-moai-adk-moai-tool-opencode`, `proffesor-for-testing-agentic-qe-skill-builder`,
  `openx-basefly`, `muratcankoylan-agent-skills-for-context-engineering-memory-systems`,
  `ai-agent-engineer`, `commit-message`, `debugging`
- **Skills used**: `github-workflow-automation` (workflow permission model, branch/PR patterns — informed
  the workflow-visibility and push-permission analysis); `commit-message` (file is a 1-line stub — fell
  back to repo conventional-commit style from `git log`)
- **Subagents attempted**: `general` (duplicate detection) ×2 and `explore` (rate-limiter map) ×2 —
  **all 4 spawns failed** with `ProviderModelNotFoundError` (`opencode/gpt-5-nano`, `iflowcn/big-pickle`)
  → all analysis executed directly in main session instead.

## Action Log

| Timestamp (UTC) | Action | Target | Result |
| --- | --- | --- | --- |
| 2026-09-27T08:38Z | Phase 0 entry checks | `gh pr list` / `gh issue list` | 0 PRs, 82 issues → ISSUE MANAGER MODE |
| 2026-09-27T08:39Z | Permission probe | `gh issue edit --add-label` | 403 blocked |
| 2026-09-27T08:39Z | Permission probe | `gh issue comment` | 403 blocked |
| 2026-09-27T08:40Z | Permission probe | temp branch push | OK; temp branch deleted |
| 2026-09-27T08:41Z | Skill load | `github-workflow-automation` | loaded |
| 2026-09-27T08:42Z | Subagent spawn ×4 | `general`, `explore` | all failed (model not found) → direct execution |
| 2026-09-27T08:43Z | Label audit (Step 1) | 82 issues | 33 compliant / 12 missing cat / 13 multi / 38 missing pri |
| 2026-09-27T08:44–08:50Z | Staleness + duplicate verification (Steps 2–3) | 20+ issues vs code | verdicts in tables above |
| 2026-09-27T08:51Z | Step 4 selection walk | P0→P1→P2 | #496 & all P1 stale → #683 selected |
| 2026-09-27T08:52Z | pnpm fix commit | `bd1bc08` on `ci/iterate-pnpm-consistency` | committed |
| 2026-09-27T08:52Z | Push probe | workflow file | **REJECTED** (`workflows` permission) — diff preserved above |
| 2026-09-27T08:53Z | Format fix | 34 files on `style/repo-prettier-format` | applied |
| 2026-09-27T08:54Z | Verification | format/typecheck/lint/test/build | **all green** (2171 tests) |
| 2026-09-27T08:54Z | Commit + push | `5ffd42c` | OK |
| 2026-09-27T08:55Z | PR creation | #1514 → `main` | created; labels `chore`+`P2` applied |

## Final State

**Waiting for human review.**

- PR **#1514** open (MERGEABLE, CI running) — merge deliberately deferred: merging belongs to
  **PR HANDLER MODE** (next run's Phase 0.1), per state-machine separation.
- Steps 1–3 remain **blocked** pending `issues: write` on `on-pull.yml` (one-line fix above).
- Two unpushable-but-prepared fixes preserved as diffs above (workflow `workflows`-permission limits).
- No issues closed/edited, no branches deleted (except this run's own temp probe branch, logged above).
