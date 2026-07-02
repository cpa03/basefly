# Comprehensive Diagnostic Score — 2026-07-02

## Evaluation Metadata

- **Date**: 2026-07-02
- **Environment**: Node.js v20.20.2, pnpm 10.28.2
- **Default Branch**: main
- **Runner**: CI (GitHub Actions)

---

## Global Penalties Applied

| Penalty                    | Reason                                                                                                         | Value                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| ✅ Build Failure (Node 20) | `webidl.util.markAsUncloneable is not a function` in Next.js 16 — environment incompatibility, not code defect | **-20 System Quality/Stability** |
| ✅ No test failures        | 1403/1403 passed                                                                                               | **No penalty**                   |
| ✅ 6 moderate vulns        | `@opentelemetry/core` (through contentlayer2) + `js-yaml` (dev dep)                                            | **-10 System Quality/Security**  |

---

## A. CODE QUALITY — Score: 87/100

### Correctness (Weight: 15) — Score: 90

- **Observations**: 1403 tests pass across 67 test files. TypeScript strict mode active. tRPC provides end-to-end type safety.
- **Evidence**: `pnpm test` → 67/67 files, 1403/1403 passed. `pnpm typecheck` → 8/8 packages pass.
- **Impact/Risk**: Low — the codebase is well-tested and type-safe.
- **Rationale**: -10 for minor issues like potentially unhandled edge cases in webhook handlers.

### Readability & Naming (Weight: 10) — Score: 90

- **Observations**: Consistent naming conventions (camelCase, PascalCase for components). Proper TypeScript types. JSDoc comments on critical functions.
- **Evidence**: File review shows clear naming patterns. Lint passes (8/8 packages).
- **Impact/Risk**: Low.
- **Rationale**: -10 for minor inconsistencies in docs naming.

### Simplicity (Weight: 10) — Score: 85

- **Observations**: Some packages have complex interdependencies (e.g., contentlayer2 pulling heavy OpenTelemetry deps). The webhook handler is clean.
- **Evidence**: Package dependency tree shows some transitive complexity. Stripe integration is cleanly modularized.
- **Impact/Risk**: Medium — dependency bloat affects build and runtime.
- **Rationale**: -15 for unnecessary complexity in dependency chain.

### Modularity & SRP (Weight: 15) — Score: 90

- **Observations**: Clean monorepo separation: api/auth/db/common/stripe/ui/nextjs. Good single-responsibility in packages.
- **Evidence**: 11 well-defined packages with clear boundaries.
- **Impact/Risk**: Low.
- **Rationale**: -10 for some cross-package coupling (e.g., auth env vars referenced in multiple places).

### Consistency (Weight: 5) — Score: 95

- **Observations**: Consistent eslint, prettier, TypeScript configs across workspace. `check-deps` passes (all versions consistent).
- **Evidence**: `pnpm check-deps` runs clean. Lint passes universally.
- **Impact/Risk**: Low.
- **Rationale**: -5 for minor style variations.

### Testability (Weight: 15) — Score: 80

- **Observations**: 67 test files, 1403 tests, 687 test files total. But test quality varies:
  - packages/common: good coverage for simple modules
  - packages/stripe: has webhook-idempotency tests
  - packages/db: only 2 test files (soft-delete, user-deletion)
  - apps/nextjs: minimal UI tests
- **Evidence**: `find . -name "*.test.*" | wc -l` = 687 files. `pnpm test` passes all.
- **Impact/Risk**: Medium — critical database layer has minimal coverage.
- **Rationale**: -20 for below-adequate test coverage in db/nextjs packages.

### Maintainability (Complexity) (Weight: 10) — Score: 85

- **Observations**: Clean abstractions in most packages. The integration test setup is complex.
- **Evidence**: Code review shows clear separation but some deep import chains.
- **Impact/Risk**: Medium.
- **Rationale**: -15 for some cyclomatic complexity in webhook handling.

### Error Handling (Weight: 10) — Score: 85

- **Observations**: Structured error handling with logging. Retry logic in Stripe integration. But some catch blocks could be more specific.
- **Evidence**: Stripe webhook has try/catch with specific error types. Rate limiting implemented.
- **Impact/Risk**: Medium.
- **Rationale**: -15 for some generic error catch blocks catching too broadly.

### Dependency Discipline (Weight: 5) — Score: 80

- **Observations**: `check-deps` passes. But 6 moderate vulns through transitive deps. Dev deps are outdated (eslint 8→10, TypeScript 5→6, vite 7→8).
- **Evidence**: `pnpm audit` shows 6 moderate. `pnpm outdated` shows 8 packages behind.
- **Impact/Risk**: Medium — outdated dev tooling can cause friction.
- **Rationale**: -20 for moderate vulnerabilities and outdated dev tooling.

### Determinism & Predictability (Weight: 5) — Score: 90

- **Observations**: Lockfile-based installs (frozen-lockfile). Clear CI pipeline. Deterministic builds in controlled environments.
- **Evidence**: `pnpm install --frozen-lockfile` succeeds. CI has clear steps.
- **Impact/Risk**: Low.
- **Rationale**: -10 for build failure on Node 20 (environment-specific).

---

## B. SYSTEM QUALITY (RUNTIME) — Score: 76/100

### Stability (Weight: 20) — Score: 70

- **Observations**: Build fails on Node 20 (the environment's Node version). This is a deployment blocker.
- **Evidence**: `pnpm build` fails with `webidl.util.markAsUncloneable is not a function` in Next.js 16.2.7.
- **Impact/Risk**: HIGH — blocks deployment on Node 20 environments.
- **Rationale**: -30 for build failure penalized (-20 global + -10 additional).

### Performance Efficiency (Weight: 15) — Score: 80

- **Observations**: 82+ `use client` directives across the codebase (44 in nextjs, 38 in ui). No bundle analysis configured.
- **Evidence**: Grep shows 82 client component files. Issue #723 tracks this.
- **Impact/Risk**: Medium — potential client bundle bloat.
- **Rationale**: -20 for missing bundle optimization tooling and excess client components.

### Security Practices (Weight: 20) — Score: 78

- **Observations**: 6 moderate vulns. Security headers implemented in webhook. No security scanning in CI. No SAST/CodeQL. Authorization checks could be stronger (issue #721).
- **Evidence**: `pnpm audit` shows 6 moderate. Environment validation exists but runs no security scanning.
- **Impact/Risk**: Medium-High — dependency vulns and missing security CI.
- **Rationale**: -10 global penalty for vulns. Additional -12 for missing security automation.

### Scalability Readiness (Weight: 15) — Score: 85

- **Observations**: Stateless design (PostgreSQL, Next.js edge-ready). Rate limiting for Stripe webhooks. Database indexing mentioned in issues.
- **Evidence**: Rate limiter implemented. Clean separation of concerns.
- **Impact/Risk**: Low-Medium.
- **Rationale**: -15 for untested database query performance at scale.

### Resilience & Fault Tolerance (Weight: 15) — Score: 80

- **Observations**: Retry logic in Stripe integration. Circuit breaker implementation. Webhook idempotency. Graceful error handling.
- **Evidence**: Webhook has idempotency. Stripe client has retry logic.
- **Impact/Risk**: Medium.
- **Rationale**: -20 for untested failure modes in critical payment flow.

### Observability (Weight: 15) — Score: 75

- **Observations**: Structured logging (pino). Request ID tracking. Rate limit monitoring. But no metrics/APM integration.
- **Evidence**: pino logger in stripe. Request IDs via `REQUEST_ID_HEADER`. No OpenTelemetry instrumentation.
- **Impact/Risk**: Medium.
- **Rationale**: -25 for missing APM/metrics/structured observability platform.

---

## C. EXPERIENCE QUALITY (UX/DX) — Score: 82/100

### UX — Accessibility (Weight: 10) — Score: 80

- **Observations**: Radix UI primitives provide good accessibility defaults. But no explicit accessibility testing.
- **Evidence**: shadcn/ui uses Radix primitives which handle ARIA. No a11y tests found.
- **Rationale**: -20 for no automated accessibility testing.

### UX — User Flow Clarity (Weight: 10) — Score: 85

- **Observations**: Clear subscription flow (Free → Pro → Business). Dashboard navigation is straightforward.
- **Evidence**: README documents features and flows.
- **Rationale**: -15 for some complex flows not documented.

### UX — Feedback & Error Messaging (Weight: 10) — Score: 80

- **Observations**: Error responses have structured JSON. But could be more user-friendly in UI.
- **Evidence**: API returns structured errors. Frontend error display varies.
- **Rationale**: -20 for inconsistent frontend error presentation.

### UX — Responsiveness (Weight: 10) — Score: 85

- **Observations**: Tailwind CSS responsive classes. Mobile-friendly layout.
- **Evidence**: Framework defaults + Tailwind setup.
- **Rationale**: -15 for untested mobile responsive behavior.

### DX — API Clarity (Weight: 10) — Score: 90

- **Observations**: tRPC provides self-documenting APIs. Types flow end-to-end.
- **Evidence**: Clean tRPC router definitions. Well-structured procedure patterns.
- **Rationale**: -10 for missing auto-generated API documentation.

### DX — Local Dev Setup (Weight: 10) — Score: 75

- **Observations**: Comprehensive README. Docker setup. But requires Clerk/Stripe/Resend accounts. No Dev Containers.
- **Evidence**: README has setup instructions. One-click Vercel deploy. Issue #706 tracks Dev Containers.
- **Rationale**: -25 for high barrier to local setup (external services required).

### DX — Documentation Accuracy (Weight: 10) — Score: 85

- **Observations**: Extensive docs/ (68 files, 100k+ words). Some docs reference outdated issues.
- **Evidence**: docs/ directory has comprehensive coverage. Some stale references.
- **Rationale**: -15 for documentation drift and stale references.

### DX — Debuggability (Weight: 10) — Score: 80

- **Observations**: Request IDs through the stack. Structured logging. But no local debugging configuration.
- **Evidence**: REQUEST_ID_HEADER cross-cuts through API. pino logging.
- **Rationale**: -20 for missing debugger launch configurations (.vscode/launch.json).

### DX — Build/Test Feedback Loop (Weight: 10) — Score: 85

- **Observations**: Fast test suite (35s). Typecheck (10s). Lint (54s). Good DX scripts (dx:quick, dx:check).
- **Evidence**: `pnpm test` = 35s. `pnpm typecheck` = 10s.
- **Rationale**: -15 for slow lint (53s) and lack of watch mode for typecheck.

---

## D. DELIVERY & EVOLUTION READINESS — Score: 78/100

### CI/CD Health (Weight: 20) — Score: 75

- **Observations**: Two workflows (on-pull.yml, iterate.yml). CI runs on Ubuntu ARM. Includes env validation. Missing: dependency scan, security audit, bundle check.
- **Evidence**: `.github/workflows/` has 2 workflows. Issues #728, #726 track missing checks.
- **Rationale**: -25 for missing security scanning, dependency checking, and bundle analysis in CI.

### Release & Rollback Safety (Weight: 20) — Score: 75

- **Observations**: No documented release process. Prisma migrations exist but no rollback strategy. No Docker image tagging.
- **Evidence**: blueprint.md has deployment section but no release process.
- **Rationale**: -25 for undocumented release and rollback procedures.

### Config & Env Parity (Weight: 15) — Score: 80

- **Observations**: `.env.example` with 48 variables. Environment validation runs at build time. Some variables duplicated across env files.
- **Evidence**: `pnpm env:validate` passes. env.mjs files in multiple packages.
- **Rationale**: -20 for env var duplication across packages.

### Migration Safety (Weight: 15) — Score: 75

- **Observations**: Prisma migrations present. But no migration testing in CI. No schema versioning documentation.
- **Evidence**: packages/db has migrations directory. Issue #787 tracks migration testing.
- **Rationale**: -25 for untested database migrations.

### Technical Debt Exposure (Weight: 15) — Score: 82

- **Observations**: Clean codebase overall. 19 open issues (most enhancement/test). 6 moderate vulns. 8 outdated dev deps.
- **Evidence**: Issues mostly track testing and enhancements, not critical bugs.
- **Rationale**: -18 for moderate vulns and outdated tooling.

### Change Velocity & Blast Radius (Weight: 15) — Score: 85

- **Observations**: Monorepo with well-defined package boundaries. Turbo cache for fast rebuilds. Feature branch workflow.
- **Evidence**: Turbo config enables caching. Package-level granularity limits blast radius.
- **Rationale**: -15 for no trunk-based development or short-lived branch enforcement.

---

## Summary Scores

| Domain                      | Score      | Key Issues                                                      |
| --------------------------- | ---------- | --------------------------------------------------------------- |
| **A. Code Quality**         | **87/100** | Test coverage gaps in db/nextjs, outdated dev deps              |
| **B. System Quality**       | **76/100** | Build failure on Node 20, security vulns, missing observability |
| **C. Experience Quality**   | **82/100** | High local setup barrier, missing DX tooling                    |
| **D. Delivery & Evolution** | **78/100** | Missing release process, untested migrations, CI gaps           |
| **Overall**                 | **81/100** | Solid codebase with CI/DX/security gaps                         |

---

## Issues Already Resolved (Can be closed)

| Issue | Title                      | Reason                              |
| ----- | -------------------------- | ----------------------------------- |
| #720  | Missing .nvmrc             | .nvmrc exists with valid version    |
| #748  | .nvmrc invalid value "20"  | Now contains "22.14.0"              |
| #785  | Duplicate next in stripe   | No duplicate exists in current code |
| #786  | Stripe webhook logs secret | Secret slice removed from logs      |

## Issues Still Actionable (Not Resolved)

| Issue | Priority | Domain       | Actionable?                         |
| ----- | -------- | ------------ | ----------------------------------- |
| #721  | P1       | Security     | Yes - add authorization checks      |
| #724  | P1       | Test         | Yes - add e2e tests                 |
| #728  | P1       | Security     | Yes - add CI security scanning      |
| #754  | P1       | Test         | Yes - add webhook idempotency tests |
| #722  | P2       | Security     | Yes - env validation on startup     |
| #723  | P2       | Frontend     | Yes - reduce client components      |
| #725  | P2       | Test         | Yes - API integration tests         |
| #787  | P2       | Test         | Yes - DB tests                      |
| #788  | P2       | Test         | Yes - UI component tests            |
| #789  | P3       | Architecture | Yes - move React to peer deps       |
