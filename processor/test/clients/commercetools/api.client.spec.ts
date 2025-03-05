import { describe, test, afterAll, expect, beforeAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { mockRequest } from '../../mock/mock-utils';
import { cart } from '../../mock/mock-cart';
import { mockAccessToken } from '../../mock/mock-authorization';
import { appLogger } from '../../../src/libs/logger';
import { CommercetoolsApiClient } from '../../../src/clients/commercetools/api.client';
import { type } from '../../mock/mock-type';
import { TaxCategoryResourceIdentifier } from '@commercetools/platform-sdk';

const mockServer = setupServer();

describe('commercetools api client', () => {
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

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.getCartById('dummy-cart-id');
      expect(resp).toBeDefined();
      expect(resp).toEqual(cart);
    });
  });

  describe('updateCartWithAddressAndShippingMethod', () => {
    test('should update cart with address and shipping method', async () => {
      const addresses = {
        shippingAddress: { firstName: 'John', lastName: 'Doe', country: 'DE' },
        billingAddress: { firstName: 'Jane', lastName: 'Doe', country: 'DE' },
      };
      const taxCategory: TaxCategoryResourceIdentifier = { typeId: 'tax-category', key: 'standard' };
      const shippingMethodPayload = {
        shippingMethodName: 'Express',
        shippingRate: { price: { centAmount: 1000, currencyCode: 'USD' } },
        taxCategory,
      };

      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/carts/dummy-cart-id', 200, cart),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.updateCartWithAddressAndShippingMethod(
        'dummy-cart-id',
        1,
        addresses,
        shippingMethodPayload,
      );

      expect(resp).toBeDefined();
      expect(resp).toEqual(cart);
    });
  });

  describe('setCartCustomField', () => {
    test('should set custom field on cart', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/carts/dummy-cart-id', 200, cart),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.setCartCustomField('dummy-cart-id', 1, 'testField', 'testValue');

      expect(resp).toBeDefined();
      expect(resp).toEqual(cart);
    });
  });

  describe('setCartCustomType', () => {
    test('should set custom type on cart', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/carts/dummy-cart-id', 200, cart),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.setCartCustomType('dummy-cart-id', 1, 'type-id');

      expect(resp).toBeDefined();
      expect(resp).toEqual(cart);
    });
  });

  describe('getCustomType', () => {
    test('should get custom type by key', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/types/key=test-type', 200, type),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.getCustomType('test-type');

      expect(resp).toBeDefined();
      expect(resp).toEqual(type);
    });
  });

  describe('checkIfCustomTypeExistsByKey', () => {
    test('should check if custom type exists', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/types/key=test-type', 200, {}),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.checkIfCustomTypeExistsByKey('test-type');

      expect(resp).toBe(true);
    });

    test('should return false when custom type does not exist', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/types/key=test-type', 404, {}),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.checkIfCustomTypeExistsByKey('test-type');

      expect(resp).toBe(false);
    });
  });

  describe('checkIfTaxCategoryExistsByKey', () => {
    test('should return true when tax category exists', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/tax-categories/key=test-tax', 200, {
          key: 'test-tax',
        }),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.checkIfTaxCategoryExistsByKey('test-tax');

      expect(resp).toBe(true);
    });

    test('should return false when tax category does not exist', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/tax-categories/key=test-tax', 404, {}),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.checkIfTaxCategoryExistsByKey('test-tax');

      expect(resp).toBe(false);
    });
  });

  describe('createTaxCategoryWithNullRate', () => {
    test('should create tax category with null rate for all project countries', async () => {
      const mockProjectResponse = {
        countries: ['DE', 'US', 'FR'],
      };

      const mockTaxCategory = {
        key: 'test-tax',
        name: 'test-tax (created by Ingrid Connector)',
        rates: [
          {
            name: 'DE',
            amount: 0,
            country: 'DE',
            includedInPrice: true,
          },
          {
            name: 'US',
            amount: 0,
            country: 'US',
            includedInPrice: true,
          },
          {
            name: 'FR',
            amount: 0,
            country: 'FR',
            includedInPrice: true,
          },
        ],
      };

      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key', 200, mockProjectResponse),
        mockRequest('https://api.test.de/', 'dummy-project-key/tax-categories', 201, mockTaxCategory),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.createTaxCategoryWithNullRate('test-tax');

      expect(resp).toBeDefined();
      expect(resp).toEqual(mockTaxCategory);
    });

    test('should handle empty countries list', async () => {
      const mockProjectResponse = {
        countries: [],
      };

      const mockTaxCategory = {
        key: 'test-tax',
        name: 'test-tax (created by Ingrid Connector)',
        rates: [],
      };

      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key', 200, mockProjectResponse),
        mockRequest('https://api.test.de/', 'dummy-project-key/tax-categories', 201, mockTaxCategory),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const resp = await apiClient.createTaxCategoryWithNullRate('test-tax');

      expect(resp).toBeDefined();
      expect(resp).toEqual(mockTaxCategory);
    });
  });

  describe('getProjectCountries', () => {
    test('should return list of countries from project', async () => {
      const mockProjectResponse = {
        countries: ['DE', 'US', 'FR'],
      };

      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key', 200, mockProjectResponse),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const countries = await apiClient.getProjectCountries();

      expect(countries).toEqual(['DE', 'US', 'FR']);
    });

    test('should handle empty countries list', async () => {
      const mockProjectResponse = {
        countries: [],
      };

      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key', 200, mockProjectResponse),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      const countries = await apiClient.getProjectCountries();

      expect(countries).toEqual([]);
    });

    test('should handle error when fetching project countries', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key', 500, {
          message: 'Internal Server Error',
        }),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      await expect(apiClient.getProjectCountries()).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    test('should handle network errors', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        mockRequest('https://api.test.de/', 'dummy-project-key/carts/dummy-cart-id', 500, {
          message: 'Internal Server Error',
        }),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      await expect(apiClient.getCartById('dummy-cart-id')).rejects.toThrow();
    });

    test('should handle authentication errors', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 401, {
          message: 'Invalid credentials',
        }),
      );

      const apiClient = new CommercetoolsApiClient(opt);
      await expect(apiClient.getCartById('dummy-cart-id')).rejects.toThrow();
    });

    test('should handle request timeout', async () => {
      mockServer.use(
        mockRequest('https://auth.test.de/', 'oauth/token', 200, mockAccessToken),
        // @ts-expect-error: msw types are not fully compatible with our usage
        () => {
          return new Promise(() => {}); // Never resolves to simulate timeout
        },
      );

      const apiClient = new CommercetoolsApiClient(opt);
      await expect(apiClient.getCartById('dummy-cart-id')).rejects.toThrow();
    });
  });
});
