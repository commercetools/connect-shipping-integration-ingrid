import { FastifyInstance } from 'fastify';
import { shippingRoutes } from '../../routes/ingrid-shipping.route';
import { IngridShippingService } from '../../services/ingrid-shipping.service';
import { IngridApiClient } from '../../clients/ingrid/ingrid.client';
import { getConfig } from '../../config';
import { CommercetoolsApiClient } from '../../clients/commercetools/api.client';
import { appLogger } from '../../libs/logger';
import { RequestContextData, updateRequestContext, getRequestContext } from '../../libs/fastify/context';
import { SessionHeaderAuthInitializer } from '../../libs/auth';

export default async function (server: FastifyInstance) {
  const opts = {
    clientId: getConfig().clientId,
    clientSecret: getConfig().clientSecret,
    authUrl: getConfig().authUrl,
    apiUrl: getConfig().apiUrl,
    projectKey: getConfig().projectKey,
    sessionUrl: getConfig().sessionUrl,
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

  const ingridOpts = {
    apiSecret: getConfig().ingridApiKey,
    environment: getConfig().ingridEnvironment as 'STAGING' | 'PRODUCTION',
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
