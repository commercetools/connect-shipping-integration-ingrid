import { CommercetoolsApiClient } from '../clients/commercetools/api.client';

export abstract class AbstractShippingService {
  protected commercetoolsApiClient: CommercetoolsApiClient;

  protected constructor(commercetoolsApiClient: CommercetoolsApiClient) {
    this.commercetoolsApiClient = commercetoolsApiClient;
  }

  /**
   * Init Ingrid session
   *
   * @remarks
   * Abstract method to initialize session in Ingrid platform
   *
   * @returns void
   */
  abstract init(): Promise<void>;

  /**
   * Update from Ingrid platform
   *
   * @remarks
   * Abstract method to update composable commerce platform if update is triggered in Ingrid platform
   *
   * @returns void
   */
  abstract update(): Promise<void>;

  /**
   * Complete Ingrid session
   *
   * @remarks
   * Abstract method to complete Ingrid session. The actual invocation should be implemented in subclasses
   *
   * @returns void
   */
  abstract complete(): Promise<void>;
}
