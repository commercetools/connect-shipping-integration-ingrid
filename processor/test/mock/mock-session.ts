export const mockSessionUrl = 'https://session.commercetools.com';
export const mockProjectKey = 'dummy-project-key';
export const mockSessionId = 'dummy-session-id';
export const mockAccessToken = {
  access_token: 'dummy-access-token',
  token_type: 'string',
  scope: 'dummy-scope',
  expires_in: 3600,
};
export const mockGetSessionResponse = {
  id: mockSessionId,
  version: 1,
  expiryAt: '2025-04-01T00:00:00.000Z',
  lastModifiedAt: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  metadata: {
    processorUrl: 'https://localhost:8080',
    correlationId: 'dummy-correlation-id',
  },
  activeCart: {
    cartRef: {
      id: 'dummy-cart-id',
    },
  },
  state: 'ACTIVE' as const,
};
export const mockGetExpiredSessionResponse = {
  id: mockSessionId,
  version: 1,
  expiryAt: '2025-04-01T00:00:00.000Z',
  lastModifiedAt: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  metadata: {
    processorUrl: 'https://localhost:8080',
    correlationId: 'dummy-correlation-id',
  },
  activeCart: {
    cartRef: {
      id: 'dummy-cart-id',
    },
  },
  state: 'EXPIRED' as const,
};
export type ErrorPrivateFields =
  | {
      status: number;
      statusText: string;
    }
  | undefined;
export type InactiveSessionErrorPrivateFields =
  | {
      session: string;
    }
  | undefined;
