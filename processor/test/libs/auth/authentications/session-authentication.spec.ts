import { describe, expect, test } from '@jest/globals';
import { SessionAuthentication } from '../../../../src/libs/auth/authentications/session-authentication';
import { SessionPrincipal } from '../../../../src/libs/auth/types';

describe('SessionAuthentication', () => {
  test('should create a session authentication with principal data', () => {
    const sessionId = 'test-session-id';
    const principal: SessionPrincipal = {
      cartId: 'test-cart-id',
      processorUrl: 'https://processor.example.com',
      correlationId: 'test-correlation-id',
    };

    const auth = new SessionAuthentication(sessionId, principal);

    expect(auth.hasPrincipal()).toBe(true);
    expect(auth.getPrincipal()).toEqual(principal);
    expect(auth.hasCredentials()).toBe(true);
    expect(auth.getCredentials()).toBe(sessionId);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getAuthorities()).toEqual([]);
  });

  test('should handle minimal principal data', () => {
    const sessionId = 'test-session-id';
    // @ts-expect-error: processorUrl is not a valid parameter
    const principal: SessionPrincipal = {
      cartId: 'test-cart-id',
    };

    const auth = new SessionAuthentication(sessionId, principal);

    expect(auth.hasPrincipal()).toBe(true);
    expect(auth.getPrincipal()).toEqual(principal);
    expect(auth.getPrincipal().cartId).toBe('test-cart-id');
    expect(auth.getPrincipal().processorUrl).toBeUndefined();
    expect(auth.getPrincipal().correlationId).toBeUndefined();
  });

  test('should return empty array for authorities when not set', () => {
    const sessionId = 'test-session-id';
    const principal: SessionPrincipal = {
      cartId: 'test-cart-id',
      processorUrl: 'https://processor.example.com',
    };

    const auth = new SessionAuthentication(sessionId, principal);

    expect(auth.getAuthorities()).toEqual([]);
  });
});
