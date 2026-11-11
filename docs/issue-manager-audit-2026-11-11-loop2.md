# Issue Manager Audit — 2026-11-11 (loop 2)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0, Step 0.2) — 0 open pull requests at entry, 82 open issues.

Phase 1/2/3 not run (strict phase ordering).

## Decision Summary

1. Entry: `gh pr list --state open` → `[]`; `gh issue list --state open` → **82 issues** → ISSUE MANAGER MODE.
2. This is the **second run on 2026-11-11**. The first run's audit (`docs/issue-manager-audit-2026-11-11.md`, merged as PR #1643 at 08:44Z) already established the permission blocker and a full prepared plan. This run's mandate: **re-verify independently, add delta findings only, do not duplicate**.
3. Every issue-mutation vector re-probed first-hand this run (23:17–23:19Z): `add-label`, `add-comment`, `create-issue` → all **HTTP 403** `Resource not accessible by integration` (GraphQL and REST). Unchanged from the 08:44 run.
4. Root cause re-confirmed on `main @ 6d66acf`: `.github/workflows/on-pull.yml` `permissions:` block still has **no `issues:` grant** (lines 9–14). Token identity: `github-actions[bot]` via `GITHUB_TOKEN`.
5. **Repair Mode (Step 4)**: selected P0 **#496**; re-verified fully shipped first-hand (distributed rate limiter wired into `trpc.ts`, ioredis present, tests exist). Full P0/P1 tier re-swept — all shipped. No legitimate, non-speculative code change exists. Closure blocked by §Permission matrix.
6. **Delta over prior same-day audit — 4 newly verified stale issues** (prior run did not check these):
   - **#755** — proposed index `[authUserId, plan, stripeCurrentPeriodEnd]` already exists at `schema.prisma:44` (plus 4 sibling Customer indexes).
   - **#754** — `packages/stripe/src/webhook-idempotency.test.ts` exists and covers every scenario the issue requires (duplicate detection, first-time processing, error handling, race conditions, cleanup).
   - **#697** — `docs/DX-engineer.md` has no corruption markers, no BOM, no duplicate section headers; non-audit docs scan clean.
   - **#721** — `requireRole` / `createRoleBasedProcedure` wired in `trpc.ts:349–423`; `adminProcedure` uses role checks (shipped with #498).
7. Full local verification suite green (§Verification) on `main @ 6d66acf`.
8. Everything shippable this cycle ships as this document via one PR, one branch, synced to `main` first. No issues were mutated (API denied); no speculative code changes.

## Permission matrix (re-probed this run, 23:17–23:19Z)

| Operation                              | Result                                          |
| -------------------------------------- | ----------------------------------------------- |
| `gh issue edit 789 --add-label P2`     | ❌ 403 `addLabelsToLabelable`                   |
| `gh issue comment 789 --body …`        | ❌ 403 `addComment`                             |
| REST `PATCH /issues/789` (labels)      | ❌ 403 `Resource not accessible by integration` |
| REST `POST /issues/789/comments`       | ❌ 403                                          |
| REST `PATCH /issues/613` (close)       | ❌ 403                                          |
| `gh issue create`                      | ❌ 403 `createIssue`                            |
| `git push --dry-run` (ordinary branch) | ✅ allowed                                      |
| `gh pr create` / `gh pr merge --admin` | ✅ allowed (per prior runs #1640–#1643)         |

Because the token cannot open issues, this document is the fail-safe record of the blocker (contract fail-safe path unavailable).

## Prepared plans (NOT APPLIED — blocked)

The complete, still-valid prepared plans live in `docs/issue-manager-audit-2026-11-11.md` §3–§4:

- **§3** label normalization: 11 missing categories, 38 missing priorities, 13 multi-category (observation only).
- **§4** duplicate/consolidation clusters: rate-limiter (#480→#496), pnpm-CI (#584/#595/#670/#744→#305), .nvmrc (#720+#748 close), E2E (#628/#724→#501), API tests (#725→#631), testing umbrella (#581 close as completed), plus #613/#578 stale closes.

This run re-confirmed those clusters against live data (82 open, same set) and adds to the stale-close list:

| Issue     | Verdict            | First-hand evidence (this run, `main @ 6d66acf`)                                                                              |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **#755**  | stale → close      | `packages/db/prisma/schema.prisma:44` = `@@index([authUserId, plan, stripeCurrentPeriodEnd])` — the issue's own example index |
| **#754**  | stale → close      | `packages/stripe/src/webhook-idempotency.test.ts` — 20+ cases incl. `race conditions`, duplicate skip, error propagation      |
| **#697**  | stale → close      | `docs/DX-engineer.md` clean (no BOM/mojibake, unique `##` headers); non-audit `docs/*.md` scan clean                          |
| **#721**  | stale → close      | `trpc.ts:349 requireRole`, `trpc.ts:422 createRoleBasedProcedure`, `adminProcedure` wired (ships with #498)                   |
| #789      | stale (re-confirm) | `packages/ui/package.json` → `peerDependencies: { next, react, react-dom }`, react absent from `dependencies`                 |
| #786      | stale (re-confirm) | webhook route comment at line 162 explicitly avoids logging secret material; no partial-secret log calls                      |
| #720/#748 | stale (re-confirm) | `.nvmrc` = `22.14.0`                                                                                                          |
| #613      | stale (re-confirm) | `.github/workflows/` = `{iterate.yml, on-pull.yml}` only                                                                      |
| #684      | stale (re-confirm) | root `package.json` `build` script present                                                                                    |
| #719      | stale (re-confirm) | root `tsconfig.json` exists                                                                                                   |
| #755 note | related still-open | #305 remains genuinely open (`iterate.yml:72,342` = `npm ci \|\| true`) but workflow-file-gated                               |

## Repair Mode (Step 4)

- **Selection**: P0 present → **#496** `[P0][Security] Replace in-memory rate limiter with distributed store (Redis)`.
- **Verification this run**: `packages/api/src/trpc.ts` imports `getLimiter` from `./distributed-rate-limiter` (not the in-memory module); `ioredis@5.6.1` in `packages/api/package.json`; `REDIS_URL` documented in `.env.example`; `distributed-rate-limiter-sync.test.ts` present.
- **Decision**: fully shipped → no minimal atomic change is legitimate; authoring one would be speculative (forbidden). Closure blocked (403).
- **P0/P1 tier sweep**: #496, #498, #515, #550, #551, #549, #501, #500, #581, #480 — all verified shipped in the 08:44 audit §6.3; this run re-confirmed #496 and #721-class authorization wiring first-hand. No repair PR is legitimate this cycle.
- **Next actionable tier** (P2) is either stale (closed above), workflow-file-gated (#305, #728 — push of `.github/workflows/*` rejected without `workflows` permission), or out of repair-mode scope (repair selects P0/P1 while any exist).

## Verification (this run, `main @ 6d66acf`)

```
23:24:53Z  pnpm install --frozen-lockfile  → OK (7.4s)
           pnpm typecheck                  → 9/9 successful
           pnpm lint                       → 9/9 successful
23:26:06Z  pnpm test                       → 160 files, 2241/2241 passed
23:27:30Z  pnpm build                      → exit 0
```

Engine note: local Node `v20.20.2` vs `engines.node >= 22` (pnpm WARN) — runner mismatch, all commands exited 0. Prior run observed identical warning.

## Skills used

| Skill                                                | Purpose                                                  | Result                                                                                                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github-workflow-automation`                         | GitHub Actions permission model, PR/merge automation     | Confirmed `permissions:` block semantics and required `issues: write` / `workflows: write` grants; validated single-branch PR + `--admin` merge pattern under contract conditions |
| Skills inventoried in `.opencode/skills` (read-only) | Selection pass (`openx-basefly`, `ai-agent-engineer`, …) | No code-fix skill applicable this cycle (no legitimate repair); documentation/CI skill used above                                                                                 |

## Subagents used

**None.** Rationale: this cycle is a strictly sequential permission-gated verify-and-document run. All mutation vectors are denied; analysis is deterministic local probing (`gh` + `python3` + direct file reads). Parallel delegation would duplicate the same blocked probes. Prior run reached the same conclusion independently.

## Action log

| Timestamp (UTC) | Action                                                                                                                                                                                                               | Target              | Result                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| 23:17           | `gh pr list --state open`                                                                                                                                                                                            | repository          | `[]` → not PR Handler Mode                                        |
| 23:17           | `gh issue list --state open` (82 issues, full JSON incl. bodies)                                                                                                                                                     | repository          | **ISSUE MANAGER MODE**                                            |
| 23:17           | `gh label list` + label-gap computation (12 missing cat / 38 missing prio / 13 multi-cat)                                                                                                                            | live issue data     | plan computed                                                     |
| 23:17–23:18     | Label normalization batch (`gh issue edit --add/--remove-label`)                                                                                                                                                     | 50+ issues          | ❌ all 403 `Resource not accessible by integration`               |
| 23:19           | Probe comment / REST close / REST label / `gh issue create`                                                                                                                                                          | #789, #613, repo    | ❌ all 403; `git push --dry-run` ✅; permissions API `push:false` |
| 23:19–23:21     | First-hand staleness reads (.nvmrc, root build, tsconfig, workflows, stripe package.json, rate limiter wiring, e2e specs, peerDeps, webhook logging, schema indexes, DX-engineer.md, idempotency tests, requireRole) | `main` working tree | prior §5 re-confirmed + **#755/#754/#697/#721 delta**             |
| 23:21           | Read prior same-day audit `docs/issue-manager-audit-2026-11-11.md`                                                                                                                                                   | prior plan          | avoided duplication; adopted §3–§4 as canonical prepared plan     |
| 23:24–23:27     | `pnpm install` → `typecheck` → `lint` → `test` → `build`                                                                                                                                                             | workspace           | all green (§Verification)                                         |
| 23:28           | Load skill `github-workflow-automation`                                                                                                                                                                              | skill               | permission/merge patterns confirmed                               |
| 23:30           | Write this audit; branch `docs/issue-manager-audit-2026-11-11-loop2` off `origin/main`; push; open PR (labels `docs`, `P3`)                                                                                          | this document       | single branch, synced to default branch first                     |

## Final state

**blocked** — 7th consecutive day (prior: 6th).

Single highest-leverage fix for the repo owner (unchanged, still unapplied):

```yaml
# .github/workflows/on-pull.yml → permissions:
issues: write # unblocks labels, comments, closes, creates (entire prepared plan)
workflows: write # optional: lets the bot ship workflow-file fixes (#305, #728) itself
```

Also still open for a human: re-enable `iterate.yml` (`state: disabled_manually`) if dispatch is preferred over `on-pull.yml`.

This cycle shipped: independent re-verification, 4 new stale findings (#755, #754, #697, #721), a fresh green verification suite, and this log — via one PR. No issues were mutated (API denied) and no speculative code changes were made.
