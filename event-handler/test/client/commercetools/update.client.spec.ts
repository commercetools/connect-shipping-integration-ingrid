import * as createClientModule from '../../../src/client/commercetools/create.client';
import { changeShipmentState } from '../../../src/client/commercetools/update.client';
import { readConfiguration } from '../../../src/utils/config.utils';

// Add Jest imports
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { mockConfiguration } from '../../mock/mock-configuration';

// Mock the readConfiguration function
jest.mock('../../../src/utils/config.utils');

describe('Update Client', () => {
  const mockOrderId = 'test-order-id';
  const mockOrderVersion = 1;
  const mockShipmentState = 'Shipped';
  const mockApiRoot = {
    orders: jest.fn().mockReturnThis(),
    withId: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: jest.fn().mockImplementation((callback: any) => {
      return Promise.resolve(
        callback({ body: { id: mockOrderId, version: mockOrderVersion + 1 } })
      );
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock readConfiguration to return valid configuration
    jest.mocked(readConfiguration).mockReturnValue(mockConfiguration);

    jest
      .spyOn(createClientModule, 'createApiRoot')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockReturnValue(mockApiRoot as any);
  });

  describe('changeShipmentState', () => {
    it('should call the commercetools API with correct parameters', async () => {
      const result = await changeShipmentState(
        mockOrderId,
        mockOrderVersion,
        mockShipmentState
      );

      expect(createClientModule.createApiRoot).toHaveBeenCalled();
      expect(mockApiRoot.orders).toHaveBeenCalled();
      expect(mockApiRoot.withId).toHaveBeenCalledWith({ ID: mockOrderId });
      expect(mockApiRoot.post).toHaveBeenCalledWith({
        body: {
          version: mockOrderVersion,
          actions: [
            {
              action: 'changeShipmentState',
              shipmentState: mockShipmentState,
            },
          ],
        },
      });
      expect(mockApiRoot.execute).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockOrderId,
        version: mockOrderVersion + 1,
      });
    });

    it('should propagate errors from the API', async () => {
      const mockError = new Error('API error');
      mockApiRoot.then.mockImplementationOnce(() => Promise.reject(mockError));

      await expect(
        changeShipmentState(mockOrderId, mockOrderVersion, mockShipmentState)
      ).rejects.toThrow('API error');
    });
  });
});
