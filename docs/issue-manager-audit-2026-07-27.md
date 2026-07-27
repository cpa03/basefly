# Issue Manager Audit — 2026-07-27

## Phase: ISSUE MANAGER MODE

Decision: No open PRs → 20+ open issues → entered Issue Manager Mode

## Step 1: Issue Normalization

### Label Assignment Summary

Due to GITHUB_TOKEN API restrictions (`Resource not accessible by integration`), labels could not be applied via `gh`. Below is the determined label mapping for all issues missing category/priority labels.

### Issues Missing Category Label (assigned non-standard labels)

| Issue | Title                                      | Assigned Category | Rationale                        |
| ----- | ------------------------------------------ | ----------------- | -------------------------------- |
| #755  | [Database] Add composite index             | enhancement       | Feature improvement to DB schema |
| #754  | [QA] Add integration tests                 | test              | Testing improvement              |
| #753  | [Frontend] Route-based code splitting      | enhancement       | Performance feature              |
| #752  | [DX] Unified CLI output                    | enhancement       | Developer tooling improvement    |
| #751  | [Performance] Optimize tRPC bundle         | enhancement       | Performance optimization         |
| #749  | [Innovation] AI-powered API testing        | feature           | New capability                   |
| #748  | [DX] .nvmrc invalid value                  | bug               | Functional defect in dev tooling |
| #744  | fix(ci): pnpm consistency in iterate.yml   | ci                | CI configuration fix             |
| #697  | Fix corrupted text formatting              | bug               | Documentation defect             |
| #670  | [DX] Fix iterate.yml to use pnpm           | ci                | CI configuration fix             |
| #668  | [Innovation] AI-Native cluster diagnostics | feature           | New capability                   |
| #635  | [Docs] Developer onboarding guide          | docs              | Documentation                    |

### Issues Missing Priority Label (all open issues without P0-P3)

All ~20+ open issues were assigned priority based on impact surface and severity.

### Key Priority Assignments

- **P1 (High):** #748 (.nvmrc invalid), #785 (duplicate next dep), #786 (stripe webhook secret logging), #722 (env validation), #721 (authz checks), #632 (audit error logging)
- **P2 (Medium):** #789 (peerDeps), #788 (UI tests), #787 (db tests), #755 (composite index), #754 (webhook tests), #753 (code splitting), #751 (bundle size), #725 (API tests), #724 (e2e tests), #723 (client components), #720 (nvmrc), #719 (tsconfig), #636 (ISR caching), #634 (strictness), #631 (router tests), #628 (playwright)
- **P3 (Low):** #752 (CLI utilities), #749 (AI testing), #731 (auto-docs), #729 (bundle regression), #728 (security scanning), #727 (AI review), #726 (dep checking), #687 (barrel exports), #684 (build scripts), #667 (export boundaries), #650 (AI prompts), #630 (pre-commit hooks), #706 (dev containers)

## Step 2: Duplicate Detection

| Group             | Issues                                                                 | Verdict                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| .nvmrc issues     | #748 (invalid value), #720 (missing)                                   | **Related but distinct.** #720 filed first, #748 later (different aspects). Now both resolved (current .nvmrc shows valid "22.14.0"). |
| API testing       | #725 (integration tests), #631 (router tests for k8s/customer/stripe)  | **Overlap.** Both target API router testing. Recommend consolidating into #725.                                                       |
| E2E testing       | #724 (missing coverage), #628 (implement Playwright)                   | **Overlap.** Both target E2E testing. Recommend consolidating into #724.                                                              |
| iterate.yml pnpm  | #744 (fix ci), #670 (fix dx)                                           | **Duplicates.** Both about same issue (npm ci → pnpm). Recommend closing #670 in favor of #744.                                       |
| Logging           | #786 (webhook secret), #632 (audit logging), #664 (replace console.\*) | **Related but distinct.** #786 = specific bug (resolved), #632 = broader audit, #664 = tooling migration. Keep separate.              |
| Security scanning | #728 (CI security workflows), #726 (dep consistency)                   | **Related but distinct.** Different scope. Keep separate.                                                                             |

## Step 3: Consolidation Recommendations

### Consolidate #631 → #725 (API Router Testing)

- #725 "[Testing] Add integration tests for API routers" is the broader, well-named canonical issue
- #631 "[QA] Add API router tests for k8s, customer, and stripe routers" is a subset
- Close #631 as duplicate of #725

### Consolidate #628 → #724 (E2E Testing)

- #724 "[Testing] Missing e2e test coverage for critical flows" is canonical
- #628 "[QA] Implement E2E testing with Playwright" describes implementation tooling for same goal
- Close #628 as duplicate of #724

### Consolidate #670 → #744 (iterate.yml pnpm fix)

- #744 "fix(ci): pnpm consistency in iterate.yml" is more precisely scoped (CI category)
- #670 "[DX] Fix iterate.yml to use pnpm" is same fix, different category
- Close #670 as duplicate of #744

## Step 4: Repair Mode — Executed

### Selection: #744/#670 — Fix iterate.yml pnpm consistency

**Priority:** P1 (CI correctness)  
**Category:** ci  
**Status:** ✅ Fixed in this session

### Actual Code Changes

**File:** `.github/workflows/iterate.yml`

| Location                             | Before              | After                                      |
| ------------------------------------ | ------------------- | ------------------------------------------ |
| Cache path (line 62)                 | `~/.npm`            | `~/.local/share/pnpm/store`                |
| Cache key (line 63)                  | `package-lock.json` | `pnpm-lock.yaml`                           |
| Package install (line 76, architect) | `npm ci \|\| true`  | `pnpm install --frozen-lockfile \|\| true` |
| pnpm setup (line 54, architect)      | (missing)           | `pnpm/action-setup@v4`                     |
| Package install (line 350, Fixer)    | `npm ci \|\| true`  | `pnpm install --frozen-lockfile \|\| true` |
| pnpm setup (line 342, Fixer)         | (missing)           | `pnpm/action-setup@v4`                     |

### Issues Already Resolved (codebase fixed, issues still open)

Many issues created during automated audit sweeps (late Feb 2026) have been resolved by subsequent development work:

- **#785** — Duplicate `next` dep in stripe/package.json — File no longer has `next` dep
- **#786** — Stripe webhook secret logging — Code no longer logs secrets
- **#789** — PeerDependencies for React — Already configured in packages/ui
- **#722** — Env validation at startup — `initEnvValidation()` exists in `env.ts` + `instrumentation.ts`
- **#721** — Authorization checks — RBAC, CSRF, adminProcedure, requireRole() all implemented
- **#748** — Invalid .nvmrc — Current value `22.14.0` is valid
- **#720** — Missing .nvmrc — `.nvmrc` exists with `22.14.0`
- **#666** — Global error boundary — `global-error.tsx` + multiple route-specific error.tsx exist
- **#630** — Pre-commit hooks — `.husky/pre-commit` runs `typecheck && test && lint-staged`

## Build System Status

- **Node.js version:** v20.20.2 (runner) — project requires >=22
- **pnpm:** v10.28.2 installed
- **Build:** Fails with `webidl.util.markAsUncloneable is not a function` (Node.js version incompatibility with Next.js 16)
- **Lint/tests:** Cannot run without successful build

## Action Log

| Timestamp  | Action                      | Target                  | Result                                    |
| ---------- | --------------------------- | ----------------------- | ----------------------------------------- |
| 2026-07-27 | Phase 0 Entry               | All PRs/Issues          | 0 PRs → Issue Manager Mode                |
| 2026-07-27 | Step 1: Normalization       | All open issues         | Label mapping created (API write blocked) |
| 2026-07-27 | Step 2: Duplicate Detection | All open issues         | 3 duplicate/overlap groups identified     |
| 2026-07-27 | Step 3: Consolidation       | Related issues          | Consolidation recommendations documented  |
| 2026-07-27 | Step 4: Repair              | iterate.yml (#744/#670) | Fixed npm ci → pnpm install (3 changes)   |

## Final State

- **Blocked on:** GITHUB_TOKEN lacks issue write API access (cannot apply labels, close duplicates)
- **PR to be created:** Branch with iterate.yml fix
