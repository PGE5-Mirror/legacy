// Throwaway file to test whether SonarCloud's dedicated secrets engine flags a
// hardcoded API key (as opposed to the password-word-list rule tested separately
// in __sonar_gate_test.ts). Safe to delete — not part of any real feature.
export const awsAccessKeyId = 'AKIAIOSFODNN7EXAMPLE';

export function callExternalApi(): string {
  return `https://api.example.com/v1/data?aws=${awsAccessKeyId}`;
}
