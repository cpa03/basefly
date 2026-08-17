# Issue Manager Audit Report — 2026-08-09 (loop 66)

**Execution:** `/ulw-loop` | **Repository:** cpa03/basefly | **Default branch:** `main` (HEAD `9366c35`)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 entry decision: 0 open PRs, 82 open issues)

## Decision Summary

- Step 0.1 (open PRs): **0 open PRs** → skipped PR Handler Mode.
- Step 0.2 (open issues): **82 open issues** → entered Issue Manager Mode.
- Steps 1–3 (label normalization, duplicate closure, consolidation): **BLOCKED at API level** — re-probed first-hand this session: `gh issue edit --add-label` → 403 `addLabelsToLabelable`; push of workflow files refused (no `workflows` scope). Token (`on-pull.yml`) grants `contents: write` + `pull-requests: write` only; no `issues: write`, no `workflows: write`.
- Step 4 (Repair Mode): P0/P1 priority issues re-verified **resolved in code** (see table below) → selected repair target per repair-selection rules: lowest-scoring domain **B. SYSTEM QUALITY (55/100)** from `docs/diagnostic-score-2026-07-18.md`, lowest-scoring criterion **Performance Efficiency (65)** → **#723 [P2] Client component bloat** → PR #1178 (open, awaiting merge). See Repair Mode below.
- **Workflow-blocked (unchanged)**: pnpm-in-CI cluster (#305/#584/#595/#670/#744) — `iterate.yml` still contains `npm ci || true` at lines 72/342; CI Node-version bump (.nvmrc `22.14.0` vs `on-pull.yml` `node-version: 20`) likewise blocked.

## P0/P1 Verification (re-checked in code, all resolved)

| Issue            | Title                              | Evidence                                                           |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------ |
| #496 (P0)        | Redis distributed rate limiter     | `packages/api/src/distributed-rate-limiter.ts` + `.test.ts`        |
| #498 / #721 (P1) | Role-based access control          | `packages/api/src/authorization.ts`, `requireRole` in `trpc.ts`    |
| #515 (P1)        | CSRF protection                    | `apps/nextjs/src/proxy.ts` origin/referer validation               |
| #722 (P1)        | Env validation at startup          | `packages/api/src/env.mjs` (t3-env), `env:verify` script           |
| #720 / #748      | .nvmrc Node version                | `.nvmrc` = `22.14.0` (commit `de2d52b`, PR #758)                   |
| #786             | Stripe webhook secret in logs      | `packages/stripe/src/webhook.ts` logs non-secret identifier only   |
| #789             | peerDependencies (React)           | `packages/ui/package.json` peerDependencies present                |
| #550 / #551      | Vitest coverage / k8s router tests | `vitest.config.ts` includes `apps/nextjs`; `k8s.test.ts` exists    |
| #728             | Security scanning in CI            | `on-pull.yml` scan job (PR #1146)                                  |
| #683             | ESLint config                      | root `.eslintrc.cjs`, all packages extend `@saasfly/eslint-config` |
| #688             | Security headers / middleware      | `apps/nextjs/src/proxy.ts` (Next 16 `middleware.ts` → `proxy.ts`)  |

## Repair Mode Implementation

**Issue:** #723 — "Client component bloat: many UI components marked as client despite minimal interactivity"

**Selection rationale:** No open P0/P1 issues. Per repair-selection rules, select the lowest-scoring domain → **B. SYSTEM QUALITY (55)**; within it the lowest-scoring criterion (Stability 40) is CI Node-version — workflow-blocked, so the next-lowest actionable criterion **Performance Efficiency (65)** was chosen. #723 maps directly to Performance Efficiency (client JS bundle reduction) and is a P2 code-fixable issue.

### Audit result (41 "use client" files in apps/nextjs/src)

Every `"use client"` file was scanned for hook usage, event handlers, browser API access, and import graph. Findings:

- **0-hook candidates:** `textGenerateEffect.tsx`, `typewriterEffectSmooth.tsx`, `infiniteMovingCards.tsx`, `wobble.tsx` — **dead code** (never imported anywhere; wrappers around `@saasfly/ui` equivalents). Not touched (deletion out of scope for this repair; noted for cleanup).
- **`theme-provider.tsx`** — re-exports `next-themes` `ThemeProvider`; must remain client.
- **`video-scroll.tsx`** — 0 hooks but renders client `@saasfly/ui` components (`ContainerScroll`, `ColourfulText`) and is loaded via `next/dynamic` (client boundary anyway); conversion would be a no-op for the bundle. Skipped.
- **Genuine hooks users (must stay client):** `back-to-top.tsx` (scroll events), `page-progress.tsx` (scroll listener), `skip-link.tsx` (focus handling), nav/modal/forms cluster, etc.

### Fix applied (1 component converted)

`apps/nextjs/src/app/[lang]/(dashboard)/dashboard/billing/subscription-form.tsx`:

- Removed `"use client"` directive.
- Changed `buttonVariants` import from `@saasfly/ui/button` (client-marked module) to `@saasfly/ui/button-variants` (server-safe pure `cva` module, exported as its own subpath, documented as "kept separate from the Button component to allow usage in both server and client components").
- The component renders a pure `<Link>` with button variant classes — no hooks, no events, no browser APIs. Eliminates an unnecessary client boundary on the billing dashboard page.

### Verification (fresh this session)

| Check               | Command                                     | Result                                                                                                                                                               |
| ------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typecheck           | `tsc --noEmit -p apps/nextjs/tsconfig.json` | **0 errors** attributable to changed file (57 pre-existing errors in untouched `trpc/*`, `proxy.ts`, `utils/api.ts` — confirmed identical on clean `main` via stash) |
| Lint (changed file) | `eslint apps/.../subscription-form.tsx`     | clean, exit 0                                                                                                                                                        |
| Dependency install  | `pnpm install --frozen-lockfile --offline`  | success (store cache)                                                                                                                                                |

### Delivery

- Branch: `fix/issue-723-client-components` (from `main` `9366c35`)
- Commit: `2c6e118` — `fix(dashboard): convert billing SubscriptionForm to server component - Issue #723`
- PR **#1178** created (`Closes #723`) — open, awaiting CI/merge (bot token cannot auto-merge; repo precedent is `gh pr merge --admin` post-review, as with #1174/#1176)
- Local uncommitted environment artifacts (deleted `.opencode/*.json`, untracked `.omo/`) were deliberately **excluded** from the commit.

## Next-Loop Candidates (unchanged + new)

- **Workflow-blocked, needs token upgrade:** Steps 1–3 (labels/dedupe/consolidation), pnpm-in-CI cluster (#305/#584/#595/#670/#744), CI Node-version bump, #650 (extract AI prompts from `on-pull.yml`), #729 (CI wiring).
- **Dead-code cleanup (code-fixable):** remove unused `textGenerateEffect.tsx`, `typewriterEffectSmooth.tsx`, `infiniteMovingCards.tsx`, `wobble.tsx` wrapper components (further #723 progress).
- **#723 continuation:** convert `billing-form.tsx` / `user-name-form.tsx`-style components only where hook-free; audit marketing-page `next/dynamic` usage.

## Skills Used

- `github-workflow-automation` — GitHub Actions permission model; confirmed `on-pull.yml` token lacks `issues: write` and `workflows: write`; Steps 1–3 and workflow-file fixes remain blocked pending a permissions update.
- `planning` (`.opencode/skills/planning`) — structured multi-step tracking of the issue-manager cycle.
