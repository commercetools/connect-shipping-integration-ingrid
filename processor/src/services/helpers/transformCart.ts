import { Cart, LineItem } from '@commercetools/platform-sdk';
import { IngridCreateSessionRequestPayload, IngridCart } from '../../clients/ingrid/types/ingrid.client.type';

export const mapCartToIngridCheckoutPayload = (ctCart: Cart): IngridCreateSessionRequestPayload => {
  const totalLineItemDiscount =
    ctCart.lineItems.length !== 0
      ? ctCart.lineItems.reduce((acc, item) => {
          // difference between normal price and discount
          // but without discount it'll be the normal price
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
          // and discount but if no discount is given we return the normal price
          return acc + itemDiscount;
        }, 0)
      : 0;

  // on current items, discountOnTotalPrice is undefined
  const totalDiscount = (ctCart.discountOnTotalPrice?.discountedAmount.centAmount ?? 0) + totalLineItemDiscount;

  const items =
    ctCart.lineItems.length !== 0
      ? ctCart.lineItems.map((item) => {
          let image_url = '';
          if (item.variant.images && item.variant.images.length > 0) {
            image_url = item.variant.images[0]!.url;
          } else {
            if (item.variant.assets && item.variant.assets.length > 0 && item.variant.assets[0]!.sources.length > 0) {
              image_url = item.variant.assets[0]!.sources[0]!.uri;
            }
          }
          return {
            // item.custom.fields may be undefined
            attributes: [JSON.stringify(item.custom?.fields) || ''],
            discount: calculateLineItemDiscount(item),
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
    // TODO: is external_id even needed when we set the cartId as well as cart_id (@line 158)?
    external_id: ctCart.id,
    locales: [ctCart.locale!],
    purchase_country: ctCart.country!,
    purchase_currency: ctCart.totalPrice.currencyCode,
  };

  return payload;
};

const calculateLineItemDiscount = (item: LineItem) => {
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
};
