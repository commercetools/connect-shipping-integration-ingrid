import { createGcpPubSubOrderCreateSubscription } from '../../../src/connector/actions';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  jest,
  beforeEach,
} from '@jest/globals';
import { setupServer } from 'msw/node';
import { mockDelete, mockRequest, mockGet, mockPost } from '../mock/mock-utils';
import { mockAccessToken } from '../mock/mock-authorization';
import { mockSubscription } from '../mock/mock-subscriptions';
import * as Config from '../../../src/utils/config.utils';

describe('actions.ts', () => {
  const mockServer = setupServer();
  beforeAll(() =>
    mockServer.listen({
      onUnhandledRequest: 'bypass',
    })
  );
  afterAll(() => mockServer.close());

  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  test('OK', async () => {
    const configResult = {
      clientId: '12345678901234567890123456789012',
      clientSecret: '123456789012345678901234',
      projectKey: 'dummy-project-key',
      scope: 'manage_project:connect-shipping-integration-ingrid',
      region: 'europe-west1.gcp',
      ingridApiKey: 'dummy-ingrid-api-key',
      ingridEnvironment: 'STAGING' as 'STAGING' | 'PRODUCTION',
    };
    jest.spyOn(Config, 'readConfiguration').mockReturnValue(configResult);
    let apiRoot: ByProjectKeyRequestBuilder | undefined = undefined;
    await import('../../../src/client/commercetools/create.client').then(
      (module) => {
        apiRoot = module.createApiRoot();
      }
    );
    if (!apiRoot) {
      throw new Error('apiRoot is not defined');
    }
    const subscriptionKey = 'ingridShippingConnector-orderCreateSubscription';
    mockServer.use(
      mockRequest(
        'https://auth.europe-west1.gcp.commercetools.com/',
        'oauth/token',
        200,
        mockAccessToken
      ),
      mockGet(
        'https://api.europe-west1.gcp.commercetools.com/',
        `dummy-project-key/subscriptions?where=key%3D%22${subscriptionKey}%22`,
        200,
        { results: [mockSubscription] }
      ),
      mockDelete(
        'https://api.europe-west1.gcp.commercetools.com/',
        `dummy-project-key/subscriptions/key=${subscriptionKey}?version=1`,
        200,
        mockSubscription
      ),
      mockPost(
        'https://api.europe-west1.gcp.commercetools.com/',
        `dummy-project-key/subscriptions`,
        200,
        mockSubscription
      )
    );
    const result = await createGcpPubSubOrderCreateSubscription(
      apiRoot,
      'dummy-topic',
      'dummy-gcp-project-id'
    );
    expect(result).toBeUndefined();
  });
});
