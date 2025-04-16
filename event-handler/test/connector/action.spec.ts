import {
  createGcpPubSubOrderCreateSubscription,
  deleteOrderCreateSubscription,
} from '../../src/connector/actions';
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
import * as Config from '../../src/utils/config.utils';
import { mockConfiguration } from '../mock/mock-configuration';

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

  test('createGcpPubSubOrderCreateSubscription - successfully creates a subscription', async () => {
    jest.spyOn(Config, 'readConfiguration').mockReturnValue(mockConfiguration);
    let apiRoot: ByProjectKeyRequestBuilder | undefined = undefined;
    await import('../../src/client/commercetools/create.client').then(
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
        `test-project-key/subscriptions?where=key%3D%22${subscriptionKey}%22`,
        200,
        { results: [mockSubscription] }
      ),
      mockDelete(
        'https://api.europe-west1.gcp.commercetools.com/',
        `test-project-key/subscriptions/key=${subscriptionKey}?version=1`,
        200,
        mockSubscription
      ),
      mockPost(
        'https://api.europe-west1.gcp.commercetools.com/',
        `test-project-key/subscriptions`,
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

  test('deleteOrderCreateSubscription - successfully deletes an existing subscription', async () => {
    jest.spyOn(Config, 'readConfiguration').mockReturnValue(mockConfiguration);
    let apiRoot: ByProjectKeyRequestBuilder | undefined = undefined;
    await import('../../src/client/commercetools/create.client').then(
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
        'https://auth.test-region.commercetools.com/',
        'oauth/token',
        200,
        mockAccessToken
      ),
      mockGet(
        'https://api.test-region.commercetools.com/',
        `test-project-key/subscriptions?where=key%3D%22${subscriptionKey}%22`,
        200,
        { results: [mockSubscription] }
      ),
      mockDelete(
        'https://api.test-region.commercetools.com/',
        `test-project-key/subscriptions/key=${subscriptionKey}?version=1`,
        200,
        mockSubscription
      )
    );

    await deleteOrderCreateSubscription(apiRoot);
    // If no error is thrown, the test passes
  });

  test('deleteOrderCreateSubscription - no action when subscription does not exist', async () => {
    jest.spyOn(Config, 'readConfiguration').mockReturnValue(mockConfiguration);
    let apiRoot: ByProjectKeyRequestBuilder | undefined = undefined;
    await import('../../src/client/commercetools/create.client').then(
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
        'https://auth.test-region.commercetools.com/',
        'oauth/token',
        200,
        mockAccessToken
      ),
      mockGet(
        'https://api.test-region.commercetools.com/',
        `test-project-key/subscriptions?where=key%3D%22${subscriptionKey}%22`,
        200,
        { results: [] }
      )
    );

    await deleteOrderCreateSubscription(apiRoot);
    // If no error is thrown, the test passes
  });
});
