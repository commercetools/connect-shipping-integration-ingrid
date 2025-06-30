import type { Type } from '@commercetools/platform-sdk';
import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { appLogger } from '../libs/logger';
import { CustomError } from '../libs/fastify/errors';
import type { CustomTypeOptions } from '../clients/commercetools/api.client';
/**
 * Handles the creation and updating of a tax category in commercetools
 *
 * This function checks if a tax category exists with the given key and creates
 * one without a rate if it doesn't exist yet. This tax category is used
 * specifically for Ingrid shipping methods.
 *
 * @param client - The Commercetools API client instance
 * @param key - The unique key identifier for the tax category
 *
 * @returns A promise that resolves to:
 *   - true if the tax category exists or was created successfully
 *   - false if the tax category could not be found or created
 */

const INGRID_CUSTOM_FIELD_NAME_SESSION_ID = 'ingridSessionId';
const INGRID_CUSTOM_FIELD_NAME_TRANSPORT_ORDER_ID = 'ingridTransportOrderId';
const INGRID_CUSTOM_TYPE_RESOURCE_TYPE_ORDER = 'order';
const INGRID_CUSTOM_TYPE_RESOURCE_TYPE_SHIPPING = 'shipping';
const INGRID_CUSTOM_FIELD_LABEL_SESSION_ID = 'Ingrid Session ID';
const INGRID_CUSTOM_FIELD_LABEL_TRANSPORT_ORDER_ID = 'Ingrid Transport Order ID';

export const handleTaxCategoryAction = async (client: CommercetoolsApiClient, key: string): Promise<boolean> => {
  const taxCategoryExists = await client.checkIfTaxCategoryExistsByKey(key);

  if (!taxCategoryExists) {
    const taxCategory = await client.createTaxCategoryWithNullRate(key);

    if (!taxCategory) {
      throw new CustomError({
        message: `[TAX-CATEGORY ERROR]: Tax category with key ${key} is not created`,
        code: 'TAX_CATEGORY_NOT_CREATED',
        httpErrorStatus: 500,
      });
    }

    appLogger.info(
      `[TAX-CATEGORY SUCCESS]: Tax category version ${taxCategory!.version} with key ${taxCategory!.key} was created.`,
    );

    return !!taxCategory;
  }

  appLogger.info(`[TAX-CATEGORY SUCCESS]: Tax category with key ${key} exists.`);
  return taxCategoryExists;
};

/**
 * Handles the creation and updating of a custom type for storing Ingrid session IDs in commercetools
 *
 * This function:
 * 1. Checks if a custom type with the given key exists
 * 2. If it exists, validates and updates it to ensure it has the ingridSessionId field
 * 3. If it doesn't exist, creates a new custom type with the required field
 *
 * @param client - The commercetools API client instance
 * @param key - The unique key identifier for the custom type
 *
 * @returns A promise that resolves to:
 *   - The created/updated Type object if successful
 *   - undefined if the custom type could not be found or created
 *
 * @throws {CustomError} If creation of the custom type fails
 */
export const handleCustomTypeAction = async (
  client: CommercetoolsApiClient,
  key: string,
): Promise<Type | undefined> => {
  const ingridCustomTypeExists = await client.checkIfCustomTypeExistsByKey(key);
  let type: Type | undefined;
  const customTypeOptions: CustomTypeOptions = {
    key,
    name: 'Ingrid Session ID',
    resourceType: INGRID_CUSTOM_TYPE_RESOURCE_TYPE_ORDER,
    customFieldName: INGRID_CUSTOM_FIELD_NAME_SESSION_ID,
    customFieldLabel: INGRID_CUSTOM_FIELD_LABEL_SESSION_ID,
  };
  if (ingridCustomTypeExists) {
    appLogger.info(`[CUSTOM-TYPE VALIDATING]: Custom type with key ${key}`);
    type = await updateType(client, customTypeOptions);
  } else {
    appLogger.info(`[CUSTOM-TYPE CONTINUING]: Custom Type not found, creating with key ${key}`);
    type = await createType(client, customTypeOptions);
  }

  appLogger.info(
    `[CUSTOM-TYPE SUCCESS]: Custom type version ${type!.version} with key ${type!.key} exists and has ingridSessionId field set up.`,
  );
  return type;
};

/**
 * Handles the creation and updating of a shipping custom type for storing Ingrid transport order IDs in commercetools
 *
 * This function:
 * 1. Checks if a shipping custom type with the given key exists
 * 2. If it exists, validates and updates it to ensure it has the ingridTransportOrderId field
 * 3. If it doesn't exist, creates a new shipping custom type with the required field
 *
 * @param client - The commercetools API client instance
 * @param key - The unique key identifier for the custom type
 *
 * @returns A promise that resolves to:
 *   - The created/updated Type object if successful
 *   - undefined if the custom type could not be found or created
 *
 * @throws {CustomError} If creation of the shipping custom type fails
 */
export const handleShippingCustomTypeAction = async (
  client: CommercetoolsApiClient,
  key: string,
): Promise<Type | undefined> => {
  const ingridShippingCustomTypeExists = await client.checkIfCustomTypeExistsByKey(key);
  let type: Type | undefined;
  const customTypeOptions: CustomTypeOptions = {
    key,
    name: 'Ingrid Shipping',
    resourceType: INGRID_CUSTOM_TYPE_RESOURCE_TYPE_SHIPPING,
    customFieldName: INGRID_CUSTOM_FIELD_NAME_TRANSPORT_ORDER_ID,
    customFieldLabel: INGRID_CUSTOM_FIELD_LABEL_TRANSPORT_ORDER_ID,
  };
  if (ingridShippingCustomTypeExists) {
    appLogger.info(`[CUSTOM-TYPE VALIDATING]: Shipping custom type with key ${key}`);
    type = await updateType(client, customTypeOptions);
  } else {
    appLogger.info(`[CUSTOM-TYPE CONTINUING]: Shipping custom Type not found, creating with key ${key}`);
    type = await createType(client, customTypeOptions);
  }

  appLogger.info(
    `[CUSTOM-TYPE SUCCESS]: Shipping custom type version ${type!.version} with key ${type!.key} exists and has ingridTransportOrderId field set up.`,
  );
  return type;
};

async function updateType(client: CommercetoolsApiClient, customTypeOptions: CustomTypeOptions): Promise<Type> {
  let customType = await client.getCustomType(customTypeOptions.key);
  const ingridCustomField = customType.fieldDefinitions.find(({ name }) => name === customTypeOptions.customFieldName);
  if (!customType.resourceTypeIds.includes(customTypeOptions.resourceType)) {
    appLogger.info(
      `[CUSTOM-TYPE NOT FOUND]: Custom type with key ${customTypeOptions.key} does not have ${customTypeOptions.resourceType} resource type`,
    );
    customType = await createType(client, customTypeOptions);
  }
  if (!ingridCustomField) {
    appLogger.info(
      `[CUSTOM-TYPE NOT FOUND]: Custom type with key ${customTypeOptions.key} does not have ${customTypeOptions.customFieldName} field`,
    );
    customType = await createFieldDefinitionOnType(client, customType, customTypeOptions);
  }
  return customType;
}

async function createType(client: CommercetoolsApiClient, customTypeOptions: CustomTypeOptions): Promise<Type> {
  appLogger.info(`[CUSTOM-TYPE CONTINUING]: Creating custom type with key ${customTypeOptions.key}`);

  const customType = await client.createCustomTypeFieldDefinitionForIngrid(customTypeOptions);

  if (!customType) {
    throw new CustomError({
      message: `[CUSTOM-TYPE ERROR]: Custom type with key ${customTypeOptions.key} is not created`,
      code: 'CUSTOM_TYPE_NOT_CREATED',
      httpErrorStatus: 500,
    });
  }

  return customType;
}

async function createFieldDefinitionOnType(
  client: CommercetoolsApiClient,
  customType: Type,
  customTypeOptions: CustomTypeOptions,
): Promise<Type> {
  appLogger.info(
    `[CUSTOM-TYPE CONTINUING]: Creating ${customTypeOptions.customFieldName} field on custom type with key ${customTypeOptions.key}`,
  );
  const updatedCustomType = await client.createIngridCustomFieldDefinitionOnType(customType, customTypeOptions);

  if (!updatedCustomType) {
    throw new CustomError({
      message: `[CUSTOM-TYPE ERROR]: Custom type with key ${customTypeOptions.key} is not updated`,
      code: 'CUSTOM_TYPE_NOT_UPDATED',
      httpErrorStatus: 500,
    });
  }

  return updatedCustomType;
}
