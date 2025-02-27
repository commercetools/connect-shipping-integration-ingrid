import { describe, test, expect } from '@jest/globals';
import {
  transformCommercetoolsCartToIngridPayload,
  transformIngridDeliveryGroupsToCommercetoolsDataTypes,
} from '../../src/services/helpers';
import { CustomError } from '../../src/libs/fastify/errors';
import type { IngridDeliveryGroup } from '../../src/clients/ingrid/types/ingrid.client.type';

describe('Helper Functions', () => {
  describe('transformCommercetoolsCartToIngridPayload', () => {
    test('should throw error when cart is empty', () => {
      const emptyCart = {
        lineItems: [],
        locale: 'en',
        country: 'US',
        totalPrice: { currencyCode: 'USD', centAmount: 0 },
      };

      // @ts-expect-error: emptyCart is not a valid parameter
      expect(() => transformCommercetoolsCartToIngridPayload(emptyCart)).toThrow(CustomError);
      // @ts-expect-error: emptyCart is not a valid parameter
      expect(() => transformCommercetoolsCartToIngridPayload(emptyCart)).toThrow('Cart is empty');
    });

    test('should handle line items with missing images', () => {
      const cartWithNoImages = {
        lineItems: [
          {
            variant: {
              sku: 'SKU123',
              images: [],
              assets: [],
            },
            name: { en: 'Test Product' },
            price: { value: { centAmount: 1000, currencyCode: 'USD' } },
            quantity: 1,
          },
        ],
        locale: 'en',
        country: 'US',
        totalPrice: { currencyCode: 'USD', centAmount: 1000 },
        id: 'cart-id',
      };

      // @ts-expect-error: cartWithNoImages is not a valid parameter
      const result = transformCommercetoolsCartToIngridPayload(cartWithNoImages);
      expect(result.cart.items[0]?.image_url).toBe('');
    });

    test('should calculate correct discounts for line items with multiple discount types', () => {
      const cartWithDiscounts = {
        lineItems: [
          {
            variant: { sku: 'SKU123' },
            name: { en: 'Test Product' },
            price: {
              value: { centAmount: 1000, currencyCode: 'USD' },
              discounted: { value: { centAmount: 800, currencyCode: 'USD' } },
            },
            discountedPricePerQuantity: [
              {
                quantity: 1,
                discountedPrice: {
                  value: { centAmount: 700, currencyCode: 'USD' },
                },
              },
            ],
            quantity: 1,
          },
        ],
        locale: 'en',
        country: 'US',
        totalPrice: { currencyCode: 'USD', centAmount: 700 },
        id: 'cart-id',
      };

      // @ts-expect-error: cartWithDiscounts is not a valid parameter
      const result = transformCommercetoolsCartToIngridPayload(cartWithDiscounts);
      expect(result.cart.items[0]?.discount).toBe(300); // 1000 - 700
    });
  });

  describe('transformIngridDeliveryGroupsToCommercetoolsDataTypes', () => {
    test('should throw error when no delivery groups are provided', () => {
      const emptyDeliveryGroups: IngridDeliveryGroup[] = [];

      expect(() => transformIngridDeliveryGroupsToCommercetoolsDataTypes(emptyDeliveryGroups)).toThrow(CustomError);
      expect(() => transformIngridDeliveryGroupsToCommercetoolsDataTypes(emptyDeliveryGroups)).toThrow(
        'No delivery groups found',
      );
    });

    test('should throw error when multiple delivery groups are provided', () => {
      const multipleDeliveryGroups: IngridDeliveryGroup[] = [
        {
          addresses: {
            billing_address: { first_name: 'John' },
            delivery_address: { first_name: 'John' },
          },
          category: { name: 'Standard' },
          pricing: { currency: 'USD', price: 1000 },
        } as IngridDeliveryGroup,
        {
          addresses: {
            billing_address: { first_name: 'Jane' },
            delivery_address: { first_name: 'Jane' },
          },
          category: { name: 'Express' },
          pricing: { currency: 'USD', price: 2000 },
        } as IngridDeliveryGroup,
      ];

      expect(() => transformIngridDeliveryGroupsToCommercetoolsDataTypes(multipleDeliveryGroups)).toThrow(CustomError);
      expect(() => transformIngridDeliveryGroupsToCommercetoolsDataTypes(multipleDeliveryGroups)).toThrow(
        "We don't support multiple delivery groups yet",
      );
    });

    test('should handle delivery group with net price', () => {
      const deliveryGroupWithNetPrice: IngridDeliveryGroup[] = [
        {
          addresses: {
            billing_address: {
              first_name: 'John',
              last_name: 'Doe',
              street: 'Main St',
              street_number: '123',
              postal_code: '12345',
              city: 'New York',
              country: 'US',
              phone: '1234567890',
              email: 'john@example.com',
            },
            delivery_address: {
              first_name: 'John',
              last_name: 'Doe',
              street: 'Main St',
              street_number: '123',
              postal_code: '12345',
              city: 'New York',
              country: 'US',
              phone: '1234567890',
              email: 'john@example.com',
            },
          },
          category: { name: 'Standard Shipping' },
          pricing: {
            currency: 'USD',
            price: 1000,
            net_price: 800,
          },
        } as IngridDeliveryGroup,
      ];

      const result = transformIngridDeliveryGroupsToCommercetoolsDataTypes(deliveryGroupWithNetPrice);
      expect(result.customShippingMethod.shippingRate.price.centAmount).toBe(800);
    });
  });
});
