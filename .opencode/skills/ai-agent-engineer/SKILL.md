---
name: ai-agent-engineer
description: "AI Agent Engineering best practices for OpenX Basefly. Use when working on branch 'ai-agent-engineer', improving agent configurations, skills, or multi-model orchestration. Triggers: agent configuration changes, skill creation/updates, model selection decisions, agent workflow improvements."
---

# AI Agent Engineer

Best practices for engineering AI agents in the OpenX Basefly multi-model harness.

## Core Principles

### 1. Model Selection

Match model capabilities to task requirements:

| Task Type          | Recommended Model          | Rationale                       |
| ------------------ | -------------------------- | ------------------------------- |
| Orchestration      | opencode/kimi-k2.5-free    | Complex reasoning, coordination |
| Architecture/Debug | opencode/glm-4.7-free      | Deep analysis, precision        |
| Quick searches     | opencode/gpt-5-nano        | Speed, cost efficiency          |
| Visual/UI          | opencode/minimax-m2.1-free | Multimodal understanding        |

### 2. Agent Configuration

When modifying `.opencode/oh-my-opencode.json`:

- **Temperature**: Lower (0.2-0.4) for precision tasks, higher (0.6-0.8) for creative tasks
- **Categories**: Use domain-specific categories for optimal model routing
- **Skills**: Enable only needed skills to minimize context bloat

### 3. Skill Development

Follow the skill-creator patterns:

- Keep SKILL.md under 500 lines
- Use progressive disclosure (references/, assets/)
- Clear frontmatter with name and description
- Imperative/infinitive form in instructions

## Workflow

### Making Improvements

1. **Read documentation** - Check AGENTS.md, skills.md, and relevant SKILL.md files
2. **Check open PRs/issues** - Avoid duplicate work
3. **Make small changes** - Single, focused improvements
4. **Verify no regression** - Run build, lint, test
5. **Create/update PR** - Use appropriate labels

### Branch Convention

- Branch name: `ai-agent-engineer`
- Label: `ai-agent-engineer`
- Keep up-to-date with default branch

## Available Agents

| Agent             | Model                      | Use Case                         |
| ----------------- | -------------------------- | -------------------------------- |
| Sisyphus          | opencode/kimi-k2.5-free    | Main orchestrator                |
| Oracle            | opencode/glm-4.7-free      | Architecture, debugging          |
| Librarian         | opencode/glm-4.7-free      | Documentation, research          |
| Explore           | opencode/gpt-5-nano        | Fast exploration                 |
| Multimodal Looker | opencode/minimax-m2.1-free | Visual/UI tasks                  |
| Metis             | opencode/glm-4.7-free      | Pre-planning consultant          |
| Momus             | opencode/glm-4.7-free      | Expert reviewer, plan evaluation |

## Verification Checklist

Before submitting changes:

- [ ] Build passes: `pnpm build`
- [ ] Lint passes: `pnpm lint`
- [ ] Tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] Branch is up-to-date with main
- [ ] PR has correct label

## Common Patterns

### Adding a New Skill

```bash
# Use the init script
scripts/init_skill.py <skill-name> --path .opencode/skills/
```

### Updating Agent Configuration

1. Edit `.opencode/oh-my-opencode.json`
2. Update `.opencode/skills.md` if adding new skills
3. Update `AGENTS.md` if changing agent roles
4. Test with actual agent interactions

### Temperature Guidelines

| Temperature | Use Case                         |
| ----------- | -------------------------------- |
| 0.1-0.3     | Factual, deterministic responses |
| 0.4-0.6     | Balanced reasoning               |
| 0.7-0.9     | Creative, exploratory            |

## Troubleshooting

### Common Issues

#### Model Not Responding Correctly

1. **Check temperature settings** - Lower temperature (0.2-0.4) for precision tasks
2. **Verify model availability** - Ensure the model ID is correct in `oh-my-opencode.json`
3. **Test with simpler prompts** - Isolate the issue with basic queries

#### Skill Not Loading

1. **Verify skill path** - Check `skills.sources` in `oh-my-opencode.json`
2. **Check skill enable list** - Ensure skill is in `skills.enable` array
3. **Validate SKILL.md format** - Ensure proper YAML frontmatter

#### Context Window Issues

1. **Disable unused skills** - Remove from `skills.enable` array
2. **Disable unused MCP servers** - Set `enabled: false` in MCP configuration
3. **Use specialized agents** - Delegate to `explore` or `librarian` for focused tasks

#### Category Routing Issues

1. **Check category definitions** - Verify category exists in `oh-my-opencode.json`
2. **Verify model assignment** - Each category should have a model and temperature
3. **Test category directly** - Use `task(category="...", ...)` to verify

### Debugging Steps

1. **Check configuration file** - Validate JSON syntax in `oh-my-opencode.json`
2. **Review agent logs** - Look for error messages in agent output
3. **Test in isolation** - Create minimal test case to isolate issue
4. **Compare with working config** - Diff against known working configuration

## References

- **[model-capabilities.md](./references/model-capabilities.md)** - Detailed model capability matrices, agent-to-model mapping, and performance tips
- **[mcp-servers.md](./references/mcp-servers.md)** - MCP server configuration, available servers, and best practices
