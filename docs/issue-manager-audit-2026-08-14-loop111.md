# Issue Manager Audit Report — 2026-08-14 (loop 111)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `84a344d`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: Step 0.1 → 0 open PRs; Step 0.2 → 82 open issues → Issue Manager Mode; Phases 1–3 stopped)

## Decision Summary

- **Step 0.1 (open PRs):** 0 open PRs → skip PR Handler Mode.
- **Step 0.2 (open issues):** 82 open issues → **Issue Manager Mode**.
- **Step 1 (normalization):** **BLOCKED** — re-probed live: `gh issue edit --add-label` → `403 (addLabelsToLabelable)`; `gh issue comment` → `403 (addComment)`; `gh issue create` → `403 (createIssue)`; `gh issue close` → `403 (closeIssue)`; `gh workflow run` → `403`. Token (`GITHUB_TOKEN`, `github-actions[bot]` GitHub App) lacks `issues: write` / `workflows: write`. Consistent with loops 100–110. Normalization matrix (38 issues missing priority, 12 missing category) captured below.
- **Steps 2–3 (dedup/consolidation):** **BLOCKED** — same 403s. Duplicate clusters re-verified (unchanged from loop-110).
- **Step 4 (Repair Mode):**
  - Selection: highest-priority genuinely-open issue. All P0/P1 issues re-verified **code-resolved on `main`** (#496 distributed Redis rate limiter wired via `getLimiter`; #498 DB-backed RBAC; #500 Clerk auth tests; #501 Playwright suite + CI docs; #515 CSRF origin guard; #549 auth tests; #550 coverage; #551 k8s router tests; #722 env validation via `initEnvValidation` in `instrumentation.ts`; #786 Stripe secret leakage prevented).
  - Highest-priority genuinely-open issue → **#728 [P1][Security] Add security scanning workflows to CI** — the consolidated workflow (pnpm audit + CodeQL + dependency review) existed only as a template in `.github/scripts/security-audit.yml`; the deployable template in `docs/ci/workflows/security-audit.yml` was stale (node 20, no CodeQL, no dependency review) and the setup script would install the outdated version.
  - **Repair executed this loop:** **PR #1261** (branch `fix/security-scanning-template-sync-728`): synced `docs/ci/workflows/security-audit.yml` to the consolidated version, aligned `actions/setup-node` to `v7` (repo convention) in both copies, marked standalone `codeql-analysis.yml` deployment optional to avoid duplicate CodeQL runs.
  - **Blocked sub-step:** pushing the workflow directly to `.github/workflows/security-audit.yml` is rejected by the GitHub App token (`refusing to allow a GitHub App to create or update workflow ... without workflows permission`). Deployment requires a PAT / GitHub App with `workflows: write` (documented in the script header and PR body).

## Normalization Matrix (blocked — requires `issues: write`)

### Missing category label (12 issues)

| Issue | Title                                 | Recommended Category |
| ----- | ------------------------------------- | -------------------- |
| #755  | [Database] Add composite index        | **enhancement**      |
| #754  | [QA] Webhook idempotency tests        | **test**             |
| #753  | [Frontend] Route-based code splitting | **enhancement**      |
| #752  | [DX] CLI output utilities             | **enhancement**      |
| #751  | [Performance] tRPC bundle size        | **enhancement**      |
| #749  | [Innovation] API testing generator    | **feature**          |
| #748  | [DX] .nvmrc invalid value             | **bug**              |
| #744  | fix(ci): pnpm consistency             | **ci**               |
| #697  | Docs corruption fix                   | **docs**             |
| #670  | [DX] iterate.yml pnpm                 | **ci**               |
| #635  | [Docs] Onboarding guide               | **docs**             |
| #595  | Workflows use npm                     | **ci**               |

### Missing priority label (38 issues)

Security → P0/P1: #786, #728, #721, #722, #632. Testing → P1/P2: #788, #787, #729, #725, #724, #754, #713, #631, #628. CI → P2: #726, #744, #584, #305. Bugs → P1/P2: #785, #748. Architecture/DX → P2/P3: #789, #755, #753, #752, #751, #723, #720, #719, #634, #630, #636. Innovation → P3: #731, #727, #749, #668. Docs → P2: #697, #635.

## Duplicate Clusters (unchanged, closure blocked by token)

1. Rate limiter: #480 ↔ #496 → canonical #496 (P0). Both code-resolved.
2. pnpm-in-CI: #305 ↔ #584 ↔ #595 ↔ #670 ↔ #744 → canonical #305. Live `iterate.yml` still has `npm ci || true` — fix blocked by `workflows` permission.
3. E2E/Playwright: #501 ↔ #628 ↔ #724 → canonical #501. Suite + CI docs exist; workflow activation blocked by `workflows` permission.
4. API router tests: #551 ↔ #631 ↔ #725 → canonical #631. All code-resolved.
5. Barrel exports: #687 ↔ #523 → canonical #523 (tree-shaking audit still open).

## Already Resolved (open issues whose fixes are verified on `main`; closure blocked)

| Issue | Evidence |
| ----- | -------- |
| #496  | `packages/api/src/distributed-rate-limiter.ts` (Redis, sliding window, in-memory fallback), wired via `getLimiter` in stripe webhook + tRPC `createRateLimitedProtectedProcedure` |
| #498  | DB-backed RBAC in `trpc.ts` role checks, page-level admin guards |
| #500  | `apps/nextjs` Clerk auth middleware tests (merged PR #1140) |
| #501  | `playwright.config.ts` + e2e CI integration (merged PR #1256) |
| #515  | CSRF origin guard in `trpc.ts` (`csrfProtection` middleware) |
| #549  | `packages/auth/clerk.test.ts`, `env.test.ts` |
| #551  | `packages/api/src/router/k8s-router.test.ts` |
| #722  | `initEnvValidation()` in `apps/nextjs/src/instrumentation.ts` + `env-validation.test.ts` |
| #748  | `.nvmrc` = `22.14.0` (valid) |
| #720  | `.nvmrc` exists |
| #719  | root `tsconfig.json` exists |
| #613  | `paratterate.yml` already removed |
| #785  | `packages/stripe/package.json` has no duplicate `next` dep |
| #786  | Stripe webhook error handling strips raw `StripeError` from logs (commit `9c20a29`) |

## Action Log

| Timestamp (UTC) | Action | Target | Result |
| --------------- | ------ | ------ | ------ |
| 2026-08-14 ~00:50 | Phase 0 triage | repo | 0 open PRs, 82 open issues → Issue Manager Mode |
| 2026-08-14 ~00:51 | Label matrix build | 82 issues | 38 missing priority, 12 missing category |
| 2026-08-14 ~00:51 | Token capability probe | `gh issue edit/comment/close/create`, REST labels | All `403` — `issues: write` missing |
| 2026-08-14 ~00:52 | Resolved-state verification | #496/#498/#500/#501/#515/#722/#786 etc. | All code-resolved on `main` |
| 2026-08-14 ~00:53 | Duplicate re-verification | pnpm / rate-limiter / E2E / router-test clusters | Unchanged |
| 2026-08-14 ~00:56 | Repair target selection | #728 (P1, security) | Consolidated template stale; deployable path broken |
| 2026-08-14 ~00:57 | Workflow deploy attempt | `.github/workflows/security-audit.yml` | Push rejected — token lacks `workflows` permission |
| 2026-08-14 ~00:58 | Template sync | `docs/ci/workflows/security-audit.yml`, `.github/scripts/*` | Synced to consolidated version; `setup-node@v7`; script updated |
| 2026-08-14 ~01:00 | PR created | PR #1261 (`fix/security-scanning-template-sync-728`) | Open, mergeable; Vercel check rate-limited (external) |

## Final State

- **State:** `waiting for human review`
- **Reason:** (1) Issue label normalization / duplicate closure blocked by token (`issues: write` required — deploy with a PAT or GitHub App with `issues: write`; apply matrix above). (2) #728 workflow deployment blocked by `workflows` permission — after PR #1261 merges, run `bash .github/scripts/setup-security-scanning.sh` with a token that has `workflows: write`. (3) PR #1261 CI: only Vercel check failing (external rate limit, retry in 24h).
