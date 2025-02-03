import { Authentication } from '../../auth/types/authn.type';

/**
 * Context provider interface
 */
export interface ContextProvider<T> {
  getContextData(): T;
  updateContextData(ctx: Partial<T>): void;
}

/**
 * Request context data
 */
export type RequestContextData = {
  correlationId: string;
  requestId: string;
  authentication?: Authentication;
};
