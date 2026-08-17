# CI/CD Documentation

This document describes the continuous integration and deployment infrastructure for the Basefly project.

## Overview

Basefly uses GitHub Actions for CI/CD with a multi-agent automation system powered by OpenCode CLI. The workflows are designed to maintain code quality, automate maintenance, and enable rapid iteration.

## Workflows

### 1. `on-pull.yml` - Pull Request Handler

**Trigger:**

- Pull request events
- Hourly schedule (cron: `0 * * * *`)
- Manual dispatch

**Purpose:**
Handles incoming pull requests by:

- Checking for conflicts with the default branch
- Running build, lint, and test checks
- Auto-fixing minor issues when possible
- Merging PRs that meet all quality gates

**Key Features:**

- Uses `softprops/turnstyle@v3` for queue management
- 30-minute timeout for long-running operations
- Automatic conflict resolution for trivial cases

### 2. `security-audit.yml` - Dependency Security Scanning

**Trigger:**

- Weekly schedule (Monday 06:00 UTC)
- Push to `main` branch
- PRs affecting `pnpm-lock.yaml`, `package.json`, or the workflow itself
- Manual dispatch

**Purpose:**
Automated dependency vulnerability scanning to catch security issues early.

**Key Features:**

- `pnpm audit` for vulnerability detection (high/critical severity)
- Dependency version consistency check via `pnpm check-deps`
- Outdated dependency reporting via `pnpm outdated`
- Automatic issue creation when vulnerabilities are found
- Artifact upload for audit report retention (30 days)

### 3. `codeql-analysis.yml` - SAST Security Analysis

**Trigger:**

- Weekly schedule (Monday 06:00 UTC)
- Push to `main` branch
- Pull requests targeting `main`
- Manual dispatch

**Purpose:**
Static Application Security Testing (SAST) using GitHub's CodeQL engine to detect security vulnerabilities in the codebase.

**Key Features:**

- Analyzes JavaScript/TypeScript and GitHub Actions code
- Uses `security-extended` and `security-and-quality` query suites
- Results appear as code scanning alerts on GitHub
- Non-blocking for PRs (advisory only)

### Deployment Status (Issue #728)

> **⚠️ Blocked on token permission**: The security scanning workflows above are
> designed, documented, and verified locally, but **not yet deployed** to
> `.github/workflows/`. GitHub blocks GitHub App tokens without the
> `workflows` permission from creating or updating workflow files
> (verified: push rejected + REST API `403 Resource not accessible`).
> This is tracked in [Issue #728](https://github.com/cpa03/basefly/issues/728).

**Ready-to-deploy templates** (canonical sources, verified in CI-equivalent runs):

- `docs/ci/workflows/security-audit.yml` — pnpm audit (high/critical) + outdated deps
- `docs/ci/workflows/codeql-analysis.yml` — CodeQL SAST (javascript-typescript)
- `docs/references/security-audit.yml.ref` — extended variant with automatic issue creation
- `docs/references/codeql-analysis.yml.ref` — extended variant with matrix (js/ts + actions)
- `.github/codeql-config.yml` — CodeQL configuration referenced by the workflow

**Deployment runbook** (requires a token/PAT with `workflows` scope):

```bash
# 1. Copy the canonical templates into active workflows
cp docs/ci/workflows/security-audit.yml  .github/workflows/security-audit.yml
cp docs/ci/workflows/codeql-analysis.yml .github/workflows/codeql-analysis.yml

# 2. (Optional) align actions/setup-node to @v7 to match repo convention:
sed -i 's|actions/setup-node@v4|actions/setup-node@v7|g' .github/workflows/security-audit.yml

# 3. Commit and push with a token that has 'workflows' permission
git add .github/workflows/security-audit.yml .github/workflows/codeql-analysis.yml
git commit -m "fix(security): deploy security scanning workflows (closes #728)"
git push

# Alternative: bash scripts/deploy-security-workflows.sh (same copy logic)
```

**Verification performed (2026-07-31)**: YAML validity confirmed; typecheck 8/8,
lint 9/9 (zero warnings), tests 71 files / 1454 passing, production build passes
with Node 22 (per `.nvmrc`). The branch `fix/issue-728-deploy-security-workflows`
carries the fully verified deployment for immediate push once a token with
`workflows` permission is available.

### 4. `iterate.yml` - Parallel Agent Execution

**Trigger:**

- Push to `main` branch
- Every 4 hours (cron: `0 */4 * * *`)
- Manual dispatch

**Purpose:**
Orchestrates multiple specialist agents in parallel for continuous improvement.

**Stages:**

| Stage       | Agent      | Purpose                             |
| ----------- | ---------- | ----------------------------------- |
| Architect   | RepoKeeper | Repository organization and cleanup |
| Specialists | Multiple   | Domain-specific improvements        |
| PR-Handler  | PR-Handler | Merge management                    |
| Integrator  | Fixer      | Final quality assurance             |

**Specialist Agents:**

- `frontend-engineer` - UI/UX improvements
- `backend-engineer` - API and server logic
- `ai-agent-engineer` - AI integration
- `DX-engineer` - Developer experience
- `security-engineer` - Security enhancements
- `quality-assurance` - Testing and coverage
- `performance-engineer` - Optimization
- `database-architect` - Schema and queries
- `devops-engineer` - CI/CD and infrastructure
- `ui-ux-engineer` - User interface design
- `technical-writer` - Documentation
- `reliability-engineer` - Stability
- `integration-engineer` - Third-party integrations
- `vercel` - Deployment configuration
- `user-story-engineer` - Feature development
- `modularity-engineer` - Code organization
- `hardcoded-eliminator` - Configuration extraction
- `cloudflare` - CDN and edge functions

### 2.5. `quick-check.yml` - Fast-Path CI (Issue #502)

**Trigger:**

- `pull_request` targeting `main` (fast-path jobs)
- Weekly schedule (Monday 06:00 UTC) — full audit
- Manual dispatch (`workflow_dispatch`) — full audit

**Purpose:**
Provides fast feedback (< 5 minutes) for routine PRs (typo fixes, small refactors)
without paying the cost of the AI-heavy orchestration workflows. Splits the
quality gates into parallel jobs:

| Job          | Command                 | Timeout |
| ------------ | ----------------------- | ------- |
| `typecheck`  | `pnpm typecheck`        | 10 min  |
| `lint`       | `pnpm lint`             | 10 min  |
| `test`       | `pnpm test`             | 10 min  |
| `build`      | `pnpm build` (CI mode)  | 15 min  |
| `full-audit` | `pnpm dx:check` + CI validation | 30 min (schedule/dispatch only) |

**Key Features:**

- Parallel jobs for typecheck/lint/test/build so routine PRs get all gates in one pass
- `concurrency` group with `cancel-in-progress: true` to skip stale runs on force-push
- `full-audit` job runs only on schedule or manual dispatch (skipped on PRs)
- CI mode (`CI=true`) allows placeholder env values via `tooling/qa/env-validate.js`

> **⚠️ Deployment status**: This workflow is designed, documented, and validated,
> but **not yet deployed** to `.github/workflows/`. GitHub blocks GitHub App tokens
> without the `workflows` permission from creating or updating workflow files
> (same restriction as Issue #728). The ready-to-deploy canonical template lives at
> `docs/ci/workflows/quick-check.yml`. See the deployment runbook below.

**Deployment runbook** (requires a token/PAT with `workflows` scope):

```bash
# 1. Copy the canonical template into active workflows
cp docs/ci/workflows/quick-check.yml .github/workflows/quick-check.yml

# 2. Commit and push with a token that has 'workflows' permission
git add .github/workflows/quick-check.yml
git commit -m "ci: add fast-path quick-check workflow (closes #502)"
git push
```

**Verification performed (2026-08-14)**: YAML structure validated against the
existing `security-audit.yml` template; passes the CI workflow validator
(`tooling/qa/validate-ci-workflows.js`): uses `pnpm install --frozen-lockfile`,
`cache: "pnpm"`, and action versions at or above minimums (checkout@v7,
setup-node@v7, pnpm/action-setup@v6).

### 3. `paratterate.yml` - Parallel Iteration

**Trigger:**

- Push to `main` branch
- Every 4 hours (cron: `0 */4 * * *`)
- Manual dispatch

**Purpose:**
Alternative parallel execution with different agent personas:

| Job       | Agent      | Focus Area             |
| --------- | ---------- | ---------------------- |
| Architect | RepoKeeper | Repository maintenance |
| BugFixer  | BugFixer   | Bug resolution         |
| Palette   | Palette    | UX improvements        |
| Flexy     | Flexy      | Modularity             |
| Brocula   | Brocula    | Browser console fixes  |

## Workflow Configuration

### Runner

All workflows use `ubuntu-24.04-arm` or `ubuntu-22.04-arm` runners for ARM-based builds.

### Node.js Version

- Target: Node.js 20
- Package Manager: pnpm 10.x

> **⚠️ Known Issue**: Some workflow files still use `npm ci` instead of `pnpm install --frozen-lockfile`. The `on-pull.yml` has been migrated, but `iterate.yml` still has 2 remaining `npm ci` references (architect and integrator jobs). See [Issue #670](https://github.com/cpa03/basefly/issues/670) and [Issue #584](https://github.com/cpa03/basefly/issues/584) for details. Implementation requires GitHub App with `workflows` permission.

### Permissions

```yaml
permissions:
  contents: write
  issues: write
  pull-requests: write
  actions: write
```

### Recommended Workflow Pattern

When creating or updating workflows, use the following pattern for Node.js/pnpm setup:

```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "pnpm"

- name: Install Dependencies
  run: pnpm install --frozen-lockfile
```

This ensures:

- Consistent package manager usage across CI and local development
- Proper caching of pnpm store for faster builds
- Lockfile integrity with `--frozen-lockfile`

> **Note**: Issue [#305](https://github.com/cpa03/basefly/issues/305) tracks the migration of all workflow files to this standardized pattern. Implementation requires GitHub App with `workflows` permission. See the issue for detailed migration steps.

### Concurrency

- `on-pull.yml`: Single group `oc-agent` (no cancel on new runs)
- `iterate.yml`: Per-workflow, per-ref grouping
- `paratterate.yml`: Single group `paratterate`

## Dependabot Configuration

Automated dependency updates are configured in `.github/dependabot.yml`:

### npm/pnpm Updates

- Schedule: Weekly (Monday 06:00 UTC)
- Limit: 10 open PRs
- Groups: Production and development dependencies
- Labels: `dependencies`, `security-engineer`

### GitHub Actions Updates

- Schedule: Weekly (Monday 06:00 UTC)
- Limit: 5 open PRs
- Labels: `github-actions`, `dependencies`, `security-engineer`

## Quality Gates

All PRs must pass:

1. **Build**: `pnpm build` via Turbo
2. **Lint**: `pnpm lint` with zero warnings
3. **Type Check**: `pnpm typecheck`
4. **Tests**: `pnpm test` with Vitest
5. **Dependency Consistency**: `pnpm check-deps` — ensures dependency versions are consistent across all packages in the monorepo ([#726](https://github.com/cpa03/basefly/issues/726))
6. **Circular Dependencies**: `pnpm check:circular` — fails CI on any circular import detected by Madge ([#488](https://github.com/cpa03/basefly/issues/488))
7. **Dependency Audit**: `pnpm audit` (via `security-audit.yml`)
8. **CodeQL Analysis**: SAST scan (via `codeql-analysis.yml`)

### Failure Policy

- Build/lint errors: **Blocking** - PR cannot merge
- Test failures: **Blocking** - PR cannot merge
- Warnings: **Blocking** - Treated as errors
- High/critical vulnerabilities: **Advisory** - Creates issue, non-blocking for PRs

## Dependency Guidelines

### Circular Dependency Detection

Circular imports silently degrade the monorepo: they break tree-shaking, bloat bundles,
and produce hard-to-debug runtime errors. The project enforces acyclic imports with
[Madge](https://github.com/pahen/madge) ([#488](https://github.com/cpa03/basefly/issues/488)):

- **Command**: `pnpm check:circular` — runs `madge --circular --warning --extensions ts,tsx,js,jsx,mjs,cjs apps/ packages/`
- **Config**: `.madgerc` — detective options and exclusion regexes (e.g. `node_modules`, `dist`, `.next`)
- **CI integration**: wired into the `ci:check` and `dx:check` script chains, so circular
  dependencies fail the verification pipeline automatically
- **Policy**: any new circular dependency is a blocking quality-gate failure

### Authoring Rules

1. Keep import graphs **acyclic** at the package boundary — never import a package from a
   module it depends on (e.g. `packages/common` must not import from `packages/api`).
2. When a cycle is unavoidable, extract the shared type/utility into the lowest common
   dependency package (usually `packages/common`) instead of creating a cross-import.
3. Run `pnpm check:circular` locally before opening a PR; the check takes ~3s.
4. Type-only cycles are also flagged — prefer `import type` and skip-type-imports detective
   settings (configured in `.madgerc`) to avoid false positives.

## Branch Strategy

### Default Branch

- `main` - Production-ready code

### Feature Branches

- Named after the specialist/feature (e.g., `devops-engineer`, `frontend-engineer`)
- Must be up-to-date with `main` before PR creation
- Squash-merged after all checks pass

### Protected Branch Rules

- `main` requires passing CI checks
- No direct pushes to `main`
- All changes via pull request

## Deployment

### Vercel Integration

The project is configured for Vercel deployment with:

- **Framework**: Next.js
- **Build Command**: `turbo run build --filter=@saasfly/nextjs`
- **Output Directory**: `apps/nextjs/.next`
- **Regions**: `iad1` (US East), `sfo1` (US West)

### Cloudflare Pages Integration

The project also supports deployment to Cloudflare Pages as an alternative to Vercel.

**Configuration Files:**

- `wrangler.toml` - Cloudflare Workers/Pages configuration

**Build Configuration:**

- **Framework**: Next.js
- **Build Command**: `pnpm install && turbo run build --filter=@saasfly/nextjs`
- **Output Directory**: `apps/nextjs/.next`
- **Node.js Version**: 20

**Environment Variables:**

Set these in Cloudflare Dashboard → Pages → Settings → Environment variables:

| Variable                            | Required | Description                  |
| ----------------------------------- | -------- | ---------------------------- |
| `NEXT_PUBLIC_APP_URL`               | Yes      | Application URL              |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk public key             |
| `CLERK_SECRET_KEY`                  | Yes      | Clerk secret key             |
| `STRIPE_API_KEY`                    | Yes      | Stripe API key               |
| `STRIPE_WEBHOOK_SECRET`             | Yes      | Stripe webhook secret        |
| `POSTGRES_URL`                      | Yes      | PostgreSQL connection string |
| `RESEND_API_KEY`                    | No       | Email service key            |
| `ADMIN_EMAIL`                       | No       | Admin email addresses        |

**Middleware Compatibility:**

The project uses a proper `middleware.ts` file for:

- i18n routing
- Clerk authentication
- Request ID tracking
- Content Security Policy headers

**Edge Runtime:**

The `/api/trpc/edge` route uses Edge Runtime, compatible with Cloudflare Workers.

**Smart Placement:**

Cloudflare Smart Placement is enabled for optimal global distribution.

### Function Configuration

| Path                    | Memory  | Max Duration |
| ----------------------- | ------- | ------------ |
| `/api/**/*.ts`          | 1024 MB | 30s          |
| `/api/webhooks/**/*.ts` | 1024 MB | 60s          |

### Security Headers

Applied to `/api/trpc/*` routes:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

## Local Development

### Prerequisites

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
```

### Available Scripts

| Command               | Description                |
| --------------------- | -------------------------- |
| `pnpm dev`            | Start all apps in dev mode |
| `pnpm dev:web`        | Start web app only         |
| `pnpm build`          | Production build           |
| `pnpm lint`           | Run ESLint                 |
| `pnpm lint:fix`       | Fix linting issues         |
| `pnpm typecheck`      | TypeScript check           |
| `pnpm format`         | Check formatting           |
| `pnpm format:fix`     | Fix formatting             |
| `pnpm test`           | Run tests                  |
| `pnpm test:ui`        | Test UI                    |
| `pnpm test:coverage`  | Test coverage              |
| `pnpm security:audit` | Security audit             |
| `pnpm security:check` | Security check             |

## Troubleshooting

### Common Issues

1. **Workflow not triggering**
   - Check if the branch has required labels
   - Verify the workflow file syntax
   - Ensure permissions are correctly set

2. **Build failures**
   - Run `pnpm install` to ensure dependencies are installed
   - Check Node.js version (requires 18+)
   - Verify environment variables are set

3. **Merge conflicts**
   - Rebase onto `main` before creating PR
   - Use `git fetch origin && git rebase origin/main`

4. **Lint errors**
   - Run `pnpm lint:fix` to auto-fix
   - Check for unused imports/variables
   - Ensure TypeScript strict mode compliance

## Related Documentation

- [Feature Flags](./feature-flags.md)
- [API Specification](./api-spec.md)
- [Test Coverage](./test-coverage.md)
- [Blueprint](./blueprint.md)
