// Throwaway file to test whether SonarCloud's quality gate actually blocks a merge.
// Safe to delete — not part of any real feature.
// Deliberate hardcoded credential: SonarCloud reliably flags this as a security hotspot,
// but plain ESLint (with this project's current config) does not — isolates this test
// from the lint-specific one in test/lint-gate-check.
export const dbPassword = 'SuperSecretPassword123!';

export function connect(): string {
  return `postgres://admin:${dbPassword}@localhost:5432/db`;
}
