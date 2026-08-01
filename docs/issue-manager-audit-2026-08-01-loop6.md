# Issue Manager Audit Report — 2026-08-01 (Loop 6)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0). Entry detection found **0 open PRs and 82 open issues** → entered ISSUE MANAGER MODE. Executed STEP 2 (duplicate detection + resolution re-verification) and STEP 4 (repair-mode selection + delivery attempt). STEP 1 (label normalization) and STEP 3 (consolidation) remain blocked by token permissions (see §3).

## 2. Decision Summary

- Default branch detected: `main`.
- **Phase 0 → ISSUE MANAGER MODE**: 0 open PRs, 82 open issues.
- **NEW FINDING (this loop)**: the pnpm-CI defect (#305/#584/#595/#670/#744) is **confirmed genuinely open on `main`**, and the root cause is now fully understood — the fix **was merged on 2026-07-27 (`cd9eb30`) and then accidentally reverted 2 minutes later** by a stale docs commit (`ee9ea1b`, "docs: add issue manager audit report for 2026-07-27") whose branch predated the fix and clobbered `iterate.yml` back to `npm ci`. The recovery patch (the exact `cd9eb30` diff) **applies cleanly** to current `main` (verified with `git apply --check`). Delivery remains blocked only by the `workflows` permission.
- **STEP 2 — Duplicate detection**: the 5-issue pnpm-CI cluster (#305, #584, #595, #670, #744) is a single defect, now with a proven fix in git history. No new duplicate clusters introduced since loop 5 (newest issues are 2026-02-27).
- **STEP 4 — Repair-mode selection**: no genuinely-open P0/P1 issue exists (re-verified, see §4). Contract fallback (lowest-scoring domain **D. Delivery & Evolution (68)** → lowest criterion **CI/CD Health (65)**) selects the pnpm-CI cluster. The fix itself is trivially re-appliable; the **push is blocked by GitHub**: automation token lacks `workflows` permission (verified this loop with a live push probe).
- **Delivered**: this audit report (docs PR) with the verified recovery diff, full evidence map, and privileged-action list.

## 3. Permissions & Skills Used (per TOOL USAGE mandate)

| Skill / Agent                                    | Purpose                                                               | Result                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `github-workflow-automation` (repo skill)        | CI workflow permission model (on-pull.yml grants, iterate.yml intent) | Informed the push-block diagnosis                                           |
| Direct verification (gh api / git / grep / read) | Issue-state re-verification, git-history forensics, label matrix      | Full evidence map (§4) + revert forensics (§5)                              |
| Live permission probes                           | Issue mutation + workflow push tests                                  | addLabels 403; addComment 403; workflow push rejected; non-workflow push OK |
| `pnpm test`, `pnpm lint`, `pnpm audit`           | Health baseline                                                       | 73 files / 1482 tests ✅; lint 9/9 ✅; audit clean                          |

**Subagent note:** Explore-agent model ID (`opencode/gpt-5-nano`) is stale/broken in the harness config (documented loop-3 §8); all verification performed directly with identical coverage. Issue-mutation skills unusable — token is read-only for issues (403 re-verified this loop).

## 4. STEP 2 — Duplicate Detection & Resolution Re-Verification

### 4.1 Duplicate clusters

| Cluster                | Issues                                                                | Status                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm in CI (iterate)   | #305, #584, #595, #670, #744                                          | **Genuinely open on `main`** — fix merged then reverted (see §5). Blocked at push by `workflows` permission                                  |
| .nvmrc / Node version  | #720 (missing), #748 (invalid '20')                                   | Both RESOLVED — `.nvmrc` now `22.14.0`; duplicates of each other                                                                             |
| Security scanning CI   | #728 (P1)                                                             | BLOCKED — requires `workflows` permission (loops 3–4; only a reference YAML doc was repaired, no workflow exists)                            |
| Testing infrastructure | #581 (umbrella), #500, #549, #550, #551, #725, #724, #787, #754, #788 | All RESOLVED (see §4.2; #788 UI tests verified present this loop)                                                                            |
| Bundle / performance   | #723, #729, #708, #523                                                | #708/#729 partially addressed (bundle analyzer configured, size-limit config present); CI wiring requires workflow edit                      |
| Observability          | #486 (OTel), #580 (monitoring)                                        | Genuinely open (instrumentation.ts only validates env; logger.ts exists but no tracing spans) — large P2 scope, not atomic repair candidates |

No **new** duplicate clusters since loop 4 (verified via `createdAt` scan).

### 4.2 Resolution evidence map (verified on `main` this loop)

| Issue          | Title                                 | Verdict              | Evidence                                                                                             |
| -------------- | ------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| #496 (P0)      | Distributed rate limiter (Redis)      | ✅ RESOLVED          | `packages/api/src/distributed-rate-limiter.ts` wired into `trpc.ts`                                  |
| #480 (P1)      | Redis rate limiter (dup of #496)      | ✅ RESOLVED (dup)    | Same implementation; canonical #496                                                                  |
| #498 (P1)      | RBAC role-based access                | ✅ RESOLVED          | `requireRole`/`adminProcedure` + admin router tests (#1031)                                          |
| #515 (P1)      | CSRF protection                       | ✅ RESOLVED          | `csrfProtection` middleware in `trpc.ts` + `proxy.ts` CSRF origin/referer checks                     |
| #500/#549 (P1) | Clerk auth flow tests / auth coverage | ✅ RESOLVED          | `packages/auth/clerk.test.ts` (27 tests)                                                             |
| #501/#628 (P1) | Playwright E2E journeys               | ✅ RESOLVED          | 11 spec files in `tests/e2e/`                                                                        |
| #550 (P1)      | apps/nextjs in coverage               | ✅ RESOLVED          | `vitest.config.ts` includes `apps/nextjs/src/**`                                                     |
| #551 (P1)      | k8s router tests                      | ✅ RESOLVED          | `packages/api/src/router/k8s.test.ts` + integration tests                                            |
| #581 (P1)      | Testing infra umbrella                | ✅ RESOLVED          | All sub-issues resolved; router middleware integration tests merged (#1041)                          |
| #725 (P1)      | API router integration tests          | ✅ RESOLVED          | `packages/api/src/router/integration.test.ts` (PR #1041)                                             |
| #786 (P1)      | Stripe webhook partial secret log     | ✅ RESOLVED          | `webhooks/stripe/route.ts` logs sanitized message + requestId only                                   |
| #632 (P1)      | Sensitive logging audit               | ✅ RESOLVED          | `packages/common/src/logger.ts` redaction + tests                                                    |
| #721 (P1)      | Explicit authorization checks         | ✅ RESOLVED          | `verifyOwnership`/`requireRole`/`adminProcedure` + `proxy.ts` CSRF                                   |
| #611           | Root not-found.tsx                    | ✅ RESOLVED          | `apps/nextjs/src/app/not-found.tsx` (PR #1048) — **never auto-closed**                               |
| #719           | Root tsconfig                         | ✅ RESOLVED          | `tsconfig.json` exists                                                                               |
| #722           | Env validation at startup             | ✅ RESOLVED          | `packages/common/src/config/env.ts`, `env.mjs`, `instrumentation.ts`                                 |
| #748           | .nvmrc invalid '20'                   | ✅ RESOLVED          | `.nvmrc` = `22.14.0`                                                                                 |
| #720           | Missing .nvmrc                        | ✅ RESOLVED          | `.nvmrc` exists                                                                                      |
| #785           | Duplicate next dep (stripe)           | ✅ RESOLVED          | `packages/stripe/package.json` — no `next` dependency                                                |
| #789           | React peerDeps (packages/ui)          | ✅ RESOLVED          | `peerDependencies: { react, react-dom }` present                                                     |
| #787           | DB migration/schema tests             | ✅ RESOLVED          | `packages/db/migrations.test.ts` (PR #1046) — **never auto-closed**                                  |
| #755           | Composite index (customer)            | ✅ RESOLVED          | Migrations `20260227_add_customer_subscription_composite_index`, `20260606_..._plan_period_index`    |
| #754           | Stripe webhook idempotency tests      | ✅ RESOLVED          | `packages/stripe/src/webhook-idempotency.test.ts` (425 lines)                                        |
| #609           | Duplicate Zod schemas                 | ✅ RESOLVED          | `schemas.ts` centralized; k8s/customer import from it (PR #1039)                                     |
| #610           | tRPC response format                  | ✅ RESOLVED          | PR #1023 (insertCustomer response standardization)                                                   |
| #663           | eslint-disable consolidation          | ✅ RESOLVED          | PR #954                                                                                              |
| #664           | console → pino                        | ✅ RESOLVED          | PR #964; remaining `console.*` only in JSDoc comments                                                |
| #666           | Global error boundary                 | ✅ RESOLVED          | `error.tsx` + `global-error.tsx`                                                                     |
| #483           | Stripe webhook transactions           | ✅ RESOLVED          | `db.transaction()` in `webhooks.ts`                                                                  |
| #485           | Suspense boundaries                   | ✅ RESOLVED          | `Suspense` used in dashboard/docs layouts                                                            |
| #492           | Image sizes attribute                 | ✅ RESOLVED          | `sizes=` present in mdx-components, blog cards                                                       |
| #636           | ISR caching                           | ✅ RESOLVED          | `export const revalidate = 60` in dashboard page                                                     |
| #667/#687      | Barrel exports / export boundaries    | ✅ RESOLVED          | `db/index.ts`, `auth/index.ts`, `stripe/src/index.ts` proper barrels                                 |
| #578           | Duplicate health endpoint             | ✅ RESOLVED          | Single `apps/nextjs/src/app/api/health/route.ts`                                                     |
| #613           | Duplicate workflow file               | ✅ RESOLVED          | Only `iterate.yml` + `on-pull.yml` remain                                                            |
| #683           | ESLint/Prettier monorepo config       | ✅ RESOLVED          | Root `.eslintrc.cjs` extends tooling base (PR #972)                                                  |
| #634           | TS strictness audit                   | ✅ RESOLVED          | `tooling/typescript-config/base.json` → `"strict": true`                                             |
| #630           | Pre-commit hooks                      | ✅ RESOLVED          | `.husky/pre-commit` runs `pnpm typecheck && pnpm test`                                               |
| #684           | Root build script / turbo pipelines   | ✅ RESOLVED          | `package.json` build + turbo.json pipelines                                                          |
| #697           | Corrupted docs formatting             | ✅ RESOLVED          | Commits `e290045`, `b3b9000`                                                                         |
| #713           | packages/common unit tests            | ✅ RESOLVED          | 6 test files in `packages/common/src/`                                                               |
| #579           | Env setup error messages              | ✅ RESOLVED          | `.nvmrc` + `env:verify` script + CONTRIBUTING                                                        |
| #503           | JSDoc on API routers                  | ✅ RESOLVED          | All routers have JSDoc blocks; cited `health_check.ts` no longer exists                              |
| #752           | Unified CLI output utilities          | ✅ RESOLVED          | `packages/common/src/logger.ts` (pino, levels, redaction, tests)                                     |
| #788           | UI component tests                    | ✅ RESOLVED          | 11 test files in `apps/nextjs/src/components/__tests__/` (navbar, modal, cluster-list, etc.)         |
| #688           | Next.js middleware.ts                 | ✅ RESOLVED          | `apps/nextjs/src/proxy.ts` (CSRF, request-id, CSP, security headers) — middleware replacement        |
| #708           | Bundle analyzer                       | ✅ RESOLVED          | `@next/bundle-analyzer` wired in `next.config.mjs`, `size:analyze` script                            |
| #729           | Bundle size regression testing        | ✅ RESOLVED (config) | `size-limit` config in `apps/nextjs/package.json` (450 kB JS / CSS limits); CI wiring needs workflow |

**Conclusion: no genuinely-open P0/P1 issue and no genuinely-open small deterministic code-deliverable issue remains.** The only genuinely-open defects are (a) the pnpm-CI cluster — **fix proven in history, blocked at push by `workflows` permission**, and (b) large P2 feature work (#486/#580 observability, #487 Redis caching, #494 domain layer, #590 UI audit, #753/#751/#723 bundle work) — out of scope for minimal atomic repair.

## 5. NEW FINDING — pnpm-CI fix merged then accidentally reverted (root cause)

Git-history forensics (this loop):

1. **2026-07-27 19:10 UTC** — `cd9eb30` "fix(ci): migrate iterate.yml from npm to pnpm for consistency" lands on `main`. Replaces `npm ci || true` with `pnpm install --frozen-lockfile || true`, adds `pnpm/action-setup@v4`, updates cache path/key. Commit message: `Resolves #744, resolves #670`.
2. **2026-07-27 19:12 UTC** — `ee9ea1b` "docs: add issue manager audit report for 2026-07-27" lands **2 minutes later** and **reverts the entire fix** (the docs branch was cut from a pre-fix tree; its `iterate.yml` copy clobbered the fix on merge). The commit touched only `iterate.yml` (+4/−12) alongside the audit doc.
3. **Current `main`** — defect confirmed present: `grep` shows `npm ci || true` at lines 72 & 342, cache path `~/.npm`, cache key `hashFiles('**/package-lock.json')` in `iterate.yml`. The repo has **no `package-lock.json`** (pnpm-only), so the install step **always silently fails** on CI runners — the exact defect #305/#584/#595/#670/#744 describe.
4. **Recovery verified**: `git diff cd9eb30~1 cd9eb30 -- .github/workflows/iterate.yml | git apply --check` → **CLEAN APPLY** on current `main`. The complete 49-line patch is captured in this loop's artifacts (`/tmp/pnpm-fix-recovery.patch` equivalent in §7).

**Why this matters**: the fix is no longer a speculative edit — it was already reviewed, merged, and proven on `main`. The remediation is a 1-command re-apply of an existing, merged diff (or revert of the accidental revert). Only the `workflows` permission stands in the way.

## 6. STEP 1 / STEP 3 — Normalization & Consolidation (blocked)

- Issue mutations remain **blocked** for the automation token: `addLabelsToLabelable`, `addComment`, `createIssue` all returned 403 this loop (re-verified on #789 and via comment probe).
- **STEP 1 (labels)**: 12 issues missing a category label (#755, #754, #753, #752, #751, #749, #748, #744, #697, #670, #635, #595); 13 issues have multi-category labels (#713, #688, #584, #581, #551, #550, #549, #523, #522, #515, #498, #496, #305); 38 issues missing a priority label. All require a privileged token.
- **STEP 3 (consolidation)**: pnpm-CI cluster consolidation (5 issues → 1 canonical) requires `closeIssue` — blocked.
- **Resolved-but-open closures**: #611, #787, and ~40 other resolved issues (§4.2) remain OPEN because merged PRs did not auto-close them (PR bodies phrased "issue #NNN" not "fixes #NNN"). Requires privileged `closeIssue` with "resolved by PR #NNN" reference.

## 7. STEP 4 — Repair Mode (pnpm-CI cluster)

### 7.1 Selection

- No genuinely-open P0/P1 (verified §4).
- Contract fallback: lowest-scoring domain **D. Delivery & Evolution (68)** → lowest criterion **CI/CD Health (65)** → pnpm-CI cluster.
- **This loop's advantage**: the fix exists in git history (`cd9eb30`) and applies cleanly. The exact patch:

```diff
# .github/workflows/iterate.yml — re-apply cd9eb30 (verified CLEAN APPLY on current main)
# Architect job (~line 54): after the issue-count guard block, insert:
+      - uses: pnpm/action-setup@v4
+        with:
+          version: latest
+
# cache path/key (~lines 56-59):
-            ~/.npm
-          key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
+            ~/.local/share/pnpm/store
+          key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1
# install step (~line 72):
-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
# Fixer job (~line 339): same pnpm/action-setup before setup-node
# Fixer install step (~line 342):
-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
```

### 7.2 Delivery attempt — BLOCKED at push (re-verified this loop)

- Live probe: created branch `test-workflow-perm-wf-*` touching only `iterate.yml` → push **rejected**:
  `refusing to allow a GitHub App to create or update workflow .github/workflows/iterate.yml without workflows permission`.
- Control probe: branch touching only `README.md` → **push OK**. Confirms the block is scoped to `.github/workflows/*`, not global.
- Per the FAIL-SAFE rule, no attempt to smuggle workflow changes through a non-workflow path.

### 7.3 Verification baseline (all green)

| Check          | Result                         |
| -------------- | ------------------------------ |
| `pnpm audit`   | **No known vulnerabilities**   |
| `pnpm test`    | ✅ 73 files / 1482 tests pass  |
| `pnpm lint`    | ✅ 9/9 tasks, 0 warnings       |
| `pnpm install` | ✅ frozen lockfile, no changes |

## 8. Action Log

| Timestamp (UTC)  | Action                                           | Target                                       | Result                                                      |
| ---------------- | ------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| 2026-08-01T20:0x | Phase 0 detection                                | repo                                         | 0 open PRs, 82 open issues → ISSUE MANAGER MODE             |
| 2026-08-01T20:0x | Full issue inventory export + label matrix       | 82 issues                                    | 12 missing category, 13 multi-category, 38 missing priority |
| 2026-08-01T20:0x | Permission matrix probe                          | issue mutations                              | 403 on addLabels/comment/create (re-verified)               |
| 2026-08-01T20:0x | Git-history forensics on iterate.yml             | cd9eb30 → ee9ea1b                            | **Fix merged then reverted 2 min later** — defect open      |
| 2026-08-01T20:0x | Recovery patch verification                      | `git apply --check` cd9eb30 diff             | **CLEAN APPLY** on current main                             |
| 2026-08-01T20:0x | Duplicate detection + resolution re-verification | 82 issues                                    | pnpm-CI cluster open (proven fix); ~45 verified resolved    |
| 2026-08-01T20:0x | Baseline: install / test / lint / audit          | repo                                         | 1482 tests ✅, lint 9/9 ✅, audit clean                     |
| 2026-08-01T20:0x | Workflow-push probe (live)                       | iterate.yml-only branch                      | ❌ rejected — `workflows` permission missing                |
| 2026-08-01T20:0x | Non-workflow push control probe                  | README-only branch                           | ✅ push OK (block is workflow-scoped)                       |
| 2026-08-01T20:0x | Audit report authored + PR                       | docs/issue-manager-audit-2026-08-01-loop6.md | This PR                                                     |

## 9. New Findings & Recommendations

1. **The pnpm-CI fix has already been merged once (`cd9eb30`) and was accidentally reverted (`ee9ea1b`)**. The recovery patch applies cleanly. A privileged process (or token with `workflows: write`) needs only to re-apply that exact diff — no re-authoring needed. This is the **highest-value single action** available.
2. **`workflows` permission is the single blocking constraint** for all remaining workflow-scoped repairs: pnpm-CI cluster (§7.1 patch), security-scanning deploy (#728 — only a reference YAML exists, no actual workflow), CI Node 20→22 alignment (`.nvmrc` 22.14.0 vs workflow `node-version: "20"`), #726/#729/#502 CI wiring, #522 Vercel deploy, #650 AI-prompt extraction from `on-pull.yml`.
3. **~45 issues are resolved but OPEN** because auto-close did not fire (PR bodies phrased "issue #NNN" instead of "fixes #NNN"). A privileged cleanup pass with "resolved by PR #NNN" closure comments would reduce the open-issue count from 82 to ~35 with zero code changes.
4. **Label normalization backlog** (12 missing category / 13 multi-category / 38 missing priority) is fully mapped (§6) and ready for a privileged token.
5. **Vercel check remains red** on every PR (external free-tier daily deploy quota) — non-blocking precedent; do not gate merges on it.
6. **Next repair candidates** (once permissions allow): pnpm-CI re-apply (§7.1), then Release & Rollback Safety (55) — no CHANGELOG / versioned releases / rollback automation.

## 10. Final State

- **Active phase**: ISSUE MANAGER MODE (repair delivery blocked at `workflows` permission; audit report shipped).
- **Open PRs**: 0 (this report's PR pending CI).
- **Open issues**: 82 (unchanged — issue mutations blocked for automation).
- **Merged this loop**: none (the only genuinely-open atomic defect requires `workflows` permission; all other open work is either resolved-but-unclosed or large-P2 feature scope).
- **Waiting for human review**: re-apply §7.1 patch via privileged token (or grant `workflows: write`); close ~45 resolved-but-open issues; apply label normalization + consolidation.
