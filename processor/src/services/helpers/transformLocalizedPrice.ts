import { ShippingRateDraft, BaseAddress } from '@commercetools/platform-sdk';
import { IngridDeliveryGroup } from '../../clients/ingrid/types/ingrid.client.type';

export const transformIngridDeliveryGroupToCommercetoolsShippingMethod = (
  ingridDeliveryGroup: IngridDeliveryGroup,
): { shippingMethodName: string; shippingRate: ShippingRateDraft } => {
  const payload = {
    shippingMethodName: ingridDeliveryGroup.category.name,
    shippingRate: {
      price: {
        currencyCode: ingridDeliveryGroup.pricing.currency,
        centAmount: ingridDeliveryGroup.pricing.net_price ?? ingridDeliveryGroup.pricing.price,
      },
    },
  };
  return payload;
};

export const transformIngridDeliveryGroupToCommercetoolsAddress = (
  ingridDeliveryGroup: IngridDeliveryGroup,
): {
  billingAddress: BaseAddress;
  deliveryAddress: BaseAddress;
} => {
  const billingAddress = {
    firstName: ingridDeliveryGroup.addresses.billing_address.first_name,
    lastName: ingridDeliveryGroup.addresses.billing_address.last_name,
    streetName: ingridDeliveryGroup.addresses.billing_address.street,
    streetNumber: ingridDeliveryGroup.addresses.billing_address.street_number,
    postalCode: ingridDeliveryGroup.addresses.billing_address.postal_code,
    city: ingridDeliveryGroup.addresses.billing_address.city,
    country: ingridDeliveryGroup.addresses.billing_address.country,
    phone: ingridDeliveryGroup.addresses.billing_address.phone,
    email: ingridDeliveryGroup.addresses.billing_address.email,
  };
  // TODO: how to proceed with ingrids name as there is no seperation between
  // first and last name nor a synonym / alternative on delivery address ?
  const deliveryAddress = {
    firstName: ingridDeliveryGroup.addresses.delivery_address.name,
    lastName: ingridDeliveryGroup.addresses.delivery_address.name,
    streetName: ingridDeliveryGroup.addresses.delivery_address.street,
    streetNumber: ingridDeliveryGroup.addresses.delivery_address.street_number,
    postalCode: ingridDeliveryGroup.addresses.delivery_address.postal_code,
    city: ingridDeliveryGroup.addresses.delivery_address.city,
    country: ingridDeliveryGroup.addresses.delivery_address.country,
  };
  return { billingAddress, deliveryAddress };
};
