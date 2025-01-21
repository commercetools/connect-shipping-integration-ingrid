import { Static, Type } from '@sinclair/typebox';
import { Parse } from '@sinclair/typebox/syntax';
import { IngridCreateSessionResponse } from '../clients/types/ingrid.client.type';

export const InitSessionRequestSchema = Type.Object({
  sessionId: Type.String(),
});

/* export const InitSessionResponseSchema = Type.Object({
  html_snippet: Type.String(),
  session: Type.Object({
    checkout_session_id: Type.String(),
    status: Type.String(),
    updated_at: Type.String(),
    cart: Type.Object({
      total_value: Type.Number(),
      total_discount: Type.Number(),
      items: Type.Array(Type.Any()),
      cart_id: Type.String(),
      groups: Type.Optional(Type.Array(Type.Any())),
    }),
    delivery_groups: Type.Array(
      Type.Object({
        addresses: Type.Object({
          billing_address: Type.Object({
            address_lines: Type.Array(Type.String()),
            apartment_number: Type.String(),
            attn: Type.Optional(Type.String()),
            care_of: Type.Optional(Type.String()),
            city: Type.String(),
            company_name: Type.Optional(Type.String()),
            country: Type.String(),
            email: Type.String(),
            external_id: Type.String(),
            first_name: Type.String(),
            last_name: Type.String(),
            phone: Type.String(),
            phone_country: Type.Optional(Type.String()),
            postal_code: Type.String(),
            region: Type.Optional(Type.String()),
            street: Type.String(),
            street_number: Type.String(),
            vat: Type.Optional(Type.String()),
            vat_type: Type.Optional(Type.String()),
          }),
          customer: Type.Object({
            address_lines: Type.Array(Type.String()),
            apartment_number: Type.String(),
            attn: Type.Optional(Type.String()),
            care_of: Type.Optional(Type.String()),
            city: Type.String(),
            coordinates: Type.Optional(
              Type.Object({
                lat: Type.Number(),
                lng: Type.Number(),
              }),
            ),
            country: Type.String(),
            door_code: Type.Optional(Type.String()),
            email: Type.String(),
            name: Type.String(),
            phone: Type.String(),
            postal_code: Type.String(),
            region: Type.Optional(Type.String()),
            street: Type.String(),
            street_number: Type.String(),
          }),
          delivery_address: Type.Object({
            address_lines: Type.Array(Type.String()),
            apartment_number: Type.String(),
            attn: Type.Optional(Type.String()),
            care_of: Type.Optional(Type.String()),
            city: Type.String(),
            coordinates: Type.Optional(
              Type.Object({
                lat: Type.Number(),
                lng: Type.Number(),
              }),
            ),
            country: Type.String(),
            door_code: Type.Optional(Type.String()),
            floor_number: Type.Optional(Type.String()),
            name: Type.String(),
            postal_code: Type.String(),
            region: Type.Optional(Type.String()),
            street: Type.String(),
            street_number: Type.String(),
            subregion: Type.Optional(Type.String()),
          }),
          location: Type.Object({
            address: Type.Object({
              address_lines: Type.Array(Type.String()),
              apartment_number: Type.String(),
              city: Type.String(),
              country: Type.String(),
              name: Type.String(),
              postal_code: Type.String(),
              street: Type.String(),
              street_number: Type.String(),
            }),
            external_id: Type.String(),
            location_type: Type.String(),
            meta: Type.Record(Type.String(), Type.String()),
            name: Type.String(),
          }),
          search_address: Type.Object({
            address_lines: Type.Array(Type.String()),
            apartment_number: Type.String(),
            city: Type.String(),
            coordinates: Type.Optional(
              Type.Object({
                lat: Type.Number(),
                lng: Type.Number(),
              }),
            ),
            country: Type.String(),
            postal_code: Type.String(),
            region: Type.Optional(Type.String()),
            street: Type.String(),
            street_number: Type.String(),
          }),
        }),
        category: Type.Object({
          base_price: Type.Number(),
          custom_text: Type.String(),
          custom_warning_text: Type.String(),
          external_id: Type.Optional(Type.String()),
          id: Type.String(),
          name: Type.String(),
          presented_category_name: Type.String(),
          tags: Type.Array(
            Type.Object({
              name: Type.String(),
            }),
          ),
        }),
        delivery_time: Type.Object({
          carrier_delivery_promise: Type.Object({
            earliest: Type.String(),
            latest: Type.String(),
          }),
          customer_delivery_promise: Type.Object({
            earliest: Type.String(),
            latest: Type.String(),
          }),
          pickup_from_merchant: Type.Object({
            earliest: Type.String(),
            latest: Type.String(),
          }),
        }),
        external_id: Type.Optional(Type.String()),
        group_id: Type.String(),
        header: Type.String(),
        items: Type.Array(
          Type.Object({
            quantity: Type.Number(),
            shipping_date: Type.Object({
              category_tags: Type.Array(
                Type.Object({
                  name: Type.String(),
                  shipping_date: Type.Object({
                    start: Type.String(),
                    end: Type.String(),
                  }),
                }),
              ),
              end: Type.String(),
              start: Type.String(),
            }),
            site_external_id: Type.String(),
            sku: Type.String(),
          }),
        ),
        pricing: Type.Object({
          currency: Type.String(),
          net_price: Type.Optional(Type.Number()),
          price: Type.Number(),
          price_components: Type.Array(
            Type.Object({
              id: Type.String(),
              type: Type.String(),
              value: Type.Number(),
              vat: Type.Optional(Type.Number()),
              vat_rate: Type.Optional(Type.Number()),
            }),
          ),
        }),
        selection: Type.Object({
          auto_selected: Type.Boolean(),
          selected_by: Type.String(),
          selected_by_type: Type.String(),
        }),
        shipping: Type.Object({
          addons: Type.Array(
            Type.Object({
              code: Type.String(),
              description: Type.String(),
              name: Type.String(),
            }),
          ),
          carrier: Type.String(),
          carrier_product_id: Type.String(),
          delivery_addons: Type.Array(
            Type.Object({
              external_addon_id: Type.String(),
              id: Type.String(),
            }),
          ),
          delivery_type: Type.String(),
          meta: Type.Record(Type.String(), Type.Any()),
          product: Type.String(),
          route: Type.Object({
            shipping_legs: Type.Array(
              Type.Object({
                delivery_type: Type.String(),
                from: Type.Object({
                  address: Type.Optional(
                    Type.Object({
                      address_lines: Type.Array(Type.String()),
                      apartment_number: Type.String(),
                      city: Type.String(),
                      country: Type.String(),
                      name: Type.String(),
                      postal_code: Type.String(),
                      street: Type.String(),
                      street_number: Type.String(),
                    }),
                  ),
                  external_id: Type.String(),
                  location_type: Type.String(),
                }),
                shipping_method: Type.String(),
                to: Type.Object({
                  address: Type.Optional(
                    Type.Object({
                      address_lines: Type.Array(Type.String()),
                      apartment_number: Type.String(),
                      city: Type.String(),
                      country: Type.String(),
                      name: Type.String(),
                      postal_code: Type.String(),
                      street: Type.String(),
                      street_number: Type.String(),
                    }),
                  ),
                  external_id: Type.String(),
                  location_type: Type.String(),
                }),
              }),
            ),
          }),
          supports: Type.Object({
            courier_instructions: Type.Boolean(),
            customer_number: Type.Boolean(),
            door_code: Type.Boolean(),
            search: Type.Boolean(),
          }),
          warehouse: Type.Object({
            address: Type.Object({
              address_lines: Type.Array(Type.String()),
              apartment_number: Type.String(),
              city: Type.String(),
              country: Type.String(),
              name: Type.String(),
              postal_code: Type.String(),
              street: Type.String(),
              street_number: Type.String(),
            }),
          }),
        }),
        tos_id: Type.String(),
      }),
    ),
    purchase_country: Type.String(),
  }),
  token: Type.String(),
}); */

export const InitSessionResponseSchema = Type.Object({
  html_snippet: Type.String(),
  session: Type.Any(),
  token: Type.String(),
});

export type InitSessionRequestSchemaDTO = Static<typeof InitSessionRequestSchema>;
export type InitSessionResponseSchemaDTO = Static<typeof InitSessionResponseSchema>;
