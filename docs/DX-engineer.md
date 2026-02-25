# DX-Engineer Documentation

## Overview

DX-Engineer focuses on improving Developer Experience through automation, tooling, and process improvements.

## Completed Work

### Issue #579: Improve Environment Setup Error Messages (2026-02-25)

- **Status**: PR Created (#606)
- **Description**: Enhanced environment setup to provide clear error messages when pnpm is missing
- **Changes**:
  - Modified `env:verify` script to check for pnpm installation and version
  - Provides clear installation instructions (curl, npm, corepack methods)
  - Validates pnpm version is 10.x (required by packageManager)
  - Updated CONTRIBUTING.md with improved pnpm installation instructions
- **Verification**:
  - ✅ `pnpm env:verify` works correctly
  - ✅ Typecheck passes
  - ✅ Lint passes

### Issue #488: Add Circular Dependency Detection

- **Status**: Partially Implemented (script and config added, CI job pending due to permissions)
- **Date**: 2026-02-25
- **Description**: Added madge for circular dependency detection in monorepo
- **Changes**:
  - Added `madge@^7.0.0` as devDependency to root `package.json`
  - Added `check:circular` script: `madge --circular --warning --extensions ts,tsx,js,jsx,mjs,cjs apps/ packages/`
  - Created `.madgerc` configuration file with TypeScript and ESM support
  - **Note**: CI workflow job could not be added due to GitHub App permissions restriction
- **Verification**:
  - ✅ `pnpm check:circular` runs successfully
  - ✅ Typecheck passes
  - ✅ Lint passes
  - ⚠️ Detects 4 existing circular dependencies in codebase

## Scripts Available

- `pnpm check:circular` - Detect circular dependencies
- `pnpm env:verify` - Verify development environment (pnpm, Node version, env files)
- `pnpm dx:setup` - Full environment verification

## Known Limitations

- GitHub App lacks workflow file permissions - cannot push workflow changes directly

## Future Improvements Ideas

- Add dependency-cruiser as alternative to madge
- Add package size tracking
- Add unused dependency detection
- Add duplicate dependency detection

## Overview

DX-Engineer focuses on improving Developer Experience through automation, tooling, and process improvements.

## Active Work

### Issue #488: Add Circular Dependency Detection

- **Status**: Implemented
- **Date**: 2026-02-25
- **Description**: Added madge for circular dependency detection in monorepo
- **Changes**:
  - Added `madge@^7.0.0` as devDependency to root `package.json`
  - Added `check:circular` script: `madge --circular --warning --extensions ts,tsx,js,jsx,mjs,cjs apps/ packages/`
  - Created `.madgerc` configuration file with TypeScript and ESM support
  - Added `circular-deps` job to `.github/workflows/on-pull.yml`
- **Verification**:
  - ✅ `pnpm check:circular` runs successfully
  - ✅ Typecheck passes
  - ✅ Lint passes
  - ✅ Tests pass (565 tests)
- **Note**: Tool correctly detects 4 existing circular dependencies in codebase

## Scripts Available

- `pnpm check:circular` - Detect circular dependencies

## Future Improvements Ideas

- Add dependency-cruiser as alternative to madge
- Add package size tracking
- Add unused dependency detection
- Add duplicate dependency detection
