# Issue Audit Report — 2026-07-19

**Active Phase**: ISSUE MANAGER MODE (Phase 0)
**Decision**: 0 open PRs, 18 open issues → Enter Issue Manager Mode
**Final State**: Blocked (workflows permission required for some fixes)

---

## STEP 1 — Issue Normalization

### Label Audit Results

Current token has **read-only API access** — cannot add/modify labels via GitHub API.

| Issue | Category | Priority | Notes |
|-------|----------|----------|-------|
| #789 | enhancement | **missing → P2** | peerDependencies for React |
| #788 | test | **missing → P2** | UI component tests |
| #787 | test | **missing → P2** | DB migrations tests |
| #786 | security | **missing → P1** | Stripe secret logging (ALREADY FIXED) |
| #785 | bug | **missing → P1** | Duplicate dependency (ALREADY FIXED) |
| #755 | **missing → enhancement** | **missing → P3** | DB composite index |
| #754 | **missing → test** | **missing → P1** | Webhook idempotency tests |
| #753 | **missing → enhancement** | **missing → P2** | Dashboard code splitting |
| #752 | **missing → enhancement** | **missing → P2** | CLI output utilities |
| #751 | **missing → enhancement** | **missing → P2** | tRPC code splitting |
| #749 | **missing → enhancement** | **missing → P2** | AI API testing |
| #748 | **missing → bug** | **missing → P2** | .nvmrc (ALREADY FIXED) |
| #744 | **missing → ci** | **missing → P2** | pnpm consistency in iterate.yml |
| #731 | enhancement | **missing → P3** | Auto API docs |
| #729 | enhancement | **missing → P3** | Bundle size testing (ALREADY FIXED) |
| #728 | security | **missing → P1** | Security scanning workflows |
| #727 | enhancement | **missing → P3** | AI code review |
| #726 | ci | **missing → P3** | Dependency consistency in CI |
| #725 | test | **missing → P2** | API router integration tests |
| #724 | test | **missing → P1** | E2E test coverage |

## STEP 2 — Duplicate Detection

No true duplicates found across all 18 issues. All issues target distinct code areas.

## STEP 3 — Consolidation

Testing issues (#788, #787, #725, #754, #724) all address different testing layers (UI, DB, API, webhook, E2E). They are specific enough to warrant separate tracking. No consolidation recommended.

## STEP 4 — Repair Mode

### Issues Already Resolved in Code (but not closed)

| Issue | Evidence |
|-------|----------|
| #786 — Stripe secret logging | Commit `69b43e0`: `fix(security): remove partial secret logging from Stripe webhook rate limiter` |
| #785 — Duplicate next dependency | `packages/stripe/package.json` has no duplicate `next` entry |
| #748 — .nvmrc invalid value | File contains `22.14.0` (fixed by `de2d52b`) |
| #788 — UI component tests | 273-line navbar.test.tsx, 292-line modal.test.tsx, 10+ test files exist |
| #787 — DB tests | 5 test files exist (added `db-instance.test.ts`, `rls-middleware.test.ts`, `logger.test.ts`) |
| #725 — API integration tests | Stripe (187 lines), customer (305 lines), k8s (519 lines) test files exist |
| #724 — E2E tests | 11 e2e spec files including `critical-flows.spec.ts`, `subscription-workflows.spec.ts`, `webhook-error-handling.spec.ts` |
| #729 — Bundle size testing | Commit `a232c15`: `fix(ci): add bundle size regression testing with size-limit integration` |
| #726 — Dependency consistency | `check-deps` script exists in root `package.json`, included in `dx:check` |

### Issues Requiring `workflows: write` Permission

These have **designed/ready-to-deploy solutions** but cannot be pushed with the current token:

| Issue | Status | Action Needed |
|-------|--------|---------------|
| #744 — iterate.yml pnpm consistency | Design complete; ready-to-deploy script at `scripts/deploy-ci-fixes.sh` | Run script with `workflows: write` token |
| #728 — Security scanning workflows | Ready-to-deploy files at `docs/ci/workflows/security-audit.yml` and `docs/ci/workflows/codeql-analysis.yml` | Run `scripts/deploy-security-workflows.sh` with `workflows: write` token |

### Actions Taken This Session

| Action | Target | Result |
|--------|--------|--------|
| Issue normalization audit | 18 open issues | Documented missing labels |
| Duplicate detection | All issues | No duplicates found |
| Code verification | #786, #785, #748, #788, #787, #725, #724, #729, #726 | All confirmed resolved in code |
| iterate.yml pnpm fix | `.github/workflows/iterate.yml` | Cannot push (workflows permission) |
| Security workflow deployment | `.github/workflows/security-audit.yml`, `.github/workflows/codeql-analysis.yml` | Cannot push (workflows permission) |
| Created deploy script | `scripts/deploy-ci-fixes.sh` | Pushed to PR #984 |
| Created PR #984 | `fix/deploy-script-ci-fixes` | Open; contains deployment script |

## Recommendations

1. **Close stale issues**: Issues #786, #785, #748, #788, #787, #725, #724, #729, #726 have code evidence showing they're resolved
2. **Deploy workflow fixes**: Have a maintainer with `workflows: write` token run:
   ```bash
   bash scripts/deploy-ci-fixes.sh
   ```
   This deploys both the security scanning workflows and the pnpm consistency fix
3. **Remaining work**: Issues #754 (webhook integration tests), #755 (DB index), #753 (code splitting), #752 (CLI utilities), #751 (tRPC splitting), #749 (AI tools), #731 (API docs), #727 (AI review) need implementation
