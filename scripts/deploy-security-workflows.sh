#!/usr/bin/env bash
# ==============================================================
# deploy-security-workflows.sh
#
# Deploys security scanning CI workflows from docs/ci/workflows/
# into .github/workflows/ for active use.
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

# Source files
SRC_AUDIT="$REPO_ROOT/docs/ci/workflows/security-audit.yml"
SRC_CODELANG="$REPO_ROOT/docs/ci/workflows/codeql-analysis.yml"

# Destination
DST_DIR="$REPO_ROOT/.github/workflows"
DST_AUDIT="$DST_DIR/security-audit.yml"
DST_CODELANG="$DST_DIR/codeql-analysis.yml"

# Check source files exist
if [ ! -f "$SRC_AUDIT" ]; then
  echo "ERROR: Source file not found: $SRC_AUDIT"
  echo "Are you in the repository root?" >&2
  exit 1
fi

if [ ! -f "$SRC_CODELANG" ]; then
  echo "ERROR: Source file not found: $SRC_CODELANG"
  echo "Are you in the repository root?" >&2
  exit 1
fi

# Check destination directory exists
if [ ! -d "$DST_DIR" ]; then
  echo "Creating $DST_DIR"
  mkdir -p "$DST_DIR"
fi

# Copy files
echo "Copying security-audit.yml..."
cp "$SRC_AUDIT" "$DST_AUDIT"
echo "  -> $DST_AUDIT"

echo "Copying codeql-analysis.yml..."
cp "$SRC_CODELANG" "$DST_CODELANG"
echo "  -> $DST_CODELANG"

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Files deployed. Next steps:"
echo "  1. Review the changes:"
echo "     git add .github/workflows/security-audit.yml .github/workflows/codeql-analysis.yml"
echo "     git diff --cached --stat"
echo ""
echo "  2. Commit and push with a token that has 'workflows: write' scope:"
echo "     git commit -m \"fix(security): deploy security scanning workflows\""
echo "     git push"
echo ""
echo "  3. Verify the workflows appear in GitHub Actions:"
echo "     https://github.com/$(git config --get remote.origin.url 2>/dev/null | sed 's|.*github.com/||;s|\.git$||')/actions"
echo ""
