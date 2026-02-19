# OpenCode Agent Skills

This document lists the skills configured for the OpenX Basefly multi-model agent harness.

## Configured Agents

| Agent             | Model                      | Description                                        |
| ----------------- | -------------------------- | -------------------------------------------------- |
| Sisyphus          | opencode/kimi-k2.5-free    | Main orchestrator - complex tasks and coordination |
| Oracle            | opencode/glm-4.7-free      | Architecture and debugging specialist              |
| Librarian         | opencode/glm-4.7-free      | Documentation and codebase research                |
| Explore           | opencode/gpt-5-nano        | Fast codebase exploration and grep operations      |
| Multimodal Looker | opencode/minimax-m2.1-free | Visual understanding and UI/UX tasks               |

## Enabled Skills

The following skills are enabled in `.opencode/oh-my-opencode.json`:

### Planning & Execution

- **brainstorming** - Creative ideation and solution exploration
- **writing-plans** - Structured planning documentation
- **executing-plans** - Plan execution and tracking

### Development Practices

- **test-driven-development** - TDD workflow and testing patterns
- **systematic-debugging** - Root cause analysis and debugging
- **subagent-driven-development** - Delegation to specialized subagents

### Git & Code Review

- **using-git-worktrees** - Parallel development with worktrees
- **requesting-code-review** - Code review request patterns
- **finishing-a-development-branch** - Branch completion workflow

### Orchestration

- **dispatching-parallel-agents** - Parallel agent execution
- **github-workflow-automation** - GitHub Actions workflow automation

### Agent Engineering

- **ai-agent-engineer** - AI agent engineering best practices and configuration

## Skill Sources

Skills are loaded from:

1. `.opencode/skills/` - Project-specific skills
2. `.opencode/superpowers/skills/` - Superpowers skill collection

## MCP Servers

The following MCP servers are enabled:

- **websearch** - Web search capabilities (Exa)
- **context7** - Official documentation lookup
- **github-search** - GitHub code search

## Categories

| Category           | Model                      | Use Case                                 |
| ------------------ | -------------------------- | ---------------------------------------- |
| quick              | opencode/gpt-5-nano        | Trivial tasks, typo fixes                |
| visual-engineering | opencode/minimax-m2.1-free | Frontend, UI/UX, design                  |
| business-logic     | opencode/kimi-k2.5-free    | General business logic                   |
| research           | opencode/glm-4.7-free      | Documentation, research                  |
| ultrabrain         | opencode/kimi-k2.5-free    | Hard logic-heavy tasks                   |
| deep               | opencode/glm-4.7-free      | Goal-oriented autonomous problem-solving |
| artistry           | opencode/kimi-k2.5-free    | Unconventional creative approaches       |

For detailed skill documentation, see the individual SKILL.md files in `.opencode/skills/` and `.opencode/superpowers/`.
