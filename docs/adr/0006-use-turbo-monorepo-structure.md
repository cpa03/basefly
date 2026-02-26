# ADR 0006: Use Turbo Monorepo Structure

## Status

Accepted

## Context

The project requires a monorepo structure for:
- Shared packages across applications
- Code reuse between frontend and backend
- Unified tooling and configuration
- Independent deployment of applications

## Decision

We adopted **Turborepo** for monorepo management.

### Why Turbo

1. **Performance**: Intelligent caching and task orchestration
2. **Flexibility**: Works with any package manager (pnpm, npm, yarn)
3. **Simplicity**: Simple configuration in turbo.json
4. **Adoption**: Industry standard for Next.js monorepos
5. **Remote Caching**: Optional remote cache for CI/CD

## Consequences

### Positive

- Fast builds with caching
- Easy code sharing between packages
- Unified lint, format, and typecheck
- Independent deployments
- Great Vercel integration

### Negative

- Additional complexity in setup
- Learning curve for team
- Cache invalidation can be tricky

## Alternatives Considered

### Nx
- **Rejected**: More complex configuration
- Overkill for project size

### Lerna
- **Rejected**: No built-in caching
- Less actively maintained

### npm workspaces
- **Rejected**: No task orchestration
- Slower builds

### pnpm workspaces only
- **Rejected**: No caching or task running
- Need separate tooling

## Project Structure

```
apps/
  └── nextjs/          # Main Next.js application

packages/
  ├── api/             # tRPC API definitions
  ├── auth/            # Clerk auth configuration
  ├── common/          # Shared utilities
  ├── db/              # Prisma schema and migrations
  ├── stripe/          # Stripe integration
  └── ui/              # Shared UI components

tooling/
  ├── eslint/          # Shared ESLint configs
  ├── prettier/        # Shared Prettier configs
  ├── tailwind/        # Shared Tailwind config
  └── typescript/      # Shared TS configs
```

## Related

- turbo.json: Turbo configuration
- package.json: Workspace configuration
