# Issue Manager Audit — 2026-10-01 (loop 10)

## §0 Run Metadata

| Field                 | Value                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Evaluation date       | 2026-10-01 (UTC), run window ≈09:27–09:55                                                                                                                                                              |
| State machine         | Phase 0 → **ISSUE MANAGER MODE** (all other phases stopped)                                                                                                                                            |
| DEFAULT_BRANCH        | `main` (detected; local == `origin/main` @ `98c5695`)                                                                                                                                                  |
| Phase 0.1 open PRs    | **0** → PR HANDLER MODE not entered                                                                                                                                                                    |
| Phase 0.2 open issues | **82** → **ISSUE MANAGER MODE**; Phases 1–3 stopped per state machine                                                                                                                                  |
| Active phase at end   | ISSUE MANAGER MODE (STEP 4 → FAIL-SAFE for issue-side; orchestration repair shipped)                                                                                                                   |
| Final state           | **waiting for human review** — PR opened with the orchestration root-cause fix + this audit; issue-side writes remain blocked (see §8)                                                                 |
| Skills used           | `github-workflow-automation` (permission model → template gap finding §6.3), `openx-basefly` (repo conventions; mirror target for model IDs), full skill inventory from `.opencode/skills` (12 skills) |
| Subagents             | **5 spawn attempts**: 2 pre-repair failures (identical to loops 6–9), **3 post-repair successes** (probe, verification ×1+continuation, oracle verdict) — orchestration **RESTORED this run** (§6.2)   |

### Decision summary (why this phase ran)

1. **Phase 0.1**: `gh pr list --state open` → `[]` → PR HANDLER MODE not entered.
2. **Phase 0.2**: `gh issue list --state open` → **82** → **ISSUE MANAGER MODE**; Phases 1–3 stopped per state machine.
3. STEP 1: label state re-fetched (33 compliant / 49 remediation — matrix stable across loops 7–10); application attempt → **403** (first-hand probe, §5).
4. STEP 2/3: loop-7/8/9 clusters D1–D6 and groups G1–G6 re-adopted after **first-hand re-verification** (§2); closures 403-blocked.
5. STEP 4: selected **#496** (only P0) → fixed first-hand → **oracle independently confirmed STOP** (§4.1): no P0/P1 repair is (unfixed ∧ non-gated ∧ atomic ∧ shippable).
6. **Root-cause repair shipped** (loop-9 §6.2/§8 secondary recommendation, executed with loop-9's prescribed evidence procedure): 4 retired free-tier model IDs repointed across `.omo/omo.jsonc` + `AGENTS.md` + `.opencode/skills/openx-basefly/SKILL.md` → **subagent orchestration restored and verified live this run** (§6.2).

---

## §1 STEP 1 — Issue Normalization (Label Matrix)

Label system (mandatory): exactly one category from `bug|enhancement|feature|docs|refactor|chore|test|ci|security` + exactly one priority `P0|P1|P2|P3`.

**Counts (re-fetched this run, all 82 open issues):** **33 compliant / 49 need remediation** (12 missing category, 13 multi-category, 38 missing priority, 0 multi-priority) — identical to loops 7/8/9.

**Application attempt (first-hand this run):**

```
gh issue edit 789 --add-label "P3"
  → GraphQL 403: Resource not accessible by integration (addLabelsToLabelable)
```

**Payload for the next write-capable run** — loop-7 §1.2 adopted verbatim (loop-8/9 no-flip-flop rule; nothing executes until permissions are restored):

```bash
# format: issue_number:category,priority   (source: loop-7 audit §1.2, adopted verbatim)
APPLY=(
  789:enhancement,P3 788:test,P2 787:test,P2 786:security,P1 785:bug,P3
  755:enhancement,P2 754:test,P2 753:enhancement,P2 752:enhancement,P3 751:enhancement,P2
  749:feature,P3 748:bug,P2 744:ci,P2 731:feature,P3 729:test,P3 728:security,P2
  727:feature,P3 726:ci,P3 725:test,P2 724:test,P2 723:enhancement,P3
  722:security,P1 721:security,P1 720:docs,P2 719:chore,P2 713:test,P3
  697:docs,P2 668:feature,P3 636:enhancement,P3 635:docs,P2 634:refactor,P2
  632:security,P2 631:test,P3 630:chore,P3 628:test,P2 595:ci,P3 584:ci,P2 305:ci,P2
)
# multi-category: replace all category labels with the single primary
MULTI=(713:test 688:security 584:ci 581:test 551:test 550:test 549:test 523:refactor
       522:ci 515:security 498:security 496:security 305:ci)
```

---

## §2 STEP 2 — Duplicate Detection (clusters D1–D6, re-verified first-hand)

### 2.1 Canonical cluster table (fresh evidence this run)

| Cluster | Canonical | Duplicates             | Shared subject                   | Re-verification 2026-10-01                                                                                                                                                                                      |
| ------- | --------- | ---------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1      | **#496**  | #480                   | Redis distributed rate limiter   | ✅ stale: `packages/api/src/trpc.ts:17-19` imports `getLimiter` from `./distributed-rate-limiter`, wired at `:435,439` (`limiter.checkAsync`); 3 test files present                                             |
| D2      | **#305**  | #584, #595, #670, #744 | pnpm instead of npm in Actions   | ✅ **still genuinely open**: `.github/workflows/iterate.yml:72` and `:342` = `run: npm ci \|\| true` — but fix is workflow-file push-gated (§4.3)                                                               |
| D3      | **#501**  | #628, #724             | Playwright E2E critical journeys | ✅ stale: `playwright.config.ts` + **11** `tests/e2e/*.spec.ts` (admin, auth, authorization-bypass, billing, cluster, critical-flows, dashboard, home, pricing, subscription-workflows, webhook-error-handling) |
| D4      | **#631**  | #725                   | API-router tests                 | ✅ stale: `packages/api/src/router/*.test.ts` × **12** incl. `k8s-router`, `customer-router`, `stripe-router`, `integration`                                                                                    |
| D5      | **#720**  | **#748**               | `.nvmrc` correctness             | ✅ stale: `.nvmrc` = `22.14.0` (explore re-verified this run)                                                                                                                                                   |
| D6      | **#719**  | #634 (partial)         | Root TS config                   | ✅ stale: root `tsconfig.json` exists (extends `./tooling/typescript-config/base.json`)                                                                                                                         |

### 2.2 Closure verdicts re-verified first-hand this run (403-blocked to execute)

| Issue                            | Verdict          | Evidence (verified 2026-10-01)                                                      |
| -------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| **#720**                         | ✅ close (fixed) | `.nvmrc` = `22.14.0` (explore `bg_45bc23c1`)                                        |
| **#748**                         | ✅ close (fixed) | `.nvmrc` = `22.14.0`, valid semver (same)                                           |
| **#613**                         | ✅ close (fixed) | `.github/workflows/` = `iterate.yml` + `on-pull.yml` only; `paratterate.yml` 0 hits |
| **#550**                         | ✅ close (fixed) | `vitest.config.ts:16` includes `apps/nextjs/src/**/*.{ts,tsx}`                      |
| **#719**                         | ✅ close (fixed) | root `tsconfig.json` exists                                                         |
| **#697**                         | ✅ close (fixed) | grep `#XX\|` in `docs/` = 0 matches                                                 |
| **#496**                         | ✅ close (fixed) | trpc wiring + tests (§2.1 D1; oracle re-confirmed)                                  |
| **#480**                         | 🔁 dup → #496    | identical scope                                                                     |
| **#515**                         | ✅ close (fixed) | `apps/nextjs/src/lib/csrf.ts` + `csrf.test.ts` present                              |
| **#786**                         | ✅ close (fixed) | `ff9ccef` "prevent Stripe webhook secret leakage (#786) (#1477)"                    |
| **#549**                         | ✅ close (fixed) | `packages/auth/{clerk,env,logger}.test.ts`                                          |
| **#500**                         | ✅ close (fixed) | `apps/nextjs/src/utils/clerk.test.ts`                                               |
| **#501, #631, #632, #697, #721** | ✅ close (fixed) | prior-loop evidence stands; D3/D4 re-confirmed                                      |

**Recommended close order for the next write-capable run**: #496 → #480 (dup) → #500, #515, #549, #550, #551, #632, #697, #613, #721, #720, #748, #719, #786 → D2 dups (#584, #595, #670, #744 → #305) → D3/D4 dups (#628, #724 → #501; #725 → #631). Expected open-issue delta: **82 → ≈47**.

---

## §3 STEP 3 — Consolidation Groups (G1–G6, adopted unchanged)

| Group                     | Members                                                                              | Canonical | Status                                                  |
| ------------------------- | ------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------- |
| G1 test program           | #581 ⊃ #549, #550, #551, #500, #501 + #713, #725, #787, #788, #628, #724, #729, #754 | #581      | constituents FIXED; #581 open only for coverage >80% AC |
| G2 barrel exports         | #687, #523                                                                           | #523      | unchanged (open)                                        |
| G3 API docs               | #731, #749, #503                                                                     | #731      | unchanged (open)                                        |
| G4 bundle performance     | #723, #751, #753, #729, #708                                                         | #723      | unchanged (open)                                        |
| G5 sensitive-data logging | #632, #786                                                                           | —         | both FIXED → close, consolidation moot                  |
| G6 TS config/strictness   | #634, #719                                                                           | #634      | #719 stale → close; #634 open                           |

Issue creation for consolidated groups remains 403-blocked (§5).

---

## §4 STEP 4 — Repair Mode

### 4.1 Selection + independent oracle verdict

| Step | Issue                              | Labels                    | Verdict                                                                                                                                         |
| ---- | ---------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **#496**                           | `enhancement,P0,security` | selected (only P0) → **FIXED first-hand** (§2.1) → repair = administrative close → **403**                                                      |
| 2    | #480                               | `enhancement,P1`          | dup of #496                                                                                                                                     |
| 3    | #786                               | `security,P1`             | FIXED (`ff9ccef`)                                                                                                                               |
| 4    | #515/#550/#549/#551/#500/#501/#721 | `P1`                      | all FIXED (§2.2)                                                                                                                                |
| 5    | #498                               | `enhancement,P1,security` | **open, decision-gated**: `trpc.ts:251,290,320` ADMIN_EMAIL fallback removal needs role-backfill migration or existing admins can be locked out |
| 6    | #581                               | `enhancement,P1,test`     | **open, non-atomic**: apps/nextjs ≈34.7% → 80% coverage ≈ +1,000 statements of tests                                                            |
| —    | #305                               | `ci` (P2 floor)           | genuinely open but **workflow-file push-gated** (§4.3)                                                                                          |

**Oracle (independent, `bg_ffd39746`, nemotron-3-ultra-free) — `FINAL VERDICT: STOP`**:

> No P0/P1 issue meets all three criteria. #496 is fixed (6/6 ACs). #305 requires .github/workflows/\* changes which this token cannot push (GitHub rejects without non-grantable `workflows` scope). #498 is decision-gated: removing the ADMIN_EMAIL fallback without a role-backfill migration risks locking out existing admins; adding warnings/docs alone does not satisfy its AC of "remove fallback." #581 is a non-atomic umbrella program (~1000 statements of new tests). All other P1s are verified fixed. No safe, atomic, pushable repair exists.

### 4.2 #498 edge case closed by oracle

The "warn + document instead of removing the fallback" workaround was explicitly evaluated: it does **not** satisfy #498's AC ("remove the fallback"), so it would be a fake fix. Stays open, decision-gated (product/ops call).

### 4.3 Workflow-file gate (unchanged, cited not re-attempted)

Pushing `.github/workflows/*` with this token is rejected by GitHub (loops 6–9 verbatim): _refusing to allow a GitHub App to create or update workflow … without `workflows` permission_. Same token/gate this run → identical push would be rejected (no branch residue created).

---

## §5 Capability Matrix (first-hand, loop 10)

| Verb                                               | Target         | Result                                                                                                                                                               |
| -------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read issues (GraphQL)                              | repo           | ✅ 82 issues                                                                                                                                                         |
| Add label to issue                                 | #789           | ❌ **403** `addLabelsToLabelable` (this run)                                                                                                                         |
| Close issue w/ comment                             | #720           | ❌ **403** `addComment`; **no partial state** (`#720` re-fetched: still OPEN)                                                                                        |
| Comment on issue                                   | any            | ❌ 403 (this run + loop 9)                                                                                                                                           |
| Create issue                                       | repo           | ❌ 403 (inherited; all four verbs atomic-fail)                                                                                                                       |
| `git push` non-workflow file                       | branch         | ✅ (loop 8/9; this run's PR)                                                                                                                                         |
| Create/label/edit PR                               | new PR         | ✅ (loops 7–9; this run's PR labeled `chore,P1`)                                                                                                                     |
| Push `.github/workflows/*`                         | branch         | ❌ rejected (`workflows` scope — not grantable to Actions token)                                                                                                     |
| **Spawn subagent**                                 | explore/oracle | ✅ **RESTORED this run** (was ❌ for 6 consecutive loops — §6.2)                                                                                                     |
| Enable `iterate.yml` ("parallel", `issues: write`) | repo           | ⚠️ **not attempted** — state `disabled_manually` (first-hand via `/actions/workflows`); re-enabling a maintainer-disabled workflow = FAIL-SAFE uncertainty (§6.3 F3) |

---

## §6 Findings (issue creation itself is 403 — ready-to-apply payloads recorded)

### 6.1 Carry package for the next write-capable run (from loop 9 §6.1, refreshed)

- **Close as fixed**: #496, #500, #515, #549, #550, #551, #632, #697, #613, #721, #720, #748, #719, #786, #501, #631 (evidence §2.2).
- **Close as duplicate**: #480 → #496; #584, #595, #670, #744 → #305; #628, #724 → #501; #725 → #631.
- **Apply labels**: §1 payload (38 rows + 13 de-dupes).
- **Create 4 consolidated issues** (G1 coverage-program note, G2, G3, G4; G5/G6 moot).

### 6.2 🆕 SHIPPED this run — orchestration root cause repaired (loop-9 §6.2/§8 recommendation executed)

**Problem**: every subagent spawn failed for 6 consecutive loops with `ProviderModelNotFoundError`.

**Evidence chain (first-hand)**:

1. Config `.omo/omo.jsonc` referenced 4 free-tier IDs: `opencode/{gpt-5-nano, glm-4.7-free, kimi-k2.5-free, minimax-m2.1-free}` — **all retired provider-side**.
2. Spawn errors (pre-repair, this run): `bg_23dfb5ba` (explore) → _Model not found: opencode/gpt-5-nano_; `bg_370828bf` (oracle) → _Model not found: opencode/glm-4.7-free_. (`~/.cache/opencode/models.json` is a **stale cache** still listing the old IDs — that's why loop 9's format-hypothesis could not be settled from it; live catalog is `opencode models`.)
3. Live catalog = 8 free opencode models. Nine parallel probes (`opencode run --pure -m …`, this run):

| Model                             | Probe result                                              |
| --------------------------------- | --------------------------------------------------------- |
| `muse-spark-1.3-contributor-free` | ✅ 8.3 s (fastest)                                        |
| `big-pickle`                      | ✅ 10.3 s                                                 |
| `longcat-2.5-preview-free`        | ✅ 10.7 s                                                 |
| `mimo-v2.6-flash-free`            | ✅ 10.9 s (powers this loop via workflow `--model`)       |
| `space-bunny-free`                | ✅ 11.2 s                                                 |
| `nemotron-3-ultra-free`           | ✅ 22.9 s                                                 |
| `ling-3.0-flash-fin-free`         | ❌ upstream unavailable                                   |
| `nemotron-3.5-lightning-free`     | ❌ timeout 90 s                                           |
| `github-copilot/*`                | ❌ Actions token: "Server-To-Server Tokens not supported" |

4. **Mapping applied (1:1 by tier, all entries probed working)**:

| Dead ID                                                 | → Replacement                     | Roles                                                                  | Rationale                                                      |
| ------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `gpt-5-nano`                                            | `muse-spark-1.3-contributor-free` | explore, quick, unspecified-low                                        | fastest probe; tools+reasoning                                 |
| `glm-4.7-free`                                          | `nemotron-3-ultra-free`           | oracle, librarian, metis, momus, research, deep-low, writing           | "ultra" reasoning tier; deliberative latency                   |
| `kimi-k2.5-free` (+ AGENTS.md `deepseek-v4-flash-free`) | `mimo-v2.6-flash-free`            | sisyphus, plan, business-logic, ultrabrain, artistry, unspecified-high | **proven**: the workflow's own `--model` runs this loop hourly |
| `minimax-m2.1-free`                                     | `space-bunny-free`                | multimodal-looker, visual-engineering                                  | image+video input modalities                                   |

5. **Files changed** (loop-9 prescribed set): `.omo/omo.jsonc` (24 model refs), `AGENTS.md` (8 lines), `.opencode/skills/openx-basefly/SKILL.md` (6 lines). Zero dead IDs remain in all three.
6. **Verified live this run**: post-edit spawn probe `bg_24f4744f` → `SPAWN-OK` (config hot-reloads mid-session); verification task `bg_45bc23c1` + continuation produced the §2.2 table; oracle `bg_ffd39746` produced §4.1 verdict. **Mandated orchestration (contract §6) restored.**

### 6.3 Findings register (for next write-capable run — apply labels from §1-style payloads)

| ID  | Finding                                                                                                                                                                                                                                                                                                                            | Category / Priority | Evidence                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| F1  | `on-pull.yml` lacks `issues: write` (root cause of every blocked loop)                                                                                                                                                                                                                                                             | `ci` / **P0**       | `.github/workflows/on-pull.yml:9-14`; 403 ×3 verbs this run                                    |
| F2  | REST issue-list returns `[]` while 82 issues open (Phase-0 mis-route risk)                                                                                                                                                                                                                                                         | `bug` / `P1`        | loop-8 §6.1 (carried)                                                                          |
| F3  | `iterate.yml` ("parallel" — the only workflow WITH `issues: write`, and it uses live `mimo` model) is **`disabled_manually`**; re-enable decision belongs to maintainer (may have been disabled _because_ agent models were dead — now repaired)                                                                                   | `ci` / `P1`         | `/actions/workflows` state first-hand; `iterate.yml:13` `issues: write`; `:216,318` live model |
| F4  | 49/82 issues violate label contract (§1 payload ready)                                                                                                                                                                                                                                                                             | `chore` / `P1`      | §1                                                                                             |
| F5  | Verified-stale issues remain open (§2 close list)                                                                                                                                                                                                                                                                                  | `chore` / `P2`      | §2.2                                                                                           |
| F6  | `github-workflow-automation` skill **templates** lack `issues: write` (`assets/templates/oh-my-opencode.yml:10-13`) and its docs/examples carry **9 dead `kimi-k2.5-free` refs** (`assets/templates/opencode_basic.yml:15`, `oh-my-opencode.yml:72-131`, `examples/iterate.yml:120,205`) → copy-paste would reproduce both defects | `docs` / `P2`       | grep this run                                                                                  |
| F7  | Genuine open work: #305 (push-gated), #728 (workflow gate), #498 (decision-gated, oracle-confirmed), #581 (non-atomic)                                                                                                                                                                                                             | mixed               | §4                                                                                             |

### 6.4 Working-tree disclosure (not shipped)

- `.omo/omo.jsonc.bak.2026-10-01T09-28-05-887Z` and `.omo/run-continuation/*.json` — plugin/runtime residue from session start; **excluded from the commit** (untracked).
- The tracked `.omo/omo.jsonc` diff also contains the session-start plugin migration (`deep` → `deep-low` category split + `_migrations` entry) applied by oh-my-opencode **before** this run's decisions — included in the commit because it aligns config with the harness's current category taxonomy; disclosed here per prior-loop convention.
- Runner is Node `v20.20.2` while `.nvmrc` wants `22.14.0` (environment mismatch, not a repo defect; pnpm/vitest unaffected).

---

## §7 Action Log (UTC, 2026-10-01)

| Time   | Action                       | Target                                                        | Result                                                                                    |
| ------ | ---------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| ≈09:27 | Phase 0.1 open-PR query      | `gh pr list`                                                  | 0 open → skip PR mode                                                                     |
| ≈09:27 | Phase 0.2 open-issue query   | `gh issue list`                                               | 82 open → **ISSUE MANAGER MODE**                                                          |
| ≈09:28 | DEFAULT_BRANCH detection     | git                                                           | `main` == `origin/main` @ `98c5695` (includes loop-9 audit merge #1528 + 4 newer commits) |
| ≈09:28 | Skill inventory + load       | `.opencode/skills` (12)                                       | `github-workflow-automation`, `openx-basefly` applied                                     |
| ≈09:29 | STEP 1 apply probe           | `gh issue edit 789 --add-label P3`                            | ❌ 403 `addLabelsToLabelable`                                                             |
| ≈09:30 | Root-cause re-check          | `on-pull.yml:9-14`                                            | `issues: write` still absent                                                              |
| ≈09:31 | Subagent probes (pre-repair) | `bg_23dfb5ba` explore, `bg_370828bf` oracle                   | ❌ both `ProviderModelNotFoundError` (gpt-5-nano / glm-4.7-free)                          |
| ≈09:33 | Live model catalog           | `opencode models` + `models.json` cache comparison            | 4 config IDs all retired; cache stale (loop-9 hypothesis resolved)                        |
| ≈09:35 | 9-way model probes           | `opencode run --pure` ×9                                      | 6 ✅ / 2 ❌ provider / 1 ❌ copilot auth (§6.2)                                           |
| ≈09:37 | Config repoint               | `.omo/omo.jsonc` ×4 IDs (24 refs)                             | applied                                                                                   |
| ≈09:38 | Doc mirrors                  | `AGENTS.md`, `openx-basefly/SKILL.md`                         | applied; 0 dead IDs remain                                                                |
| ≈09:39 | Hot-reload probe             | `bg_24f4744f`                                                 | ✅ `SPAWN-OK`                                                                             |
| ≈09:39 | Staleness batch (delegated)  | `bg_45bc23c1` + continuation                                  | 6/6 FIXED table (§2.2)                                                                    |
| ≈09:40 | First-hand STEP 2/4 checks   | trpc.ts #496/#498, iterate.yml D2, D3/D4, #515/#786/#549/#500 | verdicts confirmed (§2, §4)                                                               |
| ≈09:42 | STEP 2 close probe           | `gh issue close 720`                                          | ❌ 403 `addComment`; no partial state                                                     |
| ≈09:43 | Skill-derived findings       | `github-workflow-automation` templates                        | F6 template gap (§6.3)                                                                    |
| ≈09:43 | Oracle STEP 4 review         | `bg_ffd39746`                                                 | ✅ `FINAL VERDICT: STOP` (§4.1)                                                           |
| ≈09:47 | Workflow inventory           | `/actions/workflows`                                          | `iterate.yml` = `disabled_manually` (F3)                                                  |
| ≈09:50 | Audit + fix PR               | this document + 3 config/doc files                            | pushed → PR (§8)                                                                          |

**Subagent report**: 5 spawns — 2 failed pre-repair (`bg_23dfb5ba`, `bg_370828bf`, both `ProviderModelNotFoundError`, the exact defect §6.2 repairs), **3 succeeded post-repair**: `bg_24f4744f` (probe → `SPAWN-OK`), `bg_45bc23c1` (staleness verification → 6/6 evidence table), `bg_ffd39746` (oracle → STEP 4 STOP verdict). No result in this document depends on a failed subagent.

---

## §8 Final State

**WAITING FOR HUMAN REVIEW** — one PR shipped (orchestration repair §6.2 + this audit), pending CI + maintainer merge.

Partially blocked sub-system (unchanged, documented, with ready payloads):

1. Issue-side writes (label/comment/close/create) remain **403** — `on-pull.yml` lacks `issues: write` (F1); workflow-file pushes remain platform-gated (§4.3).
2. STEP 4's selected issue (#496) is code-complete; its remaining action is administrative → blocked by (1); oracle-confirmed no alternative shippable P0/P1 repair exists (§4.1).
3. All STEP 1–3 outputs persist in §1–§3 payloads — no information lost.

**Unblock paths for maintainer** (any one suffices):

- **A (one line, PAT checkout)**: add `issues: write` under `permissions:` in `.github/workflows/on-pull.yml`.
- **B (one click / API)**: re-enable the `parallel` workflow (`iterate.yml`) — it already declares `issues: write` and uses the live `mimo` model; its original failure cause (dead agent models) is repaired by this PR (§6.2, F3). _Left to maintainer judgment — the workflow was disabled manually and this run does not override that decision (FAIL-SAFE)._
- **C**: from a local checkout, run the §1/§2/§3/§6.1 payloads directly.

🤖 Generated as the loop-10 issue-manager audit deliverable.
