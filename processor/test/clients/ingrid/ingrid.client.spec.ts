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

import { HttpHandler } from 'msw';
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

  describe('pull Ingrid checkout session with server error ', () => {
    test('should retry 5 times and throw error ', async () => {
      const mockRequestHandler: HttpHandler = mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.pull',
        500,
      );

      mockServer.use(mockRequestHandler);

      const client = new IngridApiClient(opts);
      const spy = jest.spyOn(mockRequestHandler, 'run');
      try {
        await client.pullCheckoutSession('dummy-checkout-session-id');
      } catch (error) {
        expect(error instanceof CustomError).toBe(true);
        expect(spy).toHaveBeenCalledTimes(5);
      }
    }, 20000);
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

  describe('get Ingrid checkout session with server error ', () => {
    test('should retry 5 times and throw error ', async () => {
      const mockRequestHandler: HttpHandler = mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.get',
        500,
      );

      mockServer.use(mockRequestHandler);

      const client = new IngridApiClient(opts);
      const spy = jest.spyOn(mockRequestHandler, 'run');
      try {
        await client.getCheckoutSession('dummy-checkout-session-id');
      } catch (error) {
        expect(error instanceof CustomError).toBe(true);
        expect(spy).toHaveBeenCalledTimes(5);
      }
    }, 20000);
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

  describe('create Ingrid checkout session with server error ', () => {
    test('should retry 5 times and throw error ', async () => {
      const mockRequestHandler: HttpHandler = mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.create',
        500,
      );

      mockServer.use(mockRequestHandler);

      const client = new IngridApiClient(opts);
      const spy = jest.spyOn(mockRequestHandler, 'run');
      try {
        await client.createCheckoutSession(mockCreateCheckoutSessionRequest);
      } catch (error) {
        expect(error instanceof CustomError).toBe(true);
        expect(spy).toHaveBeenCalledTimes(5);
      }
    }, 20000);
  });

  describe('update Ingrid checkout session', () => {
    test('should update session successfully', async () => {
      const mockUpdateSessionResponse = {
        session: {
          checkout_session_id: 'mock-session-id',
          cart: {
            cart_id: 'mock-cart-id',
            total_value: 1000,
            total_discount: 0,
            items: [],
          },
          delivery_groups: [],
          purchase_country: 'SE',
          status: 'ACTIVE',
          updated_at: '2024-03-14T12:00:00Z',
        },
        html_snippet: '<div>Updated checkout</div>',
      };

      mockServer.use(
        mockRequest(
          IngridBasePath.STAGING,
          IngridUrls.DELIVERY_CHECKOUT + '/session.update',
          200,
          mockUpdateSessionResponse,
        ),
      );

      const client = new IngridApiClient(opts);
      const updatePayload = {
        checkout_session_id: 'mock-session-id',
        cart: {
          cart_id: 'mock-cart-id',
          total_value: 1000,
          total_discount: 0,
          items: [],
        },
        purchase_country: 'SE',
        purchase_currency: 'SEK',
      };

      const response = await client.updateCheckoutSession(updatePayload);

      expect(response.session.checkout_session_id).toBe('mock-session-id');
      expect(response.html_snippet).toBe('<div>Updated checkout</div>');
      expect(response.session.status).toBe('ACTIVE');
    });

    test('should handle update session failure', async () => {
      mockServer.use(
        mockRequest(IngridBasePath.STAGING, IngridUrls.DELIVERY_CHECKOUT + '/session.update', 400, {
          error: 'Invalid session ID',
        }),
      );

      const client = new IngridApiClient(opts);
      const updatePayload = {
        checkout_session_id: 'invalid-session-id',
        cart: {
          cart_id: 'mock-cart-id',
          total_value: 1000,
          total_discount: 0,
          items: [],
        },
        purchase_country: 'SE',
        purchase_currency: 'SEK',
      };
      await expect(client.updateCheckoutSession(updatePayload)).rejects.toThrow(CustomError);
    });
  });

  describe('update Ingrid checkout session with server error ', () => {
    test('should retry 5 times and throw error ', async () => {
      const mockRequestHandler: HttpHandler = mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.update',
        500,
      );

      mockServer.use(mockRequestHandler);

      const client = new IngridApiClient(opts);
      const spy = jest.spyOn(mockRequestHandler, 'run');
      const updatePayload = {
        checkout_session_id: 'mock-session-id',
        cart: {
          cart_id: 'mock-cart-id',
          total_value: 1000,
          total_discount: 0,
          items: [],
        },
        purchase_country: 'SE',
        purchase_currency: 'SEK',
      };

      try {
        await client.updateCheckoutSession(updatePayload);
      } catch (error) {
        expect(error instanceof CustomError).toBe(true);
        expect(spy).toHaveBeenCalledTimes(5);
      }
    }, 20000);
  });
});
