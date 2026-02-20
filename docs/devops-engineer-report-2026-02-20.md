# DevOps Engineer Report - 2026-02-20

## Summary

Identified and prepared fixes for CI/CD workflow inconsistencies where workflows use `npm ci` despite the project using **pnpm** as its package manager.

## Issue Identified

### Workflow Standardization Required

The project's GitHub Actions workflows have the following inconsistencies:

| Workflow          | Issue                                          | Impact                            |
| ----------------- | ---------------------------------------------- | --------------------------------- |
| `on-pull.yml`     | Uses `actions/setup-node@v6` (invalid version) | CI may fail                       |
| `on-pull.yml`     | Uses `cache: 'npm'`                            | No pnpm cache benefit             |
| `iterate.yml`     | Uses `npm ci` instead of `pnpm install`        | Dependency resolution differences |
| `iterate.yml`     | Cache path uses `~/.npm`                       | pnpm cache not utilized           |
| `paratterate.yml` | Same as iterate.yml                            | Same impact                       |

## Changes Prepared

### 1. on-pull.yml

**Before:**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v6
  with:
    node-version: 20
    cache: "npm"
```

**After:**

```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: "pnpm"

- name: Install Dependencies
  run: pnpm install --frozen-lockfile
```

### 2. iterate.yml & paratterate.yml

**Before:**

```yaml
- name: Setup Cache
  uses: actions/cache@v5
  with:
    path: |
      ~/.opencode
      ~/.npm
    key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1

- name: Install Dependencies
  run: npm ci
```

**After:**

```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10

- name: Setup Cache
  uses: actions/cache@v4
  with:
    path: |
      ~/.opencode
      ~/.local/share/pnpm/store
    key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1

- name: Install Dependencies
  run: pnpm install --frozen-lockfile
```

## Verification Results

All checks pass locally:

```
✅ pnpm lint - 7 tasks successful, no warnings
✅ pnpm typecheck - 8 tasks successful, no errors
```

## Outcome

Created GitHub Issue #305 with full implementation details: https://github.com/cpa03/basefly/issues/305

**Implementation Status**: ✅ COMPLETE (committed locally on `devops-engineer` branch)

**Note**: Direct push was blocked due to GitHub App lacking `workflows` permission. The implementation is ready and requires manual merge by someone with workflow write permissions.

### Verification Performed

```
✅ All workflow files are valid YAML (verified with Python yaml module)
✅ No npm ci commands remain
✅ No package-lock.json references remain
✅ No npm cache references remain
✅ All jobs use pnpm/action-setup@v4
✅ All jobs use setup-node@v4 with pnpm cache
✅ Cache paths updated to ~/.local/share/pnpm/store
✅ Cache keys updated to use pnpm-lock.yaml
```

### Files Changed

```
.github/workflows/iterate.yml     | 47 +++++++++++++++++++++-----
.github/workflows/on-pull.yml     | 12 +++++--
.github/workflows/paratterate.yml | 70 ++++++++++++++++++++++++++++-----------
3 files changed, 98 insertions(+), 31 deletions(-)
```

## Benefits of This Change

1. **Consistency**: CI will match local development environment
2. **Performance**: Proper pnpm caching will reduce CI runtime
3. **Reliability**: Eliminates npm vs pnpm dependency resolution differences
4. **Maintainability**: Aligns with documented best practices in `docs/ci-cd.md`

## Next Steps

1. Someone with workflow permissions should implement the changes
2. Alternatively, grant the GitHub App `workflows` permission
3. After implementation, verify CI runs faster with proper caching

---

**Agent**: devops-engineer
**Date**: 2026-02-20
**Related Issue**: #305
