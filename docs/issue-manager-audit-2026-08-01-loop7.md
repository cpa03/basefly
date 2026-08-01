# Issue Manager Audit Report — 2026-08-01 (Loop 7)

## 1. Active Phase

**ISSUE MANAGER MODE** (Phase 0). Entry detection found **0 open PRs and 82 open issues** → entered ISSUE MANAGER MODE. Executed STEP 2 (duplicate detection + resolution re-verification) and STEP 4 (repair-mode selection + delivery attempt). STEP 1 (label normalization) and STEP 3 (consolidation) remain blocked by token permissions (see §3).

## 2. Decision Summary

- Default branch detected: `main`.
- **Phase 0 → ISSUE MANAGER MODE**: 0 open PRs, 82 open issues (verified this loop; no new issues created since 2026-02-27).
- **NEW FINDING (this loop)**: the `iterate.yml` workflow (id `231322818`, name `parallel`) is **`disabled_manually`** on GitHub. Its scheduled cron (`0 */4 * * *`) last ran **2026-02-27** — 5 months of silence is explained by this manual disable, not by a transient outage. This was **not captured in loops 1–6**.
  - **Risk reassessment**: the pnpm-CI defect (#305/#584/#595/#670/#744) is currently **dormant** because the workflow is disabled. However, the broken `npm ci || true` (lines 72 & 342), wrong cache path (`~/.npm`), and wrong cache key (`package-lock.json`) remain in the file. **If the workflow is re-enabled, the install step will silently fail again** (repo is pnpm-only; no `package-lock.json` exists). The fix is still required before re-enable.
- **STEP 2 — Duplicate detection**: no new duplicate clusters since loop 6 (newest issues are 2026-02-27). The 5-issue pnpm-CI cluster (#305, #584, #595, #670, #744) remains a single defect.
- **STEP 4 — Repair-mode selection**: no genuinely-open P0/P1 issue (re-verified, §4). Contract fallback (lowest domain **D. Delivery & Evolution (68)** → lowest criterion **CI/CD Health (65)**) selects the pnpm-CI cluster. The recovery fix (`cd9eb30`, merged 2026-07-27 then accidentally reverted by `ee9ea1b` 2 minutes later) **still applies cleanly** to current `main` (re-verified this loop, §5). Delivery remains **blocked at push** by the missing `workflows` permission (live probe, §6).
- **NEW DATA POINT (this loop)**: Node version mismatch confirmed — `.nvmrc` = `22.14.0` but **both** workflows pin `node-version: "20"` (`on-pull.yml` line 55; `iterate.yml` lines 70/266/340/395). Also workflow-scoped; requires `workflows` permission.
- **Delivered**: this audit report (docs PR) with the re-verified recovery patch, workflow-state finding, and privileged-action list.

## 3. Permissions & Skills Used (per TOOL USAGE mandate)

| Skill / Agent                                    | Purpose                                                               | Result                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `github-workflow-automation` (repo skill)        | CI workflow permission model and workflow state inspection            | Informed the disabled-workflow diagnosis and push-block interpretation  |
| Direct verification (gh api / git / grep / read) | Issue-state re-verification, git-history forensics, label matrix      | Evidence map (§4) + patch re-apply check (§5) + live probes (§6)        |
| Live permission probes                           | Issue mutation + workflow push tests                                  | addLabels 403; addComment 403; close 403; createIssue 403; workflow push rejected |
| `pnpm test`, `pnpm lint`                         | Health baseline (from loop 6, re-confirmed no code changes since)     | 73 files / 1482 tests ✅; lint 9/9 ✅                                   |

**Subagent note:** Explore-agent model ID (`opencode/gpt-5-nano`) remains stale/broken in the harness config (documented loop-3 §8); all verification performed directly with identical coverage. Issue-mutation skills unusable — token is read-only for issues (403 re-verified this loop).

## 4. STEP 2 — Duplicate Detection & Resolution Re-Verification

### 4.1 Duplicate clusters

| Cluster                | Issues                                                                | Status                                                                                             |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| pnpm in CI (iterate)   | #305, #584, #595, #670, #744                                          | **Genuinely open in file, dormant at runtime** — workflow `disabled_manually`; fix re-verified clean-apply (§5) |
| .nvmrc / Node version  | #720 (missing), #748 (invalid '20')                                   | Both RESOLVED — `.nvmrc` = `22.14.0`; duplicates of each other                                      |
| CI Node version drift  | (new observation)                                                     | `.nvmrc` 22.14.0 vs workflow `node-version: "20"` — needs `workflows` permission to fix             |
| Security scanning CI   | #728 (P1)                                                             | BLOCKED — requires `workflows` permission (loops 3–4, 6); only reference YAML doc exists            |
| Testing infrastructure | #581 (umbrella), #500, #549, #550, #551, #725, #724, #787, #754, #788 | All RESOLVED (see §4.2)                                                                             |
| Bundle / performance   | #723, #729, #708, #523                                                | #708/#729 partially addressed (bundle analyzer + size-limit config); CI wiring requires workflow edit |
| Observability          | #486 (OTel), #580 (monitoring)                                        | Genuinely open (instrumentation.ts only validates env) — large P2 scope, not atomic repair candidates |

No **new** duplicate clusters since loop 4 (verified via `createdAt` scan — newest issues are 2026-02-27).

### 4.2 Resolution evidence — independently re-spot-checked this loop

| Issue          | Title                                        | Verdict   | First-hand evidence (this loop)                                        |
| -------------- | -------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| #496 (P0)      | Distributed rate limiter (Redis)             | ✅ RESOLVED | `distributed-rate-limiter.ts` + `distributed-rate-limiter.test.ts` exist; `trpc.ts` imports `rateLimit(endpointType)` from it |
| #515 (P1)      | CSRF protection                              | ✅ RESOLVED | `proxy.ts` lines 14–75: origin extraction + allowed-origins validation |
| #498 (P1)      | RBAC role-based access                       | ✅ RESOLVED | `authorization.ts`: `verifyOwnership`, `verifyOwnershipWithFetch`; `requireRole`/`adminProcedure` (loop 6) |
| #786 (P1)      | Stripe webhook partial secret log            | ✅ RESOLVED | `webhooks/stripe/route.ts`: logs only `eventType` + `requestId`; secret never logged |
| #611           | Root not-found.tsx                           | ✅ RESOLVED | `apps/nextjs/src/app/not-found.tsx` (PR #1048) — never auto-closed     |
| #787           | DB migration/schema tests                    | ✅ RESOLVED | `packages/db/migrations.test.ts` (PR #1046) — never auto-closed        |
| #705           | Docker config                                | ✅ RESOLVED | `Dockerfile` + `docker-compose.yml` exist at root                       |
| #706           | Dev Containers                               | ✅ RESOLVED | `.devcontainer/devcontainer.json` exists                                |
| #635           | Developer onboarding guide                   | ✅ RESOLVED | `docs/ONBOARDING.md` exists                                             |
| #488           | Circular dependency detection                | ✅ RESOLVED | `package.json`: `check:circular` script using `madge`                   |

Remaining issues in the loop 6 evidence map (§4.2 of loop 6 report) were re-confirmed unchanged this loop (no code changes to `main` since loop 6 — latest merge is the loop 6 report itself, #1052).

**Conclusion: no genuinely-open P0/P1 issue and no genuinely-open small deterministic code-deliverable issue remains.** The only genuinely-open defects are (a) the pnpm-CI cluster — **fix proven in history, currently dormant due to manual workflow disable, blocked at push by `workflows` permission**, and (b) large P2 feature work (#486/#580 observability, #487 Redis caching, #494 domain layer, #590 UI audit, #753/#751/#723 bundle work) — out of scope for minimal atomic repair.

## 5. NEW FINDING — iterate.yml manually disabled + recovery patch re-verified

1. **Workflow state**: `gh workflow list --all` → `.github/workflows/iterate.yml` = **`disabled_manually`** (id 231322818, name `parallel`). `on-pull.yml` (id 221500505, name `pull`) = **`active`** — PR CI is healthy (all recent `pull` runs green).
2. **Scheduled-run silence explained**: last `iterate.yml` run = 2026-02-27T20:35Z (failure), then nothing — consistent with manual disable, not a flaky cron.
3. **Defect still present in file** (verified on `origin/main`): `npm ci || true` at lines 72 & 342, cache path `~/.npm` (line ~59), cache key `hashFiles('**/package-lock.json')`. Repo has **no `package-lock.json`** (pnpm-only) → install step silently fails on any future run.
4. **Recovery patch re-verified**: `git diff cd9eb30~1 cd9eb30 -- .github/workflows/iterate.yml` (49 lines) → `git apply --check` on current `main` → **CLEAN APPLY**. Same 49-line patch as loop 6 §7.1.
5. **Recommendation**: before re-enabling `iterate.yml`, re-apply the `cd9eb30` diff (or revert `ee9ea1b`). A privileged process needs only `workflows: write`; no re-authoring needed.

## 6. STEP 4 — Repair Mode (pnpm-CI cluster): delivery attempt — BLOCKED

- Live probe this loop: branch touching only `.github/workflows/iterate.yml` → push **rejected**: `refusing to allow a GitHub App to create or update workflow ... without workflows permission`.
- Control probe: branch touching only `README.md` → **push OK**. Block is scoped to `.github/workflows/*`.
- Issue mutations re-probed: `addLabelsToLabelable` 403, `addComment` 403, `closeIssue` (via comment) 403, `createIssue` 403. Token is fully read-only for issues.
- Per the FAIL-SAFE rule, no attempt to smuggle workflow changes through a non-workflow path.

## 7. Action Log

| Timestamp (UTC)  | Action                                              | Target                                  | Result                                                     |
| ---------------- | --------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| 2026-08-01T21:5x | Phase 0 detection                                   | repo                                    | 0 open PRs, 82 open issues → ISSUE MANAGER MODE            |
| 2026-08-01T21:5x | Permission probes (labels/comment/close/create)     | issues #789, #496, etc.                 | 403 on all issue mutations (read-only)                     |
| 2026-08-01T21:5x | Workflow-push probe (live)                          | iterate.yml-only branch                 | ❌ rejected — `workflows` permission missing                |
| 2026-08-01T21:5x | Non-workflow push control probe                     | README-only branch                      | ✅ push OK (block is workflow-scoped)                       |
| 2026-08-01T21:5x | **NEW: workflow-state audit**                       | `gh workflow list --all`                | **`iterate.yml` = `disabled_manually`; `on-pull.yml` = active** |
| 2026-08-01T21:5x | Git-history forensics on iterate.yml                | cd9eb30 → ee9ea1b                       | Fix merged then reverted 2 min later — defect present in file |
| 2026-08-01T21:5x | Recovery patch re-verification                      | `git apply --check` cd9eb30 diff        | **CLEAN APPLY** on current main                             |
| 2026-08-01T21:5x | Duplicate detection + resolution re-spot-check      | 82 issues                               | pnpm-CI cluster open (dormant); ~45 verified resolved       |
| 2026-08-01T21:5x | Audit report authored + PR                          | docs/issue-manager-audit-2026-08-01-loop7.md | This PR                                             |

## 8. Final State

- **Active phase**: ISSUE MANAGER MODE (repair delivery blocked at `workflows` permission + issue mutations read-only; audit report shipped).
- **Open PRs**: 0 (this report's PR pending CI).
- **Open issues**: 82 (unchanged — issue mutations blocked for automation).
- **Merged this loop**: none.
- **Waiting for human review**: (1) re-apply §5.4 patch via privileged token before re-enabling `iterate.yml`; (2) close ~45 resolved-but-open issues with "resolved by PR #NNN" references; (3) apply label normalization (38 missing priority / 12 missing category / 13 multi-category) + pnpm-CI cluster consolidation; (4) decide on `iterate.yml` re-enable (currently disabled — this is the correct state **only if** the pnpm fix is applied first).
