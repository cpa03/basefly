# iterate.yml pnpm Consistency Fix

## Problem

The `.github/workflows/iterate.yml` file uses `npm ci || true` instead of `pnpm install --frozen-lockfile || true`, inconsistent with the project's pnpm package manager.

## Required Changes

### 1. Architect Job (lines ~54-72)

Replace the current cache + npm ci with:

```yaml
- uses: pnpm/action-setup@v6
  with:
    run_install: false

- uses: actions/cache@v4
  with:
    path: |
      ~/.opencode
      ~/.pnpm-store
    key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1
    restore-keys: |
      opencode-${{ runner.os }}-v1

- name: Configure Git
  run: |
    git config --global user.name "${{ github.actor }}"
    git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"

- uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "pnpm"

- run: pnpm install --frozen-lockfile || true
```

### 2. Fixer Job (lines ~338-342)

Replace setup-node + npm ci with:

```yaml
- uses: pnpm/action-setup@v6
  with:
    run_install: false

- uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "pnpm"

- run: pnpm install --frozen-lockfile || true
```

## Related Issues

- #670: [DX] Fix iterate.yml to use pnpm instead of npm
- #744: fix(ci): pnpm consistency in iterate.yml
- #584: ci: Fix remaining pnpm inconsistencies
- #305: ci: standardize workflows to use pnpm consistently
