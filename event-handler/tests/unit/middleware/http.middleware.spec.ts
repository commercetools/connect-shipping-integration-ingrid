import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { httpMiddlewareOptions } from '../../../src/middleware/http.middleware';
import { readConfiguration } from '../../../src/utils/config.utils';

// Mock the readConfiguration function
jest.mock('../../../src/utils/config.utils');

describe('HTTP Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure HTTP middleware with the correct host', () => {
    // Mock readConfiguration
    jest.mocked(readConfiguration).mockReturnValue({
      region: 'eu-dummy-west-1',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      projectKey: 'test-project-key',
      scope: 'test-scope',
      ingridApiKey: 'test-ingrid-api-key',
      ingridEnvironment: 'STAGING',
    });

    // Access the httpMiddlewareOptions to trigger the code
    const options = httpMiddlewareOptions;

    // Verify the configuration
    expect(options.host).toBe('https://api.eu-dummy-west-1.commercetools.com');
  });
});
