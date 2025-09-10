import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createApiRoot } from '../../../src/client/commercetools/create.client';
import * as buildClient from '../../../src/client/commercetools/build.client';
import { readConfiguration } from '../../../src/utils/config.utils';
import { mockConfiguration } from '../../mock/mock-configuration';
import { Client } from '@commercetools/ts-client';

// Mock the dependencies
jest.mock('../../../src/client/commercetools/build.client');
jest.mock('../../../src/utils/config.utils');
jest.mock('@commercetools/platform-sdk', () => ({
  createApiBuilderFromCtpClient: jest.fn().mockImplementation(() => ({
    withProjectKey: jest.fn().mockImplementation(() => 'mockApiRoot'),
  })),
}));

describe('Create Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(readConfiguration).mockReturnValue(mockConfiguration);
    jest.mocked(buildClient.createClient).mockReturnValue({} as Client);
  });

  describe('createApiRoot', () => {
    it('should create an API root instance', () => {
      const apiRoot = createApiRoot();

      // The first call should create a new API root
      expect(buildClient.createClient).toHaveBeenCalled();
      expect(apiRoot).toBe('mockApiRoot');
    });

    it('should return the same API root on subsequent calls', () => {
      const firstApiRoot = createApiRoot();

      // Reset the mock to check if it's called again
      jest.clearAllMocks();

      const secondApiRoot = createApiRoot();

      // The second call should reuse the API root
      expect(buildClient.createClient).not.toHaveBeenCalled();
      expect(secondApiRoot).toBe(firstApiRoot);
    });
  });
});
