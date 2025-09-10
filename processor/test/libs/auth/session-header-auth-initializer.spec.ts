import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import { appLogger } from '../../../src/libs/logger';
import { SessionHeaderAuthenticationHook, SessionHeaderAuthInitializer } from '../../../src/libs/auth';

describe('session-header-auth-initializer', () => {
  beforeEach(async () => {});

  afterEach(async () => {});

  test('get SessionHeaderAuthHookFn', async () => {
    const opt = {
      clientId: 'dummy-client-id',
      clientSecret: 'dummy-client-secret',
      authUrl: 'dummy-auth-url',
      projectKey: 'dummy-project-key',
      sessionUrl: 'dummy-session-url',
      getContextFn: () => {
        return null;
      },
      updateContextFn: () => {},
      logger: appLogger,
    };
    // @ts-expect-error: getContextFn is not a valid parameter
    const sessionHeaderAuthInitializer = new SessionHeaderAuthInitializer(opt);
    const sessionHeaderAuthHookFn = sessionHeaderAuthInitializer.getSessionHeaderAuthHookFn();
    expect(sessionHeaderAuthHookFn).toBeDefined();
    expect(sessionHeaderAuthHookFn instanceof SessionHeaderAuthenticationHook).toBeTruthy();
  });
});
