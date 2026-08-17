# Issue Manager Audit Report — 2026-08-12 (loop 99)

## Executive Summary

Audited all **82 open issues**. Findings:

- **~70 issues verified as RESOLVED** in the codebase (fixes merged via PRs or
  code present on `main`) but never closed.
- **5 duplicate clusters** identified (rate limiter, pnpm CI, E2E testing,
  API router tests, barrel exports).
- **Permission constraint**: this token (`on-pull.yml`, schedule) has
  `contents: write` + `pull-requests: write` but **no `issues: write`** and
  **no `workflows` permission**. Issue labeling/closing/commenting and
  workflow-file changes are blocked.
- **Repair executed**: Issue #667 (document package export boundaries).

## Action Log

| Timestamp (UTC) | Action | Target | Result |
|---|---|---|---|
| 2026-08-12 | Phase 0 entry decision | repo | No open PRs; 82 open issues → ISSUE MANAGER MODE |
| 2026-08-12 | Label audit | 82 issues | 11 missing category, 38 missing priority labels |
| 2026-08-12 | Permission probe | GITHUB_TOKEN | issues:write ❌, workflows ❌, contents/pull-requests ✅ |
| 2026-08-12 | Resolution verification | 82 issues | ~70 resolved in code (see below) |
| 2026-08-12 | Repair: #667 | docs/export-boundaries.md | Documented export boundaries; madge 0 cycles |
| 2026-08-12 | PR created | #667 | Linked PR with fix |

## Verified-Resolved Issues (evidence on `main`)

**Security**: #496 (rate limiter, #1232), #498 (RBAC, #1202), #515 (CSRF, #1208),
#632 (no sensitive logging), #721 (authorization.ts), #722 (env validation),
#728 (vulns cleared, #1146), #786 (webhook secret sanitized), #688 (proxy.ts).

**Testing**: #500 (Clerk tests, #1140), #501 (tests/e2e, 12 specs), #549 (auth
tests), #550 (coverage config), #551 (k8s router tests, #1119), #581 (infra,
#1123), #713 (28 common tests), #754 (idempotency tests), #787 (db migration
tests), #788 (UI component tests), #729 (size-limit).

**CI/DX**: #305 (pnpm CI, #1173/#1205), #488 (circular dep, #1206), #613 (no
duplicate workflows), #630 (husky typecheck+test), #683 (root .eslintrc.cjs),
#684 (root build script), #726 (check-deps), #752 (CLI utils, #1211).

**Architecture/Code**: #503 (JSDoc), #578 (health check removed), #609
(centralized Zod schemas), #610 (success response format), #611 (not-found
pages), #634 (TS strict), #663 (eslint-disable, #1176), #664 (pino), #666
(error.tsx), #685 (React memo), #697 (docs corruption fixed), #705 (Docker),
#706 (devcontainer), #708 (bundle analyzer), #719 (root tsconfig), #720/#748
(.nvmrc), #723 (server components, #1178/#1180/#1181), #731 (openapi.ts),
#751 (lazy routers), #753 (next/dynamic), #755 (composite indexes), #785
(stripe deps), #789 (ui peerDeps), #487 (cache wired), #492 (image sizes,
#1138/#1204), #521 (SSR-safe dictionary, #568), #485 (Suspense/loading.tsx),
#580 (Sentry, #1217), #523 (barrel exports), #667 (this PR).

## Duplicates Identified (close duplicates, keep canonical)

| Duplicate(s) | Canonical |
|---|---|
| #480 (rate limiter) | #496 |
| #584, #595, #670, #744 (pnpm CI) | #305 |
| #628, #724 (E2E testing) | #501 |
| #725 (API router tests) | #631 |
| #687 (barrel exports) | #523 |

## Genuinely Unresolved (blocked or out of scope for this token)

| Issue | Reason |
|---|---|
| #502 (fast-path CI), #522 (Vercel deploy), #650 (extract prompts), #728 (security scanning) | Require `.github/workflows/*` changes — blocked (no `workflows` permission) |
| #668 (AI diagnostics), #727 (AI review), #749 (AI testing gen) | P3 speculative features; no implementation requested in docs |
| #636 (ISR caching) | Deliberate design decision documented in code (`force-dynamic`; user-scoped data must not be cached) |

## Recommendation for Next Loop

1. Grant `issues: write` (and `workflows: write`) in `on-pull.yml` so issue
   normalization/closing and workflow fixes can proceed.
2. Close the ~70 verified-resolved issues with evidence.
3. Close the 5 duplicate clusters referencing canonicals.
4. Then re-run normalization on the remaining ~7 issues.