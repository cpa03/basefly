# Issue Manager Audit Report — 2026-08-12 (loop 95)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `2a3b2ae`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: 0 open PRs → Step 0.2; 82 open issues → Issue Manager Mode entered; PR Handler Mode and Phases 1–3 stopped)

## Decision Summary

- **Step 0.1 (open PRs):** 0 open PRs → PR Handler Mode skipped.
- **Step 0.2 (open issues):** 82 open issues → **Issue Manager Mode** entered. No new issues since 2026-02-27 (latest open issue #789).
- **Step 1 (normalization):** **BLOCKED** — re-probed live this session: `gh issue edit 632 --add-label P1` → `403 GraphQL: Resource not accessible by integration (addLabelsToLabelable)`; `gh issue comment` → `403 (addComment)`. Confirms loops 85–95: 38 issues missing priority label, 12 missing category label, 13 with multi-category labels.
- **Step 2–3 (dedup/consolidation):** **BLOCKED** — close/label mutations remain 403. `createIssue` also 403 → FAIL-SAFE issue creation unavailable.
- **Step 4 (Repair Mode):**
  - P0 **#496** (distributed rate limiter) — re-verified code-resolved on `main` (unchanged from loop 94): `packages/api/src/distributed-rate-limiter.ts` (Redis sliding window + in-memory fallback + `SyncRateLimiter`), wired into `trpc.ts` via `getLimiter().checkAsync()` in `rateLimit()` middleware; tests `distributed-rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts`. No new P0/P1 code defect found.
  - **Duplicate clusters (9 issues across 5 clusters — closure blocked pending `issues: write`):**
    - **Rate limiter:** #480 ↔ #496 → canonical #496 (P0, acceptance criteria + OWASP ref).
    - **pnpm-in-CI:** #305 ↔ #584 ↔ #595 ↔ #670 ↔ #744 → canonical #305 (earliest, most comprehensive). Same root cause as the live `iterate.yml`/`on-pull.yml` bug below.
    - **E2E/Playwright:** #501 ↔ #628 ↔ #724 → canonical #501 (P1, specific journeys).
    - **API router tests:** #551 ↔ #631 ↔ #725 → canonical #631 (covers k8s+customer+stripe; #551 subset, #725 generic).
    - **tRPC API docs generation:** #731 ↔ #749 → canonical #731; #749's AI-test-generation angle to be preserved if consolidated.

## First-Hand Verifications This Loop (31 issues re-checked against `main`)

### New code-resolved confirmations (13, additional to loop 94's list)

| Issue | Title | Evidence on `main` |
|-------|-------|--------------------|
| **#786** | Stripe webhook logs partial secret | `packages/stripe/src/webhooks.ts` logs only `{ eventType }` via pino `logger.info("Stripe Webhook Processed", …)` / `logger.error("Stripe Webhook Failed", error)`; no secret field logged. Fix history: `9c20a29` (#1001), `69b43e0`. |
| **#722** | Env var validation at startup | `packages/api/src/env.mjs` uses `createEnv` from `@t3-oss/env-nextjs` with zod schemas for server/shared vars. |
| **#721** | Explicit authorization beyond authentication | `trpc.ts` `adminProcedure`: DB role check first (`userRecord?.role === "ADMIN"`, `method: "database_role"`), email `ADMIN_EMAIL` fallback retained as documented migration path. |
| **#515** | CSRF protection for form submissions | `apps/nextjs/src/proxy.ts`: CSRF Origin/Referer validation with expected-origin comparison, applied to state-changing requests. |
| **#521** | Hydration consistency with client dictionary loading | `suppressHydrationWarning` present across client components (command-palette, modal-provider, mode-toggle, keyboard-shortcuts-help, layout). |
| **#483** | Transaction handling for multi-table ops | `packages/stripe/src/webhooks.ts` uses `db.transaction().execute()` for subscription update + invoice atomicity (lines 114, 150). |
| **#486** | Server-side observability (OpenTelemetry) | `trpc.ts` imports `@opentelemetry/api`, `trace.getTracer("basefly-api")`, `startActiveSpan` with `SpanStatusCode` OK/ERROR; `@opentelemetry/api` in `packages/api/package.json`. |
| **#488** | Circular dependency detection in CI | Root `package.json`: `check:circular` = `madge --circular --warning …`; wired into `ci:check` and `dx:check`. |
| **#613** | Remove duplicate GitHub Actions workflow | `.github/workflows/` contains exactly `iterate.yml` + `on-pull.yml` — no duplicates. |
| **#697** | Fix corrupted text formatting in docs | Fixes merged: `e290045`/`b3b9000` (#697), `df9d550` (#810), `8a7e87c` (#770), `70d2e93` (#1219). |
| **#500** | Clerk authentication flow tests | `apps/nextjs/src/utils/clerk.test.ts` present. |
| **#549** | Tests for packages/auth (0% coverage) | `packages/auth/env.test.ts` + `packages/auth/clerk.test.ts` present. |
| **#551** | Tests for k8s router | `packages/api/src/router/k8s-router.test.ts` present (plus `k8s.test.ts`). |

### Re-confirmed resolved (unchanged from loop 94, spot-checked)

#785 (no `next` dep in packages/stripe), #789 (peerDependencies declared), #748 (`.nvmrc` = `22.14.0`), #683 (root eslint extends tooling config), #579 (env:verify + CONTRIBUTING pnpm docs), #611 (6 not-found files), #755 (`@@index` on subscription queries), #485 (Suspense in layouts/pages), #705 (Dockerfile + docker-compose), #706 (devcontainer.json), #684 (root build + turbo pipelines), #631/#713/#787/#788/#754 (test suites present), #688 (proxy.ts replaces middleware.ts in Next.js 16), #498 (DB-role RBAC in adminProcedure), #496 (distributed rate limiter).

### Partially resolved / audit-type (remain open as actionable)

| Issue | Status |
|-------|--------|
| **#610** | tRPC response format — `success: true as const` used in customer/stripe/k8s routers; some `ok:` remnants in tests only. Partial; router-side standardized. |
| **#663** | 25 `eslint-disable` comments remain in non-test code; most carry justification comments (rate-limiter nullish, react-hooks purity, unsafe-call in soft-delete/health-check). Partial. |
| **#687** | Barrel exports — `packages/{api,stripe,ui,common}/src/index.ts` exist; `packages/auth` and `packages/db` still lack `index.ts`. Partial. |
| **#667** | Export boundary audit — no dedicated audit doc/ADR; remains open (P3). |
| **#590** | UI component library enterprise audit — no audit artifact found; remains open (P2). |
| **#723 / #751 / #753** | Bundle size / code splitting — 35 `'use client'` components in apps/nextjs; no route-based splitting for dashboard yet; remains open (P2/P2). |
| **#752** | Unified CLI output utilities — no `packages/common` CLI util module; remains open (P2). |
| **#494** | Domain layer for business logic — no `domain` layer directory; remains open (P2). |
| **#668 / #727 / #749 / #729** | AI/innovation proposals — no implementation; remain open (P3). |
| **#502 / #522 / #726 / #728** | CI workflow additions (fast-path, Vercel deploy, dep consistency, security scanning) — absent; **blocked by `workflows: write`**. |

## Real Bug Still Present (workflow-permission blocked)

- **pnpm/Node-20 CI cluster (#305/#584/#595/#670/#744):** `iterate.yml` still contains `npm ci || true` (lines 72/342) and `node-version: "20"` pins (lines 70/266/340/395); `on-pull.yml` pins `node-version: 20` (line 55) with pnpm action-setup but Node 20. `.nvmrc` requires Node 22.14.0 → version mismatch. Fix requires editing workflow files → blocked without `workflows: write`.

## Required Human Actions (unblock list — unchanged)

1. Add `issues: write` to the loop workflow (`on-pull.yml`) → unblocks normalization (12 missing category / 38 missing priority / 13 multi-category), the 9 confirmed duplicate closures, and closing 70+ verified-resolved issues.
2. Add `workflows: write` → unblocks the pnpm/Node-20 CI fix (5-issue cluster #305/#584/#595/#670/#744), #728 security scanning deployment (specs ready in `docs/workflows/`), #502/#522/#613/#726.
3. Triage stale proposals: close #636 (ISR on personalized data → cross-user leakage risk; code already documents `force-dynamic` rationale in `dashboard/page.tsx`), and the 5 duplicate clusters above.
4. Schedule Phase-2/3: #494 (domain layer), #749/#668 (AI features), #667/#634/#590 (audits), #723/#751/#753 (bundle/performance).

## Action Log

| Timestamp (UTC) | Action | Target | Result |
|-----------------|--------|--------|--------|
| 00:5x | Entry decision | PRs / issues | 0 open PRs; 82 open issues → Issue Manager Mode |
| 00:5x | Token probe | issue label mutation | `addLabelsToLabelable` 403 → Steps 1–3 blocked (re-confirmed) |
| 00:5x | Token probe | `addComment` / `createIssue` | 403 → FAIL-SAFE issue creation unavailable |
| 00:5x | Duplicate scan | 82 open issues | 5 duplicate clusters confirmed (9 issues): #480/#496, #305/#584/#595/#670/#744, #501/#628/#724, #551/#631/#725, #731/#749 |
| 00:5x | Repair selection | P0 #496 | ✅ `distributed-rate-limiter.ts` + tests + `getLimiter().checkAsync()` wiring on `main` |
| 00:5x | New verification | #786 #722 #721 #515 #521 #483 #486 #488 #613 #697 #500 #549 #551 | ✅ All 13 confirmed code-resolved (evidence above) |
| 00:5x | Spot re-check | loop-94 list (18 issues) | ✅ Unchanged — still resolved |
| 00:5x | Partial scan | #610 #663 #687 #667 #590 #723 #751 #753 #752 #494 | ⚠️ Partial or audit-type — remain open |
| 00:5x | Bug re-verify | pnpm/Node-20 CI cluster | Real bug present (`npm ci || true`, Node 20 pins vs `.nvmrc` 22.14.0); workflow-file blocked |
| 00:5x | Audit report | `docs/issue-manager-audit-2026-08-12-loop95.md` | Written (this file) |

## Skills & Agents Used

- **Skill:** `github-workflow-automation` — validated the GitHub App token permission model again: issue mutations (label/create/comment/close) all 403; workflow-file pushes require `workflows: write` (matching `docs/security-workflows-deploy.md`).
- **Skills evaluated but not applicable:** `security-research` (no new attack surface — #515/#632/#721/#786/#688 controls confirmed present on `main`), `planning-with-files` (single-phase state-machine run), `obra-superpowers-systematic-debugging` (no code-level defect to debug — all code issues verified resolved).
- **Subagents:** None used — issue-state verification performed directly in the orchestrator session with first-hand command evidence (`gh` queries + file/commit inspection); duplicate clusters verified by reading issue bodies.

## Final State

- **State:** `waiting for human review` — blocked on token permissions (`issues: write`, `workflows: write`).
- **Blocked on:** Step 1–3 (normalization/dedup/consolidation) and the pnpm-CI + workflow-file fixes (#728, #502, #522, #726).
- **No working-tree changes introduced by this loop** (report is a new doc; branch/PR creation left to the established docs-PR flow).