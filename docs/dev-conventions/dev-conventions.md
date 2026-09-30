# Dev Conventions

## Branches
`type/ticket-number-short-description` — include the ticket number so a branch can always be
traced back to its issue. E.g. `feat/60-user-settings-backend`, `fix/73-stale-token-401`,
`chore/29-database-migration`.

## Commits
Conventional Commits: `type: short summary` — e.g. `feat: add POST /tasks endpoint`.
Types: feat, fix, chore, docs, test, refactor.

## Pull Requests
- One story = one small PR, not a big batch.
- PR description: what/why, link to the story.
- At least 1 approval required before merge (per DoD).
- CI (lint + test) must pass before merge.
- Squash merge to keep main history clean.

## Code style
Enforced by ESLint/Prettier + CI
