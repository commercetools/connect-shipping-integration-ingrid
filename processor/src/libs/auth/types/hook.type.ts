import { IncomingHttpHeaders } from 'node:http';

export interface AuthenticationHook {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate(): (request: { headers: IncomingHttpHeaders; query?: any }) => Promise<void>;
}

export interface AuthorizationHook {
  authorize(...authorities: string[]): () => Promise<void>;
}
