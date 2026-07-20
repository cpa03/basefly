# Patch: pnpm Consistency in iterate.yml

**Date**: 2026-07-20
**Author**: Sisyphus (Automated)
**Issues**: #744, #670
**Status**: Implemented in local checkout, push blocked by GITHUB_TOKEN `workflows` scope

## Problem

The `.github/workflows/iterate.yml` workflow uses `npm ci` instead of `pnpm install --frozen-lockfile`, despite the project using pnpm as its package manager:

- **Line 72 (Architect job)**: `npm ci || true` — should be `pnpm install --frozen-lockfile || true`
- **Line 342 (Fixer job)**: `npm ci || true` — should be `pnpm install --frozen-lockfile || true`
- **Cache config**: Uses `~/.npm` path and `package-lock.json` hash key instead of pnpm equivalents
- **Missing pnpm setup**: No `pnpm/action-setup@v6` step

## Changes Required

### Architect Job (lines 54-74)

1. **Add pnpm setup** after checkout:
   ```yaml
   - uses: pnpm/action-setup@v6
     with:
       run_install: false
   ```

2. **Simplify cache config** to only cache `~/.opencode`:
   ```yaml
   - uses: actions/cache@v6
     with:
       path: |
         ~/.opencode
       key: opencode-${{ runner.os }}-v1
   ```
   (Remove `~/.npm` path and `package-lock.json` hash — pnpm caching is handled by `setup-node`)

3. **Update setup-node with pnpm cache**:
   ```yaml
   - uses: actions/setup-node@v7
     with:
       node-version: "20"
       cache: "pnpm"
   ```

4. **Replace npm ci with pnpm install**:
   ```yaml
   - run: pnpm install --frozen-lockfile || true
   ```

### Fixer Job (lines 332-349)

1. **Add pnpm setup**:
   ```yaml
   - uses: pnpm/action-setup@v6
     with:
       run_install: false
   ```

2. **Update setup-node with pnpm cache**:
   ```yaml
   - uses: actions/setup-node@v7
     with:
       node-version: "20"
       cache: "pnpm"
   ```

3. **Replace npm ci with pnpm install**:
   ```yaml
   - run: pnpm install --frozen-lockfile || true
   ```

## Full Diff

```diff
--- a/.github/workflows/iterate.yml
+++ b/.github/workflows/iterate.yml
@@ -51,14 +51,15 @@ jobs:
             exit 0
           fi
           
+      - uses: pnpm/action-setup@v6
+        with:
+          run_install: false
+
       - uses: actions/cache@v6
         with:
           path: |
             ~/.opencode
-            ~/.npm
-          key: opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v1
-          restore-keys: |
-            opencode-${{ runner.os }}-v1
+          key: opencode-${{ runner.os }}-v1
 
       - name: Configure Git
         run: |
@@ -68,8 +69,9 @@ jobs:
       - uses: actions/setup-node@v7
         with:
           node-version: "20"
+          cache: "pnpm"
 
-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
 
       - name: Install OpenCode
         run: |
@@ -335,11 +337,16 @@ jobs:
           git config --global user.name "${{ github.actor }}"
           git config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"
 
+      - uses: pnpm/action-setup@v6
+        with:
+          run_install: false
+
       - uses: actions/setup-node@v7
         with:
           node-version: "20"
+          cache: "pnpm"
 
-      - run: npm ci || true
+      - run: pnpm install --frozen-lockfile || true
 
       - name: Install OpenCode
         run: |
```

## Verification

- pnpm-lock.yaml exists at project root (776 KB) — compatible with `--frozen-lockfile`
- `on-pull.yml` uses the same pattern (pnpm/action-setup@v6, setup-node with cache:pnpm) — pattern is proven
- YAML validation: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/iterate.yml')); print('valid')"` — passes

## Blocking Issue

The GITHUB_TOKEN available in this environment lacks the `workflows` permission scope, which is required to push changes to `.github/workflows/` files. To apply:

1. Apply the diff manually, or
2. Use a Personal Access Token (PAT) with `workflows` scope to push, or
3. Merge via PR using a user account with write access
