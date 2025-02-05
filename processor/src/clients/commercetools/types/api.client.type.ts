import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { Cart } from '@commercetools/platform-sdk';
export type CommercetoolsClient = ByProjectKeyRequestBuilder;

export type AbstractCommercetoolsApiClient = {
  getIngridCustomTypeId: () => Promise<string | undefined>;
  updateCartWithIngridSessionId: (
    cartId: string,
    cartVersion: number,
    ingridSessionId: string,
    customTypeId: string,
  ) => Promise<Cart>;
};
