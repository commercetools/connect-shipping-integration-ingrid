import { IncomingHttpHeaders } from 'node:http';
import { ContextProvider, RequestContextData } from '../../fastify/context';
import { SessionHeaderAuthenticationManager, HeaderBasedAuthentication } from '../authentications';
import { AuthenticationHook } from '../types';
import { appLogger } from '../../logger';

export class SessionHeaderAuthenticationHook implements AuthenticationHook {
  private authenticationManager: SessionHeaderAuthenticationManager;
  private contextProvider: ContextProvider<RequestContextData>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
