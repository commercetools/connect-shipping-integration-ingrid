import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { IngridUpdateSessionResponse } from '../clients/ingrid/types/ingrid.client.type';
import { InitSessionResponse } from './types/ingrid-shipping.type';

export abstract class AbstractShippingService {
  protected commercetoolsClient: CommercetoolsApiClient;
  protected ingridClient: IngridApiClient;

  protected constructor(commercetoolsClient: CommercetoolsApiClient, ingridClient: IngridApiClient) {
    this.commercetoolsClient = commercetoolsClient;
    this.ingridClient = ingridClient;
  }

  /**
   * Init Ingrid session
   *
   * @remarks
   * Abstract method to initialize session in Ingrid platform
   *
   * @returns void
   */
  abstract init(): Promise<InitSessionResponse>;

  /**
   * Update from Ingrid platform
   *
   * @remarks
   * Abstract method to update composable commerce platform if update is triggered in Ingrid platform
   *
   * @returns void
   */
  abstract update(): Promise<InitSessionResponse>;
}
