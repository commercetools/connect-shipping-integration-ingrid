import { Request, Response } from 'express';
import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import PubSubValidator from '../utils/validate_requsts.utils';

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
    const order = await createApiRoot()
      .orders()
      .withId({ ID: orderId })
      .get()
      .execute();

    // Execute the tasks in need
    logger.info(order);
  } catch (error) {
    throw new CustomError(400, `Bad request: ${error}`);
  }

  // Return the response for the client
  response.status(204).send();
};

export const update = async (request: Request, response: Response) => {
  const body = PubSubValidator.validateRequestBody(request);
  const message = PubSubValidator.validateMessageFormat(body);
  const decodedData = PubSubValidator.decodeMessageData<{ orderId: string }>(
    message
  );
  const orderId = decodedData?.orderId;

  try {
    const order = await createApiRoot()
      .orders()
      .withId({ ID: orderId })
      .get()
      .execute();

    // Execute the tasks in need
    logger.info(order);
  } catch (error) {
    throw new CustomError(400, `Bad request: ${error}`);
  }

  // Return the response for the client
  response.status(204).send();
};
