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
echo "--- Fix 2: iterate.yml pnpm consistency (Issue #744) ---"

ITERATE_YML="$REPO_ROOT/.github/workflows/iterate.yml"

if [ -f "$ITERATE_YML" ]; then
  # These changes are applied inline via sed patterns.
  # Verify with: git diff .github/workflows/iterate.yml

  # 1. Add pnpm/action-setup after checkout in architect job
  sed -i '/^      - uses: actions\/cache@v6/i\      - uses: pnpm\/action-setup@v6\n        with:\n          run_install: false\n' "$ITERATE_YML"

  # 2. Update cache path from ~/.npm to ~/.pnpm-store in architect job
  sed -i 's|~/.npm|~/.pnpm-store|g' "$ITERATE_YML"

  # 3. Update cache key from package-lock.json to pnpm-lock.yaml
  sed -i 's|package-lock.json|pnpm-lock.yaml|g' "$ITERATE_YML"

  # 4. Update node-version from "20" to "22" throughout
  sed -i 's/node-version: "20"/node-version: "22"/g' "$ITERATE_YML"

  # 5. Replace npm ci with pnpm install
  sed -i 's|npm ci || true|pnpm install --frozen-lockfile || true|g' "$ITERATE_YML"

  # 6. Add pnpm/action-setup in specialists, fixer, and PR-handler jobs
  # These are harder with sed - recommend manual review after

  echo "  + Applied pnpm consistency changes to iterate.yml"
  echo "  ! REVIEW REQUIRED: Verify all jobs have pnpm/action-setup and cache: 'pnpm'"
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
