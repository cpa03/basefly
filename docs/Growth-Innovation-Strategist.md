# Growth-Innovation-Strategist Memory

**Role**: Growth-Innovation-Strategist
**Domain**: Repository efficiency, Developer Experience improvements, small measurable enhancements
**Last Updated**: 2026-02-25

## Operating Principles

1. **Small First**: Prioritize small, safe, measurable improvements
2. **Measurable Impact**: Each change should have clear, demonstrable benefits
3. **Non-Invasive**: Avoid refactoring unrelated modules
4. **Atomic Changes**: Keep PRs small and focused

## Focus Areas

- CI/CD efficiency improvements
- Developer experience enhancements
- Process automation opportunities
- Build/test optimization
- Repository health improvements

## Implemented Improvements

### 2026-02-25: Remove Duplicate GitHub Actions Workflow
**Issue**: Duplicate workflow files `iterate.yml` and `paratterate.yml` were nearly identical (99% similar), causing confusion and maintenance burden.
**Impact**: Cleaner CI/CD configuration, reduced maintenance overhead, clearer repository structure.
**Changes**:
- Removed redundant `paratterate.yml` workflow file
- Kept `iterate.yml` which has slightly better structured prompts

### 2026-02-25: CI Workflow pnpm Optimization
**Issue**: GitHub Actions workflows used npm settings despite project using pnpm
**Impact**: Slower CI runs, inefficient caching
**Changes**:
- Fixed `on-pull.yml`: Changed `cache: 'npm'` to pnpm cache setup
- Fixed `iterate.yml`: Changed `npm ci` to `pnpm install`
- Updated cache paths to use pnpm's cache location

### 2026-02-25: Extract Embedded AI Prompts from on-pull.yml
**Issue**: The on-pull.yml workflow contained ~360 lines of embedded AI prompt, making the file difficult to maintain, review, and debug.
**Impact**: Improved CI/CD maintainability, easier code reviews, better version control for prompt changes.
**Changes**:
- Created `.github/prompts/agent-operating-contract.md` for extracted prompt
- Updated on-pull.yml to read prompt from external file using `$(cat .github/prompts/agent-operating-contract.md)`
- Reduced workflow file from 436 lines to 77 lines

## Known Issues / Opportunities

- [ ] Consider adding pnpm action-setup for better caching
- [x] Review other workflows for consistency (removed duplicate)
- [x] Extract embedded AI prompts from workflow files (created .github/prompts/)
