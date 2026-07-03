# TRIZ MCP Server

A Model Context Protocol (MCP) server exposing [pytriz](https://github.com/mmysior/pytriz) TRIZ tools over Streamable HTTP.

## Run with uv

```bash
cp ../.env.example .env   # or create mcp-server/.env directly
uv sync
uv run python app/main.py
```

Server listens on `http://localhost:8123` (see `MCP_HOST` / `MCP_PORT` in `.env`).

## Run with Docker

```bash
./local_deploy.sh
```

Builds the image, runs it detached, and prints the server URL, logs command, and stop command.

## Run with Docker Compose (full stack)

From the project root:

```bash
cd docker
docker compose up -d
```

This starts **postgres**, **embeddings** (Ollama), and **mcp-server** together.

## Test with MCP Inspector

With the server running (locally or via Docker), launch the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npx @modelcontextprotocol/inspector
```

In the Inspector UI, connect using:

- **Transport:** Streamable HTTP
- **URL:** `http://localhost:8123/mcp`

You should see the registered tools (contradiction matrix lookup, parameter/principle search, etc.) and can invoke them directly from the UI.

## Add to LM Studio

With the server running, open the "Program" tab in LM Studio's right sidebar, then `Install > Edit mcp.json`, and add:

```json
{
  "mcpServers": {
    "triz-mcp-server": {
      "url": "http://localhost:8123/mcp"
    }
  }
}
```

## Available Tools

| Tool                          | Type  | Description                                       |
| ----------------------------- | ----- | ------------------------------------------------- |
| `browse_contradiction_matrix` | sync  | Look up Inventive Principles from the TRIZ matrix |
| `search_parameter`            | async | Semantic search over TRIZ engineering parameters  |
| `search_principle`            | async | Semantic search over TRIZ Inventive Principles    |
| `get_random_principles`       | sync  | Return random Inventive Principles                |
| `get_principle_by_id`         | sync  | Get a principle by numeric ID (1–40)              |
| `get_parameter_by_id`         | sync  | Get a parameter by numeric ID (1–39)              |
