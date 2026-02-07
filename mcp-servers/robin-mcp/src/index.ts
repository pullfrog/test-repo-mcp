#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

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

// when PULLFROG_MCP_SECRET_FILE is set, read the secret from that file;
// otherwise fall back to process.argv[2] (test runner passes nonce as arg).
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_test_value") {
    const secretPath = process.env.PULLFROG_MCP_SECRET_FILE;
    const value =
      secretPath !== undefined && secretPath !== ""
        ? readFileSync(secretPath, "utf-8").trim()
        : (process.argv[2] ?? "NO_TEST_VALUE_FOUND");
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
