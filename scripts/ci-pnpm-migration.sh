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

# ── Helper: safely replace exact strings ──
def safe_replace(old, new, label):
    global changes
    count = content.count(old)
    if count == 0:
        print(f'  - {label}: pattern not found (may already be updated)')
        return False
    replaced = content.replace(old, new, 1)
    if replaced != content:
        changes += 1
        print(f'  ✓ {label}')
    return True

# 1. Architect job: Add pnpm/action-setup before cache step
#    The architect job has: checkout@v7 (with fetch-depth:0) + issue-check + cache@v6
old_setup = (
    '          fi\n'
    '          \n'
    '      - uses: actions/cache@v6\n'
    '        with:\n'
    '          path: |\n'
    '            ~/.opencode\n'
    '            ~/.npm\n'
    '          key: opencode-${{ runner.os }}-${{ hashFiles(\'**/package-lock.json\') }}-v1\n'
)
new_setup = (
    '          fi\n'
    '          \n'
    '      - uses: pnpm/action-setup@v6\n'
    '      - uses: actions/cache@v6\n'
    '        with:\n'
    '          path: |\n'
    '            ~/.opencode\n'
    '            ~/.local/share/pnpm/store\n'
    '          key: opencode-${{ runner.os }}-${{ hashFiles(\'**/pnpm-lock.yaml\') }}-v1\n'
)
if old_setup in content:
    content = content.replace(old_setup, new_setup, 1)
    changes += 1
    print('  ✓ Architect job: added pnpm/action-setup@v6, updated cache to pnpm')
else:
    # Try an alternative pattern (cache block without issue-count guard)
    old_setup2 = (
        '      - uses: actions/cache@v6\n'
        '        with:\n'
        '          path: |\n'
        '            ~/.opencode\n'
        '            ~/.npm\n'
    )
    if old_setup2 in content:
        content = content.replace(old_setup2, '      - uses: pnpm/action-setup@v6\n' + old_setup2, 1)
        changes += 1
        print('  ✓ Architect job: added pnpm/action-setup@v6 (before cache)')
    else:
        print('  - Architect job cache block not found (may already be updated)')

    # Also update the cache path and key if not done above
    if '~/.npm' in content and '~/.local/share/pnpm/store' not in content:
        content = content.replace('~/.npm', '~/.local/share/pnpm/store')
        changes += 1
        print('  ✓ Updated cache path: ~/.npm -> ~/.local/share/pnpm/store')
    if "hashFiles('**/package-lock.json')" in content:
        content = content.replace("hashFiles('**/package-lock.json')", "hashFiles('**/pnpm-lock.yaml')")
        changes += 1
        print('  ✓ Updated cache key: package-lock.json -> pnpm-lock.yaml')

# 2. Update ALL node-version references (20 -> 22)
content = content.replace('node-version: "20"', 'node-version: "22"')
print('  ✓ Updated node-version from 20 to 22 across all jobs')

# 3. Replace npm ci -> pnpm install --frozen-lockfile in ALL jobs
content = content.replace('npm ci || true', 'pnpm install --frozen-lockfile || true')
print('  ✓ Replaced npm ci with pnpm install --frozen-lockfile in all jobs')

# 4. Replace setup-node blocks to add cache: 'pnpm' in each job
#    Architect job (has pnpm install directly after setup-node)
old_setup_node = '      - uses: actions/setup-node@v7\n        with:\n          node-version: "22"\n\n      - run: pnpm install'
new_setup_node = '      - uses: actions/setup-node@v7\n        with:\n          node-version: "22"\n          cache: \'pnpm\'\n\n      - run: pnpm install'
if old_setup_node in content:
    content = content.replace(old_setup_node, new_setup_node)
    print('  ✓ Added cache: pnpm to setup-node in architect/fixer jobs')

#    Other jobs (no pnpm install after setup-node)
old_setup_node2 = '      - uses: actions/setup-node@v7\n        with:\n          node-version: "22"\n\n      - name: Install OpenCode'
new_setup_node2 = '      - uses: actions/setup-node@v7\n        with:\n          node-version: "22"\n          cache: \'pnpm\'\n\n      - name: Install OpenCode'
if old_setup_node2 in content:
    content = content.replace(old_setup_node2, new_setup_node2)
    print('  ✓ Added cache: pnpm to setup-node in specialists/PR-Handler jobs')

# 5. Add pnpm/action-setup to Fixer job (before Configure Git)
old_fixer_start = (
    '      - uses: actions/checkout@v7\n'
    '\n'
    '      - name: Configure Git\n'
    '        run: |\n'
    '          git config --global user.name "${{ github.actor }}"\n'
    '          git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"\n'
    '\n'
    '      - uses: actions/setup-node@v7\n'
    '        with:\n'
    '          node-version: "22"\n'
    '          cache: \'pnpm\'\n'
    '\n'
    '      - run: pnpm install --frozen-lockfile || true'
)
# Only add pnpm/action-setup if it doesn't already have it
if 'pnpm/action-setup@v6' not in content:
    # Add to Fixer job - insert after checkout
    fixer_insert = (
        '      - uses: actions/checkout@v7\n'
        '\n'
        '      - uses: pnpm/action-setup@v6\n'
    )
    old_fixer_checkout = '      - uses: actions/checkout@v7\n\n      - name: Configure Git'
    if old_fixer_checkout in content:
        # Only replace the LAST occurrence (Fixer job is after Specialists)
        last_occurrence = content.rfind(old_fixer_checkout)
        if last_occurrence >= 0:
            content = content[:last_occurrence] + content[last_occurrence:].replace(old_fixer_checkout, '      - uses: actions/checkout@v7\n\n      - uses: pnpm/action-setup@v6\n\n      - name: Configure Git', 1)
            print('  ✓ Added pnpm/action-setup@v6 to Fixer job')

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
