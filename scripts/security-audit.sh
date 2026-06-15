#!/usr/bin/env bash
set -euo pipefail

# Security Audit Script for Basefly
# Can be run locally or in CI to check for:
# - Dependency vulnerabilities (pnpm audit)
# - Dependency version consistency
# - Outdated dependencies
#
# Usage:
#   ./scripts/security-audit.sh          # Run all checks
#   ./scripts/security-audit.sh --audit  # Run only pnpm audit
#   ./scripts/security-audit.sh --deps   # Run only dependency consistency check
#   ./scripts/security-audit.sh --outdated  # Run only outdated check
#   ./scripts/security-audit.sh --ci     # Run in CI mode (exit 1 on findings)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
CI_MODE=false

if [[ "$*" == *"--ci"* ]]; then
  CI_MODE=true
fi

# Track overall status
HAS_ERRORS=false

print_result() {
  local check_name=$1
  local exit_code=$2
  local output_file=$3

  if [ "$exit_code" -eq 0 ]; then
    echo -e "${GREEN}✅ $check_name: Passed${NC}"
  else
    echo -e "${RED}❌ $check_name: Issues found${NC}"
    HAS_ERRORS=true
    if [ -f "$output_file" ]; then
      echo -e "${YELLOW}--- $check_name Output ---${NC}"
      head -50 "$output_file"
      echo -e "${YELLOW}--------------------------${NC}"
    fi
  fi
}

echo "=========================================="
echo "  Basefly Security Audit"
echo "  Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "=========================================="
echo ""

# Check 1: Dependency consistency
if [[ "$*" == *"--deps"* ]] || [[ "$*" == *"--audit"* ]] || [ $# -eq 0 ]; then
  echo -e "${YELLOW}[1/3] Checking dependency version consistency...${NC}"
  set +e
  pnpm check-deps > /tmp/check-deps-output.txt 2>&1
  CHECK_DEPS_EXIT=$?
  set -e
  print_result "Dependency Consistency" $CHECK_DEPS_EXIT /tmp/check-deps-output.txt
  echo ""
fi

# Check 2: Security audit
if [[ "$*" == *"--audit"* ]] || [ $# -eq 0 ]; then
  echo -e "${YELLOW}[2/3] Running pnpm security audit...${NC}"
  set +e
  pnpm security:audit > /tmp/audit-output.txt 2>&1
  AUDIT_EXIT=$?
  set -e
  print_result "pnpm Audit" $AUDIT_EXIT /tmp/audit-output.txt
  echo ""
fi

# Check 3: Outdated dependencies
if [[ "$*" == *"--outdated"* ]] || [ $# -eq 0 ]; then
  echo -e "${YELLOW}[3/3] Checking for outdated dependencies...${NC}"
  set +e
  pnpm outdated --format json > /tmp/outdated-output.txt 2>&1
  OUTDATED_EXIT=$?
  set -e
  print_result "Outdated Dependencies" $OUTDATED_EXIT /tmp/outdated-output.txt
  echo ""
fi

echo "=========================================="
if [ "$HAS_ERRORS" = true ]; then
  echo -e "${RED}❌ Security audit completed with issues.${NC}"
  echo -e "${YELLOW}Review the outputs above and address findings.${NC}"
  if [ "$CI_MODE" = true ]; then
    exit 1
  fi
else
  echo -e "${GREEN}✅ Security audit completed successfully.${NC}"
fi
echo "=========================================="
