import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)"
  ],
  // Handle module aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // Ignore test files in the node_modules and .next directories
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};

export default createJestConfig(customJestConfig);
