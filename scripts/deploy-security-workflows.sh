#!/usr/bin/env bash
# ==============================================================
# deploy-security-workflows.sh
#
# Deploys the security scanning CI workflow template into
# .github/workflows/ for active use.
#
# Prerequisites:
#   - Git remote with a token that has `workflows: write` scope
#     (Personal Access Token or GitHub App with workflows permission).
#     The default GITHUB_TOKEN does NOT have this permission.
#
# Usage:
#   bash scripts/deploy-security-workflows.sh
# ==============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Deploying Security Scanning Workflows ==="
echo ""

# Source template
SRC_AUDIT="$REPO_ROOT/docs/workflow-security-audit.yml"

# Destination
DST_DIR="$REPO_ROOT/.github/workflows"
DST_AUDIT="$DST_DIR/security-audit.yml"

# Check source file exists
if [ ! -f "$SRC_AUDIT" ]; then
  echo "ERROR: Source file not found: $SRC_AUDIT"
  echo "Are you in the repository root?" >&2
  exit 1
fi

# Check destination directory exists
if [ ! -d "$DST_DIR" ]; then
  echo "Creating $DST_DIR"
  mkdir -p "$DST_DIR"
fi

# Copy file
echo "Copying security-audit.yml..."
cp "$SRC_AUDIT" "$DST_AUDIT"
echo "  -> $DST_AUDIT"

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Files deployed. Next steps:"
echo "  1. Review the changes:"
echo "     git add .github/workflows/security-audit.yml"
echo "     git diff --cached --stat"
echo ""
echo "  2. Commit and push with a token that has 'workflows: write' scope:"
echo "     git commit -m \"fix(security): deploy security scanning workflow\""
echo "     git push"
echo ""
echo "  3. Verify the workflow appears in GitHub Actions:"
echo "     https://github.com/$(git config --get remote.origin.url 2>/dev/null | sed 's|.*github.com/||;s|\.git$||')/actions"
echo ""
