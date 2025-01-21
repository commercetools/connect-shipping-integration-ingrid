import { CommercetoolsApiClient } from '../clients/api.client';
import { IngridApiClient } from '../clients/ingrid.client';
import { CommercetoolsClient } from '../clients/types/api.client.type';
import { AbstractShippingService } from './abstract-shipping.service';

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
  public async init(): Promise<void> {
    const externalId = '123';
    const ingridCheckoutSession = await this.ingridClient.createCheckoutSession({
      external_id: externalId,
      cart: {
        items: [
          {
            id: '123',
            quantity: 1,
          },
        ],
        total_value: 0,
        total_discount: 0,
        cart_id: '123',
      },
      locales: ['en'],
      purchase_country: 'US',
      purchase_currency: 'USD',
    });
    console.log(ingridCheckoutSession);
  }

  /**
   * Update from Ingrid platform
   *
   * @remarks
   * Implementation to update composable commerce platform if update is triggered in Ingrid platform.
   *
   * @returns void
   */
  public async update(): Promise<void> {}

  /**
   * Complete Ingrid session
   *
   * @remarks
   * Implementation to complete Ingrid session.
   *
   * @returns void
   */
  public async complete(): Promise<void> {}
}
