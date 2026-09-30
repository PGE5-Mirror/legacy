What went well:
- Sprint 2 delivered the full Should-have list plus more
- Most bugs were fixed quickly (like stale jwt tokens bug)

What didn't go well — evidence:

- The route reorg was merged into dev without updating its own tests 15 spec files were broken and had to be fixed in #95.
- Tests and blocking CI took a long time to be implemented (towards the end of sprint 2)
- Frontend ended sprint 2 with zero automated test coverage.
- The code-quality gate (#10) wasn't actually enforcing anything for most/all of the sprint, even though CI showed a SonarCloud check. It is now fixed.

What to improve 
