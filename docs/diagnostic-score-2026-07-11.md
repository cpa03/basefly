# Comprehensive Diagnostic Score — 2026-07-11

## Evaluation Metadata

- **Date**: 2026-07-11
- **Environment**: Node.js v20.20.2, pnpm 10.28.2
- **Default Branch**: main
- **Runner**: CI (GitHub Actions - schedule event)
- **Permissions**: Read-only token (unable to modify labels/issues/PRs)

---

## Global Penalties Applied

| Penalty                       | Reason                                                                                                                    | Value                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| ✅ Build Failure (Node 20)    | `webidl.util.markAsUncloneable is not a function` in Next.js 16 — environment incompatibility (Node <22), not code defect | **-20 System Quality/Stability** |
| ✅ No test failures           | 1419/1419 passed across 68 test files                                                                                     | **No penalty**                   |
| ✅ No critical vulns detected | Security overrides in pnpm mitigate known issues                                                                          | **No penalty**                   |

---

## A. CODE QUALITY — Score: 82/100

### Correctness (Weight: 15) — Score: 85

| Aspect           | Detail                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | 1419 tests pass across 68 test files. TypeScript strict mode active (`strict: true`, `noUncheckedIndexedAccess: true`). tRPC provides end-to-end type safety.                            |
| **Evidence**     | `pnpm test` → 68/68 files, 1419/1419 passed. TypeScript strict mode in `tooling/typescript-config/base.json`.                                                                            |
| **Impact/Risk**  | Low — well-tested and type-safe codebase.                                                                                                                                                |
| **Rationale**    | -15: Some `as any` usage in test files (packages/stripe/src/client.test.ts, webhook-idempotency.test.ts). No known runtime correctness issues but type escapes reduce safety guarantees. |

### Readability & Naming (Weight: 10) — Score: 90

| Aspect           | Detail                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Clear naming conventions throughout. Well-structured exports. JSDoc comments present on public APIs. Consistent file organization. |
| **Evidence**     | All packages follow consistent naming: camelCase for functions/variables, PascalCase for types/components, kebab-case for files.   |
| **Impact/Risk**  | Low.                                                                                                                               |
| **Rationale**    | -10 for minor inconsistency: some files use single-letter variables in test callbacks.                                             |

### Simplicity (Weight: 10) — Score: 85

| Aspect           | Detail                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Monorepo with clear separation of concerns. Clean package structure. Straightforward tRPC router organization.                    |
| **Evidence**     | 6 packages (api/auth/common/db/stripe/ui) + 1 app (nextjs) with clean dependency graph.                                           |
| **Impact/Risk**  | Low.                                                                                                                              |
| **Rationale**    | -15: Some complexity introduced by multi-platform support (Cloudflare Workers via opennextjs-cloudflare) adds cognitive overhead. |

### Modularity & SRP (Weight: 15) — Score: 85

| Aspect           | Detail                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Clean monorepo with well-defined package boundaries. Each package has single responsibility.                                                |
| **Evidence**     | 6 packages with clear purposes: api (routers), auth (Clerk), common (shared utils), db (Prisma/Kysely), stripe (payments), ui (components). |
| **Impact/Risk**  | Low.                                                                                                                                        |
| **Rationale**    | -15: Some cross-package coupling (api references db types, stripe references common). Barrel exports could be more disciplined.             |

### Consistency (Weight: 5) — Score: 90

| Aspect           | Detail                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| **Observations** | Consistent ESLint, Prettier, TypeScript configs across workspace. Shared config packages enforce uniformity. |
| **Evidence**     | `check-deps` passes. Lint passes 8/8 packages.                                                               |
| **Impact/Risk**  | Low.                                                                                                         |
| **Rationale**    | -10: Minor inconsistencies in import ordering and file headers across packages.                              |

### Testability (Weight: 15) — Score: 75

| Aspect           | Detail                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | 68 test files, 1419 tests all passing. But coverage is uneven: Stripe package and auth are well-tested, while db and nextjs UI have minimal coverage. |
| **Evidence**     | `pnpm test` passes all. db package only has soft-delete and user-deletion tests. Nextjs has 3 hook tests but no UI component tests.                   |
| **Impact/Risk**  | Medium — database layer is critical infra with low coverage.                                                                                          |
| **Rationale**    | -25 for coverage gaps: packages/db (issues #787), no UI component tests (issue #788), no e2e tests for critical flows (issue #724).                   |

### Maintainability (Complexity) (Weight: 10) — Score: 80

| Aspect           | Detail                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Clean abstractions. Turbo monorepo for orchestration. Security overrides maintained. But large docs/ dir (77 entries) shows documentation sprawl. |
| **Evidence**     | docs/ has 77 entries including stale audit reports dating back to Feb 2026.                                                                       |
| **Impact/Risk**  | Medium — documentation creep can confuse new contributors.                                                                                        |
| **Rationale**    | -20: Documentation sprawl with many stale/superseded reports. Some deep import chains in webhook handling.                                        |

### Error Handling (Weight: 10) — Score: 75

| Aspect           | Detail                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Custom Error classes (IntegrationError, InvalidRequestIdError). Structured try/catch throughout. Retry logic in Stripe integration.                                 |
| **Evidence**     | 50+ catch blocks across codebase. Custom error classes in packages/stripe/src/integration.ts and packages/api/src/errors.ts. Logger utility with structured output. |
| **Impact/Risk**  | Medium.                                                                                                                                                             |
| **Rationale**    | -25: Some catch blocks are generic (`catch (error)` without typing). Several catch blocks log to console rather than through the logger utility.                    |

### Dependency Discipline (Weight: 5) — Score: 80

| Aspect           | Detail                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | pnpm workspaces with security overrides. `check-deps` script available. Dependency overrides for known CVEs maintained.                             |
| **Evidence**     | `pnpm-workspace.yaml` has 20+ security overrides. `package.json` has extensive overrides section. Duplicate `next` in packages/stripe (issue #785). |
| **Impact/Risk**  | Medium — duplicate dependency could cause build ambiguity.                                                                                          |
| **Rationale**    | -20: Duplicate dependency (issue #785). Some outdated dev tooling (eslint 8.x, vite 8.x could be newer).                                            |

### Determinism & Predictability (Weight: 5) — Score: 80

| Aspect           | Detail                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| **Observations** | Lockfile-based installs. Clear CI pipeline. Deterministic builds in controlled environments.         |
| **Evidence**     | `pnpm-lock.yaml` present. CI has clear steps. Build fails deterministically on Node 20.              |
| **Impact/Risk**  | Medium — build fails on Node 20 but succeeds on Node 22+.                                            |
| **Rationale**    | -20: Build failure on Node 20 (environment-specific). CI uses Node 20 but project requires Node 22+. |

---

## B. SYSTEM QUALITY (RUNTIME) — Score: 66/100

### Stability (Weight: 20) — Score: 60 (after -20 global penalty)

| Aspect           | Detail                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Build fails on Node 20 (the CI's Node version). `webidl.util.markAsUncloneable is not a function` error.            |
| **Evidence**     | `pnpm build` fails with Next.js 16.2.7/Turbopack webidl error. Root `.nvmrc` specifies 22.14.0 but CI uses Node 20. |
| **Impact/Risk**  | HIGH — blocks deployment on CI. CI and project requirements are out of sync.                                        |
| **Rationale**    | -20 global penalty + -20 for CI/requirements mismatch.                                                              |

### Performance Efficiency (Weight: 15) — Score: 70

| Aspect           | Detail                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Bundle size limits configured (450kB JS, 120kB CSS). No bundle analysis in CI. `use client` directives potentially high.           |
| **Evidence**     | `size-limit` configured in apps/nextjs/package.json. Issue #753 tracks code splitting. Issue #751 tracks tRPC bundle optimization. |
| **Impact/Risk**  | Medium — no CI guardrail against bundle bloat.                                                                                     |
| **Rationale**    | -30: No bundle monitoring in CI. Route-based code splitting not implemented. tRPC code splitting not implemented.                  |

### Security Practices (Weight: 20) — Score: 55

| Aspect           | Detail                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Observations** | Clerk for auth. RBAC middleware. RLB middleware for database. Security overrides for dependencies. BUT: No security scanning in CI. Stripe webhook previously logged partial secret (now fixed in commit 69b43e0). |
| **Evidence**     | Issue #728: No security scanning in CI. Issue #786: WAS a real issue but already fixed. No CodeQL/SAST. `pnpm audit` not in CI pipeline.                                                                           |
| **Impact/Risk**  | HIGH — no automated security scanning means vulnerabilities could merge undetected.                                                                                                                                |
| **Rationale**    | -20 for missing security scanning in CI (issue #728). -15 for no SAST/CodeQL. -10 for previous secret leakage (now fixed). Issue #786 is stale and should be closed.                                               |

### Scalability Readiness (Weight: 15) — Score: 70

| Aspect           | Detail                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | PostgreSQL with Prisma for schema management. Monorepo design supports scale. tRPC for type-safe API.                                  |
| **Evidence**     | Prisma schema in packages/db/prisma. tRPC v11 for API.                                                                                 |
| **Impact/Risk**  | Low-Medium.                                                                                                                            |
| **Rationale**    | -30: No explicit caching layer for API responses. No connection pooling configuration visible. Missing composite indexes (issue #755). |

### Resilience & Fault Tolerance (Weight: 15) — Score: 80

| Aspect           | Detail                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Stripe integration with retry logic, circuit breaker. Webhook idempotency implemented. Soft delete patterns in DB layer. Error handling throughout.                                |
| **Evidence**     | `packages/stripe/src/integration.ts` has retry/circuit-breaker. `packages/stripe/src/webhook-idempotency.ts` implements idempotency. `packages/db/soft-delete.ts` for data safety. |
| **Impact/Risk**  | Low.                                                                                                                                                                               |
| **Rationale**    | -20: Idempotency is not comprehensively tested (issue #754). Rate limiting is basic (fixed window, no distributed support).                                                        |

### Observability (Weight: 15) — Score: 65

| Aspect           | Detail                                                                                                                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Logger utility with structured JSON output. Health check endpoints. Rate limiting headers. Request tracing with request IDs.                                                                                                                       |
| **Evidence**     | `apps/nextjs/src/lib/logger.ts` with structured JSON and log levels. Health check at `/api/health`. Rate limit headers on Stripe webhook.                                                                                                          |
| **Impact/Risk**  | Medium.                                                                                                                                                                                                                                            |
| **Rationale**    | -35: No centralized observability platform integration (Datadog, Grafana, etc.). No metrics collection. Logger uses `console.log` internally which is not suitable for production observability. No OpenTelemetry tracing. No alerting configured. |

---

## C. EXPERIENCE QUALITY (UX / DX) — Score: 74/100

### UX: Accessibility — Score: 75

| Aspect           | Detail                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Observations** | Radix UI components (accessible by default). ESLint a11y plugin configured. Some known a11y issues in dialogs and mobile nav.                                |
| **Evidence**     | ESLint config includes `jsx-a11y` plugin. Radix UI provides ARIA-compliant primitives. Previous fix branches for aria labels and dialog accessibility exist. |
| **Impact/Risk**  | Medium.                                                                                                                                                      |
| **Rationale**    | -25: Known accessibility issues (dialog aria, mobile nav aria-current). No dedicated a11y testing.                                                           |

### UX: User Flow Clarity — Score: 85

| Aspect           | Detail                                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Clear pricing page with subscription tiers. Dashboard with cluster management. Multi-language support (en, zh, de, vi). |
| **Evidence**     | `apps/nextjs/src/app/[lang]/(marketing)/pricing/` - pricing page. Dashboard components. i18n support with dictionaries. |
| **Impact/Risk**  | Low.                                                                                                                    |
| **Rationale**    | -15: Some flows (cluster creation, subscription upgrade) lack e2e test coverage (issue #724).                           |

### UX: Feedback & Error Messaging — Score: 75

| Aspect           | Detail                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Toast notifications for user feedback. Structured error responses from API. Generic catch blocks sometimes obscure error details. |
| **Evidence**     | Toast components in ui package. API returns structured error responses.                                                           |
| **Impact/Risk**  | Medium.                                                                                                                           |
| **Rationale**    | -25: Some error messages are overly generic. No dedicated error pages for all 4xx/5xx states.                                     |

### DX: API Clarity — Score: 85

| Aspect           | Detail                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Observations** | tRPC provides end-to-end type safety. Well-documented routers. Auto-complete in IDE from tRPC types.                   |
| **Evidence**     | tRPC v11 with proper router definitions. API spec documented in docs/api-spec.md.                                      |
| **Impact/Risk**  | Low.                                                                                                                   |
| **Rationale**    | -15: API documentation is manually maintained and can drift from implementation (issue #731 proposes auto-generation). |

### DX: Local Dev Setup — Score: 75

| Aspect           | Detail                                                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Docker Compose for local development. Vercel one-click deploy. Clear README. But .nvmrc has incomplete version.                                                                                |
| **Evidence**     | `docker-compose.yml`, `Dockerfile`, README.md with setup instructions. Issue #748: .nvmrc has incomplete version.                                                                              |
| **Impact/Risk**  | Medium.                                                                                                                                                                                        |
| **Rationale**    | -25: .nvmrc issue (issue #748). Dev setup requires multiple external services (Clerk, Stripe, Resend, PostgreSQL) which creates friction. No `pnpm setup` or `make setup` convenience command. |

### DX: Documentation Accuracy — Score: 65

| Aspect           | Detail                                                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Comprehensive docs/ directory but many stale/superseded reports. 77 files including audit reports from Feb-Jun 2026.                                             |
| **Evidence**     | `/docs` has 77 entries. Multiple overlapping audit reports (diagnostic-score-2026-06-14, 06-29, 07-02, 07-11).                                                   |
| **Impact/Risk**  | Medium — stale docs mislead contributors.                                                                                                                        |
| **Rationale**    | -35: Documentation sprawl with 77 files. 10+ audit reports from different dates create confusion about which is current. No TOC or index for the docs directory. |

### DX: Build/Test Feedback Loop — Score: 70

| Aspect           | Detail                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Turbo for cached builds (fast). Vitest for fast test execution. But build fails in CI.                                 |
| **Evidence**     | `turbo.json` with caching. Tests run in 18s. Build fails due to Node version mismatch.                                 |
| **Impact/Risk**  | Medium.                                                                                                                |
| **Rationale**    | -30: Build failure in CI creates broken feedback loop. Tests run locally but build can't be verified without Node 22+. |

---

## D. DELIVERY & EVOLUTION READINESS — Score: 67/100

### CI/CD Health (Weight: 20) — Score: 45

| Aspect           | Detail                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------ |
| **Observations** | Two workflows (on-pull.yml, iterate.yml). Both use Node 20 (project requires 22+). iterate.yml uses `npm ci` instead of `pnpm install`. No security scanning.               |
| **Evidence**     | `.github/workflows/iterate.yml` line 72: `npm ci                                                                                                                            |     | true`(should be pnpm). Line 55:`node-version: "20"`. Issue #744 tracks pnpm consistency. No pnpm audit, no CodeQL. |
| **Impact/Risk**  | HIGH — CI is the most critical quality gate and has multiple fundamental issues.                                                                                            |
| **Rationale**    | -55: Node version mismatch (needs 22, uses 20). npm instead of pnpm (issue #744). No security scanning (issue #728). No bundle checks. No dependency drift detection in CI. |

### Release & Rollback Safety (Weight: 20) — Score: 70

| Aspect           | Detail                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| **Observations** | Rollback guide exists. CHANGELOG.md present. No automated release pipeline.                                |
| **Evidence**     | `docs/rollback-guide.md`, `CHANGELOG.md`. No semantic release or automated versioning.                     |
| **Impact/Risk**  | Medium.                                                                                                    |
| **Rationale**    | -30: No automated release pipeline. No semantic versioning enforcement. No automated changelog generation. |

### Config & Env Parity (Weight: 15) — Score: 75

| Aspect           | Detail                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | .env.example with 48 documented variables. Environment validation script. CI uses minimal env subset.                                              |
| **Evidence**     | `.env.example` has 48 variables. `tooling/qa/env-validate.js` validates required variables.                                                        |
| **Impact/Risk**  | Medium.                                                                                                                                            |
| **Rationale**    | -25: Many env vars make setup complex. No env schema validation beyond presence check. CI uses only 10 of 48 vars, creating risk of parity issues. |

### Migration Safety (Weight: 15) — Score: 80

| Aspect           | Detail                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| **Observations** | Prisma migrations for schema changes. Soft delete for data safety. Kysely for type-safe queries.     |
| **Evidence**     | `packages/db/prisma/` contains schema. `packages/db/soft-delete.ts` implements soft-delete patterns. |
| **Impact/Risk**  | Low.                                                                                                 |
| **Rationale**    | -20: No migration tests (issue #787). No automated rollback testing.                                 |

### Technical Debt Exposure (Weight: 15) — Score: 60

| Aspect           | Detail                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | 21 open issues. `as any` in test files. Duplicate dependency. Stale docs. Outdated dev tooling.                                                      |
| **Evidence**     | 21 open issues (including 3 P1, 5 P2, 1 bug). `as any` in test files. 77 docs files.                                                                 |
| **Impact/Risk**  | Medium-High — accumulating debt reduces velocity.                                                                                                    |
| **Rationale**    | -40: 21 open issues (significant backlog). Stale issues (like #786 which is already fixed). Documentation sprawl. Several outdated dev dependencies. |

### Change Velocity & Blast Radius (Weight: 15) — Score: 75

| Aspect           | Detail                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Observations** | Monorepo with Turbo for targeted builds. Clear package boundaries. Tests for regression protection.                        |
| **Evidence**     | Turbo tasks with proper dependency chain. Package isolation. 1419 tests.                                                   |
| **Impact/Risk**  | Low-Medium.                                                                                                                |
| **Rationale**    | -25: Build failure blocks any CI pipeline. No integration/contract tests between packages increases risk of silent breaks. |

---

## Summary Scores

| Domain                      | Score      | Weighted |
| --------------------------- | ---------- | -------- |
| **A. Code Quality**         | 82/100     | 82       |
| **B. System Quality**       | 66/100     | 66       |
| **C. Experience Quality**   | 74/100     | 74       |
| **D. Delivery & Evolution** | 67/100     | 67       |
| **Overall**                 | **72/100** | **72**   |

## Key Findings by Severity

### Critical

| Finding                                                 | Domain        | Related Issues |
| ------------------------------------------------------- | ------------- | -------------- |
| CI uses Node 20 but project requires Node 22+           | D (CI/CD)     | —              |
| No security scanning in CI (audit, CodeQL, SAST)        | B (Security)  | #728           |
| Build fails deterministically in CI due to Node version | B (Stability) | —              |

### High

| Finding                                                | Domain          | Related Issues |
| ------------------------------------------------------ | --------------- | -------------- |
| iterate.yml uses `npm ci` instead of `pnpm install`    | D (CI/CD)       | #744           |
| No e2e tests for critical user flows                   | A (Testability) | #724           |
| Stripe partial secret logging (FIXED - issue is stale) | B (Security)    | #786 (stale)   |
| Duplicate next dependency in packages/stripe           | A (Deps)        | #785           |
| Database layer has minimal test coverage               | A (Testability) | #787           |

### Medium

| Finding                                  | Domain          | Related Issues |
| ---------------------------------------- | --------------- | -------------- |
| No UI component tests                    | A (Testability) | #788           |
| 21 open issues accumulating              | D (Debt)        | —              |
| Documentation sprawl (77 files in /docs) | C (Docs)        | —              |
| No bundle monitoring in CI               | B (Performance) | #729           |
| No dependency drift detection in CI      | D (CI/CD)       | #726           |
| .nvmrc has incomplete version            | C (DX)          | #748           |

---

## Phase Transition Recommendation

Due to read-only token permissions in this run, I am **blocked** from:

- Adding priority labels to issues (lack of `issues: write` permission in schedule event)
- Creating new issues for findings
- Closing stale issues (#786)
- Pushing code changes or creating PRs for fixes

**Recommended next run** (on-pull or push event with write permissions):

1. Add priority labels: P1 for #724, #728, #754, #785, #786; P2 for #725, #748, #751-753, #787-789; P3 for #726, #727, #729, #731, #755
2. Close issue #786 (already fixed in commit 69b43e0)
3. Proceed to Repair Mode (STEP 4): Fix issue #785 (duplicate next dependency - trivial fix)
4. Fix CI Node version to 22 in both workflows
5. Fix iterate.yml to use pnpm instead of npm
