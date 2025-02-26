import '@fastify/request-context';
import { ContextData, SessionContextData } from './libs/fastify/context';
import type { Env } from './server/Env';

declare module '@fastify/request-context' {
  interface RequestContextData {
    request: ContextData;
    session?: SessionContextData;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vite: any;
    environmentVariables: Env;
  }

  export interface FastifyRequest {
    correlationId?: string;
  }
}
