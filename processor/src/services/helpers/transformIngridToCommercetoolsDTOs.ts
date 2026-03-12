import { CustomError } from '../../libs/fastify/errors';
import type { BaseAddress, ShippingRateDraft } from '@commercetools/platform-sdk';
import type {
  IngridBillingAddress,
  IngridDeliveryAddress,
  IngridDeliveryGroup,
} from '../../clients/ingrid/types/ingrid.client.type';
import { appLogger } from '../../libs/logger';

type CustomShippingMethod = {
  shippingMethodName: string;
  shippingRate: ShippingRateDraft;
};

export type MultipleDeliveryGroupPayload = {
  shippingKey: string;
  deliveryAddress: BaseAddress;
  customShippingMethod: CustomShippingMethod;
  extMethodId: string | undefined;
  pickupPointId: string | undefined;
  deliveryAddons: string | undefined;
  instaboxToken: string | undefined;
  groupId: string;
};

/**
 * Transform Ingrid delivery groups to Commercetools data types
 *
 * @param {IngridDeliveryGroup[]} ingridDeliveryGroups - Array of Ingrid delivery groups
 *
 * @returns {Object} Object containing billing address, delivery address and custom shipping method
 * @returns {BaseAddress} returns.billingAddress - Commercetools billing address
 * @returns {BaseAddress} returns.deliveryAddress - Commercetools delivery address
 * @returns {CustomShippingMethod} returns.customShippingMethod - Custom shipping method with name and rate
 *
 * @throws {CustomError} When no delivery groups are found
 * @throws {CustomError} When multiple delivery groups are provided (not yet supported)
 */
export const transformIngridDeliveryGroupsToCommercetoolsDataTypes = (
  ingridDeliveryGroups: IngridDeliveryGroup[],
): {
  billingAddress: BaseAddress;
  deliveryAddress: BaseAddress;
  customShippingMethod: CustomShippingMethod;
  extMethodId: string | undefined;
  pickupPointId: string | undefined;
  deliveryAddons: string | undefined;
  instaboxToken: string | undefined;
} => {
  if (ingridDeliveryGroups.length === 0) {
    throw new CustomError({
      message: 'No delivery groups found',
      code: 'NO_DELIVERY_GROUPS_FOUND',
      httpErrorStatus: 500,
    });
  }
  const ingridDeliveryGroup = ingridDeliveryGroups[0]!;
  const billingAddress = transformIngridAddressToCommercetoolsAddress(ingridDeliveryGroup.addresses.billing_address);
  const deliveryAddress = transformIngridAddressToCommercetoolsAddress(ingridDeliveryGroup.addresses.delivery_address);
  const customShippingMethod = transformIngridDeliveryGroupToCustomShippingMethod(ingridDeliveryGroup);
  const extMethodId = ingridDeliveryGroup.shipping.carrier_product_id;
  const pickupPointId = transformDependantFields(ingridDeliveryGroup);
  const deliveryAddons: string | undefined = transformDeliveryAddons(ingridDeliveryGroup);
  const instaboxToken = (ingridDeliveryGroup.shipping.meta?.['isb.availability_token'] as string) ?? undefined;
  return {
    billingAddress,
    deliveryAddress,
    customShippingMethod,
    extMethodId,
    pickupPointId,
    deliveryAddons,
    instaboxToken,
  };
};

/**
 * Convert ingrid address to commercetools base address
 *
 * @param address - Ingrid billing or delivery address
 *
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
    apartment: address.apartment_number,
    city: address.city,
    country: address.country,
    region: address.region,
    phone: address.phone,
    email: address.email,
  };
};

/**
 * Transform ingrid delivery group to custom shipping method
 *
 * @param ingridDeliveryGroup - Ingrid delivery group
 *
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

const transformDependantFields = (ingridDeliveryGroup: IngridDeliveryGroup): string | undefined => {
  const deliveryType = ingridDeliveryGroup.shipping.delivery_type;
  if (deliveryType === 'pickup' || deliveryType === 'instore') {
    return ingridDeliveryGroup.addresses.location?.external_id ?? undefined;
  }
  return undefined;
};

const transformDeliveryAddons = (ingridDeliveryGroup: IngridDeliveryGroup): string | undefined => {
  const ingridDeliveryAddons = ingridDeliveryGroup.shipping.delivery_addons;
  if (!ingridDeliveryAddons) return undefined;

  return ingridDeliveryAddons.map((addon) => JSON.stringify(addon)).join(',');
};

/**
 * Transform multiple Ingrid delivery groups to commercetools Multiple shipping mode payloads
 *
 * @param ingridDeliveryGroups - Array of Ingrid delivery groups (must have length > 1)
 *
 * @returns Object containing billing address and array of per-group shipping payloads
 */
export const transformMultipleDeliveryGroups = (
  ingridDeliveryGroups: IngridDeliveryGroup[],
): {
  billingAddress: BaseAddress;
  groups: MultipleDeliveryGroupPayload[];
} => {
  if (ingridDeliveryGroups.length === 0) {
    throw new CustomError({
      message: 'No delivery groups found',
      code: 'NO_DELIVERY_GROUPS_FOUND',
      httpErrorStatus: 500,
    });
  }

  const billingAddress = transformIngridAddressToCommercetoolsAddress(
    ingridDeliveryGroups[0]!.addresses.billing_address,
  );

  // Log warning if billing addresses differ across groups
  for (let i = 1; i < ingridDeliveryGroups.length; i++) {
    const groupBilling = ingridDeliveryGroups[i]!.addresses.billing_address;
    if (groupBilling.email !== ingridDeliveryGroups[0]!.addresses.billing_address.email) {
      appLogger.warn(
        `Billing address differs between delivery group 0 and ${i}. Using first group's billing address.`,
      );
    }
  }

  const groups: MultipleDeliveryGroupPayload[] = ingridDeliveryGroups.map((group) => ({
    shippingKey: `ingrid-${group.group_id}`,
    deliveryAddress: transformIngridAddressToCommercetoolsAddress(group.addresses.delivery_address),
    customShippingMethod: transformIngridDeliveryGroupToCustomShippingMethod(group),
    extMethodId: group.shipping.carrier_product_id,
    pickupPointId: transformDependantFields(group),
    deliveryAddons: transformDeliveryAddons(group),
    instaboxToken: (group.shipping.meta?.['isb.availability_token'] as string) ?? undefined,
    groupId: group.group_id,
  }));

  return { billingAddress, groups };
};
