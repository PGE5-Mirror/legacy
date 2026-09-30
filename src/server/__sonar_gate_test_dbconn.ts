// Throwaway file to test whether SonarCloud's secrets engine flags a hardcoded
// PostgreSQL connection string (rule secrets:S6698). Safe to delete — not part
// of any real feature.
export const connectionString = 'postgresql://admin:Tr0ub4dor%263xQ9@db.internal.example.com:5432/production';

export function getConnectionString(): string {
  return connectionString;
}
