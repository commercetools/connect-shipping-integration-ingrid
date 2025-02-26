import type {
  IngridCompleteSessionRequestPayload,
  IngridCompleteSessionResponse,
  IngridCreateSessionResponse,
  IngridCreateSessionRequestPayload,
  IngridGetSessionResponse,
  IngridUpdateSessionRequestPayload,
  IngridUpdateSessionResponse,
} from './types/ingrid.client.type';

export abstract class AbstractIngridClient {
  public abstract createCheckoutSession(
    payload: IngridCreateSessionRequestPayload,
  ): Promise<IngridCreateSessionResponse>;

  public abstract pullCheckoutSession(checkout_session_id: string): Promise<IngridGetSessionResponse>;

  public abstract getCheckoutSession(checkout_session_id: string): Promise<IngridGetSessionResponse>;

  public abstract updateCheckoutSession(
    payload: IngridUpdateSessionRequestPayload,
  ): Promise<IngridUpdateSessionResponse>;

  public abstract completeCheckoutSession(
    payload: IngridCompleteSessionRequestPayload,
  ): Promise<IngridCompleteSessionResponse>;
}
