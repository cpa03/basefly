# CI/CD Integration: pnpm Standardization

## Overview

This document provides the complete implementation guide for standardizing GitHub Actions workflows to use pnpm consistently across all CI/CD pipelines.

## Related Issue

- **Issue**: #305 - ci: standardize workflows to use pnpm consistently

## Problem Statement

The project uses **pnpm** as its package manager, but GitHub Actions workflows use `npm ci` and npm-based caching. This inconsistency leads to:

1. Slower CI runs (no proper caching for pnpm)
2. Potential dependency resolution differences between local and CI
3. Invalid action versions (v6, v5 don't exist)

## Required Changes

### 1. Update Action Versions

| Current (Invalid)       | Replace With            |
| ----------------------- | ----------------------- |
| `actions/checkout@v6`   | `actions/checkout@v4`   |
| `actions/cache@v5`      | `actions/cache@v4`      |
| `actions/setup-node@v6` | `actions/setup-node@v4` |
| `actions/setup-node@v5` | `actions/setup-node@v4` |

### 2. Add pnpm Setup

Add this step before setup-node in all jobs:

```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10
```

### 3. Update Node.js Setup

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "pnpm"
```

### 4. Update Cache Configuration

```yaml
- name: Setup Cache
  uses: actions/cache@v4
  with:
    path: |
      ~/.opencode
      ~/.local/share/pnpm/store
    key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1
    restore-keys: |
      opencode-${{ runner.os }}-v1
      opencode-${{ runner.os }}-
```

### 5. Update Install Command

| Current  | Replace With                     |
| -------- | -------------------------------- |
| `npm ci` | `pnpm install --frozen-lockfile` |

## Affected Files

- `.github/workflows/on-pull.yml`
- `.github/workflows/iterate.yml`
- `.github/workflows/paratterate.yml`

## Verification

After applying changes, verify:

```bash
pnpm lint       # Should pass
pnpm typecheck  # Should pass
pnpm test       # Should pass (385 tests)
```

## Benefits

- **Consistency**: CI matches local development environment
- **Performance**: Proper pnpm caching reduces CI time
- **Reliability**: Eliminates potential npm vs pnpm resolution differences
- **Maintainability**: Aligns with documented best practices

## Implementation Note

This change requires `workflows` permission to push changes to `.github/workflows/` files.
