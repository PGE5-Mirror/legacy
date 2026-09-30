# ADR 004: Frontend testing approach

* **Status:** Accepted
* **Date:** 30/09/2026
* **Authors:** Elisenda

## Context
The backend has unit tests with Jest and ts-jest (#81), but the frontend (React 16 + TypeScript, bundled with esbuild) has none. Our Definition of Done asks for tests on the logic a PR introduces, so the frontend needs a way to test components: render them, click, type in forms, and check what appears on screen. The tests must run in the same pipeline as the backend tests.

## Options Considered
* **Option 1: React Testing Library + Jest (jsdom environment)**
  * **Pros:** Reuses the Jest + ts-jest setup already in the repo, so there is one runner, one `npm test` and one coverage report. React Testing Library tests components the way a user uses them (visible text, roles, clicks) rather than their internal state. Widely used and well documented.
  * **Cons:** jsdom is not a real browser (no layout or CSS). Needs the extra `jest-environment-jsdom` package. Our React 16 requires React Testing Library v12, since newer versions need React 18.
* **Option 2: Vitest + React Testing Library**
  * **Pros:** Fast, modern, with a Jest-compatible API.
  * **Cons:** Adds a second test runner next to the backend's Jest (two configurations to maintain). Vitest is built around Vite, which we don't use (we bundle with esbuild), so its main advantage is lost. Duplicates tooling the team just set up in #81.
* **Option 3: End-to-end tests with Cypress or Playwright**
  * **Pros:** Tests the real app in a real browser, including the backend and database.
  * **Cons:** Needs the whole stack running (Postgres, RabbitMQ, server), which is slower and heavier in CI. Better suited to a few critical user journeys than to testing component logic. Much larger setup.

## Decision
Use React Testing Library + Jest, as a second Jest "project" (`testEnvironment: 'jsdom'`) next to the existing backend project (`testEnvironment: 'node'`). Frontend specs live in `spec/client/`. Component tests mock the shared `apiRequest` helper (`src/client/api.ts`), so they don't need a running server. Versions: `@testing-library/react` 12 (last version supporting React 16), `@testing-library/jest-dom`, and `jest-environment-jsdom` 30 (matching Jest 30).

## Consequences
* **Positive:** One command (`npm test`) runs backend and frontend tests, with one coverage report. No new test runner to learn. Tests describe user behaviour (what is on screen, what happens on click).
* **Negative / Risks:** jsdom doesn't render CSS or layout, so visual problems (for example high-contrast colours) are not caught. React Testing Library stays on v12 until React is upgraded to 18, and both must be upgraded together. There is no end-to-end coverage; Playwright could be added later for a few critical journeys (future work).
