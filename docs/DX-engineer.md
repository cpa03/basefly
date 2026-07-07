# DX-Engineer Documentation

DX-Engineer focuses on improving Developer Experience through automation, tooling, and process improvements.

### Issue #748: Fix Invalid .nvmrc Value (2026-02-27)

- **Status**: PR Created (#758)
- **Description**: Update .nvmrc from invalid value "20" to valid Node.js LTS version
- **Changes**:
  - Updated `.nvmrc` from "20" to "20.18.0" (valid Node.js LTS version)
- **Verification**:
  - ✅ Valid Node.js version format
  - ✅ works correctly
  - ✅ CI/CD nvm use command pipeline can use specified Node version
- **Related**: Closes issue #748

### Issue #720: Add .nvmrc for Node.js Version Consistency (2026-02-27)

- **Status**: Completed
- **Description**: Created .nvmrc file to specify required Node.js version
- **Changes**:
  - Created `.nvmrc` file at repository root (initially with "20", later fixed to "20.18.0")
- **Related**: Addresses issue #720

## Completed Work

### Issue #686: Remove Unused NextAuth Schema (2026-02-26)

- **Status**: PR Created (#694)
- **Description**: Remove unused NextAuth database schema from packages/auth
- **Changes**:
  - Deleted `packages/auth/db.ts` containing unused NextAuth schema (User, Account, Session, VerificationToken)
  - Removed `kysely` and `@vercel/postgres-kysely` dependencies from `packages/auth/package.json`
  - The auth package now only contains Clerk integration code
- **Verification**:
  - ✅ Typecheck passes
  - ✅ Lint passes
  - ✅ Tests pass (713 tests)
- **Related**: Closes issue #686

### Issue #590: Add Unused Dependency Detection (2026-02-25)

- **Status**: Implemented
- **Description**: Added depcheck for detecting unused dependencies in monorepo
- **Changes**:
  - Added `depcheck@^1.4.7` as devDependency to root `package.json`
  - Added `dx:unused` script: `depcheck . --detailed=false --json`
  - Updated `dx:help` with new command documentation
- **Verification**:
  - ✅ Script added to package.json
  - ✅ Help text updated
- **Related**: Follows up on DX-engineer.md future improvements idea

### Issue #579: Improve Environment Setup Error Messages (2026-02-25)

Two PRs addressed different aspects of this issue:

**PR #606 — pnpm environment verification**
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

**PR #643 — Structured logging migration**
- **Description**: Replace direct console.* calls with centralized pino logger for consistent logging
- **Changes**:
  - Modified `packages/common/src/email.ts` to use pino logger instead of console.log/warn/error
  - Updated JSDoc comment to reflect the change
- **Verification**:
  - ✅ Typecheck passes
  - ✅ Lint passes
- **Related**: Partially addresses issue #589

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
- `pnpm env:verify` - Verify development environment (pnpm, Node version, env files)
- `pnpm dx:setup` - Full environment verification

## Known Limitations

- GitHub App lacks workflow file permissions - cannot push workflow changes directly

## Future Improvements Ideas

- Add dependency-cruiser as alternative to madge
- Add package size tracking
- Add unused dependency detection
- Add duplicate dependency detection
