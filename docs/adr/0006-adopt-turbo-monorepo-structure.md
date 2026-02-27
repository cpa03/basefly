# ADR 0006: Adopt Turbo Monorepo Structure

## Status

Accepted

## Context

We need to structure our codebase to support:
- Multiple packages (UI, API, DB, Auth, etc.)
- Shared configuration
- Efficient builds
- Code sharing between applications

## Decision

We have adopted **Turborepo** as the monorepo build system for this project.

## Consequences

### Positive

- **Efficient Builds**: Incremental builds with caching
- **Code Sharing**: Easy sharing between packages
- **Consistency**: Shared tooling across packages
- **CI/CD**: Faster pipelines with caching
- **Developer Experience**: Unified commands, clear structure

### Negative

- **Learning Curve**: New tooling to learn
- **Complexity**: More complex than single-package
- **Debugging**: More complex debugging across packages
- **Build Times**: Initial setup can be slow

## Alternatives Considered

### Nx

- Powerful, enterprise-grade
- **Rejected**: More complex, steeper learning curve

### pnpm Workspaces

- Native pnpm support
- **Rejected**: Less efficient builds, no caching

### Lerna

- Traditional monorepo tool
- **Rejected**: Less active maintenance

## Related

- [Project Structure](../../AGENTS.md#project-structure)
