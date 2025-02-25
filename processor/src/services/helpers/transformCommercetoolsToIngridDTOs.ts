import { Cart, LineItem } from '@commercetools/platform-sdk';
import {
  IngridCreateSessionRequestPayload,
  IngridCart,
  IngridCartItem,
} from '../../clients/ingrid/types/ingrid.client.type';
import { CustomError } from '../../libs/fastify/errors';

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
    total_value: ctCart.taxedPrice ? ctCart.taxedPrice.totalGross.centAmount : ctCart.totalPrice.centAmount, // use "taxedPrice.totalGross" because Ingrid accepts tax inclusive price.
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
    price: item.taxedPrice ? item.taxedPrice.totalGross.centAmount : item.price.value.centAmount, // use "taxedPrice.totalGross" because Ingrid accepts tax inclusive price.
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
  const totalProductDiscount = getTotalProductDiscount(lineItem);
  const totalLineItemsDiscount = getTotalLineItemDiscount(lineItem);
  return totalProductDiscount + totalLineItemsDiscount;
};

const getTotalProductDiscount = (lineItem: LineItem) => {
  const productDiscountPerItem =
    lineItem.price.value.centAmount - (lineItem.price.discounted?.value.centAmount ?? lineItem.price.value.centAmount);
  const totalProductDiscount = productDiscountPerItem * lineItem.quantity;
  return totalProductDiscount;
};

function getTotalLineItemDiscount(lineItem: LineItem) {
  if (lineItem.discountedPricePerQuantity && lineItem.discountedPricePerQuantity.length > 0) {
    const totalDiscountedPrice = lineItem.discountedPricePerQuantity.reduce((acc, item) => {
      return acc + item.discountedPrice.value.centAmount * item.quantity;
    }, 0);
    // The line item discount applies on the product-level discounted price, if it exists. Otherwise it applies on the line item original price.
    return (
      (lineItem.price.discounted?.value.centAmount ?? lineItem.price.value.centAmount) * lineItem.quantity -
      totalDiscountedPrice
    );
  }
  return 0;
}
