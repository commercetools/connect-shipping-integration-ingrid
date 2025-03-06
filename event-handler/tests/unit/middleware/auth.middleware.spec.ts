import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { authMiddlewareOptions } from '../../../src/middleware/auth.middleware';
import { readConfiguration } from '../../../src/utils/config.utils';

// Mock the readConfiguration function
jest.mock('../../../src/utils/config.utils');

describe('Auth Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should configure auth middleware with scope when provided', () => {
    // Mock readConfiguration to return a scope
    jest.mocked(readConfiguration).mockReturnValue({
      region: 'eu-west-1',
      projectKey: 'test-project',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      scope: 'test-scope',
      ingridApiKey: 'test-api-key',
      ingridEnvironment: 'STAGING',
    });

    // Access the authMiddlewareOptions to trigger the code
    const options = authMiddlewareOptions;

    // Verify the configuration
    expect(options.host).toBe('https://auth.eu-west-1.commercetools.com');
    expect(options.projectKey).toBe('test-project');
    expect(options.credentials.clientId).toBe('test-client-id');
    expect(options.credentials.clientSecret).toBe('test-client-secret');
    expect(options.scopes).toEqual(['test-scope']);
  });

  it('should configure auth middleware with default scope when not provided', () => {
    // Mock readConfiguration to return no scope
    jest.mocked(readConfiguration).mockReturnValue({
      region: 'eu-west-1',
      projectKey: 'test-project',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      scope: undefined,
      ingridApiKey: 'test-api-key',
      ingridEnvironment: 'STAGING',
    });

    // Access the authMiddlewareOptions to trigger the code
    const options = authMiddlewareOptions;

    // Verify the configuration
    expect(options.host).toBe('https://auth.eu-west-1.commercetools.com');
    expect(options.projectKey).toBe('test-project');
    expect(options.credentials.clientId).toBe('test-client-id');
    expect(options.credentials.clientSecret).toBe('test-client-secret');
    expect(options.scopes).toEqual(['default']);
  });
});
