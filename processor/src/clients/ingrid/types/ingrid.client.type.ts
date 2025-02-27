/**
 * Base paths for Ingrid API environments
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#BasePath}
 */
export enum IngridBasePath {
  STAGING = 'https://api-stage.ingrid.com',
  PRODUCTION = 'https://api.ingrid.com',
}

/**
 * Available Ingrid environments
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Environment}
 */
export type IngridEnvironment = 'STAGING' | 'PRODUCTION';

/**
 * Available Ingrid API endpoints
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Urls}
 */
export enum IngridUrls {
  DELIVERY_CHECKOUT = '/v1/delivery_checkout',
}

export interface IngridClientOptions {
  apiSecret: string;
  environment: IngridEnvironment;
}

/**
 * Response type for getting an Ingrid session
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#GetSessionResponse}
 */
export type IngridGetSessionResponse = {
  session: IngridSession;
  html_snippet: string;
};

/**
 * Payload for creating a new Ingrid session
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#CreateSessionRequestPayload}
 */
export type IngridCreateSessionRequestPayload = {
  additional_information?: unknown;
  cart: IngridCart;
  external_id?: string;
  locales: string[];
  meta?: Record<string, unknown>;
  prefill_delivery_address?: IngridDeliveryAddress;
  purchase_country: string;
  purchase_currency: string;
  search_address?: IngridAddress;
};

/**
 * Response type for creating an Ingrid session
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#CreateSessionResponse}
 */
export type IngridCreateSessionResponse = {
  html_snippet: string;
  session: IngridSession;
  token: string;
};

/**
 * Represents a delivery group in Ingrid
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroup}
 */
export type IngridDeliveryGroup = {
  addresses: IngridAddresses;
  category: IngridDeliveryGroupCategory;
  delivery_time: IngridDeliveryGroupDeliveryTime;
  external_id?: string;
  group_id: string;
  header: string;
  items: IngridDeliveryGroupItem[];
  pricing: IngridDeliveryGroupPricing;
  selection: IngridDeliveryGroupSelection;
  shipping: IngridDeliveryGroupShipping;
  tos_id: string;
};

/**
 * Represents an Ingrid session
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Session}
 */
export type IngridSession = {
  checkout_session_id: string;
  status: string;
  updated_at: string;
  cart: IngridCart;
  delivery_groups: IngridDeliveryGroup[];
  purchase_country: string;
};

/**
 * Collection of address types used in Ingrid
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Addresses}
 */
export type IngridAddresses = {
  billing_address: IngridBillingAddress;
  customer: IngridCustomerAddress;
  delivery_address: IngridDeliveryAddress;
  location: IngridPickupLocation;
  search_address: IngridAddress;
};

/**
 * Category information for a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupCategory}
 */
export type IngridDeliveryGroupCategory = {
  base_price: number;
  custom_text: string;
  custom_warning_text: string;
  external_id?: string;
  id: string;
  name: string;
  presented_category_name: string;
  tags: IngridTag[];
};

/**
 * Delivery time information for a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupDeliveryTime}
 */
export type IngridDeliveryGroupDeliveryTime = {
  carrier_delivery_promise: IngridDeliveryGroupDeliveryTimeRange;
  customer_delivery_promise: IngridDeliveryGroupDeliveryTimeRange;
  pickup_from_merchant: IngridDeliveryGroupDeliveryTimeRange;
};

/**
 * Time range for delivery promises
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupDeliveryTimeRange}
 */
export type IngridDeliveryGroupDeliveryTimeRange = {
  earliest: string;
  latest: string;
};

/**
 * Item in a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupItem}
 */
export type IngridDeliveryGroupItem = {
  quantity: number;
  shipping_date: IngridShippingDate;
  site_external_id: string;
  sku: string;
};

/**
 * Pricing information for a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupPricing}
 */
export type IngridDeliveryGroupPricing = {
  currency: string;
  net_price?: number;
  price: number;
  price_components: IngridPriceComponent[];
};

/**
 * Shipping information for a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupShipping}
 */
export type IngridDeliveryGroupShipping = {
  addons: IngridCarrierAddon[];
  carrier: string;
  carrier_product_id: string;
  delivery_addons: IngridDeliveryGroupDeliveryAddon[];
  delivery_type: string;
  meta: Record<string, unknown>;
  product: string;
  route: IngridRoute;
  supports: IngridSupports;
  warehouse: IngridDeliveryGroupWarehouse;
};

/**
 * Tag information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Tag}
 */
export type IngridTag = {
  name: string;
};

/**
 * Shipping date information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#ShippingDate}
 */
export type IngridShippingDate = {
  category_tags: IngridShippingDateTag[];
  end: string;
  start: string;
};

/**
 * Tag information for shipping dates
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#ShippingDateTag}
 */
export type IngridShippingDateTag = {
  name: string;
  shipping_date: IngridDateTimeRange;
};

/**
 * Date and time range
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DateTimeRange}
 */
export type IngridDateTimeRange = {
  start: string;
  end: string;
};

/**
 * Price component information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#PriceComponent}
 */
export type IngridPriceComponent = {
  id: string;
  type: string;
  value: number;
  vat?: number;
  vat_rate?: number;
};

/**
 * Carrier addon information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#CarrierAddon}
 */
export type IngridCarrierAddon = {
  code: string;
  description: string;
  name: string;
};

/**
 * Delivery addon information for a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupDeliveryAddon}
 */
export type IngridDeliveryGroupDeliveryAddon = {
  external_addon_id: string;
  id: string;
};

/**
 * Route information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Route}
 */
export type IngridRoute = {
  shipping_legs: IngridShippingLeg[];
};

/**
 * Shipping leg information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#ShippingLeg}
 */
export type IngridShippingLeg = {
  delivery_type: string;
  from: IngridLegLocation;
  shipping_method: string;
  to: IngridLegLocation;
};

/**
 * Location information for a shipping leg
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#LegLocation}
 */
export type IngridLegLocation = {
  address?: IngridAddress;
  external_id: string;
  location_type: string;
};

/**
 * Support features for a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Supports}
 */
export type IngridSupports = {
  courier_instructions: boolean;
  customer_number: boolean;
  door_code: boolean;
  search: boolean;
};

/**
 * Warehouse information for a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupWarehouse}
 */
export type IngridDeliveryGroupWarehouse = {
  address: IngridAddress;
};

/**
 * Cart information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Cart}
 */
export type IngridCart = {
  total_value: number;
  total_discount: number;
  items: IngridCartItem[];
  cart_id: string;
  groups?: unknown[];
};

/**
 * Cart item information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#CartItem}
 */
export type IngridCartItem = {
  attributes?: string[];
  dimensions?: IngridDimensions;
  discount: number;
  image_url?: string;
  name: string;
  out_of_stock?: boolean;
  price: number;
  quantity: number;
  shipping_date?: IngridShippingDate;
  site_external_id?: string;
  sku: string;
  weight?: number;
};

/**
 * Dimensions information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Dimensions}
 */
export type IngridDimensions = {
  height: number;
  length: number;
  width: number;
};

/**
 * Selection information for a delivery group
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryGroupSelection}
 */
export type IngridDeliveryGroupSelection = {
  auto_selected: boolean;
  selected_by: string;
  selected_by_type: string;
};

/**
 * Billing address information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#BillingAddress}
 */
export type IngridBillingAddress = {
  address_lines: string[];
  apartment_number: string;
  attn?: string;
  care_of?: string;
  city: string;
  company_name?: string;
  country: string;
  email: string;
  external_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_country?: string;
  postal_code: string;
  region?: string;
  street: string;
  street_number: string;
  vat?: string;
  vat_type?: string;
};

/**
 * Customer address information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#CustomerAddress}
 */
export type IngridCustomerAddress = {
  address_lines: string[];
  apartment_number: string;
  attn?: string;
  care_of?: string;
  city: string;
  coordinates?: IngridCoordinates;
  country: string;
  door_code?: string;
  email: string;
  name: string;
  phone: string;
  postal_code: string;
  region?: string;
  street: string;
  street_number: string;
};

/**
 * Coordinates information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Coordinates}
 */
export type IngridCoordinates = {
  lat: number;
  lng: number;
};

/**
 * Address information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Address}
 */
export type IngridAddress = {
  address_lines: string[];
  apartment_number: string;
  attn?: string;
  care_of?: string;
  city: string;
  coordinates?: IngridCoordinates;
  country: string;
  door_code?: string;
  floor_number?: string;
  name: string;
  postal_code: string;
  region?: string;
  street: string;
  street_number: string;
  subregion?: string;
};

/**
 * Pickup location type
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#PickupLocationType}
 */
export type IngridPickupLocationType = 'UNKNOWN_PICKUP_LOCATION_TYPE' | 'LOCKER' | 'STORE' | 'POSTOFFICE' | 'MANNED';

/**
 * Pickup location information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#PickupLocation}
 */
export type IngridPickupLocation = {
  address: IngridAddress;
  distance?: IngridDistance;
  external_id: string;
  location_type: IngridPickupLocationType;
  meta: Record<string, string>;
  name: string;
  operational_hours?: IngridOperationalHours;
  sections?: IngridSection[];
};

/**
 * Distance information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Distance}
 */
export type IngridDistance = {
  driving?: IngridDistanceSpec;
  walking?: IngridDistanceSpec;
};

/**
 * Distance specification
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DistanceSpec}
 */
export type IngridDistanceSpec = {
  duration: number;
  value: number;
};

/**
 * Operational hours information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#OperationalHours}
 */
export type IngridOperationalHours = {
  free_text?: string[];
  fri?: string;
  mon?: string;
  sat?: string;
  sun?: string;
  thu?: string;
  tue?: string;
  wed?: string;
};

/**
 * Section information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#Section}
 */
export type IngridSection = {
  columns: IngridSectionColumnItem[];
  name: string;
};

/**
 * Section column item information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#SectionColumnItem}
 */
export type IngridSectionColumnItem = {
  items: IngridSectionItem[];
};

/**
 * Section item information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#SectionItem}
 */
export type IngridSectionItem = {
  icon: string;
  link: string;
  text: string;
};

/**
 * Price component type
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#PriceComponentType}
 */
export type IngridPriceComponentType = 'SHIPPING' | 'ADDON';

/**
 * Payload for updating an Ingrid session
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#UpdateSessionRequestPayload}
 */
export type IngridUpdateSessionRequestPayload = {
  cart: IngridCart;
  checkout_session_id: string;
  external_id?: string;
  locales?: string[];
  meta?: Record<string, unknown>;
  prefill_delivery_address?: IngridDeliveryAddress;
  purchase_country: string;
  purchase_currency: string;
  search_address?: IngridSearchAddress;
};

/**
 * Response type for updating an Ingrid session
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#UpdateSessionResponse}
 */
export type IngridUpdateSessionResponse = {
  html_snippet: string;
  session: IngridSession;
};

/**
 * Payload for completing an Ingrid session
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#CompleteSessionRequestPayload}
 */
export type IngridCompleteSessionRequestPayload = {
  checkout_session_id: string;
  customer: IngridCustomerAddress;
  external_id?: string;
};

/**
 * Response type for completing an Ingrid session
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#CompleteSessionResponse}
 */
export type IngridCompleteSessionResponse = {
  session: IngridSession;
};

/**
 * Delivery address information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#DeliveryAddress}
 */
export type IngridDeliveryAddress = {
  address_lines: string[];
  apartment_number: string;
  attn?: string;
  care_of?: string;
  city: string;
  company_name?: string;
  coordinates?: IngridCoordinates;
  country: string;
  door_code?: string;
  email: string;
  external_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_country?: string;
  postal_code: string;
  region?: string;
  street: string;
  street_number: string;
};

/**
 * Search address information
 * @see {@link https://developer.ingrid.com/delivery_checkout/reference/#SearchAddress}
 */
export type IngridSearchAddress = {
  address_lines: string[];
  apartment_number: string;
  city: string;
  coordinates?: IngridCoordinates;
  country: string;
  postal_code: string;
  region?: string;
  street: string;
  street_number: string;
};
