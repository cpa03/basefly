---
name: openx-basefly
description: "OpenX Basefly skill - Multi-model agent harness for basefly project with free tier models"
---

# OpenX Basefly

## Overview

OpenX Basefly is a comprehensive agent harness configuration for the basefly project, utilizing free tier models from OpenCode.

## Available Agents

- **Sisyphus** (opencode/kimi-k2.5-free): Main orchestrator for complex tasks
- **Oracle** (opencode/glm-4.7-free): Architecture and debugging specialist  
- **Librarian** (opencode/glm-4.7-free): Documentation and codebase research
- **Explore** (opencode/gpt-5-nano): Fast codebase exploration
- **Multimodal Looker** (opencode/minimax-m2.1-free): Visual/UI/UX tasks

## Quick Commands

- Type `ultrawork` or `ulw` in any prompt to activate full agent harness
- Use `/start-work` to execute plans
- Press **Tab** to enter Prometheus (Planner) mode

## Integrated Skills

### From Superpowers
- brainstorming - Design refinement before implementation
- writing-plans - Detailed implementation planning
- executing-plans - Batch execution with checkpoints
- test-driven-development - RED-GREEN-REFACTOR cycle
- systematic-debugging - 4-phase root cause analysis
- using-git-worktrees - Parallel development branches
- requesting-code-review - Pre-review checklist
- finishing-a-development-branch - Merge/PR workflow
- subagent-driven-development - Fast iteration with review

### From Agent-Skill
- github-workflow-automation - GitHub Actions workflow management
- planning - Project planning utilities
- skill-creator - Create new skills following best practices

## Model Categories

- **quick**: opencode/gpt-5-nano (fast/cheap tasks)
- **visual-engineering**: opencode/minimax-m2.1-free (UI/UX)
- **business-logic**: opencode/kimi-k2.5-free (complex logic)
- **research**: opencode/glm-4.7-free (documentation search)

## MCP Servers

- **websearch**: Exa web search
- **context7**: Official documentation
- **github-search**: GitHub code search

## Configuration Files

- `opencode.json` - Main OpenCode configuration
- `.opencode/oh-my-opencode.json` - Agent and model settings
- `.opencode/skills/` - Custom and integrated skills
- `.opencode/superpowers/` - Superpowers skills framework
- `docs/prompts/` - System prompts reference collection
