import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { getCartIdFromContext } from '../libs/fastify/context';
import { AbstractShippingService } from './abstract-shipping.service';
import { InitSessionResponse } from './types/ingrid-shipping.type';
import { mapCartToIngridCheckoutPayload } from './helpers/transformCart';

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
  public async init(): Promise<InitSessionResponse> {
    const ingridSessionCustomTypeId = await this.commercetoolsClient.getIngridCustomTypeId();

    if (!ingridSessionCustomTypeId) {
      throw new Error('Ingrid custom type does not exist and could not be created');
    }

    const ctCart = await this.commercetoolsClient.getCartById(getCartIdFromContext());
    const ingridSessionId = ctCart.custom?.fields?.ingridSessionId;
    const ingridCheckoutPayload = mapCartToIngridCheckoutPayload(ctCart);
    const ingridCheckoutSession = ingridSessionId
      ? await this.ingridClient.getCheckoutSession(ingridSessionId)
      : await this.ingridClient.createCheckoutSession(ingridCheckoutPayload);

    try {
      await this.commercetoolsClient.updateCartWithIngridSessionId(
        ctCart.id,
        ctCart.version,
        ingridCheckoutSession.session.checkout_session_id,
        ingridSessionCustomTypeId,
      );
    } catch (err) {
      console.error('Error updating cart with Ingrid session ID', err);
    }

    return {
      data: {
        success: true,
        html: ingridCheckoutSession.html_snippet,
        ingridSessionId: ingridCheckoutSession.session.checkout_session_id,
      },
    };
  }

  /**
   * Update from Ingrid platform
   *
   * @remarks
   * Implementation to update composable commerce platform if update is triggered in Ingrid platform.
   *
   * @returns void
   */
  public async update(): Promise<InitSessionResponse> {
    return {
      data: {
        success: true,
        html: 'ingridCheckoutSession',
        ingridSessionId: 'ingridCheckoutSession',
      },
    };
  }
}
