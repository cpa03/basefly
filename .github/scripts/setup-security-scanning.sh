#!/bin/bash
# Setup Security Scanning Workflows
# This script creates the security scanning workflow files.
# Requires: write access to .github/workflows/ (workflows permission)
#
# Usage: bash .github/scripts/setup-security-scanning.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOWS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/workflows"

echo "Creating security scanning workflows in: $WORKFLOWS_DIR"

# Create security-audit.yml
cat > "$WORKFLOWS_DIR/security-audit.yml" << 'YAML'
# Security Audit Workflow
# Scans dependencies for known vulnerabilities and outdated packages
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
      - name: Checkout
        uses: actions/checkout@v7

      - uses: pnpm/action-setup@v6
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Security Audit
        run: |
          pnpm audit --audit-level=moderate

      - name: Audit Summary
        if: always()
        run: |
          echo "### Security Audit Summary" >> $GITHUB_STEP_SUMMARY
          echo "- **Audit Level**: Moderate and above" >> $GITHUB_STEP_SUMMARY
          echo "- **Status**: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY

  outdated-check:
    name: "Outdated Dependencies Check"
    runs-on: ubuntu-24.04-arm
    continue-on-error: true
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - uses: pnpm/action-setup@v6
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Check Outdated Packages
        run: pnpm outdated || true
YAML

# Create codeql-analysis.yml
cat > "$WORKFLOWS_DIR/codeql-analysis.yml" << 'YAML'
# CodeQL Security Analysis Workflow
# Performs semantic code analysis to find security vulnerabilities
name: "CodeQL Security Analysis"

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  schedule:
    - cron: "0 0 * * 0" # Weekly on Sunday at midnight UTC
  workflow_dispatch:

permissions:
  contents: read
  security-events: write
  actions: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 30

    strategy:
      fail-fast: false
      matrix:
        language: ["javascript-typescript"]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v7

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{matrix.language}}"
YAML

echo "✅ Security scanning workflows created:"
echo "  - $WORKFLOWS_DIR/security-audit.yml"
echo "  - $WORKFLOWS_DIR/codeql-analysis.yml"
echo ""
echo "Next steps:"
echo "  1. Review the generated workflow files"
echo "  2. Commit and push them to main"
echo "  3. Verify they appear in GitHub Actions"
