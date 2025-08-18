import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  InitSessionRequestSchema,
  InitSessionResponseSchema,
  type InitSessionResponseSchemaDTO,
  type InitSessionRequestSchemaDTO,
  UpdateSessionRequestSchema,
  UpdateSessionResponseSchema,
  type UpdateSessionRequestSchemaDTO,
  type UpdateSessionResponseSchemaDTO,
} from '../dtos/ingrid-shipping.dto';
import { IngridShippingService } from '../services/ingrid-shipping.service';
import { SessionHeaderAuthenticationHook } from '../libs/auth/hooks';

type ShippingRoutesOptions = {
  shippingService: IngridShippingService;
  sessionHeaderAuthenticationHook: SessionHeaderAuthenticationHook;
};

export const shippingRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions & ShippingRoutesOptions) => {
  fastify.post<{
    Body: InitSessionRequestSchemaDTO;
    Reply: InitSessionResponseSchemaDTO;
  }>(
    '/sessions/init',
    {
      preHandler: [opts.sessionHeaderAuthenticationHook.authenticate()],
      schema: {
        body: InitSessionRequestSchema,
        response: {
          200: InitSessionResponseSchema,
        },
      },
    },

    async (request, reply) => {
      const voucherCodes = request.body?.voucherCodes;
      const { data } = await opts.shippingService.init(voucherCodes);
      return reply.status(200).send(data);
    },
  );

  fastify.post<{
    Body: UpdateSessionRequestSchemaDTO;
    Reply: UpdateSessionResponseSchemaDTO;
  }>(
    '/sessions/update',
    {
      preHandler: [opts.sessionHeaderAuthenticationHook.authenticate()],
      schema: {
        body: UpdateSessionRequestSchema,
        response: {
          200: UpdateSessionResponseSchema,
        },
      },
    },

    async (request, reply) => {
      const voucherCodes = request.body?.voucherCodes;
      const { data } = await opts.shippingService.update(voucherCodes);
      return reply.status(200).send(data);
    },
  );
};
