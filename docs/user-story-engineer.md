# User Story Engineer - Long-term Memory

## Overview
This document serves as the long-term memory for the user-story-engineer domain in the OpenX Basefly project.

## Current State (2026-02-25)

### Domain Focus
- Small, safe, measurable improvements
- Developer experience (DX) enhancements
- Code quality improvements
- User-facing feature improvements

### Implementation Criteria
- Atomic, small changes
- Measurable outcomes
- No breaking changes
- Follow existing code patterns
- Build/lint/test must pass

## Past Improvements

### 2026-02-25
- **Issue #579**: Improve environment setup error messages
  - Added `preinstall` script to package.json that validates pnpm is used
  - Clear error message when pnpm is not installed
  - Updated CONTRIBUTING.md to mention .nvmrc and nvm usage
  - Files modified:
    - `package.json` - Added preinstall script
    - `CONTRIBUTING.md` - Added nvm usage instructions

## Known Issues (User-Story-Engineer Domain)
- Issue #523: Audit and optimize barrel exports for tree-shaking (P3)
- Issue #578: Remove duplicate health check endpoint (P3)
- Issue #589: Reduce console.log usage - pino logger not consistently used (P2)

## Best Practices

### Small Improvements Checklist
1. ✅ Identify the issue clearly
2. ✅ Verify existing patterns in codebase
3. ✅ Make minimal changes
4. ✅ Test locally before PR
5. ✅ Ensure build/lint/test pass
6. ✅ Create PR with domain label

### PR Requirements
- Label: user-story-engineer
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## References
- CONTRIBUTING.md - Contributor guidelines
- docs/ - Project documentation
