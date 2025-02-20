import { Request, Response } from 'express';
import { createApiRoot } from '../client/commercetools/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import PubSubValidator from '../utils/validate_requsts.utils';
import IngridApiClient from '../client/ingrid/ingrid.client';
import { readConfiguration } from '../utils/config.utils';
import type { IngridCompleteSessionRequestPayload } from '../client/ingrid/types/ingrid.client.type';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  const body = PubSubValidator.validateRequestBody(request);
  const message = PubSubValidator.validateMessageFormat(body);
  const decodedData = PubSubValidator.decodeMessageData<{ orderId: string }>(
    message
  );
  const orderId = decodedData?.orderId;

  try {
    const commercetoolsOrder = await createApiRoot()
      .orders()
      .withId({ ID: orderId })
      .get({
        queryArgs: {
          expand: 'cart',
        },
      })
      .execute()
      .then((res) => res.body);

    const order = commercetoolsOrder.cart?.id;

    const ingridSessionId =
      commercetoolsOrder.cart?.obj?.custom?.fields?.ingridSessionId;

    const apiSecret = readConfiguration().ingridApiKey;
    const environment = readConfiguration().ingridEnvironment;

    const ingridOpts = {
      apiSecret,
      environment,
    };

    const ingridClient = new IngridApiClient(ingridOpts);

    const payLoad: IngridCompleteSessionRequestPayload = {
      checkout_session_id: ingridSessionId,
      external_id: orderId,
    };

    const ingridResponse = await ingridClient.completeCheckoutSession(payLoad);

    logger.info(ingridResponse);
    return response.status(204).send();
  } catch (error) {
    throw new CustomError(400, `Bad request: ${error}`);
  }
};
