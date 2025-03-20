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

// const mockCommercetoolsUpdateOrder = jest.fn().mockReturnValue({
//   execute: mockCommercetoolsUpdateOrderExecute,
// });

// const mockCommercetoolsUpdateOrderWithId = jest.fn().mockReturnValue({
//   get: mockCommercetoolsUpdateOrder,
// });

// const mockCommercetoolUpdateOrders = jest.fn().mockReturnValue({
//   withId: mockCommercetoolsUpdateOrderWithId,
// });
