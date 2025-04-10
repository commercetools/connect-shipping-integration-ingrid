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
jest.mock('../src/utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    projectKey: 'test-project-key',
    region: 'test-region',
    ingridApiKey: 'test-ingrid-api-key',
    ingridEnvironment: 'STAGING',
  }),
}));

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
      .mockImplementation(function (this: http.Server, ...args: unknown[]) {
        // Extract the callback if it exists (it could be the 1st, 2nd, or 3rd argument)
        const callback = args.find(
          (arg): arg is () => void => typeof arg === 'function'
        );

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

    // Close the server if it exists and has a close method
    if (server && typeof server.close === 'function') {
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
    // previous check: expect(server).toBeInstanceOf(http.Server);
    // https://stackoverflow.com/questions/58029714/jests-expectvalue-tobeinstanceofclass-fails-for-expectutil-promisify
    expect(server.constructor.name).toBe('Server');
  });
});
