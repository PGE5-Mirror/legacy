# ADR 006: Adopting TypeScript (backend and frontend)

- **Status:** Accepted
- **Date:** 30/09/2026
- **Authors:** Arthur

## Context
Our initial stack relied on plain JavaScript for the backend and a lightweight frontend setup (vendored UMD React build combined with Babel Standalone running directly in the browser). 

As the project scaled, this architecture presented significant limitations:
* **Frontend fragility:** The lack of a proper build step and reliance on Babel Standalone impacted runtime performance and allowed syntax or type errors to slip through until execution.
* **Backend maintenance:** Plain JavaScript on the backend lacked robustness during large-scale refactoring, leading to preventable regressions.
* **Lack of standardization:** The ecosystem lacked a unified modern tooling pipeline to guarantee code quality prior to production deployment.

## Options Considered
- **Option 1:** Stick with plain JavaScript using linters (ESLint) and JSDoc annotations
  * **Pros:** Zero initial migration cost, immediate familiarity with existing code.
  * **Cons:** Type checking remains optional and brittle, no real improvement to frontend performance, lack of robust native support for structuring large-scale codebases.
- **Option 2:** Migrate the entire stack to TypeScript (backend and frontend) with a modern bundler
  * **Pros:** Robust compile-time type safety, vastly improved autocompletion and Developer Experience (DX), elimination of Babel Standalone in favor of a clean, optimized build output.
  * **Cons:** Substantial migration effort, team onboarding overhead, and potential parallel-work merge conflicts during the transition.

## Decision
We have chosen **Option 2: Adopting TypeScript for both backend and frontend**.

This decision is justified by the critical need to secure our codebase for the long term. Introducing a static type system eliminates an entire class of bugs early in the development cycle and professionalizes our frontend build chain by replacing the fragile UMD/Babel Standalone approach with modern, optimized compilation.

## Consequences
- **Positive:** 
  * Enhanced code safety via static typing (catching bugs during development rather than at runtime).
  * Improved developer experience (superior IDE support, safe and confident refactoring).
  * Modernized and optimized frontend pipeline (removing the performance overhead of running Babel Standalone in the browser).
- **Negative / Risks:** 
  * Initial migration effort and time required to type-check and refactor existing code.
  * Risk of temporary merge conflicts during parallel development on modules undergoing conversion.