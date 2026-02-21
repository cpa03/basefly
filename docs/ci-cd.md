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

### 2. `iterate.yml` - Parallel Agent Execution

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

> **Note**: Some workflow files may still reference `npm ci`. These should be migrated to use `pnpm/action-setup@v4` with `pnpm install --frozen-lockfile` for consistency with the project's package manager configuration. See the recommended workflow pattern below.

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

### Failure Policy

- Build/lint errors: **Blocking** - PR cannot merge
- Test failures: **Blocking** - PR cannot merge
- Warnings: **Blocking** - Treated as errors

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
