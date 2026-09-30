# ADR 001: Docker Registry

* **Status:** Proposed
* **Date:** 10/09/2026
* **Authors:** Arthur

## Context
The Legacy project does not have any containerization yet. To make deployment easier, and have consistency across environments, we must choose a Docker Registry.

## Options Considered
* **Option 1:** Use Docker Hub
  * **Pros:** Industry standard, wildly used and easy to use.
  * **Cons:** Rate limits (100 to 200 pulls per 6 hours).
* **Option 2:** Use Github Container Registry
  * **Pros:** Bindings with Github, automatic authentification with Github Actions.
  * **Cons:** Closely linked to Github, might cause issues if we migrate to another Git host. 
* **Option 3:** Use Local Hub
  * **Pros:** Total control, no dependencies.
  * **Cons:** Disproportionate operational burden (maintenance, security, storage)

## Decision
Docker Hub would be the smartest choice for the project. The Docker containers would be used mainly for hosting an local instance of the app for development so no needs for Github binding features, and if we want to duplicate the environment in Github actions, it would be difficult to setup a local hub. Docker Hub can do both easily.

## Consequences
* **Positive:** Easy to setup, easy to use and reliable.
* **Negative / Risks:** Can be limited depending on the number of Github Actions, but for a project that size it shouldn't be an issue.