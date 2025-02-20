import {
  ByProjectKeyRequestBuilder,
  Destination,
  GoogleCloudPubSubDestination,
} from '@commercetools/platform-sdk';

const ORDER_CREATE_SUBSCRIPTION_KEY =
  'ingridShippingConnector-orderCreateSubscription';

export async function createGcpPubSubOrderCreateSubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  topicName: string,
  projectId: string
): Promise<void> {
  const destination: GoogleCloudPubSubDestination = {
    type: 'GoogleCloudPubSub',
    topic: topicName,
    projectId,
  };
  await createSubscription(apiRoot, destination);
}

async function createSubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  destination: Destination
) {
  await deleteOrderCreateSubscription(apiRoot);
  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: ORDER_CREATE_SUBSCRIPTION_KEY,
        destination,
        messages: [
          {
            resourceTypeId: 'order',
            types: ['OrderCreated'],
          },
        ],
      },
    })
    .execute();
}

export async function deleteOrderCreateSubscription(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${ORDER_CREATE_SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: ORDER_CREATE_SUBSCRIPTION_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}
