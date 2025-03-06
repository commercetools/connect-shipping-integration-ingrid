import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { getCartIdFromContext } from '../libs/fastify/context';
import { appLogger } from '../libs/logger';
import { CustomError } from '../libs/fastify/errors';
import { AbstractShippingService } from './abstract-shipping.service';
import {
  transformCommercetoolsCartToIngridPayload,
  transformIngridDeliveryGroupsToCommercetoolsDataTypes,
} from './helpers';
import { getConfig } from '../config';
import type { Cart } from '@commercetools/platform-sdk';
import type { InitSessionResponse, UpdateSessionResponse } from './types/ingrid-shipping.type';

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
    const ingridSessionCustomTypeKey = getConfig().keyOfIngridSessionCustomType;
    const customType = await this.commercetoolsClient.getCustomType(ingridSessionCustomTypeKey);

    if (!customType) {
      appLogger.error(
        `[ERROR]: Failed to get custom type on Ingrid session init with key "${ingridSessionCustomTypeKey}".`,
      );
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

    const updatedCart = await this.updateCartWithIngridSessionId(
      ctCart,
      ingridCheckoutSession.session.checkout_session_id,
      customType.id,
    );

    appLogger.info(`[SUCCESS]: Ingrid session with ID ${ingridSessionId} initiated.`);

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

    if (!ingridSessionId) {
      appLogger.error(
        `[ERROR]: Failed to update composable commerce platform, Ingrid session ID on cart with ID "${ctCart.id}" not found.`,
      );
      throw new CustomError({
        message: 'No Ingrid session id found on cart',
        code: 'NO_INGRID_SESSION_ID_FOUND',
        httpErrorStatus: 400,
      });
    }

    // get ingrid checkout session
    const ingridCheckoutSession = await this.ingridClient.getCheckoutSession(ingridSessionId);

    // check for presence of billing and delivery addresses
    const { billing_address, delivery_address } = ingridCheckoutSession.session.delivery_groups[0]?.addresses ?? {};
    if (!billing_address || !delivery_address) {
      appLogger.error(
        `[ERROR]: Failed to get billing and delivery addresses from Ingrid checkout session with ID "${ingridSessionId}", cart ID "${ctCart.id}".`,
      );
      throw new CustomError({
        message:
          "Failed to get billing and delivery addresses from Ingrid checkout session. It seems like the addresses weren't provided by the customer.",
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
        taxCategory: { key: getConfig().taxCategoryKey, typeId: 'tax-category' },
      },
    );

    appLogger.info(
      `[SUCCESS]: Composable commerce platform updated by change triggered in Ingrid platform, session ID "${ingridSessionId}", cart ID "${ctCart.id}".`,
    );

    return {
      data: {
        success: true,
        cartVersion: updatedCart.version,
        ingridSessionId: ingridSessionId,
      },
    };
  }

  /**
   * Updates the cart with the Ingrid session ID
   *
   * @param cartId - The ID of the cart to update
   * @param cartVersion - The version of the cart to update
   * @param ingridSessionId - The Ingrid session ID to set on the cart
   * @param customTypeId - The ID of the custom type to set on the cart
   *
   * @returns {Promise<Cart>} The updated cart
   */
  private async updateCartWithIngridSessionId(
    cart: Cart,
    ingridSessionId: string,
    customTypeId: string,
  ): Promise<Cart> {
    if (!cart.custom) {
      cart = await this.commercetoolsClient.setCartCustomType(cart.id, cart.version, customTypeId);
    }
    cart = await this.commercetoolsClient
      .setCartCustomField(cart.id, cart.version, 'ingridSessionId', ingridSessionId)
      .catch((error) => {
        appLogger.error(`[ERROR]: Failed to set IngridSessionId ${ingridSessionId} on cart ${cart.id}.`);
        throw new CustomError({
          message: error?.message,
          code: error.code,
          httpErrorStatus: error.statusCode,
          cause: error,
        });
      });
    appLogger.info(`[SUCCESS]: IngridSessionId ${ingridSessionId} is set on cart ${cart.id}.`);
    return cart;
  }
}
