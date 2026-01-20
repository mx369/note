import "dotenv/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverCommand = process.env.MCP_SERVER_COMMAND ?? "tsx";
const serverArgs =
  process.env.MCP_SERVER_ARGS?.split(" ") ?? ["src/server.ts"];

const transport = new StdioClientTransport({
  command: serverCommand,
  args: serverArgs,
});

const client = new Client(
  {
    name: "mcp-ts-node-client",
    version: "0.1.0",
  },
  {
    capabilities: {},
  }
);

await client.connect(transport);

const tools = await client.listTools();
console.log("Available tools:", tools.tools.map((tool) => tool.name));

const pingResult = await client.callTool({
  name: "ping",
  arguments: {},
});
console.log("Ping response:", pingResult.content);

if (process.env.RUN_API_REQUEST === "true") {
  const apiResult = await client.callTool({
    name: "api_request",
    arguments: {
      path: process.env.API_REQUEST_PATH ?? "/",
      method: process.env.API_REQUEST_METHOD ?? "GET",
      body: process.env.API_REQUEST_BODY,
    },
  });
  console.log("API response:", apiResult.content);
}

await client.close();
