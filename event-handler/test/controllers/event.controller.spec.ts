import { Request, Response } from 'express';
import { post } from '../../src/controllers/event.controller';
import { createApiRoot } from '../../src/client/commercetools/create.client';
import * as updateClient from '../../src/client/commercetools/update.client';
import PubSubValidator from '../../src/utils/validate_requests.utils';
import IngridApiClient from '../../src/client/ingrid/ingrid.client';
import { IngridCompleteSessionResponse } from '../../src/client/ingrid/types/ingrid.client.type';
import { readConfiguration } from '../../src/utils/config.utils';
import { logger } from '../../src/utils/logger.utils';

// Add Jest imports
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import {
  orderWithReadyShipmentState,
  orderWithCancelShipmentState,
} from '../mock/mock-order';
import { mockApiRootOrderResponse } from '../mock/mock-api-root';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = jest.MockedFunction<any>;

const mockIngridSessionId = 'test-session-id';

jest.mock('../../src/client/commercetools/create.client');
jest.mock('../../src/utils/validate_requests.utils');
jest.mock('../../src/client/ingrid/ingrid.client');
jest.mock('../../src/utils/config.utils');
jest.mock('../../src/utils/logger.utils');

// Define interfaces for type safety

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

    const mockCommercetoolsGetOrders = mockApiRootOrderResponse({
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

    const mockCommercetoolsGetOrders = mockApiRootOrderResponse({
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
    const mockCommercetoolsGetOrders = mockApiRootOrderResponse({
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
    });

    (createApiRoot as MockFn).mockReturnValue({
      orders: mockCommercetoolsGetOrders,
    });

    // Mock readConfiguration
    (readConfiguration as jest.Mock).mockReturnValue({
      ingridApiKey: 'test-api-key',
      ingridEnvironment: 'STAGING',
    });

    jest
      .spyOn(IngridApiClient.prototype, 'completeCheckoutSession')
      .mockRejectedValue(mockError);

    // Mock changeShipmentState
    jest
      .spyOn(updateClient, 'changeShipmentState')
      .mockResolvedValueOnce(orderWithCancelShipmentState);

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
    const mockCommercetoolsGetOrders = mockApiRootOrderResponse({
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
    });

    (createApiRoot as MockFn).mockReturnValue({
      orders: mockCommercetoolsGetOrders,
    });

    // Mock readConfiguration
    (readConfiguration as jest.Mock).mockReturnValue({
      ingridApiKey: 'test-api-key',
      ingridEnvironment: 'STAGING',
    });

    // Mock IngridApiClient with INCOMPLETE status
    const mockIngridResponse: IngridCompleteSessionResponse = {
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

    jest
      .spyOn(IngridApiClient.prototype, 'completeCheckoutSession')
      .mockResolvedValue(mockIngridResponse);

    // Mock changeShipmentState
    jest
      .spyOn(updateClient, 'changeShipmentState')
      .mockResolvedValueOnce(orderWithCancelShipmentState);

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
    // Mock createApiRoot get order response
    const mockCommercetoolsGetOrders = mockApiRootOrderResponse({
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
    });

    (createApiRoot as MockFn).mockReturnValue({
      orders: mockCommercetoolsGetOrders,
    });

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
