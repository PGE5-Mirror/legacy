# Legacy — TodoList to Kanban Rework

A TypeScript/Express backend, backed by PostgreSQL, with RabbitMQ for event-driven
communication. Originally forked from Docker's
[getting-started](https://github.com/docker/getting-started) tutorial app and being
progressively reworked into a Kanban application.

## Documentation

| What | Where |
|---|---|
| Architecture (persistence, event-driven messaging) | [`docs/architecture.md`](docs/architecture.md) |
| Architecture Decision Records (why we chose what we chose) | [`docs/adr/`](docs/adr/) |
| Development conventions (branching, commits, PRs) | [`docs/dev-conventions/dev-conventions.md`](docs/dev-conventions/dev-conventions.md) |
| Team charter, sprint objectives, meeting notes | [`docs/meetings/`](docs/meetings/) |

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- Node.js 20+ (only needed if you want to run the app outside Docker)

### Run everything with Docker (recommended)

```
docker compose up -d --build
```

This builds the app, and starts Postgres, RabbitMQ, and the app together:
- App: http://localhost:3000
- RabbitMQ management UI: http://localhost:15672 (login `guest` / `guest`)

Database migrations run automatically on startup — see `docs/architecture.md` for how that works.

To stop everything (and remove data volumes):
```
docker compose down -v
```

### Run locally (faster iteration)

Start just the database and broker via Docker, then run the app directly:
```
docker compose up -d db rabbitmq
```

Set the required environment variables (see `.env` for the local Postgres connection string;
`RABBITMQ_HOST` defaults to `localhost` if unset, matching the ports Docker exposes above):
```
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/tododb
```

Then:
```
npm install
npm run dev      # runs src/index.ts directly, restarts on file changes
```

Other scripts:
- `npm run build` — compiles TypeScript to `dist/` and copies static frontend assets
- `npm start` — runs pending migrations, then starts the compiled app (`dist/index.js`)
- `npm run migrate` — run `node-pg-migrate` directly (e.g. to create a new migration file)

### API

| Method | Path | Description |
|---|---|---|
| GET | `/items` | List all tasks |
| POST | `/items` | Create a task (`{ "name": "..." }`) |
| PUT | `/items/:id` | Update a task (`{ "name": "...", "completed": true }`) |
| DELETE | `/items/:id` | Delete a task |

## Code quality
- `npm run lint` — runs ESLint
- `npm run format` — runs Prettier
- `npm test` — runs the test suite
