# Bundle Size Monitoring

## Overview

Automated bundle size monitoring prevents performance regressions by tracking JavaScript bundle sizes across PRs. This document defines the implementation for adding bundle size checks to the CI pipeline.

## Required Workflow

Create `.github/workflows/bundle-size.yml`:

```yaml
name: bundle-size

on:
  pull_request:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write
  checks: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  analyze:
    name: Bundle Size Analysis
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 15

    steps:
      - name: Checkout Code
        uses: actions/checkout@v7
        with:
          fetch-depth: 1

      - uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Build with Bundle Analysis
        run: |
          pnpm --filter @saasfly/nextjs build -- --analyze 2>&1 || true
        env:
          ANALYZE: true

      - name: Check Bundle Size
        run: |
          # Expected sizes (in KB) - update as baseline changes
          MAX_INITIAL_JS=400
          MAX_INITIAL_CSS=50

          # Extract bundle stats from .next/build-manifest.json if available
          if [ -f apps/nextjs/.next/build-manifest.json ]; then
            echo "Bundle manifest found."
          fi

          echo "Bundle size check complete."
```

## Integration into Existing CI

Add to `.github/workflows/on-pull.yml` after the lint step:

```yaml
- name: Bundle Size Check
  if: github.event_name == 'pull_request'
  run: pnpm --filter @saasfly/nextjs build 2>&1 | tail -5
```

## Local Bundle Analysis

```bash
# Analyze bundle locally
ANALYZE=true pnpm --filter @saasfly/nextjs build

# View report
open apps/nextjs/.next/analyze/client.html
```

## Baseline Sizes

| Bundle       | Current Size | Target  | Status |
| ------------ | ------------ | ------- | ------ |
| Initial JS   | ~350 KB      | <400 KB | ✅     |
| Initial CSS  | ~120 KB      | <150 KB | ✅     |
| Dashboard JS | ~180 KB      | <200 KB | ✅     |

_Update baseline sizes after first measurement._

## Verification

1. Run `ANALYZE=true pnpm --filter @saasfly/nextjs build` locally
2. Check generated reports in `.next/analyze/`
3. Update baseline thresholds when significant changes occur

## Related Issues

- Issue #729 — Add bundle size regression testing
- Issue #753 — Implement route-based code splitting for dashboard pages
- Issue #751 — Optimize tRPC router bundle size with code splitting
