# Architecture

## Event-driven messaging (RabbitMQ)

RabbitMQ is used as the message broker for inter-component communication, per the project's event-driven requirement.

### Connection

- Broker runs as a service in `docker-compose.yml` (`rabbitmq:3-management` image)
- AMQP port: `5672`
- Management UI: `http://localhost:15672` (login: `guest` / `guest`)
- The app connects via `src/events/rabbitmq.js`, using connection details from environment variables:
  - `RABBITMQ_HOST`
  - `RABBITMQ_PORT`
  - `RABBITMQ_USER`
  - `RABBITMQ_PASSWORD`

### Queues / Events

| Queue name    | Published when          | Consumed by                              |
|---------------|--------------------------|-------------------------------------------|
| `TaskCreated` | A new task is created (`POST /items`) | `src/events/consumers/taskCreatedConsumer.js` (currently logs the event) |

### Adding a new event

1. Call `publishEvent('QueueName', payload)` from `src/events/rabbitmq.js` wherever the triggering action happens.
2. Create a consumer in `src/events/consumers/` using `consumeEvent('QueueName', handler)`.
3. Start the consumer in `index.js`, alongside the existing ones.

### Verifying it works

Send a POST request to create a task:
```
POST /items
Content-Type: application/json

{ "name": "Example task" }
```
You should see a `[TaskCreated] New task created: ...` log line from the consumer.