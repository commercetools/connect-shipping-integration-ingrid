import { beforeEach, describe, test, jest, expect } from '@jest/globals';
import { appLogger } from '../../../../src/libs/logger';
import { SessionHeaderAuthenticationManager } from '../../../../src/libs/auth/authentications/session-header-auth-manager';
import { SessionHeaderAuthenticationHook } from '../../../../src/libs/auth/hooks/session-header-auth.hook';
import { Authentication } from '../../../../src/libs/auth/types';

describe('SessionHeaderAuthenticationHook', () => {
  let mockAuthManager: jest.Mocked<SessionHeaderAuthenticationManager>;
  let mockContextProvider: { updateContextData: jest.Mock };
  let mockAuthentication: Authentication;
  let hook: SessionHeaderAuthenticationHook;

  beforeEach(() => {
    // @ts-expect-error: mockAuthentication is not a valid parameter
    mockAuthentication = {
      getPrincipal: jest.fn().mockReturnValue({ correlationId: 'test-correlation-id' }),
    };

    mockAuthManager = {
      // @ts-expect-error: mockAuthentication is not a valid parameter
      authenticate: jest.fn().mockResolvedValue(mockAuthentication),
    };

    mockContextProvider = {
      updateContextData: jest.fn(),
    };

    hook = new SessionHeaderAuthenticationHook({
      authenticationManager: mockAuthManager,
      // @ts-expect-error: mockContextProvider is not a valid parameter
      contextProvider: mockContextProvider,
      logger: appLogger,
    });
  });

  test('should authenticate and update context with correlation ID', async () => {
    const request = {
      headers: {
        'x-session-id': 'test-session-id',
      },
    };

    const authenticateFn = hook.authenticate();
    await authenticateFn(request);

    // Verify HeaderBasedAuthentication was created with correct session ID
    expect(mockAuthManager.authenticate).toHaveBeenCalledWith(
      expect.objectContaining({
        authHeader: 'test-session-id',
      }),
    );

    // Verify context was updated with authentication and correlation ID
    expect(mockContextProvider.updateContextData).toHaveBeenCalledWith({
      authentication: mockAuthentication,
      correlationId: 'test-correlation-id',
    });
  });

  test('should not include correlationId in context if not present', async () => {
    // Override the mock to return a principal without correlationId
    // @ts-expect-error: mockAuthentication is not a valid parameter
    mockAuthentication.getPrincipal.mockReturnValue({});

    const request = {
      headers: {
        'x-session-id': 'test-session-id',
      },
    };

    const authenticateFn = hook.authenticate();
    await authenticateFn(request);

    // Verify context was updated with authentication only
    expect(mockContextProvider.updateContextData).toHaveBeenCalledWith({
      authentication: mockAuthentication,
    });
  });
});
