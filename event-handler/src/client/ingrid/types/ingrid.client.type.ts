export enum IngridBasePath {
  STAGING = 'https://api-stage.ingrid.com',
  PRODUCTION = 'https://api.ingrid.com',
}

export type IngridEnvironment = 'STAGING' | 'PRODUCTION';

export enum IngridUrls {
  DELIVERY_CHECKOUT = '/v1/delivery_checkout',
}

export type IngridGetSessionResponse = {
  session: IngridSession;
  html_snippet: string;
};

export type IngridCreateSessionRequestPayload = {
  additional_information?: unknown;
  cart: IngridCart;
  external_id?: string;
  locales: string[];
  meta?: Record<string, unknown>;
  prefill_delivery_address?: IngridAddress;
  purchase_country: string;
  purchase_currency: string;
  search_address?: IngridAddress;
};

export type IngridCreateSessionResponse = {
  html_snippet: string;
  session: IngridSession;
  token: string;
};

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

export type IngridSession = {
  checkout_session_id: string;
  status: string;
  updated_at: string;
  cart: IngridCart;
  delivery_groups: IngridDeliveryGroup[];
  purchase_country: string;
};

export type IngridAddresses = {
  billing_address: IngridBillingAddress;
  customer: IngridCustomerAddress;
  delivery_address: IngridAddress;
  location: IngridPickupLocation;
  search_address: IngridAddress;
};

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

export type IngridDeliveryGroupDeliveryTime = {
  carrier_delivery_promise: IngridDeliveryGroupDeliveryTimeRange;
  customer_delivery_promise: IngridDeliveryGroupDeliveryTimeRange;
  pickup_from_merchant: IngridDeliveryGroupDeliveryTimeRange;
};

export type IngridDeliveryGroupDeliveryTimeRange = {
  earliest: string;
  latest: string;
};

export type IngridDeliveryGroupItem = {
  quantity: number;
  shipping_date: IngridShippingDate;
  site_external_id: string;
  sku: string;
};

export type IngridDeliveryGroupPricing = {
  currency: string;
  net_price?: number;
  price: number;
  price_components: IngridPriceComponent[];
};

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

export type IngridTag = {
  name: string;
};

export type IngridShippingDate = {
  category_tags: IngridShippingDateTag[];
  end: string;
  start: string;
};

export type IngridShippingDateTag = {
  name: string;
  shipping_date: IngridDateTimeRange;
};

export type IngridDateTimeRange = {
  start: string;
  end: string;
};

export type IngridPriceComponent = {
  id: string;
  type: string;
  value: number;
  vat?: number;
  vat_rate?: number;
};

export type IngridCarrierAddon = {
  code: string;
  description: string;
  name: string;
};

export type IngridDeliveryGroupDeliveryAddon = {
  external_addon_id: string;
  id: string;
};

export type IngridRoute = {
  shipping_legs: IngridShippingLeg[];
};

export type IngridShippingLeg = {
  delivery_type: string;
  from: IngridLegLocation;
  shipping_method: string;
  to: IngridLegLocation;
};

export type IngridLegLocation = {
  address?: IngridAddress;
  external_id: string;
  location_type: string;
};

export type IngridSupports = {
  courier_instructions: boolean;
  customer_number: boolean;
  door_code: boolean;
  search: boolean;
};

export type IngridDeliveryGroupWarehouse = {
  address: IngridAddress;
};

export type IngridCart = {
  total_value: number;
  total_discount: number;
  items: unknown[];
  cart_id: string;
  groups?: unknown[];
};

export type IngridDeliveryGroupSelection = {
  auto_selected: boolean;
  selected_by: string;
  selected_by_type: string;
};

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

export type IngridCoordinates = {
  lat: number;
  lng: number;
};

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

export type IngridPickupLocationType =
  | 'UNKNOWN_PICKUP_LOCATION_TYPE'
  | 'LOCKER'
  | 'STORE'
  | 'POSTOFFICE'
  | 'MANNED';

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

export type IngridDistance = {
  driving?: IngridDistanceSpec;
  walking?: IngridDistanceSpec;
};

export type IngridDistanceSpec = {
  duration: number;
  value: number;
};

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

export type IngridSection = {
  columns: IngridSectionColumnItem[];
  name: string;
};

export type IngridSectionColumnItem = {
  items: IngridSectionItem[];
};

export type IngridSectionItem = {
  icon: string;
  link: string;
  text: string;
};

export type IngridPriceComponentType = 'SHIPPING' | 'ADDON';

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

export type IngridUpdateSessionResponse = {
  html_snippet: string;
  session: IngridSession;
};

export type IngridCompleteSessionRequestPayload = {
  checkout_session_id: string;
  customer?: IngridCustomerAddress;
  external_id?: string;
};

export type IngridCompleteSessionResponse = {
  session: IngridSession;
};

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
