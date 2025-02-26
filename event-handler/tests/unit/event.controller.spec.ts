import { Request, Response } from 'express';
import { post } from '../../src/controllers/event.controller';
import { createApiRoot } from '../../src/client/commercetools/create.client';
import PubSubValidator from '../../src/utils/validate_requests.utils';
import IngridApiClient from '../../src/client/ingrid/ingrid.client';
import { readConfiguration } from '../../src/utils/config.utils';
import { logger } from '../../src/utils/logger.utils';

// Add Jest imports
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Define types for mocks
type MockFn = jest.MockedFunction<any>;

jest.mock('../../src/client/commercetools/create.client');
jest.mock('../../src/utils/validate_requests.utils');
jest.mock('../../src/client/ingrid/ingrid.client');
jest.mock('../../src/utils/config.utils');
jest.mock('../../src/utils/logger.utils');

// Define interfaces for type safety
interface MockOrderResponse {
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
    (PubSubValidator.decodeMessageData as MockFn).mockReturnValue({
      orderId: mockOrderId,
    });

    const mockIngridSessionId = 'test-session-id';
    const mockCommercetoolsExecute = jest.fn<() => Promise<MockOrderResponse>>().mockResolvedValue({
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

    const mockCommercetoolsGet = jest.fn().mockReturnValue({
      execute: mockCommercetoolsExecute,
    });

    const mockCommercetoolsWithId = jest.fn().mockReturnValue({
      get: mockCommercetoolsGet,
    });

    const mockCommercetoolsOrders = jest.fn().mockReturnValue({
      withId: mockCommercetoolsWithId,
    });

    (createApiRoot as MockFn).mockReturnValue({
      orders: mockCommercetoolsOrders,
    });

    const mockIngridResponse = { success: true };
    (
      IngridApiClient.prototype.completeCheckoutSession as MockFn
    ).mockResolvedValue(mockIngridResponse);

    await post(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
    expect(
      IngridApiClient.prototype.completeCheckoutSession,
    ).toHaveBeenCalledWith({
      checkout_session_id: mockIngridSessionId,
      external_id: mockOrderId,
    });
    expect(logger.info).toHaveBeenCalledWith(mockIngridResponse);
  });

  it('should throw error when Ingrid session ID is not found', async () => {
    const mockOrderId = 'test-order-id';
    (PubSubValidator.validateRequestBody as MockFn).mockReturnValue({});
    (PubSubValidator.validateMessageFormat as MockFn).mockReturnValue({});
    (PubSubValidator.decodeMessageData as MockFn).mockReturnValue({
      orderId: mockOrderId,
    });

    const mockCommercetoolsExecute = jest.fn<() => Promise<MockOrderResponse>>().mockResolvedValue({
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

    const mockCommercetoolsGet = jest.fn().mockReturnValue({
      execute: mockCommercetoolsExecute,
    });

    const mockCommercetoolsWithId = jest.fn().mockReturnValue({
      get: mockCommercetoolsGet,
    });

    const mockCommercetoolsOrders = jest.fn().mockReturnValue({
      withId: mockCommercetoolsWithId,
    });

    (createApiRoot as MockFn).mockReturnValue({
      orders: mockCommercetoolsOrders,
    });

    await expect(
      post(mockRequest as Request, mockResponse as Response)
    ).rejects.toThrow('Bad request. Ingrid session ID not found');
  });

  it('should throw error when PubSub validation fails', async () => {
    const validationError = new Error('Invalid request body');
    (PubSubValidator.validateRequestBody as MockFn).mockImplementation(
      () => {
        throw validationError;
      },
    );

    await expect(
      post(mockRequest as Request, mockResponse as Response)
    ).rejects.toThrow('Invalid request body');

    expect(logger.error).not.toHaveBeenCalled();
  });
});
