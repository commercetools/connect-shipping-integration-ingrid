import { AuthorizationService, CommercetoolsToken } from '../types';
import { appLogger } from '../../logger';
import { GeneralError } from '../../fastify/errors';

export class DefaultAuthorizationService implements AuthorizationService {
  private authUrl: string;
  private clientId: string;
  private clientSecret: string;
  // @ts-ignore
  private logger: typeof appLogger;

  constructor(opts: { authUrl: string; clientId: string; clientSecret: string; logger: typeof appLogger }) {
    this.authUrl = opts.authUrl;
    this.clientId = opts.clientId;
    this.clientSecret = opts.clientSecret;
    this.logger = opts.logger;
  }

  async getAccessToken(): Promise<CommercetoolsToken> {
    const encodedCredentials = btoa(`${this.clientId}:${this.clientSecret}`);
    const urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'client_credentials');
    const response = await fetch(`${this.authUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: urlencoded,
    });

    if (!response.ok) {
      throw new GeneralError(undefined, {
        privateMessage: 'Failed to get auth token',
        privateFields: {
          responseStatus: response.status,
          responseText: await response.text(),
        },
      });
    }
    return (await response.json()) as CommercetoolsToken;
  }
}
