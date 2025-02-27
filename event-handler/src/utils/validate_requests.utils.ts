import CustomError from '../errors/custom.error';
import { logger } from './logger.utils';

interface PubSubRequest {
  body?: PubSubBody;
}

interface PubSubBody {
  message?: PubSubMessage;
}

interface PubSubMessage {
  data?: string;
}

class PubSubValidator {
  /**
   * Validates that the request contains a body
   * @param {PubSubRequest} request - The incoming request object
   * @throws {CustomError} If request body is missing
   * @returns {PubSubBody} The validated request body
   */
  static validateRequestBody(request: PubSubRequest): PubSubBody {
    if (!request.body) {
      logger.error('Missing request body.');
      throw new CustomError(
        400,
        'Bad request: No Pub/Sub message was received'
      );
    }
    return request.body;
  }

  /**
   * Validates that the request body contains a message
   * @param {PubSubBody} requestBody - The request body to validate
   * @throws {CustomError} If message is missing from body
   * @returns {PubSubMessage} The validated Pub/Sub message
   */
  static validateMessageFormat(requestBody: PubSubBody): PubSubMessage {
    if (!requestBody.message) {
      logger.error('Missing body message');
      throw new CustomError(
        400,
        'Bad request: Wrong No Pub/Sub message format'
      );
    }
    return requestBody.message;
  }

  /**
   * Decodes the Pub/Sub message data from base64 and parses it as JSON
   * @param {PubSubMessage} pubSubMessage - The Pub/Sub message containing the data
   * @throws {CustomError} If message data is missing or invalid
   * @returns {T} The decoded and parsed message data
   */
  static decodeMessageData<T>(pubSubMessage: PubSubMessage): T {
    if (!pubSubMessage.data) {
      logger.error('Missing message data');
      throw new CustomError(400, 'Bad request: No message data found');
    }

    try {
      const decodedData = Buffer.from(pubSubMessage.data, 'base64')
        .toString()
        .trim();

      if (!decodedData) {
        throw new CustomError(400, 'Decoded data is empty');
      }
      if (JSON.parse(decodedData)?.notificationType === 'ResourceCreated')
        throw new CustomError(
          200,
          'Message for subscription created. Skip processing message.'
        );
      return JSON.parse(decodedData) as T;
    } catch (error) {
      logger.error('Failed to decode or parse message data:', error);
      throw new CustomError(400, 'Bad request: Invalid message data format');
    }
  }
}

export default PubSubValidator;
