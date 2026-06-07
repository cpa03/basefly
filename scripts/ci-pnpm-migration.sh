#!/usr/bin/env bash
# fix(ci): replace npm with pnpm in iterate.yml - Issues #744, #670
#
# This script applies the exact changes needed to migrate iterate.yml
# from npm to pnpm. Run from repository root.
#
# The changes mirror what on-pull.yml already does:
#   - pnpm/action-setup@v6 for pnpm installation
#   - setup-node with cache: 'pnpm' for pnpm caching
#   - pnpm install --frozen-lockfile for dependency installation
#
# Usage: bash scripts/ci-pnpm-migration.sh [--apply] [--verify]
#   Without --apply: dry-run, show diff
#   With --apply: apply changes to .github/workflows/iterate.yml
#   With --verify: validate the applied changes are correct

set -euo pipefail

WORKFLOW=".github/workflows/iterate.yml"
DRY_RUN=true
VERIFY=false

for arg in "$@"; do
  case "$arg" in
    --apply) DRY_RUN=false ;;
    --verify) VERIFY=true ;;
  esac
done

if [ ! -f "$WORKFLOW" ]; then
  echo "Error: $WORKFLOW not found. Run from repository root."
  exit 1
fi

# Verify on-pull.yml as reference
REFERENCE=".github/workflows/on-pull.yml"
if [ ! -f "$REFERENCE" ]; then
  echo "Warning: $REFERENCE not found; cannot validate reference patterns."
  REFERENCE=""
fi

# ─── DRY-RUN / DIFF ─────────────────────────────────────────────────────────
if [ "$DRY_RUN" = true ] && [ "$VERIFY" = false ]; then
  echo "=== CI/CD pnpm Migration - Issues #744, #670 ==="
  echo "Target: $WORKFLOW"
  echo ""

  # Check current state
  if grep -q 'pnpm/action-setup@v6' "$WORKFLOW" 2>/dev/null; then
    echo "✓ pnpm/action-setup@v6 already present (some changes may already be applied)"
  fi
  if grep -q "cache: 'pnpm'" "$WORKFLOW" 2>/dev/null; then
    echo "✓ cache: 'pnpm' already configured (some changes may already be applied)"
  fi

  echo ""
  echo "=== Architect job changes ==="
  echo "1. Add pnpm/action-setup@v6 step before actions/cache"
  echo "2. Update cache path: ~/.npm -> ~/.pnpm-store"
  echo "3. Update cache key: package-lock.json -> pnpm-lock.yaml"
  echo "4. Update setup-node: add cache: 'pnpm'"
  echo "5. Replace: npm ci || true -> pnpm install --frozen-lockfile || true"
  echo ""
  echo "=== Fixer job changes ==="
  echo "1. Add pnpm/action-setup@v6 step before setup-node"
  echo "2. Update setup-node: add cache: 'pnpm'"
  echo "3. Replace: npm ci || true -> pnpm install --frozen-lockfile || true"
  echo ""
  echo "Run with --apply to apply these changes, or --verify to check."

  # Show diff if applicable
  if command -v python3 &>/dev/null; then
    python3 -c "
import re
with open('$WORKFLOW') as f:
    c = f.read()
pnpm_count = len(re.findall(r'pnpm/action-setup', c))
cache_count = len(re.findall(r\"cache: 'pnpm'\", c))
npm_count = len(re.findall(r'run: npm ci', c))
print(f'')
print(f'Current stats:')
print(f'  pnpm/action-setup references: {pnpm_count}')
print(f'  cache: pnpm references:      {cache_count}')
print(f'  npm ci references remaining:   {npm_count}')
"
  fi
  exit 0
fi

# ─── VERIFY ──────────────────────────────────────────────────────────────────
if [ "$VERIFY" = true ]; then
  echo "=== Verification of pnpm Migration ==="
  errors=0

  echo ""
  echo "Checking $WORKFLOW..."

  # Check Architect job
  if grep -q 'pnpm/action-setup@v6' "$WORKFLOW"; then
    echo "  ✓ pnpm/action-setup@v6 is present"
  else
    echo "  ✗ pnpm/action-setup@v6 is MISSING"
    errors=$((errors + 1))
  fi

  if grep -q "cache: 'pnpm'" "$WORKFLOW"; then
    echo "  ✓ cache: 'pnpm' is configured on setup-node"
  else
    echo "  ✗ cache: 'pnpm' is MISSING"
    errors=$((errors + 1))
  fi

  if grep -q '~/.pnpm-store' "$WORKFLOW"; then
    echo "  ✓ Cache path uses ~/.pnpm-store"
  else
    echo "  ✗ Cache path still uses ~/.npm"
    errors=$((errors + 1))
  fi

  if grep -q "hashFiles('\\*\\*/pnpm-lock.yaml')" "$WORKFLOW"; then
    echo "  ✓ Cache key uses pnpm-lock.yaml"
  else
    echo "  ✗ Cache key still uses package-lock.json"
    errors=$((errors + 1))
  fi

  if grep -q 'pnpm install --frozen-lockfile' "$WORKFLOW"; then
    echo "  ✓ Uses pnpm install --frozen-lockfile"
  else
    echo "  ✗ Still uses npm ci"
    errors=$((errors + 1))
  fi

  # Check for stale npm ci references
  npm_ci_count=$(grep -c 'npm ci' "$WORKFLOW" 2>/dev/null || echo 0)
  if [ "$npm_ci_count" -gt 0 ]; then
    echo "  ⚠ $npm_ci_count stale 'npm ci' reference(s) remaining"
    errors=$((errors + 1))
  else
    echo "  ✓ No stale npm ci references"
  fi

  echo ""
  if [ "$errors" -eq 0 ]; then
    echo "✓ All migration checks passed."
    exit 0
  else
    echo "✗ $errors migration check(s) failed. Re-run with --apply to fix."
    exit 1
  fi
fi

# ─── APPLY ───────────────────────────────────────────────────────────────────
echo "Applying pnpm migration to $WORKFLOW..."
cp "$WORKFLOW" "${WORKFLOW}.bak"
echo "  Backup created: ${WORKFLOW}.bak"

python3 << 'PYEOF'
import re

with open('.github/workflows/iterate.yml') as f:
    content = f.read()

original = content
changes = 0

# 1. Architect job: Add pnpm/action-setup after checkout (before cache or issue check)
# Look for: checkout + fetch-depth: 0 followed by cache or issue count step
pattern1 = re.compile(
    r'(- uses: actions/checkout@v4\n\s+with:\n\s+fetch-depth: 0\n)'
    r'(\s+- name: Check Open Issue Count|\s+- uses: actions/cache@v4)'
)
if pattern1.search(content):
    content = pattern1.sub(
        r'\1      - uses: pnpm/action-setup@v6\n        with:\n          run_install: false\n\2',
        content
    )
    changes += 1
    print('  ✓ Added pnpm/action-setup@v6 to Architect job')
else:
    print('  - pnpm/action-setup already present or pattern not found in Architect job')

# 2. Update cache path
if '~/.npm' in content:
    content = content.replace('~/.npm', '~/.pnpm-store')
    changes += 1
    print('  ✓ Updated cache path: ~/.npm -> ~/.pnpm-store')
else:
    print('  - Cache path already uses ~/.pnpm-store')

# 3. Update cache key
if "hashFiles('**/package-lock.json')" in content:
    content = content.replace(
        "hashFiles('**/package-lock.json')",
        "hashFiles('**/pnpm-lock.yaml')"
    )
    changes += 1
    print('  ✓ Updated cache key: package-lock.json -> pnpm-lock.yaml')
else:
    print('  - Cache key already uses pnpm-lock.yaml')

# 4. Replace setup-node + npm ci with pnpm variant (Architect job)
old_arch = (
    '      - uses: actions/setup-node@v4\n'
    '        with:\n'
    '          node-version: "20"\n'
    '\n'
    '      - run: npm ci || true\n'
    '\n'
    '      - name: Install OpenCode\n'
    '        run: |\n'
    '          curl -fsSL'
)
new_arch = (
    '      - uses: pnpm/action-setup@v6\n'
    '        with:\n'
    '          run_install: false\n'
    '\n'
    '      - uses: actions/setup-node@v4\n'
    '        with:\n'
    '          node-version: "20"\n'
    '          cache: \'pnpm\'\n'
    '\n'
    '      - run: pnpm install --frozen-lockfile || true\n'
    '\n'
    '      - name: Install OpenCode\n'
    '        run: |\n'
    '          curl -fsSL'
)
if old_arch in content:
    content = content.replace(old_arch, new_arch, 1)
    changes += 1
    print('  ✓ Updated Architect job: setup-node + npm ci -> pnpm')
else:
    print('  - Architect job npm ci pattern not found (may already be updated)')

# 5. Replace setup-node + npm ci with pnpm variant (Fixer job)
old_fixer = (
    '      - uses: actions/setup-node@v4\n'
    '        with:\n'
    '          node-version: "20"\n'
    '\n'
    '      - run: npm ci || true\n'
    '\n'
    '      - name: Install OpenCode\n'
    '        run: |\n'
    '          curl -fsSL https://opencode.ai/install | bash\n'
    '          echo "$HOME/.opencode/bin" >> $GITHUB_PATH\n'
    '\n'
    '      - name: Audit & Fix PRs'
)
new_fixer = (
    '      - uses: pnpm/action-setup@v6\n'
    '        with:\n'
    '          run_install: false\n'
    '\n'
    '      - uses: actions/setup-node@v4\n'
    '        with:\n'
    '          node-version: "20"\n'
    '          cache: \'pnpm\'\n'
    '\n'
    '      - run: pnpm install --frozen-lockfile || true\n'
    '\n'
    '      - name: Install OpenCode\n'
    '        run: |\n'
    '          curl -fsSL https://opencode.ai/install | bash\n'
    '          echo "$HOME/.opencode/bin" >> $GITHUB_PATH\n'
    '\n'
    '      - name: Audit & Fix PRs'
)
if old_fixer in content:
    content = content.replace(old_fixer, new_fixer, 1)
    changes += 1
    print('  ✓ Updated Fixer job: setup-node + npm ci -> pnpm')
else:
    print('  - Fixer job npm ci pattern not found (may already be updated)')

if changes == 0:
    print('\nNo changes needed - workflow already uses pnpm.')
    exit(0)

with open('.github/workflows/iterate.yml', 'w') as f:
    f.write(content)

print(f'\n✓ Applied {changes} change(s) to .github/workflows/iterate.yml')
PYEOF

echo ""
echo "Running post-apply verification..."
bash "$0" --verify
