import axios, { AxiosInstance, AxiosResponse } from 'axios';
import IngridApiClient from '../../../src/client/ingrid/ingrid.client';
import {
  IngridBasePath,
  IngridCompleteSessionRequestPayload,
  IngridUrls,
} from '../../../src/client/ingrid/types/ingrid.client.type';
import CustomError from '../../../src/errors/custom.error';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock axios
jest.mock('axios');

describe('IngridApiClient', () => {
  let client: IngridApiClient;
  const mockApiSecret = 'test-api-secret';
  const mockEnvironment = 'STAGING';
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
  } as unknown as jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(axios.create).mockReturnValue(mockAxiosInstance);
    client = new IngridApiClient({
      apiSecret: mockApiSecret,
      environment: mockEnvironment,
    });
  });

  describe('constructor', () => {
    it('should create an axios instance with correct configuration', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: IngridBasePath[mockEnvironment],
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${mockApiSecret}`,
        },
        maxRedirects: 20,
      });
    });
  });

  describe('completeCheckoutSession', () => {
    const mockPayload: IngridCompleteSessionRequestPayload = {
      checkout_session_id: 'test-checkout-id',
      external_id: 'test-external-id',
    };

    const mockResponse = {
      data: {
        session: {
          checkout_session_id: 'test-session-id',
          status: 'COMPLETE',
          updated_at: '2023-01-01T12:00:00Z',
          cart: {
            total_value: 0,
            total_discount: 0,
            items: [],
            cart_id: 'test-cart-id',
          },
          delivery_groups: [],
          purchase_country: 'US',
        },
      },
    } as AxiosResponse;

    it('should successfully complete a checkout session', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await client.completeCheckoutSession(mockPayload);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        IngridUrls.DELIVERY_CHECKOUT + '/session.complete',
        mockPayload
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw a non-retryable CustomError when the API call fails with a plain error', async () => {
      const mockError = new Error('API error');
      jest.mocked(axios.isAxiosError).mockReturnValue(false);
      mockAxiosInstance.post.mockRejectedValueOnce(mockError);

      await expect(client.completeCheckoutSession(mockPayload)).rejects.toThrow(
        CustomError
      );
      await expect(
        client.completeCheckoutSession(mockPayload)
      ).rejects.toMatchObject({
        statusCode: 202,
        message: expect.stringContaining('Failed to complete session on Ingrid.'),
      });
    });

    it('should handle non-Error objects thrown by axios', async () => {
      jest.mocked(axios.isAxiosError).mockReturnValue(false);
      mockAxiosInstance.post.mockRejectedValueOnce('String error');

      await expect(client.completeCheckoutSession(mockPayload)).rejects.toThrow(
        CustomError
      );
      await expect(
        client.completeCheckoutSession(mockPayload)
      ).rejects.toMatchObject({ statusCode: 202 });
    });

    it('should throw a retryable (502) CustomError on a network error with no response', async () => {
      const networkError = Object.assign(new Error('fetch failed'), {
        isAxiosError: true,
        response: undefined,
      });
      jest.mocked(axios.isAxiosError).mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValueOnce(networkError);

      await expect(
        client.completeCheckoutSession(mockPayload)
      ).rejects.toMatchObject({ statusCode: 502 });
    });

    it('should throw a retryable (502) CustomError when Ingrid responds with a 5xx', async () => {
      const serverError = Object.assign(new Error('Internal Server Error'), {
        isAxiosError: true,
        response: { status: 503 },
      });
      jest.mocked(axios.isAxiosError).mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValueOnce(serverError);

      await expect(
        client.completeCheckoutSession(mockPayload)
      ).rejects.toMatchObject({ statusCode: 502 });
    });

    it('should throw a non-retryable (202) CustomError when Ingrid responds with a 4xx', async () => {
      const clientError = Object.assign(new Error('Bad Request'), {
        isAxiosError: true,
        response: { status: 400 },
      });
      jest.mocked(axios.isAxiosError).mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValueOnce(clientError);

      await expect(
        client.completeCheckoutSession(mockPayload)
      ).rejects.toMatchObject({ statusCode: 202 });
    });
  });
});
