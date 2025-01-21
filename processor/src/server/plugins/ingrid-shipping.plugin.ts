import { FastifyInstance } from 'fastify';
import { shippingRoutes } from '../../routes/ingrid-shipping.route';

import { IngridShippingService } from '../../services/ingrid-shipping.service';
import { CommercetoolsApiClient } from '../../clients/commercetools/api.client';
import { getConfig } from '../../config/config';

export default async function (server: FastifyInstance) {
  const opts = {
    clientId: getConfig().clientId,
    clientSecret: getConfig().clientSecret,
    authUrl: getConfig().authUrl,
    apiUrl: getConfig().apiUrl,
    projectKey: getConfig().projectKey,
  };

  const commercetoolsApiClient: CommercetoolsApiClient = new CommercetoolsApiClient(opts);

  const shippingService = new IngridShippingService(commercetoolsApiClient);

  await server.register(shippingRoutes, {
    shippingService,
  });
}
