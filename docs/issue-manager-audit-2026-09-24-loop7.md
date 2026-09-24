# Issue Manager Audit — 2026-09-24 (loop7)

## Active Phase

**ISSUE MANAGER MODE** (Phase 0 → Step 0.2), Steps 1–3 documented-but-blocked, **Step 4 Repair executed**.

## Decision Summary

| Check             | Result                                                       |
| ----------------- | ------------------------------------------------------------ |
| Open PRs (0.1)    | **0** → not PR Handler Mode                                  |
| Open issues (0.2) | **82** → **ISSUE MANAGER MODE**                              |
| DEFAULT_BRANCH    | `main` (detected via `gh api repos/cpa03/basefly`)           |
| Issue mutations   | **403 all** (labels / comments / close) → Steps 1–3 blocked  |
| Step 4 selection  | **#697** (P2, docs) — highest-priority verified residual gap |
| Repair            | **PR #1505** — README Docker-section fence corruption fixed  |

## Permission Probes (this session)

| Probe                         | Result                                         |
| ----------------------------- | ---------------------------------------------- |
| `gh issue edit --add-label`   | **403** `addLabelsToLabelable`                 |
| `gh issue comment`            | **403** `addComment`                           |
| `gh issue close` (no comment) | **403** `closeIssue`                           |
| `git push` (docs/code branch) | **OK**                                         |
| `gh pr create` + PR labels    | **OK** (`docs`, `P2` applied to PR #1505)      |
| Workflow-file push            | not attempted (unchanged from loop6: rejected) |

Token: `github-actions[bot]` GITHUB_TOKEN from `on-pull.yml` (`permissions: {contents: write, pull-requests: write}` — **no `issues: write`**). Per FAIL-SAFE, blocked actions were documented, not guessed.

## Steps 1–3 — Prepared, Not Executed (blocked by 403)

### Step 1 — Label normalization (37 missing priority, 12 missing category)

**Missing category (12):** #755, #754, #753, #752, #751, #749, #748, #744, #697, #635, #670, #595
(only specialist labels such as `DX-engineer` / `platform-engineer`, or invalid `documentation` on #635).

Proposed category: #744, #670, #595 → `ci` · #697, #635 → `docs` · #754 → `test` · #753 → `enhancement` · #751, #755 → `chore`/`enhancement` · #752, #748, #749 → `enhancement`.

**Missing priority (37):** #789, #788, #787, #786, #785, #755, #754, #753, #752, #751, #749, #748, #744, #731, #729, #728, #727, #726, #725, #724, #723, #722, #721, #720, #719, #713, #697, #668, #636, #635, #634, #632, #631, #630, #628, #595, #305.

Proposed priorities (best judgment): **P1** — #786, #728, #722, #721, #632 · **P2** — #788, #787, #754, #753, #751, #744, #725, #724, #723, #713, #697, #634, #631, #628, #595, #305 · **P3** — #789, #785, #755, #752, #749, #748, #731, #729, #727, #726, #720, #719, #668, #636, #635, #630.

**Multiple category labels (8):** #713, #584, #522, #581, #551, #550, #549, #305 — each carries 2–3 of `enhancement|test|ci|refactor`. System requires exactly one; recommend keeping the most specific (`test`/`ci`/`refactor`) and dropping `enhancement`.

### Step 2 — Duplicate clusters (canonical → close-as-duplicate)

| Cluster                  | Canonical                      | Duplicates / overlaps                    |
| ------------------------ | ------------------------------ | ---------------------------------------- |
| Redis rate limiter       | #496 (P0)                      | #480 (P1) — verified same implementation |
| pnpm vs npm in workflows | #305                           | #584, #595, #670, #744                   |
| `.nvmrc` (both resolved) | #748 (value `22.14.0` in tree) | #720 (file exists → "missing" obsolete)  |
| E2E / Playwright         | #501                           | #628, #724 (overlap)                     |
| API-docs generation      | #731                           | #749 (overlap)                           |
| Barrel exports           | #687                           | #523 (overlap)                           |

### Step 3 — Consolidation candidates

- Testing family (#500/#501/#549/#550/#551) already grouped under #581 — keep.
- pnpm cluster (4 issues) → fold into #305 with a single scope statement.
- `.nvmrc` pair (#720/#748) → both obsolete: `.nvmrc` = `22.14.0` in tree.

## Step 4 — Repair

### P0/P1 verification matrix (spot-re-checked on current `main`, `8d63a10`)

| Issue                    | Priority | Verdict                    | Evidence (this session)                                                   |
| ------------------------ | -------- | -------------------------- | ------------------------------------------------------------------------- |
| #496 Redis rate limiter  | P0       | Complete                   | `distributed-rate-limiter.ts`; `checkAsync` `trpc.ts:439`                 |
| #480 (dup of #496)       | P1       | Complete (duplicate)       | same implementation                                                       |
| #498 role-based RBAC     | P1       | Complete                   | `requireRole` `trpc.ts:349`, `createRoleBasedProcedure:416`               |
| #515 CSRF protection     | P1       | Complete (PR #1503 merged) | `csrfProtection` `trpc.ts:104`; `docs/api-spec.md:80`                     |
| #501 Playwright E2E CI   | P1       | **Blocked**                | 11 specs in `tests/e2e/`; no workflow runs e2e — needs `workflows: write` |
| #549/#550/#551/#500/#581 | P1       | Complete                   | confirmed in loop6; `main` unchanged since                                |

**Selection:** all P0/P1 issues are either complete (closure blocked by 403) or blocked on `workflows` permission (#501). Highest-priority issue with a **verifiable residual gap** = **#697** (`docs`, P2 per prior audits: "Fix corrupted text formatting in documentation files").

### Residual gap found

`README.md` Docker Deployment section (was lines 187–201):

- Stray 4-backtick fences at old lines 196 and 201 wrapped the entire "2. Start the development environment" step (incl. its ` ```bash ` block) in one literal code block → rendered as raw text.
- Orphaned shell comments (`# Configure required environment variables (Clerk, Stripe, etc.)`, `# Note: Database is handled by docker-compose`) sat outside any fence → rendered as literal markdown paragraphs.

Prior audits (#697 in `docs/issue-audit-2026-07-25.md` etc.) reported #697 resolved, but this corruption was still present on `main` — **regression or incomplete earlier fix**.

### Fix (branch `fix/readme-docker-fences-697`, commit `04ab1e6`)

- Moved both shell comments inside the ` ```bash ` block.
- Removed both stray 4-backtick fences; step 2 got a proper ` ```bash ` block.
- Normalized fence indentation to match the README Setup section.

### Verification

| Check                        | Result                                                   |
| ---------------------------- | -------------------------------------------------------- |
| `prettier --check README.md` | clean                                                    |
| `pnpm build`                 | exit 0                                                   |
| `pnpm lint`                  | 9/9 tasks, **0 warnings**                                |
| `pnpm test`                  | **2166/2166 pass** (148 files)                           |
| Fence-balance scan           | `README*.md` + `docs/*.md` — **338 files, all balanced** |
| Sync with `main`             | `git merge origin/main` → already up to date             |

### Delivery

- **PR #1505** — `docs: fix corrupted code fences in README Docker deployment section (#697)` · labels `docs`, `P2` · `Closes #697` · `mergeable: MERGEABLE`.
- Checks at creation: `pull` workflow → `action_required` (needs maintainer approval, same as PR #1503); Vercel preview deploying (historically fails repo-wide as environmental).
- Not merged this loop: Issue Manager Mode active (PR Handler Mode will pick it up next cycle).

## Additional Findings (cannot file issues — 403)

1. **Junk tracked file** `'node_modules/.cache/.prettiercache'` — literal quotes in the path (directory named `'node_modules`, file `.prettiercache'`), 164 bytes, unreferenced anywhere, last touched by merge `6af9d3f`. A prettier cache should never be tracked. **Recommend**: `chore` PR to `git rm` it (rationale: cache artifact, zero references, safe deletion).
2. **Subagent model alias broken** — `.opencode` explore agent model `opencode/gpt-5-nano` not found (error suggests `gpt-5-nano`). Same failure as loops 5/6. **Recommend**: update agent model IDs to available aliases.

## Skills & Subagents Used

- **Skill `openx-basefly`** (loaded) — project conventions, agent/model map; confirmed the broken `gpt-5-nano` alias against the failure above.
- **Skills inventory inspected** in `.opencode/skills` (13): `github-workflow-automation` (workflow/permission model), `obra-superpowers-systematic-debugging` (root-caused 403s to `permissions:` block), `commit-message` (conventional commit style for `04ab1e6`), `planning`, others — not additionally loaded as work was docs-only + permission-blocked.
- **Subagent**: `explore` (task `bg_5423bb3b`, independent markdown-integrity verification) — **FAILED to start**: `ProviderModelNotFoundError: Model not found: opencode/gpt-5-nano`. Verification completed directly by orchestrator instead (338-file fence-balance scan above). No other subagents applicable.

## Action Log

| Timestamp (UTC)  | Action                              | Target                                 | Result                                                                              |
| ---------------- | ----------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-09-24 23:38 | Phase 0: list open PRs              | `gh pr list`                           | 0 open → not PR Handler Mode                                                        |
| 2026-09-24 23:38 | Phase 0: list open issues           | `gh issue list`                        | 82 open → **ISSUE MANAGER MODE**                                                    |
| 2026-09-24 23:39 | Probe: add label                    | #789 `+P3`                             | **403**                                                                             |
| 2026-09-24 23:39 | Probe: issue comment                | #789                                   | **403**                                                                             |
| 2026-09-24 23:40 | Probe: close duplicate              | #480 → dup of #496                     | **403**                                                                             |
| 2026-09-24 23:41 | Verify candidate issues in tree     | #785, #786, #789, #748                 | all resolved (no `next` dup; peerDeps present; `.nvmrc`=22.14.0; no secret slicing) |
| 2026-09-24 23:41 | Verify P2 candidates                | #613, #664, #578                       | all resolved (2 workflows; console.\* only in JSDoc; single health route)           |
| 2026-09-24 23:42 | Steps 1–3: derive label tables      | 82 issues                              | 37 missing P, 12 missing category, 8 multi-cat                                      |
| 2026-09-24 23:42 | Step 4: P0/P1 spot-check matrix     | #496/#498/#501/#515/#550               | complete except #501 (blocked)                                                      |
| 2026-09-24 23:42 | Step 4: corruption found            | `README.md:187–201`                    | stray 4-tick fences + orphaned comments (#697)                                      |
| 2026-09-24 23:42 | Branch + install                    | `fix/readme-docker-fences-697`         | created from `origin/main`; `pnpm install` OK                                       |
| 2026-09-24 23:43 | Apply fix                           | `README.md`                            | fences normalized, comments moved into bash block                                   |
| 2026-09-24 23:44 | Verify                              | prettier / build / lint / test         | clean / 0 / 0 warnings / **2166 pass**                                              |
| 2026-09-24 23:45 | Commit + sync                       | `04ab1e6`                              | merged `origin/main` → already up to date                                           |
| 2026-09-24 23:45 | Push                                | `fix/readme-docker-fences-697`         | OK                                                                                  |
| 2026-09-24 23:46 | Create PR                           | **PR #1505**                           | OPEN, labels `docs`+`P2`, `Closes #697`                                             |
| 2026-09-24 23:47 | Independent fence scan (direct)     | 338 md files                           | all clean                                                                           |
| 2026-09-24 23:47 | Subagent `explore` for verification | `bg_5423bb3b`                          | **FAILED** `gpt-5-nano` not found                                                   |
| 2026-09-24 23:48 | Track-file hygiene check            | `'node_modules/.cache/.prettiercache'` | confirmed tracked junk; documented (finding #1)                                     |
| 2026-09-24 23:49 | Write audit log                     | this file                              | committed on `docs/issue-manager-audit-2026-09-24-loop7`                            |

## Final State

**waiting for human review**

1. **PR #1505** — README fence fix for #697; approve `action_required` check, then merge (next loop's PR Handler Mode will handle if not merged sooner).
2. **Grant `issues: write`** to the workflow token → unblocks Steps 1–3 (37 priority labels, 12 category labels, dedup closes per tables above) and closure of verified-complete issues (#496, #480, #498, #515, #500, #549, #550, #551, #785, #786, #789, #748, #613, #664, #578, #697 after merge).
3. **Grant `workflows: write`** → unblocks #501 E2E CI integration (only remaining P1 gap).
4. **Fix agent model alias** `opencode/gpt-5-nano` → available alias → unblocks explore/librarian subagents (failed in loops 5, 6, 7).
5. **Repo hygiene**: delete tracked junk `'node_modules/.cache/.prettiercache'` (finding above; cannot file an issue while `issues: write` is missing).
