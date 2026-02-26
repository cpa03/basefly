# ADR 0004: Adopt tRPC for API

## Status

Accepted

## Context

We need an API layer for communication between frontend and backend. Requirements include:
- End-to-end type safety
- Easy to use with Next.js
- Good developer experience
- Support for server-side calls

## Decision

We have adopted **tRPC** as the API layer for this project.

## Consequences

### Positive

- **Type Safety**: End-to-end type safety without code generation
- **Developer Experience**: Instant feedback, auto-completion
- **Next.js Integration**: Native support for App Router and Server Components
- **Validation**: Built-in input validation with Zod
- **No API Docs**: Types serve as documentation
- **Real-time**: Easy subscription support

### Negative

- **Backend Coupling**: Tight coupling between client and server
- **Learning Curve**: New patterns to learn
- **Vendor-Specific**: Limited to TypeScript
- **Caching**: Requires explicit caching strategies

## Alternatives Considered

### REST API

- Universal standard
- **Rejected**: No type safety, more boilerplate

### GraphQL

- Flexible queries
- **Rejected**: Complexity, learning curve, N+1 issues

### Server Actions

- Native Next.js
- **Rejected**: Less mature, limited client integration

## Related

- [API Specification](../api-spec.md)
