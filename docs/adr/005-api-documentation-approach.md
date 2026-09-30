# ADR 005: REST API Documentation Approach

- **Status:** Proposed
- **Date:** 30/09/2026
- **Authors:** Arthur

## Context
The REST API now has ~30 routes across auth, items, columns, projects, organizations, organization members, user settings, and notifications, with no documentation of endpoints, request/response shapes, or auth requirements anywhere in the repo. Anyone integrating against the API (frontend devs, reviewers, future maintainers) currently has to read route handler source to know what's available. This is a real gap, not just something sitting unmerged elsewhere. We need to formalize and document these routes by choosing a sustainable approach suited to our context (currently, existing project documentation relies on Markdown files in a `docs/` folder, but keeping this technology is not mandatory).

## Options Considered

### Option 1: Fully manual documentation via Markdown files (`docs/api/`)
- **Pros:** 
  - Consistent with the project's current documentation structure.
  - No technical dependencies or external libraries to integrate and maintain.
  - Full control over textual formatting.
- **Cons:** 
  - High risk of desynchronization between the source code and documentation over time.
  - No automated validation of request/response schemas against the code.
  - Significant manual writing and review effort for each new route.

### Option 2: OpenAPI / Swagger with generated documentation (via code annotations or specification file)
- **Pros:** 
  - Industry standard, offering an interactive interface to test endpoints.
  - Facilitates potential generation of clients or test stubs.
  - Ability to tightly couple documentation to the code (especially with type- or annotation-based generators).
- **Cons:** 
  - Adds complexity and tooling dependencies to the project.
  - Learning curve for the team if the OpenAPI ecosystem is not already in place.

## Decision
We choose **Option 2 (OpenAPI / Swagger with generation or interactive interface)** to document the REST API. With ~30 routes and continuous expansion, a purely text-based Markdown approach (Option 1) would quickly become obsolete and hard to maintain. OpenAPI provides a robust standard, excellent interactivity for frontend developers (via Swagger UI or ReDoc), and sets a strong foundation for automated API compliance checking in the future. To stay aligned with project conventions, the generated documentation will be accessible and linked directly from the `README.md`.

## Consequences
- **Positive:** 
  - Clear, interactive, and standardized documentation for all API consumers (frontend, integrators).
  - Better traceability of interface contracts (methods, paths, status codes, request/response bodies).
  - Facilitates enforcing the rule that any route modification must include a documentation update.
- **Negative / Risks:** 
  - Requires adding and configuring an OpenAPI generation library or tool adapted to our tech stack.
  - Slight initial overhead to annotate or describe all ~30 existing routes.