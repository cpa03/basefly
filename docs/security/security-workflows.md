# Security Scanning Workflows

This document defines the recommended CI/CD security scanning workflows for the Basefly project.
These workflows need to be added to `.github/workflows/` by someone with the `workflows` permission
on the GitHub repository.

## Prerequisites

- A `.github/codeql-config.yml` file already exists in the repository
- A `.github/dependabot.yml` file already exists in the repository
- The `pnpm security:audit` script is defined in `package.json`

## Workflow 1: Security Audit (`security-audit.yml`)

Runs dependency vulnerability scanning on a scheduled basis and on pushes to main.

```yaml
# .github/workflows/security-audit.yml
name: security-audit

on:
  push:
    branches:
      - main
  schedule:
    - cron: "0 6 * * 1" # Every Monday at 06:00 UTC
  workflow_dispatch:

permissions:
  contents: read
  issues: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  audit:
    name: Dependency Vulnerability Audit
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 15

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run dependency consistency check
        id: check-deps
        continue-on-error: true
        run: |
          pnpm check-deps 2>&1 | tee check-deps-output.txt
          if [ ${PIPESTATUS[0]} -ne 0 ]; then
            echo "Dependency version inconsistencies found."
          else
            echo "All dependency versions are consistent."
          fi

      - name: Run security audit
        id: audit
        continue-on-error: true
        run: |
          pnpm security:audit 2>&1 | tee audit-output.txt
          if [ ${PIPESTATUS[0]} -ne 0 ]; then
            echo "Vulnerabilities found. Check audit-output.txt for details."
          else
            echo "No high or critical vulnerabilities found."
          fi

      - name: Check for outdated dependencies
        continue-on-error: true
        run: |
          echo "## Outdated Dependencies" >> $GITHUB_STEP_SUMMARY
          pnpm outdated --format json 2>/dev/null | tee outdated-output.txt || echo "No outdated dependencies or check failed"

      - name: Upload audit results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-audit-results
          path: |
            audit-output.txt
            outdated-output.txt
          retention-days: 30

      - name: Create issue on vulnerability found
        if: steps.audit.outputs.exitcode != 0 && github.event_name != 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const auditOutput = fs.readFileSync('audit-output.txt', 'utf8');
            const title = 'Security vulnerabilities found in dependencies';
            const body = `## Automated Security Audit Report

            **Date:** ${new Date().toISOString()}
            **Workflow:** ${context.workflow}
            **Run:** ${context.runId}

            ### pnpm audit results:
            \`\`\`
            ${auditOutput.slice(0, 5000)}
            \`\`\`

            Please review and address the vulnerabilities above.`;
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['security', 'bug', 'P1']
            });
```

## Workflow 2: CodeQL Analysis (`codeql.yml`)

Runs GitHub's CodeQL semantic code analysis to find security vulnerabilities and code quality issues.

```yaml
# .github/workflows/codeql.yml
name: codeql

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  schedule:
    - cron: "0 6 * * 1" # Every Monday at 06:00 UTC
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
    name: CodeQL Analysis
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 30

    strategy:
      fail-fast: false
      matrix:
        language:
          - javascript-typescript

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          config-file: ./.github/codeql-config.yml

      - name: Auto-build
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{matrix.language}}"
```

## Workflow 3: Update `on-pull.yml`

Add a dependency consistency check step to the existing `on-pull.yml` workflow,
before the "Install OpenCode CLI" step:

```yaml
- name: Dependency consistency check
  continue-on-error: true
  run: pnpm check-deps
```

## Related Issues

- GitHub Issue [#728](https://github.com/cpa03/basefly/issues/728) — [Security] Add security scanning workflows to CI
- Dependabot configuration: `.github/dependabot.yml` (already configured)
- CodeQL configuration: `.github/codeql-config.yml` (already exists)
