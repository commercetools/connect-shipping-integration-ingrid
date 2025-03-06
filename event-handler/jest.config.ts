/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  displayName: 'Tests Typescript Application - Event',
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/tests/**/*.spec.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
