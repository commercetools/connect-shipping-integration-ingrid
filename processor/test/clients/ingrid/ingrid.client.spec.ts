import { describe, test, expect, afterEach, afterAll, beforeEach, jest, beforeAll } from '@jest/globals';
import { IngridApiClient } from '../../../src/clients/ingrid/ingrid.client';
import { setupServer } from 'msw/node';
import { mockRequest } from '../../mock/mock-utils';
import { IngridBasePath, IngridUrls, IngridEnvironment } from '../../../src/clients/ingrid/types/ingrid.client.type';
import {
  mockCreateCheckoutSessionRequest,
  mockCreateCheckoutSessionSuccessResponse,
  mockCreateCheckoutSessionAuthFailureResponse,
  mockPullCheckoutSessionResponse,
  mockGetCheckoutSessionResponse,
} from '../../mock/mock-ingrid-client-objects';
import { CustomError } from '../../../src/libs/fastify/errors';

describe('Ingrid Client', () => {
  const mockServer = setupServer();
  const opts = { apiSecret: 'dummy-ingrid-api-key', environment: 'STAGING' as IngridEnvironment };

  beforeAll(() => {
    mockServer.listen({
      onUnhandledRequest: 'bypass',
    });
  });

  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  afterAll(() => {
    mockServer.close();
  });

  describe('create Ingrid checkout session ', () => {
    test('should return required properties', async () => {
      mockServer.use(
        mockRequest(
          IngridBasePath.STAGING,
          IngridUrls.DELIVERY_CHECKOUT + '/session.create',
          200,
          mockCreateCheckoutSessionSuccessResponse,
        ),
      );

      const client = new IngridApiClient(opts);
      const response = await client.createCheckoutSession(mockCreateCheckoutSessionRequest);

      expect(typeof response.session).toBe('object');
      expect(typeof response.html_snippet).toBe('string');
      expect(typeof response.token).toBe('string');

      expect(typeof response.session.cart).toBe('object');
      expect(typeof response.session.delivery_groups).toBe('object');
      expect(typeof response.session.purchase_country).toBe('string');
    });
  });

  describe('pull Ingrid checkout session ', () => {
    test('should return required properties', async () => {
      mockServer.use(
        mockRequest(
          IngridBasePath.STAGING,
          IngridUrls.DELIVERY_CHECKOUT + '/session.pull',
          200,
          mockPullCheckoutSessionResponse,
        ),
      );

      const client = new IngridApiClient(opts);
      const response = await client.pullCheckoutSession('dummy-checkout-session-id');

      expect(typeof response.session).toBe('object');
      expect(typeof response.html_snippet).toBe('string');
      expect(typeof response.session.cart).toBe('object');
      expect(typeof response.session.delivery_groups).toBe('object');
      expect(typeof response.session.purchase_country).toBe('string');
    });
  });

  describe('get Ingrid checkout session ', () => {
    test('should return required properties', async () => {
      mockServer.use(
        mockRequest(
          IngridBasePath.STAGING,
          IngridUrls.DELIVERY_CHECKOUT + '/session.get',
          200,
          mockGetCheckoutSessionResponse,
        ),
      );

      const client = new IngridApiClient(opts);
      const response = await client.getCheckoutSession('dummy-checkout-session-id');

      expect(typeof response.session).toBe('object');
      expect(typeof response.html_snippet).toBe('string');
      expect(typeof response.session.cart).toBe('object');
      expect(typeof response.session.delivery_groups).toBe('object');
      expect(typeof response.session.purchase_country).toBe('string');
    });
  });

  describe('create Ingrid checkout session with wrong API key ', () => {
    test('should throw error', async () => {
      mockServer.use(
        mockRequest(
          IngridBasePath.STAGING,
          IngridUrls.DELIVERY_CHECKOUT + '/session.create',
          401,
          mockCreateCheckoutSessionAuthFailureResponse,
        ),
      );
      const client = new IngridApiClient(opts);
      try {
        await client.createCheckoutSession(mockCreateCheckoutSessionRequest);
      } catch (error) {
        expect(error instanceof CustomError).toBe(true);
        const customError = error as CustomError;
        expect(customError.httpErrorStatus).toBe(401);
      }
    });
  });
});
