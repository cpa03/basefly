# ADR 0004: Adopt tRPC for API

## Status

Accepted

## Context

We needed an API layer that provides:
- End-to-end type safety between backend and frontend
- Easy schema validation
- Great developer experience
- OpenAPI/Swagger support for external consumers

## Decision

We adopted **tRPC** for the API layer.

### Why tRPC

1. **Type Safety**: Automatic type inference from backend to frontend
2. **Zod Integration**: Schema validation built-in
3. **Developer Experience**: No API documentation needed - types tell all
4. **Performance**: Minimal serialization overhead
5. **OpenAPI**: Optional OpenAPI export for REST compatibility

## Consequences

### Positive

- End-to-end type safety without code generation
- Automatic API documentation via TypeScript
- Easy schema validation with Zod
- Great debugging with tRPC devtools

### Negative

- tRPC-specific - not standard REST
- Learning curve for team unfamiliar with tRPC
- OpenAPI support requires additional setup

## Alternatives Considered

### REST API with Express/Next.js API Routes
- **Rejected**: Manual type definitions required
- More boilerplate for validation

### GraphQL
- **Rejected**: More complex setup
- Overkill for this project's needs
- N+1 query problems

### JSON:API
- **Rejected**: Less type-safe
- Less popular in Next.js ecosystem

## Implementation

- tRPC routers in packages/api
- Zod for input/output validation
- Middleware for auth (Clerk)
- Optional OpenAPI export for third-party APIs

## Related

- packages/api: tRPC router definitions
- ADR 0003: Use Clerk for Authentication
