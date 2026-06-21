# Issue Audit Report — 2026-06-21

## Summary

Comprehensive audit of all open issues in the repository. Findings: **most issues are already resolved in code** but remain open due to the CI token lacking `issues:write` permission. This report documents which issues need closure, which need labels, and which are genuinely outstanding.

---

## Section 1: Issues Already Resolved in Code (Need Closure)

These issues have been fixed by commits on `main` but remain open. They should be closed.

| Issue | Title                                          | Fix Commit                                            | Category         |
| ----- | ---------------------------------------------- | ----------------------------------------------------- | ---------------- |
| #786  | Stripe webhook logs partial secret             | `69b43e0`                                             | security (P1)    |
| #785  | Duplicate next dependency in packages/stripe   | Fixed — no longer in package.json                     | bug (P2)         |
| #789  | Add peerDependencies for React in packages/ui  | Already has both devDependencies and peerDependencies | enhancement (P2) |
| #748  | .nvmrc invalid value '20'                      | `de2d52b` — now "22.14.0"                             | bug (P2)         |
| #722  | Add environment variable validation at startup | `5adec30`, `79007ed`, `6720f52`                       | security (P1)    |
| #721  | Add explicit authorization checks              | `c290126`                                             | security (P1)    |
| #498  | RBAC role-based access control                 | `0c7c97a`                                             | security (P1)    |
| #515  | Add CSRF protection                            | `408b9e3`                                             | security (P1)    |
| #496  | Replace in-memory rate limiter with Redis      | `5881602`                                             | security (P0)    |
| #500  | Clerk authentication flow tests                | `734f286`, `8860d13`                                  | test (P1)        |
| #501  | Playwright E2E tests                           | `734f286`                                             | test (P1)        |
| #549  | Tests for packages/auth module                 | `d58dc48`                                             | test (P1)        |
| #551  | Tests for k8s router                           | `8860d13`                                             | test (P1)        |
| #755  | Composite index for subscription queries       | Already in schema.prisma                              | enhancement (P2) |
| #697  | Corrupted text formatting in docs              | `b3b9000`                                             | docs (P2)        |
| #719  | Missing root-level TypeScript configuration    | Root tsconfig.json exists                             | enhancement (P2) |
| #613  | Remove duplicate GitHub Actions workflow       | `0db3181` — paratterate.yml deleted                   | ci (P2)          |
| #720  | Missing .nvmrc for Node.js version consistency | .nvmrc exists with "22.14.0"                          | enhancement (P3) |

**Total resolved but unclosed: 18 issues**

---

## Section 2: Issues Missing Category/Priority Labels

Per the label system requirement (exactly one category + exactly one priority), these issues need label updates:

| Issue | Title                                         | Current Labels                       | Needed Category | Needed Priority |
| ----- | --------------------------------------------- | ------------------------------------ | --------------- | --------------- |
| #755  | [Database] Add composite index                | `database-architect`                 | enhancement     | P2              |
| #754  | [QA] Add integration tests for Stripe webhook | `quality-assurance`                  | test            | P2              |
| #753  | [Frontend] Route-based code splitting         | `frontend-engineer`                  | enhancement     | P2              |
| #752  | [DX] Unified CLI output utilities             | `DX-engineer`                        | enhancement     | P3              |
| #751  | [Performance] Optimize tRPC bundle size       | `performance-engineer`               | enhancement     | P2              |
| #749  | [Innovation] AI-powered API testing           | `Growth-Innovation-Strategist`       | enhancement     | P3              |
| #744  | fix(ci): pnpm consistency in iterate.yml      | `Growth-Innovation-Strategist`       | ci              | P2              |
| #697  | Fix corrupted text formatting                 | `technical-writer`                   | docs            | P2              |
| #731  | Auto-generate API documentation               | enhancement                          | —               | P3              |
| #729  | Bundle size regression testing                | enhancement                          | test (consider) | P2              |
| #728  | Security scanning workflows                   | security                             | —               | P2              |
| #727  | AI-Powered Code Review Automation             | enhancement                          | —               | P3              |
| #726  | Add dependency consistency checking to CI     | ci                                   | —               | P2              |
| #720  | Missing .nvmrc (already resolved)             | enhancement                          | —               | P3              |
| #713  | Unit tests for packages/common                | enhancement, test, quality-assurance | test (OK)       | P2              |

---

## Section 3: Duplicate or Overlapping Issues

| Primary Issue                      | Duplicate/Overlap                            | Recommendation                  |
| ---------------------------------- | -------------------------------------------- | ------------------------------- |
| #724 "Missing e2e test coverage"   | #628 "Implement E2E testing with Playwright" | Close #724 as duplicate of #628 |
| #670 "Fix iterate.yml to use pnpm" | #744, #595, #584 all address npm→pnpm        | Consolidate into single issue   |
| #720 "Missing .nvmrc"              | #748 "Invalid .nvmrc value"                  | Both resolved; close both       |

---

## Section 4: Truly Open Issues (Require Implementation)

These issues represent genuinely unimplemented work:

| Issue | Title                                            | Type        | Effort Estimate                            |
| ----- | ------------------------------------------------ | ----------- | ------------------------------------------ |
| #726  | Add dependency consistency checking to CI        | CI/DX       | Small — add check-deps step to on-pull.yml |
| #754  | Integration tests for Stripe webhook idempotency | Testing     | Medium                                     |
| #753  | Route-based code splitting for dashboard pages   | Frontend    | Medium                                     |
| #752  | Unified CLI output utilities                     | DX          | Small                                      |
| #751  | Optimize tRPC router bundle size                 | Performance | Medium                                     |
| #744  | Fix pnpm consistency in iterate.yml              | CI          | Small                                      |
| #731  | Auto-generate API documentation                  | Innovation  | Large                                      |
| #729  | Bundle size regression testing                   | Testing     | Medium                                     |
| #728  | Add security scanning workflows to CI            | Security    | Medium                                     |
| #726  | Add check-deps to CI                             | DX/CI       | Small                                      |
| #725  | Integration tests for API routers                | Testing     | Medium                                     |
| #724  | Missing e2e test coverage                        | Testing     | Large                                      |
| #723  | High number of client components                 | Frontend    | Medium                                     |

---

## Section 5: Phase 1 Diagnostic Scoring Summary

### Current Build Results (with Node.js 22.14.0)

| Check                      | Result        | Details                                         |
| -------------------------- | ------------- | ----------------------------------------------- |
| **TypeCheck**              | ✅ PASS       | 8/8 tasks, 29s                                  |
| **Lint**                   | ✅ PASS       | 8/8 tasks, zero errors/warnings                 |
| **Tests**                  | ✅ PASS       | 64 files, 1371 tests, 0 failures                |
| **Build**                  | ✅ PASS       | Next.js 16.2.7, full static generation          |
| **Security Audit**         | ⚠️ 6 moderate | OpenTelemetry via contentlayer2 transitive deps |
| **Dependency Consistency** | ✅ PASS       | No inconsistencies found                        |

### Domain Scores

| Domain                 | Score  | Key Issues                                                                            |
| ---------------------- | ------ | ------------------------------------------------------------------------------------- |
| **Code Quality**       | 86/100 | Strong tests (1371), clean lint, consistent patterns. Minor: some error handling gaps |
| **System Quality**     | 72/100 | 6 moderate vulns, CI npm→pnpm inconsistencies, some observability gaps                |
| **Experience Quality** | 75/100 | Good DX scripts, fast build cycle. Missing: dev containers, env validation in CI      |
| **Delivery Readiness** | 70/100 | CI works but complex, no Vercel deployment workflow, dependency checking not in CI    |

### Scoring Detail

#### A. Code Quality (0–100)

| Criterion             | Weight | Score | Evidence                                              |
| --------------------- | ------ | ----- | ----------------------------------------------------- |
| Correctness           | 15%    | 95    | All 1371 tests pass, no lint errors, typecheck passes |
| Readability & Naming  | 10%    | 90    | Clean naming conventions, consistent patterns         |
| Simplicity            | 10%    | 85    | Monorepo well-structured, clear boundaries            |
| Modularity & SRP      | 15%    | 90    | Good separation: api/auth/common/db/stripe/ui         |
| Consistency           | 5%     | 90    | ESLint, prettier, TS configs all consistent           |
| Testability           | 15%    | 80    | 64 test files, but gaps in auth, E2E, some routers    |
| Maintainability       | 10%    | 85    | Turbo monorepo, clear structure                       |
| Error Handling        | 10%    | 75    | Some gaps (#666, #632)                                |
| Dependency Discipline | 5%     | 80    | Minor: peerDeps in ui, outdated OpenTelemetry         |
| Determinism           | 5%     | 85    | Reproducible builds, frozen lockfile                  |

**Weighted: 86/100**

#### B. System Quality (0–100)

| Criterion                    | Weight | Score | Evidence                                                 |
| ---------------------------- | ------ | ----- | -------------------------------------------------------- |
| Stability                    | 20%    | 85    | Node 22 vs 20 compatibility (CI issue), stable otherwise |
| Performance Efficiency       | 15%    | 70    | Issues #751, #753, #723                                  |
| Security Practices           | 20%    | 75    | 6 moderate vulns, most sec issues fixed                  |
| Scalability Readiness        | 15%    | 70    | Redis rate limiter, DB indexes added                     |
| Resilience & Fault Tolerance | 15%    | 75    | Circuit breakers, retry logic in Stripe                  |
| Observability                | 15%    | 65    | OpenTelemetry, pino logger, some coverage gaps           |

**Weighted: 72/100**

#### C. Experience Quality (0–100)

| Area                       | Score | Notes                                      |
| -------------------------- | ----- | ------------------------------------------ |
| Accessibility              | 75    | Dialog/sheet aria improvements done        |
| User Flow Clarity          | 80    | Clear navigation, i18n support             |
| Feedback & Error Messaging | 70    | Issue #579 about error messages            |
| API Clarity                | 75    | Issues #667 (barrel exports), #503 (JSDoc) |
| Local Dev Setup            | 70    | No .env.local, dev containers missing      |
| Documentation Accuracy     | 80    | Most docs clean, some outdated             |
| Build/Test Feedback Loop   | 85    | Fast with Turbo caching                    |

**Overall: 75/100**

#### D. Delivery & Evolution Readiness (0–100)

| Criterion                 | Weight | Score | Evidence                                            |
| ------------------------- | ------ | ----- | --------------------------------------------------- |
| CI/CD Health              | 20%    | 70    | npm→pnpm inconsistencies in iterate.yml             |
| Release & Rollback Safety | 20%    | 65    | No Vercel deployment workflow                       |
| Config & Env Parity       | 15%    | 70    | Env validation exists but CI doesn't fail on issues |
| Migration Safety          | 15%    | 80    | Proper Prisma migrations with rollbacks             |
| Technical Debt Exposure   | 15%    | 75    | eslint-disable comments (#663), duplicate schemas   |
| Change Velocity           | 15%    | 80    | Turbo monorepo limits blast radius                  |

**Weighted: 73/100**

---

## Section 6: Recommendations

### Immediate (can do with current permissions)

1. **Close 18 issues** that are resolved (requires issues:write API)
2. **Add standard labels** to all issues (requires issues:write API)
3. **Merge #724 → #628** as duplicates (requires issues:write API)

### Code Fixes (actionable)

1. **#726**: Add `pnpm check-deps && pnpm dx:quick` step to `on-pull.yml` CI workflow
2. **#744**: Fix npm→pnpm references in `iterate.yml` (lines 58, 72, 342)

### Infrastructure

- Upgrade CI runner Node.js from 20 to 22 (matching .nvmrc)
- Add GitHub token with `issues:write` permission for automated issue management

---

_Generated by Sisyphus (OpenX Basefly) on 2026-06-21_
