import { CustomError } from '../../libs/fastify/errors';
import type { Cart, FieldContainer, LineItem } from '@commercetools/platform-sdk';
import type {
  IngridCart,
  IngridCartItem,
  IngridCreateSessionRequestPayload,
  IngridDeliveryAddress,
  IngridShippingDate,
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
export const transformCommercetoolsCartToIngridPayload = (
  ctCart: Cart,
  voucherCodes?: string[],
): IngridCreateSessionRequestPayload => {
  if (ctCart.lineItems.length === 0) {
    throw new CustomError({
      message: 'Cart is empty',
      code: 'CART_IS_EMPTY',
      httpErrorStatus: 400,
    });
  }

  const transformedCart = transformCommercetoolsCartToIngridCart(ctCart, voucherCodes);

  const payload: IngridCreateSessionRequestPayload = {
    cart: transformedCart,
    locales: [ctCart.locale!],
    purchase_country: ctCart.shippingAddress?.country ?? ctCart.country!,
    purchase_currency: ctCart.totalPrice.currencyCode,
  };

  if (ctCart.shippingAddress) {
    const deliveryAddress: IngridDeliveryAddress = {
      external_id: ctCart.shippingAddress.id ?? '',
      address_lines: [`${ctCart.shippingAddress.streetName ?? ''} ${ctCart.shippingAddress.streetNumber ?? ''}`],
      apartment_number: ctCart.shippingAddress.apartment ?? '',
      city: ctCart.shippingAddress.city ?? '',
      country: ctCart.shippingAddress.country ?? '',
      first_name: ctCart.shippingAddress.firstName ?? '',
      last_name: ctCart.shippingAddress.lastName ?? '',
      street: ctCart.shippingAddress.streetName ?? '',
      street_number: ctCart.shippingAddress.streetNumber ?? '',
      postal_code: ctCart.shippingAddress.postalCode ?? '',
      region: ctCart.shippingAddress.region ?? undefined,
      phone: ctCart.shippingAddress.phone ?? '',
      email: ctCart.shippingAddress.email ?? '',
      company_name: ctCart.shippingAddress.company,
    };

    payload.prefill_delivery_address = deliveryAddress;
  }
  return payload;
};

/**
 * Convert commercetools cart to ingrid cart
 *
 * @param {Cart} ctCart - commercetools cart
 *
 * @returns {IngridCart} ingrid cart
 */
const transformCommercetoolsCartToIngridCart = (ctCart: Cart, voucherCodes?: string[]): IngridCart => {
  const totalLineItemsDiscount = calculateTotalLineItemsDiscount(ctCart.lineItems);

  // on current items, discountOnTotalPrice is undefined
  const totalDiscount = (ctCart.discountOnTotalPrice?.discountedAmount.centAmount ?? 0) + totalLineItemsDiscount;

  const lineItems = transformCommercetoolsLineItemsToIngridCartItems(ctCart.lineItems, ctCart.locale!);
  const ingridCart: IngridCart = {
    total_value: deductShippingCostFromCartTotalPrice(ctCart),
    total_discount: totalDiscount,
    items: lineItems,
    cart_id: ctCart.id,
    attributes: transformCommercetoolsCustomFieldsToIngridCustomFields(ctCart.custom?.fields ?? {}),
  };
  if (voucherCodes && voucherCodes.length > 0) {
    ingridCart.vouchers = voucherCodes;
  }
  return ingridCart;
};

const deductShippingCostFromCartTotalPrice = (ctCart: Cart): number => {
  const shippingCost = ctCart.shippingInfo?.price.centAmount ?? 0;
  const totalCartPrice = ctCart.taxedPrice?.totalGross.centAmount ?? ctCart.totalPrice.centAmount; // use "taxedPrice.totalGross" because Ingrid accepts tax inclusive price.
  return totalCartPrice - shippingCost;
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

  const weight = item.variant.attributes?.find((attr) => attr.name.toLocaleLowerCase() === 'weight')?.value;
  const height = item.variant.attributes?.find((attr) => attr.name.toLocaleLowerCase() === 'height')?.value;
  const width = item.variant.attributes?.find((attr) => attr.name.toLocaleLowerCase() === 'width')?.value;
  const length = item.variant.attributes?.find((attr) => attr.name.toLocaleLowerCase() === 'length')?.value;
  const shippingDate: IngridShippingDate | undefined = transformCommercetoolsHandlingTimeToShippingDate(
    item.id,
    item.custom?.fields ?? {},
  ); // item.custom.fields may be undefined
  const ingridCartItem: IngridCartItem = {
    attributes: transformCommercetoolsCustomFieldsToIngridCustomFields(item.custom?.fields ?? {}), // item.custom.fields may be undefined
    discount: lineItemDiscount,
    image_url: imageUrl,
    name: item.name[locale]!,
    shipping_date: shippingDate,
    price: item.taxedPrice?.totalGross.centAmount ?? item.price.value.centAmount, // use "taxedPrice.totalGross" because Ingrid accepts tax inclusive price.
    quantity: item.quantity,
    sku: item.variant.sku!,
    weight,
    dimensions: {
      height,
      width,
      length,
    },
  };

  return ingridCartItem;
};

/**
 * Transform commercetools custom fields to ingrid custom fields
 *
 * @param {FieldContainer} fields - commercetools field container
 *
 * @returns {string[]} array of string consists of key=value pairs
 */
const transformCommercetoolsCustomFieldsToIngridCustomFields = (fields: FieldContainer): string[] => {
  const result = Object.entries(fields).map(([key, value]) => `${key}=${value}`);
  return result;
};

/**
 * Transform handling time stored inside commercetools line item custom fields to ingrid shipping date
 *
 * @param {FieldContainer} fields - commercetools field container
 *
 * @returns {IngridShippingDate|undefined} ingrid shipping date or undefined if handling time is not found in commercetools line item custom fields
 */
const transformCommercetoolsHandlingTimeToShippingDate = (
  lineItemId: string,
  fields: FieldContainer,
): IngridShippingDate | undefined => {
  const numberOfHandlingDays = Object.entries(fields)
    .filter(([key, _value]) => key.toLowerCase() === 'handlingtime')
    .map(([_, value]) => value)[0]; // numberOfHandlingDays would be undefined if not found

  if (!numberOfHandlingDays || isNaN(Number(numberOfHandlingDays)) || Number(numberOfHandlingDays) < 0) {
    throw new CustomError({
      message: `Handling time is not found in line item ${lineItemId} custom fields`,
      code: 'HANDLING_TIME_NOT_FOUND',
      httpErrorStatus: 400,
    });
  }

  const shippingDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * Number(numberOfHandlingDays));
  const shippingDateStartTime = new Date(shippingDate.setHours(0, 0, 0, 0)); // Set to start of the day
  const shippingDateEndTime = new Date(shippingDate.setHours(23, 59, 59, 999)); // Set to end of the day

  const ingridShippingDate: IngridShippingDate = {
    end: shippingDateEndTime.toISOString(),
    start: shippingDateStartTime.toISOString(),
  };
  return ingridShippingDate;
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
  // difference between normal price and discount, will be 0 if no discount is set
  const totalDiscountOnProduct =
    (lineItem.price.value.centAmount -
      (lineItem.price.discounted?.value.centAmount ?? lineItem.price.value.centAmount)) *
    lineItem.quantity;

  let totalDiscountOnLineItem = 0;
  if (lineItem.discountedPricePerQuantity && lineItem.discountedPricePerQuantity.length > 0) {
    const totalDiscountedPrice = lineItem.discountedPricePerQuantity.reduce((acc, item) => {
      return acc + item.discountedPrice.value.centAmount * item.quantity;
    }, 0);
    totalDiscountOnLineItem =
      (lineItem.price.discounted?.value.centAmount ?? lineItem.price.value.centAmount) * lineItem.quantity -
      totalDiscountedPrice;
  }

  return totalDiscountOnProduct + totalDiscountOnLineItem;
};
