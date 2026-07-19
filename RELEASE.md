# Release Process

This document describes the release process for Basefly.

## Versioning

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **MAJOR** (1.x.x): Breaking API or database changes
- **MINOR** (x.1.x): New features, backward-compatible
- **PATCH** (x.x.1): Bug fixes, security patches

## Release Workflow

### Prerequisites

Before creating a release, ensure:

- [ ] All CI checks pass on `main`
- [ ] CHANGELOG.md is updated with the new version entry
- [ ] All tests pass: `pnpm test`
- [ ] Lint passes: `pnpm lint`
- [ ] Type check passes: `pnpm typecheck`

### Creating a Release (Manual)

1. **Update CHANGELOG.md**

   Add an entry for the new version following the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format:

   ```markdown
   ## [1.1.0] - 2026-07-19

   ### Added

   - New feature description

   ### Fixed

   - Bug fix description

   ### Security

   - Security improvement description
   ```

2. **Commit the CHANGELOG update**

   ```bash
   git add CHANGELOG.md
   git commit -m "docs: update CHANGELOG for v1.1.0"
   ```

3. **Create and push the version tag**

   ```bash
   git tag -a "v1.1.0" -m "Release v1.1.0"
   git push origin v1.1.0
   ```

4. **Create GitHub Release**

   Once the tag is pushed, create a release on GitHub:

   ```bash
   gh release create "v1.1.0" \
     --title "v1.1.0" \
     --notes "See CHANGELOG.md for details" \
     --target main
   ```

   Or use the GitHub UI: Navigate to Releases → Draft a new release → select the tag.

### Automated Release (Future)

A GitHub Actions workflow (`.github/workflows/release.yml`) is defined to automate this process:

**Workflow**: `.github/workflows/release.yml`

The workflow:

1. Triggers on `v*` tag pushes or manually via `workflow_dispatch`
2. Validates the release by running lint, typecheck, and tests
3. Verifies CHANGELOG.md has an entry for the version
4. Creates a GitHub Release with notes extracted from CHANGELOG.md

To deploy the workflow, a maintainer with `workflows` permission needs to push it to `main`.

## Rollback Strategy

### Code Rollback

If a release causes issues:

1. **Revert the version tag locally**:

   ```bash
   git push --delete origin v1.1.0
   git tag -d v1.1.0
   ```

2. **Revert the commit**:

   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Delete the faulty GitHub Release**:

   ```bash
   gh release delete v1.1.0
   ```

4. **Patch forward**:

   Create a hotfix branch from the last known good commit, apply the fix, and release as a patch version bump.

### Database Rollback

Before reverting code, check if the release included database migrations:

1. **Identify the migration**: Check `packages/db/prisma/migrations/` for the migration that needs reverting.

2. **Run the rollback**:

   ```bash
   pnpm db:migrate:down  # Reverts the last migration
   ```

3. **Verify**: Ensure the database schema is back to the previous state before deploying the reverted code.

### Hotfix Process

For urgent production fixes:

1. Branch from the latest release tag:

   ```bash
   git checkout -b hotfix/critical-fix v1.0.0
   ```

2. Apply the fix and commit.

3. Tag and release as a patch version bump:

   ```bash
   git tag -a "v1.0.1" -m "Hotfix: critical fix description"
   git push origin v1.0.1
   ```

4. Merge the hotfix back to `main`:

   ```bash
   git checkout main
   git merge hotfix/critical-fix
   git push origin main
   ```
