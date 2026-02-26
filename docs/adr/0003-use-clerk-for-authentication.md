# ADR 0003: Use Clerk for Authentication

## Status

Accepted

## Context

The project requires a robust authentication solution for a SaaS application with:
- User signup and login
- Social OAuth providers
- Session management
- Multi-factor authentication support
- Admin role management

Building auth from scratch is error-prone and time-consuming. We needed a solution that:
- Reduces development time
- Provides security best practices
- Integrates well with Next.js
- Supports enterprise features (SSO, MFA)

## Decision

We chose **Clerk** as the authentication solution.

### Why Clerk

1. **Next.js Native**: First-class support for Next.js with App Router
2. **Security**: SOC2 compliant, handles security best practices
3. **Developer Experience**: Easy setup, great documentation
4. **Features**: Built-in OAuth, MFA, user management dashboard
5. **Webhook Support**: Easy integration with database for user sync

## Consequences

### Positive

- Fast implementation with pre-built components
- Excellent security without custom implementation
- Built-in OAuth (Google, GitHub, etc.)
- User management dashboard included
- Webhook-based user sync to database

### Negative

- External dependency for critical auth
- Cost at scale (per-user pricing)
- Less control over auth internals

## Alternatives Considered

### NextAuth.js (Auth.js)
- **Rejected**: More implementation work required
- Need to handle security best practices manually

### Supabase Auth
- **Rejected**: Tied to Supabase database
- Less flexible for PostgreSQL-only setup

### Custom implementation
- **Rejected**: Time-consuming and error-prone
- Security risks without expertise

### Clerk vs Supabase vs Firebase Auth
- Clerk chosen for best Next.js integration
- Supabase tied to their database product
- Firebase less suitable for web-first SaaS

## Implementation

- Clerk handles all authentication flows
- Webhooks sync users to our PostgreSQL database
- Clerk's middleware protects routes
- Custom role extension via database

## Related

- packages/auth: Authentication utilities
