import {
  createApiBuilderFromCtpClient,
  ByProjectKeyRequestBuilder,
  ShippingRateDraft,
  BaseAddress,
  TaxCategoryResourceIdentifier,
  Cart,
  Type,
  TaxCategory,
} from '@commercetools/platform-sdk';
import {
  AuthMiddlewareOptions,
  ClientBuilder,
  CorrelationIdMiddlewareOptions,
  HttpMiddlewareOptions,
} from '@commercetools/ts-client';
import { randomUUID } from 'crypto';
import { RequestContextData } from '../../libs/fastify/context';
import { appLogger } from '../../libs/logger';

/**
 * Client for interacting with the Commercetools API
 *
 * @param opts - Configuration options for the client
 * @param opts.clientId - OAuth client ID for authentication
 * @param opts.clientSecret - OAuth client secret for authentication
 * @param opts.authUrl - URL of the auth server
 * @param opts.apiUrl - URL of the Commercetools API
 * @param opts.projectKey - Project key in Commercetools
 * @param opts.getContextFn - Function to get the current request context
 * @param opts.updateContextFn - Function to update the request context
 * @param opts.logger - Logger instance to use
 *
 * @returns A configured Commercetools API client instance
 */
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

  /**
   * Updates the cart with the address and shipping method
   *
   * @param cartId - The ID of the cart to update
   * @param cartVersion - The version of the cart to update
   * @param addresses - Object containing shipping and billing addresses to set on the cart
   * @param addresses.shippingAddress - The shipping address to set on the cart
   * @param addresses.billingAddress - The billing address to set on the cart
   * @param customShippingMethodPayload - Configuration for the custom shipping method
   * @param customShippingMethodPayload.shippingMethodName - The name of the shipping method
   * @param customShippingMethodPayload.shippingRate - The shipping rate details including price and tiers
   * @param customShippingMethodPayload.taxCategory - The tax category reference for the shipping method
   *
   * @returns {Promise<Cart>} The updated cart with the new addresses and shipping method
   */
  public async updateCartWithAddressAndShippingMethod(
    cartId: string,
    cartVersion: number,
    addresses: { shippingAddress: BaseAddress; billingAddress: BaseAddress },
    customShippingMethodPayload: {
      shippingMethodName: string;
      shippingRate: ShippingRateDraft;
      taxCategory: TaxCategoryResourceIdentifier;
    },
  ): Promise<Cart> {
    const response = await this.client
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartVersion,
          actions: [
            { action: 'setShippingAddress', address: addresses.shippingAddress },
            { action: 'setBillingAddress', address: addresses.billingAddress },
            { action: 'setCustomShippingMethod', ...customShippingMethodPayload },
          ],
        },
      })
      .execute();
    const cart = response.body;
    return cart;
  }

  public async setCartCustomField(cartId: string, cartVersion: number, name: string, value: string): Promise<Cart> {
    const response = await this.client
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartVersion,
          actions: [
            {
              action: 'setCustomField',
              name,
              value,
            },
          ],
        },
      })
      .execute();
    const cart = response.body;
    return cart;
  }

  public async setCartCustomType(cartId: string, cartVersion: number, customTypeId: string): Promise<Cart> {
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
            },
          ],
        },
      })
      .execute();
    const cart = response.body;
    return cart;
  }

  public async getCustomType(typeKey: string): Promise<Type> {
    const response = await this.client.types().withKey({ key: typeKey }).get().execute();
    const type = response.body;
    return type;
  }

  // only called within post-deploy (if custom type does not exist -> will override merchants existing custom type)
  public async createCustomTypeFieldDefinitionForIngridSessionId(ingridSessionIdTypeKey: string): Promise<Type> {
    const response = await this.client
      .types()
      .post({
        body: {
          key: ingridSessionIdTypeKey,
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

  public async checkIfCustomTypeExistsByKey(key: string): Promise<boolean> {
    try {
      const response = await this.client.types().withKey({ key: key }).head().execute();
      return response.statusCode === 200;
    } catch (error) {
      return false;
    }
  }

  public async createIngridSessionIdFieldDefinitionOnType(type: Type): Promise<Type> {
    const response = await this.client
      .types()
      .withKey({ key: type.key })
      .post({
        body: {
          version: type.version,
          actions: [
            {
              action: 'addFieldDefinition',
              fieldDefinition: {
                name: 'ingridSessionId',
                label: {
                  en: 'Ingrid Session ID',
                },
                type: {
                  name: 'String',
                },
                required: false,
              },
            },
          ],
        },
      })
      .execute();
    const customType = response.body;
    return customType;
  }

  // TAX CATEGORY
  public async checkIfTaxCategoryExistsByKey(key: string): Promise<boolean> {
    try {
      const response = await this.client.taxCategories().withKey({ key: key }).head().execute();
      return response.statusCode === 200;
    } catch (error) {
      return false;
    }
  }

  public async createTaxCategoryWithNullRate(key: string): Promise<TaxCategory> {
    const response = await this.client
      .taxCategories()
      .post({
        body: {
          key,
          name: key + ' (created by Ingrid Connector)',
        },
      })
      .execute();
    const taxCategory = response.body;
    return taxCategory;
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
