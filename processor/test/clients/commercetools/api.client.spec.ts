import { describe, test, afterAll, expect, beforeAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { mockHead, mockRequest, mockGet, mockPost } from '../../mock/mock-utils';
import { cart } from '../../mock/mock-cart';
import { type } from '../../mock/mock-type';
import { mockAccessToken } from '../../mock/mock-authorization';
import { appLogger } from '../../../src/libs/logger';
import { CommercetoolsApiClient } from '../../../src/clients/commercetools/api.client';

const mockServer = setupServer();

describe('commercetools api client', () => {
  beforeAll(() =>
    mockServer.listen({
      onUnhandledRequest: 'bypass',
    }),
  );
  afterAll(() => mockServer.close());

  describe('getCartById', () => {
    test('should return a cart', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/carts/dummy-cart-id', 200, cart),
      );
      const opt = {
        clientId: 'dummy-client-id',
        clientSecret: 'dummy-client-secret',
        authUrl: 'https://auth.test.de',
        apiUrl: 'https://api.test.de',
        projectKey: 'dummy-project-key',
        getContextFn: () => ({
          correlationId: 'correlation-id',
          requestId: 'request-id',
        }),
        updateContextFn: () => {},
        logger: appLogger,
      };
      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.getCartById('dummy-cart-id');
      expect(resp).toBeDefined();
      expect(resp).toEqual(cart);
    });
  });
});
