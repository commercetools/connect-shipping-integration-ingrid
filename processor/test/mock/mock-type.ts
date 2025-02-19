import { Type } from '@commercetools/platform-sdk';

export const type: Type = {
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
  key: 'ingrid-session-id',
  name: {
    en: 'Ingrid Session ID',
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
