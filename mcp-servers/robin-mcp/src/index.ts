#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

// read test value from env var or file fallback
// file fallback needed for CLIs that don't propagate env vars to MCP servers
function getTestValue(): string {
  // try env var first
  const envValue = process.env.PULLFROG_MCP_TEST;
  if (envValue) {
    return envValue;
  }

  // fallback: read from file using PULLFROG_MCP_PORT to locate the env dir
  const mcpPort = process.env.PULLFROG_MCP_PORT;
  if (mcpPort) {
    try {
      const filePath = join("/tmp", `pullfrog-env-${mcpPort}`, "PULLFROG_MCP_TEST");
      return readFileSync(filePath, "utf-8");
    } catch {
      // file doesn't exist
    }
  }

  return "NO_TEST_VALUE_FOUND";
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_test_value") {
    const value = getTestValue();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ value }, null, 2),
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
