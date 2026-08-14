# Issue Manager Audit Report — 2026-08-14 (Loop 116)

**Date**: 2026-08-14T11:10:00Z
**Mode**: ISSUE MANAGER MODE (Phase 0: 0 open PRs; 82 open issues)
**Branch**: `main` @ `9a833c6`

---

## Decision Summary

Phase 0 entry decision: **0 open PRs** → entered **ISSUE MANAGER MODE** directly (82 open issues).

ISSUE MANAGER MODE executed:

- **STEP 1 (normalization)**: label plan **computed** for 39 issues (38 missing priority, 12 missing
  category) — **BLOCKED from applying** — this token lacks `issues: write` (verified: `addLabels`,
  `closeIssue`, `addComment`, `createIssue` all 403).
- **STEP 2 (dedupe)**: duplicate clusters identified (pnpm CI, E2E testing, router tests, tRPC docs,
  Redis rate limiter) — **BLOCKED from closing** (same 403).
- **STEP 3 (consolidation)**: candidate consolidations noted — **BLOCKED**.
- **STEP 4 (repair)**: no P0/P1 issue remains genuinely open (all verified resolved in code, see below).
  Repair target: **#502 (fast-path CI workflow)** — designed, validated, and shipped as a
  ready-to-deploy template + documentation via the repo's established `docs/ci/workflows/` pattern
  (workflow-file pushes remain blocked by missing `workflows` permission, same as #728).
  **PR #1271 opened** (OPEN, MERGEABLE).

---

## Action Log

| Timestamp (UTC)  | Action                                     | Target                                                | Result                                                                              |
| ---------------- | ------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-08-14T10:45 | Phase 0 decision                           | 0 open PRs / 82 open issues                           | ISSUE MANAGER MODE                                                                  |
| 2026-08-14T10:46 | Data collection                            | 82 issues / 400 merged PRs                            | `/tmp/opencode/issues.json`, `/tmp/opencode/merged_prs.json`                        |
| 2026-08-14T10:50 | Permission matrix mapping                  | issues / workflows / PRs                              | Issues: 403 (no `issues: write`); workflows push: 403; PR create/comment: OK        |
| 2026-08-14T10:55 | Test PR #1270 (perm probe)                 | closed test PR                                        | Created + closed cleanly; confirms PR surface works, issue surface blocked          |
| 2026-08-14T11:00 | STEP 1 normalization                       | 39 issues (labels)                                    | Plan computed; application BLOCKED (403) → deliver via report                       |
| 2026-08-14T11:02 | STEP 2 dedupe                              | 5 duplicate clusters                                  | Identified; closing BLOCKED (403) → deliver via report                              |
| 2026-08-14T11:05 | STEP 2 #496 (P0) verification              | rate limiter on `main`                                | RESOLVED: distributed-rate-limiter.ts + tests; 6 merged fix PRs (#627/#1057/#1165/#1198/#1232/#1059) |
| 2026-08-14T11:08 | Verified-resolved sweep                    | 20 open issues vs `main` code                         | Confirmed resolved in code (see table below); close BLOCKED (403)                   |
| 2026-08-14T11:10 | STEP 4 repair: #502                        | `docs/ci/workflows/quick-check.yml` + `docs/ci-cd.md` | Template designed + validated (YAML + CI validator); docs updated                   |
| 2026-08-14T11:15 | **Create PR #1271**                        | `fix/502-quick-check-ci-workflow` → `main`            | OPEN, MERGEABLE, references "Issue #502"                                            |
| 2026-08-14T11:16 | #578 verification                          | duplicate health endpoint                             | RESOLVED: `packages/api/src/router/health_check.ts` removed; single route remains    |

---

## STEP 1 — Issue Normalization Plan (BLOCKED)

### Missing/Incorrect Labels (39 issues need action)

| Category  | Count | Notes                                                                 |
| --------- | ----- | --------------------------------------------------------------------- |
| Missing priority | 38 | Proposed: 21×P2, 8×P1, 6×P3, 3×P0 (per severity analysis) |
| Missing category | 12 | Proposed: backend-engineer (6), devops-engineer (3), ui-ux-engineer (2), frontend-engineer (1) |
| Priority overrides | 6    | #670→ci, #748→bug, #749→P3, #723/#785→P2, #721/#722/#728/#786/#632→P1 |

> Full per-issue label assignments are in the PR body of the audit report PR. Application requires
> a token with `issues: write`.

---

## STEP 2 — Duplicate Clusters Identified (BLOCKED)

| Cluster               | Issues                                   | Recommendation                |
| --------------------- | ---------------------------------------- | ----------------------------- |
| pnpm CI migration     | #305, #584, #595, #670, #744             | Keep #670 (canonical), close rest |
| E2E testing strategy  | #501, #628, #724                         | Consolidate into one issue    |
| API router tests      | #631, #725                               | Consolidate into #631         |
| tRPC docs             | #731, #749                               | Consolidate into #731         |
| Redis rate limiter    | #480 (dup of #496)                       | Close #480 (P0 already fixed) |

---

## Verified-Resolved Issues (open but fixed in `main`; close BLOCKED)

| Issue | Title (abbrev)                     | Evidence in `main`                                                        |
| ----- | ---------------------------------- | ------------------------------------------------------------------------- |
| #496  | Redis rate limiter P0              | `distributed-rate-limiter.ts` + tests; fix PRs #627/#1057/#1165/#1198/#1232/#1059 |
| #498  | RBAC role checks                   | `packages/api/src/router/` role guards                                    |
| #500  | API testing coverage               | 138 test files / 2079 pass                                                |
| #515  | CSRF protection                    | middleware present                                                        |
| #719  | Root tsconfig.json                 | file exists at repo root                                                  |
| #720  | Node version pin                   | `.nvmrc` = `22.14.0`                                                      |
| #748  | Node version mismatch              | `.nvmrc` = `22.14.0`; workflows use Node 20/22                            |
| #722  | Env validation CI                  | `tooling/qa/env-validate.js` (CI mode)                                    |
| #728  | Security scanning workflows        | `security-audit.yml` + `codeql-analysis.yml` deployed; documented in docs/ci-cd.md |
| #785  | Stripe next dependency             | `apps/nextjs/package.json` clean                                          |
| #613  | Remove paratterate.yml             | file absent from `.github/workflows/`                                     |
| #666  | Error handling / error.tsx         | 5 `error.tsx` boundary components                                         |
| #684  | Build script                       | root `build = pnpm env:validate && turbo build`                           |
| #755  | Composite DB indexes               | `@@index([plan, stripeCurrentPeriodEnd])` etc. in `schema.prisma`          |
| #483  | DB transactions                    | `db.transaction()` in webhooks / user-deletion / seed                     |
| #664  | JSDoc-only examples                | only JSDoc examples remain                                                |
| #630  | Husky pre-commit                   | `.husky/pre-commit` present                                               |
| #713  | Test files added                   | 6 new test files                                                          |
| #578  | Duplicate health endpoint          | `packages/api/src/router/health_check.ts` removed                          |

---

## STEP 4 — Repair Mode

### Target: #502 — Fast-path CI workflow

**Selection rationale**: genuinely unresolved (no `quick-check` workflow exists), clear acceptance
criteria (< 5 min PR feedback), minimal blast radius (new workflow + docs only), and the CI
validator (`tooling/qa/validate-ci-workflows.js`) already enforces the conventions the template uses.

**Deliverable** (PR #1271):

- `docs/ci/workflows/quick-check.yml` — canonical template:
  - Fast-path jobs `typecheck`/`lint`/`test`/`build` in parallel on every PR (target < 5 min)
  - `full-audit` job (`pnpm dx:check` + CI validation) on weekly schedule / manual dispatch
  - `concurrency` group with `cancel-in-progress: true`
  - CI mode (`CI=true`) for placeholder env values
- `docs/ci-cd.md` — new `quick-check.yml` section + deployment runbook

**Why template not deployed**: GitHub App token lacks `workflows` permission → pushes creating
`.github/workflows/*` are rejected (403, verified via test branch). Per repo precedent (Issue #728),
canonical templates live in `docs/ci/workflows/` with a deployment runbook.

**Verification**: YAML structure validated against `security-audit.yml`; passes CI workflow
validator (frozen-lockfile, `cache: "pnpm"`, action versions ≥ minimums). Docs-only — no runtime
code changed.

---

## Blockers (recurring)

1. **No `issues: write`** — normalization (STEP 1), dedupe/close (STEP 2/3) must ship as reports.
2. **No `workflows` permission** — CI workflow fixes must ship as templates in `docs/ci/workflows/`.

Both are inherent to the GitHub App installation token used by this automation; resolution requires
a token with the missing scopes.
