import { CommercetoolsClient } from './types/api.client.type';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import {
  AuthMiddlewareOptions,
  ClientBuilder,
  CorrelationIdMiddlewareOptions,
  HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { SessionHeaderAuthenticationHook } from '../../libs/auth/hooks/sessionHeaderAuth.hook';
import { RequestContextData } from '../../libs/fastify/context/types';
import { ContextProvider } from '../../libs/fastify/context/types';
import { randomUUID } from 'crypto';
import { DefaultSessionService } from '../../libs/auth/services/ctSession.service';
import { DefaultAuthorizationService } from '../../libs/auth/services/ctAuthorization.service';
import { SessionHeaderAuthenticationManager } from '../../libs/auth/sessionHeaderAuthManager';
import { appLogger } from '../../libs/logger';
import { RequestContextProvider } from '../../libs/fastify/context/provider';

export class CommercetoolsApiClient implements CommercetoolsApiClient {
  public client: CommercetoolsClient;
  public sessionHeaderAuthHookFn: SessionHeaderAuthenticationHook;

  constructor(opts: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    apiUrl: string;
    projectKey: string;
    sessionUrl: string;
    getContextFn: () => RequestContextData;
    updateContextFn: (ctx: Partial<RequestContextData>) => void;
    logger: typeof appLogger;
  }) {
    this.client = createClient(opts);
    this.sessionHeaderAuthHookFn = createSessionHeaderAuthHook(opts);
  }

  public async getCartById(cartId: string) {
    const response = await this.client.carts().withId({ ID: cartId }).get().execute();
    const cart = response.body;
    return cart;
  }

  public async getType(typeKey: string) {
    const response = await this.client.types().withKey({ key: typeKey }).get().execute();
    const type = response.body;
    return type;
  }

  // TODO: will the merchant or the enabler set the ingridSessionId
  // on the cart or does the processor handle the type logic?
  // referring to prateek's comment here:
  // https://github.com/commercetools/connect-shipping-integration-ingrid/pull/16#discussion_r1935235022
  public async updateCartWithIngridSessionId(
    cartId: string,
    cartVersion: number,
    ingridSessionId: string,
    customTypeId: string,
  ) {
    try {
      const response = await this.client
        .carts()
        .withId({ ID: cartId })
        .post({
          body: {
            version: cartVersion,
            actions: [
              {
                action: 'setCustomField',
                name: 'ingridSessionId',
                value: ingridSessionId,
              },
            ],
          },
        })
        .execute();
      const cart = response.body;
      return cart;
    } catch (error) {
      try {
        const cart = await this.setCustomTypeOnCart(cartId, cartVersion, ingridSessionId, customTypeId);
        return cart;
      } catch (e) {
        throw e;
      }
    }
  }

  private async setCustomTypeOnCart(
    cartId: string,
    cartVersion: number,
    ingridSessionId: string,
    customTypeId: string,
  ) {
    try {
      const response = await this.client
        .carts()
        .withId({ ID: cartId })
        .post({
          body: {
            version: cartVersion,
            actions: [
              {
                action: 'setCustomType',
                type: {
                  id: customTypeId,
                  typeId: 'type',
                },
                fields: {
                  ingridSessionId: ingridSessionId,
                },
              },
            ],
          },
        })
        .execute();
      const cart = response.body;
      return cart;
    } catch (error) {
      throw error;
    }
  }
}

const createClient = (opts: {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  apiUrl: string;
  projectKey: string;
  getContextFn: () => RequestContextData;
  updateContextFn: (ctx: Partial<RequestContextData>) => void;
}): CommercetoolsClient => {
  const authMiddlewareOptions: AuthMiddlewareOptions = {
    host: opts.authUrl,
    projectKey: opts.projectKey,
    credentials: {
      clientId: opts.clientId,
      clientSecret: opts.clientSecret,
    },
  };

  const httpMiddlewareOptions: HttpMiddlewareOptions = {
    host: opts.apiUrl,
    //Enables SDK retries when CoCo returns a 503 error. It retries up to 10 times with an 200ms backoff.
    enableRetry: true,
  };

  const correlationIdMiddlewareOptions: CorrelationIdMiddlewareOptions = {
    generate: () => {
      const contextData = opts.getContextFn();
      const correlationID =
        contextData.correlationId && contextData.correlationId.length > 0 ? contextData.correlationId : randomUUID();
      return correlationID;
    },
  };

  const ctpClient = new ClientBuilder()
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withCorrelationIdMiddleware(correlationIdMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();

  return createApiBuilderFromCtpClient(ctpClient).withProjectKey({
    projectKey: opts.projectKey,
  });
};

const createSessionHeaderAuthHook = (opts: {
  sessionUrl: string;
  authUrl: string;
  clientId: string;
  clientSecret: string;
  projectKey: string;
  logger: typeof appLogger;
  getContextFn: () => RequestContextData;
  updateContextFn: (ctx: Partial<RequestContextData>) => void;
}) => {
  const contextProvider: ContextProvider<RequestContextData> = new RequestContextProvider({
    getContextFn: opts.getContextFn,
    updateContextFn: opts.updateContextFn,
  });
  const ctAuthorizationService = new DefaultAuthorizationService({
    authUrl: opts.authUrl,
    clientId: opts.clientId,
    clientSecret: opts.clientSecret,
    logger: opts.logger,
  });
  const sessionService = new DefaultSessionService({
    authorizationService: ctAuthorizationService,
    sessionUrl: opts.sessionUrl,
    projectKey: opts.projectKey,
    logger: opts.logger,
  });
  const sessionHeaderAuthenticationManager = new SessionHeaderAuthenticationManager({
    sessionService,
    logger: opts.logger,
  });
  const sessionHeaderAuthHookFn = new SessionHeaderAuthenticationHook({
    authenticationManager: sessionHeaderAuthenticationManager,
    contextProvider: contextProvider,
    logger: opts.logger,
  });
  return sessionHeaderAuthHookFn;
};

/* const createClient = (opts: {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  apiUrl: string;
  projectKey: string;
  sessionUrl: string;
  jwksUrl: string;
  jwtIssuer: string;
}) =>
  setupPaymentSDK({
    clientId: opts.clientId,
    clientSecret: opts.clientSecret,
    authUrl: opts.authUrl,
    apiUrl: opts.apiUrl,
    projectKey: opts.projectKey,
    sessionUrl: opts.sessionUrl,
    jwksUrl: opts.jwksUrl,
    jwtIssuer: opts.jwtIssuer,
    getContextFn: (): RequestContextData => {
      const { correlationId, requestId, authentication } = getRequestContext();
      return {
        correlationId: correlationId || '',
        requestId: requestId || '',
        authentication,
      };
    },
    updateContextFn: (context: Partial<RequestContextData>) => {
      const requestContext = Object.assign(
        {},
        context.correlationId ? { correlationId: context.correlationId } : {},
        context.requestId ? { requestId: context.requestId } : {},
        context.authentication ? { authentication: context.authentication } : {},
      );
      updateRequestContext(requestContext);
    },
    //logger: appLogger,
  });
 */
