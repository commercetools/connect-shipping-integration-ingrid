import { describe, test, jest, beforeEach, expect } from '@jest/globals';
import { cart, cartWithShippingAddress } from '../../mock/mock-cart';
import { transformCommercetoolsCartToIngridPayload } from '../../../src/services/helpers/transformCommercetoolsToIngridDTOs';

describe('transformCommercetoolsToIngridDTOs', () => {
  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  test('transform cart without shipping address successfuly', async () => {
    const payload = transformCommercetoolsCartToIngridPayload(cart);
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
  });

  test('transform cart with shipping address successfuly', async () => {
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
  });
});
