import * as dotenv from 'dotenv';
import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { appLogger } from '../libs/logger';
import { handleCustomTypeAction, handleTaxCategoryAction } from './actions';

dotenv.config();

/**
 * Executes post-deployment setup tasks for the Ingrid connector
 *
 * @remarks
 * This function performs two main tasks:
 * 1. Sets up a custom type for storing Ingrid session IDs, if it doesn't exist
 * 2. Creates a tax category specifically for Ingrid if it doesn't exist
 *
 * @param _properties - Map containing environment variables and configuration properties
 * @param _properties.CTP_CLIENT_ID - Commercetools API client ID
 * @param _properties.CTP_CLIENT_SECRET - Commercetools API client secret
 * @param _properties.CTP_AUTH_URL - Commercetools auth URL
 * @param _properties.CTP_API_URL - Commercetools API URL
 * @param _properties.CTP_PROJECT_KEY - Commercetools project key
 * @param _properties.INGRID_SESSION_CUSTOM_TYPE_KEY - Key for the Ingrid session custom type (defaults to 'ingrid-session')
 * @param _properties.INGRID_SPECIFIC_TAX_CATEGORY_KEY - Key for the Ingrid tax category (defaults to 'ingrid-tax')
 *
 * @returns Promise that resolves when post-deployment tasks are complete
 *
 * @throws Will throw an error if either the custom type or tax category setup fails
 */
async function postDeploy(_properties: Map<string, unknown>) {
	const client = new CommercetoolsApiClient({
		clientId: _properties.get('CTP_CLIENT_ID') as string,
		clientSecret: _properties.get('CTP_CLIENT_SECRET') as string,
		authUrl: _properties.get('CTP_AUTH_URL') as string,
		apiUrl: _properties.get('CTP_API_URL') as string,
		projectKey: _properties.get('CTP_PROJECT_KEY') as string,
		logger: appLogger,
	});

	const ingridCustomTypeKey = _properties.get('INGRID_SESSION_CUSTOM_TYPE_KEY') as string; // default: ingrid-session
	const ingridTaxCategoryKey = _properties.get('INGRID_SPECIFIC_TAX_CATEGORY_KEY') as string; // default: ingrid-tax

	await Promise.all([
		handleCustomTypeAction(client, ingridCustomTypeKey),
		handleTaxCategoryAction(client, ingridTaxCategoryKey),
	]);
}

async function run() {
	try {
		const properties = new Map(Object.entries(process.env));
		await postDeploy(properties);
	} catch (error) {
		if (error instanceof Error) {
			process.stderr.write(`Post-deploy failed: ${error.message}\n`);
		}
		process.exitCode = 1;
	}
}

run();
