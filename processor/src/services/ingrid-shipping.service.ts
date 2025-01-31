import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import {
  IngridCompleteSessionResponse,
  IngridCreateSessionResponse,
  IngridGetSessionResponse,
  IngridUpdateSessionResponse,
} from '../clients/ingrid/types/ingrid.client.type';
import { AbstractShippingService } from './abstract-shipping.service';

const cart = {
  items: [
    {
      id: '123',
      name: 'Product 1',
      sku: '123',
      quantity: 1,
    },
    {
      id: '412',
      name: 'Product 2',
      sku: '412',
      quantity: 3,
    },
  ],
  total_value: 120,
  total_discount: 0,
  cart_id: '123',
};
export class IngridShippingService extends AbstractShippingService {
  constructor(commercetoolsClient: CommercetoolsApiClient, ingridClient: IngridApiClient) {
    super(commercetoolsClient, ingridClient);
  }

  /**
   * Init Ingrid session
   *
   * @remarks
   * Implementation to initialize session in Ingrid platform.
   *
   * @returns void
   */
  public async init(sessionId?: string): Promise<IngridCreateSessionResponse | IngridGetSessionResponse> {
    if (sessionId) {
      const ingridCheckoutSession = await this.ingridClient.getCheckoutSession(sessionId);
      return ingridCheckoutSession;
    } else {
      // TODO: check wether to create new ingrid session or update existing ingrid session
      const ingridCheckoutSession = await this.ingridClient.createCheckoutSession({
        external_id: '123', // TODO: get orderId from commercetools,
        cart: cart,
        locales: ['en-US'],
        purchase_country: 'US',
        purchase_currency: 'USD',
      });
      // TODO: update commercetools session with ingrid session
      return ingridCheckoutSession;
    }
  }

  /**
   * Update from Ingrid platform
   *
   * @remarks
   * Implementation to update composable commerce platform if update is triggered in Ingrid platform.
   *
   * @returns void
   */
  public async update(sessionId: string): Promise<IngridUpdateSessionResponse> {
    // TODO: check what to update and route to commercetools or ingrid or both
    const ingridCheckoutSession = await this.ingridClient.updateCheckoutSession({
      checkout_session_id: sessionId,
      external_id: '123', // TODO: get orderId from commercetools
      cart: cart,
      locales: ['en-US'],
      purchase_country: 'US',
      purchase_currency: 'USD',
    });
    return ingridCheckoutSession;
  }

  /**
   * Complete Ingrid session
   *
   * @remarks
   * Implementation to complete Ingrid session.
   *
   * @returns void
   */
  public async complete(sessionId: string): Promise<IngridCompleteSessionResponse> {
    const ingridCheckoutSession = await this.ingridClient.completeCheckoutSession({
      checkout_session_id: sessionId,
      external_id: '123', // TODO: get orderId from commercetools
      customer: {
        address_lines: ['Jakobsgatan 11'],
        city: 'Stockholm',
        country: 'SE',
        phone: '+46123456789',
        postal_code: '112 46',
        email: 'test@ingrid.com',
        apartment_number: '1',
        name: 'John Doe',
        street: 'Jakobsgatan',
        street_number: '11',
      },
    });
    return ingridCheckoutSession;
  }
}
