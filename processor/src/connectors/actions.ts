import type { Type } from '@commercetools/platform-sdk';
import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { appLogger } from '../libs/logger';
import { CustomError } from '../libs/fastify/errors';

export const handleCustomTypeAction = async (
  client: CommercetoolsApiClient,
  key: string,
): Promise<Type | undefined> => {
  const ingridCustomTypeExists = await client.checkIfCustomTypeExistsByKey(key);
  let type: Type | undefined;
  if (ingridCustomTypeExists) {
    appLogger.info(`[VALIDATING]: Custom type with key ${key}`);
    type = await updateType(client, key);
  } else {
    appLogger.info(`[CONTINUING]: Custom Type not found, creating with key ${key}`);
    type = await createType(client, key);
  }
  appLogger.info(
    `[SUCCESS]: Custom type version ${type!.version} with key ${type!.key} exists and has ingridSessionId field set up.`,
  );
  return type;
};

async function updateType(client: CommercetoolsApiClient, key: string): Promise<Type> {
  let customType = await client.getCustomType(key);
  const ingridSessionId = customType.fieldDefinitions.find(({ name }) => name === 'ingridSessionId');

  if (!ingridSessionId) {
    appLogger.info(`[NOT FOUND]: Custom type with key ${key} does not have ingridSessionId field`);
    customType = await createFieldDefinitionOnType(client, customType);
  }

  return customType;
}

async function createType(client: CommercetoolsApiClient, key: string): Promise<Type> {
  const customType = await client.createCustomTypeFieldDefinitionForIngridSessionId(key);
  if (!customType) {
    throw new CustomError({
      message: `[ERROR]: Custom type with key ${key} is not created`,
      code: 'CUSTOM_TYPE_NOT_CREATED',
      httpErrorStatus: 500,
    });
  }
  return customType;
}

async function createFieldDefinitionOnType(client: CommercetoolsApiClient, customType: Type): Promise<Type> {
  appLogger.info(`[CONTINUING]: Creating ingridSessionId field on custom type with key ${customType.key}`);
  const updatedCustomType = await client.createIngridSessionIdFieldDefinitionOnType(customType);

  if (!updatedCustomType) {
    throw new CustomError({
      message: `[ERROR]: Custom type with key ${customType.key} is not updated`,
      code: 'CUSTOM_TYPE_NOT_UPDATED',
      httpErrorStatus: 500,
    });
  }

  return updatedCustomType;
}

/* export const handleTaxCategoryAction = async (client: CommercetoolsApiClient, key: string): Promise<boolean> => {
  const taxCategory = true;
  //appLogger.info(`[SUCCESS]: Tax category version ${taxCategory!.version} with key ${taxCategory!.key} exists.`);

  return taxCategory;
}; */
