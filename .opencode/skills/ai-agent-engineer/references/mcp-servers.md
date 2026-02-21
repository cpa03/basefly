# MCP Server Configuration Reference

This document provides detailed configuration for MCP (Model Context Protocol) servers in OpenX Basefly.

## Overview

MCP servers extend agent capabilities with external tools and resources. They are configured in `.opencode/oh-my-opencode.json` under the `mcp.servers` array.

## Available MCP Servers

### websearch (Exa)

Provides web search capabilities using Exa AI.

```json
{
  "name": "websearch",
  "enabled": true
}
```

**Capabilities:**

- Real-time web search
- Content extraction from URLs
- Context-aware search results

**Use Cases:**

- Finding current information
- Research on external libraries
- Documentation lookup

### context7

Provides access to official documentation for libraries and frameworks.

```json
{
  "name": "context7",
  "enabled": true
}
```

**Capabilities:**

- Official API documentation
- Version-specific docs
- Code examples

**Use Cases:**

- Library API reference
- Framework documentation
- Best practices lookup

### github-search

Provides GitHub code search capabilities.

```json
{
  "name": "github-search",
  "enabled": true
}
```

**Capabilities:**

- Search code across GitHub repositories
- Find implementation examples
- Discover patterns in open-source projects

**Use Cases:**

- Finding real-world code examples
- Discovering best practices
- Research implementation patterns

## Configuration Pattern

### Basic Configuration

```json
{
  "mcp": {
    "servers": [
      {
        "name": "websearch",
        "enabled": true
      },
      {
        "name": "context7",
        "enabled": true
      },
      {
        "name": "github-search",
        "enabled": true
      }
    ]
  }
}
```

### Adding New MCP Servers

1. Add the server configuration to `oh-my-opencode.json`
2. Ensure the server is properly installed/configured in the OpenCode environment
3. Test with actual agent interactions

### Disabling MCP Servers

Set `enabled: false` to temporarily disable a server without removing configuration:

```json
{
  "name": "websearch",
  "enabled": false
}
```

## Best Practices

1. **Enable only needed servers** - Minimize context bloat by disabling unused servers
2. **Test after changes** - Verify MCP servers work after configuration changes
3. **Document custom servers** - If adding custom MCP servers, document their capabilities

## Troubleshooting

### Server Not Responding

1. Check `enabled` is `true`
2. Verify server is installed in OpenCode environment
3. Check for network connectivity issues

### Context Bloat

If context window is filling too quickly:

1. Disable unnecessary MCP servers
2. Use more specific queries to reduce result sizes
3. Consider using `explore` agent for internal codebase searches instead

## Related Configuration

- See [model-capabilities.md](./model-capabilities.md) for model selection
- See `.opencode/oh-my-opencode.json` for full configuration
