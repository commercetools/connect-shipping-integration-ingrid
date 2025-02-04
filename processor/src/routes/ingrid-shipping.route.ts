import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  InitSessionRequestSchema,
  InitSessionRequestSchemaDTO,
  InitSessionResponseSchema,
  InitSessionResponseSchemaDTO,
} from '../dtos/ingrid-shipping.dto';
import { IngridShippingService } from '../services/ingrid-shipping.service';
import { SessionHeaderAuthenticationHook } from '@commercetools/connect-payments-sdk';

type ShippingRoutesOptions = {
  shippingService: IngridShippingService;
  sessionHeaderAuthenticationHook: SessionHeaderAuthenticationHook;
};

export const shippingRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & ShippingRoutesOptions) => {
  fastify.post<{
    Body: unknown;
    Reply: unknown;
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
    Body: InitSessionRequestSchemaDTO;
    Reply: InitSessionResponseSchemaDTO;
  }>(
    '/sessions/update',
    {
      preHandler: [opts.sessionHeaderAuthenticationHook.authenticate()],
      schema: {
        body: InitSessionRequestSchema,
      },
    },

    async (request, reply) => {
      await opts.shippingService.update();
      return reply.status(200).send();
    },
  );
};
