import {Request, Response} from 'express';
import {post} from '../../src/controllers/event.controller';
import {createApiRoot} from '../../src/client/commercetools/create.client';
import PubSubValidator from '../../src/utils/validate_requests.utils';
import IngridApiClient from '../../src/client/ingrid/ingrid.client';
import {readConfiguration} from '../../src/utils/config.utils';
import {logger} from '../../src/utils/logger.utils';

// Mock dependencies
jest.mock('../../src/client/commercetools/create.client');
jest.mock('../../src/utils/validate_requests.utils');
jest.mock('../../src/client/ingrid/ingrid.client');
jest.mock('../../src/utils/config.utils');
jest.mock('../../src/utils/logger.utils');

describe('Event Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        // Mock configuration
        (readConfiguration as jest.Mock).mockReturnValue({
            ingridApiKey: 'test-api-key',
            ingridEnvironment: 'test-environment'
        });

        // Mock logger
        (logger.info as jest.Mock).mockImplementation(() => {
        });
        (logger.error as jest.Mock).mockImplementation(() => {
        });
    });

    it('should successfully process a valid event', async () => {
        // Mock PubSubValidator
        const mockOrderId = 'test-order-id';
        (PubSubValidator.validateRequestBody as jest.Mock).mockReturnValue({});
        (PubSubValidator.validateMessageFormat as jest.Mock).mockReturnValue({});
        (PubSubValidator.decodeMessageData as jest.Mock).mockReturnValue({orderId: mockOrderId});

        // Mock commercetools response
        const mockIngridSessionId = 'test-session-id';
        const mockCommercetoolsExecute = jest.fn().mockResolvedValue({
            body: {
                cart: {
                    obj: {
                        custom: {
                            fields: {
                                ingridSessionId: mockIngridSessionId
                            }
                        }
                    }
                }
            }
        });

        const mockCommercetoolsGet = jest.fn().mockReturnValue({
            execute: mockCommercetoolsExecute
        });

        const mockCommercetoolsWithId = jest.fn().mockReturnValue({
            get: mockCommercetoolsGet
        });

        const mockCommercetoolsOrders = jest.fn().mockReturnValue({
            withId: mockCommercetoolsWithId
        });

        (createApiRoot as jest.Mock).mockReturnValue({
            orders: mockCommercetoolsOrders
        });

        // Mock Ingrid client response
        const mockIngridResponse = {success: true};
        (IngridApiClient.prototype.completeCheckoutSession as jest.Mock).mockResolvedValue(mockIngridResponse);

        // Execute test
        await post(mockRequest as Request, mockResponse as Response);

        // Assertions
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.send).toHaveBeenCalled();
        expect(IngridApiClient.prototype.completeCheckoutSession).toHaveBeenCalledWith({
            checkout_session_id: mockIngridSessionId,
            external_id: mockOrderId
        });
        expect(logger.info).toHaveBeenCalledWith(mockIngridResponse);
    });

    it('should throw error when Ingrid session ID is not found', async () => {
        // Mock PubSubValidator
        const mockOrderId = 'test-order-id';
        (PubSubValidator.validateRequestBody as jest.Mock).mockReturnValue({});
        (PubSubValidator.validateMessageFormat as jest.Mock).mockReturnValue({});
        (PubSubValidator.decodeMessageData as jest.Mock).mockReturnValue({orderId: mockOrderId});

        // Mock commercetools response without ingridSessionId
        const mockCommercetoolsExecute = jest.fn().mockResolvedValue({
            body: {
                cart: {
                    obj: {
                        custom: {
                            fields: {}
                        }
                    }
                }
            }
        });

        const mockCommercetoolsGet = jest.fn().mockReturnValue({
            execute: mockCommercetoolsExecute
        });

        const mockCommercetoolsWithId = jest.fn().mockReturnValue({
            get: mockCommercetoolsGet
        });

        const mockCommercetoolsOrders = jest.fn().mockReturnValue({
            withId: mockCommercetoolsWithId
        });

        (createApiRoot as jest.Mock).mockReturnValue({
            orders: mockCommercetoolsOrders
        });

        // Execute test and expect error
        await expect(post(mockRequest as Request, mockResponse as Response))
            .rejects
            .toThrow('Bad request: Ingrid session ID not found');
    });

    it('should throw error when PubSub validation fails', async () => {
        // Mock PubSubValidator to throw error
        (PubSubValidator.validateRequestBody as jest.Mock).mockImplementation(() => {
            throw new Error('Bad request: Error: Invalid request body');
        });

        // Execute test and expect error
        await expect(post(mockRequest as Request, mockResponse as Response))
            .rejects
            .toThrow('Bad request: Error: Invalid request body');
    });
}); 