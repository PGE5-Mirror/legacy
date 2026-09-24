# ADR [NUMBER]: [TITLE]

* **Status:** Proposed
* **Date:** 18/09/2026
* **Authors:** Clément

## Context
2 database is set up for the same table with really basic implementation and for an incomplete project

## Options Considered
* **Option 1:** MySQL
    * **Pros:** it's simple and reactive, a standard in the industry for low complexity database
    * **Cons:** Less performant and less flexible for complex relational queries
* **Option 2:** PostgreSQL
    * **Pros:** Extremely robust management of transactions and concurrent writes.
    * **Cons:** More complex and more memory-intensive

## Decision
MySQL could be a good alternative for a simple application but PostgreSQL, offer better perspective to move towards a kanban application with complex data relation, and a multy users applicatoin

## Consequences
* **Positive:** Robust and adaptative database for future evolution.
* **Negative / Risks:** Complex to set up 