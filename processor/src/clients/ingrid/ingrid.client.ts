import axios, { AxiosInstance } from 'axios';
import {
  IngridBasePath,
  IngridGetSessionResponse,
  IngridUrls,
  type IngridCompleteSessionRequestPayload,
  type IngridCompleteSessionResponse,
  type IngridCreateSessionRequestPayload,
  type IngridCreateSessionResponse,
  type IngridUpdateSessionRequestPayload,
  type IngridUpdateSessionResponse,
} from './types/ingrid.client.type';
import { AbstractIngridClient } from './abstract-ingrid.client';
import { CustomError } from '../../libs/fastify/errors';

/**
 * Client for interacting with the Ingrid API
 *
 * This client provides methods to create, get and update checkout sessions with the Ingrid delivery platform.
 * It handles authentication and request/response formatting.
 *
 * @remarks
 * The client requires an API secret for authentication and targets a specific environment (staging/production).
 * All methods return promises that resolve to typed response objects.
 *
 * @param opts - Configuration options for the client
 * @param opts.apiSecret - API secret for authentication with Ingrid
 * @param opts.environment - Environment to use (staging/production)
 *
 * @returns A configured Ingrid API client instance
 *
 * @throws {CustomError} When API requests fail
 */
export class IngridApiClient implements AbstractIngridClient {
  private client: AxiosInstance;

  constructor(opts: { apiSecret: string; environment: keyof typeof IngridBasePath }) {
    this.client = createClient(opts);
  }

  /**
   * Creates a new checkout session with Ingrid
   *
   * @remarks
   * This method initializes a new delivery checkout session with the Ingrid platform.
   * The session contains delivery options, pricing, and HTML snippet for rendering the checkout UI.
   *
   * @see {@link https://developer.ingrid.com/delivery_checkout/backend_integration/#create-checkout-session}
   *
   * @param {IngridCreateSessionRequestPayload} payload - The payload containing cart details, delivery address, and other required information
   * @returns {Promise<IngridCreateSessionResponse>} Response containing the session ID, HTML snippet, and session details
   */
  public async createCheckoutSession(payload: IngridCreateSessionRequestPayload): Promise<IngridCreateSessionResponse> {
    const response = await this.client.post(IngridUrls.DELIVERY_CHECKOUT + '/session.create', payload);
    return response.data as IngridCreateSessionResponse;
  }

  /**
   * Pulls a checkout session from Ingrid
   *
   * @remarks
   * This method retrieves the latest state of a checkout session from Ingrid.
   * It is useful for checking if any updates have been made to the session on Ingrid's side.
   * This call is not idempotent and will refresh shipping options if they are no longer valid.
   *
   * @see {@link https://developer.ingrid.com/delivery_checkout/backend_integration/#pull-checkout-session}
   *
   * @param checkout_session_id - The unique identifier of the checkout session to pull
   *
   * @returns {Promise<IngridGetSessionResponse>} The response containing the latest session data
   */
  public async pullCheckoutSession(checkout_session_id: string): Promise<IngridGetSessionResponse> {
    const response = await this.client.get(
      IngridUrls.DELIVERY_CHECKOUT + `/session.pull?checkout_session_id=${checkout_session_id}`,
    );
    return response.data as IngridGetSessionResponse;
  }

  /**
   * Retrieves a checkout session from Ingrid
   *
   * @remarks
   * This method retrieves the details of a specific checkout session from Ingrid.
   * This call is idempotent and returns a snapshot of the session without refreshing shipping options.
   *
   * @see {@link https://developer.ingrid.com/delivery_checkout/backend_integration/#get-checkout-session}
   *
   * @param checkout_session_id - The unique identifier of the checkout session to retrieve
   *
   * @returns {Promise<IngridGetSessionResponse>} The response containing the session data
   */
  public async getCheckoutSession(checkout_session_id: string): Promise<IngridGetSessionResponse> {
    const response = await this.client.get(
      IngridUrls.DELIVERY_CHECKOUT + `/session.get?checkout_session_id=${checkout_session_id}`,
    );
    return response.data as IngridGetSessionResponse;
  }

  /**
   * Updates a checkout session with Ingrid
   *
   * @remarks
   * This method updates an existing checkout session with Ingrid.
   * Can be used to update cart contents, apply shipping date changes, or split cart items.
   *
   * @see {@link https://developer.ingrid.com/delivery_checkout/backend_integration/#update-checkout-session}
   *
   * @param {IngridUpdateSessionRequestPayload} payload - The payload containing the session ID and any updates to be made
   *
   * @returns {Promise<IngridUpdateSessionResponse>} The response containing the updated session data
   */
  public async updateCheckoutSession(payload: IngridUpdateSessionRequestPayload): Promise<IngridUpdateSessionResponse> {
    const response = await this.client.post(IngridUrls.DELIVERY_CHECKOUT + '/session.update', payload);
    return response.data as IngridUpdateSessionResponse;
  }

  /**
   * Completes a checkout session with Ingrid
   *
   * @remarks
   * This method completes a checkout session with Ingrid.
   * Changes the session state from ACTIVE to COMPLETE and generates a Transport Order Identifier (tos_id).
   * After completion, the session becomes "frozen" and cannot be modified.
   *
   * @see {@link https://developer.ingrid.com/delivery_checkout/backend_integration/#complete-checkout-session}
   *
   * @param {IngridCompleteSessionRequestPayload} payload - The payload containing the session ID and customer information
   *
   * @returns {Promise<IngridCompleteSessionResponse>} The response containing the completed session data
   */
  public async completeCheckoutSession(
    payload: IngridCompleteSessionRequestPayload,
  ): Promise<IngridCompleteSessionResponse> {
    const response = await this.client.post(IngridUrls.DELIVERY_CHECKOUT + '/session.complete', payload);
    return response.data as IngridCompleteSessionResponse;
  }
}

const createClient = (opts: { apiSecret: string; environment: keyof typeof IngridBasePath }): AxiosInstance => {
  const instance = axios.create({
    baseURL: IngridBasePath[opts.environment],
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${opts.apiSecret}`,
    },
    maxRedirects: 20,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      throw new CustomError({
        message: error?.response?.data.error,
        code: error.code || '',
        httpErrorStatus: error.status || 500,
        cause: error,
      });
    },
  );

  return instance;
};
