#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "node:fs";
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_test_value") {
    try {
      // try env var first (works for Claude, Gemini, OpenCode)
      let value = process.env.PULLFROG_MCP_TEST;
      
      // fallback: read from file in repo root (works for Cursor)
      if (!value) {
        const filePath = join(process.cwd(), ".pullfrog-mcp-test");
        if (existsSync(filePath)) {
          value = readFileSync(filePath, "utf-8").trim();
        }
      }

      if (!value) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "test value not found (checked env and file)" }, null, 2),
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ value }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "Failed to retrieve test value",
                message: error instanceof Error ? error.message : String(error),
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
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
