# Release Process

## Purpose

This document defines the formal release procedure for the Basefly platform. It
addresses the **Release & Rollback Safety** criterion identified in the Phase 1
diagnostic scoring, and it complements [Rollback Guide](./rollback-guide.md)
(which covers the rollback half of the release lifecycle).

## Versioning

- Basefly follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):
  - **MAJOR** — incompatible API / breaking changes
  - **MINOR** — backwards-compatible features
  - **PATCH** — backwards-compatible bug fixes
- The canonical version lives in the root `package.json` `version` field
  (currently `1.0.0`).
- Releases are tagged with an **annotated** tag prefixed with `v`
  (e.g. `v1.0.1`). The rollback guide relies on `git tag --list 'v*'`, so this
  convention must be maintained.
- `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
  and must always contain an entry for the version being released.

## Release Triggers

A release is cut when:

1. `main` contains merged changes that should reach production (feature,
   security fix, or hotfix), and
2. all checks are green on `main`, and
3. the maintainer decides the accumulated changes warrant a version bump.

There is no fixed cadence; release on demand, preferring small frequent
releases over large infrequent ones.

## Pre-Release Checklist

Before cutting a release, confirm:

- [ ] `main` is up to date (`git fetch origin && git status`).
- [ ] `pnpm release:check` passes — the full verification gate
      (typecheck + lint + test + `security:audit` + `check-deps`).
- [ ] `pnpm check:circular` reports no circular dependencies (if changed code
      touches packages).
- [ ] `CHANGELOG.md` has a dated `## [X.Y.Z] - YYYY-MM-DD` entry describing the
      changes, grouped by `Added` / `Changed` / `Fixed` / `Security`.
- [ ] `package.json` `version` is bumped to the new version.
- [ ] `.env.example` is in sync with any new environment variables.

## Release Steps

```bash
# 1. Ensure main is current
git checkout main
git pull origin main

# 2. Bump the version (semver) in root package.json

# 3. Add the CHANGELOG entry: ## [X.Y.Z] - YYYY-MM-DD

# 4. Commit the version + changelog changes
git add package.json pnpm-lock.yaml CHANGELOG.md
git commit -m "chore(release): prepare vX.Y.Z"

# 5. Run the verification gate explicitly
pnpm release:check

# 6. Create the annotated release tag (re-runs the gate, then tags)
pnpm release:tag            # creates vX.Y.Z

# 7. Push the branch and the tag
git push origin main
git push origin vX.Y.Z

# 8. Verify the release
#    - Tag exists: git tag --list 'v*'
#    - Vercel auto-deploys main; confirm the deployment succeeds
#    - Smoke-test the production URL (login, dashboard, billing pages)
```

The `release:tag` script refuses to run when:

- the working tree has uncommitted changes to tracked files,
- the tag `v<version>` already exists,
- `CHANGELOG.md` has no `## [<version>]` entry,
- the `pnpm dx:check` gate fails.

> **Known gate blocker (as of 2026-08-04):** `pnpm security:audit` currently
> reports one moderate finding — `@opentelemetry/core <2.8.0` (transitive via
> `contentlayer2`). No 1.x patch exists, and overriding to the 2.x line is a
> breaking major-version jump for the content pipeline, so the finding is
> tracked rather than force-patched. Releases that must proceed while this is
> open require the hotfix `--skip-verify` path with sign-off, or resolving the
> finding first.

## Hotfix Flow

For urgent production fixes:

1. Branch from `main`: `git checkout -b hotfix/description main`
2. Apply the minimal fix (PATCH version bump).
3. Follow steps 3–8 above.
4. If the gate must be bypassed (extreme emergency), use
   `pnpm release:tag -- --skip-verify` **only** with explicit human sign-off,
   and open a follow-up issue to restore the gate afterwards.

## Rollback

If a release must be undone, follow the [Rollback Guide](./rollback-guide.md):

- **Level 1 — Application rollback**: redeploy the previous `v*` tag (~5 min).
- **Level 2 — Database rollback**: revert Prisma migrations with documented
  `down` SQL (~15 min).
- **Level 3 — Full rollback**: application + database + env parity (~60 min).

Rollback triggers include build failure, test regression affecting production,
security vulnerabilities, >20% performance degradation, data integrity issues,
and breaking API contract changes.

## Post-Release Verification

- Confirm `git tag --list 'v*'` shows the new tag.
- Confirm the Vercel deployment for the pushed `main` succeeded.
- Spot-check health endpoint and core flows (auth, dashboard, billing).
- Monitor for the rollback trigger conditions listed in the rollback guide.

## Related Documents

- [Rollback Guide](./rollback-guide.md) — how to undo a release
- [CHANGELOG.md](../CHANGELOG.md) — release history
- [DEVELOPMENT.md](./DEVELOPMENT.md) — local development setup
- [CI/CD Documentation](./ci-cd.md) — pipeline behavior
