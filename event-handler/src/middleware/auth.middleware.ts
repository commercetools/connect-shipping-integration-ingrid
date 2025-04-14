import { type AuthMiddlewareOptions } from '@commercetools/ts-client'; // Required for auth
import { readConfiguration } from '../utils/config.utils';

/**
 * Configure Middleware. Example only. Adapt on your own
 */
export const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: readConfiguration().authUrl,
  projectKey: readConfiguration().projectKey,
  credentials: {
    clientId: readConfiguration().clientId,
    clientSecret: readConfiguration().clientSecret,
  }
};
