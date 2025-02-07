import { describe, test, expect, afterEach, jest, afterAll, beforeAll, beforeEach } from '@jest/globals';
import { setupServer } from 'msw/node';
import { IngridShippingService } from '../../src/services/ingrid-shipping.service';
import { AbstractShippingService } from '../../src/services/abstract-shipping.service';
import { IngridApiClient } from '../../src/clients/ingrid/ingrid.client';
import { CommercetoolsApiClient } from '../../src/clients/commercetools/api.client';
import { IngridBasePath, IngridUrls, IngridEnvironment } from '../../src/clients/ingrid/types/ingrid.client.type';
import {
  mockCreateCheckoutSessionSuccessResponse,
  mockCreateCheckoutSessionAuthFailureResponse,
} from '../mock/mock-ingrid-client-objects';
import { cart } from '../mock/mock-cart';
import { mockRequest } from '../mock/mock-utils';
import { InitSessionSuccessResponseSchemaDTO } from '../../src/dtos/ingrid-shipping.dto';
import { CustomError } from '../../src/libs/fastify/errors';
import { appLogger } from '../../src/libs/logger';
import { RequestContextData, updateRequestContext, getRequestContext } from '../../src/libs/fastify/context';

describe('ingrid-shipping.service', () => {
  const mockServer = setupServer();

  const opts = {
    clientId: 'dummy-coco-client-id',
    clientSecret: 'dummy-coco-client-secret',
    authUrl: 'https://auth.europe-west1.gcp.commercetools.com',
    apiUrl: 'https://api.europe-west1.gcp.commercetools.com',
    projectKey: 'dummy-coco-project-key',
    sessionUrl: 'https://session.europe-west1.gcp.commercetools.com',
    logger: appLogger,
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
  };

  const ingridOpts = {
    apiSecret: 'dummy-ingrid-api-key',
    environment: 'STAGING' as IngridEnvironment,
  };

  const commercetoolsApiClient: CommercetoolsApiClient = new CommercetoolsApiClient(opts);
  const ingridApiClient: IngridApiClient = new IngridApiClient(ingridOpts);

  const shippingService: AbstractShippingService = new IngridShippingService(commercetoolsApiClient, ingridApiClient);

  beforeAll(() => {
    mockServer.listen({
      onUnhandledRequest: 'bypass',
    });
  });

  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  afterAll(() => {
    mockServer.close();
  });

  afterEach(() => {
    mockServer.resetHandlers();
  });

  test('init session OK', async () => {
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.create',
        200,
        mockCreateCheckoutSessionSuccessResponse,
      ),
    );
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.get',
        200,
        mockCreateCheckoutSessionSuccessResponse,
      ),
    );
    jest.spyOn(CommercetoolsApiClient.prototype, 'getIngridCustomTypeId').mockResolvedValue('dummy-ingrid-session-id');
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue(cart);
    jest.spyOn(CommercetoolsApiClient.prototype, 'updateCartWithIngridSessionId').mockResolvedValue(cart);

    const result = await shippingService.init();

    expect(typeof result.data).toBe('object');

    const data = result.data as unknown as InitSessionSuccessResponseSchemaDTO;
    expect(typeof data.html).toBe('string');
    expect(typeof data.ingridSessionId).toBe('string');
    expect(typeof data.success).toBe('boolean');
  });

  test('init session failed due to wrong api key', async () => {
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.create',
        401,
        mockCreateCheckoutSessionAuthFailureResponse,
      ),
    );
    mockServer.use(
      mockRequest(
        IngridBasePath.STAGING,
        IngridUrls.DELIVERY_CHECKOUT + '/session.get',
        401,
        mockCreateCheckoutSessionAuthFailureResponse,
      ),
    );
    jest.spyOn(CommercetoolsApiClient.prototype, 'getIngridCustomTypeId').mockResolvedValue('dummy-ingrid-session-id');
    jest.spyOn(CommercetoolsApiClient.prototype, 'getCartById').mockResolvedValue(cart);

    try {
      await shippingService.init();
    } catch (error) {
      expect(error instanceof CustomError).toBe(true);
      const customError = error as CustomError;
      expect(customError.httpErrorStatus).toBe(401);
    }
  });
});
