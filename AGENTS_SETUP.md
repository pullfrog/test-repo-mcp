# Agent MCP Configuration

This repository includes sample MCP (Model Context Protocol) server configurations for various AI coding agents.

## Configuration Files

Each agent has its own configuration file with examples of both HTTP and local MCP servers:

- **Claude Code**: `.mcp.json`
- **Cursor**: `.cursor/mcp.json`
- **Codex CLI**: `.codex/config.toml`
- **Gemini CLI**: `.gemini/settings.json`
- **OpenCode**: `opencode.json`

## MCP servers

The configurations include the MCP server:

### robinMCP (Local/stdio)

- **Command**: `node ./mcp-servers/robin-mcp/build/index.js`
- **Purpose**: Sample custom MCP server with a story tool
- **Tools**: `tell_story` - Returns a story value

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io)
