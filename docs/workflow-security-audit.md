name: Security Audit

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  schedule:
    - cron: "0 6 * * 1" # Weekly on Monday at 6 AM UTC
  workflow_dispatch:

permissions:
  contents: read
  security-events: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  dependency-audit:
    name: "Dependency Security Audit"
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 15

    steps:
      - name: Wait in Queue
        uses: softprops/turnstyle@v3
        with:
          poll-interval-seconds: 30
          same-branch-only: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Security Audit
        continue-on-error: true
        run: |
          pnpm audit --audit-level=moderate 2>&1 | tee audit-report.txt
          echo "Exit code: $?" >> audit-report.txt

      - name: Audit Summary
        if: always()
        run: |
          {
            echo "### Security Audit Summary"
            echo "- **Audit Level**: Moderate and above"
            echo "- **Status**: ${{ job.status }}"
            echo ""
            echo "#### Findings"
            echo '```'
            grep -E "^(high|critical|moderate|low)" audit-report.txt 2>/dev/null || echo "No findings above audit level"
            echo '```'
          } >> $GITHUB_STEP_SUMMARY

  outdated-deps:
    name: "Outdated Dependencies Check"
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 10
    continue-on-error: true

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Check Outdated Packages
        run: |
          {
            echo "### Outdated Dependencies"
            echo '```'
            pnpm outdated --long 2>&1 || true
            echo '```'
          } >> $GITHUB_STEP_SUMMARY
