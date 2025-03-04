import { describe, test, expect } from '@jest/globals';
import { HeaderBasedAuthentication } from '../../../../src/libs/auth/authentications/header-based-authentication';

describe('HeaderBasedAuthentication', () => {
  test('should create authentication with auth header', () => {
    const authHeader = 'test-auth-header';
    const authentication = new HeaderBasedAuthentication(authHeader);

    expect(authentication).toBeDefined();
    expect(authentication.getCredentials()).toBe(authHeader);
  });

  test('should return principal with auth header', () => {
    const authHeader = 'test-auth-header';
    const authentication = new HeaderBasedAuthentication(authHeader);

    const principal = authentication.getPrincipal();
    expect(principal).toBeDefined();
    expect(principal.authHeader).toBe(authHeader);
  });

  test('should return true for hasPrincipal when auth header exists', () => {
    const authentication = new HeaderBasedAuthentication('test-auth-header');
    expect(authentication.hasPrincipal()).toBe(true);
  });

  test('should return true for hasCredentials when auth header exists', () => {
    const authentication = new HeaderBasedAuthentication('test-auth-header');
    expect(authentication.hasCredentials()).toBe(true);
  });

  test('should return false for hasCredentials when auth header is empty', () => {
    // @ts-expect-error: null is not a valid parameter
    const authentication = new HeaderBasedAuthentication();
    expect(authentication.hasCredentials()).toBe(false);
  });

  test('should return empty array for getAuthorities', () => {
    const authentication = new HeaderBasedAuthentication('test-auth-header');
    expect(authentication.getAuthorities()).toEqual([]);
  });

  test('should return false for isAuthenticated', () => {
    const authentication = new HeaderBasedAuthentication('test-auth-header');
    expect(authentication.isAuthenticated()).toBe(false);
  });
});
