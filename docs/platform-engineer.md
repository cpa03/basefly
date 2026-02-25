# Platform Engineer - Long-term Memory

## Domain
Platform Engineer - Infrastructure, DevOps, Build Systems, CI/CD

## Objective
Deliver small, safe, measurable improvements strictly inside the platform/domain.

## Scope
- CI/CD workflows optimization
- Build system configuration (Turbo, Vite, etc.)
- Package manager configuration (pnpm, npm, yarn)
- Development tooling improvements
- Repository infrastructure
- Developer experience improvements

## Execution Mode
1. If open PR with label `platform-engineer` exists → ensure up to date with default branch, review, fix if necessary and comment on that PR. Skip other job.
2. If Issue exists → execute → create/update PR.
3. If none → proactive scan limited to domain → create/update PR.
4. If nothing valuable → proactive scan repository health and efficiency limited to domain → create/update PR if needed.

## PR Requirements
- Label: `platform-engineer`
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## History

### 2026-02-25
- Created initial platform-engineer.md memory file
- Identified turbo.json test caching optimization opportunity
- IMPROVEMENT: Enabled test caching in turbo.json by adding `outputs: ["coverage/**"]` - This allows Turbo to cache test coverage between runs, speeding up CI when tests haven't changed
- Created initial platform-engineer.md memory file
- Identified turbo.json test caching optimization opportunity

### Key Observations
1. The `test` task in turbo.json has `cache: false` which disables caching
2. CI workflows could benefit from improved caching strategies
3. Repository uses pnpm 10.28.2 as package manager
4. Turbo 2.8.10 for monorepo orchestration
5. Multiple GitHub workflows exist for different purposes

### Potential Improvements
1. Enable test caching in turbo.json (requires outputs configuration)
2. Add better caching for GitHub Actions (pnpm cache, node cache)
3. Optimize workflow parallelization
4. Add dependency caching improvements
