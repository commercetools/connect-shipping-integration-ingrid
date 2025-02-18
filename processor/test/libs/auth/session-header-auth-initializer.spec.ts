import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';



import { appLogger } from '../../../src/libs/logger';
import { RequestContextData } from '../../../src/libs/fastify/context';
import { SessionHeaderAuthInitializer } from '../../../src/libs/auth/session-header-auth-initializer';
import { SessionHeaderAuthenticationHook } from '../../../src/libs/auth/hooks/session-header-auth.hook';

describe('session-header-auth-initializer', () => {
  beforeEach(async () => {
  });

  afterEach(async () => {
  });

  test('get SessionHeaderAuthHookFn', async () => {
    const opt =  {
        clientId: 'dummy-client-id',
        clientSecret: 'dummy-client-secret',
        authUrl: 'dummy-auth-url',
        projectKey: 'dummy-project-key',
        sessionUrl: 'dummy-session-url',
        getContextFn: () => { return null as any },
        updateContextFn: (ctx: Partial<RequestContextData>) => { console.log(ctx)},
        logger: appLogger
    }
    const sessionHeaderAuthInitializer = new SessionHeaderAuthInitializer(opt);
    const sessionHeaderAuthHookFn = sessionHeaderAuthInitializer.getSessionHeaderAuthHookFn();
    expect(sessionHeaderAuthHookFn).toBeDefined();
    expect(sessionHeaderAuthHookFn instanceof SessionHeaderAuthenticationHook).toBeTruthy

  });

});
