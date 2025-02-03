import { AuthenticationManager } from './types/authn.type';
import { HeaderBasedAuthentication, SessionAuthentication } from './authns';
import { DefaultSessionService } from './services/ctSession.service';
import { ErrorAuthErrorResponse } from '../fastify/errors/auth.error';
import { appLogger } from '../logger';

export class SessionHeaderAuthenticationManager implements AuthenticationManager {
  private sessionService: DefaultSessionService;
  private logger: typeof appLogger;

  constructor(opts: { sessionService: DefaultSessionService; logger: typeof appLogger }) {
    this.sessionService = opts.sessionService;
    this.logger = opts.logger;
  }

  async authenticate(authentication: HeaderBasedAuthentication): Promise<SessionAuthentication> {
    const principal = authentication.getPrincipal();
    try {
      const session = await this.sessionService.verifySession(principal.authHeader);

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
