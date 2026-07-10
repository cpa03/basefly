# Security Workflows Deployment Guide

This guide documents the required steps to deploy security scanning CI workflows.
These workflows cannot be pushed via automation because the GITHUB_TOKEN lacks
`workflows: write` permission on this repository.

## Prerequisites

To deploy these workflows, a maintainer with `workflows: write` permission must:

1. Checkout the `main` branch
2. Copy the files from `docs/` to `.github/workflows/`
3. Commit and push

## Workflow Specifications

### 1. Security Audit (`security-audit.yml`)

**Reference specs**:
- `docs/workflow-security-audit.yml` — Combined audit + CodeQL workflow
- `docs/workflows/security-audit.yml` — Focused pnpm audit workflow (improved version)

**Function**:
- Runs `pnpm audit` on dependency changes (pnpm-lock.yaml, package.json)
- Triggers on PRs modifying deps, daily schedule (06:00 UTC), and manual dispatch
- Fails CI on critical vulnerabilities
- Uploads audit report as artifact
- Auto-creates GitHub issue when scheduled scan finds vulnerabilities

**Related Issue**: #728

### 2. CodeQL Analysis (`codeql-analysis.yml`)

**Reference specs**:
- `docs/workflow-codeql-analysis.md` — CodeQL spec as documented
- `docs/workflows/codeql.yml` — Improved CodeQL workflow with `security-and-quality` queries

**Function**:
- Runs GitHub CodeQL analysis on JavaScript/TypeScript + Python code
- Triggered on push/PR to main and weekly schedule (Monday 06:00 UTC)
- Uses `security-and-quality` query suite for comprehensive coverage
- Uploads results to GitHub Security tab

**Related Issue**: #728

## Deployment Steps

```bash
# From repository root (main branch):
cp docs/workflows/security-audit.yml .github/workflows/security-audit.yml
cp docs/workflows/codeql.yml .github/workflows/codeql.yml

# Commit and push:
git add .github/workflows/
git commit -m "ci(security): deploy security scanning workflows"
git push
```

> **Note**: If you have a GITHUB_TOKEN without `workflows: write` scope, you may need to use a Personal Access Token (PAT) with `workflow` scope, or push via the GitHub UI directly.

## Verification

After deployment, verify workflows appear in:
https://github.com/cpa03/basefly/actions

Run each workflow manually to confirm they execute correctly.
