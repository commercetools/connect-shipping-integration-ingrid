/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./test'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  /* // Explicitly exclude post-deploy and pre-undeploy scripts from coverage
  // Its functionality is covered inside the actions.spec.ts file
  coveragePathIgnorePatterns: [
    'src/connector/post-deploy.ts',
    'src/connector/pre-undeploy.ts',
  ], */
};
