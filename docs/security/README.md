# Security Documentation

This directory contains security-related documentation and configurations for the Basefly project.

## Contents

- `security-workflows.md` — CI/CD security scanning workflow definitions
  - `security-audit.yml` — pnpm audit and dependency consistency checks
  - `codeql.yml` — CodeQL semantic code analysis
  - `on-pull.yml` — Dependency consistency check integration

## Quick Start

To run a local security audit:

```bash
./scripts/security-audit.sh
```

This checks for dependency vulnerabilities, version consistency, and outdated packages.

## CI Integration

The workflow files documented in `security-workflows.md` need to be added to
`.github/workflows/` by a maintainer with the `workflows` permission on the repository.

## Related Issues

- [#728](https://github.com/cpa03/basefly/issues/728) — Add security scanning workflows to CI
- [#786](https://github.com/cpa03/basefly/issues/786) — Stripe webhook logs partial secret (fixed)
