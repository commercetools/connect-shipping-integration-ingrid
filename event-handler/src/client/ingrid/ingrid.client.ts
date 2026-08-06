import axios, { AxiosInstance } from 'axios';
import {
  IngridBasePath,
  type IngridCompleteSessionRequestPayload,
  type IngridCompleteSessionResponse,
  IngridUrls,
} from './types/ingrid.client.type';
import CustomError from '../../errors/custom.error';

export default class IngridApiClient {
  public client: AxiosInstance;

  constructor(opts: {
    apiSecret: string;
    environment: keyof typeof IngridBasePath;
  }) {
    this.client = createClient(opts);
  }

  public async completeCheckoutSession(
    payload: IngridCompleteSessionRequestPayload
  ) {
    try {
      const response = await this.client.post(
        IngridUrls.DELIVERY_CHECKOUT + '/session.complete',
        payload
      );
      return response.data as IngridCompleteSessionResponse;
    } catch (error: unknown) {
      // No response (network error/timeout) or a 5xx from Ingrid is transient
      // and should be retried; a 4xx means the request itself is bad and
      // retrying won't help.
      const isRetryable =
        axios.isAxiosError(error) &&
        (!error.response || error.response.status >= 500);

      throw new CustomError(
        isRetryable ? 502 : 202,
        `Failed to complete session on Ingrid. ${error instanceof Error ? error.message : String(error)}`,
        {
          cause: error instanceof Error ? error : new Error(String(error)),
        }
      );
    }
  }
}

const createClient = (opts: {
  apiSecret: string;
  environment: keyof typeof IngridBasePath;
}): AxiosInstance => {
  return axios.create({
    baseURL: IngridBasePath[opts.environment],
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${opts.apiSecret}`,
    },
    maxRedirects: 20,
  });
};
