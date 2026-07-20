# Issue Audit Report — 2026-07-20

**Evaluation Date**: 2026-07-20
**Evaluator**: Sisyphus (Automated)
**Mode**: ISSUE MANAGER (Phase 0 → Issue Manager Mode)

---

## 1. Normalization Report

**Status**: 🔴 BLOCKED — GITHUB_TOKEN lacks `addLabelsToLabelable` permission
**Required action**: Apply labels manually or via PAT with write access

### Missing Priority Labels

| Issue | Title | Category | Recommended Priority |
|-------|-------|----------|---------------------|
| #789 | peerDependencies for React in packages/ui | enhancement | **P3** |
| #788 | Unit tests for critical UI components | test | **P2** |
| #787 | Unit tests for packages/db migrations | test | **P2** |
| #786 | Stripe webhook logs partial secret | security | **P1** (already fixed) |
| #785 | Duplicate next dependency in packages/stripe | bug | **P2** (already fixed) |
| #755 | Composite index for customer subscription queries | enhancement | **P2** |
| #754 | Integration tests for Stripe webhook idempotency | test | **P2** |
| #753 | Route-based code splitting for dashboard pages | enhancement | **P2** |
| #752 | Unified CLI output utilities | enhancement | **P3** |
| #751 | Optimize tRPC router bundle size | enhancement | **P2** |
| #749 | AI-powered API endpoint testing | enhancement | **P3** |
| #748 | .nvmrc invalid value | bug | **P2** (already fixed) |
| #744 | pnpm consistency in iterate.yml | ci | **P2** (patch documented) |
| #731 | Auto-generate API docs from tRPC | enhancement | **P3** |
| #729 | Bundle size regression testing | test | **P3** |
| #728 | Security scanning workflows to CI | security | **P1** |
| #727 | AI-Powered Code Review Automation | enhancement | **P3** |
| #726 | Dependency consistency checking to CI | ci | **P2** |
| #725 | Integration tests for API routers | test | **P2** |
| #724 | Missing e2e test coverage | test | **P2** |
| #723 | High number of client components | enhancement | **P2** |
| #722 | Environment variable validation at startup | security | **P1** |
| #721 | Authorization checks beyond authentication | security | **P1** |
| #720 | Missing .nvmrc | enhancement | **P3** (superseded by #748) |
| #719 | Missing root-level TypeScript config | enhancement | **P2** |
| #713 | Unit tests for packages/common utilities | test | **P2** |
| #697 | Corrupted text formatting in docs | docs | **P2** |
| #668 | AI-Native cluster diagnostics | enhancement | **P3** |
| #636 | ISR caching for dashboard data | enhancement | **P3** |
| #635 | Developer onboarding guide | docs | **P3** |
| #634 | TypeScript strictness audit | enhancement | **P2** |
| #632 | Audit error logging for sensitive data leakage | security | **P1** |
| #631 | API router tests for k8s/customer/stripe | test | **P2** |
| #630 | Pre-commit hooks with typecheck | enhancement | **P3** |
| #628 | E2E testing with Playwright | test | **P2** |

### Missing Category Labels

| Issue | Has Label | Needs Category |
|-------|-----------|----------------|
| #755 | `database-architect` | enhancement |
| #754 | `quality-assurance` | test |
| #753 | `frontend-engineer` | enhancement |
| #752 | `DX-engineer` | enhancement |
| #751 | `performance-engineer` | enhancement |
| #749 | `Growth-Innovation-Strategist` | enhancement |
| #748 | `DX-engineer` | bug |
| #744 | `Growth-Innovation-Strategist` | ci |
| #697 | `technical-writer` | docs |
| #670 | `DX-engineer` | ci |

### Already Normalized (have both category + priority)

- #708 (enhancement, P3, DX-engineer)
- #706 (enhancement, P3, DX-engineer)
- #705 (enhancement, P2, platform-engineer)
- #688 (enhancement, P2, security)
- #687 (enhancement, P3, DX-engineer)
- #685 (enhancement, P2, frontend-engineer)
- #684 (enhancement, P3, DX-engineer)
- #683 (enhancement, P2, DX-engineer)
- #667 (enhancement, P3, DX-engineer)
- #666 (enhancement, P2, frontend-engineer)
- #664 (enhancement, P2, DX-engineer)
- #663 (enhancement, P2, DX-engineer)
- #650 (enhancement, P3, DX-engineer)
- #613 (enhancement, P2)

---

## 2. Duplicate Detection

### Duplicate Set A: iterate.yml pnpm consistency
- **#744** "fix(ci): pnpm consistency in iterate.yml" (2026-02-27)
- **#670** "[DX] Fix iterate.yml to use pnpm instead of npm" (2026-02-25)
- **Resolution**: Consolidate into **#670** (older, canonical). Close **#744** as duplicate.
- **Status**: Patch documented in `docs/patches/iterate-yml-pnpm-consistency.md`

### Duplicate Set B: API router integration tests
- **#725** "[Testing] Add integration tests for API routers" (broader scope)
- **#631** "[QA] Add API router tests for k8s, customer, and stripe routers" (subset)
- **Resolution**: Consolidate into **#725** (broader scope). Close **#631** as duplicate with reference to #725 for specifics.
- **Status**: Need verification of existing test coverage

### Related Set C: .nvmrc issues
- **#720** "[DX] Missing .nvmrc for Node.js version consistency" (2026-02-27T02:42:52Z)
- **#748** "[DX] .nvmrc contains invalid value '20'" (2026-02-27T09:05:00Z)
- **Resolution**: #748 supersedes #720 — .nvmrc exists but had invalid content. Both are fixed (current .nvmrc has `22.14.0`). Close both.
- **Status**: ✅ Fixed in commits `de2d52b`, `3e06f70`

---

## 3. Issues Already Fixed in Code (Need Closure)

These issues describe problems that have been resolved in the codebase but the issues remain open:

| Issue | Title | Fix Commit | Status |
|-------|-------|-----------|--------|
| #786 | Stripe webhook logs partial secret | `69b43e0` | ✅ Fixed |
| #785 | Duplicate next dependency in packages/stripe | (package.json clean) | ✅ Fixed |
| #748 | .nvmrc invalid value '20' | `de2d52b`, `3e06f70` | ✅ Fixed |
| #720 | Missing .nvmrc | `.nvmrc` exists | ✅ Fixed |
| #789 | peerDependencies for React in packages/ui | (ui/package.json has peerDeps) | ✅ Fixed |
| #744/#670 | iterate.yml pnpm consistency | Patch documented | 🟡 Patch ready |

---

## 4. Remaining Actionable Items by Priority

### P1 (Security — High Priority)
| Issue | Description | Notes |
|-------|-------------|-------|
| #728 | Add security scanning workflows to CI | CI workflow setup |
| #722 | Add environment variable validation at startup | Needs code audit |
| #721 | Add explicit authorization checks beyond authentication | RBAC enhancement |
| #632 | Audit error logging for sensitive data leakage | Audit task |

### P2 (Medium Priority)
| Issue | Description | Notes |
|-------|-------------|-------|
| #725 | Integration tests for API routers | Merge with #631 |
| #724 | Missing e2e test coverage | Broader testing gap |
| #722 | Environment variable validation | Security + DX |
| #719 | Root-level TypeScript configuration | Build/DevEx |
| #755 | Database composite index | Performance |
| #613 | Remove duplicate GitHub Actions workflow | Housekeeping |

### P3 (Nice to Have)
| Issue | Description | Notes |
|-------|-------------|-------|
| #727 | AI-Powered Code Review Automation | Innovation |
| #749 | AI-powered API endpoint testing | Innovation |
| #731 | Auto-generate API docs from tRPC | Innovation |
| #635 | Developer onboarding guide | Documentation |
| #630 | Pre-commit hooks with typecheck | DX |

---

## 5. Recommendations

1. **Apply priority labels** using a PAT with write access following the table above
2. **Close 5+ already-fixed issues** to reduce issue count from 40+ to manageable
3. **Consolidate duplicates**: Merge #744→#670, #631→#725, #720→#748
4. **Apply iterate.yml patch** from `docs/patches/iterate-yml-pnpm-consistency.md` using a token with `workflows` scope
5. **Focus on P1 security issues**: #728, #722, #721, #632 as next repair targets
