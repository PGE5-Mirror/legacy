# ADR 004: Platform for docker image

* **Status:** Proposed
* **Date:** 30/09/2026
* **Authors:** Clément

## Context
As part of our CI/CD pipeline modernization, we need to automate the building and publishing of our application's Docker images upon pushing code to our Git repository. We require a container registry to securely host, version, and distribute our container artifacts to target runtime environments or evaluators.

## Options Considered
* **Option 1:** GitHub Container Registry (GHCR - ghcr.io)
    * **Pros:** Native authentication within GitHub Actions using the built-in ${{ secrets.GITHUB_TOKEN }} (no external credentials to manage).
    * **Cons:** Requires GitHub Organization write permissions alignment when used within restricted GitHub Orgs.
* **Option 2:** Docker Hub (hub.docker.com)
    * **Pros:** Industry standard, supported out-of-the-box by all container tools without specifying a registry domain prefix.
    * **Cons:** Requires creating external accounts and storing Docker credentials (DOCKER_USERNAME, DOCKER_PASSWORD / Access Tokens) in GitHub Repository Secrets. Imposes strict pull rate limits (100 pulls per 6 hours for unauthenticated, 200 for free accounts).
* **Option 3:** AWS Elastic Container Registry (AWS ECR)
  * **Pros:** Enterprise-grade security, fine-grained IAM policy access, and automatic image vulnerability scanning. Ideal integration if the infrastructure is already deployed on AWS (EKS, ECS, App Runner).
  * **Cons:** Requires an active AWS account, IAM user/role provisioning, and configuring AWS credentials in GitHub Secrets. High setup complexity.

## Decision
GHCR provides seamless, native integration with GitHub Actions without requiring external credentials or third-party service accounts. To overcome permission restrictions on the primary organization repository, a mirror repository was created under a dedicated GitHub Organization managed by the team. This setup grants us full control over workflow permissions and allows the CI/CD pipeline to publish images securely using the built-in ${{ secrets.GITHUB_TOKEN }} at zero cost.

## Consequences
* **Positive:** built in docker action to push the image, and existence of an already configured github organisation so, there is no additional configuration required.
* **Negative / Risks:** The CI/CD publication process is tightly coupled with GitHub's infrastructure and package management system.