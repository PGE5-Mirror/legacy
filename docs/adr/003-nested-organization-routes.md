# ADR 003: API structure for organization-owned resources (nested vs. flat)

* **Status:** Accepted
* **Date:** 25/09/2026
* **Authors:** Elisenda

## Context
Organisation management introduces a new ownership hierarchy: an organisation owns members and projects. Two other parent-child relationships already exist in the API with different shapes: `organizations/:id/members` is nested under its parent, while `columns` (child of `projects`) requires a `project_id` field in the request body instead of being nested under `/projects/:id/columns`. Adding organisation-owned projects raised the question of which pattern to follow, and whether to unify the whole API around one style.

## Options Considered
* **Option 1: Flat resources with a parent id in the body** (e.g. `POST /projects` with `organization_id` in the body)
  * **Pros:** Consistent with how `columns` already works; no new route files or param handling needed; matches what was already implemented for the kanban backend (#52).
  * **Cons:** Doesn't express the ownership relationship in the URL; a project can exist without a clear route showing which organisation it belongs to; inconsistent with how `organizations/:id/members` is already modeled.
* **Option 2: Nest child resources under their parent** (e.g. `POST /organizations/:id/projects`)
  * **Pros:** More conventional REST modeling for a strict ownership relationship (a project cannot exist without an organisation); matches the existing `organizations/:id/members` pattern; makes the relationship self-evident from the URL alone.
  * **Cons:** Introduces a second style alongside the existing flat `columns` pattern, since retrofitting `columns` to also be nested under `projects` was judged out of scope for this sprint; requires new route files instead of reusing the existing body-field approach.

## Decision
Nest organisation-owned resources (`organizations/:id/projects`), matching the existing pattern used for `organizations/:id/members`. Implemented: `POST`/`GET` for projects are now nested under their organisation; `PUT`/`DELETE /projects/:id` remain unnested since a project's own id is already globally unique. Existing flat resources (`columns` requiring `project_id` in the body) are left unchanged for now rather than reworked, to avoid retrofitting already-tested, merged code purely for stylistic consistency mid-sprint.

Decided unilaterally due to the team not responding in time; flagged to the team for objection, none raised.

## Consequences
* **Positive:** New organisation-owned resources have a self-documenting, conventional REST shape, consistent with `organizations/:id/members`; the decision to prioritise correctness for new work over rewriting old work is explicit and intentional rather than accidental.
* **Negative / Risks:** The API is not fully consistent — some parent-child relationships are nested, others use a body field. This should be revisited as a follow-up cleanup once core features are stable, ideally before final review.
