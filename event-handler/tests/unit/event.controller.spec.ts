import { Request, Response } from 'express';
import { post } from '../../src/controllers/event.controller';
import { createApiRoot } from '../../src/client/commercetools/create.client';
import * as updateClient from '../../src/client/commercetools/update.client';
import PubSubValidator from '../../src/utils/validate_requests.utils';
import IngridApiClient from '../../src/client/ingrid/ingrid.client';
import { readConfiguration } from '../../src/utils/config.utils';
import { logger } from '../../src/utils/logger.utils';
import { Order } from '@commercetools/platform-sdk';

// Add Jest imports
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import {
  orderWithReadyShipmentState,
  orderWithCancelShipmentState,
} from '../unit/mock/mock-order';

// Define types for mocks
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

interface MockUpdateOrderResponse {
  body: {
    shipmentState: string;
  };
}

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
});
