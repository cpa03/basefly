# ADR 0001: Use Prisma as ORM

## Status

Accepted

## Context

The project requires a database abstraction layer to manage PostgreSQL data access. We needed an ORM that provides:
- Type-safe database operations
- Schema migration management
- Good developer experience
- Strong TypeScript support

## Decision

We chose **Prisma** as the primary ORM for this project.

### Why Prisma

1. **Type Safety**: Prisma generates fully typed clients from the schema, providing end-to-end type safety
2. **Schema Management**: Prisma Migrate provides robust migration capabilities with SQL-level control
3. **Developer Experience**: Excellent CLI tools, clear error messages, and great debugging experience
4. **Adoption**: Widely used in the Next.js ecosystem with strong community support

## Consequences

### Positive

- Fully typed database operations without manual type definitions
- Easy schema migrations with `prisma migrate`
- Prisma Studio provides GUI for database inspection
- Strong integration with Next.js and Vercel

### Negative

- Runtime overhead compared to raw SQL
- Limited flexibility for complex queries (solved with Kysely)
- Prisma Client is relatively large bundle size

## Alternatives Considered

### Drizzle ORM
- **Rejected**: Less mature ecosystem, fewer migration tools
- Younger project with smaller community

### TypeORM
- **Rejected**: Less type-safe, more verbose code
- ActiveRecord pattern less suitable for this project

### Raw SQL / Kysely only
- **Rejected**: No schema management, more boilerplate
- Prisma provides essential migration tooling

## Related

- ADR 0002: Adopt Kysely as Query Builder (for complex queries)
