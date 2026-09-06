# Security Audit Workflow

## Overview

This document describes the security scanning workflow that should be added to the CI/CD pipeline to address issue #728.

## Required Workflow File

Create `.github/workflows/security-audit.yml` with the following content:

```yaml
name: security-audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Run weekly on Monday at 6am UTC
    - cron: "0 6 * * 1"

permissions:
  contents: read
  security-events: write

jobs:
  dependency-audit:
    name: Dependency Security Audit
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run pnpm audit
        run: |
          echo "Running dependency security audit..."
          pnpm audit --audit-level=high
        continue-on-error: true

      - name: Check for high/critical vulnerabilities
        run: |
          echo "Checking for high/critical vulnerabilities..."
          pnpm audit --audit-level=critical
        continue-on-error: false

  codeql-analysis:
    name: CodeQL Security Analysis
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ["javascript", "typescript"]

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

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

  secret-scanning:
    name: Secret Scanning
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Scan for hardcoded secrets
        run: |
          echo "Scanning for potential hardcoded secrets..."
          # Check for common secret patterns
          if grep -rn "password\s*=\s*['\"]" --include="*.{ts,tsx,js,jsx,json}" . 2>/dev/null; then
            echo "WARNING: Potential hardcoded passwords found"
            exit 1
          fi
          if grep -rn "api[_-]?key\s*=\s*['\"]" --include="*.{ts,tsx,js,jsx,json}" . 2>/dev/null; then
            echo "WARNING: Potential hardcoded API keys found"
            exit 1
          fi
          if grep -rn "secret\s*=\s*['\"]" --include="*.{ts,tsx,js,jsx,json}" . 2>/dev/null; then
            echo "WARNING: Potential hardcoded secrets found"
            exit 1
          fi
          echo "No hardcoded secrets detected"

      - name: Verify .env files are gitignored
        run: |
          echo "Verifying .env files are gitignored..."
          if grep -q "\.env" .gitignore 2>/dev/null; then
            echo "✓ .env files are properly gitignored"
          else
            echo "WARNING: .env files may not be gitignored"
            exit 1
          fi

  security-summary:
    name: Security Audit Summary
    runs-on: ubuntu-latest
    timeout-minutes: 5
    needs: [dependency-audit, codeql-analysis, secret-scanning]
    if: always()

    steps:
      - name: Security Audit Summary
        run: |
          echo "## Security Audit Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Check | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Dependency Audit | ${{ needs.dependency-audit.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| CodeQL Analysis | ${{ needs.codeql-analysis.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Secret Scanning | ${{ needs.secret-scanning.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY

          if [ "${{ needs.dependency-audit.result }}" = "failure" ] || \
             [ "${{ needs.codeql-analysis.result }}" = "failure" ] || \
             [ "${{ needs.secret-scanning.result }}" = "failure" ]; then
            echo "⚠️ **Security issues detected** - Please review and address before merging." >> $GITHUB_STEP_SUMMARY
            exit 1
          else
            echo "✅ **All security checks passed**" >> $GITHUB_STEP_SUMMARY
          fi
```

## Features

### 1. Dependency Audit

- Runs `pnpm audit` to check for known vulnerabilities in dependencies
- Fails on critical vulnerabilities
- Reports high vulnerabilities as warnings

### 2. CodeQL Analysis

- Static analysis for JavaScript/TypeScript code
- Detects security vulnerabilities and code quality issues
- Uses GitHub's security queries

### 3. Secret Scanning

- Scans for hardcoded passwords, API keys, and secrets
- Verifies .env files are properly gitignored
- Prevents accidental secret exposure

### 4. Security Summary

- Aggregates results from all security checks
- Provides clear pass/fail status in GitHub Actions UI

## Permissions Required

The GitHub App or token used for CI needs:

- `contents: read` - to checkout code
- `security-events: write` - to upload CodeQL results

## Manual Application

Since the GitHub App lacks `workflows` permission, this workflow must be manually applied by a repository maintainer:

1. Create the file `.github/workflows/security-audit.yml` with the content above
2. Commit and push to main branch
3. Verify the workflow runs on next push/PR

## Issue Reference

This addresses:

- **Issue #728**: [Security] Add security scanning workflows to CI
- **Priority**: P1 (High)
- **Category**: security, ci
