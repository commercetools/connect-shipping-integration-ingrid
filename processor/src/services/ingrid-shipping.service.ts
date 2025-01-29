import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { Cart } from '@commercetools/connect-payments-sdk';
import { getCartIdFromContext } from '../libs/fastify/context/context';
import { AbstractShippingService } from './abstract-shipping.service';
import {
  IngridUpdateSessionResponse,
  IngridCreateSessionRequestPayload,
  IngridCart,
} from '../clients/ingrid/types/ingrid.client.type';
import { InitSessionResponse } from './types/ingrid-shipping.type';

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
    // get cart from commercetools
    // check if ingrid session id is present
    // - does custom type exist?
    const ingridSessionCustomTypeId = await this.checkIfIngridCustomTypeExists();

    if (!ingridSessionCustomTypeId) {
      throw new Error('Ingrid custom type does not exist and could not be created');
    }

    const ctCart = await this.commercetoolsClient.getCartById(getCartIdFromContext());
    const ingridSessionId = ctCart.custom?.fields?.ingridSessionId;
    const ingridCheckoutPayload = this.mapCartToIngridCheckoutPayload(ctCart);
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
        ingrid_session_id: ingridCheckoutSession.session.checkout_session_id,
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
        ingrid_session_id: 'ingridCheckoutSession',
      },
    };
  }

  /*
   * checks if the type with key 'ingrid-session-id' exists and if not, creates it
   * returns the type id
   */
  public async checkIfIngridCustomTypeExists() {
    const client = this.commercetoolsClient.client.ctAPI.client;
    try {
      const response = await client.types().withKey({ key: 'ingrid-session-id' }).get().execute();
      const customType = response.body;
      return customType.id;
    } catch (error) {
      console.log('Ingrid custom type does not exist, creating it');
      try {
        let res = await client
          .types()
          .post({
            body: {
              key: 'ingrid-session-id',
              name: {
                en: 'Ingrid Session ID',
              },
              resourceTypeIds: ['order'],
              fieldDefinitions: [
                {
                  name: 'ingridSessionId',
                  label: {
                    en: 'Ingrid Session ID',
                  },
                  type: {
                    name: 'String',
                  },
                  required: false,
                },
              ],
            },
          })
          .execute();
        const curstomType = res.body;
        return curstomType.id;
      } catch (error) {
        console.error('Error creating Ingrid custom type', error);
      }
    }
  }

  public mapCartToIngridCheckoutPayload(ctCart: Cart): IngridCreateSessionRequestPayload {
    const lineItemDiscounts =
      ctCart.lineItems.length !== 0
        ? ctCart.lineItems.reduce((acc, item) => {
            const itemDiscount =
              item.quantity *
              (item.price.value.centAmount -
                (item.discountedPricePerQuantity[0]?.discountedPrice.value.centAmount ?? item.price.value.centAmount));
            return acc + itemDiscount;
          }, 0)
        : 0;

    const totalDiscount = (ctCart.discountOnTotalPrice?.discountedAmount.centAmount ?? 0) + lineItemDiscounts;

    const items =
      ctCart.lineItems.length !== 0
        ? ctCart.lineItems.map((item) => ({
            attributes: item.custom?.fields,
            discount:
              item.totalPrice.centAmount * item.quantity -
              item.discountedPricePerQuantity[0].discountedPrice.value.centAmount * item.quantity,
            image_url: item.variant.images![0].url || item.variant.assets![0].sources[0].uri,
            name: item.name[ctCart.locale!],
            price: item.price.value.centAmount,
            quantity: item.quantity,
            sku: item.variant.sku,
          }))
        : [];

    const transformedCart: IngridCart = {
      total_value: ctCart.totalPrice.centAmount,
      total_discount: totalDiscount,
      items: items,
      cart_id: ctCart.id,
    };

    const payload: IngridCreateSessionRequestPayload = {
      cart: transformedCart,
      external_id: ctCart.id,
      locales: [ctCart.locale!],
      purchase_country: ctCart.country!,
      purchase_currency: ctCart.totalPrice.currencyCode,
    };

    return payload;
  }
}
