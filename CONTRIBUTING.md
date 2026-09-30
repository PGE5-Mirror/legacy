# Contributing

This guide covers running the application locally, checking your changes, and submitting a pull request.

## Prerequisites

- Node.js 20 or newer and npm
- Docker Desktop (or Docker Engine) with the Docker Compose plugin
- Git
- On Windows, use Git Bash or WSL for the npm commands below. The test and build scripts use POSIX shell syntax.

## Install dependencies

From the `legacy` repository root, install the project dependencies:

```sh
npm install
```

## Run the full stack with Docker Compose

This starts the application, PostgreSQL, and RabbitMQ. The app container runs pending database migrations on startup.

```sh
docker compose up -d --build
```

- Application: <http://localhost:3000>
- RabbitMQ management UI: <http://localhost:15672> (user `guest`, password `guest`)

To follow startup logs, run `docker compose logs -f app`. Stop the services with `docker compose down`. Add `-v` only if you also intend to delete the persisted PostgreSQL data.

## Run the app locally

Running the app directly is useful for faster development iteration. Start PostgreSQL and RabbitMQ in Docker, but leave the app running on your machine:

```sh
docker compose up -d db rabbitmq
```

Set these environment variables in the same terminal where you will run migrations and start the app. These values are for local development only. The app runs outside Docker, so use `localhost` as the database and broker hostnames.

```sh
export DATABASE_URL='postgres://todo_user:todo_password@localhost:5432/todo_db'
export RABBITMQ_HOST='localhost'
export RABBITMQ_PORT='5672'
export RABBITMQ_USER='guest'
export RABBITMQ_PASSWORD='guest'
export JWT_SECRET='replace-with-a-local-development-secret'
```

PowerShell equivalents:

```powershell
$env:DATABASE_URL = 'postgres://todo_user:todo_password@localhost:5432/todo_db'
$env:RABBITMQ_HOST = 'localhost'
$env:RABBITMQ_PORT = '5672'
$env:RABBITMQ_USER = 'guest'
$env:RABBITMQ_PASSWORD = 'guest'
$env:JWT_SECRET = 'replace-with-a-local-development-secret'
```

`DATABASE_URL` and the RabbitMQ values configure service connections. `JWT_SECRET` is used to sign and verify authentication tokens; the application has an insecure fallback, so set a local value explicitly and never use the fallback or example value in a deployed environment. The variables need to remain set in the shell used for the following commands.

Install dependencies if you have not already, then apply database migrations and start the development server:

```sh
npm install
npm run migrate -- up
npm run dev
```

The development server listens at <http://localhost:3000> and restarts when server files change. Unlike `npm start`, `npm run dev` does not apply migrations automatically, so run the migration command after starting the database and whenever new migrations are added.

When finished, stop the local services with `docker compose down`.

## Checks before opening a pull request

Run all three checks from the repository root, preferably in this order:

```sh
npm run lint
npm test
npm run build
```

Fix any failures and rerun the checks before opening your pull request. `npm test` runs the test suite; `npm run build` type-checks and builds the frontend and backend.

## Branches, commits, and pull requests

Follow the project's [development conventions](docs/dev-conventions/dev-conventions.md):

- Name branches `type/ticket-number-short-description`, for example `feat/60-user-settings-backend`.
- Use Conventional Commit messages in the form `type: short summary`, such as `feat: add POST /tasks endpoint`.
- Keep a pull request focused on one story, describe what changed and why, and link the story or issue.
- Ensure CI passes and request at least one approval. Pull requests are squash-merged.

## API documentation

See the [API overview in the README](README.md#api). Endpoint-by-endpoint documentation is tracked in [issue #96](https://github.com/PGE5-Mirror/legacy/issues/96).
