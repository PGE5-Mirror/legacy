# Architecture

The backend is a TypeScript/Express app (`src/`) backed by PostgreSQL, with RabbitMQ for
event-driven communication. See `docs/adr/` for the reasoning behind the technology choices,
and `docs/dev-conventions/` for how the codebase is meant to evolve day-to-day.

## Persistence (PostgreSQL)

- Schema changes are managed through versioned migrations in `migrations/`, run via
  `node-pg-migrate` (`npm run migrate`, or automatically on `npm start`).
- `src/persistence/postgres.ts` implements the persistence interface against Postgres;
  `src/persistence/index.ts` re-exports it so the rest of the app depends on the interface,
  not the specific database.
- Connection is configured via the `DATABASE_URL` environment variable.

## Event-driven messaging (RabbitMQ)

RabbitMQ is used as the message broker for inter-component communication, per the project's
event-driven requirement.

### Connection

- Broker runs as a service in `docker-compose.yml` (`rabbitmq:3-management` image)
- AMQP port: `5672`
- Management UI: `http://localhost:15672` (login: `guest` / `guest`)
- The app connects via `src/events/rabbitmq.ts`, using connection details from environment variables:
  - `RABBITMQ_HOST`
  - `RABBITMQ_PORT`
  - `RABBITMQ_USER`
  - `RABBITMQ_PASSWORD`

### Queues / Events

| Queue name    | Published when          | Consumed by                              |
|---------------|--------------------------|-------------------------------------------|
| `TaskCreated` | A new task is created (`POST /items`) | `src/events/consumers/taskCreatedConsumer.ts` (currently logs the event) |

### Adding a new event

1. Call `publishEvent('QueueName', payload)` from `src/events/rabbitmq.ts` wherever the triggering action happens.
2. Create a consumer in `src/events/consumers/` using `consumeEvent('QueueName', handler)`.
3. Start the consumer in `src/index.ts`, alongside the existing ones.

### Verifying it works

Send a POST request to create a task:
```
POST /items
Content-Type: application/json

{ "name": "Example task" }
```
You should see a `[TaskCreated] New task created: ...` log line from the consumer.
