# Sprint 2 Review

## Sprint goal (recap)
See `docs/meetings/2026-09-24-sprint2-objectives.md` — core features: deliver the main
functional requirements, with quality fully integrated into the workflow, via short incremental PRs.

## Delivered & demoed

(merged between 2026-09-24 and 2026-09-30):

- **Authentication & security**
  - #1 Secured authentication (Kayuranium, PR #45)
  - #73 Stale JWT tokens produce 500s instead of 401s (Andr0y, PR #76)
  - #77 Centralize authenticated fetch handling across the frontend (elisendatcabases, PR #80)
- **GDPR / user management**
  - #3 RGPD management (Clemmonoire, PR #67)
  - #60 User settings / accessibility settings — backend (elisendatcabases, PR #65) and UI (PR #74)
  - #83 High contrast / WCAG compliance (elisendatcabases, PR #85)
- **Kanban workflow**
  - #52 Kanban backend — projects & columns (elisendatcabases, PR #57)
  - #50 / #51 / #61 Kanban workflow, frontend, and cards (franceskarrokaj, PR #66)
  - #62 / #63 Organization creation, invites, and member management (franceskarrokaj, PR #82)
- **Frontend**
  - #20 TypeScript for the frontend (franceskarrokaj, PR #56)
- **Event-driven / notifications**
  - #6 / #7 Event workflow & backend notifications on task creation (Andr0y, PR #68)
  - #69 Notifications — frontend (elisendatcabases, PR #93)
- **Testing & CI quality**
  - #40 Fix test suite broken by Postgres migration (Kayuranium, PR #81)
  - #79 Add lint and test steps to CI (Andr0y, PR #94)
  - chore/tests — full backend route/service test coverage after the route reorg (Kayuranium, PR #95)
  - #10 Blocking code-quality gate — SonarCloud is now a required check, same as build/lint/test
- **Process**
  - #33 ADRs consolidated (Kayuranium)

## PO decisions (accept/reject per story)
Every frontend related user stories do not have any unit test: rejected
