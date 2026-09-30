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

Set the required environment variables — see `docker-compose.yml`'s `app` service for the values
(`DATABASE_URL`, `RABBITMQ_HOST`/`PORT`/`USER`/`PASSWORD`). `JWT_SECRET` isn't currently set
anywhere and falls back to an insecure default in code — set it explicitly for anything beyond
local experimentation. A tracked `.env.example` covering local setup is planned; until then, copy
the values from `docker-compose.yml`'s `env` blocks rather than from any `.env` file in the repo.

Then:
```
npm install
npm run dev      # runs src/server/index.ts directly, restarts on file changes
```

Other scripts:
- `npm run build` — compiles TypeScript to `dist/` and copies static frontend assets
- `npm start` — runs pending migrations, then starts the compiled app (`dist/server/index.js`)
- `npm run migrate` — run `node-pg-migrate` directly (e.g. to create a new migration file)

### API

The backend exposes REST endpoints under these areas (all except `/register` and `/login`
require a `Bearer` token from `/login`):

| Area | Base path |
|---|---|
| Auth | `POST /register`, `POST /login` |
| Tasks | `/items`, `/columns/:id/tasks` |
| Columns | `/columns` |
| Organizations | `/organizations` |
| Organization members | `/organizations/:id/members` |
| Projects | `/organizations/:id/projects`, `/projects/:id` |
| User settings | `/users/me/settings` |
| Notifications | `/notifications` |
| User account | `/users`, `/users/me`, `/users/me/export` |

Full endpoint-by-endpoint documentation (methods, request/response shapes, status codes) is
tracked separately — see issue #96.

## Code quality
- `npm run lint` — runs ESLint
- `npm run format` — runs Prettier
- `npm test` — runs the test suite
