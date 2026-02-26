# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records that document key technical decisions made for this project.

## What is an ADR?

An Architecture Decision Record is a document that captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows the standard format:
1. **Title**: Decision title
2. **Status**: Proposed | Accepted | Deprecated | Superseded
3. **Context**: The issue motivating this decision
4. **Decision**: What we've decided to do
5. **Consequences**: Positive and negative outcomes
6. **Alternatives Considered**: Other options and why they were rejected

## Index

| Number | Title | Status |
|--------|-------|--------|
| [0001](./0001-choose-prisma-as-orm.md) | Choose Prisma as ORM | Accepted |
| [0002](./0002-adopt-kysely-query-builder.md) | Adopt Kysely Query Builder | Accepted |
| [0003](./0003-use-clerk-for-authentication.md) | Use Clerk for Authentication | Accepted |
| [0004](./0004-adopt-tRPC-for-api.md) | Adopt tRPC for API | Accepted |
| [0005](./0005-use-stripe-for-billing.md) | Use Stripe for Billing | Accepted |
| [0006](./0006-adopt-turbo-monorepo-structure.md) | Adopt Turbo Monorepo Structure | Accepted |

## Contributing

To add a new ADR:
1. Create a new file with format `XXXX-title.md`
2. Follow the ADR format above
3. Update this index
4. Update `docs/README.md`

## References

- [Michael Nygard's ADR Format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Azure ADR Templates](https://github.com/Azure/azure-releases-github-actions-template)
