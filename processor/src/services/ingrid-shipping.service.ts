import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { IngridApiClient } from '../clients/ingrid/ingrid.client';
import { getCartIdFromContext } from '../libs/fastify/context';
import { AbstractShippingService } from './abstract-shipping.service';
import { InitSessionResponse } from './types/ingrid-shipping.type';
import { mapCartToIngridCheckoutPayload } from './helpers/transformCart';
import { Cart, LineItem } from '@commercetools/platform-sdk';
import { IngridCart, IngridCreateSessionRequestPayload } from '../clients/ingrid/types/ingrid.client.type';

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
   * @returns {Promise<InitSessionResponse>}
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

  /*
   * checks if the type with key 'ingrid-session-id' exists and if not, creates it
   * returns the type id
   */
  public async checkIfIngridCustomTypeExists() {
    // TODO remove ts-ignore and fix
    // @ts-ignore
    const client = this.commercetoolsClient.client.ctAPI.client;
    try {
      const response = await client.types().withKey({ key: 'ingrid-session-id' }).get().execute();
      const customType = response.body;
      return customType.id;
    } catch (error) {
      console.error('Ingrid custom type does not exist, creating it', error);
      try {
        const res = await client
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
    const totalLineItemDiscount =
      ctCart.lineItems.length !== 0
        ? ctCart.lineItems.reduce((acc, item) => {
            // um wie viel reduziert aber bei nicht reduzierten, da normalpreis
            const itemDiscount =
              item.quantity * (item.price.value.centAmount - (item.price.discounted?.value.centAmount ?? 0));

            // on current items, discountedPricePerQuantity is empty
            const discountedPricePerQuantity =
              item.discountedPricePerQuantity.length > 0 &&
              item.discountedPricePerQuantity.reduce((acc, price) => acc + price.discountedPrice.value.centAmount, 0);

            // Hin : temporarily print it out to pass lint checking
            console.log(discountedPricePerQuantity);

            // TODO: How to proceed with discounts?
            // currently we are giving back the difference between normal price
            // and discount but if not discount is given we return the normal price
            return acc + itemDiscount;
          }, 0)
        : 0;

    // on current items, discountOnTotalPrice is undefined
    const totalDiscount = (ctCart.discountOnTotalPrice?.discountedAmount.centAmount ?? 0) + totalLineItemDiscount;

    const items =
      ctCart.lineItems.length !== 0
        ? ctCart.lineItems.map((item) => {
            let image_url: string = '';
            if (item.variant.images && item.variant.images?.length > 0) {
              image_url = item.variant.images[0]!.url;
            } else {
              if (item.variant.assets && item.variant.assets.length > 0 && item.variant.assets[0]!.sources.length > 0) {
                image_url = item.variant.assets[0]!.sources[0]!.uri;
              }
            }
            return {
              // item.custom.fields may be undefined
              attributes: [JSON.stringify(item.custom?.fields) || ''],
              discount: this.calculateLineItemDiscount(item),
              image_url,
              name: item.name[ctCart.locale!],
              price: item.price.value.centAmount,
              quantity: item.quantity,
              sku: item.variant.sku,
            };
          })
        : [];

    // TODO: How to include / map tax?
    const transformedCart: IngridCart = {
      total_value: ctCart.totalPrice.centAmount,
      total_discount: totalDiscount,
      items: items,
      cart_id: ctCart.id,
    };

    const payload: IngridCreateSessionRequestPayload = {
      cart: transformedCart,
      // TODO: external_id needed when we set the cartId as well (@line 158)
      external_id: ctCart.id,
      locales: [ctCart.locale!],
      purchase_country: ctCart.country!,
      purchase_currency: ctCart.totalPrice.currencyCode,
    };

    return payload;
  }

  private calculateLineItemDiscount(item: LineItem) {
    if (item.discountedPricePerQuantity.length === 0) {
      return 0;
    }
    try {
      return (
        item.totalPrice.centAmount * item.quantity -
        item.discountedPricePerQuantity[0]!.discountedPrice.value.centAmount * item.quantity
      );
    } catch (error) {
      console.error('Error calculating discount', error);
      return 0;
    }
  }
}
