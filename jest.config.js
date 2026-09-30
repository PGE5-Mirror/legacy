/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: { allowJs: true } }],
  },
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
  collectCoverage: true,
  collectCoverageFrom: ['src/server/**/*.ts', '!src/server/**/*.d.ts'],
  coverageDirectory: 'coverage',
};
