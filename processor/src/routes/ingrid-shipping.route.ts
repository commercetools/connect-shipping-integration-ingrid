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
    Body: InitSessionRequestSchemaDTO;
    Reply: InitSessionResponseSchemaDTO;
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
      await opts.shippingService.init();
      return reply.status(200).send({ result: 'OK' });
    },
  );
};
