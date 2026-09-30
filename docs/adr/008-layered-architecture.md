# ADR 008: Layered Architecture (Routes → Services → Persistence)

- **Status:** Accepted
- **Date:** 30/09/2026
- **Authors:** Arthur

## Context
During Sprint 1, the codebase suffered from a flat architectural structure where route handlers directly communicated with the persistence layer (database/storage). As features grew, this led to tightly coupled code, duplicated business logic across routes, and poor testability. 

Additionally, during the subsequent reorganization of columns, organizations, and projects, this flat structure caused widespread side effects, silently breaking 15 existing tests without immediate, clear feedback due to a lack of clear boundaries and service-level separation.

## Options Considered
- **Option 1:** Maintain the flat route-to-persistence structure and manage logic via helper utilities
  * **Pros:** Zero structural refactoring required upfront, minimal initial overhead.
  * **Cons:** Continued tight coupling, hard-to-test business logic, high risk of side effects and silent regressions during domain refactoring (such as the columns/organizations/projects reorganization).
- **Option 2:** Adopt a strict layered architecture separating routes, services, and persistence
  * **Pros:** Clear separation of concerns, centralized and reusable business logic in services, easier unit testing of business rules independently of HTTP or database layers.
  * **Cons:** Initial boilerplate increase and time required to refactor existing handlers.

## Decision
We chose **Option 2: Adopt a strict layered architecture (routes → services → persistence)**.

This decision was made to establish clear boundaries across the application layers, ensuring that business logic is isolated in services rather than mixed into HTTP controllers or database queries.

## Consequences
- **Positive:** 
  * Better maintainability, modularity, and testability of business logic.
  * Clearer code ownership and separation between request handling, domain rules, and data access.
- **Negative / Risks:** 
  * Initial refactoring cost and increased boilerplate for new endpoints.
  * Refactoring domain models (such as the columns/organizations/projects reorg) across a clean architecture requires comprehensive integration coverage to prevent silent failures, as structural changes can still impact multiple layers if service boundaries aren't properly mocked or tested.