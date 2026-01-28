# robin-mcp

A sample Model Context Protocol (MCP) server with a story tool.

## Purpose

This server demonstrates a minimal MCP implementation with a single tool that returns a story value.

## Available Tools

### `tell_story`

Returns a story value.

**Input**: No parameters required

**Output**: JSON object with `story` field containing the story value

**Example output**:
```json
{
  "story": "<story value>"
}
```

## Installation

From the `mcp-servers/robin-mcp` directory:

```bash
npm install
```

The `prepare` script will automatically compile the TypeScript code during installation.

## Configuration

This server is already configured in the following agent config files:
- `.claude/settings.json`
- `.cursor/mcp.json`
- `.codex/config.toml`
- `.gemini/settings.json`
- `opencode.json`

## Requirements

- Node.js 16+
- TypeScript compiler (dev dependency)

## Development

Build the server:

```bash
npm run build
```

The compiled output will be in the `build/` directory.
