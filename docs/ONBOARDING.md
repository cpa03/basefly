# Documentation Contributor Onboarding Guide

Welcome to the Basefly documentation team! This guide helps you get started contributing to our documentation.

## Quick Start

### 1. Clone and Preview

```bash
git clone https://github.com/cpa03/basefly.git
cd basefly
pnpm install
```

Documentation is in the `docs/` folder. Preview changes by opening markdown files directly or using your editor's markdown preview.

### 2. Key Documentation Files

| File               | Purpose                              |
| ------------------ | ------------------------------------ |
| `README.md`        | Project overview and getting started |
| `CONTRIBUTING.md`  | Contribution guidelines              |
| `docs/README.md`   | Documentation index                  |
| `docs/api-spec.md` | API documentation                   |
| `AGENTS.md`        | AI agent configuration               |

## Style Guide

### Tone and Voice

- **Clear and concise**: Get to the point quickly
- **Active voice**: "Run the command" not "The command should be run"
- **Present tense**: "This endpoint returns" not "This endpoint will return"
- **Second person**: "You can configure" not "Users can configure"

### Formatting Standards

#### Headings

```markdown
# H1 - Document title (one per file)

## H2 - Major sections

### H3 - Subsections

#### H4 - Details (use sparingly)
```

#### Code Blocks

Always specify language for syntax highlighting:

````markdown
```typescript
const example: string = "hello";
```

```bash
pnpm install
```
````

#### Links

- **Internal links**: Use relative paths `[text](./file.md)`
- **External links**: Include descriptive text `[Official Docs](https://example.com)`

#### Tables

Use tables for structured data:

```markdown
| Column 1 | Column 2 |
| -------- | -------- |
| Value 1  | Value 2  |
```

### Code Example Conventions

1. **Include imports**: Show necessary imports
2. **Complete examples**: Code should be runnable
3. **Add comments**: Explain non-obvious parts
4. **Type annotations**: Include TypeScript types

```typescript
import { createTRPCClient } from "@trpc/client";

// Create a client with the API URL
const client = createTRPCClient({
  url: "http://localhost:3000/api/trpc",
});

// Fetch user clusters
const clusters = await client.k8s.getClusters.query();
```

## Contribution Process

### Where to Place New Docs

| Content Type      | Location              |
| ----------------- | --------------------- |
| API documentation | `docs/api-spec.md`    |
| Architecture docs | `docs/blueprint.md`   |
| Feature specs     | `docs/feature.md`     |
| New guides        | `docs/` folder       |
| README updates    | Root or package level |

### Naming Conventions

- Use lowercase with hyphens: `feature-flags.md`
- Descriptive names: `test-coverage.md` not `testing.md`
- Follow existing patterns in the `docs/` folder

### PR Checklist for Docs

- [ ] Follows style guide above
- [ ] Links to related documentation
- [ ] Code examples are tested and working
- [ ] No broken links (check relative paths)
- [ ] Updated `docs/README.md` index if adding new file

## API Docs Maintenance

### Updating api-spec.md

1. **Document endpoints**: Include request/response types
2. **Add error codes**: Document all error cases
3. **Include examples**: Show success and error responses
4. **Keep in sync**: Update when API changes with Code

When updating API documentation:



### Syncing1. Check `packages/api/src/router/` for router implementations
2. Verify types match `packages/api/src/router/schemas.ts`
3. Cross-reference with `docs/blueprint.md` for data models

### Example Documentation Pattern

```markdown
### 1.1 Get User Clusters

Retrieve all active Kubernetes clusters for the authenticated user.

**Endpoint**: `k8s.getClusters`

**Method**: `query`

**Authentication**: Required

**Request**: None (uses `ctx.userId` from authentication)

**Response**:

\`\`\`typescript
interface Cluster {
id: number;
name: string;
// ... other fields
}
\`\`\`

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `INTERNAL_SERVER_ERROR`: Database query failed
```

## AI Agent Collaboration

Basefly uses AI agents to assist with development. Understanding how to work with these agents improves contributor productivity.

### Available AI Agents

| Agent | Purpose | Best For |
| ---- | --------| --------- |
| **Sisyphus** | Main orchestrator | Complex tasks, multi-step workflows |
| **Oracle** | Architecture/debugging | Code review, debugging, technical decisions |
| **Librarian** | Documentation research | Finding files, understanding code |
| **Explore** | Fast exploration | Quick searches, grep operations |
| **Multimodal** | Visual/UI tasks | UI work, screenshots |

### How to Trigger Agents

- `ultrawork` or `ulw` - Activate full agent harness
- `/start-work` - Execute plans from Prometheus
- Tab key - Enter Planner mode

### Agent Categories (for task delegation)

| Category | Use Case |
| -------- | ---------- |
| `quick` | Trivial fixes, single file changes |
| `visual-engineering` | Frontend/UI work |
| `ultrabrain` | Hard logic-heavy tasks |
| `deep` | Autonomous problem-solving |
| `business-logic` | Business logic implementation |
| `research` | Documentation lookup |

### Writing Prompts for Agents

When working with AI agents, include:
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

## Getting Help

- **Questions**: Open a GitHub issue with `docs` label
- **Suggestions**: Check [open issues](https://github.com/cpa03/basefly/issues) for documentation tasks
- **Style questions**: Refer to existing documentation as examples
- **AI Agent Help**: Use `/ulw-loop` for autonomous agent workflows

## Related Resources

- [CONTRIBUTING.md](../CONTRIBUTING.md) - General contribution guidelines
- [docs/README.md](./README.md) - Documentation index
- [docs/api-spec.md](./api-spec.md) - API documentation reference
- [AGENTS.md](../AGENTS.md) - AI agent configuration details
