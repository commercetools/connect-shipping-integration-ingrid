export const mockSubscription = {
  id: '78356a61-1a2a-42d4-99d7-83c0769c0fe0',
  version: 1,
  versionModifiedAt: '2025-02-19T12:14:42.058Z',
  createdAt: '2025-02-19T12:14:42.058Z',
  lastModifiedAt: '2025-02-19T12:14:42.058Z',
  lastModifiedBy: {
    clientId: 'XoKvjfvJfe9WnKWU4PcTm9hm',
    isPlatformClient: false,
  },
  createdBy: {
    clientId: 'XoKvjfvJfe9WnKWU4PcTm9hm',
    isPlatformClient: false,
  },
  destination: {
    type: 'GoogleCloudPubSub',
    projectId: 'ct-connect-dev',
    topic: 'hin-topic',
  },
  messages: [
    {
      resourceTypeId: 'order',
      types: ['OrderCreated'],
    },
  ],
  changes: [],
  format: {
    type: 'Platform',
  },
  status: 'Healthy',
  key: 'dummy-subscription-key',
};
