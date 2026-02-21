# Model Capabilities Reference

This document provides detailed capability matrices for models used in OpenX Basefly.

## Model Overview

| Model ID                   | Provider | Tier | Context Window | Best For                         |
| -------------------------- | -------- | ---- | -------------- | -------------------------------- |
| opencode/kimi-k2.5-free    | Moonshot | Free | 128K           | Complex reasoning, orchestration |
| opencode/glm-4.7-free      | Zhipu    | Free | 128K           | Analysis, debugging, research    |
| opencode/gpt-5-nano        | OpenAI   | Free | 32K            | Quick tasks, exploration         |
| opencode/minimax-m2.1-free | MiniMax  | Free | 64K            | Visual understanding, UI/UX      |

## Capability Matrix

### Reasoning & Analysis

| Model                      | Logic | Math | Code | Architecture | Debug |
| -------------------------- | ----- | ---- | ---- | ------------ | ----- |
| opencode/kimi-k2.5-free    | ★★★★★ | ★★★★ | ★★★★ | ★★★★★        | ★★★★  |
| opencode/glm-4.7-free      | ★★★★★ | ★★★★ | ★★★★ | ★★★★★        | ★★★★★ |
| opencode/gpt-5-nano        | ★★★   | ★★★  | ★★★  | ★★★          | ★★★   |
| opencode/minimax-m2.1-free | ★★★★  | ★★★  | ★★★★ | ★★★★         | ★★★★  |

### Multimodal Capabilities

| Model                      | Text  | Images | Diagrams | Screenshots | UI Analysis |
| -------------------------- | ----- | ------ | -------- | ----------- | ----------- |
| opencode/kimi-k2.5-free    | ★★★★★ | ★★★★   | ★★★★     | ★★★★        | ★★★         |
| opencode/glm-4.7-free      | ★★★★★ | ★★★    | ★★★      | ★★★         | ★★★         |
| opencode/gpt-5-nano        | ★★★★★ | ★★★    | ★★★      | ★★★         | ★★★         |
| opencode/minimax-m2.1-free | ★★★★★ | ★★★★★  | ★★★★★    | ★★★★★       | ★★★★★       |

### Speed & Efficiency

| Model                      | Response Speed | Token Efficiency | Cost | Parallelization |
| -------------------------- | -------------- | ---------------- | ---- | --------------- |
| opencode/kimi-k2.5-free    | Medium         | High             | Free | Good            |
| opencode/glm-4.7-free      | Medium         | High             | Free | Good            |
| opencode/gpt-5-nano        | Fast           | Very High        | Free | Excellent       |
| opencode/minimax-m2.1-free | Medium         | Medium           | Free | Good            |

## Agent-to-Model Mapping

### Sisyphus (Main Orchestrator)

- **Model**: `opencode/kimi-k2.5-free`
- **Temperature**: 0.7
- **Rationale**: Strong reasoning and coordination capabilities; higher temperature allows creative problem-solving
- **Best For**: Complex multi-step workflows, feature implementation, architecture decisions

### Oracle (Architecture & Debug)

- **Model**: `opencode/glm-4.7-free`
- **Temperature**: 0.5
- **Rationale**: Excellent analytical precision; balanced temperature for consistent technical advice
- **Best For**: Code review, debugging, architecture analysis, security review

### Librarian (Documentation & Research)

- **Model**: `opencode/glm-4.7-free`
- **Temperature**: 0.3
- **Rationale**: Strong research capabilities; low temperature for factual accuracy
- **Best For**: Documentation lookup, codebase exploration, best practices research

### Explore (Fast Exploration)

- **Model**: `opencode/gpt-5-nano`
- **Temperature**: 0.2
- **Rationale**: Fast and efficient; very low temperature for deterministic searches
- **Best For**: Quick file searches, grep operations, initial codebase mapping

### Multimodal Looker (Visual Tasks)

- **Model**: `opencode/minimax-m2.1-free`
- **Temperature**: 0.5
- **Rationale**: Best multimodal understanding in free tier; balanced temperature
- **Best For**: UI component work, visual debugging, screenshot analysis, diagram interpretation

## Category-to-Model Mapping

| Category           | Model                      | Temperature | Use Case                                 |
| ------------------ | -------------------------- | ----------- | ---------------------------------------- |
| quick              | opencode/gpt-5-nano        | 0.2         | Trivial tasks, typo fixes                |
| visual-engineering | opencode/minimax-m2.1-free | 0.5         | Frontend, UI/UX, design                  |
| business-logic     | opencode/kimi-k2.5-free    | 0.6         | General business logic                   |
| research           | opencode/glm-4.7-free      | 0.3         | Documentation, research                  |
| ultrabrain         | opencode/kimi-k2.5-free    | 0.5         | Hard logic-heavy tasks                   |
| deep               | opencode/glm-4.7-free      | 0.4         | Goal-oriented autonomous problem-solving |
| artistry           | opencode/kimi-k2.5-free    | 0.7         | Unconventional creative approaches       |

## Temperature Guidelines

| Temperature | Use Case                         | Example Tasks                     |
| ----------- | -------------------------------- | --------------------------------- |
| 0.1-0.2     | Deterministic, factual responses | File searches, grep operations    |
| 0.3-0.4     | Consistent technical advice      | Documentation lookup, code review |
| 0.5-0.6     | Balanced reasoning               | Architecture analysis, debugging  |
| 0.7-0.8     | Creative problem-solving         | Feature design, brainstorming     |

## Model Selection Decision Tree

```
Task Type?
├── Visual/UI/Screenshot → minimax-m2.1-free
├── Quick Search/Grep → gpt-5-nano
├── Research/Documentation → glm-4.7-free
├── Debug/Architecture → glm-4.7-free
├── Complex Orchestration → kimi-k2.5-free
└── Creative/Brainstorming → kimi-k2.5-free (temp 0.7+)
```

## Known Limitations

| Model                      | Limitation                            | Mitigation                           |
| -------------------------- | ------------------------------------- | ------------------------------------ |
| opencode/gpt-5-nano        | Smaller context window (32K)          | Use for focused tasks only           |
| opencode/minimax-m2.1-free | May hallucinate on complex code logic | Combine with Oracle for verification |
| opencode/kimi-k2.5-free    | Slower for simple tasks               | Use gpt-5-nano for quick operations  |
| opencode/glm-4.7-free      | Less creative for brainstorming       | Use kimi-k2.5-free for ideation      |

## Performance Tips

1. **Parallelize with gpt-5-nano**: Use for background exploration while heavier models work
2. **Verify with Oracle**: Always consult Oracle for critical architecture decisions
3. **Use Multimodal Looker for UI**: Superior visual understanding for frontend work
4. **Temperature tuning**: Lower for precision, higher for creativity
5. **Context efficiency**: gpt-5-nano is most token-efficient for simple tasks
