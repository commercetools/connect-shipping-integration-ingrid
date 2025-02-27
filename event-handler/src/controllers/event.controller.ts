import { Request, Response } from 'express';
import { createApiRoot } from '../client/commercetools/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import PubSubValidator from '../utils/validate_requests.utils';
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
  logger.info(`request : ${JSON.stringify(request)}`);
  const body = PubSubValidator.validateRequestBody(request);
  logger.info(`body : ${JSON.stringify(body)}`);
  const message = PubSubValidator.validateMessageFormat(body);
  logger.info(`message : ${JSON.stringify(message)}`);
  const decodedData = PubSubValidator.decodeMessageData<{ orderId: string }>(
    message,
  );
  logger.info(`decodedData : ${JSON.stringify(decodedData)}`);
  const orderId = decodedData?.orderId;

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

  const ingridSessionId =
    commercetoolsOrder.cart?.obj?.custom?.fields?.ingridSessionId;

  if (!ingridSessionId) {
    throw new CustomError(400, 'Bad request. Ingrid session ID not found');
  }

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

};
