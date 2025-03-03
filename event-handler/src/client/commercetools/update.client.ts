import { createApiRoot } from './create.client';

/**
 * Example code to get the Project details
 * This code has the same effect as sending a GET
 * request to the commercetools Composable Commerce API without any endpoints.
 *
 * @returns {Promise<ClientResponse<Project>>} apiRoot
 */
export const changeShipmentState = async (
  orderId: string,
  orderVersion: number,
  state: string
) => {
  return await createApiRoot()
    .orders()
    .withId({ ID: orderId })
    .post({
      body: {
        version: orderVersion,
        actions: [
          {
            action: 'changeShipmentState',
            shipmentState: state,
          },
        ],
      },
    })
    .execute();
};
