import {
  describe,
  beforeEach,
  afterAll,
  it,
  expect,
  jest,
} from '@jest/globals';
import { readConfiguration } from '../../src/utils/config.utils';
import CustomError from '../../src/errors/custom.error';
import * as validatorsHelpers from '../../src/validators/helpers.validators';
import { mockConfiguration } from '../mock/mock-configuration';

jest.mock('../../src/validators/helpers.validators');

describe('Config Utils', () => {
  describe('readConfiguration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
      jest.clearAllMocks();
      jest.mocked(validatorsHelpers.getValidateMessages).mockReturnValue([]);
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should read configuration from environment variables successfully', () => {
      process.env = {
        CTP_CLIENT_ID: mockConfiguration.clientId,
        CTP_CLIENT_SECRET: mockConfiguration.clientSecret,
        CTP_PROJECT_KEY: mockConfiguration.projectKey,
        CTP_SCOPE: mockConfiguration.scope,
        CTP_REGION: mockConfiguration.region,
        INGRID_API_KEY: mockConfiguration.ingridApiKey,
        INGRID_ENVIRONMENT: mockConfiguration.ingridEnvironment,
      };

      const config = readConfiguration();

      expect(config).toEqual(mockConfiguration);

      expect(validatorsHelpers.getValidateMessages).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          clientId: mockConfiguration.clientId,
          clientSecret: mockConfiguration.clientSecret,
          projectKey: mockConfiguration.projectKey,
        })
      );
    });

    it('should throw an error when validation fails', () => {
      // Mock validation error
      jest
        .mocked(validatorsHelpers.getValidateMessages)
        .mockReturnValue(['Error message 1', 'Error message 2']);

      expect(() => readConfiguration()).toThrow(CustomError);
      expect(() => readConfiguration()).toThrow(
        'Invalid Environment Variables please check your .env file'
      );
    });

    it('should handle missing environment variables', () => {
      // Don't set any environment variables
      process.env.CTP_CLIENT_ID = undefined;
      process.env.CTP_CLIENT_SECRET = undefined;
      process.env.CTP_PROJECT_KEY = undefined;

      const config = readConfiguration();

      expect(config).toEqual({
        clientId: undefined,
        clientSecret: undefined,
        projectKey: undefined,
        scope: undefined,
        region: undefined,
        ingridApiKey: undefined,
        ingridEnvironment: undefined,
      });
    });
  });
});
