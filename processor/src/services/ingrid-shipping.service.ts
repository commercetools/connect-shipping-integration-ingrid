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
import { IngridUpdateSessionRequestPayload } from '../clients/ingrid/types/ingrid.client.type';

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
   * @returns {Promise<InitSessionResponse>} Returns the commercetools cart id, Ingrid session id and Ingrid checkout session html snippet
   */
  public async init(voucherCode?: string[]): Promise<InitSessionResponse> {
    appLogger.info(`init Ingrid session with voucherCode: ${voucherCode}`);
    const ingridSessionCustomTypeKey = getConfig().keyOfIngridSessionCustomType;
    const customType = await this.commercetoolsClient.getCustomType(ingridSessionCustomTypeKey);

    if (!customType) {
      appLogger.error(
        `[ERROR]: Failed to get custom type on Ingrid session init with key "${ingridSessionCustomTypeKey}".`,
      );
      throw new CustomError({
        message: 'No Ingrid session custom type id found',
        code: 'NO_INGRID_SESSION_CUSTOM_TYPE_ID_FOUND',
        httpErrorStatus: 400,
      });
    }

    const ctCart = await this.commercetoolsClient.getCartById(getCartIdFromContext());
    // const ingridSessionId = ctCart.custom?.fields?.ingridSessionId;
    const ingridCheckoutPayload = transformCommercetoolsCartToIngridPayload(ctCart, voucherCode);

    const ingridCheckoutSession = await this.ingridClient.createCheckoutSession(ingridCheckoutPayload);

    const updatedCart = await this.updateCartWithIngridSessionId(
      ctCart,
      ingridCheckoutSession.session.checkout_session_id,
      customType.id,
    );

    appLogger.info(`[SUCCESS]: Ingrid session with ID ${ingridCheckoutSession.session.checkout_session_id} initiated.`);

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
   * @returns {Promise<UpdateSessionResponse>} Returns the commercetools cart id and Ingrid session id
   */
  public async update(voucherCode?: string[]): Promise<UpdateSessionResponse> {
    const ingridTaxCategoryKey = getConfig().taxCategoryKey;

    // get commercetools cart
    const ctCart = await this.commercetoolsClient.getCartById(getCartIdFromContext());

    // get Ingrid session id
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

    // get Ingrid checkout session
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

    // transform Ingrid checkout session delivery groups to commercetools data types
    const { billingAddress, deliveryAddress, customShippingMethod, extMethodId } =
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
        taxCategory: { key: ingridTaxCategoryKey, typeId: 'tax-category' },
      },
      {
        name: 'ingridExtMethodId',
        value: extMethodId,
      },
    );

    if (!updatedCart.taxedPrice?.totalGross) {
      appLogger.error(
        `[ERROR]: Failed to get taxed price from cart ID "${ctCart.id}", shipping address has likely not been set on commercetools cart.`,
      );
      throw new CustomError({
        message:
          'Failed to get taxed price from commercetools cart. It seems like there is no shipping address set on commercetools cart.',
        code: 'FAILED_TO_GET_TAXED_PRICE_FROM_COMMERCETOOLS_CART',
        httpErrorStatus: 400,
      });
    }

    // check if price on Ingrid is same as total gross on commercetools cart
    // Ingrid uses the same format for prices as commercetools
    // example: 10000 = 100.00 [Currency Code]
    const { total_value: ingridTotalValue } = ingridCheckoutSession.session.cart;
    const { centAmount: commercetoolsTotalTaxedValue } = updatedCart.taxedPrice.totalGross;

    // if prices are not the same, update Ingrid checkout session
    if (ingridTotalValue !== commercetoolsTotalTaxedValue) {
      // we assume that the updated cart now has taxed prices
      const updatedIngridCheckoutSessionPayload: IngridUpdateSessionRequestPayload = {
        ...transformCommercetoolsCartToIngridPayload(updatedCart, voucherCode),
        checkout_session_id: ingridSessionId,
      };

      await this.ingridClient.updateCheckoutSession(updatedIngridCheckoutSessionPayload);
    }
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
