import { CommercetoolsClient } from './types/api.client.type';
import {
  RequestContextData,
  setupPaymentSDK,
  JWTAuthenticationHook,
  AuthorityAuthorizationHook,
  Oauth2AuthenticationHook,
  SessionQueryParamAuthenticationHook,
  RequestContextProvider,
  SessionHeaderAuthenticationHook,
} from '@commercetools/connect-payments-sdk';
import { updateRequestContext } from '../../libs/fastify/context/context';
import { getRequestContext } from '../../libs/fastify/context/context';
import { DefaultAuthorizationService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-authorization.service';
import { DefaultCartService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-cart.service';
import { DefaultOrderService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-order.service';
import { DefaultPaymentService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-payment.service';
import { DefaultCommercetoolsAPI } from '@commercetools/connect-payments-sdk/dist/commercetools/api/root-api';

export class CommercetoolsApiClient implements CommercetoolsClient {
  public client: {
    ctAPI: DefaultCommercetoolsAPI;
    ctCartService: DefaultCartService;
    ctOrderService: DefaultOrderService;
    ctPaymentService: DefaultPaymentService;
    ctAuthorizationService: DefaultAuthorizationService;
    contextProvider: RequestContextProvider;
    sessionHeaderAuthHookFn: SessionHeaderAuthenticationHook;
    sessionQueryParamAuthHookFn: SessionQueryParamAuthenticationHook;
    jwtAuthHookFn: JWTAuthenticationHook;
    oauth2AuthHookFn: Oauth2AuthenticationHook;
    authorityAuthorizationHookFn: AuthorityAuthorizationHook;
  };

  constructor(opts: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    apiUrl: string;
    projectKey: string;
    sessionUrl: string;
    jwksUrl: string;
    jwtIssuer: string;
  }) {
    this.client = createClient(opts);
  }

  public async getCartById(cartId: string) {
    const response = await this.client.ctAPI.client.carts().withId({ ID: cartId }).get().execute();
    const cart = response.body;
    return cart;
  }

  public async getType(typeKey: string) {
    const response = await this.client.ctAPI.client.types().withKey({ key: typeKey }).get().execute();
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
      const response = await this.client.ctAPI.client
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
      const response = await this.client.ctAPI.client
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
