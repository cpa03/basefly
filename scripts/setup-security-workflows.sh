#!/usr/bin/env bash
# =============================================================================
# Security Workflow Setup Script
# =============================================================================
# Creates CI workflow files for security scanning.
# Requires `workflows` permission on the GitHub token (not available in
# default GITHUB_TOKEN — requires admin or PAT with workflows scope).
#
# Usage:
#   DRY_RUN=true  bash scripts/setup-security-workflows.sh   # Preview only
#   bash scripts/setup-security-workflows.sh                  # Apply
#
# See: https://github.com/cpa03/basefly/issues/728
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY_RUN="${DRY_RUN:-false}"

# --- Security Audit Workflow ---
readonly SECURITY_AUDIT_YML=".github/workflows/security-audit.yml"

create_security_audit_workflow() {
  cat > "$1" << 'WORKFLOW'
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
    name: Dependency Security Audit
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Security Audit
        run: pnpm audit --audit-level=moderate

      - name: Audit Summary
        if: always()
        run: |
          echo "### Security Audit Summary" >> $GITHUB_STEP_SUMMARY
          echo "- **Audit Level**: Moderate and above" >> $GITHUB_STEP_SUMMARY
          echo "- **Status**: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY

  outdated-dependencies:
    name: Outdated Dependencies Check
    runs-on: ubuntu-24.04-arm
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
          node-version: 20
          cache: pnpm

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Check Outdated Packages
        run: pnpm outdated || true
WORKFLOW
}

# --- CodeQL Analysis Workflow ---
readonly CODEQL_YML=".github/workflows/codeql-analysis.yml"

create_codeql_workflow() {
  cat > "$1" << 'WORKFLOW'
name: CodeQL Security Analysis

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
        uses: actions/checkout@v4

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
WORKFLOW
}

# --- Main ---
main() {
  echo "=== Security Workflow Setup Script ==="
  echo "Repository: cpa03/basefly"
  echo "Issue:      #728"
  echo "Dry run:    $DRY_RUN"
  echo ""

  if [ "$DRY_RUN" = "true" ]; then
    echo "[DRY-RUN] Would create: $SECURITY_AUDIT_YML"
    echo "[DRY-RUN] Would create: $CODEQL_YML"
    echo ""
    echo "--- $SECURITY_AUDIT_YML ---"
    create_security_audit_workflow /dev/stdout
    echo ""
    echo "--- $CODEQL_YML ---"
    create_codeql_workflow /dev/stdout
    exit 0
  fi

  # Validate prerequisites
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository."
    exit 1
  fi

  # Check if files already exist
  if [ -f "$SECURITY_AUDIT_YML" ]; then
    echo "Warning: $SECURITY_AUDIT_YML already exists. Skipping."
  else
    create_security_audit_workflow "$SECURITY_AUDIT_YML"
    echo "Created: $SECURITY_AUDIT_YML"
    git add "$SECURITY_AUDIT_YML"
  fi

  if [ -f "$CODEQL_YML" ]; then
    echo "Warning: $CODEQL_YML already exists. Skipping."
  else
    create_codeql_workflow "$CODEQL_YML"
    echo "Created: $CODEQL_YML"
    git add "$CODEQL_YML"
  fi

  echo ""
  echo "=== Setup Complete ==="
  echo "Run 'git commit' to commit the new workflow files."
  echo "Note: Pushing requires 'workflows' permission on your token."
}

main
