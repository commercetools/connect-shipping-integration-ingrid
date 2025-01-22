import {
  IngridCompleteSessionRequestPayload,
  IngridCompleteSessionResponse,
  IngridCreateSessionResponse,
  IngridSession,
  IngridUpdateSessionRequestPayload,
  IngridUpdateSessionResponse,
} from './types/ingrid.client.type';

import { IngridCreateSessionRequestPayload } from './types/ingrid.client.type';

export abstract class AbstractIngridClient {
  public abstract createCheckoutSession(
    payload: IngridCreateSessionRequestPayload,
  ): Promise<IngridCreateSessionResponse>;

  public abstract pullCheckoutSession(checkout_session_id: string): Promise<IngridSession>;

  public abstract updateCheckoutSession(
    payload: IngridUpdateSessionRequestPayload,
  ): Promise<IngridUpdateSessionResponse>;

  public abstract completeCheckoutSession(
    payload: IngridCompleteSessionRequestPayload,
  ): Promise<IngridCompleteSessionResponse>;
}
