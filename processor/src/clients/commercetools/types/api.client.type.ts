import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { SessionHeaderAuthenticationHook } from '../../../libs/auth/hooks/sessionHeaderAuth.hook';
import { RequestContextProvider } from '../../../libs/fastify/context/provider';

export type CommercetoolsClient = ByProjectKeyRequestBuilder;

export type CommercetoolsApiClient = {
  client: CommercetoolsClient;
  contextProvider: RequestContextProvider;
  sessionHeaderAuthHookFn: SessionHeaderAuthenticationHook;
};
