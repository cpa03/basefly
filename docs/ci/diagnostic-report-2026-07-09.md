# CI Diagnostic Report — 2026-07-09

## Summary

Comprehensive diagnostic of the Basefly monorepo conducted on 2026-07-09.

## Build Status

| Check      | Status        | Details                                                                        |
| ---------- | ------------- | ------------------------------------------------------------------------------ |
| Build      | ❌ FAIL       | `@saasfly/nextjs` fails with `webidl.util.markAsUncloneable is not a function` |
| Lint       | ✅ PASS       | 8/8 packages, zero errors, zero warnings                                       |
| Typecheck  | ✅ PASS       | 8/8 packages                                                                   |
| Tests      | ✅ PASS       | 68 files, 1419 tests passing                                                   |
| pnpm audit | ⚠️ 5 moderate | All `@opentelemetry/core` via `contentlayer2` (CVE pending)                    |

## Critical Issues

### 1. Node.js Version Mismatch (P0 — Build Breaking)

**Root Cause**: CI hardcodes `node-version: 20` in 5 locations across 2 workflow files, but `.nvmrc` specifies `22.14.0` and `package.json` engines requires `>=22`.

**Affected files**:

- `.github/workflows/on-pull.yml` line 55
- `.github/workflows/iterate.yml` lines 70, 266, 340, 395

**Fix**: Change all to `node-version-file: '.nvmrc'`

### 2. pnpm Cache Inconsistency (P1)

**Root Cause**: `.github/workflows/iterate.yml` line 58-59 uses `~/.npm` cache path and `package-lock.json` cache key instead of pnpm equivalents.

**Fix**:

- Cache path: `~/.npm` → `~/.local/share/pnpm/store`
- Cache key: `package-lock.json` → `pnpm-lock.yaml`

### 3. npm ci Instead of pnpm (P1)

**Root Cause**: `.github/workflows/iterate.yml` lines 72, 342 use `npm ci || true` instead of `pnpm install --frozen-lockfile || true`.

**Fix**: Replace with `pnpm install --frozen-lockfile || true`

## Scoring

### A. Code Quality: 85/100

| Criterion             | Score | Evidence                                       |
| --------------------- | ----- | ---------------------------------------------- |
| Correctness           | 90    | 1419 tests pass, typecheck clean               |
| Readability & Naming  | 85    | Consistent naming, TypeScript strict           |
| Simplicity            | 80    | Some over-engineering in resilience patterns   |
| Modularity & SRP      | 85    | Good monorepo separation                       |
| Consistency           | 90    | ESLint/Prettier consistent across all packages |
| Testability           | 70    | 31.44% coverage, many UI components untested   |
| Maintainability       | 85    | Clean patterns, good error handling            |
| Error Handling        | 90    | Comprehensive error handling with typed errors |
| Dependency Discipline | 85    | Good use of workspace protocols                |
| Determinism           | 80    | Some flakiness from timing-dependent tests     |

### B. System Quality: 65/100

| Criterion     | Score | Evidence                                           |
| ------------- | ----- | -------------------------------------------------- |
| Stability     | 60    | Build broken due to Node.js version mismatch       |
| Performance   | 75    | No bundle monitoring, code splitting partial       |
| Security      | 65    | 5 moderate vulns, no automated scanning in CI      |
| Scalability   | 70    | Good DB indexing, Prisma/Kysely patterns           |
| Resilience    | 75    | Circuit breakers, retry logic, webhook idempotency |
| Observability | 55    | Pino logging but no structured telemetry           |

### C. Experience Quality: 78/100

| Criterion       | Score | Evidence                               |
| --------------- | ----- | -------------------------------------- |
| Accessibility   | 75    | Some ARIA labels, partial coverage     |
| User Flow       | 85    | Clean dashboard, subscription flows    |
| Error Messaging | 80    | Good error responses                   |
| Responsiveness  | 75    | Mobile nav, responsive layouts         |
| API Clarity     | 85    | tRPC with Zod schemas, typed endpoints |
| Dev Setup       | 70    | Docker + manual setup, env validation  |
| Documentation   | 80    | Good docs structure, some gaps         |
| Debuggability   | 75    | Pino logging, request IDs              |
| Build/Test Loop | 70    | No turbo cache in CI, slow feedback    |

### D. Delivery Readiness: 60/100

| Criterion        | Score | Evidence                                                   |
| ---------------- | ----- | ---------------------------------------------------------- |
| CI/CD Health     | 50    | Build broken, no security scanning, npm/pnpm inconsistency |
| Release Safety   | 65    | No automated rollback, no canary                           |
| Config Parity    | 70    | .env.example exists, CI env differs from prod              |
| Migration Safety | 60    | No migration tests, no schema validation                   |
| Tech Debt        | 55    | ESLint v8 (v10 available), stale issues, 5 vulns           |
| Change Velocity  | 60    | No bundle size regression detection                        |

## Recommendations

1. **P0**: Fix Node.js version in CI workflows (switch to `node-version-file: '.nvmrc'`)
2. **P1**: Deploy security scanning workflows from `docs/ci/security-scanning.md`
3. **P1**: Fix pnpm cache consistency in iterate.yml
4. **P2**: Add bundle size monitoring to CI
5. **P2**: Update ESLint from v8 to v10
6. **P3**: Add structured telemetry (OpenTelemetry)
7. **P3**: Close stale issues (#785, #786, #728, #754, #748)

## Related Issues

- #744 — pnpm consistency in iterate.yml
- #748 — .nvmrc invalid value
- #728 — Add security scanning workflows to CI
- #729 — Bundle size regression testing
- #726 — Dependency consistency checking in CI
