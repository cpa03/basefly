# Security Workflows Deployment Guide

This guide documents the required steps to deploy security scanning CI workflows.
These workflows cannot be pushed via automation because the GITHUB_TOKEN lacks
`workflows: write` permission on this repository.

## Prerequisites

To deploy these workflows, a maintainer with `workflows: write` permission must:

1. Checkout the `main` branch
2. Copy the files from `docs/` to `.github/workflows/`
3. Commit and push

## Workflow Files

### 1. Security Audit (`security-audit.yml`)

**Status**: Created at `docs/workflow-security-audit.yml` (reference copy at `.github/workflows/security-audit.yml` on the agent workspace)

**Function**:

- Runs `pnpm audit` on dependency changes (pnpm-lock.yaml, package.json)
- Scheduled weekly (Monday 6 AM UTC)
- Manually triggerable via `workflow_dispatch`
- Fails CI on critical vulnerabilities
- Warns on high vulnerabilities
- Uploads audit report as artifact

**Related Issue**: #728

### 2. CodeQL Analysis (`codeql-analysis.yml`)

**Status**: Created at `docs/workflow-codeql-analysis.md` (reference), workflow file at `.github/workflows/codeql-analysis.yml`

**Function**:

- Runs GitHub CodeQL analysis on JavaScript/TypeScript codebase
- Triggered on push/PR to main
- Scheduled weekly (Sunday midnight UTC)
- Manually triggerable

**Related Issue**: #728

## Deployment Steps

```bash
# From repository root:
cp .github/workflows/security-audit.yml .github/workflows/security-audit.yml
cp .github/workflows/codeql-analysis.yml .github/workflows/codeql-analysis.yml

# Commit and push:
git add .github/workflows/
git commit -m "ci(security): deploy security scanning workflows"
git push
```

## Verification

After deployment, verify workflows appear in:
https://github.com/cpa03/basefly/actions

Run each workflow manually to confirm they execute correctly.
