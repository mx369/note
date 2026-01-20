import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const apiBaseUrl = process.env.API_BASE_URL;
const apiKey = process.env.API_KEY;

const server = new McpServer({
  name: "mcp-ts-node-server",
  version: "0.1.0",
});

server.tool("ping", {}, async () => {
  return {
    content: [{ type: "text", text: "pong" }],
  };
});

server.tool(
  "api_request",
  {
    path: z.string().describe("Relative path to call, e.g. /v1/models"),
    method: z.enum(["GET", "POST"]).default("GET"),
    body: z.string().optional().describe("Raw JSON string for POST requests"),
  },
  async ({ path, method, body }) => {
    if (!apiBaseUrl || !apiKey) {
      return {
        content: [
          {
            type: "text",
            text:
              "Missing API_BASE_URL or API_KEY. Set them in your environment or .env file.",
          },
        ],
      };
    }

    const url = new URL(path, apiBaseUrl).toString();
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: method === "POST" ? body ?? "" : undefined,
    });

    const responseText = await response.text();

    return {
      content: [
        {
          type: "text",
          text: `status: ${response.status}\n${responseText}`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
