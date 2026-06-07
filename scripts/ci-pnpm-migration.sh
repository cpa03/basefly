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
# Usage: bash scripts/ci-pnpm-migration.sh [--apply]
#   Without --apply: dry-run, show diff
#   With --apply: apply changes to .github/workflows/iterate.yml

set -euo pipefail

WORKFLOW=".github/workflows/iterate.yml"
DRY_RUN=true

if [ "${1:-}" = "--apply" ]; then
  DRY_RUN=false
fi

if [ ! -f "$WORKFLOW" ]; then
  echo "Error: $WORKFLOW not found. Run from repository root."
  exit 1
fi

if [ "$DRY_RUN" = true ]; then
  cat << 'DIFF'
=== CI/CD pnpm Migration - Issues #744, #670 ===
Target: .github/workflows/iterate.yml

=== Architect job changes ===
1. Add pnpm/action-setup@v6 step before actions/cache
2. Update cache path: ~/.npm -> ~/.pnpm-store
3. Update cache key: package-lock.json -> pnpm-lock.yaml
4. Update setup-node: add cache: 'pnpm'
5. Replace: npm ci || true -> pnpm install --frozen-lockfile || true

=== Fixer job changes ===
1. Add pnpm/action-setup@v6 step before setup-node
2. Update setup-node: add cache: 'pnpm'
3. Replace: npm ci || true -> pnpm install --frozen-lockfile || true

Run with --apply to apply these changes.
DIFF
else
  python3 << 'PYEOF'
with open('.github/workflows/iterate.yml') as f:
    content = f.read()

# Architect job: Add pnpm/action-setup and update cache
content = content.replace(
    '      - uses: actions/checkout@v4\n        with:\n          fetch-depth: 0\n      - name: Check',
    '      - uses: actions/checkout@v4\n        with:\n          fetch-depth: 0\n      - uses: pnpm/action-setup@v6\n        with:\n          run_install: false\n      - name: Check'
)
content = content.replace(
    '~/.npm', '~/.pnpm-store'
)
content = content.replace(
    "hashFiles('**/package-lock.json')", "hashFiles('**/pnpm-lock.yaml')"
)

# Fixer job: Replace npm ci with pnpm (both places)
# First occurrence in architect
old = '      - uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n\n      - run: npm ci || true\n\n      - name: Install OpenCode\n        run: |\n          curl -fsSL'
# Only replace first occurrence (architect) 
idx = content.find(old)
if idx >= 0:
    replacement = '      - uses: pnpm/action-setup@v6\n        with:\n          run_install: false\n\n      - uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n          cache: '\''pnpm'\''\n\n      - run: pnpm install --frozen-lockfile || true\n\n      - name: Install OpenCode\n        run: |\n          curl -fsSL'
    content = content[:idx] + replacement + content[idx + len(old):]

# Second occurrence in Fixer job
old2 = '      - uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n\n      - run: npm ci || true\n\n      - name: Install OpenCode\n        run: |\n          curl -fsSL https://opencode.ai/install | bash\n          echo "$HOME/.opencode/bin" >> $GITHUB_PATH\n\n      - name: Audit & Fix PRs'
idx2 = content.find(old2)
if idx2 >= 0:
    replacement2 = '      - uses: pnpm/action-setup@v6\n        with:\n          run_install: false\n\n      - uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n          cache: '\''pnpm'\''\n\n      - run: pnpm install --frozen-lockfile || true\n\n      - name: Install OpenCode\n        run: |\n          curl -fsSL https://opencode.ai/install | bash\n          echo "$HOME/.opencode/bin" >> $GITHUB_PATH\n\n      - name: Audit & Fix PRs'
    content = content[:idx2] + replacement2 + content[idx2 + len(old2):]

with open('.github/workflows/iterate.yml', 'w') as f:
    f.write(content)

print("Changes applied to .github/workflows/iterate.yml")
PYEOF
fi
