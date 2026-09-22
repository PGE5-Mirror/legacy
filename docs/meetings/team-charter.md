# Team Charter — TodoList → Kanban Rework

## Team
6 members: 1 Product Owner, 1 Scrum Master (rotating), 4 Developers.
PO: Clement
SM: Andrej
Devs: Elisenda, Franceska, Camille, Arthur

## Shared goal
Transform the existing TodoList app into a clean, maintainable Kanban application, following Scrum and the
project brief's Definition of Done, prioritizing quality over feature count.

## Roles & responsibilities
- **Product Owner:** owns and prioritizes the backlog, writes/confirms user stories + acceptance criteria,
  accepts/rejects work at Sprint Review.
- **Scrum Master (rotating):** facilitates ceremonies, removes blockers, protects the sprint from scope creep,
  keeps meeting notes.
- **Developers:** break stories into technical tasks, estimate their own work, implement + test, review each
  other's PRs, uphold the Definition of Done.

## Ceremonies
- **Daily standup** — 15 min, fixed time: what I did / doing / blockers.
- **Sprint Planning** — start of each sprint: goal, backlog, story selection, task breakdown.
- **Sprint Review** — end of sprint: demo against Definition of Done.
- **Retrospective** — end of sprint: what went well / didn't / what changes, with an owned action item.

## Working agreements
- One story = one small PR. No large batched PRs.
- Branch naming: `type/short-description` (e.g. `feat/task-create`).
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
- 1 approval required before merge; CI (lint + test) must pass.
- Blockers get raised at standup, not sat on silently.
- Scope changes go through the PO.
- Decisions with real tradeoffs get written up as an ADR.

## Definition of Done (per the brief)
A story isn't Done until it: has an approved PR, has unit tests, meets the coverage requirement, passes the
code-quality gate, passes CI, produces the required build artifact/Docker image, has docs updated, and is
demoed at Sprint Review.

## Communication
Team chat for day-to-day; standups and ceremonies for anything needing real discussion.
but blockers should be flagged the same day, not left for the next standup.
