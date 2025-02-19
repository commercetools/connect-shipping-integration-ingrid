import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { getCartIdFromContext } from '../libs/fastify/context';
import { CustomError } from '../libs/fastify/errors';
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
    const ingridSessionCustomTypeId = await this.commercetoolsClient.getIngridCustomTypeId('ingrid-session-id');

    if (!ingridSessionCustomTypeId) {
      throw new CustomError({
        message: 'No ingrid session custom type id found',
        code: 'NO_INGRID_SESSION_CUSTOM_TYPE_ID_FOUND',
        httpErrorStatus: 400,
      });
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

    return {
      data: {
        success: true,
        cartVersion: updatedCart.version,
        ingridHtml: ingridCheckoutSession.html_snippet,
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

    // get ingrid checkout session
    const ingridCheckoutSession = await this.ingridClient.getCheckoutSession(ingridSessionId);

    // check for presence of billing and delivery addresses
    const { billing_address, delivery_address } = ingridCheckoutSession.session.delivery_groups[0]?.addresses ?? {};
    if (!billing_address || !delivery_address) {
      throw new CustomError({
        message:
          "Failed to get billing and delivery addresses from ingrid checkout session. It seems like the addresses weren't provided by the customer.",
        code: 'FAILED_TO_GET_BILLING_OR_DELIVERY_ADDRESSES_FROM_INGRID_CHECKOUT_SESSION',
        httpErrorStatus: 400,
      });
    }

    // transform ingrid checkout session delivery groups to commercetools data types
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

    return {
      data: {
        success: true,
        cartVersion: updatedCart.version,
        ingridSessionId: ingridSessionId,
      },
    };
  }
}
