import { beforeEach, describe, test, jest, expect } from '@jest/globals';

import { appLogger } from '../../../../src/libs/logger';
import { SessionHeaderAuthenticationManager } from '../../../../src/libs/auth/authentications/session-header-auth-manager';
import { DefaultSessionService, DefaultAuthorizationService } from '../../../../src/libs/auth/services';
import { HeaderBasedAuthentication } from '../../../../src/libs/auth/authentications';

describe('session-header-auth-manager', () => {
  beforeEach(async () => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  test('authenticate()', async () => {
    const ctAuthorizationService = new DefaultAuthorizationService({
      authUrl: 'dummy-auth-url',
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      logger: appLogger,
    });

    const defaultSessionServiceOpt = {
      authorizationService: ctAuthorizationService,
      sessionUrl: 'dummy-session-url',
      projectKey: 'dummy-project-key',
      logger: appLogger,
    };
    const defaultSessionService = new DefaultSessionService(defaultSessionServiceOpt);
    const opt = { sessionService: defaultSessionService, logger: appLogger };
    const sessionHeaderAuthManager = new SessionHeaderAuthenticationManager(opt);

    const sessionIdAuthn = new HeaderBasedAuthentication('dummy-session-id');
    const mockSession = {
      id: 'dummy-session-id',
      version: 1,
      createdAt: '2021-09-01T00:00:00.000Z',
      lastModifiedAt: '2021-09-01T00:00:00.000Z',
      state: 'ACTIVE' as const,
      activeCart: {
        cartRef: {
          id: 'dummy-cart-id',
        },
      },
    };

    jest.spyOn(sessionIdAuthn, 'getPrincipal').mockReturnValue({ authHeader: 'dummy-session-id' });
    jest.spyOn(defaultSessionService, 'verifySession').mockResolvedValue(mockSession);
    jest.spyOn(defaultSessionService, 'getCartFromSession').mockReturnValue('dummy-cart-id');
    jest.spyOn(defaultSessionService, 'getProcessorUrlFromSession').mockReturnValue('https://localhost:8080');
    jest.spyOn(defaultSessionService, 'getCorrelationIdFromSession').mockReturnValue('dummy-correlation-id');
    const sessionAuthentication = await sessionHeaderAuthManager.authenticate(sessionIdAuthn);
    console.log(sessionAuthentication.getAuthorities());

    expect(sessionAuthentication).toBeDefined();
    expect(sessionAuthentication.getPrincipal()).toBeDefined();
    expect(sessionAuthentication.getPrincipal().cartId).toBeDefined();
    expect(sessionAuthentication.getPrincipal().cartId).toEqual('dummy-cart-id');
    expect(sessionAuthentication.getPrincipal().processorUrl).toBeDefined();
    expect(sessionAuthentication.getPrincipal().processorUrl).toEqual('https://localhost:8080');
    expect(sessionAuthentication.getPrincipal().correlationId).toBeDefined();
    expect(sessionAuthentication.getPrincipal().correlationId).toEqual('dummy-correlation-id');
    expect(sessionAuthentication.getAuthorities()).toBeDefined();
    expect(sessionAuthentication.getAuthorities()).toEqual([]);
    expect(sessionAuthentication.isAuthenticated()).toBeTruthy();
  });
});
