import { describe, expect, test } from '@jest/globals';
import {
  transformCommercetoolsCartToIngridPayload,
  transformIngridDeliveryGroupsToCommercetoolsDataTypes,
  transformMultipleDeliveryGroups,
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
            custom: {
              type: {
                typeId: 'type',
                id: '678941e6-ffcd-42d6-815e-3eb6fe798a94',
              },
              fields: {
                handlingTime: 5,
              },
            },
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
            custom: {
              type: {
                typeId: 'type',
                id: '678941e6-ffcd-42d6-815e-3eb6fe798a94',
              },
              fields: {
                handlingTime: 5,
              },
            },
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

    test('should use first delivery group when multiple are provided (single-group function)', () => {
      const multipleDeliveryGroups: IngridDeliveryGroup[] = [
        {
          addresses: {
            billing_address: {
              first_name: 'John',
              last_name: 'Doe',
              street: 'Main St',
              street_number: '1',
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
              street_number: '1',
              postal_code: '12345',
              city: 'New York',
              country: 'US',
              phone: '1234567890',
              email: 'john@example.com',
            },
          },
          category: { name: 'Standard' },
          pricing: { currency: 'USD', price: 1000 },
          shipping: { carrier_product_id: 'std-1' },
        } as IngridDeliveryGroup,
        {
          addresses: {
            billing_address: { first_name: 'Jane' },
            delivery_address: { first_name: 'Jane' },
          },
          category: { name: 'Express' },
          pricing: { currency: 'USD', price: 2000 },
          shipping: { carrier_product_id: 'exp-1' },
        } as IngridDeliveryGroup,
      ];

      const result = transformIngridDeliveryGroupsToCommercetoolsDataTypes(multipleDeliveryGroups);
      expect(result.customShippingMethod.shippingMethodName).toBe('Standard');
      expect(result.customShippingMethod.shippingRate.price.centAmount).toBe(1000);
    });

    test('should transform multiple delivery groups via transformMultipleDeliveryGroups', () => {
      const multipleDeliveryGroups: IngridDeliveryGroup[] = [
        {
          group_id: 'group-a',
          addresses: {
            billing_address: {
              first_name: 'John',
              last_name: 'Doe',
              street: 'Main St',
              street_number: '1',
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
              street_number: '1',
              postal_code: '12345',
              city: 'New York',
              country: 'US',
              phone: '1234567890',
              email: 'john@example.com',
            },
          },
          category: { name: 'Standard Shipping' },
          pricing: { currency: 'USD', price: 1000 },
          shipping: {
            carrier_product_id: 'std-1',
            delivery_type: 'delivery',
            delivery_addons: [],
            meta: {},
          },
        } as IngridDeliveryGroup,
        {
          group_id: 'group-b',
          addresses: {
            billing_address: {
              first_name: 'John',
              last_name: 'Doe',
              street: 'Main St',
              street_number: '1',
              postal_code: '12345',
              city: 'New York',
              country: 'US',
              phone: '1234567890',
              email: 'john@example.com',
            },
            delivery_address: {
              first_name: 'Jane',
              last_name: 'Smith',
              street: 'Oak Ave',
              street_number: '42',
              postal_code: '67890',
              city: 'Boston',
              country: 'US',
              phone: '0987654321',
              email: 'jane@example.com',
            },
          },
          category: { name: 'Express Shipping' },
          pricing: { currency: 'USD', price: 2000, net_price: 1600 },
          shipping: {
            carrier_product_id: 'exp-1',
            delivery_type: 'delivery',
            delivery_addons: [],
            meta: {},
          },
        } as IngridDeliveryGroup,
      ];

      const result = transformMultipleDeliveryGroups(multipleDeliveryGroups);
      expect(result.billingAddress.firstName).toBe('John');
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0]!.shippingKey).toBe('ingrid-group-a');
      expect(result.groups[0]!.groupId).toBe('group-a');
      expect(result.groups[0]!.customShippingMethod.shippingMethodName).toBe('Standard Shipping');
      expect(result.groups[0]!.customShippingMethod.shippingRate.price.centAmount).toBe(1000);
      expect(result.groups[1]!.shippingKey).toBe('ingrid-group-b');
      expect(result.groups[1]!.groupId).toBe('group-b');
      expect(result.groups[1]!.customShippingMethod.shippingMethodName).toBe('Express Shipping');
      expect(result.groups[1]!.customShippingMethod.shippingRate.price.centAmount).toBe(1600);
      expect(result.groups[1]!.deliveryAddress.firstName).toBe('Jane');
      expect(result.groups[1]!.deliveryAddress.city).toBe('Boston');
    });

    test('should throw error for empty groups in transformMultipleDeliveryGroups', () => {
      expect(() => transformMultipleDeliveryGroups([])).toThrow(CustomError);
      expect(() => transformMultipleDeliveryGroups([])).toThrow('No delivery groups found');
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
          shipping: {
            carrier_product_id: 'carrier-product-id',
          },
        } as IngridDeliveryGroup,
      ];

      const result = transformIngridDeliveryGroupsToCommercetoolsDataTypes(deliveryGroupWithNetPrice);
      expect(result.customShippingMethod.shippingRate.price.centAmount).toBe(800);
    });

    test('should handle delivery group with pickup point ID', () => {
      const deliveryGroupWithPickupPointId: IngridDeliveryGroup[] = [
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
            location: {
              external_id: '1234567890',
            },
          },
          category: { name: 'Standard Shipping' },
          pricing: { currency: 'USD', price: 1000 },
          shipping: {
            carrier_product_id: 'carrier-product-id',
            delivery_type: 'pickup',
          },
        } as IngridDeliveryGroup,
      ];

      const result = transformIngridDeliveryGroupsToCommercetoolsDataTypes(deliveryGroupWithPickupPointId);
      expect(result.pickupPointId).toBe('1234567890');
    });

    test('should handle carrier-specific delivery group for instabox', () => {
      const deliveryGroupWithInstaboxToken: IngridDeliveryGroup[] = [
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
          location: {},
          category: { name: 'Standard Shipping' },
          pricing: { currency: 'USD', price: 1000 },
          shipping: {
            carrier_product_id: 'carrier-product-id',
            delivery_type: 'pickup',
            carrier: 'Instabox',
            meta: { 'isb.availability_token': '1234567890' },
          },
        } as unknown as IngridDeliveryGroup,
      ];

      const result = transformIngridDeliveryGroupsToCommercetoolsDataTypes(deliveryGroupWithInstaboxToken);
      expect(result.instaboxToken).toBe('1234567890');
    });

    test('should handle present meta data even if it is not instabox', () => {
      const deliveryGroupWithInstaboxToken: IngridDeliveryGroup[] = [
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
          pricing: { currency: 'USD', price: 1000 },
          shipping: {
            carrier_product_id: 'carrier-product-id',
            delivery_type: 'pickup',
            meta: { 'some.unknown.meta': 'meta-string-data' },
          },
        } as unknown as IngridDeliveryGroup,
      ];

      const result = transformIngridDeliveryGroupsToCommercetoolsDataTypes(deliveryGroupWithInstaboxToken);
      expect(result.instaboxToken).toBeUndefined();
    });
  });
});
