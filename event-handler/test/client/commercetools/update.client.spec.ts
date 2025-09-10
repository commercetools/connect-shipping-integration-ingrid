import * as createClientModule from '../../../src/client/commercetools/create.client';
import { changeShipmentState } from '../../../src/client/commercetools/update.client';
import { readConfiguration } from '../../../src/utils/config.utils';
import type {
  ByProjectKeyOrdersRequestBuilder,
  ByProjectKeyRequestBuilder,
} from '@commercetools/platform-sdk';

// Add Jest imports
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockConfiguration } from '../../mock/mock-configuration';
import { mockApiRootUpdateResponse } from '../../mock/mock-api-root';

// Mocks
jest.mock('../../../src/utils/config.utils');
jest.mock('../../../src/client/commercetools/create.client', () => ({
  createApiRoot: jest.fn(),
}));

describe('Update Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock readConfiguration to return valid configuration
    jest.mocked(readConfiguration).mockReturnValue(mockConfiguration);
  });

  describe('changeShipmentState', () => {
    it('should call the commercetools API with correct parameters', async () => {
      const mockOrderId = 'test-order-id';
      const mockOrderVersion = 1;
      const mockShipmentState = 'Shipped';

      const mockCommercetoolsUpdateOrders = mockApiRootUpdateResponse({
        body: {
          id: mockOrderId,
          version: mockOrderVersion,
        },
      });

      type MockApiRoot = Partial<ByProjectKeyRequestBuilder> & {
        orders: Partial<ByProjectKeyOrdersRequestBuilder>;
      };

      // Set up the mock without type checking issues
      const mockApiRoot: MockApiRoot = {
        orders: mockCommercetoolsUpdateOrders as MockApiRoot['orders'],
      };

      jest
        .spyOn(createClientModule, 'createApiRoot')
        .mockReturnValue(mockApiRoot as ByProjectKeyRequestBuilder);

      const result = await changeShipmentState(
        mockOrderId,
        mockOrderVersion,
        mockShipmentState
      );

      expect(createClientModule.createApiRoot).toHaveBeenCalled();
      expect(typeof result).toBe('object');
      expect(mockApiRoot.orders).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockOrderId,
        version: mockOrderVersion + 1,
      });
    });
  });
});
