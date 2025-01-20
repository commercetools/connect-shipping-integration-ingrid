import { CommercetoolsApiClient } from '../clients/api.client';
import { IngridApiClient } from '../clients/ingrid.client';
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
  public async init(): Promise<void> {}

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
