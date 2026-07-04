# Build with AI Wrocław — NAN Stack + TRIZ MCP Server

Nx monorepo: **Angular 21** (frontend) + **NestJS 11** (API) + **PostgreSQL 17** (DB) + **Python MCP Server** (TRIZ tools) + **Ollama** (embeddings).

---

## Prerequisites

| Tool               | Required Version | Check                    |
| ------------------ | ---------------- | ------------------------ |
| **Node.js**        | ≥ 22.x           | `node --version`         |
| **npm**            | ≥ 10.x           | `npm --version`          |
| **Python**         | ≥ 3.13           | `python3 --version`      |
| **uv**             | ≥ 0.11           | `uv --version`           |
| **Docker**         | ≥ 29.x           | `docker --version`       |
| **Docker Compose** | ≥ 5.x            | `docker compose version` |

### Installing prerequisites

```bash
# Node.js (via nvm)
nvm install 22
nvm use 22

# uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Docker — follow https://docs.docker.com/engine/install/
```

> **Note:** Python 3.13 is required by the MCP server. If your system has an older version, `uv` will auto-download it during `uv sync`.

---

## Quick Start (full stack)

```bash
# 1. Clone & install Node dependencies
git clone <repo-url> && cd google-hackaton
npm install

# 2. Set up environment
cp .env.example .env          # review & adjust if needed

# 3. Start infrastructure (PostgreSQL + Ollama + MCP Server)
npm run start:db               # or: docker compose -f docker/docker-compose.yml up -d

# 4. Install & start MCP server (local, without Docker)
cd mcp-server
uv sync
uv run python app/main.py &   # runs on http://localhost:8123/mcp
cd ..

# 5. Start backend + frontend
npm start                      # starts API (port 3000) + Frontend (port 4200) concurrently
```

After all services are up:

| Service               | URL                                                                 |
| --------------------- | ------------------------------------------------------------------- |
| **Angular Frontend**  | http://localhost:4200                                               |
| **NestJS API**        | http://localhost:3000/api                                           |
| **Swagger Docs**      | http://localhost:3000/api                                           |
| **TRIZ MCP Server**   | http://localhost:8123/mcp                                           |
| **PostgreSQL**        | `localhost:5432` (user: `postgres`, pass: `postgres`, db: `nestDb`) |
| **Ollama Embeddings** | http://localhost:11434                                              |

---

## Project Structure

```
google-hackaton/
├── apps/
│   ├── api/                    # NestJS 11 backend (port 3000)
│   │   └── src/
│   │       ├── main.ts         # Entry: global prefix /api, Swagger, CORS
│   │       └── app/
│   │           ├── app.module.ts
│   │           ├── user/       # User module (controller, service, model, DTOs)
│   │           └── order/      # Order module (controller, service, model, DTOs)
│   │
│   └── frontend/               # Angular 21 app (port 4200)
│       └── src/
│           └── app/
│               ├── pages/      # Routable page components
│               ├── containers/ # Smart components (state + service)
│               └── components/ # Dumb/presentational components
│
├── libs/
│   └── http/                   # Shared Angular HTTP services (SDK for API)
│
├── mcp-server/                 # Python MCP server (port 8123)
│   ├── app/
│   │   ├── main.py             # FastMCP + uvicorn + CORS
│   │   ├── core/               # Config (pydantic-settings) + Logger
│   │   ├── services/           # TRIZStore singleton factory
│   │   ├── tools/              # MCP tool handlers (6 TRIZ tools)
│   │   ├── prompts/            # Scaffolded prompt templates
│   │   └── resources/          # Scaffolded resource handlers
│   ├── Dockerfile
│   ├── local_deploy.sh
│   └── pyproject.toml
│
├── docker/
│   ├── docker-compose.yml      # PostgreSQL + Ollama + MCP server
│   ├── init/
│   │   ├── 01-schema.sql       # users + orders tables
│   │   └── 02-seed.sql         # Seed data
│   └── embeddings/
│       └── Dockerfile          # Ollama with embeddinggemma:300m
│
├── .env                        # Environment variables (DB + MCP + Embeddings)
├── nx.json                     # Nx workspace config
├── package.json                # Node dependencies + npm scripts
├── tsconfig.base.json          # Shared TypeScript config
└── ARCHITECTURE.md             # Detailed architecture docs
```

---

## Running Services Individually

### 1. Database (PostgreSQL)

```bash
# Start
npm run start:db

# Stop
npm run stop:db

# Full reset (drops data + re-seeds)
npm run restart:db
```

DB is auto-initialized with schema (`01-schema.sql`) and seed data (`02-seed.sql`) on first run.

### 2. NestJS API

```bash
npm run start:api
# or: npx nx serve api
```

- Runs on **http://localhost:3000/api**
- Swagger UI at **http://localhost:3000/api**
- Requires PostgreSQL to be running
- Reads DB config from `.env` (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`)

### 3. Angular Frontend

```bash
npm run start:frontend
# or: npx nx serve frontend
```

- Runs on **http://localhost:4200**
- Proxies API calls via interceptor to `http://localhost:3000`

### 4. Both API + Frontend (concurrent)

```bash
npm start
```

### 5. TRIZ MCP Server

#### Option A: Local with uv (development)

```bash
cd mcp-server
uv sync                         # install Python dependencies
uv run python app/main.py       # start server
```

#### Option B: Docker standalone

```bash
cd mcp-server
./local_deploy.sh                # builds image, runs detached
```

#### Option C: Docker Compose (with embeddings)

```bash
docker compose -f docker/docker-compose.yml up -d mcp-server embeddings
```

Server runs on **http://localhost:8123/mcp**.

### 6. Test MCP with Inspector

```bash
npx @modelcontextprotocol/inspector
```

Connect with: **Streamable HTTP** → `http://localhost:8123/mcp`

---

## Environment Variables

All variables are in `.env` (root). Copy from `.env.example`:

```bash
cp .env.example .env
```

| Variable                | Default                     | Used By    |
| ----------------------- | --------------------------- | ---------- |
| `DB_HOST`               | `localhost`                 | NestJS API |
| `DB_PORT`               | `5432`                      | NestJS API |
| `DB_USERNAME`           | `postgres`                  | NestJS API |
| `DB_PASSWORD`           | `postgres`                  | NestJS API |
| `DB_NAME`               | `nestDb`                    | NestJS API |
| `MCP_HOST`              | `localhost`                 | MCP Server |
| `MCP_PORT`              | `8123`                      | MCP Server |
| `EMBEDDING_MODEL`       | `embeddinggemma:300m`       | MCP Server |
| `EMBEDDING_SERVICE_URL` | `http://localhost:11434/v1` | MCP Server |

---

## Ports Map

| Port    | Service           |
| ------- | ----------------- |
| `3000`  | NestJS API        |
| `4200`  | Angular Frontend  |
| `5432`  | PostgreSQL        |
| `8123`  | TRIZ MCP Server   |
| `11434` | Ollama Embeddings |

---

## NPM Scripts Reference

| Script                   | Command                             |
| ------------------------ | ----------------------------------- |
| `npm start`              | Start API + Frontend concurrently   |
| `npm run start:api`      | Start NestJS API only               |
| `npm run start:frontend` | Start Angular frontend only         |
| `npm run start:db`       | Start PostgreSQL via Docker Compose |
| `npm run stop:db`        | Stop PostgreSQL                     |
| `npm run restart:db`     | Full DB reset                       |
| `npm run lint:all`       | Lint all projects                   |
| `npm run format`         | Format code with Prettier           |

---

## Model Context Protocol (MCP) Servers

This workspace is fully integrated with the Model Context Protocol (MCP), allowing AI assistants (such as Claude Code, Cursor, or Windsurf) to interact directly with the local development stack, workspace tools, database, and documentation.

The server definitions are configured in [.antigravity/mcp_config.json](.antigravity/mcp_config.json) (mirrored in [mcp_config.json](mcp_config.json)).

### Workspace MCP Servers configuration

To connect your AI assistant, configure your client settings with the workspace-specific configuration. Substitute `/absolute/path/to/workspace` with the absolute path to this project:

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "node",
      "args": ["/absolute/path/to/workspace/node_modules/.bin/ng", "mcp"]
    },
    "nx": {
      "command": "node",
      "args": ["/absolute/path/to/workspace/node_modules/.bin/nx", "mcp"]
    },
    "qmd": {
      "command": "node",
      "args": ["/absolute/path/to/workspace/node_modules/.bin/qmd", "mcp"]
    },
    "ng-diagram": {
      "command": "node",
      "args": ["/absolute/path/to/workspace/node_modules/.bin/ng-diagram-mcp"]
    },
    "postgres": {
      "command": "npx",
      "args": ["--yes", "--quiet", "@modelcontextprotocol/server-postgres", "postgresql://postgres:postgres@localhost:5432/nestDb"]
    },
    "triz-mcp-server": {
      "url": "http://localhost:8123/mcp"
    }
  }
}
```

### Available MCP Servers & Tools

#### 1. TRIZ MCP Server (`triz-mcp-server`)

- **Type**: Streamable HTTP
- **URL**: `http://localhost:8123/mcp`
- **Location**: [mcp-server/](mcp-server/) (Python FastMCP implementation)
- **Description**: Exposes `pytriz` tools to lookup Inventive Principles from the TRIZ contradiction matrix and perform semantic search over parameters.
- **Key Tools**:
  - `browse_contradiction_matrix`: Look up Inventive Principles from the TRIZ contradiction matrix.
  - `search_parameter`: Semantic search over TRIZ engineering parameters (utilizing Ollama embeddings).
  - `search_principle`: Semantic search over TRIZ Inventive Principles.
  - `get_random_principles`: Return random Inventive Principles.
  - `get_principle_by_id`: Get a principle by numeric ID (1–40).
  - `get_parameter_by_id`: Get a parameter by numeric ID (1–39).

#### 2. QMD (Query Markdown Documents) (`qmd`)

- **Type**: Stdio / Executable
- **Command**: `npx qmd mcp`
- **Description**: Connects to the local engineering wiki ([docs/wiki/](docs/wiki/)) to query architectural and implementation guidelines.
- **Key Tools**:
  - `query`: Hybrid search with BM25, semantic search, and re-ranking.
  - `get`: Retrieve a document's full content or specific line ranges by ID/path.
  - `multi_get`: Retrieve multiple document contents by glob pattern or IDs.
  - `status`: Retrieve index health status and collection list.

#### 3. Nx Workspace Helper (`nx`)

- **Type**: Stdio / Executable
- **Command**: `npx nx mcp`
- **Description**: Bridges AI assistants with the Nx workspace architecture.
- **Key Tools**:
  - Analyze workspace configuration, project dependencies, and targets.
  - Generate files/components using Nx Generators.
  - Execute workspace tasks (`build`, `test`, `lint`, etc.).

#### 4. Angular CLI Helper (`angular-cli`)

- **Type**: Stdio / Executable
- **Command**: `npx ng mcp`
- **Description**: Allows AI assistants to perform Angular CLI specific tasks.
- **Key Tools**:
  - Run CLI generators and schematics (e.g., component, service, module creation).
  - Execute Angular build, test, and serve configurations.

#### 5. Angular Diagram Doc Search (`ng-diagram`)

- **Type**: Stdio / Executable
- **Command**: `npx ng-diagram-mcp`
- **Description**: Exposes the official `ng-diagram` documentation and public API symbols to prevent code hallucinations.
- **Key Tools**:
  - `search_docs`: Search guide/documentation pages.
  - `get_doc`: Get the full markdown content of a documentation guide.
  - `search_symbols`: Search the public API for classes, components, interfaces, and functions.
  - `get_symbol`: Retrieve detailed signature and import statements for a symbol.

#### 6. Database Inspector (`postgres`)

- **Type**: Stdio / Executable
- **Command**: `npx @modelcontextprotocol/server-postgres`
- **Description**: Provides read/write access to the PostgreSQL instance running locally (the `nestDb` database).
- **Key Tools**:
  - Query table structures, run SQL queries, and inspect databases.

---

## QMD (Query Markdown Documents)

QMD is a CLI tool and MCP server used in this workspace to query and navigate the local engineering wiki (`./docs/wiki`).

### 1. Installation

If you need to use the `qmd` CLI directly on your machine:

```bash
npm install -g @tobilu/qmd
```

Within this repository, `@tobilu/qmd` is already installed as a development dependency. You can run it via `npx`:

```bash
npx qmd --help
```

### 2. Adding QMD as an MCP Server

To use QMD with an AI Assistant (like Claude Code or Antigravity IDE), add it to your `mcp.json` or `.antigravity/mcp_config.json`:

```json
{
  "mcpServers": {
    "qmd": {
      "command": "npx",
      "args": ["qmd", "mcp"]
    }
  }
}
```

### 3. Basic CLI Usage

#### Search for articles or concepts:

```bash
# Keyword Search (BM25)
npx qmd search "antigravity design system" -n 5

# Conceptual Query with fields
npx qmd query "intent: Find guidelines about NestJS DTO validation"
```

#### Fetch document content:

```bash
# Retrieve a document by docid
npx qmd get "#abc123"

# Retrieve specific line ranges (lines 20 to 60)
npx qmd get "#abc123:20:40"

# Fetch multiple files at once
npx qmd multi-get "#abc123,#def456" --format md
```

#### Check Index Status:

```bash
npx qmd status
npx qmd collection list
```

---

## Technology Stack

| Layer                | Technology                       | Version |
| -------------------- | -------------------------------- | ------- |
| **Frontend**         | Angular                          | 21.2    |
| **UI Library**       | Angular Material + CDK           | 21.2    |
| **Backend**          | NestJS                           | 11.x    |
| **ORM**              | Sequelize (sequelize-typescript) | 6.x     |
| **Database**         | PostgreSQL                       | 17      |
| **MCP Server**       | FastMCP (Python mcp SDK)         | ≥1.27   |
| **MCP Domain**       | pytriz (TRIZ methodology)        | 0.3.0   |
| **Embeddings**       | Ollama (embeddinggemma:300m)     | 0.23.4  |
| **Monorepo**         | Nx                               | 22.7    |
| **Language**         | TypeScript 5.9 / Python 3.13     | —       |
| **Package Mgmt**     | npm (Node) / uv (Python)         | —       |
| **Containerization** | Docker + Docker Compose          | —       |
