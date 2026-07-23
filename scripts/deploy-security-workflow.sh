#!/bin/bash
# Deploy security scanning workflow to .github/workflows/
# Requires 'workflows' write permission on the GITHUB_TOKEN
# Run this script from repo root with an admin token.
#
# Usage: bash scripts/deploy-security-workflow.sh
# Then commit and push the generated file.
#
# Related issue: #728

set -euo pipefail

WORKFLOW_DIR=".github/workflows"
WORKFLOW_FILE="${WORKFLOW_DIR}/security-audit.yml"

mkdir -p "$WORKFLOW_DIR"

cat > "$WORKFLOW_FILE" <<- 'WORKFLOW'
# =============================================================================
# WORKFLOW: security-audit.yml
# =============================================================================
# Automated security scanning for the basefly monorepo.
# Runs:
#   1. pnpm audit - dependency vulnerability scanning (fails on critical vulns)
#   2. CodeQL Analysis - JavaScript/TypeScript code security scanning
#
# Related issue: #728
# =============================================================================

name: security-audit

on:
  push:
    branches:
      - main
  pull_request:
    paths:
      - 'pnpm-lock.yaml'
      - '**/package.json'
  schedule:
    - cron: '0 6 * * 1'
  workflow_dispatch:

permissions:
  contents: read
  issues: write
  security-events: write
  actions: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  audit:
    name: Dependency Vulnerability Audit
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 15

    steps:
      - name: Checkout Code
        uses: actions/checkout@v7
        with:
          fetch-depth: 1

      - name: Install pnpm
        uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run pnpm Audit
        id: audit
        continue-on-error: true
        run: |
          pnpm audit --json > audit-report.json 2>&1 || true
          echo "Audit report generated."

      - name: Check for High/Critical Vulnerabilities
        id: check
        shell: bash
        run: |
          if [ ! -f audit-report.json ] || [ ! -s audit-report.json ]; then
            echo "No audit report to analyze."
            echo "vuln_count=0" >> "$GITHUB_OUTPUT"
            exit 0
          fi

          python3 << 'PYEOF'
          import json, os

          with open("audit-report.json") as f:
              data = json.load(f)

          meta = data.get("metadata", {})
          vuln_counts = meta.get("vulnerabilities", {})
          high = vuln_counts.get("high", 0)
          critical = vuln_counts.get("critical", 0)
          total = high + critical

          if total > 0:
              print(f"::warning::Found {total} high/critical vulnerabilities ({high} high, {critical} critical)")
              advisories = data.get("advisories", {})
              for adv_id, info in advisories.items():
                  sev = info.get("severity", "")
                  if sev in ("high", "critical"):
                      pkg = info.get("module_name", "unknown")
                      title = info.get("title", "No title")
                      print(f"  [{sev.upper()}] {pkg}: {title}")
              with open(os.environ["GITHUB_OUTPUT"], "a") as out:
                  out.write(f"vuln_count={total}\n")
                  out.write(f"critical_count={critical}\n")
                  out.write(f"high_count={high}\n")
          else:
              print("No high or critical vulnerabilities detected.")
              with open(os.environ["GITHUB_OUTPUT"], "a") as out:
                  out.write("vuln_count=0\n")
                  out.write("critical_count=0\n")
                  out.write("high_count=0\n")
          PYEOF

      - name: Fail on Critical Vulnerabilities
        if: steps.check.outputs.critical_count != '0'
        run: |
          echo "::error::Critical vulnerabilities detected (${{ steps.check.outputs.critical_count }} found). These must be fixed."
          echo "Run 'pnpm audit' locally and apply patches or overrides."
          exit 1

      - name: Warn on High Vulnerabilities
        if: steps.check.outputs.high_count != '0' && steps.check.outputs.critical_count == '0'
        run: |
          echo "::warning::High vulnerabilities detected (${{ steps.check.outputs.high_count }} found). Review and schedule fixes."
          echo "vulnerabilities_high=${{ steps.check.outputs.high_count }}"

      - name: Upload Audit Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: audit-report
          path: audit-report.json
          retention-days: 30
          if-no-files-found: ignore

  codeql:
    name: CodeQL Security Analysis
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 30
    permissions:
      security-events: write
      actions: read
      contents: read

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript-typescript']

    steps:
      - name: Checkout Code
        uses: actions/checkout@v7
        with:
          fetch-depth: 1

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-extended,security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{matrix.language}}"
WORKFLOW

chmod +x "$WORKFLOW_FILE" 2>/dev/null || true

echo "Workflow file created at ${WORKFLOW_FILE}"
echo ""
echo "Next steps:"
echo "  git add ${WORKFLOW_FILE}"
echo "  git commit -m \"fix(security): deploy security scanning CI workflows (issue #728)\""
echo "  git push"
echo ""
echo "Note: Your GITHUB_TOKEN needs 'workflows' write permission."
echo "Add to your workflow permissions if using GitHub Actions:"
echo "  permissions:"
echo "    contents: write"
echo "    workflows: write"
