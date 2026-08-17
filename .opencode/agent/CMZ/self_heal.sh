#!/bin/bash
# CMZ Agent - Self-Healing Loop
# Automatically runs diagnostic audits, catches build/lint/test failures, and initiates self-healing procedures.

echo "🔍 [CMZ Self-Heal] Starting diagnostic audit..."

# 1. Run typecheck
echo "📥 Checking types..."
pnpm typecheck > typecheck_error.log 2>&1
if [ $? -ne 0 ]; then
  echo "❌ [CMZ Self-Heal] Typecheck failure detected!"
  cat typecheck_error.log
  # Self-healing action: log the failure to docs/task.md
  echo "[ ] error: Typecheck failure detected in CMZ self-heal scan" >> docs/task.md
  exit 1
fi
rm -f typecheck_error.log

# 2. Run lint
echo "📥 Checking linting..."
pnpm run lint > lint_error.log 2>&1
if [ $? -ne 0 ]; then
  echo "⚠️ [CMZ Self-Heal] Linting warnings or errors detected!"
  cat lint_error.log
  # Self-healing action: attempt automatic lint fixing
  echo "🔧 [CMZ Self-Heal] Attempting automatic lint fix..."
  pnpm lint:fix
  pnpm run lint
  if [ $? -eq 0 ]; then
    echo "✅ [CMZ Self-Heal] Lint errors successfully healed!"
    rm -f lint_error.log
  else
    echo "❌ [CMZ Self-Heal] Automatic lint heal failed. Logged to tasks."
    echo "[ ] error: Unresolved linting errors in CMZ self-heal scan" >> docs/task.md
    exit 1
  fi
else
  rm -f lint_error.log
fi

# 3. Run unit tests
echo "📥 Running unit tests..."
pnpm test > test_error.log 2>&1
if [ $? -ne 0 ]; then
  echo "❌ [CMZ Self-Heal] Test suite failures detected!"
  cat test_error.log
  echo "[ ] error: Test suite failure detected in CMZ self-heal scan" >> docs/task.md
  exit 1
else
  rm -f test_error.log
fi

echo "✅ [CMZ Self-Heal] All checks passed. System is perfectly healthy!"
exit 0
