import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { getCartIdFromContext } from '../libs/fastify/context';
import { AbstractShippingService } from './abstract-shipping.service';
import {
  transformCommercetoolsCartToIngridPayload,
  transformIngridDeliveryGroupsToCommercetoolsDataTypes,
} from './helpers';
import { InitSessionResponse, UpdateSessionResponse } from './types/ingrid-shipping.type';

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
   * @returns {Promise<InitSessionResponse>} Returns the commercetools cart id, ingrid session id and ingrid checkout session html snippet
   */
  public async init(): Promise<InitSessionResponse> {
    const ingridSessionCustomTypeId = await this.commercetoolsClient.getIngridCustomTypeId();

    if (!ingridSessionCustomTypeId) {
      throw new Error('Ingrid custom type does not exist and could not be created');
    }

    const ctCart = await this.commercetoolsClient.getCartById(getCartIdFromContext());
    const ingridSessionId = ctCart.custom?.fields?.ingridSessionId;
    const ingridCheckoutPayload = transformCommercetoolsCartToIngridPayload(ctCart);

    const ingridCheckoutSession = ingridSessionId
      ? await this.ingridClient.getCheckoutSession(ingridSessionId)
      : await this.ingridClient.createCheckoutSession(ingridCheckoutPayload);

    const updatedCart = await this.commercetoolsClient.updateCartWithIngridSessionId(
      ctCart.id,
      ctCart.version,
      ingridCheckoutSession.session.checkout_session_id,
      ingridSessionCustomTypeId,
    );

    console.info('updatedCart', updatedCart);

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
   * @returns {Promise<UpdateSessionResponse>} Returns the commercetools cart id and ingrid session id
   */
  public async update(): Promise<UpdateSessionResponse> {
    // get commercetools cart
    const ctCart = await this.commercetoolsClient.getCartById(getCartIdFromContext());

    // get ingrid session id
    const ingridSessionId = ctCart.custom?.fields?.ingridSessionId;
    if (!ingridSessionId) {
      throw new Error(`No ingrid session id found for cart with ID: ${ctCart.id}`);
    }

    // get ingrid checkout session
    const ingridCheckoutSession = await this.ingridClient.getCheckoutSession(ingridSessionId);

    // transform ingrid checkout session to commercetools data types
    const { billingAddress, deliveryAddress, customShippingMethod } =
      transformIngridDeliveryGroupsToCommercetoolsDataTypes(ingridCheckoutSession.session.delivery_groups);

    const updatedCart = await this.commercetoolsClient.updateCartWithAddressAndShippingMethod(
      ctCart.id,
      ctCart.version,
      {
        billingAddress,
        shippingAddress: deliveryAddress,
      },
      {
        shippingMethodName: customShippingMethod.shippingMethodName,
        shippingRate: customShippingMethod.shippingRate,
        taxCategory: { key: 'standard-tax', typeId: 'tax-category' },
      },
    );

    console.info('updatedCart', updatedCart);

    // const timeToPull = 5 * 60 * 1000; // 5 minutes
    // verify cart version if an update has happened
    // get checkout session
    // check updated_at on ingrid checkout session
    // if checkout session updated_at is newer than cart.updated_at and not older than 5 minutes update cart
    // if checkout session updated_at is older than cart.updated_at, update checkout session and pull

    return {
      data: {
        success: true,
        ingridSessionId: ingridSessionId,
      },
    };
  }
}
