# OpenX Basefly - Agent Guidelines

## Project Overview

Basefly is a Next.js-based SaaS template with modern architecture including:

- Monorepo structure with Turbo
- Next.js 14 with App Router
- TypeScript throughout
- Tailwind CSS for styling
- tRPC for API routes
- Prisma ORM with PostgreSQL
- Clerk authentication
- Stripe payments
- Vitest for testing

## Agent Configuration

This project uses OpenX - a multi-model agent harness with the following agents:

### Sisyphus (Main Orchestrator)

- **Model**: opencode/kimi-k2.5-free
- **Role**: Complex task coordination and orchestration
- **Use for**: Major features, architecture decisions, multi-step workflows

### Oracle

- **Model**: opencode/glm-4.7-free
- **Role**: Architecture and debugging specialist
- **Use for**: Code review, debugging, technical decisions

### Librarian

- **Model**: opencode/glm-4.7-free
- **Role**: Documentation and research
- **Use for**: Finding files, understanding codebase, documentation lookup

### Explore

- **Model**: opencode/gpt-5-nano
- **Role**: Fast exploration
- **Use for**: Quick file searches, grep operations, initial codebase mapping

### Multimodal Looker

- **Model**: opencode/minimax-m2.1-free
- **Role**: Visual/UI tasks
- **Use for**: UI component work, visual debugging, screenshots

## Workflow Triggers

- `ultrawork` or `ulw` - Activate full agent harness
- `/start-work` - Execute plans
- Tab key - Enter Prometheus (Planner) mode

## Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Custom configuration with Turbo rules
- **Prettier**: Consistent formatting
- **Testing**: Vitest with coverage requirements
- **Git**: Atomic commits with conventional messages

## Development Guidelines

1. Always run tests before committing
2. Follow existing code patterns and conventions
3. Use turbo for build orchestration
4. Check types with `turbo typecheck`
5. Format code with `turbo format`

## Project Structure

```
/
├── apps/
│   ├── nextjs/          # Main Next.js application
│   └── ...
├── packages/
│   ├── api/             # tRPC API definitions
│   ├── auth/            # Clerk auth configuration
│   ├── db/              # Prisma schema and migrations
│   ├── ui/              # Shared UI components
│   └── ...
├── tooling/
│   ├── eslint/          # Shared ESLint configs
│   ├── prettier/        # Shared Prettier configs
│   ├── tailwind/        # Shared Tailwind config
│   └── typescript/      # Shared TS configs
├── .opencode/           # OpenCode configuration
│   ├── oh-my-opencode.json
│   ├── skills/          # Custom skills
│   ├── superpowers/     # Superpowers skills
│   └── plugins/         # Custom plugins
└── docs/
    └── prompts/         # System prompts reference
```

## Testing

Run tests with:

```bash
pnpm test           # Run all tests
pnpm test:ui        # Run with UI
pnpm test:coverage  # Run with coverage
```

## Build Commands

```bash
pnpm dev            # Development mode
pnpm build          # Production build
pnpm lint           # Run ESLint
pnpm typecheck      # TypeScript check
pnpm format         # Format code
```

## Important Notes

- This is a monorepo using pnpm workspaces
- Database migrations are in packages/db
- Environment variables are in .env.example
- CI/CD workflows are in .github/workflows
