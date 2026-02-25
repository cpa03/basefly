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
| Metis             | opencode/glm-4.7-free      | Pre-planning consultant - identifies hidden intentions, ambiguities, and AI failure points |
| Momus             | opencode/glm-4.7-free      | Expert reviewer - evaluates work plans for clarity, verifiability, and completeness |

## Enabled Skills

The following skills are enabled in `.opencode/oh-my-opencode.json`:

### Core Skills

- **using-superpowers** - Skill discovery and invocation patterns (invoke before any response)

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
- **receiving-code-review** - Handling and responding to code review feedback
- **finishing-a-development-branch** - Branch completion workflow
- **verification-before-completion** - Ensuring work is complete before marking done

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

| Category           | Model                      | Description                                     |
| ------------------ | -------------------------- | ----------------------------------------------- |
| quick              | opencode/gpt-5-nano        | Trivial tasks - single file changes, typo fixes |
| visual-engineering | opencode/minimax-m2.1-free | Frontend, UI/UX, design, styling, animation     |
| business-logic     | opencode/kimi-k2.5-free    | General business logic tasks                    |
| research           | opencode/glm-4.7-free      | Documentation lookup, research, best practices  |
| ultrabrain         | opencode/kimi-k2.5-free    | Hard logic-heavy tasks requiring deep reasoning |
| deep               | opencode/glm-4.7-free      | Goal-oriented autonomous problem-solving        |
| artistry           | opencode/kimi-k2.5-free    | Unconventional creative approaches              |
| writing            | opencode/glm-4.7-free      | Documentation, prose, technical writing         |
| unspecified-low    | opencode/gpt-5-nano        | Tasks that don't fit other categories, low effort required    |
| unspecified-high   | opencode/kimi-k2.5-free    | Tasks that don't fit other categories, high effort required   |

For detailed skill documentation, see the individual SKILL.md files in `.opencode/skills/` and `.opencode/superpowers/`.
