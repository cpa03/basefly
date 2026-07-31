#!/usr/bin/env bash
# ==============================================================
# deploy-ci-fixes.sh
#
# Deploys CI fixes that require `workflows: write` permission:
#   1. Security scanning workflows (Issue #728)
#   2. AI-Powered Code Review workflow (Issue #727)
#   3. iterate.yml pnpm consistency fix (Issue #744)
#
# Prerequisites:
#   - Git remote with a token that has `workflows: write` scope
#     (Personal Access Token or GitHub App with workflows permission).
#     The default GITHUB_TOKEN does NOT have this permission.
#
# Usage:
#   bash scripts/deploy-ci-fixes.sh
# ==============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Deploying CI Fixes ==="
echo ""

# ==============================================================
# FIX 1: Security scanning workflows (Issue #728)
# ==============================================================
echo "--- Fix 1: Security Scanning Workflows (Issue #728) ---"

SRC_AUDIT="$REPO_ROOT/docs/ci/workflows/security-audit.yml"
SRC_CODELANG="$REPO_ROOT/docs/ci/workflows/codeql-analysis.yml"
DST_DIR="$REPO_ROOT/.github/workflows"

if [ -f "$SRC_AUDIT" ]; then
  cp "$SRC_AUDIT" "$DST_DIR/security-audit.yml"
  echo "  + Deployed security-audit.yml"
else
  echo "  ! Source not found: $SRC_AUDIT"
fi

if [ -f "$SRC_CODELANG" ]; then
  cp "$SRC_CODELANG" "$DST_DIR/codeql-analysis.yml"
  echo "  + Deployed codeql-analysis.yml"
else
  echo "  ! Source not found: $SRC_CODELANG"
fi

# ==============================================================
# FIX 2: AI-Powered Code Review workflow (Issue #727)
# ==============================================================
echo ""
echo "--- Fix 2: AI-Powered Code Review Workflow (Issue #727) ---"

SRC_AI_REVIEW="$REPO_ROOT/docs/ci/workflows/ai-code-review.yml"

if [ -f "$SRC_AI_REVIEW" ]; then
  cp "$SRC_AI_REVIEW" "$DST_DIR/ai-code-review.yml"
  echo "  + Deployed ai-code-review.yml"
else
  echo "  ! Source not found: $SRC_AI_REVIEW"
fi

# ==============================================================
# FIX 3: iterate.yml pnpm consistency (Issue #744)
# ==============================================================
echo ""
echo "--- Fix 3: iterate.yml pnpm consistency (Issue #744) ---"

ITERATE_YML="$REPO_ROOT/.github/workflows/iterate.yml"
PATCH_FILE="$REPO_ROOT/docs/ci/iterate-pnpm-fix.patch"

if [ -f "$ITERATE_YML" ]; then
  if [ -f "$PATCH_FILE" ]; then
    if (cd "$REPO_ROOT" && git apply --check "$PATCH_FILE" 2>/dev/null); then
      (cd "$REPO_ROOT" && git apply "$PATCH_FILE")
      echo "  + Applied iterate-pnpm-fix.patch to iterate.yml"
    else
      echo "  ! Patch does not apply cleanly (iterate.yml may have drifted)."
      echo "  ! Manual fix required - see docs/ci/iterate-pnpm-fix.md"
    fi
  else
    echo "  ! Patch not found: $PATCH_FILE"
  fi
else
  echo "  ! File not found: $ITERATE_YML"
fi

# ==============================================================
# Summary
# ==============================================================
echo ""
echo "=== Deployment Summary ==="
echo ""
echo "Review changes:"
echo "  git diff --stat"
echo ""
echo "Commit and push (with workflows:write token):"
echo "  git add .github/workflows/"
echo '  git commit -m "fix(ci): deploy CI fixes for issues #727, #728, and #744"'
echo "  git push"
echo ""
echo "Verify in GitHub Actions:"
echo "  https://github.com/$(git config --get remote.origin.url 2>/dev/null | sed 's|.*github.com/||;s|\.git$||')/actions"
echo ""
