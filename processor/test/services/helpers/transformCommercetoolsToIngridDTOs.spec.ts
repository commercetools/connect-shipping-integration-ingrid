import { describe, test, jest, beforeEach, expect } from '@jest/globals';
import { cart, cartWithShippingAddress } from '../../mock/mock-cart';
import { transformCommercetoolsCartToIngridPayload } from '../../../src/services/helpers/transformCommercetoolsToIngridDTOs';
import { CustomError } from '../../../src/libs/fastify/errors';
import { Cart } from '@commercetools/platform-sdk';

describe('transformCommercetoolsToIngridDTOs', () => {
  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  test('transform cart without shipping address successfully', async () => {
    const payload = transformCommercetoolsCartToIngridPayload(cart);
    expect(payload).toBeDefined();
    expect(payload.cart).toBeDefined();
    expect(payload.cart.total_value).toBeDefined();
    expect(payload.cart.total_value).toEqual(2599);
    expect(payload.cart.total_discount).toBeDefined();
    expect(payload.cart.cart_id).toBeDefined();
    expect(payload.cart.cart_id).toEqual(cart.id);
    expect(payload.cart.items).toBeDefined();
    expect(payload.cart.items.length).toEqual(1);
    expect(payload.cart.items[0]).toBeDefined();
    expect(payload.cart.items[0]?.sku).toBeDefined();
    expect(payload.cart.items[0]?.sku).toEqual('LPC-011');

    expect(payload.locales).toBeDefined();
    expect(payload.locales.length).toEqual(1);
    expect(payload.locales[0]).toEqual('de-DE');
    expect(payload.purchase_country).toBeDefined();
    expect(payload.purchase_country).toEqual('DE');
    expect(payload.purchase_currency).toBeDefined();
    expect(payload.purchase_currency).toEqual('EUR');
  });

  test('transform cart with shipping address successfully', async () => {
    const payload = transformCommercetoolsCartToIngridPayload(cartWithShippingAddress);
    expect(payload).toBeDefined();
    expect(payload.cart).toBeDefined();
    expect(payload.cart.total_value).toBeDefined();
    expect(payload.cart.total_value).toEqual(2599);
    expect(payload.cart.items).toBeDefined();
    expect(payload.cart.items.length).toEqual(1);
    expect(payload.cart.items[0]).toBeDefined();
    expect(payload.cart.items[0]?.sku).toBeDefined();
    expect(payload.cart.items[0]?.sku).toEqual('LPC-011');

    expect(payload.locales).toBeDefined();
    expect(payload.locales.length).toEqual(1);
    expect(payload.locales[0]).toEqual('de-DE');
    expect(payload.purchase_country).toBeDefined();
    expect(payload.purchase_country).toEqual('DE');
    expect(payload.purchase_currency).toBeDefined();
    expect(payload.purchase_currency).toEqual('EUR');
    expect(payload.prefill_delivery_address).toBeDefined();
    expect(payload.prefill_delivery_address?.external_id).toEqual('dummy-address-id');
    expect(payload.prefill_delivery_address?.address_lines.length).toEqual(1);
    expect(payload.prefill_delivery_address?.address_lines[0]).toEqual('Adams-Lehmann-Straße 44');
    expect(payload.prefill_delivery_address?.city).toEqual('Munich');
    expect(payload.prefill_delivery_address?.country).toEqual('DE');
    expect(payload.prefill_delivery_address?.first_name).toEqual('dummy-first-name');
    expect(payload.prefill_delivery_address?.last_name).toEqual('dummy-last-name');
    expect(payload.prefill_delivery_address?.street).toEqual('Adams-Lehmann-Straße');
    expect(payload.prefill_delivery_address?.street_number).toEqual('44');
    expect(payload.prefill_delivery_address?.postal_code).toEqual('80797');
    expect(payload.prefill_delivery_address?.region).toBeUndefined();
    expect(payload.prefill_delivery_address?.phone).toEqual('+49012345678901');
    expect(payload.prefill_delivery_address?.email).toEqual('test@test.de');
    expect(payload.prefill_delivery_address?.company_name).toEqual('Commercetools GmbH');
    expect(payload.cart.total_discount).toBeDefined();
    expect(payload.cart.cart_id).toBeDefined();
    expect(payload.cart.cart_id).toEqual(cartWithShippingAddress.id);
  });

  test('should throw error when cart is empty', async () => {
    const emptyCart = {
      ...cart,
      lineItems: [],
    };

    expect(() => transformCommercetoolsCartToIngridPayload(emptyCart)).toThrow(CustomError);
    expect(() => transformCommercetoolsCartToIngridPayload(emptyCart)).toThrow('Cart is empty');
  });

  test('should calculate total discount correctly', async () => {
    // Create a properly typed cart with discounts
    const lineItem = cart.lineItems[0];
    if (!lineItem) {
      throw new Error('Test setup error: cart.lineItems[0] is undefined');
    }

    const cartWithDiscount: Cart = {
      ...cart,
      discountOnTotalPrice: {
        discountedAmount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 500,
          fractionDigits: 2,
        },
        includedDiscounts: [
          {
            discountedAmount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 500,
              fractionDigits: 2,
            },
            discount: {
              typeId: 'cart-discount',
              id: 'test-cart-discount-id',
            },
          },
        ],
      },
      lineItems: [
        {
          ...lineItem,
          price: {
            ...lineItem.price,
            value: {
              ...lineItem.price.value,
              centAmount: 3198,
            },
            discounted: {
              value: {
                ...lineItem.price.value,
                centAmount: 2599,
              },
              discount: {
                id: 'test-discount-id',
                typeId: 'product-discount',
              },
            },
          },
        },
      ],
    };

    const payload = transformCommercetoolsCartToIngridPayload(cartWithDiscount);
    expect(payload.cart.total_discount).toEqual(1099); // 500 (cart discount) + 599 (line item discount)
  });

  test('transformCommercetoolsLineItemToIngridCartItemWithProductDimension', async () => {
    const lineItem = cart.lineItems[0];
    if (!lineItem) {
      throw new Error('Test setup error: cart.lineItems[0] is undefined');
    }
    const cartWithLineItemCustomFields: Cart = {
      ...cart,
      lineItems: [
        {
          ...lineItem,
          variant: {
            ...lineItem.variant,
            attributes: [
              { name: 'height', value: 10 },
              { name: 'width', value: 20 },
              { name: 'length', value: 30 },
            ],
          },
        },
      ],
    };
    const result = transformCommercetoolsCartToIngridPayload(cartWithLineItemCustomFields);

    expect(result.cart.items[0].dimensions).toBeDefined();
    expect(result.cart.items[0].dimensions?.length).toStrictEqual(30);
    expect(result.cart.items[0].dimensions?.height).toStrictEqual(10);
    expect(result.cart.items[0].dimensions?.width).toStrictEqual(20);
  });

  test('transformCommercetoolsLineItemToIngridCartItemWithProductWeight', async () => {
    const lineItem = cart.lineItems[0];
    if (!lineItem) {
      throw new Error('Test setup error: cart.lineItems[0] is undefined');
    }
    const cartWithLineItemCustomFields: Cart = {
      ...cart,
      lineItems: [
        {
          ...lineItem,
          variant: {
            ...lineItem.variant,
            attributes: [{ name: 'weight', value: 10000 }],
          },
        },
      ],
    };
    const result = transformCommercetoolsCartToIngridPayload(cartWithLineItemCustomFields);

    expect(result.cart.items[0].weight).toBeDefined();
    expect(result.cart.items[0].weight).toStrictEqual(10000);
  });

  test('transformCommercetoolsLineItemToIngridCartItemWithCustomFields', async () => {
    const lineItem = cart.lineItems[0];
    if (!lineItem) {
      throw new Error('Test setup error: cart.lineItems[0] is undefined');
    }
    const cartWithLineItemCustomFields: Cart = {
      ...cart,
      lineItems: [
        {
          ...lineItem,
          custom: {
            type: {
              typeId: 'type',
              id: '678941e6-ffcd-42d6-815e-3eb6fe798a94',
            },
            fields: {
              blockedDeliveryCountries: 'UK',
              numberOfItemsInStock: 10,
              isOutOfStock: false,
              expectedDeliveryDate: '2023-10-01T00:00:00Z',
            },
          },
        },
      ],
    };
    const result = transformCommercetoolsCartToIngridPayload(cartWithLineItemCustomFields);

    expect(result.cart.items[0].attributes).toBeDefined();
    expect(result.cart.items[0].attributes?.length).toStrictEqual(4);
    expect(result.cart.items[0].attributes?.[0]).toStrictEqual('blockedDeliveryCountries=UK');
    expect(result.cart.items[0].attributes?.[1]).toStrictEqual('numberOfItemsInStock=10');
    expect(result.cart.items[0].attributes?.[2]).toStrictEqual('isOutOfStock=false');
    expect(result.cart.items[0].attributes?.[3]).toStrictEqual('expectedDeliveryDate=2023-10-01T00:00:00Z');
  });
});
