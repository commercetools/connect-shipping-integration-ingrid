import {
  ByProjectKeyOrdersRequestBuilder,
  OrderUpdate,
} from '@commercetools/platform-sdk';
import { jest } from '@jest/globals';

interface MockGetOrderResponse {
  body: {
    id?: string;
    version?: number;
    cart?: {
      obj?: {
        custom?: {
          fields?: {
            ingridSessionId?: string;
          };
        };
      };
    };
  };
}

export const mockApiRootOrderResponse = (mockOrder: MockGetOrderResponse) => {
  const mockCommercetoolsGetOrderExecute = jest
    .fn<() => Promise<MockGetOrderResponse>>()
    .mockResolvedValue(mockOrder);

  const mockCommercetoolsGetOrder = jest.fn().mockReturnValue({
    execute: mockCommercetoolsGetOrderExecute,
  });

  const mockCommercetoolsGetOrderWithId = jest.fn().mockReturnValue({
    get: mockCommercetoolsGetOrder,
  });

  const mockCommercetoolsGetOrders = jest.fn().mockReturnValue({
    withId: mockCommercetoolsGetOrderWithId,
  });

  return mockCommercetoolsGetOrders;
};

export const mockApiRootUpdateResponse = (mockOrder: MockGetOrderResponse) => {
  const updatedMockOrder = {
    ...mockOrder,
    body: {
      ...mockOrder.body,
      version: mockOrder.body.version! + 1,
    },
  };
  const mockCommercetoolsUpdateOrderExecute = jest
    .fn<() => Promise<MockGetOrderResponse>>()
    .mockResolvedValue(updatedMockOrder);

  const mockCommercetoolsUpdateOrder = jest.fn().mockReturnValue({
    execute: () => mockCommercetoolsUpdateOrderExecute(),
  });

  const mockCommercetoolsUpdateOrderWithId = jest.fn().mockReturnValue({
    post: (body: OrderUpdate) => mockCommercetoolsUpdateOrder(body),
  });

  const mockCommercetoolsUpdateOrders = jest.fn().mockReturnValue({
    withId: (ID: string) => mockCommercetoolsUpdateOrderWithId(ID),
  });

  return mockCommercetoolsUpdateOrders as Partial<ByProjectKeyOrdersRequestBuilder>;
};
