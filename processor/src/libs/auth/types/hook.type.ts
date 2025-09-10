import type { IncomingHttpHeaders } from 'node:http';

export interface AuthenticationHook {
  authenticate(): (request: { headers: IncomingHttpHeaders; query?: any }) => Promise<void>;
}

export interface AuthorizationHook {
  authorize(...authorities: string[]): () => Promise<void>;
}
