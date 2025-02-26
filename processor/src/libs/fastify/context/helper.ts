import { SessionAuthentication } from '../../auth/authentications';
import type { RequestContextData } from './types';

export function getCtSessionIdFromContext(context: RequestContextData): string | undefined {
  const authentication = context.authentication;
  if (authentication && authentication instanceof SessionAuthentication) {
    return authentication?.getCredentials();
  }
}

export function getCartIdFromContext(context: RequestContextData): string | undefined {
  const authentication = context.authentication;
  if (authentication && authentication instanceof SessionAuthentication) {
    return authentication?.getPrincipal().cartId;
  }
}
