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
QW|
### Metis

- **Model**: opencode/glm-4.7-free
- **Role**: Pre-planning consultant
- **Use for**: Analyzing requests to identify hidden intentions, ambiguities, and AI failure points

### Momus

- **Model**: opencode/glm-4.7-free
- **Role**: Expert reviewer
- **Use for**: Evaluating work plans for clarity, verifiability, and completeness

### Plan Agent

- **Model**: opencode/kimi-k2.5-free
- **Role**: Planning and task orchestration
- **Use for**: Creating detailed work breakdowns, parallel task graphs, and structured TODO lists

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
#YR|
## Quick Start: Using AI Agents

This section provides concrete examples of how to leverage AI agents for common development tasks.

### Explore Agent - Codebase Discovery

The Explore agent is your go-to for understanding existing code patterns, finding files, and mapping codebase structure.

**When to use:**
- Need to understand how a feature is implemented
- Finding files matching a pattern
- Understanding existing conventions and patterns

**Example 1: Find auth implementations**
```
task(subagent_type="explore", load_skills=[], prompt="Find all authentication-related files in the codebase. Look for: login handlers, JWT middleware, password validation, session management. Focus on src/ directories. Return file paths with brief descriptions of what each file does.", run_in_background=true)
```
**Expected output:** A list of files like `apps/nextjs/src/app/api/auth/[...clerk]/route.ts`, `packages/auth/src/index.ts` with descriptions of their purpose.

**Example 2: Find error handling patterns**
```
task(subagent_type="explore", load_skills=[], prompt="Find error handling patterns in the codebase. Look for: custom Error classes, error middleware, try/catch blocks in API routes, error response formats. Return file paths and describe the error handling approach used.", run_in_background=true)
```
**Expected output:** Files like `packages/api/src/error.ts`, error class hierarchy, and JSON response format conventions.

**Example 3: Map a feature's codebase**
```
task(subagent_type="explore", load_skills=[], prompt="Map all files related to the billing/subscription feature. Include: Stripe integration, subscription models, webhook handlers, pricing UI components. Return a dependency graph showing how these pieces connect.", run_in_background=true)
```
**Expected output:** A list of interconnected files showing the billing flow from API to UI.

### Librarian Agent - Documentation & External Research

The Librarian agent searches external resources, official documentation, and best practices.

**When to use:**
- Understanding unfamiliar libraries or frameworks
- Finding official API documentation
- Learning best practices for a technology
- Troubleshooting external dependency issues

**Example 1: Find Stripe webhook best practices**
```
task(subagent_type="librarian", load_skills=[], prompt="Find official Stripe documentation for webhook handling in Node.js. Include: signature verification, event parsing, retry logic, idempotency. Skip beginner tutorials - I need production-ready patterns.", run_in_background=true)
```
**Expected output:** Links to Stripe docs, code examples for webhook verification, recommended patterns.

**Example 2: Learn Next.js App Router patterns**
```
task(subagent_type="librarian", load_skills=[], prompt="Find official Next.js documentation for App Router data fetching, caching, and revalidation. Include: fetch API, server components, route handlers, static vs dynamic rendering.", run_in_background=true)
```
**Expected output:** Next.js docs links with specific sections on server-side data handling.

**Example 3: Find Prisma transaction patterns**
```
task(subagent_type="librarian", load_skills=[], prompt="Find Prisma interactive transactions documentation. Include: $transaction usage, nested writes, rollback behavior, performance considerations.", run_in_background=true)
```
**Expected output:** Prisma docs with transaction examples and best practices.

### Oracle Agent - Architecture & Debugging

The Oracle agent provides high-quality reasoning for complex architectural decisions and debugging challenges.

**When to use:**
- Unfamiliar code patterns or architecture
- Debugging after multiple failed attempts
- Making architectural tradeoffs
- Security or performance concerns

**Example 1: Review auth architecture**
```
task(subagent_type="oracle", load_skills=[], prompt="Review the authentication architecture in this monorepo. Current setup uses Clerk for auth with custom middleware. Evaluate: token handling, session management, route protection, security considerations. List specific concerns and recommendations.", run_in_background=false)
```
**Expected output:** Detailed architectural review with specific file references, concerns, and recommendations.

**Example 2: Debug complex type error**
```
task(subagent_type="oracle", load_skills=[], prompt="Debug TypeScript error in packages/api/src/router.ts. Error: 'User' type not found in namespace. I've tried: restarting TS server, checking imports, verifying tsconfig paths. Provide root cause analysis and exact fix.", run_in_background=false)
```
**Expected output:** Root cause explanation with specific code changes needed.

**Example 3: Design new feature architecture**
```
task(subagent_type="oracle", load_skills=[], prompt="Design architecture for adding real-time notifications. Constraints: Next.js app, Prisma DB, tRPC, prefer server-sent events over WebSockets. Consider: database schema, API design, frontend integration, scaling. Provide concrete recommendations.", run_in_background=false)
```
**Expected output:** Architecture recommendation with schema designs, API patterns, and implementation steps.

### Sisyphus (Orchestrator) - Complex Workflows

Sisyphus coordinates multiple agents and manages complex multi-step tasks.

**When to use:**
- Implementing major features requiring multiple files
- Coordinating exploration + implementation
- Managing tasks that need specialist agents
- Creating comprehensive solutions

**Example 1: Implement new API endpoint**
```
# Task breakdown: 1) Explore existing router structure, 2) Find similar endpoints for patterns, 3) Implement new route with proper types, 4) Add tests
task(subagent_type="explore", load_skills=[], prompt="Find tRPC router structure in packages/api/src/. Show me how routes are defined, organized, and typed.", run_in_background=true)
# Then implement based on findings
```
**Expected output:** Understanding of router patterns, then full implementation.

**Example 2: Full-stack feature implementation**
```
# 1) Explore DB schema for related models
# 2) Find similar features for UI patterns
# 3) Implement API, DB changes, and UI in parallel
# 4) Integrate and test
```
**Expected output:** Complete feature with all layers implemented.

**Example 3: Refactor with safety**
```
# 1) Map all usages of code to refactor
# 2) Plan migration path
# 3) Implement with backward compatibility
# 4) Verify no regressions
```
**Expected output:** Safe refactoring with all dependencies updated.

## Workflow Patterns

These step-by-step workflows help you tackle common development tasks efficiently.

### Feature Development Workflow

1. **Explore** - Map existing codebase for the feature area
   - Find related models, API routes, UI components
   - Identify patterns to follow
2. **Research** - Check documentation for new dependencies
   - Use Librarian for unfamiliar libraries
3. **Plan** - Break into atomic tasks
   - Create TODO list for tracking
4. **Implement** - Execute in order:
   - Database schema changes first
   - API layer next
   - UI components last
5. **Verify** - Run typecheck, lint, tests
6. **Review** - Use Oracle for complex logic

### Bug Investigation Workflow

1. **Reproduce** - Get exact error message and stack trace
2. **Explore** - Find relevant code paths
   - Search for error message string
   - Map the code flow leading to error
3. **Diagnose** - Identify root cause
   - Use Oracle if stuck after 2+ attempts
4. **Fix** - Minimal change to address root cause
5. **Verify** - Confirm fix resolves the issue
6. **Test** - Add regression test

### Code Review Workflow

1. **Explore** - Understand the changed code
   - Read modified files
   - Trace dependencies
2. **Check** - Verify against standards
   - TypeScript strict mode compliance
   - Error handling present
   - Tests included
3. **Consult** - Use Oracle for architectural concerns
4. **Recommend** - Suggest improvements with rationale

## Best Practices

### When to Use Each Agent

```
Explore    → Understanding existing code
Librarian  → Learning external resources  
Oracle     → Complex reasoning needed
Sisyphus   → Coordinating multiple agents
Multimodal → Visual/UI tasks
```

### Effective Prompt Structure

Always include in your prompts:

1. **Context** - What you're working on
2. **Goal** - What you need to achieve
3. **Downstream** - How you'll use the results
4. **Request** - Specific search instructions

Example:
```
I'm implementing JWT auth for the REST API in src/api/routes/. 
I need to match existing auth conventions so my code fits seamlessly.
I'll use this to decide middleware structure and token flow.
Find: auth middleware, login/signup handlers, token generation.
Skip: tests.
Return: file paths with pattern descriptions.
```

### Session Continuity

- Always use session_id for follow-up tasks
- Preserves context across turns
- Saves 70%+ tokens
- Avoids repeated exploration

```
# CORRECT: Continues context
task(session_id="ses_abc123", prompt="Fix: Type error on line 42")

# WRONG: Loses all context
task(category="quick", prompt="Fix the type error...")
```

### Agent Selection Guide

Use this decision tree:

1. **Need to find something in codebase?** → Explore
2. **Need to learn external library/docs?** → Librarian
3. **Need architectural advice/debug help?** → Oracle
4. **Need multiple agents working together?** → Sisyphus
5. **Need visual/UI analysis?** → Multimodal

## Related Documentation

- [OpenCode Documentation](https://docs.opencode.ai)
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)


## Important Notes

- This is a monorepo using pnpm workspaces
- Database migrations are in packages/db
- Environment variables are in .env.example
- CI/CD workflows are in .github/workflows
