# ADR 010: JWT + bcrypt for Authentication

- **Status:** Accepted
- **Date:** 30/09/2026
- **Authors:** Arthur

## Context
A robust and secure authentication mechanism was required to handle user sessions and secure API endpoints. While authentication design is largely uncontested in modern web applications, we needed to formalize the standard choice of combining JSON Web Tokens (JWT) for stateless session handling and bcrypt for secure password hashing.

## Options Considered
- **Option 1: Server-side sessions with traditional cookies**
  * **Pros:** Easy session invalidation and revocation, full server-side control over active sessions.
  * **Cons:** Requires sticky sessions or a shared session store (like Redis) across multiple backend instances, increasing infrastructure complexity for distributed or stateless API architectures.
- **Option 2: JWT (JSON Web Tokens) + bcrypt**
  * **Pros:** Completely stateless, decentralized authentication (tokens contain verified claims, minimizing database lookups per request); bcrypt provides a cryptographically strong, computationally heavy hashing algorithm resistant to brute-force and rainbow table attacks.
  * **Cons:** Token revocation is harder before expiration without maintaining a token blacklist/revocation store.

## Decision
We chose **Option 2: JWT for token-based authentication paired with bcrypt for password hashing**.

Even though this approach is standard practice, it was formally adopted because it aligns perfectly with our stateless backend architecture, allowing seamless scalability across multiple service instances while ensuring user credentials remain securely protected via industry-standard salted hashing.

## Consequences
- **Positive:** 
  * Scalable, stateless authentication reducing database overhead on protected API routes.
  * Strong defense against credential cracking through bcrypt's adaptive cost factor.
- **Negative / Risks:** 
  * Added complexity around token lifecycle management (e.g., implementing refresh token rotations and handling logout/revocation).