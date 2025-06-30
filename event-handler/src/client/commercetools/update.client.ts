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

export const setTransportOrderId = async (
  shipingCustomTypeKey: string,
  orderId: string,
  orderVersion: number,
  transportOrderId: string
) => {
  const type = await createApiRoot()
    .types()
    .withKey({ key: shipingCustomTypeKey })
    .get()
    .execute()
    .then((res) => res.body);

  return await createApiRoot()
    .orders()
    .withId({ ID: orderId })
    .post({
      body: {
        version: orderVersion,
        actions: [
          {
            action: 'setShippingCustomType',
            type: {
              id: type.id,
              typeId: 'type',
            },
            fields: {
              ingridTransportOrderId: transportOrderId,
            },
          },
        ],
      },
    })
    .execute()
    .then((res) => res.body);
};
