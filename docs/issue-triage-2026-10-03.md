# Issue Triage & Repair Record — 2026-10-03

- **Run mode**: ISSUE MANAGER MODE (0 open PRs, 82 open issues at entry)
- **Default branch**: `main` (detected via API)
- **Executor**: autonomous agent loop (`on-pull.yml`, schedule trigger)
- **Final state**: ⛔ **BLOCKED** — issue writes and workflow-file writes are not permitted by the run's token; full analysis preserved below so no information is lost.

## 0. Permission constraints verified this run (BLOCKERS)

| Capability needed                            | Result     | Evidence                                                                                                                                                   |
| -------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add/remove issue labels                      | ❌ 403     | `GraphQL: Resource not accessible by integration (addLabelsToLabelable)`; REST `POST .../issues/785/labels` → `403 Resource not accessible by integration` |
| Comment on issues                            | ❌ 403     | `GraphQL: Resource not accessible by integration (addComment)`                                                                                             |
| Close issues                                 | ❌ blocked | requires issue write scope (same token)                                                                                                                    |
| Create issues (fail-safe channel)            | ❌ blocked | same scope as above                                                                                                                                        |
| Push branches / create PRs                   | ✅ works   | probe push `test/push-probe` succeeded; `contents: write` + `pull-requests: write` present in `on-pull.yml`                                                |
| Push/create files under `.github/workflows/` | ❌ refused | `refusing to allow a GitHub App to create or update workflow .github/workflows/wf-push-probe.yml without workflows permission`                             |

**Root cause**: the run executes inside `.github/workflows/on-pull.yml`, whose `permissions:` block grants `contents`, `pull-requests`, `actions: read`, `repository-projects`, `id-token` — but **not `issues: write`** (contrast: `iterate.yml` has `issues: write`). Separately, the GitHub App token has **no `workflows` scope at all**, so no workflow file (including fixing `on-pull.yml` itself) can be pushed by this token — matching the standing note in `docs/security-improvement-ci-audit.md` and the prerequisite in `scripts/deploy-security-workflows.sh`.

**Baseline health (verified before changes)**: `pnpm install --frozen-lockfile` OK; typecheck 9/9 packages OK; **2190/2190 tests pass** (148 files); `check-deps` OK; `pnpm audit`: 0 critical, **1 high, 1 moderate**.

## 1. STEP 1 — Normalization plan (labels to apply once `issues: write` exists)

Category labels allowed (exactly one): `bug|enhancement|feature|docs|refactor|chore|test|ci|security`.
Priority (exactly one): `P0|P1|P2|P3`.

### 1a. Open issues missing a category label — add category + priority

| Issue | Add category  | Add priority | Rationale                                      |
| ----- | ------------- | ------------ | ---------------------------------------------- |
| #753  | `enhancement` | `P2`         | route-based code splitting for existing pages  |
| #752  | `enhancement` | `P3`         | shared CLI output utilities (nice-to-have DX)  |
| #751  | `enhancement` | `P3`         | tRPC bundle optimization, speculative gain     |
| #749  | `feature`     | `P3`         | new AI test/doc generation capability          |
| #697  | `docs`        | `P2`         | corrupted text in documentation hurts accuracy |

### 1b. Open issues missing priority label — add priority

| Issue | Add priority | Rationale                                                                                                                                     |
| ----- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| #728  | `P1`         | body declares Priority: High; security scanning gap (Security Practices −15)                                                                  |
| #789  | `P2`         | react duplicated in `dependencies` **and** `peerDependencies` (`packages/ui/package.json` L84/L86 vs L92–95) — real packaging bug, not urgent |
| #729  | `P2`         | no bundle-size regression gate                                                                                                                |
| #726  | `P2`         | check-deps script exists but not wired into CI                                                                                                |
| #723  | `P2`         | 45+ `"use client"` files, measured impact                                                                                                     |
| #719  | `P2`         | no root tsconfig → config drift                                                                                                               |
| #713  | `P2`         | `email.test.ts` exists; `icon-sizes`/`animation` still untested                                                                               |
| #634  | `P2`         | TS strictness enforcement across packages                                                                                                     |
| #731  | `P3`         | innovation/automation                                                                                                                         |
| #727  | `P3`         | innovation/automation                                                                                                                         |
| #668  | `P3`         | innovation/automation                                                                                                                         |
| #636  | `P3`         | perf nicety (ISR)                                                                                                                             |
| #630  | `P3`         | pre-commit speed tradeoff                                                                                                                     |
| #305  | `P2`         | canonical pnpm-CI issue (work still present, see §2)                                                                                          |

### 1c. Open issues with MORE THAN ONE category label — keep most specific

| Issue | Remove                    | Keep       | Rationale                                 |
| ----- | ------------------------- | ---------- | ----------------------------------------- |
| #713  | `enhancement`             | `test`     | scope is adding tests                     |
| #688  | `enhancement`             | `security` | scope is security headers/edge middleware |
| #523  | `enhancement`             | `refactor` | scope is barrel-export restructuring      |
| #522  | `enhancement`, `refactor` | `ci`       | scope is deployment workflow              |

All other open issues already satisfy exactly-one-category + exactly-one-priority, or are covered by the closes in §3.

## 2. STEP 2 — Duplicate detection

| Canonical                                                     | Duplicate(s)           | Semantic match evidence                                                                                                                                                                                                                             |
| ------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#305** `ci: standardize workflows to use pnpm consistently` | #595, #584, #670, #744 | All five describe the same defect: workflows run `npm ci` instead of `pnpm`. Verified still present: `.github/workflows/iterate.yml` L72 & L342 = `npm ci \|\| true`. Close as `duplicate` → #305, merging any per-issue line references into #305. |
| **#496** (P0, Redis rate limiter)                             | #480                   | Near-identical titles/bodies ("Replace in-memory rate limiter with Redis"). Both **also verified resolved** (see §3) — close #480 `duplicate` of #496, then close #496 as resolved.                                                                 |
| **#523** (barrel-export audit)                                | #667                   | #667 "Audit and document package export boundaries" ⊂ #523 "Audit and optimize barrel exports for tree-shaking". Close #667 `duplicate` → #523 (info: tree-shaking + circular-dep checks already in #523 body).                                     |

No other pairs exceed the semantic-similarity threshold (test-coverage issues are scope-distinct: UI vs db vs common vs auth vs e2e; performance issues distinct: bundle analyzer vs code splitting vs client-component ratio).

## 3. STEP 3 — Consolidations & verified-resolved closes

Every close below was verified against the working tree on 2026-10-03; evidence listed so closes are reversible with context.

### 3a. Consolidation groups (information merged, then closed)

| Group                 | Issues           | Outcome                                                                                                                                                                                                                                                                                   |
| --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E2E testing           | #628, #501, #724 | All premises stale: `tests/e2e/` contains **11 specs** incl. `critical-flows`, `auth`, `admin`, `billing`, `cluster`, `subscription-workflows`, `authorization-bypass`, `webhook-error-handling`. Close all three as resolved; keep #713-style gaps tracked only if re-audit finds holes. |
| packages/auth tests   | #549, #500       | Claim "ZERO coverage" false: `packages/auth/clerk.test.ts`, `env.test.ts`, `logger.test.ts` exist. Close both.                                                                                                                                                                            |
| API router tests      | #631, #725, #551 | Tests exist: `k8s.test.ts`, `k8s-router.test.ts`, `customer.test.ts`, `customer-router.test.ts`, `stripe.test.ts`, `stripe-router.test.ts`, `integration.test.ts`. Close all three.                                                                                                       |
| Testing consolidation | #581             | Children #549/#550/#551/#500/#501 all resolved (this table + coverage config `include` now has `apps/nextjs/src/**`). Close.                                                                                                                                                              |
| .nvmrc                | #720, #748       | `.nvmrc` exists with valid `22.14.0` (neither "missing" nor "20"). Close both.                                                                                                                                                                                                            |

### 3b. Individual verified-resolved closes (evidence)

| Issue          | Claim                              | Verified reality                                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #496 (P0)      | in-memory rate limiter needs Redis | `packages/api/src/distributed-rate-limiter.ts` (Redis + in-memory fallback), `SyncRateLimiter` gates on `IS_REDIS_CONFIGURED && REDIS_URL`, wired via `getLimiter()` in `trpc.ts` L433+, tests `distributed-rate-limiter*.test.ts`, `REDIS_URL` in `.env.example` |
| #480 (P1)      | duplicate of above                 | same evidence                                                                                                                                                                                                                                                     |
| #498 (P1)      | replace email allowlist RBAC       | `requireRole` + `createRoleBasedProcedure` implemented in `trpc.ts` with DB role lookup + audit logging; covered by `rbac.test.ts`, `authorization.test.ts`; no `ADMIN_EMAILS` references remain                                                                  |
| #721 (P1)      | missing authorization checks       | same RBAC evidence: role middleware in tRPC context, admin guards, tests                                                                                                                                                                                          |
| #515 (P1)      | no CSRF protection                 | `apps/nextjs/src/lib/csrf.ts` (OWASP origin verification) applied in `proxy.ts` + tRPC route; `CSRF_ALLOWED_ORIGINS` allowlist                                                                                                                                    |
| #722           | no env validation at startup       | `@t3-oss/env-nextjs` + Zod schema (`packages/common/src/env.mjs`, `apps/nextjs`), `env-validation.test.ts`                                                                                                                                                        |
| #632 (P1-body) | audit logging for PII              | `packages/api/src/sensitive-data-logging.test.ts` asserts no secrets in logger/console output                                                                                                                                                                     |
| #786           | webhook logs partial secret        | no `slice(-8)`/secret-slicing anywhere; `apps/nextjs/src/app/api/webhooks/stripe/route.ts` logs only non-secret identifiers + explicit redaction comment (L162–163). Issue's cited path no longer exists.                                                         |
| #785           | duplicate `next` dep               | `packages/stripe/package.json` has **no** `next` dependency at all                                                                                                                                                                                                |
| #787           | no db migration tests              | `packages/db/migrations.test.ts`, `seed.test.ts`, `rls-middleware.test.ts`, `db-instance.test.ts`                                                                                                                                                                 |
| #788           | no UI component tests              | 20+ tests incl. `navbar.test.tsx`, `modal.test.tsx`, `dashboard-skeleton.test.tsx`, 8× `cluster-*.test.tsx`                                                                                                                                                       |
| #755           | missing composite index            | `schema.prisma` has `@@index([authUserId, plan, stripeCurrentPeriodEnd])`, `@@index([plan, stripeCurrentPeriodEnd])`, `@@index([authUserId, stripeCurrentPeriodEnd])`                                                                                             |
| #754           | no webhook idempotency tests       | `packages/stripe/src/webhook-idempotency.test.ts` + `webhook-error-handling.spec.ts` + idempotency-key tests in `client.test.ts`                                                                                                                                  |
| #635           | no onboarding guide                | `docs/ONBOARDING.md` + `CONTRIBUTING.md` exist                                                                                                                                                                                                                    |
| #613           | duplicate `paratterate.yml`        | `.github/workflows/` contains only `iterate.yml` + `on-pull.yml`                                                                                                                                                                                                  |
| #550           | coverage misses apps/nextjs        | `vitest.config.ts` L16: `include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`                                                                                                                                                                    |

**Kept OPEN (insufficient evidence to close)**: #697 (corrupted-text grep hits only auto-generated `docs/issue-manager-audit-*.md` logs — original target files not identified), #713 (partial gaps remain), plus all issues in §1 with no resolution evidence.

## 4. STEP 4 — Repair (selection → attempt → block)

**Selection**: After §1 priority assignment, the only open **P1** is **#728** `[Security] Add security scanning workflows to CI` (body: "Priority: High"). This also satisfies the tie-break rule: lowest-scoring domain from surviving audit issues = _System Quality / Security Practices_ (−15 recorded in #728).

**What exists already** (progress preserved):

- `docs/workflow-security-audit.yml` — full template (dependency audit job + CodeQL job + outdated check)
- `scripts/deploy-security-workflows.sh` — deployment script (executable)
- `.github/codeql-config.yml` — CodeQL config present
- `.github/dependabot.yml` — Dependabot configured (pnpm + github-actions, weekly) → acceptance item "Configure Dependabot alerts" satisfied at config level (repo Security-tab toggles still need an admin)
- Root scripts: `security:audit` (moderate), `security:check` (high + outdated)

**Blocker (empirically verified, not assumed)**: pushing `.github/workflows/security-audit.yml` (or any workflow change, including adding `issues: write` to `on-pull.yml`) is refused:

```
! [remote rejected] ... -> ... (refusing to allow a GitHub App to create or update
workflow `.github/workflows/....yml` without `workflows` permission)
```

**Solve suggestion (maintainer unblock checklist)** — each step requires a token with scopes this run lacks:

1. **Restore issue management for the agent loop** (unblocks all future ISSUE MANAGER runs):
   ```bash
   # edit .github/workflows/on-pull.yml → permissions: add  issues: write
   gh issue comment <any>  # verify works with your PAT
   ```
   Push with a PAT/App token that has `workflows` scope (GITHUB_TOKEN cannot).
2. **Deploy #728's security scanning** (as documented in `docs/security-improvement-ci-audit.md`):
   ```bash
   bash scripts/deploy-security-workflows.sh
   git add .github/workflows/security-audit.yml
   git commit -m "fix(security): deploy security scanning workflow (#728)"
   git push  # requires workflows scope
   ```
   Then enable Dependabot security updates + code scanning alerts in repo Settings → Code security (admin).
3. **Execute this document**: run the §1 label commands and §2/§3 `gh issue edit/close` commands (appendix below), then re-run selection for the next repair.

**Note on current audit state**: `pnpm audit` = 0 critical / 1 high / 1 moderate → deploy the template's fail-on-critical policy (not `--audit-level=moderate`, which would go red immediately; root `security:audit` script uses moderate and would fail today — consider aligning thresholds at deploy time).

## 5. Appendix — ready-to-run commands

```bash
# §1a/§1b examples (add category+priority):
gh issue edit 753 --add-label enhancement --add-label P2
gh issue edit 752 --add-label enhancement --add-label P3
gh issue edit 751 --add-label enhancement --add-label P3
gh issue edit 749 --add-label feature --add-label P3
gh issue edit 697 --add-label docs --add-label P2
gh issue edit 728 --add-label P1
gh issue edit 789 --add-label P2
gh issue edit 729 --add-label P2   # likewise: 726,723,719,713,634 → P2; 731,727,668,636,630 → P3; 305 → P2

# §1c fix multi-category (exactly one category):
gh issue edit 713 --remove-label enhancement
gh issue edit 688 --remove-label enhancement
gh issue edit 523 --remove-label enhancement
gh issue edit 522 --remove-label enhancement,refactor

# §2 duplicates:
for n in 595 584 670 744; do gh issue close $n --reason "not planned" --comment "Duplicate of #305 (same npm-vs-pnpm workflow defect; iterate.yml L72/L342 still affected). Canonical: #305"; done
gh issue close 667 --reason "not planned" --comment "Duplicate of #523 (barrel-export audit). Canonical: #523"
gh issue close 480 --reason "not planned" --comment "Duplicate of #496; both verified resolved (distributed-rate-limiter.ts + trpc getLimiter wiring)."

# §3 resolved closes (use evidence table in §3b for comment bodies):
# 496, 498, 515, 549, 550, 551, 581, 500, 501, 628, 631, 632, 635, 613, 620→720, 748,
# 721, 722, 724, 725, 754, 755, 785, 786, 787, 788
```

_Evaluation date: 2026-10-03. No issues were modified during this run (all write attempts above are blocked by token scope — see §0)._
