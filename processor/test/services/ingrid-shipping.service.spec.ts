import { describe, test, expect, afterEach, jest, afterAll, beforeAll, beforeEach } from '@jest/globals';
import { setupServer } from 'msw/node';
import { IngridShippingService } from '../../src/services/ingrid-shipping.service';
import { AbstractShippingService } from '../../src/services/abstract-shipping.service';
import { IngridApiClient } from '../../src/clients/ingrid/ingrid.client';
import { CommercetoolsApiClient } from '../../src/clients/commercetools/api.client';
import { IngridBasePath, IngridUrls, IngridEnvironment } from '../../src/clients/ingrid/types/ingrid.client.type';
import {
  mockCreateCheckoutSessionSuccessResponse,
  mockCreateCheckoutSessionAuthFailureResponse,
  mockIngridCheckoutSessionWithAddresses,
  mockIngridCheckoutSessionWithoutAddresses,
} from '../mock/mock-ingrid-client-objects';
import {
  cart,
  cartWithoutCustomType,
  cartWithAdditionalCustomType,
  setCustomFieldFailureResponse,
  cartWithShippingAddress,
} from '../mock/mock-cart';
import { type } from '../mock/mock-type';
import { mockRequest } from '../mock/mock-utils';
import { InitSessionSuccessResponseSchemaDTO } from '../../src/dtos/ingrid-shipping.dto';
import { CustomError } from '../../src/libs/fastify/errors';
import { appLogger } from '../../src/libs/logger';
import { RequestContextData, updateRequestContext, getRequestContext } from '../../src/libs/fastify/context';

describe('ingrid-shipping.service', () => {
  const mockServer = setupServer();

  const opts = {
    clientId: 'dummy-coco-client-id',
    clientSecret: 'dummy-coco-client-secret',
    authUrl: 'https://auth.europe-west1.gcp.commercetools.com',
    apiUrl: 'https://api.europe-west1.gcp.commercetools.com',
    projectKey: 'dummy-coco-project-key',
    sessionUrl: 'https://session.europe-west1.gcp.commercetools.com',
    logger: appLogger,
    getContextFn: (): RequestContextData => {
      const { correlationId, requestId, authentication } = getRequestContext();
      return {
        correlationId: correlationId || '',
        requestId: requestId || '',
        authentication,
      };
    },
    updateContextFn: (context: Partial<RequestContextData>) => {
      const requestContext = Object.assign(
        {},
        context.correlationId ? { correlationId: context.correlationId } : {},
        context.requestId ? { requestId: context.requestId } : {},
        context.authentication ? { authentication: context.authentication } : {},
      );
      updateRequestContext(requestContext);
    },
  };

  const ingridOpts = {
    apiSecret: 'dummy-ingrid-api-key',
    environment: 'STAGING' as IngridEnvironment,
  };

  const commercetoolsApiClient: CommercetoolsApiClient = new CommercetoolsApiClient(opts);
  const ingridApiClient: IngridApiClient = new IngridApiClient(ingridOpts);

  const shippingService: AbstractShippingService = new IngridShippingService(commercetoolsApiClient, ingridApiClient);

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

  test('init session OK', async () => {
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.create',
        200,
        mockCreateCheckoutSessionSuccessResponse,
      ),
    );
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.get',
        200,
        mockCreateCheckoutSessionSuccessResponse,
      ),
    );
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCustomType').mockResolvedValue(type);
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue(cartWithoutCustomType);
    jest.spyOn(CommercetoolsApiClient.prototype, 'setCartCustomType').mockResolvedValue(cart);
    jest.spyOn(CommercetoolsApiClient.prototype, 'setCartCustomField').mockResolvedValue(cart);

    // Mock the transformCommercetoolsCartToIngridPayload function to handle the cart properly
    jest.mock('../../src/services/helpers/transformCommercetoolsToIngridDTOs', () => ({
      transformCommercetoolsCartToIngridPayload: jest.fn().mockReturnValue({
        cart: {
          items: [{ id: 'item-1', quantity: 1 }],
          total_value: 2599,
          total_discount: 0,
          cart_id: 'cart-id',
        },
        locales: ['de-DE'],
        purchase_country: 'DE',
        purchase_currency: 'EUR',
      }),
    }));

    const result = await shippingService.init();

    expect(typeof result.data).toBe('object');

    const data: InitSessionSuccessResponseSchemaDTO = result.data;
    expect(typeof data.ingridHtml).toBe('string');
    expect(typeof data.ingridSessionId).toBe('string');
    expect(typeof data.success).toBe('boolean');
    expect(typeof data.cartVersion).toBe('number');
  });

  test('init session failed with no ingrid-session custom type', async () => {
    // @ts-expect-error: should not be null but could happen if getCustomType() is not properly implemented
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCustomType').mockResolvedValue(null);

    try {
      await shippingService.init();
    } catch (error) {
      expect(error instanceof CustomError).toBe(true);
    }
  });

  test('init session OK when cart containing ingrid-session custom type', async () => {
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.create',
        200,
        mockCreateCheckoutSessionSuccessResponse,
      ),
    );
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.get',
        200,
        mockCreateCheckoutSessionSuccessResponse,
      ),
    );
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCustomType').mockResolvedValue(type);
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue(cart);
    jest.spyOn(CommercetoolsApiClient.prototype, 'setCartCustomField').mockResolvedValue(cart);

    const result = await shippingService.init();

    expect(typeof result.data).toBe('object');

    const data: InitSessionSuccessResponseSchemaDTO = result.data;
    expect(typeof data.ingridHtml).toBe('string');
    expect(typeof data.ingridSessionId).toBe('string');
    expect(typeof data.success).toBe('boolean');
    expect(typeof data.cartVersion).toBe('number');
  });

  test('init session failed with a cart containing additional custom type but no ingridSessionId as custom field', async () => {
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.create',
        200,
        mockCreateCheckoutSessionSuccessResponse,
      ),
    );
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.get',
        200,
        mockCreateCheckoutSessionSuccessResponse,
      ),
    );
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCustomType').mockResolvedValue(type);
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue(cartWithAdditionalCustomType);
    jest.spyOn(CommercetoolsApiClient.prototype, 'setCartCustomField').mockRejectedValue(setCustomFieldFailureResponse);

    try {
      await shippingService.init();
    } catch (error) {
      expect(error instanceof CustomError).toBe(true);
      const customError = error as CustomError;
      expect(customError.httpErrorStatus).toBe(400);
    }
  });

  test('init session failed due to wrong api key', async () => {
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.create',
        401,
        mockCreateCheckoutSessionAuthFailureResponse,
      ),
    );
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.get',
        401,
        mockCreateCheckoutSessionAuthFailureResponse,
      ),
    );
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCustomType').mockResolvedValue(type);
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue(cart);
    jest.spyOn(CommercetoolsApiClient.prototype, 'setCartCustomType').mockResolvedValue(cart);
    jest.spyOn(CommercetoolsApiClient.prototype, 'setCartCustomField').mockResolvedValue(cart);

    try {
      await shippingService.init();
    } catch (error) {
      expect(error instanceof CustomError).toBe(true);
      const customError = error as CustomError;
      expect(customError.httpErrorStatus).toBe(401);
    }
  });

  describe('update', () => {
    test('should update cart with addresses and shipping method from Ingrid session', async () => {
      const deliveryGroup = mockIngridCheckoutSessionWithAddresses.session.delivery_groups[0];
      if (!deliveryGroup?.addresses?.billing_address || !deliveryGroup?.addresses?.delivery_address) {
        throw new Error('Mock data is missing required address information');
      }

      // Mock getting cart with ingrid session
      jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue({
        ...cart,
        custom: {
          type: { typeId: 'type', id: 'type-id' },
          fields: { ingridSessionId: 'mock-ingrid-session-id' },
        },
      });

      // Mock getting Ingrid checkout session
      jest
        .spyOn(IngridApiClient.prototype, 'getCheckoutSession')
        .mockResolvedValue(mockIngridCheckoutSessionWithAddresses);

      // Mock updating cart with addresses and shipping method
      jest
        .spyOn(CommercetoolsApiClient.prototype, 'updateCartWithAddressAndShippingMethod')
        .mockResolvedValue(cartWithShippingAddress);

      // Mock the transformCommercetoolsCartToIngridPayload function for the update case
      jest.mock('../../src/services/helpers/transformCommercetoolsToIngridDTOs', () => ({
        transformCommercetoolsCartToIngridPayload: jest.fn().mockReturnValue({
          cart: {
            items: [{ id: 'item-1', quantity: 1 }],
            total_value: 2599,
            total_discount: 0,
            cart_id: 'cart-id',
          },
          locales: ['de-DE'],
          purchase_country: 'DE',
          purchase_currency: 'EUR',
        }),
      }));

      // Mock the updateCheckoutSession method
      jest.spyOn(IngridApiClient.prototype, 'updateCheckoutSession').mockResolvedValue({
        session: {
          checkout_session_id: 'mock-ingrid-session-id',
          status: 'active',
          updated_at: '2021-01-01T00:00:00.000Z',
          cart: mockIngridCheckoutSessionWithAddresses.session.cart,
          delivery_groups: mockIngridCheckoutSessionWithAddresses.session.delivery_groups,
          purchase_country: 'DE',
          // ... other session properties
        },
        html_snippet: '<div>Ingrid Checkout</div>',
      });

      const result = await shippingService.update();

      expect(result.data).toEqual({
        success: true,
        cartVersion: cart.version,
        ingridSessionId: 'mock-ingrid-session-id',
      });

      expect(CommercetoolsApiClient.prototype.updateCartWithAddressAndShippingMethod).toHaveBeenCalledWith(
        cart.id,
        cart.version,
        {
          billingAddress: expect.objectContaining({
            firstName: deliveryGroup.addresses.billing_address.first_name,
            lastName: deliveryGroup.addresses.billing_address.last_name,
          }),
          shippingAddress: expect.objectContaining({
            firstName: deliveryGroup.addresses.delivery_address.first_name,
            lastName: deliveryGroup.addresses.delivery_address.last_name,
          }),
        },
        expect.objectContaining({
          shippingMethodName: expect.any(String),
          shippingRate: expect.any(Object),
          taxCategory: expect.any(Object),
        }),
      );
    });

    test('should update Ingrid session when prices differ', async () => {
      // Mock getting cart with ingrid session
      jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue({
        ...cart,
        custom: {
          type: { typeId: 'type', id: 'type-id' },
          fields: { ingridSessionId: 'mock-ingrid-session-id' },
        },
      });

      // Mock getting Ingrid checkout session with different price
      const mockSessionWithDifferentPrice = {
        ...mockIngridCheckoutSessionWithAddresses,
        session: {
          ...mockIngridCheckoutSessionWithAddresses.session,
          cart: {
            ...mockIngridCheckoutSessionWithAddresses.session.cart,
            total_value: 3000, // Different from cart's taxedPrice.totalGross.centAmount
          },
        },
      };

      jest.spyOn(IngridApiClient.prototype, 'getCheckoutSession').mockResolvedValue(mockSessionWithDifferentPrice);

      // Mock updating cart with addresses and shipping method
      const updatedCartWithTaxedPrice = {
        ...cartWithShippingAddress,
        taxedPrice: {
          totalGross: { type: 'centPrecision' as const, centAmount: 2599, currencyCode: 'EUR', fractionDigits: 2 },
          totalNet: { type: 'centPrecision' as const, centAmount: 2184, currencyCode: 'EUR', fractionDigits: 2 },
          totalTax: { type: 'centPrecision' as const, centAmount: 415, currencyCode: 'EUR', fractionDigits: 2 },
          taxPortions: [
            {
              rate: 0.19,
              amount: { type: 'centPrecision' as const, centAmount: 415, currencyCode: 'EUR', fractionDigits: 2 },
              name: 'VAT',
            },
          ],
        },
      };

      jest
        .spyOn(CommercetoolsApiClient.prototype, 'updateCartWithAddressAndShippingMethod')
        .mockResolvedValue(updatedCartWithTaxedPrice);

      // Mock the transformCommercetoolsCartToIngridPayload function
      jest.mock('../../src/services/helpers/transformCommercetoolsToIngridDTOs', () => ({
        transformCommercetoolsCartToIngridPayload: jest.fn().mockReturnValue({
          cart: {
            items: [{ id: 'item-1', quantity: 1 }],
            total_value: 2599,
            total_discount: 0,
            cart_id: 'cart-id',
          },
          locales: ['de-DE'],
          purchase_country: 'DE',
          purchase_currency: 'EUR',
        }),
      }));

      // Mock the updateCheckoutSession method
      const updateSessionSpy = jest.spyOn(IngridApiClient.prototype, 'updateCheckoutSession').mockResolvedValue({
        session: {
          checkout_session_id: 'mock-ingrid-session-id',
          status: 'active',
          updated_at: '2021-01-01T00:00:00.000Z',
          cart: mockIngridCheckoutSessionWithAddresses.session.cart,
          delivery_groups: mockIngridCheckoutSessionWithAddresses.session.delivery_groups,
          purchase_country: 'DE',
          // ... other session properties
        },
        html_snippet: '<div>Updated Ingrid Checkout</div>',
      });

      const result = await shippingService.update();

      expect(result.data).toEqual({
        success: true,
        cartVersion: updatedCartWithTaxedPrice.version,
        ingridSessionId: 'mock-ingrid-session-id',
      });

      // Verify that updateCheckoutSession was called
      expect(updateSessionSpy).toHaveBeenCalled();
    });

    test('should throw error when cart has no taxed price', async () => {
      // Mock getting cart with ingrid session
      jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue({
        ...cart,
        custom: {
          type: { typeId: 'type', id: 'type-id' },
          fields: { ingridSessionId: 'mock-ingrid-session-id' },
        },
      });

      // Mock getting Ingrid checkout session
      jest
        .spyOn(IngridApiClient.prototype, 'getCheckoutSession')
        .mockResolvedValue(mockIngridCheckoutSessionWithAddresses);

      // Mock updating cart with addresses and shipping method but without taxed price
      const cartWithoutTaxedPrice = { ...cartWithShippingAddress };
      delete cartWithoutTaxedPrice.taxedPrice;

      jest
        .spyOn(CommercetoolsApiClient.prototype, 'updateCartWithAddressAndShippingMethod')
        .mockResolvedValue(cartWithoutTaxedPrice);

      await expect(shippingService.update()).rejects.toThrow(
        new CustomError({
          message:
            'Failed to get taxed price from commercetools cart. It seems like there is no shipping address set on commercetools cart.',
          code: 'FAILED_TO_GET_TAXED_PRICE_FROM_COMMERCETOOLS_CART',
          httpErrorStatus: 400,
        }),
      );
    });

    test('should throw error when addresses are missing in Ingrid session', async () => {
      // Mock getting cart with ingrid session
      jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue({
        ...cart,
        custom: {
          type: { typeId: 'type', id: 'type-id' },
          fields: { ingridSessionId: 'mock-ingrid-session-id' },
        },
      });

      // Mock getting Ingrid checkout session without addresses
      jest
        .spyOn(IngridApiClient.prototype, 'getCheckoutSession')
        .mockResolvedValue(mockIngridCheckoutSessionWithoutAddresses);

      await expect(shippingService.update()).rejects.toThrow(
        new CustomError({
          message:
            "Failed to get billing and delivery addresses from ingrid checkout session. It seems like the addresses weren't provided by the customer.",
          code: 'FAILED_TO_GET_BILLING_OR_DELIVERY_ADDRESSES_FROM_INGRID_CHECKOUT_SESSION',
          httpErrorStatus: 400,
        }),
      );
    });

    test('should throw error when cart has no Ingrid session ID', async () => {
      // Mock getting cart without ingrid session
      jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue(cartWithoutCustomType);

      await expect(shippingService.update()).rejects.toThrow(CustomError);
    });

    test('should throw error when updating cart fails', async () => {
      // Mock getting cart with ingrid session
      jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue({
        ...cart,
        custom: {
          type: { typeId: 'type', id: 'type-id' },
          fields: { ingridSessionId: 'mock-ingrid-session-id' },
        },
      });

      // Mock getting Ingrid checkout session
      jest
        .spyOn(IngridApiClient.prototype, 'getCheckoutSession')
        .mockResolvedValue(mockIngridCheckoutSessionWithAddresses);

      // Mock update cart failure
      jest.spyOn(CommercetoolsApiClient.prototype, 'updateCartWithAddressAndShippingMethod').mockRejectedValue(
        new CustomError({
          message: 'Failed to update cart',
          code: 'CART_UPDATE_FAILED',
          httpErrorStatus: 400,
        }),
      );

      await expect(shippingService.update()).rejects.toThrow(CustomError);
    });
  });
});
