import { describe, test, expect, afterEach, jest } from '@jest/globals';
import { additionalType, type } from '../mock/mock-type';
import { CommercetoolsApiClient } from '../../src/clients/commercetools/api.client';
import { handleCustomTypeAction, handleTaxCategoryAction } from '../../src/connectors/actions';
import { appLogger } from '../../src/libs/logger';
import { CustomError } from '../../src/libs/fastify/errors';
import { TaxCategory, Type } from '@commercetools/platform-sdk';

jest.mock('../../src/clients/commercetools/api.client');

describe('actions', () => {
  const mockClient = new CommercetoolsApiClient({
    clientId: 'dummy',
    clientSecret: 'dummy',
    authUrl: 'dummy',
    apiUrl: 'dummy',
    projectKey: 'dummy',
    logger: appLogger,
  });

  beforeEach(() => {
    jest.spyOn(appLogger, 'info').mockImplementation(() => appLogger);
    jest.spyOn(appLogger, 'error').mockImplementation(() => appLogger);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('handleCustomTypeAction', () => {
    test('should create new custom type when it does not exist', async () => {
      jest.spyOn(mockClient, 'checkIfCustomTypeExistsByKey').mockResolvedValue(false);
      jest.spyOn(mockClient, 'createCustomTypeFieldDefinitionForIngridSessionId').mockResolvedValue(type);

      const result = await handleCustomTypeAction(mockClient, 'ingrid-session');

      expect(result).toBeDefined();
      expect(appLogger.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[CUSTOM-TYPE CONTINUING\].*creating.*ingrid-session/),
      );
    });

    test('should update existing custom type with existing fieldDefinition when ingridSessionId field is missing', async () => {
      const mockTypeWithIngridSessionId: Type = {
        ...additionalType,
        fieldDefinitions: [
          ...additionalType.fieldDefinitions,
          {
            name: 'ingridSessionId',
            label: { en: 'Ingrid Session ID' },
            required: true,
            type: { name: 'String' },
            inputHint: 'SingleLine',
          },
        ],
      };

      jest.spyOn(mockClient, 'checkIfCustomTypeExistsByKey').mockResolvedValue(true);
      jest.spyOn(mockClient, 'getCustomType').mockResolvedValue(additionalType);
      jest
        .spyOn(mockClient, 'createIngridSessionIdFieldDefinitionOnType')
        .mockResolvedValue(mockTypeWithIngridSessionId);

      const result = await handleCustomTypeAction(mockClient, 'dummy-type-key');

      expect(result).toBe(mockTypeWithIngridSessionId);
      expect(appLogger.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[CUSTOM-TYPE NOT FOUND\].*does not have ingridSessionId field/),
      );
    });

    test('should update existing custom type when fieldDefinition is missing', async () => {
      const typeWithoutFieldDefinition = { ...type, fieldDefinitions: [] };

      jest.spyOn(mockClient, 'checkIfCustomTypeExistsByKey').mockResolvedValue(true);
      jest.spyOn(mockClient, 'getCustomType').mockResolvedValue(typeWithoutFieldDefinition);
      jest.spyOn(mockClient, 'createIngridSessionIdFieldDefinitionOnType').mockResolvedValue(type);

      const result = await handleCustomTypeAction(mockClient, 'ingrid-session');

      expect(result).toBeDefined();
      expect(appLogger.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[CUSTOM-TYPE NOT FOUND\].*does not have ingridSessionId field/),
      );
    });

    test('should throw error when custom type creation fails', async () => {
      jest.spyOn(mockClient, 'checkIfCustomTypeExistsByKey').mockResolvedValue(false);
      jest.spyOn(mockClient, 'createCustomTypeFieldDefinitionForIngridSessionId').mockImplementation(() => {
        throw new CustomError({
          message: '[CUSTOM-TYPE ERROR]: Custom type with key ingrid-session is not created',
          code: 'CUSTOM_TYPE_NOT_CREATED',
          httpErrorStatus: 500,
        });
      });

      await expect(handleCustomTypeAction(mockClient, 'ingrid-session')).rejects.toThrow(CustomError);
      await expect(handleCustomTypeAction(mockClient, 'ingrid-session')).rejects.toThrow(
        '[CUSTOM-TYPE ERROR]: Custom type with key ingrid-session is not created',
      );
    });
  });

  describe('handleTaxCategoryAction', () => {
    test('should create new tax category when it does not exist', async () => {
      const mockTaxCategory: TaxCategory = {
        key: 'ingrid-tax',
        name: 'ingrid-tax',
        version: 1,
        id: 'tax-id',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastModifiedAt: '2024-01-01T00:00:00.000Z',
        rates: [],
      };

      jest.spyOn(mockClient, 'checkIfTaxCategoryExistsByKey').mockResolvedValue(false);
      jest.spyOn(mockClient, 'createTaxCategoryWithNullRate').mockResolvedValue(mockTaxCategory);

      const result = await handleTaxCategoryAction(mockClient, 'ingrid-tax');

      expect(result).toBe(true);
      expect(appLogger.info).toHaveBeenCalledWith(expect.stringMatching(/\[TAX-CATEGORY SUCCESS\].*ingrid-tax/));
    });

    test('should return true when tax category already exists', async () => {
      jest.spyOn(mockClient, 'checkIfTaxCategoryExistsByKey').mockResolvedValue(true);

      const result = await handleTaxCategoryAction(mockClient, 'ingrid-tax');

      expect(result).toBe(true);
      expect(appLogger.info).toHaveBeenCalledWith(expect.stringMatching(/\[TAX-CATEGORY SUCCESS\].*ingrid-tax exists/));
    });

    test('should throw error when tax category creation fails', async () => {
      jest.spyOn(mockClient, 'checkIfTaxCategoryExistsByKey').mockResolvedValue(false);
      jest.spyOn(mockClient, 'createTaxCategoryWithNullRate').mockImplementation(() => {
        throw new CustomError({
          message: '[TAX-CATEGORY ERROR]: Tax category with key ingrid-tax is not created',
          code: 'TAX_CATEGORY_NOT_CREATED',
          httpErrorStatus: 500,
        });
      });

      await expect(handleTaxCategoryAction(mockClient, 'ingrid-tax')).rejects.toThrow(CustomError);
      await expect(handleTaxCategoryAction(mockClient, 'ingrid-tax')).rejects.toThrow(
        '[TAX-CATEGORY ERROR]: Tax category with key ingrid-tax is not created',
      );
    });
  });
});
