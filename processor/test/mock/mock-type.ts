import { Type } from '@commercetools/platform-sdk';

export const sessionType: Type = {
  id: 'ingrid-session-type-id',
  version: 1,

  createdAt: '2025-01-01T00:00:00.000Z',
  lastModifiedAt: '2025-01-01T00:00:00.000Z',
  lastModifiedBy: {
    clientId: 'dummy-client-id',
  },
  createdBy: {
    clientId: 'dummy-client-id',
  },
  key: 'ingrid-session-type-key',
  name: {
    en: 'Ingrid Session',
  },
  resourceTypeIds: ['order'],
  fieldDefinitions: [
    {
      name: 'ingridSessionId',
      label: {
        en: 'Ingrid Session ID',
      },
      required: false,
      type: {
        name: 'String',
      },
      inputHint: 'SingleLine',
    },
  ],
};

export const shippingType: Type = {
  id: 'ingrid-shipping-type-id',
  version: 1,

  createdAt: '2025-01-01T00:00:00.000Z',
  lastModifiedAt: '2025-01-01T00:00:00.000Z',
  lastModifiedBy: {
    clientId: 'dummy-client-id',
  },
  createdBy: {
    clientId: 'dummy-client-id',
  },
  key: 'ingrid-shipping-type-key',
  name: {
    en: 'Ingrid Shipping',
  },
  resourceTypeIds: ['shipping'],
  fieldDefinitions: [
    {
      name: 'ingridTransportOrderId',
      label: {
        en: 'Ingrid Transport Order ID',
      },
      required: false,
      type: {
        name: 'String',
      },
      inputHint: 'SingleLine',
    },
  ],
};

export const additionalShippingType: Type = {
  id: 'dummy-type-id',
  version: 1,

  createdAt: '2025-01-01T00:00:00.000Z',
  lastModifiedAt: '2025-01-01T00:00:00.000Z',
  lastModifiedBy: {
    clientId: 'dummy-client-id',
  },
  createdBy: {
    clientId: 'dummy-client-id',
  },
  key: 'dummy-type-key',
  name: {
    en: 'dummy-type-name',
  },
  resourceTypeIds: ['shipping'],
  fieldDefinitions: [
    {
      name: 'dummy-id',
      label: {
        en: 'Dummy ID',
      },
      required: false,
      type: {
        name: 'String',
      },
      inputHint: 'SingleLine',
    },
  ],
};

export const additionalType: Type = {
  id: 'dummy-type-id',
  version: 1,

  createdAt: '2025-01-01T00:00:00.000Z',
  lastModifiedAt: '2025-01-01T00:00:00.000Z',
  lastModifiedBy: {
    clientId: 'dummy-client-id',
  },
  createdBy: {
    clientId: 'dummy-client-id',
  },
  key: 'dummy-type-key',
  name: {
    en: 'dummy-type-name',
  },
  resourceTypeIds: ['order'],
  fieldDefinitions: [
    {
      name: 'dummy-id',
      label: {
        en: 'Dummy ID',
      },
      required: false,
      type: {
        name: 'String',
      },
      inputHint: 'SingleLine',
    },
  ],
};
