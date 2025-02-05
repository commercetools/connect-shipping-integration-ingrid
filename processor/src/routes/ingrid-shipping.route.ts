import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { InitSessionResponseSchema, InitSessionResponseSchemaDTO } from '../dtos/ingrid-shipping.dto';
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

    async (request, reply) => {
      try {
        const { data } = await opts.shippingService.init();
        return reply.status(200).send(data);
      } catch (error) {
        console.error('Error initializing Ingrid session', error);
        return reply.status(500).send({ success: false, message: 'Error initializing Ingrid session' });
      }
    },
  );

  fastify.post<{
    Reply: InitSessionResponseSchemaDTO;
  }>(
    '/sessions/update',
    {
      preHandler: [opts.sessionHeaderAuthenticationHook.authenticate()],
      schema: {
        response: {
          200: InitSessionResponseSchema,
        },
      },
    },

    async (request, reply) => {
      try {
        const { data } = await opts.shippingService.update();
        return reply.status(200).send(data);
      } catch (error) {
        console.error('Error updating Ingrid session', error);
        return reply.status(500).send({ success: false, message: 'Error updating Ingrid session' });
      }
    },
  );
};
