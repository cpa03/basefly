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
## History

### 2026-02-27

- **Issue #705**: Add Docker configuration for containerized deployment
  - Created branch `feature/705-docker-configuration`
  - Created PR #771
  - Changes:
    - Added `Dockerfile` with multi-stage build for Next.js
    - Added `docker-compose.yml` for local development (Next.js + PostgreSQL + pgAdmin)
    - Updated `README.md` with Docker setup instructions
  - **SUCCESS**: No permission issues, pushed and created PR

### 2026-02-27

- **Issue #595**: GitHub Actions workflows use npm instead of pnpm
  - Implemented fix in branch `fix/595-github-actions-pnpm` (commit d1005e0)
  - Changes:
    - `on-pull.yml`: Changed `cache: 'npm'` to `cache: 'pnpm'`
    - `iterate.yml`: Updated cache to use `pnpm-lock.yaml` instead of `package-lock.json`
    - `iterate.yml`: Added `cache: 'pnpm'` to setup-node actions
    - `iterate.yml`: Changed `npm ci || true` to `pnpm install`
  - **BLOCKED**: GitHub App lacks `workflows` permission to push workflow file changes
  - Commented fix details on issue #595
  QN|  - Fallback: Pivoted to work on issue #705 instead

### 2026-02-25
### 2026-02-27

- **Issue #595**: GitHub Actions workflows use npm instead of pnpm
  - Implemented fix in branch `fix/595-github-actions-pnpm`
  - Changes:
    - `on-pull.yml`: Changed `cache: 'npm'` to `cache: 'pnpm'`
    - `iterate.yml`: Updated cache to use `pnpm-lock.yaml` instead of `package-lock.json`
    - `iterate.yml`: Added `cache: 'pnpm'` to setup-node actions
    - `iterate.yml`: Changed `npm ci || true` to `pnpm install`
  - **BLOCKED**: GitHub App lacks `workflows` permission to push workflow file changes
  - Commented fix details on issue #595

### 2026-02-25

- Created initial platform-engineer.md memory file
- IMPROVEMENT: Enabled test caching in turbo.json by adding `outputs: ["coverage/**"]`
- IMPROVEMENT ATTEMPTED: Change `cache: 'npm'` to `cache: 'pnpm'` in on-pull.yml - Blocked by GitHub App permission restrictions

## Key Observations

1. Repository uses pnpm 10.28.2 as package manager (defined in package.json `packageManager` field)
2. GitHub Actions workflows are incorrectly configured to use npm instead of pnpm
3. GitHub App doesn't have `workflows` permission - blocks modification of `.github/workflows/*` files
4. Turbo 2.8.10 for monorepo orchestration
5. CI workflows could benefit from improved caching strategies

## GitHub App Permission Blocker

The GitHub Actions bot (github-actions[bot]) cannot modify workflow files due to missing `workflows` permission.

**Error**: `refusing to allow a GitHub App to create or update workflow .github/workflows/*.yml without 'workflows' permission`

**Solutions**:
1. Grant the GitHub App "workflows" permission in repository settings
2. Use a Personal Access Token (PAT) with "workflows" scope
3. Manual push by repository owner

## Potential Improvements

1. Enable test caching in turbo.json - DONE (2026-02-25)
2. Fix GitHub Actions pnpm configuration - IMPLEMENTED but BLOCKED (2026-02-27)
3. Add better caching for GitHub Actions
4. Optimize workflow parallelization
5. Add dependency caching improvements
6. Add Docker configuration - DONE (PR #771, 2026-02-27)
