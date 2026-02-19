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

# 3. Initialize the database
pnpm db:push

# 4. Start development server
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

| Command         | Description                                              |
| --------------- | -------------------------------------------------------- |
| `pnpm dx:check` | Run all checks: typecheck + lint + test + security audit |
| `pnpm dx:fix`   | Auto-fix all fixable issues: lint + format               |

These commands streamline common developer workflows:

- Use `pnpm dx:check` before pushing to catch issues early
- Use `pnpm dx:fix` to quickly fix formatting and lint issues

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

## CI/CD

The project uses GitHub Actions for CI/CD. See [CI/CD Documentation](./ci-cd.md) for details.

To run CI checks locally:

```bash
# Run all checks that CI runs
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Additional Resources

- [API Specification](./api-spec.md)
- [Roadmap](./roadmap.md)
- [Feature Flags](./feature-flags.md)
- [Test Coverage](./test-coverage.md)
