import { Request, Response } from 'express';
import { post } from '../../src/controllers/event.controller';
import { createApiRoot } from '../../src/client/commercetools/create.client';
import * as updateClient from '../../src/client/commercetools/update.client';
import PubSubValidator from '../../src/utils/validate_requests.utils';
import IngridApiClient from '../../src/client/ingrid/ingrid.client';
import {
  IngridCompleteSessionRequestPayload,
  IngridCompleteSessionResponse,
} from '../../src/client/ingrid/types/ingrid.client.type';
import { readConfiguration } from '../../src/utils/config.utils';
import { logger } from '../../src/utils/logger.utils';

// Add Jest imports
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import {
  orderWithReadyShipmentState,
  orderWithCancelShipmentState,
} from '../unit/mock/mock-order';

// Define types for mocks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = jest.MockedFunction<any>;

jest.mock('../../src/client/commercetools/create.client');
jest.mock('../../src/utils/validate_requests.utils');
jest.mock('../../src/client/ingrid/ingrid.client');
jest.mock('../../src/utils/config.utils');
jest.mock('../../src/utils/logger.utils');

// Define interfaces for type safety
interface MockGetOrderResponse {
  body: {
    cart: {
      obj: {
        custom: {
          fields: {
            ingridSessionId?: string;
          };
        };
      };
    };
  };
}

// Define the mocked function type
type ThenCallback = (arg: any) => any;

describe('Event Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as MockFn,
      send: jest.fn().mockReturnThis() as MockFn,
    };

    (readConfiguration as MockFn).mockReturnValue({
      ingridApiKey: 'test-api-key',
      ingridEnvironment: 'test-environment',
    });

    (logger.info as MockFn).mockImplementation(() => undefined);
    (logger.error as MockFn).mockImplementation(() => undefined);
  });

  it('should successfully process a valid event', async () => {
    const mockOrderId = 'test-order-id';
    (PubSubValidator.validateRequestBody as MockFn).mockReturnValue({});
    (PubSubValidator.validateMessageFormat as MockFn).mockReturnValue({});
    // (PubSubValidator.decodeMessageData as MockFn).mockReturnValue({
    //   orderId: mockOrderId,
    // });
    (PubSubValidator.decodeMessageData as MockFn).mockReturnValue({
      notificationType: 'Message',
      projectKey: 'dummy-project-key',
      id: 'dummy-message-id',
      version: 1,
      sequenceNumber: 1,
      resource: { typeId: 'order', id: mockOrderId },
      resourceVersion: 1,
      type: 'OrderCreated',
      order: {
        id: mockOrderId,
      },
    });
    (PubSubValidator.validateDecodedMessage as MockFn).mockReturnValue(
      mockOrderId
    );
    const mockIngridSessionId = 'test-session-id';
    const mockCommercetoolsGetOrderExecute = jest
      .fn<() => Promise<MockGetOrderResponse>>()
      .mockResolvedValue({
        body: {
          cart: {
            obj: {
              custom: {
                fields: {
                  ingridSessionId: mockIngridSessionId,
                },
              },
            },
          },
        },
      });

    const mockCommercetoolsGetOrder = jest.fn().mockReturnValue({
      execute: mockCommercetoolsGetOrderExecute,
    });

    const mockCommercetoolsGetOrderWithId = jest.fn().mockReturnValue({
      get: mockCommercetoolsGetOrder,
    });

    const mockCommercetoolsGetOrders = jest.fn().mockReturnValue({
      withId: mockCommercetoolsGetOrderWithId,
    });

    // const mockCommercetoolsUpdateOrder = jest.fn().mockReturnValue({
    //   execute: mockCommercetoolsUpdateOrderExecute,
    // });

    // const mockCommercetoolsUpdateOrderWithId = jest.fn().mockReturnValue({
    //   get: mockCommercetoolsUpdateOrder,
    // });

    // const mockCommercetoolUpdateOrders = jest.fn().mockReturnValue({
    //   withId: mockCommercetoolsUpdateOrderWithId,
    // });

    (createApiRoot as MockFn).mockReturnValue({
      orders: mockCommercetoolsGetOrders,
    });

    jest
      .spyOn(updateClient, 'changeShipmentState')
      .mockResolvedValue(orderWithReadyShipmentState);

    const mockIngridResponse = {
      session: {
        checkout_session_id: mockIngridSessionId,
        status: 'COMPLETE',
      },
    };

    (
      IngridApiClient.prototype.completeCheckoutSession as MockFn
    ).mockResolvedValue(mockIngridResponse);

    await post(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
    expect(
      IngridApiClient.prototype.completeCheckoutSession
    ).toHaveBeenCalledWith({
      checkout_session_id: mockIngridSessionId,
      external_id: mockOrderId,
    });

    expect(logger.info).toHaveBeenCalledWith(
      'processing shipping session completion for order ID : test-order-id'
    );
    expect(logger.info).toHaveBeenCalledWith(
      'complete ingrid session successfully : {"ingridSessionId":"test-session-id","status":"COMPLETE"}'
    );
  });

  it('should throw error when Ingrid session ID is not found', async () => {
    const mockOrderId = 'test-order-id';
    (PubSubValidator.validateRequestBody as MockFn).mockReturnValue({});
    (PubSubValidator.validateMessageFormat as MockFn).mockReturnValue({});
    (PubSubValidator.decodeMessageData as MockFn).mockReturnValue({
      orderId: mockOrderId,
    });

    const mockCommercetoolsGetOrderExecute = jest
      .fn<() => Promise<MockGetOrderResponse>>()
      .mockResolvedValue({
        body: {
          cart: {
            obj: {
              custom: {
                fields: {},
              },
            },
          },
        },
      });

    const mockCommercetoolsGetOrder = jest.fn().mockReturnValue({
      execute: mockCommercetoolsGetOrderExecute,
    });

    const mockCommercetoolsGetOrderWithId = jest.fn().mockReturnValue({
      get: mockCommercetoolsGetOrder,
    });

    const mockCommercetoolsGetOrders = jest.fn().mockReturnValue({
      withId: mockCommercetoolsGetOrderWithId,
    });
    (createApiRoot as MockFn).mockReturnValue({
      orders: mockCommercetoolsGetOrders,
    });

    jest
      .spyOn(updateClient, 'changeShipmentState')
      .mockResolvedValue(orderWithCancelShipmentState);

    await expect(
      post(mockRequest as Request, mockResponse as Response)
    ).rejects.toThrow('Bad request. Ingrid session ID not found');
  });

  it('should throw error when PubSub validation fails', async () => {
    const validationError = new Error('Invalid request body');
    (PubSubValidator.validateRequestBody as MockFn).mockImplementation(() => {
      throw validationError;
    });

    await expect(
      post(mockRequest as Request, mockResponse as Response)
    ).rejects.toThrow('Invalid request body');

    expect(logger.error).not.toHaveBeenCalled();
  });

  // Test for handling errors in ingridClient.completeCheckoutSession
  it('should handle errors from ingridClient.completeCheckoutSession and update shipment state as canceled', async () => {
    // Setup mocks
    const mockOrderId = 'test-order-id';
    const mockVersion = 1;
    const mockError = new Error('Failed to complete session on Ingrid');

    // Mock PubSubValidator
    (PubSubValidator.validateRequestBody as jest.Mock).mockReturnValue({});
    (PubSubValidator.validateMessageFormat as jest.Mock).mockReturnValue({});
    (PubSubValidator.decodeMessageData as jest.Mock).mockReturnValue({});
    (PubSubValidator.validateDecodedMessage as jest.Mock).mockReturnValue(
      mockOrderId
    );

    // Mock createApiRoot get order response
    const mockApiRoot = {
      orders: jest.fn().mockReturnThis(),
      withId: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(function (callback: any) {
        return Promise.resolve(
          callback({
            body: {
              id: mockOrderId,
              version: mockVersion,
              cart: {
                obj: {
                  custom: {
                    fields: {
                      ingridSessionId: 'test-session-id',
                    },
                  },
                },
              },
            },
          })
        );
      }),
    };

    (createApiRoot as jest.Mock).mockReturnValue(mockApiRoot);

    // Mock readConfiguration
    (readConfiguration as jest.Mock).mockReturnValue({
      ingridApiKey: 'test-api-key',
      ingridEnvironment: 'STAGING',
    });

    // Mock IngridApiClient
    // Using a type assertion that won't cause linter errors
    const mockRejectedFn = jest
      .fn()
      .mockImplementation(() => Promise.reject(mockError));
    const originalCompleteFn =
      IngridApiClient.prototype.completeCheckoutSession;
    IngridApiClient.prototype.completeCheckoutSession = mockRejectedFn as any;

    // Mock changeShipmentState
    jest
      .spyOn(updateClient, 'changeShipmentState')
      .mockResolvedValueOnce(orderWithCancelShipmentState);

    try {
      // Execute test
      await expect(
        post(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Failed to complete session on Ingrid');

      // Verify the shipment state was updated to CANCELED
      expect(updateClient.changeShipmentState).toHaveBeenCalledWith(
        mockOrderId,
        mockVersion,
        'Canceled'
      );
    } finally {
      // Restore the original function
      IngridApiClient.prototype.completeCheckoutSession = originalCompleteFn;
    }
  });

  // Test for handling INCOMPLETE status from Ingrid
  it('should update shipment state as canceled when Ingrid session status is not COMPLETE', async () => {
    // Setup mocks
    const mockOrderId = 'test-order-id';
    const mockVersion = 1;

    // Mock PubSubValidator
    (PubSubValidator.validateRequestBody as jest.Mock).mockReturnValue({});
    (PubSubValidator.validateMessageFormat as jest.Mock).mockReturnValue({});
    (PubSubValidator.decodeMessageData as jest.Mock).mockReturnValue({});
    (PubSubValidator.validateDecodedMessage as jest.Mock).mockReturnValue(
      mockOrderId
    );

    // Mock createApiRoot get order response
    const mockApiRoot = {
      orders: jest.fn().mockReturnThis(),
      withId: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(function (callback: any) {
        return Promise.resolve(
          callback({
            body: {
              id: mockOrderId,
              version: mockVersion,
              cart: {
                obj: {
                  custom: {
                    fields: {
                      ingridSessionId: 'test-session-id',
                    },
                  },
                },
              },
            },
          })
        );
      }),
    };

    (createApiRoot as jest.Mock).mockReturnValue(mockApiRoot);

    // Mock readConfiguration
    (readConfiguration as jest.Mock).mockReturnValue({
      ingridApiKey: 'test-api-key',
      ingridEnvironment: 'STAGING',
    });

    // Mock IngridApiClient with INCOMPLETE status
    const mockIngridResponse: Partial<IngridCompleteSessionResponse> = {
      session: {
        checkout_session_id: 'test-session-id',
        status: 'INCOMPLETE',
        updated_at: new Date().toISOString(),
        cart: {
          total_value: 0,
          total_discount: 0,
          items: [],
          cart_id: 'test-cart-id',
        },
        delivery_groups: [],
        purchase_country: 'US',
      },
    };

    // Using a type assertion that won't cause linter errors
    const mockResolvedFn = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockIngridResponse));
    const originalCompleteFn =
      IngridApiClient.prototype.completeCheckoutSession;
    IngridApiClient.prototype.completeCheckoutSession = mockResolvedFn as any;

    // Mock changeShipmentState
    jest
      .spyOn(updateClient, 'changeShipmentState')
      .mockResolvedValueOnce(orderWithCancelShipmentState);

    try {
      // Execute test
      await post(mockRequest as Request, mockResponse as Response);

      // Verify the shipment state was updated to CANCELED
      expect(updateClient.changeShipmentState).toHaveBeenCalledWith(
        mockOrderId,
        mockVersion,
        'Canceled'
      );

      // Verify the response
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalledWith({
        ingridSessionId: 'test-session-id',
        status: 'INCOMPLETE',
      });

      // Verify logs were created
      expect(jest.mocked(logger.info)).toHaveBeenCalledWith(
        expect.stringContaining('complete ingrid session failed')
      );
      expect(jest.mocked(logger.info)).toHaveBeenCalledWith(
        expect.stringContaining(
          'Update commercetools cart shipment state as canceled'
        )
      );
    } finally {
      // Restore the original function
      IngridApiClient.prototype.completeCheckoutSession = originalCompleteFn;
    }
  });

  // Test for handling missing ingridSessionId
  it('should throw an error when ingridSessionId is not found', async () => {
    // Setup mocks
    const mockOrderId = 'test-order-id';
    const mockVersion = 1;

    // Mock PubSubValidator
    (PubSubValidator.validateRequestBody as jest.Mock).mockReturnValue({});
    (PubSubValidator.validateMessageFormat as jest.Mock).mockReturnValue({});
    (PubSubValidator.decodeMessageData as jest.Mock).mockReturnValue({});
    (PubSubValidator.validateDecodedMessage as jest.Mock).mockReturnValue(
      mockOrderId
    );

    // Mock createApiRoot get order response with missing ingridSessionId
    const mockApiRoot = {
      orders: jest.fn().mockReturnThis(),
      withId: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(function (callback: any) {
        return Promise.resolve(
          callback({
            body: {
              id: mockOrderId,
              version: mockVersion,
              cart: {
                obj: {
                  custom: {
                    fields: {
                      // ingridSessionId is missing
                    },
                  },
                },
              },
            },
          })
        );
      }),
    };

    (createApiRoot as jest.Mock).mockReturnValue(mockApiRoot);

    // Execute test
    await expect(
      post(mockRequest as Request, mockResponse as Response)
    ).rejects.toThrow('Bad request. Ingrid session ID not found');
  });

  // Test for handling RESOURCE_CREATED_MESSAGE
  it('should skip processing for RESOURCE_CREATED_MESSAGE', async () => {
    // Mock PubSubValidator to return RESOURCE_CREATED_MESSAGE
    jest.mocked(PubSubValidator.validateRequestBody).mockReturnValue({});
    jest.mocked(PubSubValidator.validateMessageFormat).mockReturnValue({});
    jest.mocked(PubSubValidator.decodeMessageData).mockReturnValue({});
    jest
      .mocked(PubSubValidator.validateDecodedMessage)
      .mockReturnValue('RESOURCE_CREATED_MESSAGE');

    // Execute test
    await post(mockRequest as Request, mockResponse as Response);

    // Verify the response
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalledWith(
      'Message for subscription created. Skip processing message.'
    );
    expect(jest.mocked(logger.info)).toHaveBeenCalledWith(
      'Message for subscription created. Skip processing message.'
    );
  });
});
