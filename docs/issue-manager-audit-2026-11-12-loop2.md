# Issue Manager Audit — 2026-11-12 (loop 2)

**Evaluation date**: 2026-11-12
**Execution context**: GitHub Actions `github-actions[bot]` (GITHUB_TOKEN), triggered under `.github/workflows/on-pull.yml`
**Category**: docs | **Priority**: P3

---

## 1. Active Phase & Decision Summary

| Order | Phase                                   | Why it ran                                                                                         | Outcome                                                                                            |
| ----- | --------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1     | Phase 0 → **PR HANDLER MODE**           | 1 open PR (#1646) at entry                                                                         | PR #1646 verified + merged                                                                         |
| 2     | Phase 0 re-run → **ISSUE MANAGER MODE** | 0 open PRs after merge; 82 open issues                                                             | Steps 1–3 hard-blocked (403); Step 4: P0 #496 verified fully shipped; repair-closure blocked (403) |
| 3     | Fail-safe stop                          | Issue mutations impossible; workflow self-fix impossible (`workflows` permission missing on token) | Final state: **blocked (needs human)**                                                             |

Phase 1 (audit), Phase 2 (hardening), Phase 3 (expansion) were NOT activated — a phase
transition requires the active phase to fully complete first, and ISSUE MANAGER MODE is
blocked mid-execution by token permissions.

---

## 2. Action Log

| Timestamp (UTC) | Action                                                          | Target                                                          | Result                                                                                                                                               |
| --------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~13:20          | Phase 0.1: list open PRs                                        | repo                                                            | 1 open PR: #1646                                                                                                                                     |
| ~13:20          | Phase 0.2: list open issues                                     | repo                                                            | 82 open issues                                                                                                                                       |
| ~13:21          | PR inspection (mergeable, sync, threads, checks)                | PR #1646                                                        | `MERGEABLE`, fast-forward descendant of `origin/main` (no rebase needed), 0 review threads, diff = +249 lines in 1 docs file                         |
| ~13:21          | Check history of failing Vercel check                           | PRs #1643, #1644 (already merged)                               | Identical Vercel `fail` → **pre-existing/systemic**, not caused by #1646; `mergeStateStatus=UNSTABLE` ⇒ check is _not_ required by branch protection |
| ~13:22          | `pnpm install --frozen-lockfile` on PR branch                   | PR #1646 branch                                                 | success                                                                                                                                              |
| ~13:23          | `pnpm test`                                                     | PR #1646 branch                                                 | **160 files / 2241 tests passed**                                                                                                                    |
| ~13:24          | `pnpm lint` (×2, incl. warning sweep)                           | PR #1646 branch                                                 | **9/9 tasks, 0 warnings**                                                                                                                            |
| ~13:25          | `pnpm build`                                                    | PR #1646 branch                                                 | **success** (39 s, full Next.js build)                                                                                                               |
| 13:26:52        | `gh pr merge 1646 --admin --merge`                              | PR #1646                                                        | **MERGED**, commit `5293636`                                                                                                                         |
| ~13:27          | Delete remote + local PR branch                                 | `docs/issue-manager-audit-2026-11-12`                           | deleted after confirmed merge                                                                                                                        |
| ~13:27          | Post-merge verify on `main` (hook)                              | main                                                            | typecheck 9/9 ✅, lint 9/9 ✅                                                                                                                        |
| ~13:27          | Phase 0 re-run                                                  | repo                                                            | 0 open PRs, 82 open issues → ISSUE MANAGER MODE                                                                                                      |
| ~13:27          | Permission probe: `gh issue create`                             | #—                                                              | ❌ 403 `Resource not accessible by integration`                                                                                                      |
| ~13:28          | Permission probe: `gh issue edit --add-label`                   | #496                                                            | ❌ 403 `addLabelsToLabelable`                                                                                                                        |
| ~13:28          | Permission probe: `gh issue comment`                            | #496                                                            | ❌ 403 `addComment`                                                                                                                                  |
| ~13:28          | Step 4 selection: highest-priority open issue                   | P0 #496                                                         | selected per contract                                                                                                                                |
| ~13:28          | Step 4 verification: code path                                  | `packages/api/src/trpc.ts:19`                                   | imports `getLimiter` from `./distributed-rate-limiter` ✅                                                                                            |
| ~13:28          | Step 4 verification: tests                                      | 4 rate-limiter test files                                       | **103/103 passed**                                                                                                                                   |
| ~13:29          | Step 4 verification: acceptance criteria (6/6)                  | #496 body                                                       | all shipped — see §4                                                                                                                                 |
| ~13:30          | Attempted minimal unblock: add `issues: write` to `on-pull.yml` | branch `ci/on-pull-issues-write` (commit `9a3704a`, local only) | ❌ **push rejected**: GitHub App token lacks `workflows` permission — cannot modify `.github/workflows/*` from inside the run                        |
| ~13:31          | Repo CI-workflow validator                                      | `node tooling/qa/validate-ci-workflows.js`                      | 0 errors, 4 **pre-existing** warnings (all in `iterate.yml`, tracked by issue #305)                                                                  |
| ~13:32          | YAML lint                                                       | `.github/workflows/on-pull.yml`                                 | pass                                                                                                                                                 |
| ~13:33          | Persist execution log (this file)                               | `docs/issue-manager-audit-2026-11-12-loop2.md`                  | committed to `docs/issue-manager-audit-2026-11-12-loop2` branch, PR opened                                                                           |

---

## 3. Permission Matrix (first-hand probes, this run)

| Operation                                             | Works?      | Evidence                                                                                       |
| ----------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `gh pr list/view/merge --admin`                       | ✅          | PR #1646 merged                                                                                |
| `git push` (non-workflow files), branch create/delete | ✅          | docs branches pushed/deleted                                                                   |
| `gh issue create`                                     | ❌ 403      | `createIssue` GraphQL                                                                          |
| `gh issue edit --add-label`                           | ❌ 403      | `addLabelsToLabelable` GraphQL                                                                 |
| `gh issue comment`                                    | ❌ 403      | `addComment` GraphQL                                                                           |
| `gh label list` (read)                                | ✅          | label inventory retrieved                                                                      |
| Push changes to `.github/workflows/*`                 | ❌ rejected | "refusing to allow a GitHub App to create or update workflow … without `workflows` permission" |

**Root cause**: `.github/workflows/on-pull.yml` declares `contents: write`,
`pull-requests: write`, but **not** `issues: write` (contrast: `iterate.yml:11-16` declares
`issues: write`). Additionally the GitHub App installation itself must grant the
`workflows` scope for workflow-file edits.

---

## 4. Step 4 Repair Selection — P0 #496 (verified, no code delta)

**Issue**: `[P0][Security] Replace in-memory rate limiter with distributed store (Redis)`

| Acceptance criterion                        | Status     | Evidence                                                                      |
| ------------------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| Redis-backed rate limiter implemented       | ✅ shipped | `packages/api/src/distributed-rate-limiter.ts` (ioredis sliding window)       |
| Rate limits consistent across instances     | ✅ shipped | `distributed-rate-limiter-sync.test.ts` passes                                |
| Configuration via environment variables     | ✅ shipped | `.env.example:118-126` (`REDIS_URL` + per-endpoint overrides)                 |
| Graceful degradation when Redis unavailable | ✅ shipped | in-memory fallback + `logger.warn` ("Redis error, falling back to in-memory") |
| Unit tests                                  | ✅ shipped | 103/103 pass across 4 test files (full suite 2241/2241 on merged main)        |
| Documentation for setup/configuration       | ✅ shipped | `docs/redis-setup.md`, `docs/DEVELOPMENT.md:156-158`, `docs/api-spec.md:126`  |

**Conclusion**: no repair PR is legitimate for #496. The only outstanding action is closing
the issue — blocked by 403.

---

## 5. Blocked Actions & Prepared Work for a Human

### 5.1 Unblock issue management (2 changes, both human-only)

1. **`.github/workflows/on-pull.yml`** — add one line to `permissions:`:

   ```yaml
   permissions:
     contents: write
     issues: write # ← add (parity with iterate.yml:13)
     pull-requests: write
     actions: read
     repository-projects: write
     id-token: write
   ```

2. **GitHub App / repository settings** — grant the Actions app the `workflows` scope
   (or make this edit with a classic PAT), otherwise future runs still cannot adjust
   workflow permissions themselves.

   > Local branch `ci/on-pull-issues-write` (commit `9a3704a`) contains the ready patch;
   > it was authored against `main` @ `d939a5e`+ and validated by
   > `tooling/qa/validate-ci-workflows.js` (0 errors).

### 5.2 Prepared plans (carried forward from `docs/issue-manager-audit-2026-11-12.md`)

- **Step 1**: 39 open issues missing category and/or priority labels — table in the loop-1 audit doc; ready to apply once `issues: write` lands.
- **Step 2/3 duplicate clusters**: rate-limiter #480→#496; pnpm-CI #584/#595/#670/#744→#305; .nvmrc #720+#748; e2e #628/#724→#501; API tests #725→#631.
- **Step 4 sweep result (this run)**: full P0/P1 tier re-checked — P0 #496 shipped (§4); the 9 P1 issues (581, 551, 550, 549, 515, 501, 500, 498, +480 duplicate) remain open work for future loops.

### 5.3 Findings that could NOT be filed as issues (403)

- **[ci][P2]** Vercel preview deployment fails on **every** PR (docs-only diffs included) while being a non-required check — likely missing Vercel env/credentials for previews. Evidence: identical `Vercel fail` on merged PRs #1643, #1644, #1646.
- **[ci][P3]** `iterate.yml` uses npm instead of pnpm (4 validator warnings) — already tracked by open issue #305; needs no new issue (duplicate-avoidance rule).

---

## 6. Skills & Subagents (contract §5–6)

**Skills identified** (`.opencode/skills/`): `ai-agent-engineer`, `commit-message`,
`debugging`, `github-workflow-automation`, `maxritter-claude-codepro-backend-models-standards`,
`modu-ai-moai-adk-moai-tool-opencode`, `muratcankoylan-agent-skills-for-context-engineering-memory-systems`,
`openx-basefly`, `obra-superpowers-systematic-debugging`, `planning`,
`proffesor-for-testing-agentic-qe-skill-builder`, `skill-creator`.

**Skills used**:

- `github-workflow-automation` — used for the workflow-permission diagnosis and validation
  of the prepared `on-pull.yml` patch; result: confirms the standard `GITHUB_TOKEN`
  permission model, corroborates `issues: write` parity requirement with `iterate.yml`,
  and flags that workflow-file edits require the separate `workflows` scope (matches the
  push rejection observed).
- `commit-message` conventions applied to commit `9a3704a` (conventional `ci:` prefix).
- Other skills: not applicable to this run's scope (no debugging rabbit holes, no new
  skill creation, no agent-config edits).

**Subagents**: none used. Per the delegation rule, exploration/search work here was
single-pattern, known-location lookup (direct grep/read); no parallel investigation track
warranted a subagent, and all verification commands (install/test/lint/build) had to run
sequentially in this runner anyway.

---

## 7. Final State

**blocked (with reason)**

Reason: the execution token has no `issues: write` scope (all issue create/label/comment/close
operations return 403) and no `workflows` scope (cannot amend `.github/workflows/on-pull.yml`
to self-heal). Issue Manager Mode Steps 1–3 and Step 4's closure/comment actions are
therefore impossible this run; Phase 1–3 remain unactivated by state-machine rule.

Unblock steps for a human: §5.1 (two changes). After that, the prepared plans in §5.2
plus this run's findings in §5.3 can be executed by the next loop.
