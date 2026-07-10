# Security Scanning CI Workflows

This document defines the required GitHub Actions workflows for automated security scanning.
Deploy these workflows to `.github/workflows/` to close issue #728.

> **Note:** Deploying or modifying `.github/workflows/*.yml` requires a token with
> `workflows: write` permission (e.g., a Personal Access Token or a GitHub App token
> with the `workflows` scope). The default `GITHUB_TOKEN` from Actions does **not**
> have this permission.

## Required Files

### 1. `.github/workflows/security-audit.yml`

```yaml
name: security-audit

on:
  schedule:
    - cron: "0 6 * * *" # Daily at 06:00 UTC
  pull_request:
    paths:
      - "pnpm-lock.yaml"
      - "**/package.json"
  workflow_dispatch:

permissions:
  contents: read
  issues: write
  security-events: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  audit:
    name: Dependency Vulnerability Scan
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
          node-version: 20
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run pnpm Audit
        run: pnpm audit --audit-level=high || true
        continue-on-error: true
        id: pnpm-audit

      - name: Run pnpm Audit for JSON Report
        if: always()
        run: |
          pnpm audit --audit-level=high --json 2>/dev/null > pnpm-audit-report.json || true

      - name: Upload Audit Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: pnpm-audit-report
          path: pnpm-audit-report.json
          retention-days: 14
          if-no-files-found: ignore

  outdated:
    name: Outdated Dependency Check
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 10

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
          node-version: 20
          cache: "pnpm"

      - name: Check Outdated Dependencies
        run: pnpm outdated --long || true
        continue-on-error: true
```

### 2. `.github/workflows/codeql-analysis.yml`

```yaml
name: codeql-analysis

on:
  schedule:
    - cron: "0 3 * * 1" # Weekly on Monday at 03:00 UTC
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

permissions:
  actions: read
  contents: read
  security-events: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  analyze:
    name: CodeQL Analyze
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 30

    strategy:
      fail-fast: false
      matrix:
        language:
          - javascript-typescript

    steps:
      - name: Checkout Code
        uses: actions/checkout@v7
        with:
          fetch-depth: 1

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

### 3. Integration into existing CI

Add the following step to the `ci` job in `.github/workflows/on-pull.yml`
(after `Install Dependencies` or before `On-Pull`):

```yaml
- name: Security Audit
  run: pnpm audit --audit-level=high || true
```

## Ready-to-Deploy Files

Ready-to-copy workflow files are available at:

- `docs/ci/workflows/security-audit.yml`
- `docs/ci/workflows/codeql-analysis.yml`

To deploy (requires `workflows: write` permission):

```bash
# From repository root:
cp docs/ci/workflows/security-audit.yml .github/workflows/
cp docs/ci/workflows/codeql-analysis.yml .github/workflows/
git add .github/workflows/
git commit -m "fix(security): deploy security scanning workflows"
git push
```

## Verification

After deploying:

1. **Check workflow runs**: Navigate to Actions → security-audit → verify it runs
2. **Test on PR**: Create a PR modifying `pnpm-lock.yaml` → verify audit triggers
3. **Check CodeQL**: Navigate to Security → Code scanning → verify alerts appear
4. **Run manually**: Use `workflow_dispatch` trigger to test both workflows

## Related Issues

- Issue #728 — Add security scanning workflows to CI
- Issue #726 — Add dependency consistency checking to CI
