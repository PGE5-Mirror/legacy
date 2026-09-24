# Sprint 1 Objectives — Foundation & Architecture

Quoted directly from the project brief ("LEGACY - TodoList Rework Project-2.pdf", section 8.1):

> The objective is to:
> - understand the existing application;
> - turn the requirements into a usable backlog;
> - establish your development conventions;
> - define and implement your target architecture;
> - establish a working end-to-end application flow;
> - introduce the foundations of your event-driven architecture;
> - establish the CI and quality processes.
>
> By the end of Sprint 1, the team should already be able to demonstrate a coherent technical foundation.

## What each objective concretely means for this codebase

Mapped against the audit findings (audit-report.md):

1. **Understand the existing application** — done: see audit-report.md. Key finding: this is a bare Docker
   tutorial sample, not real legacy debt — almost nothing in the brief's Must-have list exists yet.
2. **Turn the requirements into a usable backlog** — take the brief's Must/Should/Could-have lists and the audit
   gaps and produce prioritised, estimable user stories (not just a copy of the MoSCoW list). Not done yet.
3. **Establish development conventions** — branching model, PR conventions, commit style, code review
   expectations.
4. **Define and implement your target architecture** — the brief explicitly says "define AND implement" — this
   is not just a diagram, it means the new architecture needs to actually exist in code by end of Sprint 1
   (data model: users/projects/boards/tasks; layering beyond the current thin route-handlers-to-persistence
   shape). The one pattern worth keeping: the swappable sqlite/mysql persistence module.
5. **Establish a working end-to-end application flow** — at least one full slice (UI → API → persistence)
   working end-to-end on the *new* architecture, even if minimal — not full feature coverage.
6. **Introduce the foundations of your event-driven architecture** — per section 4 of the brief, this should be
   operational early, not postponed to the final sprint. Sprint 1 = lay the foundation (choose a mechanism,
   get one event flowing), not necessarily the full demonstrable workflow required by Must-have.
7. **Establish CI and quality processes** — audit found zero CI, no lint/format config, no working test command
   (Jest referenced in specs but not installed, no `test` script). This needs to exist and run on PRs.

