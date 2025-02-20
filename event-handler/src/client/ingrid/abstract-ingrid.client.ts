import {
  IngridCompleteSessionRequestPayload,
  IngridCompleteSessionResponse,
} from './types/ingrid.client.type';

export abstract class AbstractIngridClient {
  public abstract completeCheckoutSession(
    payload: IngridCompleteSessionRequestPayload
  ): Promise<IngridCompleteSessionResponse>;
}
