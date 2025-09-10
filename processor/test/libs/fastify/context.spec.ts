import { describe, expect, jest, test } from '@jest/globals';
import { getCartIdFromContext, getCtSessionIdFromContext } from '../../../src/libs/fastify/context/helper';
import { SessionAuthentication } from '../../../src/libs/auth/authentications';
import { RequestContextData } from '../../../src/libs/fastify/context/types';
import { RequestContextProvider } from '../../../src/libs/fastify/context/provider';

describe('Context Helpers', () => {
  test('getCtSessionIdFromContext should return session ID when authentication is present', () => {
    const sessionId = 'test-session-id';
    const authentication = new SessionAuthentication(sessionId, {
      cartId: 'test-cart-id',
      processorUrl: 'https://processor.example.com',
    });

    const context: RequestContextData = {
      correlationId: 'test-correlation-id',
      requestId: 'test-request-id',
      authentication,
    };

    const result = getCtSessionIdFromContext(context);
    expect(result).toBe(sessionId);
  });

  test('getCtSessionIdFromContext should return undefined when authentication is missing', () => {
    const context: RequestContextData = {
      correlationId: 'test-correlation-id',
      requestId: 'test-request-id',
    };

    const result = getCtSessionIdFromContext(context);
    expect(result).toBeUndefined();
  });

  test('getCartIdFromContext should return cart ID when authentication is present', () => {
    const cartId = 'test-cart-id';
    const authentication = new SessionAuthentication('test-session-id', {
      cartId,
      processorUrl: 'https://processor.example.com',
    });

    const context: RequestContextData = {
      correlationId: 'test-correlation-id',
      requestId: 'test-request-id',
      authentication,
    };

    const result = getCartIdFromContext(context);
    expect(result).toBe(cartId);
  });

  test('getCartIdFromContext should return undefined when authentication is missing', () => {
    const context: RequestContextData = {
      correlationId: 'test-correlation-id',
      requestId: 'test-request-id',
    };

    const result = getCartIdFromContext(context);
    expect(result).toBeUndefined();
  });
});

describe('RequestContextProvider', () => {
  test('should get context data using provided function', () => {
    const mockContextData: RequestContextData = {
      correlationId: 'test-correlation-id',
      requestId: 'test-request-id',
    };

    const getContextFn = jest.fn().mockReturnValue(mockContextData);
    const updateContextFn = jest.fn();

    const provider = new RequestContextProvider({
      // @ts-expect-error: getContextFn is not a valid parameter
      getContextFn,
      updateContextFn,
    });

    const result = provider.getContextData();

    expect(getContextFn).toHaveBeenCalled();
    expect(result).toBe(mockContextData);
  });

  test('should update context data using provided function', () => {
    const getContextFn = jest.fn();
    const updateContextFn = jest.fn();

    const provider = new RequestContextProvider({
      // @ts-expect-error: getContextFn is not a valid parameter
      getContextFn,
      updateContextFn,
    });

    const authentication = new SessionAuthentication('test-session-id', {
      cartId: 'test-cart-id',
      processorUrl: 'https://processor.example.com',
    });
    const updateData: Partial<RequestContextData> = {
      authentication,
      correlationId: 'new-correlation-id',
    };

    provider.updateContextData(updateData);

    expect(updateContextFn).toHaveBeenCalledWith(updateData);
  });
});
