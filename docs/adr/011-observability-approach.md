# ADR 011: Observability approach (Prometheus + Grafana)

* **Status:** Accepted
* **Date:** 30/09/2026
* **Authors:** Andrej

## Context
No observability tooling existed. This is a Could-have (brief §6.3). Two options were evaluated
for giving the team visibility into the running application.

## Options Considered
* **Option 1: Grafana + Prometheus**
  * **Pros:** Industry-standard observability stack; Prometheus's pull-based scraping model is
    simple to wire into an existing Express app via one `/metrics` endpoint; Grafana provides real,
    demoable dashboards with historical data rather than a single snapshot.
  * **Cons:** Two new services and a new dependency (`prom-client`) to maintain; only monitors the
    app wherever `docker-compose.yml` actually runs — a future deployment that doesn't run the full
    stack wouldn't have this tooling available.
* **Option 2: Minimal `/health` endpoint extension**
  * **Pros:** Trivial to add, no new services.
  * **Cons:** Not real observability — a handful of numbers in a JSON response, no time-series
    history, no dashboards.

## Decision
Chose Option 1. The app was instrumented with `prom-client`, exposing `/metrics` with default
Node.js process metrics plus one custom counter, `tasks_created_total`. Prometheus and Grafana
were added as `docker-compose.yml` services, scoped to local/demo use only — deliberately not
wired into CI, since these services have no test-relevant role there and a misconfigured health
check would only add flakiness for no benefit.

## Consequences
* **Positive:** A real, working observability pipeline (app → Prometheus → Grafana); `tasks_created_total`
  ties observability to actual business activity rather than only generic process stats; the
  pattern for adding further metrics is documented in `docs/architecture.md`.
* **Negative / Risks:** Grafana dashboards persist via a Docker volume, not version control — a
  dashboard built in the UI isn't captured in this repo. This setup depends on `docker-compose.yml`
  being the actual runtime environment; a future deployment (#70) that doesn't run the full stack
  would need separate observability work. Only one custom metric exists so far; broader coverage
  (e.g. HTTP request rate/duration by route) is a natural next step.
