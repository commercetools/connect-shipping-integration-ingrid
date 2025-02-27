import type { FastifyInstance } from 'fastify';
import { shippingRoutes } from '../../routes/ingrid-shipping.route';
import { IngridShippingService } from '../../services/ingrid-shipping.service';
import { IngridApiClient } from '../../clients/ingrid/ingrid.client';
import { CommercetoolsApiClient } from '../../clients/commercetools/api.client';
import { appLogger } from '../../libs/logger';
import { getRequestContext, type RequestContextData, updateRequestContext } from '../../libs/fastify/context';
import { SessionHeaderAuthInitializer } from '../../libs/auth';
import type { IngridClientOptions } from '../../clients/ingrid/types/ingrid.client.type';

export default async function (server: FastifyInstance) {
  const opts = {
    clientId: server.environmentVariables.CTP_CLIENT_ID,
    clientSecret: server.environmentVariables.CTP_CLIENT_SECRET,
    authUrl: server.environmentVariables.CTP_AUTH_URL,
    apiUrl: server.environmentVariables.CTP_API_URL,
    projectKey: server.environmentVariables.CTP_PROJECT_KEY,
    sessionUrl: server.environmentVariables.CTP_SESSION_URL,
    logger: appLogger,
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
  };

  const ingridOpts: IngridClientOptions = {
    apiSecret: server.environmentVariables.INGRID_API_KEY,
    environment: server.environmentVariables.INGRID_ENVIRONMENT,
  };

  const commercetoolsApiClient: CommercetoolsApiClient = new CommercetoolsApiClient(opts);
  const ingridApiClient: IngridApiClient = new IngridApiClient(ingridOpts);

  const sessionHeaderAuthInitializer = new SessionHeaderAuthInitializer(opts);

  const shippingService = new IngridShippingService(commercetoolsApiClient, ingridApiClient);

  await server.register(shippingRoutes, {
    shippingService,
    sessionHeaderAuthenticationHook: sessionHeaderAuthInitializer.getSessionHeaderAuthHookFn(),
  });
}
