/** @type {import('ts-jest').JestConfigWithTsJest} */

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/jest.setup.ts'],
  roots: ['./test'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
};
