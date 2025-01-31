import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import {
  IngridCompleteSessionResponse,
  IngridCreateSessionResponse,
  IngridGetSessionResponse,
  IngridUpdateSessionResponse,
} from '../clients/ingrid/types/ingrid.client.type';

export abstract class AbstractShippingService {
  protected commercetoolsApiClient: CommercetoolsApiClient;
  protected ingridClient: IngridApiClient;

  protected constructor(commercetoolsApiClient: CommercetoolsApiClient, ingridClient: IngridApiClient) {
    this.commercetoolsApiClient = commercetoolsApiClient;
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
  abstract init(sessionId?: string): Promise<IngridCreateSessionResponse | IngridGetSessionResponse>;

  /**
   * Update from Ingrid platform
   *
   * @remarks
   * Abstract method to update composable commerce platform if update is triggered in Ingrid platform
   *
   * @returns void
   */
  abstract update(sessionId: string): Promise<IngridUpdateSessionResponse>;

  /**
   * Complete Ingrid session
   *
   * @remarks
   * Abstract method to complete Ingrid session. The actual invocation should be implemented in subclasses
   *
   * @returns void
   */
  abstract complete(sessionId: string): Promise<IngridCompleteSessionResponse>;
}
