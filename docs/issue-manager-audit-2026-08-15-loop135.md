# Issue Manager Audit Report — 2026-08-15 (Loop 135)

**Date**: 2026-08-15T06:21:00Z
**Mode**: ISSUE MANAGER MODE
**Branch**: `main` @ `3019d84`

---

## Decision Summary

Phase 0 entry decision: **0 open PRs** → entered **ISSUE MANAGER MODE** (82 open issues,
unchanged count from loop 134; 0 new issues created since loop 134).

ISSUE MANAGER MODE executed:

- **STEP 1 (normalization)**: label audit re-run for all 82 open issues. Re-probed issue
  write permission this loop: `gh issue edit 789 --add-label P2` → 403
  `addLabelsToLabelable`. Token remains `github-actions[bot]` with zero repo permissions
  (`admin:false, maintain:false, pull:false, push:false, triage:false`). All issue write
  ops (label/close/comment/create) remain **BLOCKED**.
- **STEP 2 (dedupe)**: duplicate clusters re-validated (pnpm CI, E2E testing, router tests,
  tRPC docs, Redis rate limiter) — closing **BLOCKED** (403 on all issue write ops).
- **STEP 3 (consolidation)**: candidate consolidations unchanged — **BLOCKED**.
- **STEP 4 (repair)**: all 10 P0/P1 issues re-verified **resolved in code** on `main` with
  fresh evidence this loop (table below). The pnpm CI migration cluster
  (#305/#584/#595/#670/#744) remains genuinely open in `.github/workflows/iterate.yml`
  (`npm ci || true` at lines 72/342). **Real fix attempted this loop**: created branch
  `fix/pnpm-consistency-iterate-yml-loop135`, applied the identical fix proven in the
  sibling workflow (`pnpm/action-setup@v6` + `setup-node@v7` with `cache: 'pnpm'` +
  `pnpm install --frozen-lockfile`, validated by `python3 yaml.safe_load` → valid, 0
  errors), committed, attempted push → **push rejected**:
  `refusing to allow a GitHub App to create or update workflow
.github/workflows/iterate.yml without 'workflows' permission`. Local branch deleted; no
  remote ref created. Blocked at the workflow-file level, consistent with loops 120-134.

**New this loop (loop 135)**: First full **build/test/lint/typecheck execution** since the
token-scope analysis stabilized. Installed dependencies (`pnpm install --frozen-lockfile`
→ 7.6s) and ran the entire verification suite with the repo-required Node 22.14.0
(.nvmrc / engines `>=22`):

| Check     | Command                        | Result                                 |
| --------- | ------------------------------ | -------------------------------------- |
| Typecheck | `pnpm typecheck`               | **9/9 tasks pass** (13.3s)             |
| Lint      | `pnpm lint`                    | **9/9 tasks pass, 0 warnings** (1m21s) |
| Test      | `pnpm test` (vitest)           | **139 files / 2087 tests pass** (79s)  |
| Build     | `pnpm build` (Next.js 16.2.11) | **passes on Node 22.14.0** (29.6s)     |

Note: the runner's default Node is v20.20.2, on which `pnpm build` fails with
`webidl.util.markAsUncloneable is not a function` — a **Node <22 environmental issue**,
not a repo defect (repo declares `engines.node >=22` and `.nvmrc` = 22.14.0). Verified
green with Node 22.14.0.

---

## P0/P1 Repair Verification (Fresh Evidence — Loop 135)

All 10 P0/P1 issues verified **resolved in code** on `main` @ `3019d84` (fresh `ls` /
`grep` / config reads this loop):

| Issue     | Title                                                         | Evidence (verified this loop)                                                                                                                                                                                            |
| --------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #496 (P0) | Replace in-memory rate limiter with distributed store (Redis) | `packages/api/src/distributed-rate-limiter.ts` exists; grep confirms Redis client usage (`createClient`/ioredis); `rate-limiter.ts` still present as legacy fallback; merged PRs #1232/#1198/#1059/#1057                 |
| #498 (P1) | Replace email-based admin RBAC with role-based access control | `packages/api/src/authorization.ts` + `authorization.test.ts` + `rbac.test.ts` exist (RBAC logic lives in `authorization.ts`; loop 134 report mis-cited `rbac.ts`)                                                       |
| #515 (P1) | Add CSRF protection                                           | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` exist                                                                                                                                                                     |
| #500 (P1) | Add Clerk authentication flow tests                           | `packages/auth/clerk.test.ts` + `tests/e2e/auth.spec.ts` exist                                                                                                                                                           |
| #549 (P1) | Add tests for packages/auth module (0% coverage)              | `packages/auth/clerk.test.ts` + `packages/auth/env.test.ts` exist                                                                                                                                                        |
| #550 (P1) | Include apps/nextjs in test coverage                          | `vitest.config.ts` line 16: `include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`; line 12 setup file `./apps/nextjs/src/test/setup.ts`                                                                 |
| #551 (P1) | Add tests for k8s router                                      | `packages/api/src/router/k8s-router.test.ts` + `k8s.test.ts` exist                                                                                                                                                       |
| #501 (P1) | Implement Playwright E2E tests                                | `playwright.config.ts` exists; `tests/e2e/` with 12 spec files (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling, fixtures) |
| #581 (P1) | Consolidate testing infrastructure                            | Unified `vitest.config.ts` + turbo `test` pipeline; all 5 consolidated sub-issues (#549/#550/#551/#500/#501) verified resolved                                                                                           |
| #480 (P1) | Replace in-memory rate limiter with Redis                     | Same as #496 (`distributed-rate-limiter.ts` supersedes `rate-limiter.ts`)                                                                                                                                                |

---

## P2/P3 Sweep (Loop 135 — fresh spot-checks)

Spot-checks this loop on candidates not re-verified in loop 134 (full sweep was loop 132):

| Issue | Title                                 | Evidence (verified this loop)                                                                                                                               |
| ----- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #687  | Add missing barrel exports (index.ts) | `packages/{auth,db}/index.ts` exist at package root (auth/db export `.` → `./index.ts` in package.json `exports`); api/common/stripe/ui have `src/index.ts` |
| #684  | Root build script + turbo pipelines   | root `package.json` has `build` (`pnpm env:validate && turbo build`), `dev`, `format`, `lint`, `typecheck`, `test` scripts                                  |
| #708  | Configure bundle analyzer             | `apps/nextjs/package.json` has `build:analyze` + `@next/bundle-analyzer` dep + `size:analyze`                                                               |
| #705  | Docker configuration                  | `Dockerfile` + `docker-compose.yml` exist                                                                                                                   |
| #706  | VS Code Dev Containers                | `.devcontainer/` directory exists                                                                                                                           |
| #667  | Audit/export boundaries               | `docs/export-boundaries.md` exists                                                                                                                          |

---

## Genuinely Open (no code-level repair possible within token scope)

| Issue(s)                            | Status                                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #305/#584/#595/#670/#744 (pnpm CI)  | **Genuinely open** in `.github/workflows/iterate.yml` (`npm ci` at 72/342). Fix **re-attempted and push-rejected this loop** — missing `workflows` permission. |
| #668, #749 (AI innovation features) | Open feature proposals; no minimal code target.                                                                                                                |
| #726 (check-deps in CI)             | `check-deps` script exists but not wired into CI. Requires workflow change (blocked).                                                                          |

---

## Action Log

| Timestamp (UTC)  | Action                                 | Target                                         | Result                                                                                          |
| ---------------- | -------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 2026-08-15T06:1x | Phase 0 entry decision                 | repo                                           | 0 open PRs → ISSUE MANAGER MODE (82 open issues)                                                |
| 2026-08-15T06:1x | Label audit (STEP 1)                   | 82 open issues                                 | 40 missing labels; `addLabelsToLabelable` → 403 (BLOCKED)                                       |
| 2026-08-15T06:1x | Dedupe validation (STEP 2)             | duplicate clusters                             | closing → 403 (BLOCKED)                                                                         |
| 2026-08-15T06:1x | Consolidation (STEP 3)                 | candidate consolidations                       | → 403 (BLOCKED)                                                                                 |
| 2026-08-15T06:1x | Repair (STEP 4) — P0/P1 verification   | all 10 P0/P1 issues                            | all resolved in code on `main` (fresh evidence)                                                 |
| 2026-08-15T06:1x | Repair — pnpm CI real fix + push probe | `.github/workflows/iterate.yml`                | YAML-valid fix applied; push rejected: missing `workflows` permission (BLOCKED); branch deleted |
| 2026-08-15T06:1x | Dependency install                     | repo                                           | `pnpm install --frozen-lockfile` → 7.6s, exit 0                                                 |
| 2026-08-15T06:1x | Typecheck                              | repo (turbo 9 pkgs)                            | 9/9 pass                                                                                        |
| 2026-08-15T06:2x | Lint                                   | repo (turbo 9 pkgs)                            | 9/9 pass, 0 warnings                                                                            |
| 2026-08-15T06:2x | Test                                   | repo (vitest)                                  | 139 files / 2087 tests pass                                                                     |
| 2026-08-15T06:2x | Build                                  | apps/nextjs (Next 16.2.11)                     | pass on Node 22.14.0; Node 20 failure confirmed environmental                                   |
| 2026-08-15T06:2x | Audit report commit + PR               | docs/issue-manager-audit-2026-08-15-loop135.md | created (this report)                                                                           |

---

## Final State

- **State**: `idle` (read-only audit + full verification completed; no code-level repair
  possible within token scope)
- **Blocked on**: `issues: write` (label/close/comment/create) and `workflows` (CI file
  push) permissions on the `github-actions[bot]` token. All 10 P0/P1 issues verified
  resolved in code; repo verified green (typecheck/lint/test/build) under the declared
  Node 22. The only genuinely-open cluster (#305/#584/#595/#670/#744 pnpm CI) requires
  `workflows` permission to fix; fix prepared and push-rejected this loop.
- **No new issues created** (issue creation blocked).
