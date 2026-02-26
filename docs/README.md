# Basefly Documentation

Welcome to the Basefly documentation. This folder contains comprehensive guides, API specifications, and technical references for the project.

## Quick Links

| Document                               | Description                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| [Onboarding Guide](./ONBOARDING.md)    | Documentation contributor onboarding with style guide and contribution process  |

| [API Specification](./api-spec.md)     | Complete tRPC API documentation with endpoints, error codes, and usage examples |
| [Data Blueprint](./blueprint.md)       | Database architecture, data models, and integration patterns                    |
| [Feature Specifications](./feature.md) | Feature requirements, acceptance criteria, and status tracking                  |
| [CI/CD Guide](./ci-cd.md)              | Continuous integration and deployment workflows                                 |
| [Roadmap](./roadmap.md)                | Project roadmap and planned features                                            |
| [Development Guide](./DEVELOPMENT.md)  | Local development setup and guidelines                                          |
| [Test Coverage](./test-coverage.md)    | Testing strategy and coverage requirements                                      |

## Architecture & Design

- **[Blueprint](./blueprint.md)** - Core data models, Kysely query patterns, Stripe integration, and security headers
- **[API Spec](./api-spec.md)** - All tRPC endpoints with TypeScript interfaces, error handling, and rate limiting
- **[ADR](./adr/)** - Architecture Decision Records documenting key technical choices

## Architecture Decision Records (ADRs)

| ADR | Title | Status |
| --- | ----- | ------ |
| [0001](./adr/0001-use-prisma-as-orm.md) | Use Prisma as ORM | Accepted |
| [0002](./adr/0002-adopt-kysely-query-builder.md) | Adopt Kysely as Query Builder | Accepted |
| [0003](./adr/0003-use-clerk-for-authentication.md) | Use Clerk for Authentication | Accepted |
| [0004](./adr/0004-adopt-trpc-for-api.md) | Adopt tRPC for API | Accepted |
| [0005](./adr/0005-use-stripe-for-billing.md) | Use Stripe for Billing | Accepted |
| [0006](./adr/0006-use-turbo-monorepo-structure.md) | Use Turbo Monorepo Structure | Accepted |

- **[Blueprint](./blueprint.md)** - Core data models, Kysely query patterns, Stripe integration, and security headers
- **[API Spec](./api-spec.md)** - All tRPC endpoints with TypeScript interfaces, error handling, and rate limiting

## Development

- **[Development Guide](./DEVELOPMENT.md)** - Getting started, environment setup, and common tasks
- **[Feature Flags](./feature-flags.md)** - Feature flag system for controlled rollouts
- **[Bug Tracking](./bug.md)** - Bug report templates and tracking

## Operations

- **[CI/CD](./ci-cd.md)** - GitHub Actions workflows, build pipelines, and deployment process
- **[Test Coverage](./test-coverage.md)** - Vitest configuration, coverage targets, and testing best practices
- **[QA Task Summary](./qa-task-summary.md)** - Quality assurance reports and findings

## AI Agent Configuration

For AI agent development and configuration, see the main [AGENTS.md](../AGENTS.md) in the repository root.

## System Prompts Reference

The `prompts/` folder contains reference system prompts from various AI systems for research and comparison purposes. See [prompts/readme.md](./prompts/readme.md) for an overview.

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
