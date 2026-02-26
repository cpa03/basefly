# ADR 0002: Adopt Kysely as Query Builder

## Status

Accepted

## Context

While Prisma provides excellent schema management and type-safe CRUD operations, complex queries require more flexibility. We needed a solution for:
- Dynamic query building
- Complex joins and aggregations
- Better performance for read-heavy operations
- Type-safe SQL without Prisma runtime overhead

## Decision

We adopted **Kysely** as a supplementary query builder alongside Prisma.

### Why Kysely

1. **Type-Safe SQL**: Kysely provides end-to-end type safety for SQL queries
2. **Performance**: No runtime overhead - queries are pre-compiled
3. **Flexibility**: Supports complex queries, dynamic conditions, and raw SQL
4. **Prisma Integration**: Works well with `prisma-kysely` for generated types

## Consequences

### Positive

- Excellent performance for complex queries
- Full type safety without Prisma runtime
- Dynamic query building capabilities
- Works seamlessly with Vercel Postgres

### Negative

- Additional learning curve for SQL knowledge
- Migration management still requires Prisma
- Two query builders to maintain

## Alternatives Considered

### Knex.js
- **Rejected**: Less type-safe, more verbose
- Builder pattern adds runtime overhead

### Drizzle ORM
- **Rejected**: Already using Prisma for schema
- Would add another abstraction layer

### Raw SQL only
- **Rejected**: No type safety, harder to maintain
- Prisma provides better developer experience for CRUD

## Implementation

Kysely is used for:
- Complex aggregations and joins
- Dynamic query building
- Performance-critical reads

Prisma is used for:
- Schema migrations
- Simple CRUD operations
- Transaction management

## Related

- ADR 0001: Use Prisma as ORM
