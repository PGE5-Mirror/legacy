# Architecture

## Event-driven messaging (RabbitMQ)

RabbitMQ is used as the message broker for inter-component communication, per the project's event-driven requirement.

### Connection

- Broker runs as a service in `docker-compose.yml` (`rabbitmq:3-management` image)
- AMQP port: `5672`
- Management UI: `http://localhost:15672` (login: `guest` / `guest`)
- The app connects via `src/server/events/rabbitmq.ts`, using connection details from environment variables:
  - `RABBITMQ_HOST`
  - `RABBITMQ_PORT`
  - `RABBITMQ_USER`
  - `RABBITMQ_PASSWORD`

### Queues / Events

| Queue name    | Published when          | Consumed by                              |
|---------------|--------------------------|-------------------------------------------|
| `TaskCreated` | A new task is created (`POST /items`) | `src/server/events/consumers/taskCreatedConsumer.ts` — logs the event and creates a notification for the task's owner via `src/server/services/notifications.service.ts` |

### Adding a new event

1. Call `publishEvent('QueueName', payload)` from `src/server/events/rabbitmq.ts` wherever the triggering action happens.
2. Create a consumer in `src/server/events/consumers/` using `consumeEvent('QueueName', handler)`.
3. Start the consumer in `src/server/index.ts`, alongside the existing ones.

### Verifying it works

Send a POST request to create a task (requires a Bearer token from `/login`):
```
POST /items
Content-Type: application/json
Authorization: Bearer <token>

{ "name": "Example task" }
```
You should see a `[TaskCreated] New task created: ...` log line from the consumer, and a
`GET /notifications` (with the same token) should return a new notification for that task.

## Observability (Prometheus + Grafana)

The app exposes a `GET /metrics` endpoint in Prometheus's text exposition format, scraped every
15 seconds by a Prometheus service running in `docker-compose.yml`. Grafana connects to
Prometheus as a data source to visualize the data. See [ADR 011](adr/011-observability-approach.md)
for why this approach was chosen and its known limitations.

### Metrics exposed

- Default Node.js process metrics (CPU, memory, event loop lag, garbage collection, active
  handles) via `prom-client`'s `collectDefaultMetrics()`.
- `tasks_created_total` — a counter incremented in `src/server/routes/items/addItem.ts` each time
  a task is successfully created.

### Setting it up locally

1. `docker compose up -d --build` starts the `prometheus` and `grafana` services alongside the app.
2. Open Grafana at `http://localhost:3001` (login `admin` / `admin` on first run).
3. Add a Prometheus data source: **Connections → Data sources → Add data source → Prometheus**.
   Use `http://prometheus:9090` as the URL — not `localhost`, since Grafana resolves other
   containers by their Docker Compose service name, not the host machine's ports.
4. **Save & test** should confirm the connection.
5. Build a dashboard: **Dashboards → New → New Dashboard → Add visualization**, pick the
   Prometheus data source, and query e.g. `tasks_created_total` or `nodejs_eventloop_lag_seconds`.
   Save the dashboard — it isn't persisted automatically until you explicitly save it, even though
   Grafana's own state (`grafana_data` volume) survives container restarts.

### Adding a new metric

1. Define it in `src/server/metrics.ts` using `prom-client`'s `Counter`/`Gauge`/`Histogram`, passing
   `registers: [register]` explicitly — metrics created without this register to prom-client's own
   global default registry instead, and silently won't appear on `/metrics`.
2. Call `.inc()` (or the appropriate method) wherever the event you're tracking happens.
