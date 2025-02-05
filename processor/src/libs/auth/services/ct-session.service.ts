import { appLogger } from '../../logger';
import { ErrorAuthErrorResponse, GeneralError } from '../../fastify/errors';
import { AuthorizationService, CommercetoolsToken, Session, SessionService } from '../types';

export class DefaultSessionService implements SessionService {
  private authorizationService: AuthorizationService;
  private sessionUrl: string;
  private projectKey: string;
  protected token: CommercetoolsToken | undefined;
  private logger: typeof appLogger;

  constructor(opts: {
    authorizationService: AuthorizationService;
    sessionUrl: string;
    projectKey: string;
    logger: typeof appLogger;
  }) {
    this.authorizationService = opts.authorizationService;
    this.sessionUrl = opts.sessionUrl;
    this.projectKey = opts.projectKey;
    this.logger = opts.logger;
  }

  async verifySession(sessionId: string): Promise<Session> {
    if (!this.token) {
      this.token = await this.authorizationService.getAccessToken();
    }

    let res = await this.getSession(sessionId);
    // If commercetools oauth token is expired, get a new one and retry
    if (res.status === 401 || res.status === 403) {
      this.token = await this.authorizationService.getAccessToken();
      res = await this.getSession(sessionId);
    }

    if (res.status === 404) {
      throw new ErrorAuthErrorResponse('commercetools session not found', {
        privateFields: {
          status: res.status,
          statusText: res.statusText,
        },
      });
    }

    if (!res.ok) {
      throw new GeneralError('Could not get commercetools session', {
        privateFields: {
          status: res.status,
          statusText: res.statusText,
        },
      });
    }

    const session = (await res.json()) as Session;
    if (session.state !== 'ACTIVE') {
      throw new ErrorAuthErrorResponse(`commercetools session is not ACTIVE, current status: ${session.state}`, {
        privateFields: {
          session: JSON.stringify(session),
        },
      });
    }
    return session;
  }

  getCartFromSession(session: Session): string {
    if (!session.activeCart?.cartRef?.id) {
      throw new ErrorAuthErrorResponse('Cart not found in commercetools session', {
        privateFields: {
          session: JSON.stringify(session),
        },
      });
    }
    return session.activeCart.cartRef.id;
  }

  getProcessorUrlFromSession(session: Session): string {
    return session.metadata?.processorUrl as string;
  }

  getCorrelationIdFromSession(session: Session): string | undefined {
    return session.metadata?.correlationId as string | undefined;
  }

  private async getSession(sessionId: string) {
    return await fetch(`${this.sessionUrl}/${this.projectKey}/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token?.access_token}`,
      },
    });
  }
}
