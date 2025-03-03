import { createApiRoot } from './create.client';

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
    .execute()
    .then((res) => res.body);
};
