import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { httpMiddlewareOptions } from '../../src/middleware/http.middleware';

// Mock the readConfiguration function
jest.mock('../../src/utils/config.utils');

describe('HTTP Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure HTTP middleware with the correct host', () => {
    // Access the httpMiddlewareOptions to trigger the code
    const options = httpMiddlewareOptions;

    // Verify the configuration
    expect(options.host).toBe('mockedApiUrl');
  });
});
