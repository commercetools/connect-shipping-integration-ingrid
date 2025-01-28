import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  InitSessionRequestSchema,
  InitSessionRequestSchemaDTO,
  InitSessionResponseSchema,
  InitSessionResponseSchemaDTO,
} from '../dtos/ingrid-shipping.dto';
import { IngridShippingService } from '../services/ingrid-shipping.service';

type ShippingRoutesOptions = {
  shippingService: IngridShippingService;
};

export const shippingRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & ShippingRoutesOptions) => {
  fastify.post<{
    Body: InitSessionRequestSchemaDTO | null;
    Reply: InitSessionResponseSchemaDTO | any;
  }>(
    '/sessions/init',
    {
      preHandler: [],
      schema: {
        body: InitSessionRequestSchema,
        response: {
          200: InitSessionResponseSchema,
        },
      },
    },

    async (request, reply) => {
      const session = await opts.shippingService.init(request.body?.sessionId);
      return reply.status(200).send(session);
    },
  );

  fastify.post<{
    Body: InitSessionRequestSchemaDTO;
    Reply: InitSessionResponseSchemaDTO;
  }>(
    '/sessions/update',
    {
      preHandler: [],
      schema: {
        body: InitSessionRequestSchema,
      },
    },

    async (request, reply) => {
      const session = await opts.shippingService.update(request.body?.sessionId || '');
      // @ts-ignore
      return reply.status(200).send(session);
    },
  );

  fastify.post<{
    Body: InitSessionRequestSchemaDTO;
    Reply: InitSessionResponseSchemaDTO;
  }>(
    '/sessions/complete',
    {
      preHandler: [],
      schema: {
        body: InitSessionRequestSchema,
      },
    },

    async (request, reply) => {
      const session = await opts.shippingService.complete(request.body?.sessionId || '');
      // @ts-ignore
      return reply.status(200).send(session);
    },
  );
};
