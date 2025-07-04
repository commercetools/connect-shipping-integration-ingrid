import { Order } from '@commercetools/platform-sdk';

export const orderWithReadyShipmentState: Order = {
  id: 'dummy-order-id',
  version: 1,
  lineItems: [],
  customLineItems: [],
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 2599,
    fractionDigits: 2,
  },
  shippingMode: '',
  shipping: [],
  refusedGifts: [
    {
      id: 'dummy-cart-discount-id',
      typeId: 'cart-discount',
    },
  ],
  origin: 'Customer',
  syncInfo: [],
  shippingCustomFields: {
    type: {
      typeId: 'type',
      id: '1a1142d7-c99a-40da-aca0-872d744817b1',
    },
    fields: {
      ingridTransportOrderId: 'dummy-transport-order-id',
    },
  },
  orderState: 'Open',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastModifiedAt: '2025-01-01T00:00:00.000Z',
  shipmentState: 'Ready',
};

export const orderWithCancelShipmentState: Order = {
  id: 'dummy-order-id',
  version: 1,
  lineItems: [],
  customLineItems: [],
  totalPrice: {
    type: 'centPrecision',
    fractionDigits: 2,
    centAmount: 100,
    currencyCode: 'EUR',
  },
  shippingMode: '',
  shipping: [],
  refusedGifts: [
    {
      id: 'dummy-cart-discount-id',
      typeId: 'cart-discount',
    },
  ],
  origin: 'Customer',
  syncInfo: [],
  orderState: 'Open',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastModifiedAt: '2025-01-01T00:00:00.000Z',
  shipmentState: 'Ready',
};
