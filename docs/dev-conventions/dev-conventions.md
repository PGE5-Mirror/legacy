# Dev Conventions

## Branches
`type/short-description` — e.g. `feat/task-create`, `fix/task-validation`, `chore/ci-setup`.

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
