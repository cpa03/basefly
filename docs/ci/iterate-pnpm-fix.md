# iterate.yml pnpm Consistency Fix

## Problem

The `.github/workflows/iterate.yml` file uses `npm ci || true` instead of `pnpm install --frozen-lockfile || true`, inconsistent with the project's pnpm package manager (`pnpm-lock.yaml` at repo root).

**Regression note (2026-07-31):** The npm-to-pnpm migration previously merged as commit `cd9eb30` (2026-07-27, "fix(ci): migrate iterate.yml from npm to pnpm for consistency", resolving #744 and #670) was **silently reverted by a subsequent stale merge** — the branch merged afterward carried a pre-migration copy of `iterate.yml` and overwrote the migrated version. As of `main` (2026-07-31) the workflow is back to `npm ci`. The canonical patch is regenerated from commit `f3981be` in `docs/ci/iterate-pnpm-fix.patch` and applies cleanly to current `main`.

## Root Cause

Git's default merge resolution can silently restore an older copy of a file when merging a long-lived branch that predates a change on `main`. The file's `git log` history hides the migration commit because its content effect was negated by the later merge.

**Prevention:** Before merging any long-lived branch into `main`, verify `git log --oneline -- .github/workflows/iterate.yml` includes the pnpm migration, or run `git diff origin/main -- .github/workflows/iterate.yml` on the branch to confirm no unintended rollback.

## Required Changes (applied by `f3981be`)

### 1. Architect Job (current lines ~54-77)

Replace the npm cache block and `npm ci` with pnpm equivalents:

```yaml
      - uses: actions/cache@v6
        with:
          path: |
            ~/.opencode
            ~/.local/share/pnpm/store
          key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1
          restore-keys: |
            opencode-${{ runner.os }}-v1
```

and:

```yaml
      - uses: pnpm/action-setup@v6
        with:
          run_install: false

      - uses: actions/setup-node@v7
        with:
          node-version: "20"
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile || true
```

### 2. Fixer Job (current lines ~340-352)

Replace `setup-node` + `npm ci` with:

```yaml
      - uses: pnpm/action-setup@v6
        with:
          run_install: false

      - uses: actions/setup-node@v7
        with:
          node-version: "20"
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile || true
```

## Applying the Fix

The automation token (`github-actions[bot]`) lacks `workflows: write` permission and cannot push `.github/workflows/*` changes. Apply with a privileged token (PAT or GitHub App with `workflows` scope):

```bash
# From a fresh checkout of main
git apply docs/ci/iterate-pnpm-fix.patch
# or: git am < docs/ci/iterate-pnpm-fix.patch
git add .github/workflows/iterate.yml
git commit -m "fix(ci): restore pnpm migration in iterate.yml"
git push
```

Alternatively run `bash scripts/deploy-ci-fixes.sh` which applies the same changes via `sed`.

## Verification

- `grep -c "npm ci" .github/workflows/iterate.yml` → `0`
- `grep -c "pnpm/action-setup" .github/workflows/iterate.yml` → `2`
- YAML parses: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/iterate.yml'))"`

## Related Issues

- #670: [DX] Fix iterate.yml to use pnpm instead of npm
- #744: fix(ci): pnpm consistency in iterate.yml
- #584: ci: Fix remaining pnpm inconsistencies in GitHub Actions workflows
- #595: [platform-engineer] GitHub Actions workflows use npm instead of pnpm
- #305: ci: standardize workflows to use pnpm consistently
