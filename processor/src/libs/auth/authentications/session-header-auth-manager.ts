import { AuthenticationManager } from '../types';
import { HeaderBasedAuthentication, SessionAuthentication } from '.';
import { DefaultSessionService } from '../services';
import { ErrorAuthErrorResponse } from '../../fastify/errors';
import { appLogger } from '../../logger';

export class SessionHeaderAuthenticationManager implements AuthenticationManager {
  private sessionService: DefaultSessionService;
  // @ts-expect-error: logger is not yet used
  private logger: typeof appLogger;

  constructor(opts: { sessionService: DefaultSessionService; logger: typeof appLogger }) {
    this.sessionService = opts.sessionService;
    this.logger = opts.logger;
  }

  async authenticate(authentication: HeaderBasedAuthentication): Promise<SessionAuthentication> {
    const principal = authentication.getPrincipal();
    console.log('principal', principal);
    try {
      console.log('session1');
      const session = await this.sessionService.verifySession(principal.authHeader);
      console.log('session2');
      return new SessionAuthentication(principal.authHeader, {
        cartId: this.sessionService.getCartFromSession(session),
        processorUrl: this.sessionService.getProcessorUrlFromSession(session),
        correlationId: this.sessionService.getCorrelationIdFromSession(session),
      });
    } catch (e) {
      throw new ErrorAuthErrorResponse('Session is not active', {
        cause: e,
      });
    }
  }
}
