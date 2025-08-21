import { Request, Response } from 'express';
import { createApiRoot } from '../client/commercetools/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import PubSubValidator from '../utils/validate_requests.utils';
import IngridApiClient from '../client/ingrid/ingrid.client';
import { readConfiguration } from '../utils/config.utils';
import type { IngridCompleteSessionRequestPayload } from '../client/ingrid/types/ingrid.client.type';
import { DecodedMessageType } from '../types/index.types';
import {
  changeShipmentState,
  setTransportOrderId,
} from '../client/commercetools/update.client';
import { SHIPMENT_STATE } from '../client/commercetools/types/commercetools.client.type';
import type { IngridCompleteSessionResponse } from '../client/ingrid/types/ingrid.client.type';
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
  const decodedData =
    PubSubValidator.decodeMessageData<DecodedMessageType>(message);
  const orderId = PubSubValidator.validateDecodedMessage(decodedData);
  if (orderId === 'RESOURCE_CREATED_MESSAGE') {
    const loggingMessage =
      'Message for subscription created. Skip processing message.';
    logger.info(loggingMessage);
    return response.status(204).send(loggingMessage);
  }
  logger.info(
    `processing shipping session completion for order ID : ${orderId}`
  );

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
    throw new CustomError(
      202,
      ` Ingrid session ID not found for the order with ID ${commercetoolsOrder.id}.`
    );
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
    external_id: commercetoolsOrder.orderNumber,
  };

  let ingridResponse: IngridCompleteSessionResponse | undefined = undefined;
  let completeCheckoutSessionError: Error | undefined = undefined;

  try {
    ingridResponse = await ingridClient.completeCheckoutSession(payLoad);
  } catch (error) {
    if (error instanceof CustomError) {
      logger.error(
        `Error while completing ingrid session for order ID ${orderId}: ${error.message}`
      );
    }
    completeCheckoutSessionError = error as Error;
  }

  if (ingridResponse || completeCheckoutSessionError) {
    const transportOrderId = ingridResponse?.session.delivery_groups[0]?.tos_id;
    let updatedCommercetoolsOrder;
    if (transportOrderId) {
      logger.info(
        `Update transport order ID for the order ID ${commercetoolsOrder.id}: ${transportOrderId}.`
      );
      updatedCommercetoolsOrder = await setTransportOrderId(
        readConfiguration().ingridShippingCustomTypeKey,
        orderId,
        commercetoolsOrder.version,
        transportOrderId
      );
    }
    if (ingridResponse?.session.status === 'COMPLETE') {
      const updateOrderResult = await changeShipmentState(
        orderId,
        updatedCommercetoolsOrder
          ? updatedCommercetoolsOrder.version
          : commercetoolsOrder.version,
        SHIPMENT_STATE.READY
      );
      logger.info(
        `complete ingrid session successfully with transport order ID ${transportOrderId}: ${JSON.stringify(ingridResponse)}`
      );
      logger.info(
        `Update commercetools cart shipment state as ready. (orderId: ${updateOrderResult.id})`
      );
    } else {
      const updateOrderResult = await changeShipmentState(
        orderId,
        updatedCommercetoolsOrder
          ? updatedCommercetoolsOrder.version
          : commercetoolsOrder.version,
        SHIPMENT_STATE.CANCELED
      );
      logger.info(
        `complete ingrid session failed with transport order ID ${transportOrderId}: ${JSON.stringify(ingridResponse)}`
      );
      logger.info(
        `Update commercetools cart shipment state as canceled. (orderId: ${updateOrderResult.id})`
      );
    }
    if (!completeCheckoutSessionError)
      return response.status(204).send({
        ingridSessionId: ingridResponse?.session.checkout_session_id,
        status: ingridResponse?.session.status,
      });
  }
  throw completeCheckoutSessionError;
};
