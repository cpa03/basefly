# CI Workflow pnpm Migration Guide

This document provides the exact changes needed to resolve issue #305: standardize workflows to use pnpm consistently.

## Summary of Changes

| File                                | Changes                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `.github/workflows/on-pull.yml`     | Update actions versions, add pnpm setup, change cache config |
| `.github/workflows/iterate.yml`     | Update actions versions, add pnpm setup, change cache config |
| `.github/workflows/paratterate.yml` | Update actions versions, add pnpm setup, change cache config |

## Changes Required

### 1. Action Version Updates

Replace invalid action versions across all workflow files:

| Current                 | Replacement             | Reason            |
| ----------------------- | ----------------------- | ----------------- |
| `actions/checkout@v6`   | `actions/checkout@v4`   | v6 doesn't exist  |
| `actions/setup-node@v6` | `actions/setup-node@v4` | v6 doesn't exist  |
| `actions/setup-node@v5` | `actions/setup-node@v4` | Standardize to v4 |
| `actions/cache@v5`      | `actions/cache@v4`      | v5 doesn't exist  |

### 2. Add pnpm Setup

Add the following step before `actions/setup-node`:

```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10
```

### 3. Update Node.js Setup

Update `actions/setup-node` to use pnpm cache:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "pnpm"
```

### 4. Update Cache Configuration

For jobs using `actions/cache`, update the configuration:

**Before:**

```yaml
- name: Setup Cache
  uses: actions/cache@v5
  with:
    path: |
      ~/.opencode
      ~/.npm
    key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
```

**After:**

```yaml
- name: Setup Cache
  uses: actions/cache@v4
  with:
    path: |
      ~/.opencode
      ~/.local/share/pnpm/store
    key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1
```

### 5. Update Dependency Installation

Replace `npm ci` with pnpm:

**Before:**

```yaml
- name: Install Dependencies
  run: npm ci
```

**After:**

```yaml
- name: Install Dependencies
  run: pnpm install --frozen-lockfile
```

## File-Specific Changes

### on-pull.yml

```yaml
# Replace this block:
- name: Checkout Code
  uses: actions/checkout@v6
  continue-on-error: true
  with:
    fetch-depth: 0
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Setup Node.js
  uses: actions/setup-node@v6
  continue-on-error: true
  with:
    node-version: 20
    cache: "npm"

# With this:
- name: Checkout Code
  uses: actions/checkout@v4
  continue-on-error: true
  with:
    fetch-depth: 0
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10

- name: Setup Node.js
  uses: actions/setup-node@v4
  continue-on-error: true
  with:
    node-version: 20
    cache: "pnpm"
```

### iterate.yml

Update all jobs (architect, specialists, PR-Handler, integrator) with the same pattern.

### paratterate.yml

Update all jobs (architect, bugfix, Palette, Flexy, Brocula) with the same pattern.

## Benefits

- **Consistency**: CI matches local development environment (pnpm)
- **Performance**: Proper pnpm caching reduces CI time
- **Reliability**: Eliminates potential npm vs pnpm resolution differences
- **Maintainability**: Aligns with documented best practices in docs/ci-cd.md

## Verification

After applying changes, verify:

1. ✅ `pnpm typecheck` passes
2. ✅ `pnpm lint` passes with no warnings
3. ✅ `pnpm test` passes (383 tests)
4. ✅ Workflow YAML syntax is valid

## Implementation Note

This change requires workflow write permissions. Implementation options:

1. Manual implementation by someone with workflow permissions
2. GitHub App with `workflows` permission
3. Repository admin applying the changes directly

---

**Related Issue**: #305
**Label**: DX-engineer
