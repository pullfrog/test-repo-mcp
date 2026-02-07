#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// well-known path where the test runner writes the secret file.
// used as fallback for agents whose CLIs don't pass parent env to MCP servers.
const WELL_KNOWN_SECRET_PATH = "/tmp/pullfrog-mcp-secret/secret.txt";

const server = new Server(
  {
    name: "robinMCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_test_value",
        description: "Returns a read-only test value (no side effects, safe operation)",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// resolve the secret value with a three-tier fallback:
// 1. PULLFROG_MCP_SECRET_FILE env var (agents that inherit parent env)
// 2. well-known path /tmp/pullfrog-mcp-secret/secret.txt (agents that don't)
// 3. process.argv[2] (original nonce-based approach)
function resolveTestValue(): string {
  const envPath = process.env.PULLFROG_MCP_SECRET_FILE;
  if (envPath && existsSync(envPath)) {
    return readFileSync(envPath, "utf-8").trim();
  }
  if (existsSync(WELL_KNOWN_SECRET_PATH)) {
    return readFileSync(WELL_KNOWN_SECRET_PATH, "utf-8").trim();
  }
  return process.argv[2] ?? "NO_TEST_VALUE_FOUND";
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_test_value") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ value: resolveTestValue() }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
