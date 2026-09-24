# Issue Manager Audit — 2026-09-24 (loop 4)

**Evaluation date:** 2026-09-24T01:52:18Z
**Active phase:** Phase 0 → **ISSUE MANAGER MODE** (0 open PRs; 82 open issues)
**Default branch:** `main`
**Runner identity:** local runner via `GITHUB_TOKEN` (permissions re-probed this run)
**Prior runs:** [loop 1](./issue-manager-audit-2026-09-23-loop1.md), [loop 2](./issue-manager-audit-2026-09-23-loop2.md), [loop 3](./issue-manager-audit-2026-09-23-loop3.md) — this run independently re-verifies and adds incremental findings.
**Final state of this run:** **blocked** (issue write APIs 403; see [Blockers](#blockers))

---

## Decision summary

| Check                   | Result  | Routing                  |
| ----------------------- | ------- | ------------------------ |
| Open PRs (entry)        | `[]`    | Not PR Handler Mode      |
| Open issues             | **82**  | → **ISSUE MANAGER MODE** |
| New issues since loop 3 | **0**   | No drift since 09-23     |
| Phases 1–3              | Not run | Lower phase active       |

STEPs 1–3 require issue mutation (label/comment/close) — all re-probed **403** this run. STEP 4 selected the only open **P0 (#496)** and executed independent verify-then-deliver. This loop’s incremental value: **27 additional stale/already-fixed issues** identified beyond loop 3, plus fresh full-suite evidence.

---

## Blockers (reconfirmed this run)

Token permissions from API: `admin:false, maintain:false, pull:false, push:false, triage:false`. Issue mutation endpoints reject with **403 Resource not accessible by integration**.

| Operation             | Probe result                   | Evidence                           |
| --------------------- | ------------------------------ | ---------------------------------- |
| Add label (GraphQL)   | **403** `addLabelsToLabelable` | `gh issue edit 789 --add-label P2` |
| Add label (REST)      | **403**                        | `POST /issues/789/labels`          |
| Comment               | **403** `addComment`           | `gh issue comment 789`             |
| Create / close / edit | **403**                        | prior loops + same token scope     |
| Branch push           | ✅                             | probe branch created → deleted     |
| PR create             | ✅ (needs real commit)         | probe verified in loops 1–3        |

**FAIL-SAFE:** Contract requires filing an issue when uncertain — `createIssue` is 403. This document is the information-preserving substitute (same pattern as loops 1–3).

---

## STEP 1 — Label normalization (NOT APPLIED — 403)

Mandatory: exactly one category ∈ {bug, enhancement, feature, docs, refactor, chore, test, ci, security} and exactly one priority ∈ {P0–P3}.

**Gaps this run (unchanged, 0 new issues):** 12 missing category · 13 multi-category · 38 missing priority.

### 1a. Missing category (12 issues)

| Issue | Current labels only          | Planned category | Rationale                                    |
| ----- | ---------------------------- | ---------------- | -------------------------------------------- |
| 595   | platform-engineer            | ci               | Workflows use npm not pnpm                   |
| 635   | documentation                | docs             | Onboarding guide (`documentation` ∉ set)     |
| 670   | P3, DX-engineer              | ci               | Fix iterate.yml pnpm                         |
| 697   | technical-writer             | docs             | Corrupted docs formatting                    |
| 744   | Growth-Innovation-Strategist | ci               | `fix(ci)` pnpm in iterate.yml                |
| 748   | DX-engineer                  | bug              | Invalid `.nvmrc` (stale — now `22.14.0`)     |
| 749   | Growth-Innovation-Strategist | enhancement      | AI testing + docs generator (innovation→enh) |
| 751   | performance-engineer         | enhancement      | tRPC bundle optimization                     |
| 752   | DX-engineer                  | enhancement      | CLI output utilities                         |
| 753   | frontend-engineer            | enhancement      | Route-based code splitting                   |
| 754   | quality-assurance            | test             | Integration tests for webhooks               |
| 755   | database-architect           | enhancement      | Composite index = perf enhancement           |

### 1b. Missing priority (38 issues)

| Priority | Issues                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | 786 (secret logging — stale), 722 (env validation), 721 (authorization), 632 (sensitive logging)                                      |
| P2       | 789, 788, 787, 785, 755, 754, 753, 751, 748, 744, 729, 728, 726, 725, 724, 723, 720, 719, 713, 697, 635, 634, 631, 628, 595, 584, 305 |
| P3       | 752, 749, 731, 727, 668, 636, 630                                                                                                     |

### 1c. Multiple category labels (13 issues) — keep most specific

| Issue | Categories now            | Keep     | Remove                |
| ----- | ------------------------- | -------- | --------------------- |
| 305   | enhancement, ci           | ci       | enhancement           |
| 496   | enhancement, security     | security | enhancement           |
| 498   | enhancement, security     | security | enhancement           |
| 515   | enhancement, security     | security | enhancement           |
| 522   | enhancement, refactor, ci | ci       | enhancement, refactor |
| 523   | enhancement, refactor     | refactor | enhancement           |
| 549   | enhancement, test         | test     | enhancement           |
| 550   | enhancement, test         | test     | enhancement           |
| 551   | enhancement, test         | test     | enhancement           |
| 581   | enhancement, test         | test     | enhancement           |
| 584   | enhancement, ci           | ci       | enhancement           |
| 688   | enhancement, security     | security | enhancement           |
| 713   | enhancement, test         | test     | enhancement           |

---

## STEP 2 — Duplicate detection (NOT CLOSED — 403)

Canonical map (re-validated against current 82):

| Canonical                   | Duplicates to close        | Status this run                                                                  |
| --------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| **#496** (P0)               | **#480**                   | #496 verified fixed (Step 4); close both when unblocked                          |
| **#305** (pnpm CI)          | **#744, #670, #584, #595** | **Still genuinely open** — `iterate.yml:72` and `:342` remain `npm ci \|\| true` |
| **#501** (Playwright)       | **#628**                   | Both fixed in code (loop 2 evidence holds)                                       |
| **#725** (API router tests) | **#631**                   | #631 ⊂ #725 scope; both largely implemented via `router/*.test.ts` suite         |
| **#749** (AI API docs gen)  | **#731**                   | `packages/api/src/docs-generator.ts` exists — both largely implemented           |

---

## STEP 3 — Consolidation (NOT APPLIED — 403)

### Clusters

| Cluster                 | Canonical / action                       | Issues to close                                                                                                                                                      |
| ----------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.nvmrc`                | completed                                | #720, #748                                                                                                                                                           |
| Redis rate limit        | close #496 completed, #480 dup           | #496, #480                                                                                                                                                           |
| Testing umbrella        | close #581 completed (children done)     | #581                                                                                                                                                                 |
| pnpm-in-CI              | keep #305; close dups (still valid work) | #744, #670, #584, #595                                                                                                                                               |
| Playwright E2E          | close #628 dup of #501 (both fixed)      | #501, #628                                                                                                                                                           |
| API router tests        | #725 canonical, #631 subset              | #631 (+ #725/#551/#549/#550 evidence)                                                                                                                                |
| AI API docs             | #749 canonical, #731 subset              | #731, #749                                                                                                                                                           |
| Prior stale (loops 1–3) | completed / AC-met                       | #630, #687, #719, #684, #578, #635, #789, #786, #785, #515, #498, #550, #551, #549, #500                                                                             |
| **NEW this loop**       | **completed / AC-met (evidence below)**  | **#788, #787, #611, #705, #706, #613, #486, #487, #666, #485, #492, #521, #634, #667, #650, #590, #632, #722, #610, #664, #683, #685, #713, #755, #754, #753, #724** |

### Stale / already-fixed evidence — incremental vs loop 3 (NEW this run)

| Issue    | Claim                                                | Ground truth this run                                                                                                    | Verdict    |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------- |
| **#788** | Unit tests for critical UI components in apps/nextjs | `apps/nextjs/src/components/__tests__/` — **15 component test files** (cluster-list, navbar, modal, skeletons, etc.)     | **FIXED**  |
| **#787** | Unit tests for packages/db migrations and schema     | `packages/db/{migrations,seed,soft-delete,user-deletion,rls-middleware}.test.ts` present                                 | **FIXED**  |
| **#611** | Add not-found.tsx for custom 404 pages               | `apps/nextjs/src/app/not-found.tsx` + 5 segment-level `not-found.tsx` (editor, marketing, auth, docs, dashboard)         | **FIXED**  |
| **#705** | Docker configuration for containerized deployment    | `Dockerfile` + `docker-compose.yml` at repo root                                                                         | **FIXED**  |
| **#706** | VS Code Dev Containers configuration                 | `.devcontainer/devcontainer.json` present                                                                                | **FIXED**  |
| **#613** | Remove duplicate GitHub Actions workflow file        | Only `iterate.yml` + `on-pull.yml` exist; clearly distinct (multi-stage parallel vs pull CI) — no duplicate remains      | **FIXED**  |
| **#486** | Server-side observability with OpenTelemetry         | `packages/common/src/observability/index.ts` — NodeSDK init **explicitly references issue #486**; OTel deps + trpc spans | **FIXED**  |
| **#487** | Application-layer caching with Redis                 | `packages/common/src/cache/index.ts` — CacheService **explicitly references issue #487**; Redis + in-memory fallback     | **FIXED**  |
| **#666** | Global error boundary for Next.js app                | `apps/nextjs/src/app/error.tsx` + `global-error.tsx` present                                                             | **FIXED**  |
| **#485** | Suspense boundaries for granular loading states      | **10 `loading.tsx` files** + Suspense in marketing layout / page-progress                                                | **FIXED**  |
| **#492** | Proper `sizes` attribute for responsive images       | `sizes=` present in mdx-components, site-footer, comments, video-scroll, etc.                                            | **FIXED**  |
| **#521** | Hydration consistency with client dictionary         | `suppressHydrationWarning` on `<html>` + `use-client-dictionary.test.ts`                                                 | **FIXED**  |
| **#634** | Audit and enforce TypeScript strictness              | `tooling/typescript-config/base.json` → `"strict": true`                                                                 | **FIXED**  |
| **#667** | Audit and document package export boundaries         | `docs/export-boundaries.md` exists                                                                                       | **FIXED**  |
| **#650** | Extract embedded AI prompts from on-pull.yml         | Prompts live in `docs/prompts/{Anthropic,Google,Misc,OpenAI,Perplexity}/`; on-pull.yml has no embedded prompt bodies     | **FIXED**  |
| **#590** | Audit UI component library for enterprise readiness  | `docs/ui-library-enterprise-audit-2026-08-13.md` exists                                                                  | **AC MET** |
| **#632** | Audit error logging for sensitive data leakage       | `docs/security-error-logging-audit.md` + `packages/api/src/sensitive-data-logging.test.ts` (pattern scanner)             | **AC MET** |
| **#722** | Environment variable validation at startup           | `createEnv` (t3-oss) + `validateEnvVars` + `pnpm env:validate` in `build`; commit `5adec30` addresses startup validation | **FIXED**  |
| **#610** | Standardize tRPC response format across routers      | `packages/api/src/response.ts` header: **"Standardized tRPC response contracts (Issue #610)"** + `response.test.ts`      | **FIXED**  |
| **#664** | Replace console.\* with pino in db/stripe            | Remaining `console.*` in `packages/{db,stripe}` are **JSDoc examples only** — no live logging calls                      | **FIXED**  |
| **#683** | ESLint/Prettier monorepo config inconsistency        | `tooling/eslint-config` + `tooling/prettier-config`; root `.eslintrc.cjs` extends `./tooling/eslint-config/base.js`      | **FIXED**  |
| **#685** | React performance optimizations to UI components     | `React.memo`/`memo(` in 10+ components (navbar, header, comments, cluster-item, blog-card, …)                            | **FIXED**  |
| **#713** | Unit tests for packages/common utility modules       | **15+ test files** under `packages/common/src/**` (env, cache, csp, pricing, pagination, k8s, …)                         | **FIXED**  |
| **#755** | Composite index for customer subscription queries    | `schema.prisma`: `@@index([plan, stripeCurrentPeriodEnd])`, `@@index([authUserId, plan, stripeCurrentPeriodEnd])`        | **FIXED**  |
| **#754** | Integration tests for Stripe webhook idempotency     | `packages/stripe/src/webhook-idempotency.test.ts` present                                                                | **FIXED**  |
| **#753** | Route-based code splitting for dashboard pages       | Dashboard pages import `next/dynamic` (`dashboard/page.tsx`, `settings/page.tsx`)                                        | **FIXED**  |
| **#724** | Missing e2e test coverage for critical flows         | **11 Playwright specs** incl. `critical-flows`, `auth`, `billing`, `cluster`, `authorization-bypass`                     | **FIXED**  |

### Refined status (tooling exists, gap remains) — not closes

| Issue    | Refinement this run                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **#726** | `check-dependency-version-consistency` script exists (`pnpm check-deps`, pre-commit) but **not wired into `.github/workflows/`**                 |
| **#488** | `madge --circular` script exists (`pnpm check:circular`, `ci:check`) but **not wired into workflows**                                            |
| **#729** | `size-limit` configured in `apps/nextjs` (`size:check`) but **no CI regression gate**                                                            |
| **#721** | `requireRole` / `createRoleBasedProcedure` / `adminProcedure` exist in `trpc.ts` + `rbac.test.ts`; adoption across all routers not yet evidenced |

### Still genuinely open (verified)

- **#305 cluster** — `iterate.yml` lines 72 & 342 still `npm ci || true` (needs `workflows: write` to fix).
- **#723** — dashboard/marketing partially use `next/dynamic`; full client-component bundle audit still outstanding.
- **#751** — `optimizePackageImports` present; no tRPC-router-specific `manualChunks`/split config found.
- **#752** — no unified CLI output utility module found under `scripts/` or `packages/common`.
- **#494 / #483 / #502 / #727 / #728 / #663** — no domain layer, no `$transaction` usage found, no fast-path `paths:` filter, no AI-review/security-scan workflows, 6 non-test `eslint-disable` remain.
- Label normalization for 12 NO_CAT / 13 MULTI_CAT / 38 NO_PRI issues (STEP 1 matrix).

---

## STEP 4 — Repair mode: #496 (P0) — fresh verification

**Selection:** Only open **P0**. Contract: when P0/P1 exists, select highest-priority issue. No code diff required (implementation already merged).

### Acceptance criteria

| AC                          | Status | Evidence (this run)                                                                                    |
| --------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| Redis-backed rate limiter   | ✅     | `packages/api/src/distributed-rate-limiter.ts` — `DistributedRateLimiter` sliding window via `ioredis` |
| Consistent across instances | ✅     | Wired through rate-limit middleware; Stripe webhook + docs route use `checkAsync`                      |
| Config via environment      | ✅     | `REDIS_URL` + rate-limit keys in `.env.example`; `RATE_LIMIT_*` in `@saasfly/common`                   |
| Graceful degradation        | ✅     | Falls back to `InMemoryRateLimiter` + `logger.warn`                                                    |
| Unit tests                  | ✅     | **98/98** in 3 rate-limiter suites (fresh run 01:49Z)                                                  |
| Documentation               | ✅     | `docs/redis-setup.md` (references #496), `docs/DEVELOPMENT.md`                                         |

### Verification matrix (this run)

| Command                                 | Result                      |
| --------------------------------------- | --------------------------- |
| `pnpm install --frozen-lockfile`        | ✅ 7.4s                     |
| `pnpm vitest run` ×3 rate-limiter files | ✅ **98/98**                |
| `pnpm test` (full)                      | ✅ **148 files, 2166/2166** |
| `pnpm typecheck`                        | ✅ **9/9**                  |
| `pnpm lint`                             | ✅ **9/9**, zero warnings   |

**Outcome:** Zero diff → no code PR for #496. Closing #496 blocked by 403.

---

## Skills & subagents used

| Item                                        | Result                                                                                                                                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill `openx-basefly`                       | Loaded; project harness context (agents, model categories, quick commands)                                                                                                                         |
| Skill `planning-with-files`                 | Loaded; 3-file planning pattern applied (todo state machine + audit deliverable file)                                                                                                              |
| Skills inventory (13 in `.opencode/skills`) | skill-creator, debugging, openx-basefly, planning, commit-message, proffesor-for-testing…, maxritter…, modu-ai…, muratcankoylan…, obra-superpowers…, github-workflow-automation, ai-agent-engineer |
| Subagents                                   | Not spawned — prior loops recorded `explore` failures (`opencode/gpt-5-nano` not found); direct grep/read/gh used (all search goals met)                                                           |

---

## Action log

| Timestamp (UTC) | Action                           | Target                                         | Result                              |
| --------------- | -------------------------------- | ---------------------------------------------- | ----------------------------------- |
| 01:45Z          | Phase 0: detect default branch   | origin/HEAD                                    | `main`                              |
| 01:45Z          | Phase 0: list open PRs           | repo                                           | `[]` → not PR mode                  |
| 01:45Z          | Phase 0: list open issues        | repo                                           | **82** → ISSUE MANAGER MODE         |
| 01:46Z          | Inventory labels + skills        | gh + `.opencode/skills`                        | 51 labels; 13 skills                |
| 01:46Z          | Load skills                      | openx-basefly, planning-with-files             | OK                                  |
| 01:47Z          | Parse label gaps                 | 82 issues                                      | 12 NO_CAT, 13 MULTI_CAT, 38 NO_PRI  |
| 01:47Z          | Permission probes                | label/comment/REST-label                       | all **403**                         |
| 01:47Z          | Push probe                       | `perm-probe-*` branch                          | ✅ push OK → **deleted** (cleanup)  |
| 01:48Z          | Ground-truth stale checks        | 30+ issues                                     | **27 newly confirmed fixed/AC-met** |
| 01:48Z          | Confirm #305 still open          | `iterate.yml:72,342`                           | still `npm ci \|\| true`            |
| 01:48Z          | New-issue delta since loop 3     | gh                                             | **0**                               |
| 01:48Z          | `pnpm install --frozen-lockfile` | workspace                                      | ✅ 7.4s                             |
| 01:49Z          | Rate-limiter tests               | 3 suites                                       | ✅ **98/98**                        |
| 01:50Z          | `pnpm test`                      | full suite                                     | ✅ **148 files, 2166/2166**         |
| 01:50Z          | `pnpm typecheck`                 | 9 packages                                     | ✅ **9/9**                          |
| 01:51Z          | `pnpm lint`                      | 9 packages                                     | ✅ **9/9**, no warnings             |
| 01:52Z          | Write this audit                 | `docs/issue-manager-audit-2026-09-24-loop4.md` | delivered via PR                    |

---

## Unblocking checklist (unchanged, still required)

1. Add to the workflow that issues the agent token (`on-pull.yml` and/or `iterate.yml`):
   ```yaml
   permissions:
     contents: write
     pull-requests: write
     issues: write # label / comment / close / create
     workflows: write # allow bot to patch its own workflow (iterate.yml npm→pnpm)
     actions: read
     repository-projects: write
     id-token: write
   ```
   _(or Settings → Actions → General → Workflow permissions: read/write)_
2. Re-run ISSUE MANAGER: apply STEP 1 matrix; execute STEP 2/3 closes including this loop’s **27 newly confirmed stale issues**; close #496 completed.
3. Fix `iterate.yml` `npm ci` → `pnpm` (#305) — needs `workflows: write`.
4. Wire `check-deps` + `check:circular` + `size:check` into CI (#726, #488, #729).
5. Fix Explore agent model id (`opencode/gpt-5-nano` → valid id).
6. Align runner Node (v20.20.2) with `engines`/`.nvmrc` (≥22 / 22.14.0) to silence engine warnings.

---

## Final state

**blocked** — `GITHUB_TOKEN` lacks `issues: write` (and `workflows: write`), so ISSUE MANAGER STEPs 1–3 and closure of verified-complete issues cannot execute; fail-safe issue creation is also 403.

**STEP 4 (#496 P0):** independently re-verified green (98/98 rate-limiter, 2166/2166 full suite, typecheck 9/9, lint 9/9 zero warnings). Zero code diff.

**Incremental deliverable this loop:** **27 additional stale/AC-met issues** identified for bulk close when unblocked (#788, #787, #611, #705, #706, #613, #486, #487, #666, #485, #492, #521, #634, #667, #650, #590, #632, #722, #610, #664, #683, #685, #713, #755, #754, #753, #724), plus refined status for #726/#488/#729/#721 (tooling exists, CI/adoption gap remains), plus fresh post-drift verification evidence.
