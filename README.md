# note

## MCP TypeScript (Node.js) Starter

This project provides a minimal MCP server and client written in TypeScript.
The server exposes a simple `ping` tool plus an `api_request` tool that forwards
requests to an external API using an API key you provide.

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
cp .env.example .env
```

Update `.env` with your API settings:

- `API_BASE_URL` - Base URL of the API you want to call.
- `API_KEY` - API key provided by you.

### Run the MCP server

```bash
npm run start:server
```

### Run the MCP client

```bash
npm run start:client
```

The client will:

1. Start the MCP server via stdio.
2. List available tools.
3. Call the `ping` tool.

If you want the client to also call the `api_request` tool, set:

```bash
RUN_API_REQUEST=true
API_REQUEST_PATH=/v1/whatever
API_REQUEST_METHOD=GET
API_REQUEST_BODY=
```

### Build

```bash
npm run build
```
