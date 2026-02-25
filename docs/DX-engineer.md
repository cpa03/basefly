# DX-Engineer Documentation

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
