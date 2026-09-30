# ADR 009: RabbitMQ as the Event Broker

- **Status:** Accepted
- **Date:** 30/09/2026
- **Authors:** Arthur

## Context
As an event driven application, the project needed a way to publish and handle events. Since the base project has not event broken setup, we need to add one on our own.

## Options Considered
- **Option 1: Redis Pub/Sub**
  * **Pros:** Extremely fast, lightweight.
  * **Cons:** Lacks message persistence and guaranteed delivery (fire-and-forget; messages are lost if no subscriber is listening), no built-in dead-letter queues or complex routing topologies.
- **Option 2: Apache Kafka**
  * **Pros:** Unmatched throughput, durable event log retention, and robust stream-processing capabilities suitable for massive scale.
  * **Cons:** Significant operational complexity, heavy resource footprint, and massive overkill for our current event volume and team size.
- **Option 3: RabbitMQ (AMQP)**
  * **Pros:** Mature, highly reliable, excellent support for complex routing mechanisms (exchanges, bindings, queues), robust message acknowledgment, durability, and a clean management UI.
  * **Cons:** Requires managing a separate stateful service infrastructure and understanding AMQP concepts.

## Decision
We chose **Option 3: RabbitMQ as our standard event broker**.

While Redis lacked persistence for critical tasks and Kafka was too heavy to manage, RabbitMQ hit the sweet spot: reliable, flexible, and easy to run."

## Consequences
- **Positive:** 
  * Reliable message queuing and durable event handling preventing data loss during consumer downtime.
  * Flexible routing topologies via exchanges allowing complex publishing/subscribing patterns without altering core services.
  * Built-in management interface for monitoring queues, exchanges, and message rates.
- **Negative / Risks:** 
  * Introduction of another stateful component to monitor, back up, and maintain in production.
  * Potential learning curve for developers unfamiliar with AMQP routing concepts (exchanges vs. direct queues).