import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  InitSessionResponseSchema,
  InitSessionResponseSchemaDTO,
  UpdateSessionResponseSchema,
  UpdateSessionResponseSchemaDTO,
} from '../dtos/ingrid-shipping.dto';
import { IngridShippingService } from '../services/ingrid-shipping.service';
import { SessionHeaderAuthenticationHook } from '../libs/auth/hooks';

type ShippingRoutesOptions = {
  shippingService: IngridShippingService;
  sessionHeaderAuthenticationHook: SessionHeaderAuthenticationHook;
};

export const shippingRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & ShippingRoutesOptions) => {
  fastify.post<{
    Reply: InitSessionResponseSchemaDTO;
  }>(
    '/sessions/init',
    {
      preHandler: [opts.sessionHeaderAuthenticationHook.authenticate()],
      schema: {
        response: {
          200: InitSessionResponseSchema,
        },
      },
    },

    async (_, reply) => {
      const { data } = await opts.shippingService.init();
      return reply.status(200).send(data);
    },
  );

  fastify.post<{
    Reply: UpdateSessionResponseSchemaDTO;
  }>(
    '/sessions/update',
    {
      preHandler: [opts.sessionHeaderAuthenticationHook.authenticate()],
      schema: {
        response: {
          200: UpdateSessionResponseSchema,
        },
      },
    },

    async (_, reply) => {
      const { data } = await opts.shippingService.update();
      return reply.status(200).send(data);
    },
  );
};
