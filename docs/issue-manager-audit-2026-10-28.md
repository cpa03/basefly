# Issue Manager Audit — 2026-10-28

**Agent**: Sisyphus (autonomous maintainer loop, `on-pull.yml` scheduled run)
**Trigger**: `/ulw-loop` state machine — Phase 0 → ISSUE MANAGER MODE (82 open issues, 0 open PRs)
**Outcome**: Analysis complete; issue-write operations and workflow-file pushes blocked by token permissions (see [Blocked Operations](#blocked-operations)).

---

## 1. Executive Summary

| Metric                                                                      | Value                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------- |
| Open issues audited                                                         | 82                                                |
| Open PRs                                                                    | 0                                                 |
| Issues verified **already fixed in code** (stale, safe-to-close candidates) | 21+ confirmed by direct code inspection           |
| Semantic duplicate clusters identified                                      | 7                                                 |
| Issues requiring label normalization                                        | 82 (all lacked full category+priority compliance) |
| Repair-mode fixes shipped                                                   | 0 (blocked — see below)                           |

**Key finding**: The open-issue backlog is predominantly a historical audit artifact. Subsequent PRs fixed the underlying problems, but the issues were never closed. Bulk closure after human confirmation is the highest-leverage cleanup available.

---

## 2. Verified Already-Fixed Issues (close candidates)

Each row was verified against `main` @ `3dce300` by direct code inspection.

| Issue                          | Claim                                     | Evidence it is fixed                                                                                                                                                                                                                                                                       |
| ------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **#496** (P0)                  | Replace in-memory rate limiter with Redis | `packages/api/src/distributed-rate-limiter.ts` (Redis sliding window + in-memory fallback); `trpc.ts` imports it; `ioredis@5.6.1` dep; `REDIS_URL` in `.env.example` + `docker-compose.yml`; tests exist; follow-ups merged (`e40a7e2`, `99b2799`)                                         |
| **#480** (P1)                  | Same as #496                              | Duplicate of #496; same evidence                                                                                                                                                                                                                                                           |
| **#786** (P1)                  | Stripe webhook logs partial secret        | `apps/nextjs/src/app/api/webhooks/stripe/route.ts:60-67` logs only `identifier`/`requestId`/`resetAt`; no `slice(-8)` anywhere in repo                                                                                                                                                     |
| **#721** (P1)                  | Explicit authorization beyond auth        | `packages/api/src/authorization.ts` (verifyOwnership family); `trpc.ts` `isAdmin` middleware + `adminProcedure`; per-router ownership guards (`k8s.ts` verifyClusterOwnership, `customer.ts` userId match, `stripe.ts` authUserId WHERE clauses); `rbac.test.ts` + `authorization.test.ts` |
| **#498** (P1)                  | Role-based admin access                   | Role-based `isAdmin` implemented in `trpc.ts:254-323` with `ADMIN_EMAIL` fallback explicitly documented as migration path                                                                                                                                                                  |
| **#515** (P1)                  | CSRF protection                           | `apps/nextjs/src/lib/csrf.ts` + tests; origin/referer validation in `proxy.ts:54-92`                                                                                                                                                                                                       |
| **#550** (P1)                  | apps/nextjs in coverage                   | `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}`                                                                                                                                                                                                                             |
| **#549** (P1)                  | packages/auth tests (0%)                  | `packages/auth/{env,logger,clerk}.test.ts` exist                                                                                                                                                                                                                                           |
| **#500** (P1)                  | Clerk auth flow tests                     | `packages/auth/clerk.test.ts`; `tests/e2e/auth.spec.ts`                                                                                                                                                                                                                                    |
| **#631 / #551 / #725** (P1/P2) | API router tests missing                  | `packages/api/src/router/{k8s,customer,stripe}{,-router}.test.ts` + `integration.test.ts` exist                                                                                                                                                                                            |
| **#724** (P1)                  | E2E coverage gaps                         | `tests/e2e/` has 11 specs incl. `critical-flows`, `subscription-workflows`, `billing`, `webhook-error-handling`, `authorization-bypass`                                                                                                                                                    |
| **#789** (P2)                  | React peerDependencies in ui              | `packages/ui/package.json:92-96` declares `peerDependencies` for next/react/react-dom                                                                                                                                                                                                      |
| **#785** (P2)                  | Duplicate `next` dep in stripe            | No `"next"` entry in `packages/stripe/package.json` at all                                                                                                                                                                                                                                 |
| **#755**                       | Composite index for subscriptions         | `schema.prisma:44` has `@@index([authUserId, plan, stripeCurrentPeriodEnd])`                                                                                                                                                                                                               |
| **#688** (P2)                  | Missing middleware.ts                     | Implemented as `apps/nextjs/src/proxy.ts` (Next 16 middleware convention): Clerk auth, CSRF, CSP + security headers, request IDs                                                                                                                                                           |
| **#720 / #748**                | .nvmrc missing/invalid                    | `.nvmrc` contains valid `22.14.0`                                                                                                                                                                                                                                                          |
| **#719**                       | Root TypeScript config                    | Root `tsconfig.json` exists                                                                                                                                                                                                                                                                |
| **#787**                       | packages/db migration tests               | `packages/db/migrations.test.ts` + 6 other test files                                                                                                                                                                                                                                      |
| **#788**                       | UI component tests                        | 36 test files under `apps/nextjs/src`; multiple under `packages/ui/src`                                                                                                                                                                                                                    |
| **#611**                       | not-found.tsx                             | `apps/nextjs/src/app/not-found.tsx` exists                                                                                                                                                                                                                                                 |
| **#664** (P2)                  | console.\* in db/stripe                   | Only 4 matches remain, all inside JSDoc `@example` comments — not executable logging                                                                                                                                                                                                       |
| **#722** (P2)                  | Env validation at startup                 | `packages/api/src/env.mjs` uses `@t3-oss/env-nextjs` + zod                                                                                                                                                                                                                                 |
| **#753** (P2)                  | Route-based code splitting                | `next/dynamic` used in dashboard pages                                                                                                                                                                                                                                                     |
| **#697**                       | Corrupted doc formatting                  | Fixed by `e290045` / PR #850 (per docs/issue-closure-audit-2026-07-28.md)                                                                                                                                                                                                                  |
| **#683** (P2)                  | Lint/format inconsistency                 | lint-staged + husky active (observed on commit); all packages extend shared `@saasfly/eslint-config`                                                                                                                                                                                       |

---

## 3. Duplicate / Consolidation Map

Close as duplicate → keep canonical. Preserve detail by merging bodies before closing.

| Cluster             | Canonical | Close as dup           | Theme                                                                                      |
| ------------------- | --------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| pnpm in CI          | **#305**  | #744, #670, #595, #584 | npm→pnpm in workflows (only `iterate.yml` remained; see §4)                                |
| Rate limiter Redis  | **#496**  | #480                   | Same fix, already shipped                                                                  |
| Playwright E2E      | **#724**  | #501, #628             | #724 reflects current state (partial coverage); fold #501 journey list into its body first |
| API router tests    | **#631**  | #551, #725             | #631 is the comprehensive scope; tests now exist                                           |
| Observability       | **#580**  | #486                   | Same domain; fold OpenTelemetry detail from #486 into #580                                 |
| .nvmrc              | **#748**  | #720                   | Both stale; file now valid — close both as completed                                       |
| Bundle-size tooling | **#708**  | #729                   | Group analyzer config + regression testing; append #729 scope to #708                      |
| Barrel exports      | **#687**  | #523                   | Group add-missing + tree-shake audit; append #523 scope to #687                            |

---

## 4. Genuinely-Open Work Found

| Issue                                           | Status                                  | Notes                                                                      |
| ----------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#305** (pnpm CI)                              | **Real, fix authored but push-blocked** | `iterate.yml` still ran `npm ci                                            |     | true`(lines 72, 342) with`~/.npm`cache +`package-lock.json`hash key. Fix prepared:`pnpm/action-setup@v6`+`setup-node cache: 'pnpm'`+`pnpm install --frozen-lockfile |     | true`, matching `on-pull.yml`. Verified: YAML valid, typecheck 9/9, lint 9/9, tests 2230/2230. **Push rejected**: GitHub App token lacks `workflows` permission. |
| Feature-level items (#752, #749, #731, #727, …) | Open by design                          | Innovation/DX features; not stale, not repairs — leave for prioritization. |

---

## 5. Label Normalization Plan (ready to execute)

A complete per-issue mapping (category + priority, vocabulary `bug\|enhancement\|feature\|docs\|refactor\|chore\|test\|ci\|security` × `P0..P3`) was generated for all 82 issues and executed to completion locally, but every `gh issue edit` returned `403 Resource not accessible by integration`. The mapping highlights:

- 30+ issues had **no priority label** at all.
- ~10 issues used non-vocabulary labels (`documentation`, bare specialist labels) as their only category.
- ~15 issues carried **two category labels** (e.g. `enhancement` + `security`) violating the exactly-one rule.

Re-run after permissions are granted (script preserved at `/tmp/opencode/normalize-map.tsv` in the runner; table below is the authoritative source):

<details>
<summary>Full mapping (issue → category, priority)</summary>

```
789 enhancement P2      788 test P2        787 test P2        786 security P1
785 bug P2              755 enhancement P2 754 test P2        753 enhancement P2
752 enhancement P3      751 enhancement P2 749 feature P3     748 bug P2
744 ci P3               731 feature P3     729 test P3        728 ci P2
727 feature P3          726 ci P2          725 test P2        724 test P1
723 enhancement P2      722 security P2    721 security P1    720 enhancement P2
719 enhancement P2      713 test P2        708 enhancement P3 706 enhancement P3
705 feature P2          697 docs P2        688 security P2    687 enhancement P3
685 enhancement P2      684 chore P3       683 chore P2       670 ci P3
668 feature P3          667 enhancement P3 666 enhancement P2 664 refactor P2
663 refactor P2         650 ci P3          636 enhancement P2 635 docs P2
634 refactor P2         632 security P1    631 test P1        630 chore P3
628 test P1             613 ci P2          611 enhancement P3 610 refactor P2
609 refactor P2         595 ci P3          590 enhancement P2 584 ci P2
581 test P1             580 enhancement P2 579 enhancement P2 578 refactor P3
551 test P1             550 test P1        549 test P1        523 refactor P3
522 ci P3               521 enhancement P2 515 security P1    503 docs P2
502 ci P2               501 test P1        500 test P1        498 security P1
496 security P0         494 refactor P2    492 enhancement P3 488 ci P2
487 enhancement P2      486 enhancement P2 485 enhancement P2 483 enhancement P2
480 security P1         305 ci P2
```

</details>

---

## 6. Blocked Operations

Root cause: this run executes under the `pull` workflow (`on-pull.yml`), whose `permissions:` block grants `contents: write` and `pull-requests: write` but **not** `issues: write` or `workflows: write`.

| Operation                           | Result                                                               |
| ----------------------------------- | -------------------------------------------------------------------- |
| `gh issue edit` (labels)            | 403 `Resource not accessible by integration` (GraphQL + REST)        |
| `gh issue comment`                  | 403                                                                  |
| `gh issue close`                    | not attempted after confirmed 403 surface                            |
| `git push` of `.github/workflows/*` | rejected: App cannot update workflows without `workflows` permission |
| `git push` of code/docs             | allowed                                                              |
| `gh pr create`                      | allowed (not used for #305 fix — file unpushable)                    |

**Requested remediation** (repo admin):

1. Add `issues: write` to `.github/workflows/on-pull.yml` permissions so autonomous issue hygiene can run.
2. Add `workflows: write` (or route CI-file fixes through a human-reviewed path) so CI consistency fixes like #305 can ship.

---

## 7. Recommended Human Follow-ups

1. Apply §3 closures (duplicates) and bulk-close §2 stale issues, preserving their bodies in the canonical issue before closing.
2. Grant permissions (§6), then re-run label normalization from §5.
3. Land the #305 pnpm fix (diff is 13+/4- against `iterate.yml`; reproducible from §4 description).
