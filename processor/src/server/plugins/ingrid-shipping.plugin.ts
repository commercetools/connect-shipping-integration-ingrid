import { FastifyInstance } from 'fastify';
import { shippingRoutes } from '../../routes/ingrid-shipping.route';

import { IngridShippingService } from '../../services/ingrid-shipping.service';
import { CommercetoolsApiClient } from '../../clients/api.client';
import { getConfig } from '../../config/config';
import { IngridApiClient } from '../../clients/ingrid.client';

export default async function (server: FastifyInstance) {
  const opts = {
    clientId: getConfig().clientId,
    clientSecret: getConfig().clientSecret,
    authUrl: getConfig().authUrl,
    apiUrl: getConfig().apiUrl,
    projectKey: getConfig().projectKey,
  };

  const ingridOpts = {
    apiSecret: getConfig().ingridApiKey,
    apiUrl: getConfig().ingridApiUrl,
  };

  const commercetoolsApiClient: CommercetoolsApiClient = new CommercetoolsApiClient(opts);
  const ingridApiClient: IngridApiClient = new IngridApiClient(ingridOpts);

  const shippingService = new IngridShippingService(commercetoolsApiClient, ingridApiClient);

  await server.register(shippingRoutes, {
    shippingService,
  });
}
