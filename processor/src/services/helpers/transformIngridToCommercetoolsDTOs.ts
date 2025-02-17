import { ShippingRateDraft, BaseAddress } from '@commercetools/platform-sdk';
import {
  IngridBillingAddress,
  IngridDeliveryAddress,
  IngridDeliveryGroup,
} from '../../clients/ingrid/types/ingrid.client.type';

type CustomShippingMethod = {
  shippingMethodName: string;
  shippingRate: ShippingRateDraft;
};

/**
 * Transform Ingrid delivery groups to Commercetools data types
 *
 * @param {IngridDeliveryGroup[]} ingridDeliveryGroups - Array of Ingrid delivery groups
 * @returns {Object} Object containing billing address, delivery address and custom shipping method
 * @returns {BaseAddress} returns.billingAddress - Commercetools billing address
 * @returns {BaseAddress} returns.deliveryAddress - Commercetools delivery address
 * @returns {CustomShippingMethod} returns.customShippingMethod - Custom shipping method with name and rate
 * @throws {Error} When no delivery groups are found
 * @throws {Error} When multiple delivery groups are provided (not yet supported)
 */
export const transformIngridDeliveryGroupsToCommercetoolsDataTypes = (
  ingridDeliveryGroups: IngridDeliveryGroup[],
): {
  billingAddress: BaseAddress;
  deliveryAddress: BaseAddress;
  customShippingMethod: CustomShippingMethod;
} => {
  if (ingridDeliveryGroups.length === 0) {
    throw new Error('No delivery groups found');
  }
  if (ingridDeliveryGroups.length > 1) {
    throw new Error("We don't support multiple delivery groups yet");
  }
  const ingridDeliveryGroup = ingridDeliveryGroups[0]!;
  const billingAddress = getBillingAddress(ingridDeliveryGroup.addresses.billing_address);
  const deliveryAddress = getDeliveryAddress(ingridDeliveryGroup.addresses.delivery_address);
  const customShippingMethod = transformIngridDeliveryGroupToCustomShippingMethod(ingridDeliveryGroup);
  return { billingAddress, deliveryAddress, customShippingMethod };
};

/**
 * Get billing address
 *
 * @param address - Ingrid billing address
 * @returns {BaseAddress}
 */
const getBillingAddress = (address: IngridBillingAddress): BaseAddress => {
  return transformIngridAddressToCommercetoolsAddress(address);
};

/**
 * Get delivery address
 *
 * @param address - Ingrid delivery address
 * @returns {BaseAddress}
 */
const getDeliveryAddress = (address: IngridDeliveryAddress): BaseAddress => {
  return transformIngridAddressToCommercetoolsAddress(address);
};

/**
 * Convert ingrid address to commercetools base address
 *
 * @param address - Ingrid billing or delivery address
 * @returns {BaseAddress}
 */
const transformIngridAddressToCommercetoolsAddress = (
  address: IngridBillingAddress | IngridDeliveryAddress,
): BaseAddress => {
  return {
    firstName: address.first_name,
    lastName: address.last_name,
    streetName: address.street,
    streetNumber: address.street_number,
    postalCode: address.postal_code,
    city: address.city,
    country: address.country,
    phone: address.phone,
    email: address.email,
  };
};

/**
 * Transform ingrid delivery group to custom shipping method
 *
 * @param ingridDeliveryGroup - Ingrid delivery group
 * @returns {CustomShippingMethod}
 */
const transformIngridDeliveryGroupToCustomShippingMethod = (
  ingridDeliveryGroup: IngridDeliveryGroup,
): CustomShippingMethod => {
  const customShippingMethod = {
    shippingMethodName: ingridDeliveryGroup.category.name,
    shippingRate: {
      price: {
        currencyCode: ingridDeliveryGroup.pricing.currency,
        centAmount: ingridDeliveryGroup.pricing.net_price ?? ingridDeliveryGroup.pricing.price,
      },
    },
  };
  return customShippingMethod;
};
