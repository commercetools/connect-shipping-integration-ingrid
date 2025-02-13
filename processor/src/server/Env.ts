import { FastifyInstance } from 'fastify';
import fastifyEnv from '@fastify/env';
import { Static, Type } from '@sinclair/typebox';

const schema = {
  type: 'object',
  required: [
    'CTP_PROJECT_KEY',
    'CTP_CLIENT_ID',
    'CTP_CLIENT_SECRET',
    'CTP_AUTH_URL',
    'CTP_API_URL',
    'CTP_SESSION_URL',
    'LOGGER_LEVEL',
    'INGRID_API_KEY',
    'INGRID_ENVIRONMENT',
    'npm_package_version',
    'npm_package_name',
  ],
  properties: {
    CTP_PROJECT_KEY: { type: 'string' },
    CTP_CLIENT_ID: { type: 'string' },
    CTP_CLIENT_SECRET: { type: 'string' },
    CTP_AUTH_URL: { type: 'string' },
    CTP_API_URL: { type: 'string' },
    CTP_SESSION_URL: { type: 'string' },
    LOGGER_LEVEL: { type: 'string', default: 'info' },
    INGRID_API_KEY: { type: 'string' },
    INGRID_ENVIRONMENT: { type: 'string', enum: ['STAGING', 'PRODUCTION'] },
    npm_package_version: { type: 'string' },
    npm_package_name: { type: 'string' },
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const typeboxSchema = Type.Object({
  CTP_PROJECT_KEY: Type.String(),
  CTP_CLIENT_ID: Type.String(),
  CTP_CLIENT_SECRET: Type.String(),
  CTP_AUTH_URL: Type.String(),
  CTP_API_URL: Type.String(),
  CTP_SESSION_URL: Type.String(),
  LOGGER_LEVEL: Type.String(),
  INGRID_API_KEY: Type.String(),
  INGRID_ENVIRONMENT: Type.Enum({
    STAGING: 'STAGING',
    PRODUCTION: 'PRODUCTION',
  }),
  npm_package_version: Type.String(),
  npm_package_name: Type.String(),
});

export type Env = Static<typeof typeboxSchema>;

const options = {
  confKey: 'environmentVariables',
  schema: schema,
  dotenv: true,
};

/**
 * Configures environment variables for the Fastify server using @fastify/env plugin.
 * This function registers environment variables according to the defined schema and
 * makes them available through server.config.
 */
export async function configureEnvironmentVariables(server: FastifyInstance): Promise<Env> {
  await server.register(fastifyEnv, options);
  return server.environmentVariables as Env;
}

declare module 'fastify' {
  interface FastifyInstance {
    environmentVariables: Env;
  }
}
