import { CustomError } from '../../libs/fastify/errors';
import type { Cart, LineItem } from '@commercetools/platform-sdk';
import type {
  IngridCreateSessionRequestPayload,
  IngridCart,
  IngridCartItem,
} from '../../clients/ingrid/types/ingrid.client.type';

/**
 * Transform commercetools cart to ingrid cart
 *
 * @param {Cart} ctCart - commercetools cart
 *
 * @returns {IngridCreateSessionRequestPayload} ingrid cart
 *
 * @throws {CustomError} When cart is empty
 */
export const transformCommercetoolsCartToIngridPayload = (ctCart: Cart): IngridCreateSessionRequestPayload => {
  if (ctCart.lineItems.length === 0) {
    throw new CustomError({
      message: 'Cart is empty',
      code: 'CART_IS_EMPTY',
      httpErrorStatus: 400,
    });
  }

  const transformedCart = transformCommercetoolsCartToIngridCart(ctCart);

  const payload: IngridCreateSessionRequestPayload = {
    cart: transformedCart,
    locales: [ctCart.locale!],
    purchase_country: ctCart.country!,
    purchase_currency: ctCart.totalPrice.currencyCode,
  };

  return payload;
};

/**
 * Convert commercetools cart to ingrid cart
 *
 * @param {Cart} ctCart - commercetools cart
 *
 * @returns {IngridCart} ingrid cart
 */
const transformCommercetoolsCartToIngridCart = (ctCart: Cart): IngridCart => {
  const totalLineItemsDiscount = calculateTotalLineItemsDiscount(ctCart.lineItems);

  // on current items, discountOnTotalPrice is undefined
  const totalDiscount = (ctCart.discountOnTotalPrice?.discountedAmount.centAmount ?? 0) + totalLineItemsDiscount;

  const lineItems = transformCommercetoolsLineItemsToIngridCartItems(ctCart.lineItems, ctCart.locale!);

  return {
    total_value: ctCart.totalPrice.centAmount,
    total_discount: totalDiscount,
    items: lineItems,
    cart_id: ctCart.id,
  };
};

/**
 * Convert commercetools line items to ingrid cart items
 *
 * @param {LineItem[]} items - commercetools line items
 * @param {string} locale - commercetools locale
 *
 * @returns {IngridCartItem[]} ingrid cart items
 */
const transformCommercetoolsLineItemsToIngridCartItems = (items: LineItem[], locale: string): IngridCartItem[] => {
  return items.map((item) => transformCommercetoolsLineItemToIngridCartItem(item, locale));
};

/**
 * Convert commercetools line item to ingrid cart item
 *
 * @param {LineItem} item - commercetools line item
 * @param {string} locale - commercetools locale
 *
 * @returns {IngridCartItem} ingrid cart item
 */
const transformCommercetoolsLineItemToIngridCartItem = (item: LineItem, locale: string): IngridCartItem => {
  const imageUrl = getImageUrl(item);
  const lineItemDiscount = calculateLineItemDiscount(item);

  return {
    // item.custom.fields may be undefined
    attributes: [JSON.stringify(item.custom?.fields) || ''],
    discount: lineItemDiscount,
    image_url: imageUrl,
    name: item.name[locale]!,
    price: item.price.value.centAmount,
    quantity: item.quantity,
    sku: item.variant.sku!,
  };
};

/**
 * Get image url
 *
 * @param {LineItem} item - commercetools line item
 *
 * @returns {string} image url or empty string if no image url is found
 */
const getImageUrl = (item: LineItem): string => {
  const image_url = item.variant.images?.[0]?.url || item.variant.assets?.[0]?.sources?.[0]?.uri;
  if (!image_url) {
    return '';
  }
  return image_url;
};

/**
 * Calculate total line item discount
 *
 * @param {LineItem[]} items - commercetools line items
 *
 * @returns {number} total line item discount
 */
const calculateTotalLineItemsDiscount = (items: LineItem[]): number => {
  return items.reduce((acc, item) => {
    return acc + calculateLineItemDiscount(item);
  }, 0);
};

/**
 * Calculate line item discount
 *
 * @param {LineItem} lineItem - commercetools line item
 *
 * @returns {number} line item discount
 */
const calculateLineItemDiscount = (lineItem: LineItem): number => {
  // TODO: when is price.discounted used and when is discountedPricePerQuantity used?

  // difference between normal price and discount, will be 0 if no discount is set
  const discount =
    lineItem.price.value.centAmount - (lineItem.price.discounted?.value.centAmount ?? lineItem.price.value.centAmount);

  // on current items, discountedPricePerQuantity is empty
  const discountedPrice = lineItem.discountedPricePerQuantity.reduce((acc, item) => {
    return acc + item.discountedPrice.value.centAmount * item.quantity;
  }, 0);

  return discount * lineItem.quantity + discountedPrice;
};
