import {
  createApiBuilderFromCtpClient,
  ByProjectKeyRequestBuilder,
  ShippingRateDraft,
  BaseAddress,
} from '@commercetools/platform-sdk';
import {
  AuthMiddlewareOptions,
  ClientBuilder,
  CorrelationIdMiddlewareOptions,
  HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { RequestContextData } from '../../libs/fastify/context';
import { randomUUID } from 'crypto';
import { appLogger } from '../../libs/logger';

export class CommercetoolsApiClient {
  private client: ByProjectKeyRequestBuilder;

  constructor(opts: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    apiUrl: string;
    projectKey: string;
    getContextFn: () => RequestContextData;
    updateContextFn: (ctx: Partial<RequestContextData>) => void;
    logger: typeof appLogger;
  }) {
    this.client = createClient(opts);
  }

  public async getCartById(cartId: string) {
    const response = await this.client.carts().withId({ ID: cartId }).get().execute();
    const cart = response.body;
    return cart;
  }

  // checks if the type with key 'ingrid-session-id' exists and if not, creates it
  // @returns {Promise<string>}
  public async getIngridCustomTypeId() {
    try {
      const type = await this.getCustomType('ingrid-session-id');
      return type.id;
    } catch (error) {
      console.error('Ingrid custom type does not exist, creating it', error);
      try {
        const type = await this.createCustomTypeFieldDefinitionForIngridSessionId();
        return type.id;
      } catch (error) {
        console.error('Error creating Ingrid custom type', error);
      }
    }
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
      const cart = await this.setIngridCustomFieldOnCart(cartId, cartVersion, ingridSessionId);
      return cart;
    } catch (error) {
      if (error instanceof Error) {
        console.info('Error setting Custom Field on Cart, setting Custom Type first. Error: ', error.message);
      }
      const cart = await this.setIngridCustomTypeOnCart(cartId, cartVersion, ingridSessionId, customTypeId);
      console.info('Successfully set Custom Type on Cart with ID!');
      return cart;
    }
  }

  public async setAddress(
    cartId: string,
    cartVersion: number,
    address: BaseAddress,
    action: 'setShippingAddress' | 'setBillingAddress',
  ) {
    const response = await this.client
      .carts()
      .withId({ ID: cartId })
      .post({ body: { version: cartVersion, actions: [{ action, address }] } })
      .execute();
    const cart = response.body;
    return cart;
  }

  public async setShippingMethod(
    cartId: string,
    cartVersion: number,
    customShippingMethodPayload: { shippingMethodName: string; shippingRate: ShippingRateDraft },
  ) {
    const response = await this.client
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartVersion,
          actions: [{ action: 'setCustomShippingMethod', ...customShippingMethodPayload }],
        },
      })
      .execute();
    const cart = response.body;
    return cart;
  }

  private async setIngridCustomFieldOnCart(cartId: string, cartVersion: number, ingridSessionId: string) {
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
  }

  private async setIngridCustomTypeOnCart(
    cartId: string,
    cartVersion: number,
    ingridSessionId: string,
    customTypeId: string,
  ) {
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
  }

  private async getCustomType(typeKey: string) {
    const response = await this.client.types().withKey({ key: typeKey }).get().execute();
    const type = response.body;
    return type;
  }

  // Should only be called once and only if the custom type does not exist
  // creates a custom type field definition for ingridSessionId
  // returns the custom type
  private async createCustomTypeFieldDefinitionForIngridSessionId() {
    //TODO: hardcoded for now - is there a need for this to be dynamic?
    const response = await this.client
      .types()
      .post({
        body: {
          key: 'ingrid-session-id',
          name: {
            en: 'Ingrid Session ID',
          },
          resourceTypeIds: ['order'],
          fieldDefinitions: [
            {
              name: 'ingridSessionId',
              label: {
                en: 'Ingrid Session ID',
              },
              type: {
                name: 'String',
              },
              required: false,
            },
          ],
        },
      })
      .execute();
    const customType = response.body;
    return customType;
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
}): ByProjectKeyRequestBuilder => {
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

  // TODO: do we even need the correlationId?
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
