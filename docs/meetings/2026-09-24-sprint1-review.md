# Sprint 1 Review

> Note: reconstructed after the ceremony (written up 2026-09-24), not a live transcript.

## Attendees
- [Andrej, Arthur, Elisenda, Franceska, Clement]

## Sprint goal (recap)
See `docs/meetings/2026-09-09-sprint1-objectives.md` — foundation & architecture: understand
the existing app, establish conventions, define/implement the target architecture, get an
end-to-end flow working, lay the event-driven foundation, and establish CI/quality processes.

## Delivered & demoed

(items in "Done" as of 2026-09-24):

- **Architecture & backend**
  - #16 Initialization of architecture and boilerplate (franceskarrokaj)
  - #21 TypeScript for the backend (Andr0y, camille-erades)
  - #29 Database schema & migration for tasks — Postgres + `node-pg-migrate` (Clemmonoire)
  - #30 Persistence layer for tasks (Andr0y)
- **Event-driven foundation**
  - #22 RabbitMQ setup (elisendatcabases)
  - #53 Fix RabbitMQ connection crash on unhandled error event (elisendatcabases)
- **CI / quality tooling**
  - #4 Pipeline CI & Docker (camille-erades, Clemmonoire)
  - #13 Docker (camille-erades)
  - #14 Linter — ESLint (elisendatcabases)
  - #15 Code Formatter — Prettier (elisendatcabases)
  - #18 Static code analysis — SonarQube (Clemmonoire)
  - #23 Tests with Jest (Kayuranium)
- **Process**
  - #17 ADR-001: Docker Registry (Kayuranium)
  - #5 Prepare Sprint 1 Review presentation (elisendatcabases)

## PO decisions (accept/reject per story)
Accepted: #16, #21, #29, #30, #22, #53, #4, #13, #14, #15, #18, #17,
Accepted with follow-up work: #23

## Feedback / discussion
- [fill in]

## Known gaps at end of Sprint 1
- Test suite was broken against the app's real routes for most of the sprint (tracked as #40,
  status "Ready" — not yet fixed).
- No blocking code-quality gate yet.
- `docs/adr`, `docs/dev-conventions`, and the fuller meeting-notes history lived on separate
  branches that hadn't been merged into `dev` until late in the sprint (#19).

## Carries into Sprint 2
See `docs/meetings/2026-09-24-sprint2-objectives.md` — authentication (#1, in review),
RGPD (#3), Kanban workflow (#50/#51/#52), notifications (#7), and closing the test-suite (#40)
and quality-gate gaps.
