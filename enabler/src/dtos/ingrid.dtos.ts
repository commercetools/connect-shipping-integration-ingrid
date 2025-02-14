export type SummaryChangedMetaData = {
    total_value_changed: boolean;
    delivery_address_changed: boolean;
    billing_address_changed: boolean;

} 
export type DataChangedMetaData = {
    delivery_type_changed: boolean;
    external_method_id_changed: boolean;
    price_changed: boolean;
    search_address_changed: boolean;
    shipping_method_changed: boolean;
    initial_load: boolean;
    category_name_changed: boolean;
    pickup_location_changed: boolean;
} 