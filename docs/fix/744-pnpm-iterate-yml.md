# Fix: Migrate iterate.yml from npm to pnpm (Issue #744)

## Problem

The `.github/workflows/iterate.yml` workflow uses `npm ci` for dependency installation and npm-specific cache paths, despite the project using pnpm as its package manager. This causes:

- Inconsistent dependency resolution (npm vs. pnpm lockfile)
- Cache misses due to wrong cache paths
- Confusion for contributors

## Required Changes

Four jobs in `iterate.yml` need pnpm migration. Below are the exact diffs.

### 1. Architect Job (Lines 54-74)

Replace the cache step and dependency installation:

```diff
-      - uses: actions/cache@v6
-        with:
-          path: |
-            ~/.opencode
-            ~/.npm
-          key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
-          restore-keys: |
-            opencode-${{ runner.os }}-v1
+      - uses: pnpm/action-setup@v6
+      - uses: actions/cache@v6
+        with:
+          path: |
+            ~/.opencode
+            ~/.local/share/pnpm/store
+          key: opencode-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}-v1
+          restore-keys: |
+            opencode-${{ runner.os }}-v1
```

```diff
       - uses: actions/setup-node@v7
         with:
           node-version: "20"
+          cache: 'pnpm'

-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
```

### 2. Specialists Job (Lines 249-270)

Add pnpm setup and update cache config:

```diff
     steps:
       - uses: actions/checkout@v7
+
+      - uses: pnpm/action-setup@v6

       - name: Skip if Open PR Exists
         ...
```

```diff
       - uses: actions/setup-node@v7
         with:
           node-version: "20"
+          cache: 'pnpm'
```

### 3. Fixer Job (Lines 335-350)

Same as Architect for dependency installation:

```diff
     steps:
       - uses: actions/checkout@v7

+      - uses: pnpm/action-setup@v6
+
       - name: Configure Git
         ...

       - uses: actions/setup-node@v7
         with:
           node-version: "20"
+          cache: 'pnpm'

-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
```

### 4. PR-Handler Job (Lines 393-405)

Same pattern as Specialists:

```diff
     steps:
       - uses: actions/checkout@v7

+      - uses: pnpm/action-setup@v6
+
       - name: Configure Git
         ...

       - uses: actions/setup-node@v7
         with:
           node-version: "20"
+          cache: 'pnpm'
```

## How to Apply

### Option 1: Manual Edit

Apply the diffs above to `.github/workflows/iterate.yml`.

### Option 2: Migration Script

Run the existing migration script from repository root:

```bash
bash scripts/ci-pnpm-migration.sh --apply
```

This will apply all changes and run verification.

### Option 3: PR with workflows permission

Create a PR from a branch containing these changes. The PR must be created/merged by a user or token with `workflows: write` permission (GitHub restriction for modifying workflow files).

## Verification

After applying, verify:

```bash
bash scripts/ci-pnpm-migration.sh --verify
```

Expected output:

```
✓ pnpm/action-setup@v6 is present
✓ cache: 'pnpm' is configured on setup-node
✓ Cache path uses ~/.pnpm-store
✓ Cache key uses pnpm-lock.yaml
✓ Uses pnpm install --frozen-lockfile
✓ No stale npm ci references
```

## Related Issues

- #744 - fix(ci): pnpm consistency in iterate.yml (primary)
- #670 - Fix iterate.yml to use pnpm instead of npm
- #595 - GitHub Actions workflows use npm instead of pnpm
- #584 - ci: Fix remaining pnpm inconsistencies in GitHub Actions workflows
