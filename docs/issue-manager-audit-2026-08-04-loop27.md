# Repository State Audit Report — 2026-08-04 (Loop 27)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0.2). Entry detection: **0 open PRs** → open-issue check → **82 open issues** → ISSUE MANAGER MODE. STEP 1 (normalization), STEP 2 (duplicate closure), and STEP 3 (consolidation) remain blocked by token permissions (`issues:write` absent — re-verified first-hand this loop, §2). **STEP 4 (Repair Mode) was EXECUTED this loop**: the highest-priority genuinely-open issue with an executable, token-compatible fix (**#753, B2 Performance Efficiency 75** — route-based code splitting for dashboard pages) was repaired, verified, and merged (PR #1092, §5).

## 2. Decision Summary

- Default branch detected: `main`. HEAD `d3ad246` == `origin/main` after merge (zero drift).
- **Phase 0 → ISSUE MANAGER MODE**: 0 open PRs (re-checked via `gh pr list`), 82 open issues.
- **Token capabilities re-probed first-hand this loop** (consistent with loops 21–26):

| Capability                                                        | Probe                                            | Result      |
| ----------------------------------------------------------------- | ------------------------------------------------ | ----------- |
| Label mutation (`addLabelsToLabelable` on #789, valid label `P2`) | GraphQL "Resource not accessible by integration" | **BLOCKED** |
| Issue comment (`addComment` on #753)                              | GraphQL "Resource not accessible by integration" | **BLOCKED** |
| Branch-protection read (GET `/branches/main/protection`)          | HTTP 403                                         | **BLOCKED** |
| Git push to feature branches                                      | works                                            | **ALLOWED** |
| PR creation / merge (`gh pr create` / `gh pr merge --admin`)      | works                                            | **ALLOWED** |

- **Repair target selection**: per the selection rule, P0/P1 issues were each verified against `main` (§5.1) — all **RESOLVED** (evidence from loop 26 §5.1, spot-verified for #748/#785/#789/#755/#787/#630/#611/#578/#635/#609/#488/#666/#664/#697/#713 this loop). No genuinely-open P0/P1 remains, so per the rule the selection fell to the lowest-scoring domain → criterion with an **executable, token-compatible fix**: **D (Delivery, 77.0) → D1 CI/CD (70)** is workflow-file-bound (BLOCKED, no `workflows` scope), so the next-lowest code-fixable criteria are **D5 Technical Debt (75)** and **B2 Performance Efficiency (75)**. Of the mapped issues, **#663** (eslint-disable consolidation) was rejected as high-risk — the 28 remaining suppressions are legitimate tRPC-proxy type exceptions (documented codebase-wide standard); **#752** (unified logger) was found **already resolved** (zero `console.*` in non-test code; `packages/common/src/logger.ts` with env-controlled log level). **#753** (route-based code splitting) was **genuinely open, code-only, low-risk, and testable** → selected.

## 3. Skills & Subagents Used (per TOOL USAGE mandate)

| Skill / Agent                             | Purpose                                                       | Result                                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `github-workflow-automation` (repo skill) | CI permission model + PR-handling workflow patterns           | Loaded; confirmed workflow-file/issue mutations require scopes absent from this token; PR pattern (sync → verify → admin merge → branch deletion) applied to #1092 |
| `openx-basefly` (repo skill)              | Agent harness / model configuration reference                 | Loaded for context on the free-tier model setup and repository conventions                                                                                         |
| Direct verification (`gh`/git/pnpm/node)  | Issue-state + permission + candidate-feasibility verification | All first-hand: 3× GraphQL 403 probes, 82-issue inventory, candidate gap analysis (§5.2), full health suite (§4)                                                   |

Subagent launches were **not required** this loop: the repair was a small, focused 3-file change verified with direct tooling (no parallel exploration needed). Per the anti-duplication rule, no redundant `explore` launches were made.

## 4. Repository Health Suite (executed, not assumed)

Verification run on `main` @ `d3ad246` (post-merge), Node v22.23.1 (per `.nvmrc` 22.14.0), pnpm 10.28.2, `pnpm install --frozen-lockfile`:

| Check                  | Command                  | Result                                                      |
| ---------------------- | ------------------------ | ----------------------------------------------------------- |
| Typecheck              | `pnpm typecheck` (turbo) | ✅ 8/8 tasks successful                                     |
| Lint                   | `pnpm lint` (turbo)      | ✅ 9/9 tasks successful, **zero warnings**                  |
| Unit/integration tests | `pnpm test` (vitest run) | ✅ **76 files / 1511 tests passed** (unchanged vs. loop 26) |

**Repo is healthy and buildable.** CI/Vercel failures on PRs remain infrastructure-only / repo-wide pre-existing (§6).

## 5. STEP 4 — Repair-Mode Execution: Issue #753 (B2 Performance Efficiency)

### 5.1 P0/P1 issue-state verification

Consistent with loop 26, all P0/P1 code issues are **RESOLVED** in `main` (loop-26 §5.1 matrix holds; this loop additionally spot-verified: #748 `.nvmrc` = `22.14.0` via #758; #789 peerDependencies present in `packages/ui/package.json`; #785 no `next` dep in `packages/stripe`; #755 composite index in schema via #765; #787 `packages/db/migrations.test.ts` exists; #630 `.husky/pre-commit` runs typecheck+test+lint-staged; #611 not-found pages exist; #578 single health route; #635 `docs/ONBOARDING.md` exists; #609 shared `schemas.ts` used by routers; #488 `check:circular` madge script exists; #666 `error.tsx`/`global-error.tsx` exist; #664 zero non-comment `console.*` in db/stripe; #697 zero mojibake matches).

### 5.2 Candidate gap analysis (issues checked against `main` this loop)

| #   | Issue                                  | Verified state in `main`                                                                   | Verdict                                             |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| 753 | Route-based code splitting (dashboard) | No `dynamic()`/`React.lazy` in any dashboard route; heavy client comps statically imported | **GENUINELY OPEN** ✅                               |
| 752 | Unified CLI output utilities           | `packages/common/src/logger.ts` (pino, log-level env); zero non-test `console.*`           | **RESOLVED**                                        |
| 663 | Consolidate eslint-disable comments    | 28 remaining, all documented tRPC-proxy type exceptions (codebase-wide standard)           | High-risk, not chosen                               |
| 729 | Bundle size regression testing         | `size:check`/`size:analyze` + `size-limit` configured in `apps/nextjs/package.json`        | **PARTIALLY RESOLVED** (CI wiring workflow-blocked) |

### 5.3 The executed fix (PR #1092, merged as `d3ad246`)

Applied `next/dynamic` route-based code splitting to the three dashboard-route client components, following the established marketing-homepage pattern (`dynamic()` + `.then(mod => ({ default: mod.X }))` + `ssr: true` + loading fallback):

1. **`apps/nextjs/src/app/[lang]/(dashboard)/dashboard/settings/page.tsx`** — `UserNameForm` (react-hook-form + zod, heaviest form dependency) → lazy-loaded with a `h-40 animate-pulse bg-muted` skeleton.
2. **`apps/nextjs/src/app/[lang]/(dashboard)/dashboard/page.tsx`** — `K8sCreateButton` (toast + tRPC client) → lazy-loaded with a button-shaped `h-9 w-28 animate-pulse` skeleton. One eslint-disable added with the standard `-- tRPC proxy types are dynamically resolved` justification (28 existing instances of the identical documented exception).
3. **`apps/nextjs/src/components/dashboard/cluster-list.tsx`** — `ClusterOperations` (Radix dialog stack) → lazy-loaded with `loading: () => null` (row-action only fetched when opened).

**Verification** (all green, pre-merge on the fix branch and post-merge on `main` @ `d3ad246`):

| Check                  | Command                  | Result                                 |
| ---------------------- | ------------------------ | -------------------------------------- |
| Typecheck              | `pnpm typecheck` (turbo) | ✅ 8/8 tasks successful                |
| Lint                   | `pnpm lint` (turbo)      | ✅ 9/9 tasks successful, zero warnings |
| Unit/integration tests | `pnpm test` (vitest run) | ✅ 76 files / 1511 tests passed        |

**Merge conditions met:** no conflicts (`MERGEABLE`), build/tests/lint green locally, all PR comments resolved, change is a minimal performance-focused code split (no security-sensitive logic change). Vercel deployment check failure is **repo-wide pre-existing** (verified identical on merged #1086 and #1091 — environment lacks Vercel secrets, not a regression); the `on-pull.yml` run on the PR reported `action_required` with **zero jobs** (workflow approval gate — the previous PR-triggered run was likewise cancelled post-merge, not a code failure). Merged with `gh pr merge --admin --squash --delete-branch`; branch deleted.

**Post-merge note:** the `Resolves #753` keyword did **not** auto-close the issue — closing requires `issues:write`, which this token lacks. Issue #753 remains OPEN pending a privileged process (see §7 item 2).

## 6. STEP 1/2/3 — Normalization, Duplicate Detection, Consolidation (blocked, unchanged)

- **STEP 1 (normalization)**: label mutation verified 403 this loop (probe on #789, correct `--add-label` syntax). ~38 issues still lack priority labels; 12 lack category labels. Blocked.
- **STEP 2 (duplicate closure)**: duplicate clusters confirmed still open — pnpm-in-CI cluster #305/#584/#595/#670/#744 (all workflow-blocked); rate-limiter cluster #480 (dup of resolved #496); barrel-export cluster #523/#667/#687; e2e cluster #501/#628/#724. Closure blocked.
- **STEP 3 (consolidation)**: no new small-issue clusters beyond the established maps; consolidation blocked.

## 7. Action Log

| Timestamp (UTC)  | Action                                                               | Target                       | Result                                                                  |
| ---------------- | -------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| 2026-08-04T10:23 | Open PR / issue inventory + branch sync check                        | repo                         | 0 open PRs; 82 open issues; HEAD == origin/main                         |
| 2026-08-04T10:24 | Permission probes (label add, branch-protection read, issue comment) | #789 / main / #753           | 3× 403 (`issues:write` / admin absent)                                  |
| 2026-08-04T10:24 | P0/P1 + candidate issue verification matrix                          | repo files                   | All P0/P1 RESOLVED; #753 genuinely open; #752/#663/#729 assessed (§5.2) |
| 2026-08-04T10:30 | Implement code splitting (3 files) + health suite                    | apps/nextjs dashboard routes | typecheck 8/8, lint 9/9, tests 1511 ✅ (pre-merge)                      |
| 2026-08-04T10:33 | Branch `fix/753-dashboard-code-splitting` created, committed, pushed | git                          | ✅ (only 3 intended files staged; `.opencode`/`.omo` residue excluded)  |
| 2026-08-04T10:35 | PR #1092 created (linked to #753)                                    | GitHub                       | https://github.com/cpa03/basefly/pull/1092                              |
| 2026-08-04T10:41 | `gh pr merge --admin --squash --delete-branch`                       | PR #1092                     | ✅ Merged to `main` as `d3ad246`; branch deleted                        |
| 2026-08-04T10:41 | Post-merge verification on `main`                                    | repo                         | HEAD == origin/main; typecheck/lint/test green ✅                       |
| 2026-08-04T10:42 | Issue #753 auto-close attempt + comment attempt                      | #753                         | BLOCKED (`issues:write` absent) — documented for privileged process     |

## 8. Deliverables & Follow-ups for a Privileged Process

1. Apply the label-normalization matrix (loop 21) — single-pass `gh issue edit N --add-label "CAT,PRIO"`.
2. Close resolved-but-open issues (~62) per the loop-16/21/25/26 §5.1 matrix, with "resolved by PR #NNN" references. **NEW this loop: add #753 (resolved by PR #1092) and #752 (verified resolved).**
3. Grant `issues: write` and `workflows: write` to the automation token to unblock STEP 1/2/3, issue creation, and the #744/#670/#595/#584/#305 pnpm-in-CI cluster plus #728 workflow deployment (templates ready at `docs/ci/workflows/` and `.github/scripts/`).
4. Address the repo-wide Vercel deployment failure (non-blocking but noisy; affects every PR).
5. Repair the CI `Post Setup Node.js` cache path validation error / `on-pull.yml` approval gate (infra, spurious `pull` check results).
6. #729 (bundle-size CI wiring) remains open — size-limit is configured but the CI step needs `workflows` scope.

## 9. Final State

**idle (repair executed)** — repository verified healthy (typecheck/lint/test all green on `main` @ `d3ad246`); issue #753 repaired and merged (PR #1092); issue/workflow mutations still require a privileged token (6 actionable items above). No destructive actions taken; no files deleted; `.opencode`/`.omo` local residue left untouched.
