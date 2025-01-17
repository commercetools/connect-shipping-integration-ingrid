import { FastifyInstance } from 'fastify';
import { shippingRoutes } from '../../routes/ingrid-shipping.route';

import { IngridShippingService } from '../../services/ingrid-shipping.service';
import { CommercetoolsApiClient } from '../../clients/api.client';
import { config } from '../../config/config';

export default async function (server: FastifyInstance) {
  const opts = {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authUrl: config.authUrl,
    apiUrl: config.apiUrl,
    projectKey: config.projectKey,
  };

  const commercetoolsApiClient: CommercetoolsApiClient = new CommercetoolsApiClient(opts);

  const shippingService = new IngridShippingService(commercetoolsApiClient);

  await server.register(shippingRoutes, {
    shippingService,
  });
}
