# AI Agent Engineer - Long-term Memory

## Overview

This document serves as the long-term memory for the ai-agent-engineer domain in the OpenX Basefly project.

## Current State (2026-02-27)

### Available Agents

| Agent             | Model                      | Purpose                                |
| ----------------- | -------------------------- | -------------------------------------- |
| Sisyphus          | opencode/kimi-k2.5-free    | Main orchestrator for complex tasks    |
| Oracle            | opencode/glm-4.7-free      | Architecture, debugging, deep analysis |
| Librarian         | opencode/glm-4.7-free      | Documentation and research             |
| Explore           | opencode/gpt-5-nano        | Fast exploration and grep              |
| Multimodal Looker | opencode/minimax-m2.1-free | Visual/UI tasks                        |
| Metis             | opencode/glm-4.7-free      | Pre-planning consultant                |
| Momus             | opencode/glm-4.7-free      | Expert reviewer                        |
| Plan              | opencode/kimi-k2.5-free    | Planning and task orchestration        |

### Available Categories

- `quick` - Trivial tasks (gpt-5-nano)
- `visual-engineering` - Frontend/UI (minimax-m2.1-free)
- `business-logic` - Business logic (kimi-k2.5-free)
- `research` - Research (glm-4.7-free)
- `ultrabrain` - Hard logic (kimi-k2.5-free)
- `deep` - Autonomous problem-solving (glm-4.7-free)
- `artistry` - Creative approaches (kimi-k2.5-free)
- `writing` - Documentation (glm-4.7-free)
- `plan` - Planning and task orchestration (kimi-k2.5-free)

### Enabled Skills

- using-superpowers
- brainstorming
- writing-plans
- executing-plans
- test-driven-development
- systematic-debugging
- using-git-worktrees
- requesting-code-review
- receiving-code-review
- finishing-a-development-branch
- subagent-driven-development
- dispatching-parallel-agents
- github-workflow-automation
- verification-before-completion
- **ai-agent-engineer** (this skill)

### MCP Servers

- websearch (Exa) - Enabled
- context7 - Enabled
- github-search - Enabled

## Skill Files Location

All ai-agent-engineer skill files are located in `.opencode/skills/ai-agent-engineer/`:

- `SKILL.md` - Main skill definition
- `references/mcp-servers.md` - MCP server configuration
- `references/model-capabilities.md` - Model capability matrices


### 2026-02-27 (Session 4)

- Proactive scan found orphaned `.opencode/agent/cmz.json` file
- File was not referenced anywhere in OpenCode configuration
- Removed the orphaned directory to keep configuration clean
- Created PR #769 to merge this cleanup
## Past Improvements


### 2026-02-25 (Session 3)

- Fixed PR #615 - verified it's already merged (commit 8f6399a)
- Added comment to PR #615 noting merge status
- Proactive scan found AGENTS.md missing Metis and Momus documentation
- Created PR #623 to add missing agent documentation to AGENTS.md


- Reviewed existing PR #571 - verified up-to-date with main, mergeable
- Verified typecheck and lint pass locally
- Confirmed Vercel failure is pre-existing infrastructure issue
- Commented on PR with verification results
- Fixed git merge conflict markers in this document

### 2026-02-25 (Session 1)

- Created this long-term memory document
- Documented current agent configuration
- Established baseline for future improvements
- Added planning skills reference and /start-work command to SKILL.md (PR #571)

## Best Practices

### Model Selection

1. **Orchestration** → kimi-k2.5-free (complex reasoning)
2. **Architecture/Debug** → glm-4.7-free (precision)
3. **Quick searches** → gpt-5-nano (speed)
4. **Visual/UI** → minimax-m2.1-free (multimodal)

### Temperature Guidelines

| Range   | Use Case               |
| ------- | ---------------------- |
| 0.1-0.3 | Factual, deterministic |
| 0.4-0.6 | Balanced reasoning     |
| 0.7-0.9 | Creative, exploratory  |

### Workflow

1. Check for existing ai-agent-engineer PRs/issues
2. Make small, focused changes
3. Verify build/lint/test pass
4. Create PR with `ai-agent-engineer` label
5. Keep branch up-to-date with main

## Session Insights

### Key Observations

1. **Existing PRs**: Always check for existing ai-agent-engineer PRs before creating new ones
2. **Vercel Failures**: Can be pre-existing infrastructure issues unrelated to code changes - verify with typecheck/lint locally
3. **Documentation-Only PRs**: Don't require build verification the same way as code changes
4. **Proactive Scan**: When no issues exist, scan domain for improvements - configuration was complete

## Open Questions / TODO

- [ ] Evaluate if new models become available
- [ ] Consider adding more MCP servers for agent capabilities
- [ ] Review category routing for optimization
- [ ] Assess skill enablement for context optimization

## References

- AGENTS.md - Project agent guidelines
- .opencode/oh-my-opencode.json - Agent configuration
- .opencode/skills.md - Skills overview
