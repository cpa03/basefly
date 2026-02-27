# ADR 0001: Choose Prisma as ORM

## Status

Accepted

## Context

We need an ORM for database operations in our Next.js SaaS application. The project requires:
- TypeScript support with strong type safety
- PostgreSQL database
- Easy migrations and schema management
- Good developer experience

## Decision

We have chosen **Prisma** as the ORM for this project.

## Consequences

### Positive

- **Type Safety**: Prisma provides end-to-end type safety with generated types from schema
- **Developer Experience**: Excellent CLI for migrations, schema management, and prototyping
- **Migration System**: Built-in migration system that tracks schema changes
- **Query Builder**: Intuitive API for building queries without raw SQL
- **Multi-database Support**: Can switch databases with minimal code changes
- **Active Community**: Well-maintained with regular updates and good documentation

### Negative

- **Performance**: Additional abstraction layer may add slight overhead compared to raw queries
- **Learning Curve**: New query syntax to learn
- **Runtime Queries**: Dynamic queries require careful handling for type safety

## Alternatives Considered

### Drizzle ORM

- Lighter weight with SQL-like syntax
- More control over queries
- **Rejected**: Smaller community, less mature tooling

### TypeORM

- Mature ORM with many features
- **Rejected**: Less type-safe, steeper learning curve

### Raw SQL (node-postgres)

- Maximum control and performance
- **Rejected**: Lose type safety, more boilerplate code

## Related

- [Data Blueprint](../blueprint.md)
- [ADR 0002: Adopt Kysely Query Builder](./0002-adopt-kysely-query-builder.md)
