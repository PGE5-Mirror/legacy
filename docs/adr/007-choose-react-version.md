# ADR 007: React Version Selection (16 vs. 18 vs. 19)

- **Status:** Accepted
- **Date:** 30/09/2026
- **Authors:** Arthur

## Context
During the TypeScript migration (ADR 006), the question of upgrading the React runtime version arose. The codebase was currently running on React 16.14. We needed to determine whether to upgrade to React 18 or React 19 alongside our toolchain modernization, or temporarily keep the existing version. 

Key constraints and dependencies included:
* **Risk management:** Combining a major language/tooling migration (Plain JS to TypeScript with a modern bundler) with a behavior-changing framework version bump significantly increases the risk of hard-to-trace regressions.
* **Component library limitations:** The project relied on `react-bootstrap@1.6.8`, which only officially supports React 18 from version 2.x onward. 
* **React 19 ecosystem state:** While React 19 was available at decision time, `react-bootstrap` v2.x only supported it via a piecemeal patch series (ref/type fixes released through late 2024 to early 2025). The version designed cleanly for React 18+/19 (`v3.0.0`) was still in beta and introduced its own breaking changes.

## Options Considered
- **Option 1:** Upgrade to React 18 or 19 concurrently with the TypeScript migration
  * **Pros:** Immediate access to modern React features, concurrent rendering benefits, and ecosystem alignment.
  * **Cons:** High risk due to compounded migration variables (tooling + runtime behavior changes); severe dependency friction with `react-bootstrap@1.6.8` forcing premature library upgrades or unstable patch series.
- **Option 2:** Keep React 16.14 during the TypeScript migration, deferring runtime version upgrades
  * **Pros:** Isolates migration risk by limiting scope strictly to language/tooling changes; maintains full compatibility with existing UI components without forced breaking updates.
  * **Cons:** Defays the adoption of newer React capabilities and leaves technical debt regarding the outdated framework version.

## Decision
We chose **Option 2: Keep React 16.14 during the TypeScript migration**.

This decision is justified by the need to decouple tooling changes from runtime framework modifications. By keeping React 16.14 stable during the TS migration, we prevent compounding risks and avoid being forced into unstable dependency upgrades for `react-bootstrap`.

## Consequences
- **Positive:** 
  * Minimized risk and simpler debugging during the TypeScript migration by changing only one major variable at a time.
  * Maintained stable UI components without requiring immediate, risky updates to `react-bootstrap`.
- **Negative / Risks:** 
  * Technical debt is retained regarding the outdated React version, requiring a planned follow-up effort to tackle React 18/19 and component library upgrades later.