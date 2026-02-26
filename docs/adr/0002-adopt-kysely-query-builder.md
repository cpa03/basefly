# ADR 0002: Adopt Kysely Query Builder

## Status

Accepted

## Context

While Prisma handles schema management and migrations, we need a more flexible query builder for complex queries and better runtime performance. The project requires:
- Type-safe complex queries
- JOIN operations with proper typing
- PostgreSQL-specific features

## Decision

We have adopted **Kysely** as the query builder for runtime queries alongside Prisma.

## Consequences

### Positive

- **Type Safety**: Full type inference for complex queries including JOINs
- **Lightweight**: Minimal runtime overhead
- **Flexibility**: Easy to compose complex queries
- **PostgreSQL Support**: Excellent support for PostgreSQL-specific features
- **Schema Integration**: Can generate types from Prisma schema

### Negative

- **Additional Learning**: New API to learn on top of Prisma
- **Migration Complexity**: Schema changes must still go through Prisma
- **Two Tools**: Requires understanding when to use each tool

## Alternatives Considered

### Prisma Raw Queries

- Can execute raw SQL through Prisma
- **Rejected**: Loses type safety for complex queries

### Knex.js

- Mature query builder
- **Rejected**: Less type-safe than Kysely, more verbose

### Direct node-postgres

- Maximum control
- **Rejected**: Too much boilerplate, no type safety

## Related

- [Data Blueprint](../blueprint.md)
- [ADR 0001: Choose Prisma as ORM](./0001-choose-prisma-as-orm.md)
