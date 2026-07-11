# Rollback Guide

## Purpose

This document defines the rollback strategy for the Basefly platform. It addresses
the **Release & Rollback Safety** criterion identified in the Phase 1 diagnostic scoring.

## When to Roll Back

A rollback should be considered when:

1. **Build failure** after a deployment
2. **Test regression** that affects production functionality
3. **Security vulnerability** introduced by the release
4. **Performance degradation** exceeding 20% in key metrics
5. **Data integrity** issues detected post-release
6. **API contract** breaking changes that affect consumers

## Rollback Levels

### Level 1: Application Rollback (Code)

**Scope**: Next.js application, API routes, UI components
**Duration**: ~5 minutes

**Steps**:

1. Identify the previous stable version tag:
   ```bash
   git tag --list 'v*' --sort=-v:refname | head -5
   ```
2. Deploy the previous version:
   ```bash
   git checkout v<previous-version>
   pnpm install --no-frozen-lockfile
   pnpm build
   # Deploy using your platform's rollback feature
   ```
3. Verify the rollback:
   ```bash
   pnpm test
   # Run smoke tests on the deployed environment
   ```

### Level 2: Database Rollback (Migration)

**Scope**: Prisma migrations, data schema changes
**Duration**: ~15 minutes

**Prerequisites**:

- All migrations must include a `down` migration or documented rollback SQL
- Database backups must be taken before any release

**Steps**:

1. Identify the last working migration:
   ```bash
   ls -la packages/db/prisma/migrations/ | tail -5
   ```
2. Roll back the database:
   ```bash
   cd packages/db
   npx prisma migrate resolve --rolled-back "<migration-name>"
   ```
3. If data was transformed, restore from backup:
   ```bash
   # Example: psql restore
   pg_restore --dbname=basefly --clean path/to/backup.dump
   ```
4. Verify data integrity with the application:
   ```bash
   pnpm test
   ```

### Level 3: Full Platform Rollback

**Scope**: Application + Database + Configuration
**Duration**: ~30 minutes

**Steps**:

1. **Freeze** all new deployments and PRs
2. **Identify** the last known good deployment (git tag)
3. **Restore** database from backup
4. **Deploy** the previous application version
5. **Verify** all critical paths:
   - Authentication (Clerk)
   - Stripe webhook processing
   - Dashboard functionality
   - K8s cluster management
6. **Monitor** for 15 minutes post-rollback
7. **Document** the incident

## Rollback Prevention (Best Practices)

To minimize the need for rollbacks:

### Pre-Release Checklist

- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript type checks pass (`pnpm typecheck`)
- [ ] Lint passes with zero warnings (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Database migrations tested on staging
- [ ] CHANGELOG.md updated
- [ ] Version bumped according to semver
- [ ] Breaking changes documented in release notes
- [ ] Rollback plan prepared for this release

### Release Safety Measures

1. **Feature flags**: Use feature flags for risky changes
2. **Canary releases**: Deploy to a subset of users first
3. **Database backups**: Automate pre-release DB backups
4. **Smoke tests**: Run critical path tests after deployment
5. **Monitoring**: Track error rates, latency, and business metrics
6. **Lock before deploy**: Use the CI queue to prevent concurrent deployments

## Post-Rollback Steps

After any rollback:

1. **Create a GitHub issue** documenting:
   - The root cause of the failure
   - What was rolled back
   - Impact assessment
   - Preventative measures
2. **Tag the failed release** for reference:
   ```bash
   git tag -a "v<version>-failed-<date>" -m "Failed release - see issue #<number>"
   ```
3. **Update CHANGELOG.md** noting the rollback
4. **Schedule a fix** in the next release cycle
5. **Review** CI/CD pipeline improvements to prevent recurrence

## Automation

The release workflow (`.github/workflows/release.yml`) provides:

- **Automated versioning** from conventional commits
- **Changelog generation** from commit history
- **GitHub Release creation** with auto-generated notes
- **Dry run mode** to preview releases without publishing

For rollback automation, consider:

- Using the previous GitHub Release for one-click deploy
- Automating database backup before release deployment
- Adding a "Rollback" workflow_dispatch trigger in CI
