# codether

A real-time collaborative code editor and runner for learning together. Create a pad, share the
link, edit the same code live, and press **Run**: the code executes once on the server and everyone
sees the same output.

## Repository layout

```
apps/
  web/       React + Vite + Tailwind frontend
  collab/    Realtime (Hocuspocus) + code execution server (Node 24, TypeScript)
packages/
  shared/    Shared types, zod schemas, language config
compose.yaml       Full stack in Docker (postgres, piston, collab, web)
compose.dev.yaml   Dev override: expose postgres + piston on 127.0.0.1 for host-run apps
```

`apps/collab` runs TypeScript directly with Node's built-in type stripping, so there is no build
step for the server. Consequences: only erasable TS syntax (no `enum`, no `namespace`, no parameter
properties), and relative imports use the `.ts` extension.

## Prerequisites

- **Node.js 24 LTS** (`nvm use` reads `.nvmrc`)
- **pnpm 12** (`npm install -g pnpm@12` or `corepack enable`)
- **Docker** with Compose v2 (Docker Desktop, OrbStack, or Docker Engine on Linux)

Piston runs in a privileged container. That works on Docker Desktop/OrbStack for macOS and on Linux.

## Setup

```sh
cp .env.example .env        # then change POSTGRES_PASSWORD (and DATABASE_URL to match)
pnpm install
```

### Option A: apps on the host, infra in Docker (recommended for development)

Fast reloads for both apps; Postgres and Piston run in Docker, bound to `127.0.0.1` only.

```sh
pnpm infra:up               # postgres + piston
pnpm dev                    # collab on :4000, web on :5173
```

Open http://localhost:5173. The Vite dev server proxies `/api` and `/collab` to the collab server,
matching the production URL layout behind Caddy.

Stop the infra with `pnpm infra:down`.

### Option B: everything in Docker

```sh
pnpm stack:up               # docker compose up --build
```

Open http://localhost:5173. In this mode Piston and Postgres sit on internal-only Docker networks
reachable only from collab, as they will in production. No hot reload; rebuild after changes.

### Language runtimes

Piston starts with no languages installed. `scripts/install-runtimes.sh` arrives in Phase 1; until
then the status page shows Piston as reachable but nothing can run yet.

## Scripts

| Command          | What it does                                   |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Run web + collab in watch mode                 |
| `pnpm typecheck` | `tsc` in every package (strict mode)           |
| `pnpm lint`      | ESLint (type-aware, `no-explicit-any` enabled) |
| `pnpm format`    | Prettier write                                 |
| `pnpm test`      | Vitest across all packages                     |
| `pnpm check`     | typecheck + lint + format check + tests        |
| `pnpm infra:up`  | Start postgres + piston for host development   |
| `pnpm stack:up`  | Build and run the full stack in Docker         |

## Health endpoints (apps/collab)

- `GET /api/health`: liveness. Returns 200 whenever the process is serving requests.
- `GET /api/health/ready`: readiness. Returns 200 if Piston is reachable, 503 otherwise.
