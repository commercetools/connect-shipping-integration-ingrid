import autoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import fastifyFormBody from '@fastify/formbody';
import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { join } from 'path';
import { requestContextPlugin } from '../libs/fastify/context';
import { errorHandler } from '../libs/fastify/error-handler';
import { configureEnvironmentVariables } from './Env';

/**
 * Setup Fastify server instance
 * @returns
 */
export const setupFastify = async () => {
  // Create fastify server instance
  const server = Fastify({
    logger: {
      level: process.env.LOGGER_LEVEL || 'info',
    },
    genReqId: () => randomUUID().toString(),
    requestIdLogLabel: 'requestId',
    requestIdHeader: 'x-request-id',
  });

  await configureEnvironmentVariables(server);

  // Setup error handler
  server.setErrorHandler(errorHandler);

  // Enable CORS
  await server.register(cors, {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Request-ID', 'X-Session-ID'],
    origin: '*',
  });

  // Add content type parser for the content type application/x-www-form-urlencoded
  await server.register(fastifyFormBody);

  // Register context plugin
  await server.register(requestContextPlugin);

  await server.register(autoLoad, {
    dir: join(__dirname, 'plugins'),
  });

  return server;
};
