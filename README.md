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
| Contributing (local setup and pull requests) | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Team charter, sprint objectives, meeting notes | [`docs/meetings/`](docs/meetings/) |

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- Node.js 20+ (only needed if you want to run the app outside Docker)

### Run everything with Docker (recommended)

```
docker compose up -d --build
```

This builds the app, and starts Postgres, RabbitMQ, Prometheus, Grafana, and the app together:
- App: http://localhost:3000
- RabbitMQ management UI: http://localhost:15672 (login `guest` / `guest`)
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (login `admin` / `admin` on first run) — the Prometheus data source and a starter dashboard are already set up, see `docs/architecture.md`

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

The API documentation is available at `/api-docs` when the project is started.

## Code quality
- `npm run lint` — runs ESLint
- `npm run format` — runs Prettier
- `npm test` — runs the test suite

## Testing
`npm test` runs every test (backend and frontend) with a coverage report. Jest runs them as two projects (see `jest.config.js`):

| Project | Environment | Where the specs live |
|---|---|---|
| `backend` | Node | `spec/**/*.spec.ts` (everything except `spec/client/`) |
| `frontend` | jsdom (browser-like) | `spec/client/**/*.spec.tsx` |

- Run only one project: `npx jest --selectProjects frontend`
- Run one file: `npx jest spec/client/components/KanbanBoard.spec.tsx`

Frontend tests use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (v12, because the app uses React 16) and the matchers from `@testing-library/jest-dom`. The reasoning is in [ADR 004](docs/adr/004-frontend-testing.md).

### Writing a frontend test
Mock the shared `apiRequest` helper so no server is needed, render the component, then interact with it the way a user would (visible text, labels, buttons):

```tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MyComponent } from '../../../src/client/components/MyComponent';
import { apiRequest } from '../../../src/client/api';

jest.mock('../../../src/client/api');
const mockedRequest = apiRequest as jest.Mock;

it('shows the saved item after clicking Save', async () => {
  mockedRequest.mockResolvedValue({ id: '1', name: 'My item' });
  render(<MyComponent />);

  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByText('My item')).toBeInTheDocument();
});
```

For a complete example (fake server, creating, assigning and moving tasks, error messages), see `spec/client/components/KanbanBoard.spec.tsx`.
