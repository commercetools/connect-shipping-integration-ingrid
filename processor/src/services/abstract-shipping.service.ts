import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { InitSessionResponse, UpdateSessionResponse } from './types/ingrid-shipping.type';

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
   * @returns {Promise<InitSessionResponse>}
   */
  abstract init(): Promise<InitSessionResponse>;

  /**
   * Update from Ingrid platform
   *
   * @remarks
   * Abstract method to update composable commerce platform if update is triggered in Ingrid platform
   *
   * @returns {Promise<UpdateSessionResponse>}
   */
  abstract update(): Promise<UpdateSessionResponse>;
}
