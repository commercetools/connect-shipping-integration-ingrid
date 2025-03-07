import {
  expect,
  describe,
  beforeEach,
  afterEach,
  test,
  jest,
} from '@jest/globals';
import http from 'http';

// Mock the logger
jest.mock('../src/utils/logger.utils', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the config utils
jest.mock('../src/utils/config.utils');

describe('Server initialization', () => {
  // Store the original process.env
  const originalEnv = process.env;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockListen: any;
  let mockLogger: { info: jest.Mock; error: jest.Mock };
  let server: http.Server;

  beforeEach(() => {
    // Reset the module registry before each test
    jest.resetModules();
    process.env = { ...originalEnv };

    // Mock the HTTP Server listen method
    mockListen = jest
      .spyOn(http.Server.prototype, 'listen')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(function (this: any, ...rest: any[]) {
        // Extract the callback if it exists (it could be the 1st, 2nd, or 3rd argument)
        const args = Array.from(rest);
        const callback = args.find((arg) => typeof arg === 'function');

        if (callback) callback();
        return this;
      });

    // Get the mocked logger
    const loggerModule = jest.requireMock('../src/utils/logger.utils') as {
      logger: { info: jest.Mock; error: jest.Mock };
    };
    mockLogger = loggerModule.logger;
  });

  afterEach(() => {
    // Restore process.env
    process.env = originalEnv;

    // Close the server if it exists
    if (server) {
      server.close();
    }

    // Restore all mocks
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('should start server on the default port 8080', async () => {
    // Import the server (this will execute the code that starts the server)
    const serverModule = await import('../src/index');
    server = serverModule.default;

    // Check if listen was called with the right port
    expect(mockListen).toHaveBeenCalled();
    const listenCall = mockListen.mock.calls[0];
    expect(listenCall[0]).toBe(8080);
  });

  test('should log server start information', async () => {
    // Import the server (this will execute the code that starts the server)
    const serverModule = await import('../src/index');
    server = serverModule.default;

    // Check if the logger was called with the right message
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('⚡️ Event application listening on port 8080')
    );
  });

  test('should export the server instance', async () => {
    // Import the server
    const serverModule = await import('../src/index');
    server = serverModule.default;

    // Verify that the exported server is an instance of http.Server
    expect(server).toBeInstanceOf(http.Server);
  });
});
