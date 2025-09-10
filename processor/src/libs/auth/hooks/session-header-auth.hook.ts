import type { IncomingHttpHeaders } from 'node:http';
import type { ContextProvider, RequestContextData } from '../../fastify/context';
import type { AuthenticationHook } from '../types';
import { HeaderBasedAuthentication, SessionHeaderAuthenticationManager } from '../authentications';
import { appLogger } from '../../logger';

export class SessionHeaderAuthenticationHook implements AuthenticationHook {
  private authenticationManager: SessionHeaderAuthenticationManager;
  private contextProvider: ContextProvider<RequestContextData>;
  // @ts-expect-error: logger is not yet used
  private logger: typeof appLogger;

  constructor(opts: {
    authenticationManager: SessionHeaderAuthenticationManager;
    contextProvider: ContextProvider<RequestContextData>;
    logger: typeof appLogger;
  }) {
    this.authenticationManager = opts.authenticationManager;
    this.contextProvider = opts.contextProvider;
    this.logger = opts.logger;
  }

  authenticate() {
    return async (request: { headers: IncomingHttpHeaders; query?: any }) => {
      const sessionIdAuthn = new HeaderBasedAuthentication(request.headers['x-session-id'] as string);
      const authn = await this.authenticationManager.authenticate(sessionIdAuthn);
      const correlationId = authn.getPrincipal().correlationId;

      this.contextProvider.updateContextData({
        authentication: authn,
        ...(correlationId && { correlationId }),
      });
    };
  }
}
