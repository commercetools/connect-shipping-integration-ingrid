import {
  describe,
  beforeEach,
  afterAll,
  it,
  expect,
  jest,
} from '@jest/globals';
import { readConfiguration } from '../../../src/utils/config.utils';
import CustomError from '../../../src/errors/custom.error';
import * as validatorsHelpers from '../../../src/validators/helpers.validators';

jest.mock('../../../src/validators/helpers.validators');

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
        CTP_CLIENT_ID: 'mockedClientId',
        CTP_CLIENT_SECRET: 'mockedClientSecret',
        CTP_PROJECT_KEY: 'mockedProjectKey',
        CTP_SCOPE: 'mockedScope',
        CTP_REGION: 'mockedRegion',
        INGRID_API_KEY: 'mockedApiKey',
        INGRID_ENVIRONMENT: 'mockedEnvironment',
      };

      const config = readConfiguration();

      expect(config).toEqual({
        clientId: 'mockedClientId',
        clientSecret: 'mockedClientSecret',
        projectKey: 'mockedProjectKey',
        scope: 'mockedScope',
        region: 'mockedRegion',
        ingridApiKey: 'mockedApiKey',
        ingridEnvironment: 'mockedEnvironment',
      });

      expect(validatorsHelpers.getValidateMessages).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          clientId: 'mockedClientId',
          clientSecret: 'mockedClientSecret',
          projectKey: 'mockedProjectKey',
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
