import axios, { AxiosInstance } from 'axios';
import type { IngridCreateSessionRequestPayload, IngridCreateSessionResponse } from './types/ingrid.client.type';

export class IngridApiClient {
  public client: AxiosInstance;

  constructor(opts: { apiSecret: string; apiUrl: string }) {
    this.client = createClient(opts);
  }

  public async createSession(payload: IngridCreateSessionRequestPayload) {
    try {
      const response = await this.client.post('/session.create', payload);
      return response.data as IngridCreateSessionResponse;
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new Error(error.response?.data || 'Error creating Ingrid session');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /* public async updateSession(payload: IngridUpdateSessionRequestPayload) {
    const response = await this.client.post('/session.update', payload);
    return response.data as IngridUpdateSessionResponse;
  }

  public async completeSession(payload: IngridCompleteSessionRequestPayload) {
    const response = await this.client.post('/session.complete', payload);
    return response.data as IngridCompleteSessionResponse;
  } */
}

const createClient = (opts: { apiSecret: string; apiUrl: string }): AxiosInstance => {
  const instance = axios.create({
    baseURL: opts.apiUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${opts.apiSecret}`,
    },
    maxRedirects: 20,
  });

  return instance;
};
