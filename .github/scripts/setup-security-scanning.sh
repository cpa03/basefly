#!/bin/bash
# Setup Security Scanning Workflows
# Creates the security scanning workflow files in .github/workflows/.
#
# REQUIREMENTS:
# - Write access to .github/workflows/ (workflows permission)
# - The source template files must exist in docs/ci/workflows/
#
# PERMISSIONS NOTE:
# The GITHUB_TOKEN used in GitHub Actions does NOT have workflows:write
# permission by default. To run this script, use:
#   1. A Personal Access Token (PAT) with `workflows` scope
#   2. A GitHub App with `contents: write` AND `workflows: write`
#
# Usage: bash .github/scripts/setup-security-scanning.sh
#        Copy source files from docs/ci/workflows/ to .github/workflows/
#
# PREREQUISITES CHECK:
# - docs/ci/workflows/security-audit.yml must exist
# - docs/ci/workflows/codeql-analysis.yml must exist

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOWS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/workflows"
DOCS_WORKFLOWS_DIR="$(cd "$SCRIPT_DIR/../../docs/ci/workflows" && pwd 2>/dev/null || true)"

echo "================================================"
echo "Security Scanning Workflow Deployment Script"
echo "================================================"
echo ""
echo "Source templates: $DOCS_WORKFLOWS_DIR"
echo "Target directory: $WORKFLOWS_DIR"
echo ""

# Validate prerequisites
if [ ! -d "$DOCS_WORKFLOWS_DIR" ]; then
  echo "ERROR: docs/ci/workflows/ directory not found."
  echo "Make sure the repository is checked out completely."
  exit 1
fi

# Deploy security-audit.yml
if [ -f "$DOCS_WORKFLOWS_DIR/security-audit.yml" ]; then
  cp "$DOCS_WORKFLOWS_DIR/security-audit.yml" "$WORKFLOWS_DIR/security-audit.yml"
  echo "✅ Deployed: $WORKFLOWS_DIR/security-audit.yml"
else
  echo "⚠️  Warning: $DOCS_WORKFLOWS_DIR/security-audit.yml not found. Skipping."
fi

# Deploy codeql-analysis.yml
if [ -f "$DOCS_WORKFLOWS_DIR/codeql-analysis.yml" ]; then
  cp "$DOCS_WORKFLOWS_DIR/codeql-analysis.yml" "$WORKFLOWS_DIR/codeql-analysis.yml"
  echo "✅ Deployed: $WORKFLOWS_DIR/codeql-analysis.yml"
else
  echo "⚠️  Warning: $DOCS_WORKFLOWS_DIR/codeql-analysis.yml not found. Skipping."
fi

echo ""
echo "================================================"
echo "Deployment Summary"
echo "================================================"
echo ""
echo "Workflows deployed to: $WORKFLOWS_DIR"
ls -la "$WORKFLOWS_DIR"/security-audit.yml "$WORKFLOWS_DIR"/codeql-analysis.yml 2>/dev/null || true
echo ""
echo "Next steps:"
echo "  1. Review the generated workflow files"
echo "  2. Commit and push them:"
echo "     git add .github/workflows/security-audit.yml .github/workflows/codeql-analysis.yml"
echo "     git commit -m 'fix(security): deploy security scanning CI workflows'"
echo "     git push"
echo "  3. Verify they appear in GitHub Actions > Workflows"
echo ""
echo "TROUBLESHOOTING:"
echo "  If push is rejected with 'workflows' permission error:"
echo "  - Use a PAT with 'workflows' scope instead of GITHUB_TOKEN"
echo "  - Push via CLI: git push origin <branch>"
echo "  - Or create the files manually in the GitHub UI"
