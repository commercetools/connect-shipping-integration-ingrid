import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { getCartIdFromContext } from '../libs/fastify/context';
import { AbstractShippingService } from './abstract-shipping.service';
import { InitSessionResponse, UpdateSessionResponse } from './types/ingrid-shipping.type';
import {
  transformCartToIngridPayload,
  transformIngridDeliveryGroupToCommercetoolsAddress,
  transformIngridDeliveryGroupToCommercetoolsShippingMethod,
} from './helpers';

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
   * @returns {Promise<InitSessionResponse>}
   */
  public async init(): Promise<InitSessionResponse> {
    const ingridSessionCustomTypeId = await this.commercetoolsClient.getIngridCustomTypeId();

    if (!ingridSessionCustomTypeId) {
      throw new Error('Ingrid custom type does not exist and could not be created');
    }

    const ctCart = await this.commercetoolsClient.getCartById(getCartIdFromContext());
    const ingridSessionId = ctCart.custom?.fields?.ingridSessionId;
    const ingridCheckoutPayload = transformCartToIngridPayload(ctCart);
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
   * @returns {Promise<UpdateSessionResponse>}
   */
  public async update(): Promise<UpdateSessionResponse> {
    const timeToPull = 5 * 60 * 1000; // 5 minutes
    // verify cart version if an update has happened
    // get checkout session
    // check updated_at on ingrid checkout session
    // if checkout session updated_at is newer than cart.updated_at and not older than 5 minutes update cart
    // if checkout session updated_at is older than cart.updated_at, update checkout session and pull
    const ctCart = await this.commercetoolsClient.getCartById(getCartIdFromContext());
    const ingridSessionId = ctCart.custom?.fields?.ingridSessionId;
    const ingridCheckoutPayload = transformCartToIngridPayload(ctCart);
    const ingridCheckoutSession = await this.ingridClient.getCheckoutSession(ingridSessionId);
    /* this is about transferring address and delivery options to coco cart and transferring gross price to ingrid */
    // we have to first set the address and then the shipping method
    try {
      // TODO: Implement update cart with delivery information
      const { billingAddress, deliveryAddress } = transformIngridDeliveryGroupToCommercetoolsAddress(
        ingridCheckoutSession.session.delivery_groups[0]!,
      );
      await this.commercetoolsClient.setAddress(ctCart.id, ctCart.version, billingAddress, 'setBillingAddress');
      await this.commercetoolsClient.setAddress(ctCart.id, ctCart.version, deliveryAddress, 'setShippingAddress');
      const customShippingMethodPayload = transformIngridDeliveryGroupToCommercetoolsShippingMethod(
        ingridCheckoutSession.session.delivery_groups[0]!,
      );
      await this.commercetoolsClient.setShippingMethod(ctCart.id, ctCart.version, customShippingMethodPayload);
    } catch (err) {
      console.error('Error updating cart with Ingrid session ID', err);
    }

    return {
      data: {
        success: true,
        ingridSessionId: 'ingridCheckoutSession',
      },
    };
  }
}
