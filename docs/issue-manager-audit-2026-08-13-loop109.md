# Issue Manager Audit Report — 2026-08-13 (loop 109)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `82f6e12`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: Step 0.1 → 0 open PRs; Step 0.2 → open issues exist → Issue Manager Mode entered; Phases 1–3 stopped)

## Decision Summary

- **Step 0.1 (open PRs):** 0 open PRs (verified via `gh pr list --state open`).
- **Step 0.2 (open issues):** open issues exist → **Issue Manager Mode**.
- **Step 1 (normalization):** **BLOCKED** — re-probed live with the runtime `github-actions[bot]` token: `gh issue edit --add-label` → `403 (addLabelsToLabelable)`; `gh issue comment` → `403 (addComment)`; `gh issue close` → `403 (closeIssue)`; `gh issue create` → `403 (createIssue)`. Capability matrix: ✅ read, git push, `gh pr create/edit/close`; ❌ all issue mutations (labels/comments/close/create). Consistent with loops 100–108 — the token (from `on-pull.yml` `GITHUB_TOKEN`) lacks `issues: write`.
- **Steps 2–3 (dedup/consolidation):** **BLOCKED** — same 403s. FAIL-SAFE issue creation also unavailable; findings documented here instead (per loop-102 precedent).
- **Step 4 (Repair Mode):**
  - Selection: highest-priority open, fixable issue → **#501 [P1][Testing] Implement Playwright E2E tests for critical user journeys**. All other P0/P1 issues are code-resolved on `main` (re-verified below).
  - Verified that the Playwright suite itself (11 spec files, `playwright.config.ts`, npm scripts) was already merged (#849); **two acceptance criteria remained open: CI integration and documentation**.
  - **Repair executed this loop:** delivered the two remaining #501 criteria via **PR #1256** (branch `test/e2e-ci-integration-501`).

## First-Hand Verifications This Session (fresh)

### #501 acceptance criteria — status on `main` + this loop

| Criterion (from #501 body) | Status | Evidence |
| -------------------------- | ------ | -------- |
| Playwright config created (`playwright.config.ts`) | ✅ existing | `playwright.config.ts` (chromium project, retries on CI, trace/video/screenshot capture, `webServer` for local runs) |
| E2E tests for auth flows | ✅ existing | `tests/e2e/auth.spec.ts` (login page, Clerk sign-in component) |
| E2E tests for subscription flow | ✅ existing | `tests/e2e/billing.spec.ts`, `tests/e2e/subscription-workflows.spec.ts`, `tests/e2e/pricing.spec.ts` |
| E2E tests for cluster management | ✅ existing | `tests/e2e/cluster.spec.ts` |
| CI integration for E2E tests | ✅ **this loop** | `docs/ci/e2e-workflow.yml` (full `e2e.yml` workflow definition; activation requires `workflows` permission — see Blocked Items #5) |
| Documentation for running E2E locally | ✅ **this loop** | `docs/e2e-testing.md` |

11 spec files total: `admin`, `auth`, `authorization-bypass`, `billing`, `cluster`, `critical-flows`, `dashboard`, `home`, `pricing`, `subscription-workflows`, `webhook-error-handling` (+ shared `fixtures.ts`).

### P0/P1 code-resolved (re-confirmed, consistent with loops 100–108)

#496 (Redis rate limiter — `distributed-rate-limiter.ts` sliding-window + in-memory fallback + tests + env config), #498 (role-based RBAC — `admin-access.ts` DB-backed), #500 (Clerk auth tests), #515 (CSRF origin guard), #549 (packages/auth tests — `clerk.test.ts`, `env.test.ts`), #550 (apps/nextjs in vitest coverage include), #551 (k8s router tests), #581 (consolidated root `vitest.config.ts`), #721 (requireRole middleware + RBAC system), #722 (env validation via `@t3-oss/env-nextjs`), #786 (no partial-secret logging in webhook route).

### Additional resolved re-verified this session (fresh evidence, no regression)

#480, #483 (webhook-idempotency.ts), #485 (Suspense in 5+ files), #486 (OpenTelemetry), #487 (Redis cache in `packages/common/src/cache/`), #488 (`check:circular` madge in package.json), #492 (`sizes=` attrs), #503 (JSDoc on routers), #521 (SSR-safe dictionary loading), #578 (single health route), #609 (consolidated `./schemas` module), #610 (centralized error formatting in `errors.ts` + trpc), #613 (only 2 workflow files), #630 (k8s/customer/stripe router tests), #632 (no sensitive data in logs), #634 (`strict: true`), #635 (`docs/ONBOARDING.md`), #636 (force-dynamic by design, documented), #663 (eslint-disable consolidation #1176), #664 (shared pino logger), #666 (error.tsx in 5 route groups), #683 (`.eslintrc.cjs` + tooling/eslint-config), #684 (root scripts), #685 (React.memo #1034), #688 (middleware → proxy.ts evolution), #697 (docs corruption #697), #705 (Dockerfile + docker-compose.yml), #706 (devcontainer.json), #708 (bundle analyzer), #713 (packages/common tests), #719 (root tsconfig), #720 (.nvmrc exists), #725 (router middleware-chain integration tests), #727 (on-pull.yml IS the AI review automation), #729 (size-limit regression), #731/#749 (openapi.ts + docs-generator.ts + `/api/docs` route), #748 (.nvmrc = 22.14.0), #754 (webhook-idempotency.test.ts), #755 (composite indexes in schema.prisma), #785 (no next dep in stripe package.json), #789 (peerDependencies in packages/ui).

## Duplicate Clusters (unchanged, re-verified — closure blocked by token)

1. Rate limiter: #480 ↔ #496 → canonical #496 (P0). Both code-resolved.
2. pnpm-in-CI: #305 ↔ #584 ↔ #595 ↔ #670 ↔ #744 → canonical #305. Live `iterate.yml` still has `npm ci || true` (lines 72, 342) — fix blocked by `workflows` permission (patch precedent at `docs/ci/iterate-pnpm-fix.patch`).
3. E2E/Playwright: #501 ↔ #628 ↔ #724 → canonical #501. Suite exists; CI-integration criterion delivered this loop.
4. API router tests: #551 ↔ #631 ↔ #725 → canonical #631. All code-resolved.
5. Barrel exports: #687 ↔ #523 → canonical #523 (tree-shaking audit still open).

## Repair Delivered This Loop

**#501 — Playwright E2E: CI integration + documentation (PR #1256, branch `test/e2e-ci-integration-501`)**

- `docs/ci/e2e-workflow.yml` — complete `e2e.yml` GitHub Actions workflow definition:
  - Triggers: `workflow_dispatch`, `pull_request` (paths: `tests/e2e/**`, `playwright.config.ts`, `apps/nextjs/**`, the workflow itself), weekly schedule (Mon 06:00 UTC).
  - Guarded job: `if: ${{ secrets.CLERK_SECRET_KEY != '' && secrets.STRIPE_API_KEY != '' && secrets.POSTGRES_URL != '' }}` — repos without E2E credentials skip instead of failing.
  - Flow: checkout → pnpm → Node 22 (matches `.nvmrc`) → `pnpm install --frozen-lockfile` → `pnpm test:e2e:install` → boot `pnpm dev:web` with curl readiness loop (no external deps) → `pnpm test:e2e` → upload `playwright-report/` artifact (7-day retention).
  - Stored under `docs/ci/` (following the `docs/ci/security-audit.patch` precedent for #728) because the automation token lacks `workflows: write` — push of `.github/workflows/e2e.yml` was rejected by GitHub ("refusing to allow a GitHub App to create or update workflow ... without `workflows` permission").
- `docs/e2e-testing.md` — prerequisites, local setup, all test commands, test structure/fixtures, writing new tests, CI integration, troubleshooting.
- `.gitignore` — added `playwright-report/`, `test-results/`, `blob-report/`.
- Verification: workflow YAML validated (`yaml.safe_load`); changes are CI/docs/gitignore only — zero impact on build, lint, or unit tests by construction.

## Health Baseline (fresh, `main` @ 82f6e12)

| Check | Command | Result |
| ----- | ------- | ------ |
| Typecheck | `pnpm typecheck` | ⚠️ not run — runner has no `node_modules` (fresh checkout; no install performed to avoid mutating lockfile state) |
| Lint | `pnpm lint` | ⚠️ not run — same reason; changes are CI/docs/gitignore only |
| Test | `pnpm test` | ⚠️ not run — same reason; no code touched |
| Workflow YAML | `python3 -c "import yaml; yaml.safe_load(...)"` | ✅ `docs/ci/e2e-workflow.yml` parses clean |
| Git hygiene | `git status` | ✅ only intended files staged; pre-existing working-tree drift (`.opencode/*` deletions, `.omo/` untracked from an earlier migration) left untouched |

Note: `on-pull.yml` CI will run the standard gates on PR #1256. No code paths are affected by this PR.

## Blocked Items (tracked, awaiting privileged token)

1. Issue label normalization (issues missing category/priority labels — e.g. #305, #584, #595, #670, #697, #744, #748, #749, #751, #752, #753, #754, #755, #788) — requires `issues: write`.
2. Duplicate/resolved issue closure (≈30 recommended closures listed above, incl. #480, #631, #724, #628, #305, #595, #670, #744) — requires `issues: write`.
3. #305 iterate.yml pnpm fix — requires `workflows: write` (patch ready).
4. #728 security-scanning workflows — requires `workflows: write` (patch ready at `docs/ci/security-audit.patch`).
5. #501 E2E CI workflow activation — `docs/ci/e2e-workflow.yml` must be copied to `.github/workflows/e2e.yml` by a maintainer with `workflows` permission.
6. #522/#502/#726 CI-related items — require `workflows: write`.

## Action Log

| Timestamp (UTC) | Action | Target | Result |
| --------------- | ------ | ------ | ------ |
| 2026-08-13 ~23:30 | Phase 0 entry check | repo | 0 open PRs → Issue Manager Mode |
| 2026-08-13 ~23:31 | Full open-issue inventory + label audit | 60+ issues | Normalization matrix built |
| 2026-08-13 ~23:33 | Token capability probe | GITHUB_TOKEN | ❌ issues mutations; ✅ push/PR create |
| 2026-08-13 ~23:35 | Probe PR + branch created/closed | #1255 | Permission verification; cleaned up |
| 2026-08-13 ~23:40 | Resolution verification sweep | ~45 issues | Evidence-based resolved/duplicate/consolidation matrix |
| 2026-08-13 ~23:50 | Repair: write `e2e.yml` + `docs/e2e-testing.md` + `.gitignore` | #501 | Files created; YAML validated |
| 2026-08-13 ~23:55 | Push attempt | `.github/workflows/e2e.yml` | ❌ rejected (no `workflows` permission) |
| 2026-08-13 ~23:56 | Relocate workflow to `docs/ci/e2e-workflow.yml` | #501 | Pushed successfully (docs path) |
| 2026-08-13 ~23:57 | PR created | #1256 | Linked to #501 |

## Final State

**Loop complete** — PR #1256 open (branch `test/e2e-ci-integration-501`), linked to #501. 0 open PRs other than #1256, open issues unchanged (closure blocked by token). Next loop re-enters Issue Manager Mode. Recommended next loop action: continue #788/#590 test coverage (remaining untested `packages/ui` components per loop-106: ~7 of 53), or apply the #501 E2E workflow once a `workflows: write` token is available.