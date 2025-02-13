import axios, { AxiosInstance } from 'axios';
import {
  type IngridClientOptions,
  type IngridCompleteSessionRequestPayload,
  type IngridCompleteSessionResponse,
  type IngridCreateSessionRequestPayload,
  type IngridCreateSessionResponse,
  IngridGetSessionResponse,
  type IngridUpdateSessionRequestPayload,
  type IngridUpdateSessionResponse,
  IngridUrls,
} from './types/ingrid.client.type';
import { AbstractIngridClient } from './abstract-ingrid.client';

import { CustomError } from '../../libs/fastify/errors';

export class IngridApiClient implements AbstractIngridClient {
  public client: AxiosInstance;

  constructor(opts: IngridClientOptions) {
    console.log('IngridApiClient constructor', opts);
    this.client = createClient(opts);
  }

  public async createCheckoutSession(payload: IngridCreateSessionRequestPayload) {
    try {
      const response = await this.client.post(IngridUrls.DELIVERY_CHECKOUT + '/session.create', payload);
      return response.data as IngridCreateSessionResponse;
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new CustomError({
          message: error?.response?.data.error,
          code: error.code || '',
          httpErrorStatus: error.status || 500,
          cause: error,
        });
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  public async pullCheckoutSession(checkout_session_id: string) {
    try {
      const response = await this.client.get(
        IngridUrls.DELIVERY_CHECKOUT + `/session.pull?checkout_session_id=${checkout_session_id}`,
      );
      return response.data as IngridGetSessionResponse;
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new Error(error.response?.data || 'Error pulling Ingrid session');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  public async getCheckoutSession(checkout_session_id: string) {
    try {
      const response = await this.client.get(
        IngridUrls.DELIVERY_CHECKOUT + `/session.get?checkout_session_id=${checkout_session_id}`,
      );
      return response.data as IngridGetSessionResponse;
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new CustomError({
          message: error?.response?.data.error,
          code: error.code || '',
          httpErrorStatus: error.status || 500,
          cause: error,
        });
      }
      throw error;
    }
  }

  public async updateCheckoutSession(payload: IngridUpdateSessionRequestPayload) {
    try {
      const response = await this.client.post(IngridUrls.DELIVERY_CHECKOUT + '/session.update', payload);
      return response.data as IngridUpdateSessionResponse;
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new Error(error.response?.data || 'Error updating Ingrid session');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  public async completeCheckoutSession(payload: IngridCompleteSessionRequestPayload) {
    try {
      const response = await this.client.post(IngridUrls.DELIVERY_CHECKOUT + '/session.complete', payload);
      return response.data as IngridCompleteSessionResponse;
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new Error(error.response?.data || 'Error completing Ingrid session');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }
}

const createClient = (opts: IngridClientOptions): AxiosInstance => {
  return axios.create({
    baseURL: opts.environment,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${opts.apiSecret}`,
    },
    maxRedirects: 20,
  });
};
