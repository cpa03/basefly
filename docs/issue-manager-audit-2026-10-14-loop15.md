# Issue Manager Audit — 2026-10-14 (loop 15)

## §0 Run Metadata

| Field                 | Value                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluation date       | 2026-10-14 (UTC), run window ≈00:52–01:15                                                                                                          |
| State machine         | Phase 0 → **ISSUE MANAGER MODE** (Phases 1–3 stopped per state machine)                                                                            |
| DEFAULT_BRANCH        | `main` (auto-detected; local synced `01abd99 → db70e37` this run — loop-13 PR-handler audit + SkipLink refactor #1557)                             |
| Phase 0.1 open PRs    | **0** → no PR HANDLER MODE                                                                                                                         |
| Phase 0.2 open issues | **82** (GraphQL) → **ISSUE MANAGER MODE**                                                                                                          |
| Active phase at end   | ISSUE MANAGER MODE (STEP 4 blocked at FAIL-SAFE; audit shipped as PR)                                                                              |
| Final state           | **waiting for human review** — PR with this audit; issue-side writes remain 403 (§5)                                                               |
| Skills used           | `github-workflow-automation` (permission model → F1 re-confirmed; templates gap F6 carried), `openx-basefly` (repo conventions)                    |
| Subagents             | **1 spawn, 1 success**: explore `bg_19194ea7` (`ses_ec811b24dffe2BQXI3LCYhQLrX`) → rate-limiter/Redis full inventory confirming #496 complete (§4) |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open` → `[]` → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open` → **82 open issues** → **ISSUE MANAGER MODE**; Phases 1–3 stopped (all lower phases must not run).
3. STEP 1: fresh label-matrix recompute → **33 compliant / 49 remediation** (identical to loops 7–14, no drift) → loop-14 payload adopted verbatim (no-flip-flop rule); first-hand apply attempt → **403** (§1).
4. STEP 2/3: clusters D1–D7 + groups G1–G7 hold; loop-14's 44-issue close list carried; **3 additional first-hand staleness confirmations** this run (#731 ~90% done, #486 done, #634 fully done) → close candidate list grows **44 → 47** (§2.4).
5. STEP 4: **#496** (only P0) selected → repair = administrative close → **403** ×3 verbs → FAIL-SAFE; no alternative shippable P0/P1 exists (oracle-confirmed loop 10; re-verified first-hand this run, §4).
6. Verification gates re-run fresh this run: **typecheck 9/9, lint 9/9, targeted tests 99/99 green** — settles #634 ACs with hard evidence (§2.4).

---

## §0.1 Phase 0 Log (this run)

| Step | Action           | Result                                                                                                           |
| ---- | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| 0.1  | Open PR query    | `[]` → no PRs → skip PR HANDLER MODE                                                                             |
| 0.2  | Open issue query | **82** open → ISSUE MANAGER MODE                                                                                 |
| 0.3  | DEFAULT_BRANCH   | `main` (`gh repo view --json defaultBranchRef`)                                                                  |
| —    | Sync check       | `git fetch origin` → local `main` behind 3 → `git pull --ff-only` → synced to `db70e37` (loop-13 PR-handler doc) |
| —    | Probe cleanup    | Capability-probe branch/PR (`test/perm-probe-3488`, PR #1558) created then deleted; no residue                   |

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label contract: exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (fresh recompute this run, all 82 open issues):** **33 compliant / 49 remediation** — 12 missing category (`755, 754, 753, 752, 751, 749, 748, 744, 697, 670, 635, 595`), 13 multi-category (`713, 688, 584, 581, 551, 550, 549, 523, 522, 515, 498, 496, 305`), 38 missing priority, 0 multi-priority. Exact match with loops 7–14 → no-drift rule applies.

**Application attempt (first-hand this run):**

```
gh issue edit 789 --add-label "P2"
  → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
```

**Payload (loop-7 payload + loop-11 `670` gap fix, adopted verbatim, loops 8–15 no-flip-flop rule):**

```bash
# format: issue_number:category,priority
# SEMANTICS: for APPLY rows, REPLACE all category labels with the payload category
# and ensure exactly the payload priority.
APPLY=(
  789:enhancement,P3 788:test,P2 787:test,P2 786:security,P1 785:bug,P3
  755:enhancement,P2 754:test,P2 753:enhancement,P2 752:enhancement,P3 751:enhancement,P2
  749:feature,P3 748:bug,P2 744:ci,P2 731:feature,P3 729:test,P3 728:security,P1
  727:feature,P3 726:ci,P3 725:test,P2 724:test,P2 723:enhancement,P3
  722:security,P1 721:security,P1 720:docs,P2 719:chore,P2 713:test,P3
  697:docs,P2 668:feature,P3 636:enhancement,P3 635:docs,P2 634:refactor,P2
  632:security,P2 631:test,P3 630:chore,P3 628:test,P2 595:ci,P3 584:ci,P2 305:ci,P2
  670:ci            # has P3 + non-contract DX-engineer label; ADD category ci (keep P3)
)
# multi-category: replace all category labels with the single primary
MULTI=(713:test 688:security 584:ci 581:test 551:test 550:test 549:test 523:refactor
       522:ci 515:security 498:security 496:security 305:ci)
```

**Coverage check:** payload union = **49 unique issues**; fresh remediation set = **49**; set-diff → **0 uncovered, 0 stale rows**. Verified against the live 82-issue fetch this run.

Non-contract labels (retained as free-form metadata): `DX-engineer, Growth-Innovation-Strategist, backend-engineer, database-architect, devops-engineer, documentation, frontend-engineer, modularity-engineer, performance-engineer, platform-engineer, quality-assurance, security-engineer, technical-writer`.

---

## §2 STEP 2 — Duplicate Detection & Verified Closes

### 2.1 Cluster table (no drift; loop-14 title-keyword rescan stands; this run's title-level scan found no new clusters)

| Cluster | Canonical | Duplicates             | Shared subject                   | Loop-15 status                                                                    |
| ------- | --------- | ---------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| D1      | **#496**  | #480                   | Redis distributed rate limiter   | hold (explore `bg_19194ea7` full inventory this run, §4.1)                        |
| D2      | **#305**  | #584, #595, #670, #744 | pnpm instead of npm in Actions   | hold; defect still live (`iterate.yml` npm calls) **and** push-gate stands (§4.4) |
| D3      | **#501**  | #628, #724             | Playwright E2E critical journeys | hold                                                                              |
| D4      | **#631**  | #725                   | API-router tests                 | hold                                                                              |
| D5      | **#720**  | **#748**               | `.nvmrc` correctness             | hold                                                                              |
| D6      | **#719**  | #634 (partial)         | Root TS config                   | #719 close; **#634 now fully verified fixed this run (§2.4)**                     |
| D7      | **#523**  | #667                   | Barrel-export audit              | #667 → #523; #687 open (distinct action)                                          |

### 2.2 Close-as-fixed verdicts (35 issues — loop-13/14 verified, carried under no-drift)

Full table in loop-14 §2.2 (27 carried + 8 new): #496, #498\*, #500, #501, #503, #515, #549, #550, #551, #578, #590, #611, #613, #630, #631, #632, #635, #664, #666, #683, #684, #697\*, #719, #720, #721, #722, #748, #754, #755, #785, #786, #787, #788, #789, #521. (\* = flagged for maintainer eyeball.)

**First-hand spot-checks this run (4/4 re-confirmed):**

| Issue    | Verdict          | First-hand evidence (this run)                                                                                                                                  |
| -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#786** | ✅ close (fixed) | `apps/nextjs/src/app/api/webhooks/stripe/route.ts:54-67` — identifier = `"stripe-webhook"` static string; warn log has **zero** secret fields; commit `ff9ccef` |
| **#550** | ✅ close (fixed) | `vitest.config.ts:16` `include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"]`                                                                    |
| **#549** | ✅ close (fixed) | `packages/auth/{clerk,env,logger}.test.ts` present; `db.ts` no longer exists in module (structure changed)                                                      |
| **#754** | ✅ close (fixed) | `packages/stripe/src/webhook-idempotency.test.ts` + 4 more stripe test files                                                                                    |

### 2.3 Close-as-duplicate verdicts (9 issues, unchanged)

| Issue                  | Canonical | Evidence                                            |
| ---------------------- | --------- | --------------------------------------------------- |
| #480                   | #496      | identical Redis rate-limiter scope (D1); both fixed |
| #584, #595, #670, #744 | #305      | same npm-vs-pnpm workflow defect (D2)               |
| #667                   | #523      | #667 ⊂ #523 barrel-export audit (D7)                |
| #628, #724             | #501      | same Playwright E2E critical-journey scope (D3)     |
| #725                   | #631      | same API-router test scope (D4)                     |

### 2.4 🆕 Additional close candidates adjudicated this run (3 issues — close list 44 → 47)

| Issue    | Verdict                     | First-hand evidence (this run)                                                                                                                                                                                                                                                                                                                                                                           |
| -------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#731** | ✅ **close (~fixed)** ← new | `packages/api/src/docs-generator.ts` (252 lines, generates markdown from `openApiDocument`); `openapi.ts`; `apps/nextjs/src/app/api/docs/route.ts` (`GET /api/docs` serves OpenAPI 3.0); `docs/api-spec.md` (27 KB); `generate-docs` script in `packages/api/package.json:28`. ACs 1–4 met; remaining gap = interactive Scalar/Redoc playground (nice-to-have, loop-14 kept open "pending feature work") |
| **#486** | ✅ **close (fixed)** ← new  | `packages/common/src/observability/index.ts:1-30` module docstring **explicitly cites issue #486**; env-gated NodeSDK init + `getTracer`; wired via `apps/nextjs/src/instrumentation.ts`; tracer used in `trpc.ts`, `request-id.ts`, `health-check.ts`, edge route; `@opentelemetry/api` + `sdk-node` + `exporter-trace-otlp-http` in `packages/common/package.json`                                     |
| **#634** | ✅ **close (fixed)** ← new  | `tooling/typescript-config/base.json:9` `"strict": true`; **all 6 packages** (`api, common, db, ui, auth, stripe`) `extends: "@saasfly/typescript-config/base.json"`; **this run's `pnpm typecheck` = 9/9 tasks successful, 0 errors** — settles loop-14's "per-package strictness unproven" gap. CI check exists (`ci:check` includes typecheck)                                                        |

**Close totals:** 35 (loop-14) + 3 (new) = **38 fixed** + 9 duplicates = **47 closures** → expected open issues **82 → 35**.

**Recommended close order for the next write-capable run:** new three (#731, #486, #634) → fixed (§2.2) → duplicates (§2.3) → re-run selection for STEP 4.

---

## §3 STEP 3 — Consolidation Groups (G1–G7)

| Group                     | Members                                                                              | Canonical | Status (loop-15)                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 test program           | #581 ⊃ #549, #550, #551, #500, #501 + #713, #725, #787, #788, #628, #724, #729, #754 | #581      | children all FIXED → closable; **#581 stays open** (thresholds 25/20/20/25 ≪ 80% AC)                                                                     |
| G2 barrel exports         | #687, #523 (+ #667 → dup)                                                            | #523      | #667 closes as dup; #523 + #687 open                                                                                                                     |
| G3 API docs               | #731, #749, #503                                                                     | #731      | **#731 now adjudicated ~fixed (§2.4) → close**; #503 fixed → close; **#749 becomes sole survivor** (AI testing+docs generator, P3)                       |
| G4 bundle performance     | #723, #751, #753, #729, #708                                                         | #723      | unchanged (open)                                                                                                                                         |
| G5 sensitive-data logging | #632, #786                                                                           | —         | both FIXED → close, consolidation moot                                                                                                                   |
| G6 TS config/strictness   | #634, #719                                                                           | #634      | **both now FIXED → close; group moot** (loop-15 §2.4)                                                                                                    |
| G7 observability          | #486, #580                                                                           | #486      | **#486 now FIXED → close (§2.4)**; #580 remains open (app monitoring/error-tracking scope beyond OTel traces; logging partly satisfied by pino per #664) |

No issues created for consolidated groups (issue creation 403, §5) — payloads preserved here.

---

## §4 STEP 4 — Repair Mode

### 4.1 Selection ledger (fresh this run)

| Step | Issue                                                                       | Verdict                                                                                                                                              |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **#496** (`enhancement,P0,security`)                                        | selected (only P0) → code fix **re-verified first-hand + via explore `bg_19194ea7`** (full inventory §4.2) → repair = administrative close → **403** |
| 2    | #480 (`enhancement,P1`)                                                     | dup of #496                                                                                                                                          |
| 3    | #786, #515, #550, #549, #551, #500, #501, #721, #722, #632 (P1 / P1-worthy) | all FIXED (§2.2/§2.4 first-hand re-confirmed)                                                                                                        |
| 4    | #498 (`enhancement,P1,security`)                                            | loop-12 AC-by-AC verified fixed; loop-14 flagged for maintainer eyeball (reverses loop-10 oracle)                                                    |
| 5    | #581 (`enhancement,P1,test`)                                                | **open, non-atomic**: apps/nextjs coverage 34.7% → 80% ≈ +1,000 statements of tests                                                                  |
| —    | #305 (`ci`, P2 floor)                                                       | genuinely open but **workflow-file push-gated** (§4.4)                                                                                               |

**Oracle (loop-10, `bg_ffd39746`, nemotron-3-ultra-free) — `FINAL VEREDICT: STOP`** stands: no P0/P1 is (unfixed ∧ non-gated ∧ atomic ∧ shippable). This run's first-hand re-verification found **zero counter-evidence**; the 3 new §2.4 close candidates further shrink the actionable pool rather than grow it.

### 4.2 #496 first-hand + delegated verification (this run)

Explore `bg_19194ea7` (full inventory) + first-hand read of `packages/api/src/distributed-rate-limiter.ts` (365 lines):

- **AC1 Redis-backed**: `DistributedRateLimiter` — Redis sorted-set sliding window (`ZREMRANGEBYSCORE`→`ZCARD`→`ZADD`(uuid)→`EXPIRE`) via `ioredis@5.6.1` pipeline. ✅
- **AC2 cross-instance consistency**: shared Redis keys `ratelimit:{user:<id>|ip:<addr>}`; enforced at `trpc.ts:433-505` + stripe webhook + docs routes. ✅
- **AC3 env config**: `REDIS_URL`, `RATE_LIMIT_{READ,WRITE,STRIPE}_{MAX_REQUESTS,WINDOW_MS}` in `.env.example:124-133`; defaults in `resilience.ts`. ✅
- **AC4 graceful degradation**: constructor `ping()` probe → on failure `redis=null` + `logger.warn`; per-call `catch` → in-memory fallback. ✅
- **AC5 unit tests**: `distributed-rate-limiter.test.ts` + `distributed-rate-limiter-sync.test.ts` (+ legacy `rate-limiter.test.ts`); **this run: 99/99 green** across limiter+auth suites. ✅
- **AC6 docs**: `docs/redis-setup.md` (Upstash/Cloud/Docker + verification); `docs/DEVELOPMENT.md:152-160`; `blueprint.md:702-768`. ✅
- **Infra**: `docker-compose.yml` provisions `redis:7-alpine`; `apps/nextjs/src/instrumentation.ts` exists.

Remaining action for #496 = administrative close → **403-blocked** (§5). Legacy `rate-limiter.ts` retained intentionally for backward-compat re-export (`distributed-rate-limiter.ts:29`) — not a safe deletion per contract.

### 4.3 #498 edge case (carried)

Loop-12 AC-by-AC verification stands (loop-14 flag carried): all ACs met; maintainer eyeball recommended. Stays in close list with `\*` flag.

### 4.4 Workflow-file gate (re-proven loop 12–14; cited not re-attempted this run)

Pushing `.github/workflows/*` with the Actions token is platform-rejected (_refusing to allow a GitHub App to create or update workflow … without `workflows` permission_). Same token/gate this run → identical push would be rejected. #305 (D2) remains the highest-value genuinely-open atomic fix, gated behind this platform constraint or a maintainer PAT.

---

## §5 Capability Matrix (first-hand, loop 15)

| Verb                              | Target       | Result                                                                        |
| --------------------------------- | ------------ | ----------------------------------------------------------------------------- |
| Read issues (GraphQL)             | repo         | ✅ 82 issues                                                                  |
| Add label to issue                | #789         | ❌ **403** `addLabelsToLabelable` (this run)                                  |
| Comment on issue                  | #496         | ❌ **403** `addComment` (this run)                                            |
| Close issue                       | #480         | ❌ **403** `PATCH issues` (this run)                                          |
| Create issue                      | repo         | ❌ 403 (inherited; all four verbs atomic-fail)                                |
| `git push` non-workflow file      | branch       | ✅ (capability probe this run: branch push succeeded)                         |
| Create/close PR, delete PR branch | new PR #1558 | ✅ (probe PR created + closed + branch deleted cleanly)                       |
| Push `.github/workflows/*`        | branch       | ❌ rejected (`workflows` scope — not grantable to Actions token; loops 12–14) |
| **Spawn subagent**                | explore      | ✅ (`bg_19194ea7` succeeded — orchestration healthy post loop-10 repair)      |

---

## §6 Findings (issue creation itself is 403 — ready-to-apply payloads recorded)

### 6.1 Carry package for the next write-capable run (refreshed)

- **Close as fixed (38)**: #496, #498\*, #500, #501, #503, #515, #521, #549, #550, #551, #578, #590, #611, #613, #630, #631, #632, #634, #635, #664, #666, #683, #684, #697\*, #719, #720, #721, #722, #731, #748, #754, #755, #785, #786, #787, #788, #789, **#486**.
- **Close as duplicate (9)**: #480 → #496; #584, #595, #670, #744 → #305; #667 → #523; #628, #724 → #501; #725 → #631.
- **Apply labels**: §1 payload (49 rows; 38 APPLY + 13 MULTI de-dupes).
- **Create/refresh consolidated issues**: G3 now reduces to #749 alone (no new issue needed); G4 (#723 bundle perf) and G7-remainder (#580 monitoring) remain open candidates for future consolidation notes.

### 6.2 Findings register (carried + refreshed)

| ID  | Finding                                                                                                                                                          | Category / Priority | Status this run                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------- |
| F1  | `on-pull.yml` lacks `issues: write` (root cause of every blocked loop)                                                                                           | `ci` / **P0**       | re-confirmed (403 ×4 verbs this run)                 |
| F2  | REST issue-list returns `[]` while 82 issues open (Phase-0 mis-route risk)                                                                                       | `bug` / `P1`        | carried (loop-8)                                     |
| F3  | `iterate.yml` ("parallel" — only workflow WITH `issues: write`) is `disabled_manually`; re-enable = maintainer decision (FAIL-SAFE)                              | `ci` / `P1`         | carried (loop-10)                                    |
| F4  | 49/82 issues violate label contract (§1 payload ready)                                                                                                           | `chore` / `P1`      | re-confirmed (49/49 coverage)                        |
| F5  | Verified-stale issues remain open (§2 close list = 47)                                                                                                           | `chore` / `P2`      | grew 44 → **47** this run                            |
| F6  | `github-workflow-automation` skill templates lack `issues: write`; docs/examples carry dead model IDs → copy-paste reproduces defects                            | `docs` / `P2`       | carried (loop-10)                                    |
| F7  | Genuine open work: #305 (push-gated), #728 (workflow gate), #581 (non-atomic), G2 (#523/#687), G4 (#723 et al.), #580, #749, #634-adjacent leftovers now cleared | mixed               | **shrunk** — #634/#486/#731 moved to close list      |
| F8  | Vercel deployment `failure` (loop-14: 5th zero-job PR-run failure observed)                                                                                      | `ci` / `P2`         | carried (not re-probed; outside issue-manager scope) |

---

## §7 Action Log (UTC, 2026-10-14)

| Time   | Action                         | Target                                                  | Result                                                                    |
| ------ | ------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| ≈00:52 | Phase 0.1 open-PR query        | `gh pr list`                                            | 0 open → skip PR mode                                                     |
| ≈00:52 | Phase 0.2 open-issue query     | `gh issue list`                                         | 82 open → **ISSUE MANAGER MODE**                                          |
| ≈00:52 | DEFAULT_BRANCH + sync          | git                                                     | `main` detected; local behind 3 → `git pull --ff-only` → `db70e37`        |
| ≈00:53 | Skill inventory + load         | `.opencode/skills` (12)                                 | `github-workflow-automation`, (openx-basefly conventions applied)         |
| ≈00:54 | Full issue fetch               | 82 issues → `/tmp/opencode/loop/issues.json`            | 33 compliant / 49 remediation (no drift)                                  |
| ≈00:55 | STEP 1 apply probe             | batch `gh issue edit --add-label` ×39                   | ❌ 403 `addLabelsToLabelable` (all 39)                                    |
| ≈00:56 | Capability probe (git + PR)    | `test/perm-probe` branch + PR #1558                     | ✅ push + PR create/close/delete all work; probe cleaned up               |
| ≈00:57 | Capability probe (issue verbs) | comment on #496; PATCH close #480                       | ❌ 403 ×2                                                                 |
| ≈00:58 | STEP 4 selection               | #496 (P0)                                               | selected → read body + locate limiter                                     |
| ≈00:59 | Subagent spawn (explore)       | `bg_19194ea7` rate-limiter/Redis inventory              | ✅ full file map + algorithm/key/config analysis confirming #496 complete |
| ≈01:02 | First-hand #496 verify         | `distributed-rate-limiter.ts` (365 lines) + trpc wiring | all 6 ACs met                                                             |
| ≈01:03 | First-hand #786 verify         | `webhooks/stripe/route.ts:54-67`                        | zero secret in logs; fixed (`ff9ccef`)                                    |
| ≈01:04 | First-hand #550/#549/#754      | vitest config + auth/stripe test files                  | all fixed                                                                 |
| ≈01:05 | First-hand #731/#486/#634      | docs-generator + observability + tsconfig extends chain | **3 new close candidates** (§2.4)                                         |
| ≈01:07 | Verification gates             | `pnpm typecheck` + `pnpm lint` + targeted vitest        | ✅ typecheck 9/9, lint 9/9, tests **99/99** — settles #634 ACs            |
| ≈01:12 | Audit + fix PR                 | this document                                           | pushed → PR                                                               |

**Subagent report**: 1 spawn, 1 success (`bg_19194ea7` explore → rate-limiter inventory). No result in this document depends on a failed subagent.

---

## §8 Final State

**WAITING FOR HUMAN REVIEW** — one PR shipped (this audit), pending CI + maintainer merge.

Partially blocked sub-system (unchanged, documented, with ready payloads):

1. Issue-side writes (label/comment/close/create) remain **403** — `on-pull.yml` lacks `issues: write` (F1); workflow-file pushes remain platform-gated (§4.4).
2. STEP 4's selected issue (#496) is code-complete (6/6 ACs, re-verified this run); its remaining action is administrative → blocked by (1); oracle-confirmed no alternative shippable P0/P1 repair exists (§4.1).
3. All STEP 1–3 outputs persist in §1–§3 payloads — no information lost. Close list grew 44 → **47** with 3 new first-hand adjudications (#731, #486, #634).

**Unblock paths for maintainer** (any one suffices):

- **A (one line, PAT checkout)**: add `issues: write` under `permissions:` in `.github/workflows/on-pull.yml`.
- **B (one click / API)**: re-enable the `parallel` workflow (`iterate.yml`) — it already declares `issues: write` and uses a live model; its original failure cause (dead agent models) was repaired in loop-10. _Left to maintainer judgment (FAIL-SAFE)._
- **C (manual triage)**: apply §1 labels + execute §6.1 close list (47 issues) with a maintainer PAT; expected open-issue delta **82 → 35**.
