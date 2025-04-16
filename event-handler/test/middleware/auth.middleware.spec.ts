import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { authMiddlewareOptions } from '../../src/middleware/auth.middleware';

// Mock the readConfiguration function
jest.mock('../../src/utils/config.utils');

describe('Auth Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should configure auth middleware', () => {
    // Access the authMiddlewareOptions to trigger the code
    const options = authMiddlewareOptions;

    // Verify the configuration
    expect(options.host).toBe('mockedAuthUrl');
    expect(options.projectKey).toBe('mockedProjectKey');
    expect(options.credentials.clientId).toBe('mockedClientId');
    expect(options.credentials.clientSecret).toBe('mockedClientSecret');
  });
});
