import type { IngridGetSessionResponse } from '../../src/clients/ingrid/types/ingrid.client.type';

export const mockCreateCheckoutSessionRequest = {
  purchase_country: 'SE',
  purchase_currency: 'SEK',
  cart: {
    total_value: 10000,
    total_discount: 0,
    items: [
      {
        sku: 'SKU12345',
        name: 'Saucony Shadow 6000',
        quantity: 1,
        price: 10000,
        discount: 0,
      },
    ],
    cart_id: 'UNIQUE_ID',
  },
  locales: ['sv-SE'],
};

export const mockCreateCheckoutSessionAuthFailureResponse = {
  error: 'unauthenticated: malformed authorization token',
  trace_id: 'S20250205110810PA9Z3WZRV80ZZ4MG',
};

export const mockCreateCheckoutSessionSuccessResponse = {
  session: {
    checkout_session_id: 'VM2-475841538acb4c61a0c499daf715b7b6',
    status: 'ACTIVE',
    updated_at: '2025-02-03T11:42:52Z',
    cart: {
      total_value: 10000,
      total_discount: 0,
      items: [
        {
          sku: 'SKU12345',
          name: 'Saucony Shadow 6000',
          quantity: 1,
          price: 0,
        },
      ],
      cart_id: 'UNIQUE_ID',
      groups: [{}],
    },
    delivery_groups: [
      {
        items: [
          {
            sku: 'SKU12345',
            quantity: 1,
          },
        ],
        shipping: {
          delivery_type: 'pickup',
          warehouse: {
            address: {
              address_lines: ['Nynäsvägen 96'],
              city: 'Handen',
              postal_code: '13635',
              country: 'SE',
            },
          },
          carrier_product_id: 'MPC',
        },
        category: {
          id: 'pickup-point-delivery-eaa0c8e00d054f2cbf26a3dc7fa88a9a',
          name: 'Pickup point delivery',
          presented_category_name: 'Leverans till ombud',
          base_price: 2500,
        },
        pricing: {
          currency: 'SEK',
          price: 2500,
          price_components: [
            {
              type: 'PRICE_COMPONENT_TYPE_SHIPPING',
              value: 2500,
            },
          ],
        },
        selection: 'PRESELECTED_CHOICE',
        delivery_time: {
          pickup_from_merchant: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-04T00:00:00+01:00',
          },
          customer_delivery_promise: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-05T00:00:00+01:00',
          },
          carrier_delivery_promise: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-05T00:00:00+01:00',
          },
        },
        addresses: {},
      },
    ],
    purchase_country: 'SE',
  },
  html_snippet: '<div id="shipwallet-container" style="min-height:350px" />',
  token: 'Y2xpZW50dHdvOmU0NGQ2NDFjNjg4MDQ5ODZhMTcyYjdkNzcyZGNlMjM4',
};

export const mockGetCheckoutSessionResponse = {
  session: {
    checkout_session_id: 'VM2-475841538acb4c61a0c499daf715b7b6',
    status: 'ACTIVE',
    updated_at: '2025-02-03T12:47:33Z',
    cart: {
      total_value: 10000,
      total_discount: 0,
      items: [
        {
          sku: 'SKU12345',
          name: 'Saucony Shadow 6000',
          quantity: 1,
          price: 0,
        },
      ],
      cart_id: 'UNIQUE_ID',
      groups: [{}],
    },
    delivery_groups: [
      {
        items: [
          {
            sku: 'SKU12345',
            quantity: 1,
          },
        ],
        shipping: {
          delivery_type: 'pickup',
          warehouse: {
            address: {
              address_lines: ['Nynäsvägen 96'],
              city: 'Handen',
              postal_code: '13635',
              country: 'SE',
            },
          },
          carrier_product_id: 'MPC',
        },
        category: {
          id: 'pickup-point-delivery-eaa0c8e00d054f2cbf26a3dc7fa88a9a',
          name: 'Pickup point delivery',
          presented_category_name: 'Leverans till ombud',
          base_price: 2500,
        },
        pricing: {
          currency: 'SEK',
          price: 2500,
          price_components: [
            {
              type: 'PRICE_COMPONENT_TYPE_SHIPPING',
              value: 2500,
            },
          ],
        },
        selection: 'PRESELECTED_CHOICE',
        delivery_time: {
          pickup_from_merchant: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-04T00:00:00+01:00',
          },
          customer_delivery_promise: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-05T00:00:00+01:00',
          },
          carrier_delivery_promise: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-05T00:00:00+01:00',
          },
        },
        addresses: {},
      },
    ],
    purchase_country: 'SE',
  },
  html_snippet: '<div id="shipwallet-container" style="min-height:350px" />',
};

export const mockPullCheckoutSessionResponse = {
  session: {
    checkout_session_id: 'VM2-475841538acb4c61a0c499daf715b7b6',
    status: 'ACTIVE',
    updated_at: '2025-02-03T12:47:33Z',
    cart: {
      total_value: 10000,
      total_discount: 0,
      items: [
        {
          sku: 'SKU12345',
          name: 'Saucony Shadow 6000',
          quantity: 1,
          price: 0,
        },
      ],
      cart_id: 'UNIQUE_ID',
      groups: [{}],
    },
    delivery_groups: [
      {
        items: [
          {
            sku: 'SKU12345',
            quantity: 1,
          },
        ],
        shipping: {
          delivery_type: 'pickup',
          warehouse: {
            address: {
              address_lines: ['Nynäsvägen 96'],
              city: 'Handen',
              postal_code: '13635',
              country: 'SE',
            },
          },
          carrier_product_id: 'MPC',
        },
        category: {
          id: 'pickup-point-delivery-eaa0c8e00d054f2cbf26a3dc7fa88a9a',
          name: 'Pickup point delivery',
          presented_category_name: 'Leverans till ombud',
          base_price: 2500,
        },
        pricing: {
          currency: 'SEK',
          price: 2500,
          price_components: [
            {
              type: 'PRICE_COMPONENT_TYPE_SHIPPING',
              value: 2500,
            },
          ],
        },
        selection: 'PRESELECTED_CHOICE',
        delivery_time: {
          pickup_from_merchant: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-04T00:00:00+01:00',
          },
          customer_delivery_promise: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-05T00:00:00+01:00',
          },
          carrier_delivery_promise: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-05T00:00:00+01:00',
          },
        },
        addresses: {},
      },
    ],
    purchase_country: 'SE',
  },
  html_snippet: '<div id="shipwallet-container" style="min-height:350px" />',
};
export const mockIngridCheckoutSessionWithAddresses: IngridGetSessionResponse = {
  session: {
    checkout_session_id: 'mock-ingrid-session-id',
    status: 'active',
    updated_at: '2023-01-01T00:00:00Z',
    cart: {
      total_value: 1000,
      total_discount: 0,
      items: [],
      cart_id: 'mock-cart-id',
    },
    delivery_groups: [
      {
        items: [
          {
            sku: 'SKU12345',
            quantity: 1,
            shipping_date: {
              category_tags: [],
              start: '2023-01-01T00:00:00Z',
              end: '2023-01-02T00:00:00Z',
            },
            site_external_id: 'site-1',
          },
        ],
        shipping: {
          addons: [],
          carrier: 'standard',
          carrier_product_id: 'MPC',
          delivery_addons: [],
          delivery_type: 'pickup',
          meta: {},
          product: 'standard',
          route: {
            shipping_legs: [],
          },
          supports: {
            courier_instructions: false,
            customer_number: false,
            door_code: false,
            search: false,
          },
          warehouse: {
            address: {
              address_lines: ['Nynäsvägen 96'],
              city: 'Handen',
              postal_code: '13635',
              country: 'SE',
              apartment_number: '',
              name: 'Warehouse',
              street: 'Nynäsvägen',
              street_number: '96',
            },
          },
        },
        pricing: {
          currency: 'SEK',
          price: 2500,
          price_components: [
            {
              id: 'shipping-1',
              type: 'PRICE_COMPONENT_TYPE_SHIPPING',
              value: 2500,
            },
          ],
        },
        selection: {
          auto_selected: false,
          selected_by: 'customer',
          selected_by_type: 'manual',
        },
        addresses: {
          billing_address: {
            first_name: 'John',
            last_name: 'Doe',
            street: '123 Main St',
            apartment_number: '1',
            street_number: '1',
            city: 'New York',
            country: 'US',
            postal_code: '10001',
            phone: '1234567890',
            email: 'john.doe@example.com',
            external_id: '1234567890',
            address_lines: ['123 Main St'],
          },
          customer: {
            name: 'John Doe',
            address_lines: ['123 Main St'],
            apartment_number: '1',
            city: 'New York',
            country: 'US',
            email: 'john.doe@example.com',
            phone: '1234567890',
            postal_code: '10001',
            street: '123 Main St',
            street_number: '1',
          },
          delivery_address: {
            first_name: 'John',
            last_name: 'Doe',
            street: '123 Main St',
            apartment_number: '1',
            street_number: '1',
            city: 'New York',
            country: 'US',
            postal_code: '10001',
            phone: '1234567890',
            email: 'john.doe@example.com',
            external_id: '1234567890',
            address_lines: ['123 Main St'],
          },
          // @ts-expect-error: should not be empty but could happen if update() is not properly implemented
          location: {},
          search_address: {
            address_lines: ['123 Main St'],
            apartment_number: '1',
            city: 'New York',
            country: 'US',
            postal_code: '10001',
            street: '123 Main St',
            street_number: '1',
            name: 'dummy-name',
          },
        },
        category: {
          id: 'pickup-point-delivery-eaa0c8e00d054f2cbf26a3dc7fa88a9a',
          name: 'Pickup point delivery',
          presented_category_name: 'Leverans till ombud',
          base_price: 2500,
          custom_text: '',
          custom_warning_text: '',
          tags: [],
        },
        delivery_time: {
          pickup_from_merchant: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-04T00:00:00+01:00',
          },
          customer_delivery_promise: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-05T00:00:00+01:00',
          },
          carrier_delivery_promise: {
            earliest: '2025-02-04T00:00:00+01:00',
            latest: '2025-02-05T00:00:00+01:00',
          },
        },
        group_id: 'group-1',
        header: 'Pickup Delivery',
        tos_id: 'tos-1',
      },
    ],
    purchase_country: 'SE',
  },
  html_snippet: '<div>mock-html-snippet</div>',
};

export const mockIngridCheckoutSessionWithoutAddresses: IngridGetSessionResponse = {
  session: {
    checkout_session_id: 'mock-ingrid-session-id',
    status: 'active',
    updated_at: '2023-01-01T00:00:00Z',
    cart: {
      total_value: 1000,
      total_discount: 0,
      items: [],
      cart_id: 'mock-cart-id',
    },
    delivery_groups: [
      {
        // @ts-expect-error: should not be empty but could happen if update() is not properly implemented
        addresses: {},
        category: {
          base_price: 1000,
          custom_text: '',
          custom_warning_text: '',
          id: 'category-1',
          name: 'Standard Shipping',
          presented_category_name: 'Standard Shipping',
          tags: [],
        },
        delivery_time: {
          carrier_delivery_promise: {
            earliest: '2023-01-02T00:00:00Z',
            latest: '2023-01-03T00:00:00Z',
          },
          customer_delivery_promise: {
            earliest: '2023-01-02T00:00:00Z',
            latest: '2023-01-03T00:00:00Z',
          },
          pickup_from_merchant: {
            earliest: '2023-01-02T00:00:00Z',
            latest: '2023-01-03T00:00:00Z',
          },
        },
        group_id: 'group-1',
        header: 'Standard Shipping',
        items: [],
        pricing: {
          currency: 'USD',
          price: 1000,
          price_components: [],
        },
        selection: {
          auto_selected: false,
          selected_by: 'customer',
          selected_by_type: 'manual',
        },
        shipping: {
          addons: [],
          carrier: 'standard',
          carrier_product_id: 'standard',
          delivery_addons: [],
          delivery_type: 'standard',
          meta: {},
          product: 'standard',
          route: {
            shipping_legs: [],
          },
          supports: {
            courier_instructions: false,
            customer_number: false,
            door_code: false,
            search: false,
          },
          warehouse: {
            // @ts-expect-error: should not be empty but could happen if update() is not properly implemented
            address: {},
          },
        },
        tos_id: 'tos-1',
      },
    ],
    purchase_country: 'US',
  },
  html_snippet: '<div>mock-html-snippet</div>',
};
