# Development Quick Start Guide

This guide provides a quick reference for local development setup and common tasks.

## Prerequisites

- **Node.js**: v18 or higher (v20 recommended)
- **pnpm**: v10.28.2 (specified in `packageManager` field)
- **PostgreSQL**: For local database development
- **Git**: For version control

## Quick Start

```bash
# 1. Clone and install dependencies
git clone https://github.com/cpa03/basefly.git
cd basefly
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Verify your environment (optional but recommended)
pnpm dx:setup

# 4. Initialize the database
pnpm db:push

# 5. Start development server
pnpm dev:web
```

## Common Commands

### Development

| Command          | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `pnpm dev`       | Start all development servers in parallel                               |
| `pnpm dev:web`   | Start web development server (excludes stripe)                          |
| `pnpm build`     | Build all packages and apps                                             |
| `pnpm clean`     | Clean all node_modules                                                  |
| `pnpm clean:all` | Clean all generated files (node_modules, .turbo, .next, dist, coverage) |
| `pnpm reset`     | Full reset: clean all + reinstall dependencies                          |

### Code Quality

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `pnpm lint`       | Run ESLint across all packages |
| `pnpm lint:fix`   | Run ESLint with auto-fix       |
| `pnpm format`     | Check code formatting          |
| `pnpm format:fix` | Format code with Prettier      |
| `pnpm typecheck`  | Run TypeScript type checking   |

### DX Convenience Scripts

These commands streamline common developer workflows and provide a consistent experience:

| Command         | Description                                            |
| --------------- | ------------------------------------------------------ |
| `pnpm dx:quick` | Quick feedback: typecheck + lint only (fastest check)  |
| `pnpm dx:check` | Full checks: typecheck + lint + test + security audit  |
| `pnpm dx:fix`   | Auto-fix all fixable issues: lint + format             |
| `pnpm dx:deps`  | Check for outdated dependencies and run security audit |
| `pnpm dx:setup` | Verify development environment (env files, deps)       |
| `pnpm dx:all`   | Comprehensive: setup + check + deps                    |
| `pnpm dx:ci`    | Simulate CI locally: dx:check + build                  |

**Recommended workflow:**

- **Before pushing**: `pnpm dx:quick` - Fast feedback in seconds
- **Before PR**: `pnpm dx:check` - Full quality gate
- **First setup**: `pnpm dx:setup` - Verify your environment
- **CI simulation**: `pnpm dx:ci` - Exactly what CI runs

### Testing

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm test`          | Run all tests                  |
| `pnpm test:watch`    | Run tests in watch mode        |
| `pnpm test:ui`       | Run tests with Vitest UI       |
| `pnpm test:coverage` | Run tests with coverage report |

### Database

| Command                  | Description                     |
| ------------------------ | ------------------------------- |
| `pnpm db:push`           | Push schema changes to database |
| `pnpm db:generate`       | Generate Prisma client          |
| `pnpm db:migrate`        | Run database migrations (dev)   |
| `pnpm db:migrate:deploy` | Run database migrations (prod)  |
| `pnpm db:studio`         | Open Prisma Studio GUI          |

## Project Structure

```
basefly/
├── apps/
│   └── nextjs/          # Main Next.js application
├── packages/
│   ├── api/             # tRPC API definitions
│   ├── auth/            # Clerk authentication
│   ├── common/          # Shared utilities
│   ├── db/              # Database (Prisma + Kysely)
│   ├── stripe/          # Stripe integration
│   └── ui/              # Shared UI components
├── tooling/
│   ├── eslint/          # Shared ESLint config
│   ├── prettier/        # Shared Prettier config
│   ├── tailwind/        # Shared Tailwind config
│   └── typescript/      # Shared TypeScript config
└── docs/                # Documentation
```

## Environment Variables

This project uses many environment variables for integrations. See `.env.example` for the complete list with detailed comments.

### Required Variables

| Variable | Description | How to Get |
| -------- | ----------- | ---------- |
| `NEXT_PUBLIC_APP_URL` | Your app's URL (e.g., `http://localhost:3000`) | Set to your local URL |
| `POSTGRES_URL` | PostgreSQL connection string | Create a Vercel Postgres or use local Postgres |
| `CLERK_SECRET_KEY` | Clerk backend secret | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend key | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |

### Payment Integration (Stripe)

| Variable | Description | How to Get |
| -------- | ----------- | ---------- |
| `STRIPE_API_KEY` | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks |
| `NEXT_PUBLIC_STRIPE_*` | Stripe publishable keys | From Stripe API Keys page |

### Email Integration (Resend)

| Variable | Description | How to Get |
| -------- | ----------- | ---------- |
| `RESEND_API_KEY` | Resend API key | [Resend Dashboard](https://resend.com) → API Keys |
| `RESEND_FROM` | Sender email address | Verify a domain in Resend |

### Admin Access

| Variable | Description |
| -------- | ----------- |
| `ADMIN_EMAIL` | Comma-separated email addresses that get admin access |

### Quick Setup Tips

1. **Minimum required for local dev**: `NEXT_PUBLIC_APP_URL`, `POSTGRES_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`
2. **For payments**: Add Stripe keys (can use test mode)
3. **For emails**: Add Resend key (can use Resend's test API)
4. **For admin**: Set `ADMIN_EMAIL` to your email

> **Pro tip**: Start with just the required variables. Add integrations one at a time as you need them.

See `.env.example` for all required environment variables. Key variables:

| Variable              | Description                  |
| --------------------- | ---------------------------- |
| `NEXT_PUBLIC_APP_URL` | Application URL              |
| `POSTGRES_URL`        | PostgreSQL connection string |
| `CLERK_SECRET_KEY`    | Clerk authentication secret  |
| `STRIPE_API_KEY`      | Stripe API key               |
| `RESEND_API_KEY`      | Resend email API key         |

## Feature Flags

Feature flags are documented in `.env.example` with detailed comments. Key flags:

- `ENABLE_BILLING` - Enable/disable billing features
- `ENABLE_CLUSTERS` - Enable/disable cluster management
- `ENABLE_ADMIN_DASHBOARD` - Enable/disable admin dashboard

## Troubleshooting

### Quick Fix

```bash
# Full reset: clean all generated files and reinstall
pnpm reset
```

### Dependency Issues

```bash
# Clear pnpm cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Issues

```bash
# Clear turbo cache and rebuild
pnpm turbo build --force
```

### Database Issues

```bash
# Reset database (WARNING: destructive)
pnpm db:push --force-reset
```
## Common Pitfalls

### Environment Setup

- **Missing `.env.local`**: Always copy `.env.example` to `.env.local` before starting. The app will fail to start without required environment variables.

- **Wrong pnpm version**: This project requires pnpm v10.x. Check with `pnpm --version` and install via `corepack enable` or the [official installer](https://pnpm.io/installation).

- **PostgreSQL not running**: Ensure PostgreSQL is running locally or use a cloud provider (Vercel, Supabase). Check `POSTGRES_URL` format: `postgresql://user:password@host:5432/dbname`.

### Development Server

- **Port already in use**: If port 3000 is taken, kill the process or use `pnpm dev:web -p 3001` to specify a different port.

- **Hot reload not working**: Try clearing `.next` cache: `rm -rf apps/nextjs/.next`.

### Dependencies

- **Lock file conflicts**: If you see strange dependency errors, try `pnpm dedupe` or `pnpm reset`.

- **Missing peer dependencies**: Always run `pnpm install` after pulling changes - don't use `npm install` or `yarn`.

### TypeScript & Linting

- **Type errors blocking build**: Run `pnpm dx:fix` first - many issues can be auto-fixed.

- **ESLint taking too long**: Use `pnpm dx:quick` for fast feedback (skips tests and security audit).

### Database

- **Schema out of sync**: Always run `pnpm db:push` after pulling schema changes.

- **Migration conflicts**: If migrations fail, check for conflicting schema changes in `packages/db/prisma/schema.prisma`.


## CI/CD

The project uses GitHub Actions for CI/CD. See [CI/CD Documentation](./ci-cd.md) for details.

To run CI checks locally:

```bash
# Simulate full CI pipeline
pnpm dx:ci

# Or step by step:
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Additional Resources

- [API Specification](./api-spec.md)
- [Roadmap](./roadmap.md)
- [Feature Flags](./feature-flags.md)
- [Test Coverage](./test-coverage.md)
