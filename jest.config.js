const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node'];

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/server/**/*.ts',
    '!src/server/**/*.d.ts',
    'src/client/**/*.{ts,tsx}',
    '!src/client/app.tsx',
  ],
  coverageDirectory: 'coverage',
  projects: [
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      moduleFileExtensions,
      testMatch: ['<rootDir>/spec/**/*.spec.{ts,js}'],
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/spec/client/'],
      transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: { allowJs: true } }],
      },
      transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
    },
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      moduleFileExtensions,
      testMatch: ['<rootDir>/spec/client/**/*.spec.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/spec/client/setupTests.ts'],
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            tsconfig: {
              jsx: 'react',
              esModuleInterop: true,
              types: ['jest', '@testing-library/jest-dom'],
            },
          },
        ],
      },
    },
  ],
};
