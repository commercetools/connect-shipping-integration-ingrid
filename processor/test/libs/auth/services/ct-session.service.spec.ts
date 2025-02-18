import { afterAll, afterEach, beforeAll, beforeEach, describe, test, jest, expect } from '@jest/globals';
import { setupServer } from 'msw/node';
import { appLogger } from '../../../../src/libs/logger';
import { mockRequest } from '../../../mock/mock-utils';
import { DefaultSessionService, DefaultAuthorizationService } from '../../../../src/libs/auth/services';
import { GeneralError, ErrorAuthErrorResponse } from '../../../../src/libs/fastify/errors';
import {
  ErrorPrivateFields,
  InactiveSessionErrorPrivateFields,
  mockAccessToken,
  mockSessionId,
  mockSessionUrl,
  mockGetExpiredSessionResponse,
  mockGetSessionResponse,
  mockProjectKey,
} from '../../../mock/mock-session';
describe('ct-session.service', () => {
  const mockServer = setupServer();

  beforeAll(() => {
    mockServer.listen({
      onUnhandledRequest: 'bypass',
    });
  });

  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  afterAll(() => {
    mockServer.close();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  test('verifySession() OK', async () => {
    const authorizationServiceOpt = {
      authUrl: 'dummy-auth-url',
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      logger: appLogger,
    };
    const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);
    const opt = {
      authorizationService,
      projectKey: mockProjectKey,
      sessionUrl: mockSessionUrl,

      logger: appLogger,
    };
    jest.spyOn(authorizationService, 'getAccessToken').mockResolvedValue(mockAccessToken);
    mockServer.use(
      mockRequest(mockSessionUrl, `/${mockProjectKey}/sessions/${mockSessionId}`, 200, mockGetSessionResponse),
    );
    const sessionService = new DefaultSessionService(opt);
    const resp = await sessionService.verifySession(mockSessionId);
    expect(resp).toBeDefined();
    expect(resp).toEqual(mockGetSessionResponse);
  });

  test('verifySession() produce 403 HTTP status', async () => {
    const authorizationServiceOpt = {
      authUrl: 'dummy-auth-url',
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      logger: appLogger,
    };
    const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);
    const opt = {
      authorizationService,
      projectKey: mockProjectKey,
      sessionUrl: mockSessionUrl,

      logger: appLogger,
    };
    jest.spyOn(authorizationService, 'getAccessToken').mockResolvedValue(mockAccessToken);
    mockServer.use(
      mockRequest(mockSessionUrl, `/${mockProjectKey}/sessions/${mockSessionId}`, 403, mockGetSessionResponse),
    );
    const sessionService = new DefaultSessionService(opt);
    try {
      await sessionService.verifySession(mockSessionId);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error instanceof GeneralError).toBeTruthy();
      const generalError = error as GeneralError;
      expect(generalError.message).toEqual('Could not get commercetools session');
      expect(generalError.privateFields).toBeDefined();
      const privateFields: ErrorPrivateFields = generalError.privateFields as ErrorPrivateFields;
      expect(privateFields?.status).toBeDefined();
      expect(privateFields?.status).toEqual(403);
    }
  });

  test('verifySession() produce 404 HTTP status', async () => {
    const authorizationServiceOpt = {
      authUrl: 'dummy-auth-url',
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      logger: appLogger,
    };
    const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);
    const opt = {
      authorizationService,
      projectKey: mockProjectKey,
      sessionUrl: mockSessionUrl,

      logger: appLogger,
    };
    jest.spyOn(authorizationService, 'getAccessToken').mockResolvedValue(mockAccessToken);
    mockServer.use(
      mockRequest(mockSessionUrl, `/${mockProjectKey}/sessions/${mockSessionId}`, 404, mockGetSessionResponse),
    );
    const sessionService = new DefaultSessionService(opt);
    try {
      await sessionService.verifySession(mockSessionId);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error instanceof ErrorAuthErrorResponse).toBeTruthy();
      const generalError = error as ErrorAuthErrorResponse;
      expect(generalError.message).toEqual('commercetools session not found');
      expect(generalError.privateFields).toBeDefined();
      const privateFields: ErrorPrivateFields = generalError.privateFields as ErrorPrivateFields;
      expect(privateFields?.status).toBeDefined();
      expect(privateFields?.status).toEqual(404);
    }
  });

  test('verifySession() produce inactive session', async () => {
    const authorizationServiceOpt = {
      authUrl: 'dummy-auth-url',
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      logger: appLogger,
    };
    const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);
    const opt = {
      authorizationService,
      projectKey: mockProjectKey,
      sessionUrl: mockSessionUrl,

      logger: appLogger,
    };

    jest.spyOn(authorizationService, 'getAccessToken').mockResolvedValue(mockAccessToken);
    mockServer.use(
      mockRequest(mockSessionUrl, `/${mockProjectKey}/sessions/${mockSessionId}`, 200, mockGetExpiredSessionResponse),
    );
    const sessionService = new DefaultSessionService(opt);
    try {
      await sessionService.verifySession(mockSessionId);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error instanceof ErrorAuthErrorResponse).toBeTruthy();
      const generalError = error as ErrorAuthErrorResponse;
      expect(generalError.message).toEqual(
        `commercetools session is not ACTIVE, current status: ${mockGetExpiredSessionResponse.state}`,
      );
      expect(generalError.privateFields).toBeDefined();
      const privateFields: InactiveSessionErrorPrivateFields =
        generalError.privateFields as InactiveSessionErrorPrivateFields;
      expect(privateFields?.session).toBeDefined();
    }
  });

  test('getCartFromSession() OK', async () => {
    const authorizationServiceOpt = {
      authUrl: 'dummy-auth-url',
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      logger: appLogger,
    };
    const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);
    const opt = {
      authorizationService,
      projectKey: mockProjectKey,
      sessionUrl: mockSessionUrl,

      logger: appLogger,
    };

    jest.spyOn(authorizationService, 'getAccessToken').mockResolvedValue(mockAccessToken);
    mockServer.use(
      mockRequest(mockSessionUrl, `/${mockProjectKey}/sessions/${mockSessionId}`, 200, mockGetExpiredSessionResponse),
    );
    const sessionService = new DefaultSessionService(opt);

    const cartId = sessionService.getCartFromSession(mockGetSessionResponse);
    expect(cartId).toBeDefined();
    expect(cartId).toEqual(mockGetSessionResponse.activeCart.cartRef.id);
  });

  test('getProcessorUrlFromSession() OK', async () => {
    const authorizationServiceOpt = {
      authUrl: 'dummy-auth-url',
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      logger: appLogger,
    };
    const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);
    const opt = {
      authorizationService,
      projectKey: mockProjectKey,
      sessionUrl: mockSessionUrl,

      logger: appLogger,
    };

    jest.spyOn(authorizationService, 'getAccessToken').mockResolvedValue(mockAccessToken);
    mockServer.use(
      mockRequest(mockSessionUrl, `/${mockProjectKey}/sessions/${mockSessionId}`, 200, mockGetExpiredSessionResponse),
    );
    const sessionService = new DefaultSessionService(opt);

    const processorUrl = sessionService.getProcessorUrlFromSession(mockGetSessionResponse);
    expect(processorUrl).toBeDefined();
    expect(processorUrl).toEqual(mockGetSessionResponse.metadata?.processorUrl);
  });

  test('getCorrelationIdFromSession() OK', async () => {
    const authorizationServiceOpt = {
      authUrl: 'dummy-auth-url',
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      logger: appLogger,
    };
    const authorizationService = new DefaultAuthorizationService(authorizationServiceOpt);
    const opt = {
      authorizationService,
      projectKey: mockProjectKey,
      sessionUrl: mockSessionUrl,
      logger: appLogger,
    };

    jest.spyOn(authorizationService, 'getAccessToken').mockResolvedValue(mockAccessToken);
    mockServer.use(
      mockRequest(mockSessionUrl, `/${mockProjectKey}/sessions/${mockSessionId}`, 200, mockGetExpiredSessionResponse),
    );
    const sessionService = new DefaultSessionService(opt);

    const processorUrl = sessionService.getCorrelationIdFromSession(mockGetSessionResponse);
    expect(processorUrl).toBeDefined();
    expect(processorUrl).toEqual(mockGetSessionResponse.metadata?.correlationId);
  });
});
