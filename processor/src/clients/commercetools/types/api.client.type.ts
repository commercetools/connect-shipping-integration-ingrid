import {
  RequestContextProvider,
  SessionHeaderAuthenticationHook,
  SessionQueryParamAuthenticationHook,
  JWTAuthenticationHook,
  Oauth2AuthenticationHook,
  AuthorityAuthorizationHook,
} from '@commercetools/connect-payments-sdk';
import { DefaultCommercetoolsAPI } from '@commercetools/connect-payments-sdk/dist/commercetools/api/root-api';
import { DefaultCartService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-cart.service';
import { DefaultOrderService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-order.service';
import { DefaultPaymentService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-payment.service';
import { DefaultAuthorizationService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-authorization.service';

export type CommercetoolsClient = {
  client: {
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
};
