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
      },
    ],
    cart_id: 'UNIQUE_ID',
  },
  locales: ['sv-SE'],
};

export const mockCreateCheckoutSessionResponse = {
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
