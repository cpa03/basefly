# Issue Manager Audit — 2026-11-26 (loop3)

- **Execution date**: 2026-11-26 (~18:40–19:10 UTC)
- **Active phase**: Phase 0 → **ISSUE MANAGER MODE** (Steps 1–4); Phases 1–3 not activated
- **Default branch**: `main` (detected automatically; `HEAD` = `origin/main` = `6b7a771`)
- **Run context**: autonomous loop invocation (`/ulw-loop`), third run today; prior runs'
  audits are `docs/issue-manager-audit-2026-11-26.md` (PR #1681, `3c107ec`) and
  `docs/issue-manager-audit-2026-11-26-loop2.md` (PR #1682, `6b7a771`)

## Decision summary

Phase 0.1 found **0 open PRs**; Phase 0.2 found **82 open issues** → **ISSUE MANAGER
MODE**; Phases 1–3 not activated.

This run is a **fresh-state confirmation pass with a new shipped-candidate sweep**.
All issue-write probes were re-executed first-hand at `6b7a771` (still 403 — no admin
unblock landed: `on-pull.yml` permissions still declare no `issues: write`, `parallel`
workflow still `disabled_manually`). The Step 1 label delta was re-computed and
reconciled to the prepared 49-row plan (**no drift**). P0 #496 acceptance evidence was
re-verified 6/6 at HEAD. New this run: **seven additional shipped candidates**
(#630, #634, #635, #687, #719, #722, plus weak-evidence #697) identified outside the
prepared plan, and **two new write-probe vectors** (issue title update, issue body
update via REST) — both 403.

**Fail-safe rule application**: `gh issue create` remains 403 (`createIssue`,
re-probed this run), so uncertainty records are filed here — the established in-repo
pattern for this blocker.

## Action log

| Timestamp (UTC) | Action                                                   | Target                                               | Result                                                                                                                                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18:40Z          | Phase 0.1: query open PRs                                | repo                                                 | **0 open** → continue to 0.2                                                                                                                                                                                                                                                                                        |
| 18:40Z          | Phase 0.2: query open issues                             | repo                                                 | **82 open** → **ISSUE MANAGER MODE**; Phases 1–3 stopped                                                                                                                                                                                                                                                            |
| 18:41Z          | Read prior audits                                        | `docs/issue-manager-audit-2026-11-26{,-loop2}.md`    | baseline: prepared-but-blocked, 49-row plan, P0 #496 6/6 shipped, retired-model explore failures                                                                                                                                                                                                                    |
| 18:41Z          | Fetch + drift check                                      | `origin/main`                                        | HEAD `3c107ec` → `6b7a771` (merge of PR #1682, docs-only)                                                                                                                                                                                                                                                           |
| 18:42Z          | **Write probe**: label (GraphQL)                         | `gh issue edit 789 --add-label P2`                   | **403** `addLabelsToLabelable`                                                                                                                                                                                                                                                                                      |
| 18:42Z          | **Write probe**: comment                                 | `gh issue comment 789`                               | **403** `addComment`                                                                                                                                                                                                                                                                                                |
| 18:42Z          | **Write probe**: close (GraphQL)                         | `gh issue close 496 --reason completed`              | **403** `closeIssue`                                                                                                                                                                                                                                                                                                |
| 18:42Z          | **Write probe**: create (fail-safe)                      | `gh issue create --title probe…`                     | **403** `createIssue`                                                                                                                                                                                                                                                                                               |
| 18:47Z          | **New probe**: issue title update                        | `gh issue edit 789 --title …`                        | **403** `updateIssue` — Step 1 title/description standardization also blocked (new vector this run)                                                                                                                                                                                                                 |
| 18:47Z          | **New probe**: issue body update (REST)                  | `PATCH repos/…/issues/789` body                      | **403** — REST body edit blocked (new vector this run)                                                                                                                                                                                                                                                              |
| 18:47Z          | **New probe**: post-creation PR label                    | `gh pr edit 1681 --add-label docs --label P3`        | **✅ OK** — labels `["docs","P3"]` applied to merged PR #1681 (was zero-label) — PR label normalization works post-creation, not just at creation (new finding)                                                                                                                                                     |
| 18:47Z          | Unblock check Option A                                   | `.github/workflows/on-pull.yml:9-14`                 | **not applied** — permissions block = `contents/pull-requests/actions:read/repository-projects/id-token`; still no `issues: write`                                                                                                                                                                                  |
| 18:47Z          | Unblock check Option B                                   | `gh workflow list --all`                             | **not applied** — `parallel` (231322818) still `disabled_manually`                                                                                                                                                                                                                                                  |
| 18:47Z          | Token identification                                     | `GET /repos/cpa03/basefly`                           | permissions all **false** (admin/maintain/pull/push/triage)                                                                                                                                                                                                                                                         |
| 18:43Z          | Step 1 programmatic label audit                          | all 82 open issues → `/tmp/opencode/issues_now.json` | **39 missing-label rows + 10 multi-category-with-priority rows = 49** — reconciles exactly to the prepared plan (11 both-missing, 1 category-only, 27 priority-only, 10 multi-category) — **no drift**                                                                                                              |
| 18:45Z          | Step 4 re-verification at `6b7a771`                      | #496 acceptance evidence                             | **6/6 still present**: `distributed-rate-limiter.ts`, 46/8/50 `it()` across 3 test files, `.env.example:124 REDIS_URL`, `ioredis 5.6.1` (`packages/api/package.json:39`), `docs/redis-setup.md`, `trpc.ts:19` wiring                                                                                                |
| 18:45Z          | Evidence spot-check at `6b7a771`                         | 17/17 sweep rows                                     | re-confirmed: `.nvmrc`=22.14.0, `authorization.ts`, `csrf.ts`, `sensitive-data-logging.test.ts`, `schema.prisma:44` composite index, no `slice(-8)` in `apps/`+`packages/`, `iterate.yml:72`+`:342` `npm ci \|\| true` (pnpm-CI cluster **still open**), 11 e2e specs, workflows = `iterate.yml`+`on-pull.yml` only |
| 18:48Z          | **New: shipped-candidate sweep** (outside prepared plan) | see table below                                      | **6 confirmed + 1 weak** new shipped candidates; #726 confirmed **not** shipped                                                                                                                                                                                                                                     |
| 18:49Z          | Subagent dispatch (explore)                              | `bg_16ebed12` shipped-candidate scan                 | **failed to start** — `ProviderModelNotFoundError: opencode/muse-spark-1.3-contributor-free` (retired model; same failure prior audits documented); scan executed directly instead                                                                                                                                  |
| 18:51Z          | Verification suite                                       | working tree                                         | see Verification suite below                                                                                                                                                                                                                                                                                        |
| 19:05Z          | Record findings + open PR                                | this document                                        | single-branch docs PR (this run's only PR)                                                                                                                                                                                                                                                                          |

**Skills used** (mandatory enumeration of `.opencode/skills/`): `ai-agent-engineer`,
`github-workflow-automation`, `maxritter-claude-codepro-backend-models-standards`,
`modu-ai-moai-adk-moai-tool-opencode`,
`muratcankoylan-agent-skills-for-context-engineering-memory-systems`,
`obra-superpowers-systematic-debugging`, `openx-basefly`, `planning-with-files`,
`proffesor-for-testing-agentic-qe-skill-builder`, `security-research`, `security-review`,
`skill-creator`. **Loaded this run**: `github-workflow-automation` — result: its
permission model matches every fresh probe this run (GITHUB_TOKEN lacks `issues: write`
under every transport — GraphQL and REST both 403 for label/comment/close/create/title/
body), and its single-branch PR flow governs this artifact.

**Subagents**: one dispatch attempted (`explore` — independent shipped-candidate scan,
`bg_16ebed12`); it failed at spawn with `ProviderModelNotFoundError` (model
`muse-spark-1.3-contributor-free` retired — the same failure recorded in the 11-26 00:45
audit). The scan was therefore executed directly with first-hand file/grep evidence
(table below), which is stronger evidence than a subagent summary anyway.

## What is new this run (vs. 00:45 / 09:00 audits)

1. **Two new write-probe vectors, both negative**: issue **title** update
   (`updateIssue` GraphQL) and issue **body** update (REST `PATCH`) — 403. Step 1's
   "standardize title and description" sub-step is therefore blocked by the same
   permission as labeling, now proven rather than assumed.
2. **Post-creation PR labeling works**: `gh pr edit 1681 --add-label docs --label P3`
   succeeded on a merged, zero-label PR (verified labels array afterwards). Combined
   with loop2's PR-label-at-creation finding, **PR label normalization is fully
   unblocked** — only _issue_ writes are gated.
3. **Seven shipped candidates outside the prepared plan** (evidence table below) —
   none of these were in the 49-row plan's shipped annotations.
4. **Drift check at a new HEAD**: `main` advanced `3c107ec` → `6b7a771` (docs-only
   PR #1682). Label delta reconciles to the identical 49-row set; P0 #496 evidence
   re-verified 6/6; all 17 sweep rows re-confirmed.
5. **Unblock status re-checked directly in the repo** (not just via API): Option A
   absent from the committed `on-pull.yml` permissions block; Option B absent from
   live workflow state.

## New shipped candidates (this run's sweep — Step 2/3 evidence additions)

| Issue | Title (trimmed)                                         | Verdict        | Evidence at `6b7a771`                                                                                                                                     |
| ----- | ------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #630  | Enhance pre-commit hooks with typecheck and test        | ✅ SHIPPED     | `.husky/pre-commit` runs `pnpm typecheck`, `pnpm test`, `pnpm check-deps`, `pnpm lint-staged`                                                             |
| #634  | Audit and enforce TypeScript strictness across packages | ✅ SHIPPED     | `tooling/typescript-config/base.json:9` `"strict": true`; all 7 tsconfigs extend base; no override sets `strict: false`                                   |
| #635  | Create developer onboarding guide                       | ✅ SHIPPED     | `docs/ONBOARDING.md` — 233 lines, substantive guide                                                                                                       |
| #687  | Add missing barrel exports (index.ts) across packages   | ✅ SHIPPED     | `index.ts` present in all 6 packages: `api`, `auth`, `common`, `db`, `stripe`, `ui`                                                                       |
| #719  | Missing root-level TypeScript configuration             | ✅ SHIPPED     | root `tsconfig.json` exists, extends `./tooling/typescript-config/base.json`, includes `apps/nextjs` + `packages/*`                                       |
| #722  | Add environment variable validation at startup          | ✅ SHIPPED     | t3-env `createEnv` + zod schemas in `packages/common/src/env.mjs` (and `apps/nextjs/src/env.mjs`)                                                         |
| #697  | Fix corrupted text formatting in documentation files    | ⚠️ weak        | mojibake grep (`Ã`, `â€`) matches **only** self-referential audit files that quote the patterns; product docs clean — candidate, absence-of-evidence only |
| #726  | Add dependency consistency checking to CI               | ❌ NOT shipped | no consistency/lockfile step in `on-pull.yml`/`iterate.yml` (only prose match at `on-pull.yml:379`); `pnpm check-deps` exists locally in pre-commit only  |

No information is lost: every verdict above carries file-level evidence and is
reproducible with the listed path/line.

## Steps 1–4 status (unchanged — prepared-but-blocked)

| Step | State                                    | Blocking capability                            | Artifact                                         |
| ---- | ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| 1    | plan ready (49 rows, **re-reconciled**)  | label + title/body write — 403 (×4 endpoints)  | `docs/issue-manager-audit-2026-11-26.md` §Step 1 |
| 2    | close plan ready (+7 new shipped rows)   | comment + close — 403; keyword-close disproven | same, §Step 2 + this doc's new-candidate table   |
| 3    | consolidation ready                      | issue edit/close — 403                         | same, §Step 3                                    |
| 4    | **no code repair needed**; close blocked | close — 403                                    | same, §Step 4 (6/6 re-verified at `6b7a771`)     |

**Root cause (unchanged, best-supported):** `on-pull.yml` permissions block declares no
`issues: write`; the workflow that did declare it (`iterate.yml`/`parallel`) is
`disabled_manually`; `GITHUB_TOKEN` can never write workflow files, so the repo cannot
self-heal. Residual uncertainty flagged — cannot be proven from inside the repo;
recorded per fail-safe because `gh issue create` is 403.

### Unblock options for a repo admin (unchanged; any one suffices)

1. **Option A (preferred)** — admin human commits `issues: write` (and ideally a note
   about `workflows`) into `.github/workflows/on-pull.yml` permissions block.
2. **Option B** — re-enable the `parallel` workflow (Actions → parallel → Enable).
3. **Option C** — grant the GitHub App installation `issues: write`.

After any option lands: re-probe one low-risk issue (label then close), then execute
the prepared Step 1–3 tables from `docs/issue-manager-audit-2026-11-26.md`, plus the
seven new shipped candidates recorded here.

## Verification suite (this run)

| Command                          | Result                                  |
| -------------------------------- | --------------------------------------- |
| `pnpm install --frozen-lockfile` | EXIT 0                                  |
| `pnpm typecheck`                 | 9/9 turbo tasks, EXIT 0                 |
| `pnpm lint`                      | 9/9 turbo tasks, EXIT 0                 |
| `pnpm format`                    | 10/10 turbo tasks, EXIT 0               |
| `pnpm test`                      | 160 files, **2241/2241 passed**, EXIT 0 |
| `pnpm build`                     | EXIT 0                                  |

(Run on the working tree before PR creation, per merge conditions; this run's diff is
one markdown file.)

## Permission matrix (this token, this run)

| Capability needed by state machine   | Probe                                             | Result                                                    |
| ------------------------------------ | ------------------------------------------------- | --------------------------------------------------------- |
| Read issues / PRs / workflows        | `gh issue list`, `gh pr list`, `gh workflow list` | ✅ OK                                                     |
| Label issue (GraphQL)                | `gh issue edit 789 --add-label P2`                | ❌ 403 `addLabelsToLabelable` (fresh)                     |
| Comment on issue                     | `gh issue comment 789`                            | ❌ 403 `addComment` (fresh)                               |
| Close issue (GraphQL)                | `gh issue close 496 --reason completed`           | ❌ 403 `closeIssue` (fresh)                               |
| Create issue (fail-safe)             | `gh issue create`                                 | ❌ 403 `createIssue` (fresh)                              |
| **Edit issue title**                 | `gh issue edit 789 --title …`                     | ❌ 403 `updateIssue` **(new probe this run)**             |
| **Edit issue body (REST)**           | `PATCH repos/…/issues/789` body                   | ❌ 403 **(new probe this run)**                           |
| Add labels to PR (at creation)       | `gh pr create --label …` (PR #1682, loop2)        | ✅                                                        |
| **Add labels to PR (post-creation)** | `gh pr edit 1681 --add-label docs --label P3`     | ✅ **(new probe this run)** — labels verified in response |
| Push non-workflow branch             | this audit branch                                 | ✅ OK                                                     |
| Create PR                            | `gh pr create`                                    | ✅ (this docs PR)                                         |
| Merge PR (admin)                     | `gh pr merge --admin`                             | ✅ (used prior runs)                                      |

## Final state

**blocked** — Steps 1–4 remain prepared-but-blocked. Fresh this run: six issue-write
probes (label, comment, close, create, title, body) all 403; admin unblock Options A/B
verified still absent by direct file/state inspection; drift check clean (82 issues,
identical 49-row plan, P0 #496 still 6/6 shipped at `6b7a771`); seven new shipped
candidates recorded with file-level evidence; PR-label normalization confirmed working
post-creation. No destructive action taken. The only deliverable that can land under
this token is this audit PR; execution of the prepared normalization/close tables
requires an admin to apply unblock Option A/B/C.
