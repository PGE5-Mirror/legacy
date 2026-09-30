# Sprint 2 Objectives — Core Features

Quoted directly from the project brief ("LEGACY - TodoList Rework Project-2.pdf", section 8.2):

> Focus on delivering the main functional requirements.
>
> The quality process should now be fully integrated into your development workflow.
>
> Features should be delivered incrementally through short Pull Requests rather than through
> one large final integration.

## What each objective concretely means for this codebase

Mapped against the Must-have list (brief section 6.1) and the current state of `dev` /
open branches as of this sprint's start:

1. **Focus on delivering the main functional requirements** — going through the Must-have list
   against what's actually in `dev` today:
   - *Secure authentication* — not started on `dev`. In progress on `feat/user-authentication`.
   - *GDPR-compatible user management* — not started; depends on authentication landing first.
   - *Project and task CRUD operations* — task CRUD exists (`GET/POST/PUT/DELETE /items`), but
     there is no `projects` entity at all yet (no table, no persistence, no routes) — a project
     naturally belongs to a user, so this also depends on authentication. The service/controller
     layering for task creation is in progress on `feat/task-service-layer`, but that branch
     needs a rebase and rework before merging (validation is in the wrong layer, all errors
     currently map to 400 regardless of cause, and it targets the old `todo_items`-style
     interface instead of the current `tasks` table).
   - *A basic Kanban workflow* — not implemented. The `columns` table and `tasks.column_id`/
     `position` already exist in the schema (from the Postgres migration), but no persistence
     function, route, or UI uses them yet.
   - *A complete CI pipeline* — mostly done: `chore/ci-setup` is merged (build + lint + test
     running), with `chore/ci-health-endpoint` open to extend it further.
   - *Docker image publication* — done in Sprint 1 (`Deployment/docker`, mirror push workflow).
   - *At least one demonstrable event-driven workflow* — done: `TaskCreated` is published to
     RabbitMQ on task creation and consumed (see `docs/architecture.md`).

2. **The quality process should now be fully integrated into your development workflow** — lint
   and CI exist and run, but two gaps remain: the test suite (`spec/routes/*.spec.js`) is
   currently broken against the app's real routes and needs fixing before "the quality process"
   can be trusted rather than routinely ignored; and there is no blocking code-quality gate yet
   (a Should-have per §6.2, but implied here by "fully integrated" — a check that exists but can
   be merged past isn't really integrated).

3. **Features should be delivered incrementally through short Pull Requests** — Good
