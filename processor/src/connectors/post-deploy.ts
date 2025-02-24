import * as dotenv from 'dotenv';
import { CommercetoolsApiClient } from '../clients/commercetools/api.client';
import { type RequestContextData, getRequestContext, updateRequestContext } from '../libs/fastify/context';
import { appLogger } from '../libs/logger';
import { handleCustomTypeAction } from './actions';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function postDeploy(_properties: Map<string, unknown>) {
  const client = new CommercetoolsApiClient({
    clientId: _properties.get('CTP_CLIENT_ID') as string,
    clientSecret: _properties.get('CTP_CLIENT_SECRET') as string,
    authUrl: _properties.get('CTP_AUTH_URL') as string,
    apiUrl: _properties.get('CTP_API_URL') as string,
    projectKey: _properties.get('CTP_PROJECT_KEY') as string,
    getContextFn: (): RequestContextData => {
      const { correlationId, requestId, authentication } = getRequestContext();
      return {
        correlationId: correlationId || '',
        requestId: requestId || '',
        authentication,
      };
    },
    updateContextFn: (context: Partial<RequestContextData>) => {
      const requestContext = Object.assign(
        {},
        context.correlationId ? { correlationId: context.correlationId } : {},
        context.requestId ? { requestId: context.requestId } : {},
        context.authentication ? { authentication: context.authentication } : {},
      );
      updateRequestContext(requestContext);
    },
    logger: appLogger,
  });

  const ingridCustomTypeKey = _properties.get('INGRID_SESSION_CUSTOM_TYPE_KEY') as string; // default: ingrid-session
  //const ingridTaxCategoryKey = _properties.get('INGRID_SPECIFIC_TAX_CATEGORY_KEY') as string; // default: ingrid-tax

  await handleCustomTypeAction(client, ingridCustomTypeKey);
  //await handleTaxCategoryAction(client, ingridTaxCategoryKey)
}

async function run() {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
    process.exit(0);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      process.stderr.write(`Post-deploy failed: ${error.message}\n`);
    }
    process.exitCode = 1;
  }
}

run();
