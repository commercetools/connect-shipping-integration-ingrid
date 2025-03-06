import { describe, it, expect } from '@jest/globals';
import PubSubValidator from '../../../src/utils/validate_requests.utils';
import CustomError from '../../../src/errors/custom.error';
import { DecodedMessageType } from '../../../src/types/index.types';

describe('validateDecodedMessage', () => {
  it('should return RESOURCE_CREATED_MESSAGE for ResourceCreated notification type', () => {
    const decodedData: DecodedMessageType = {
      notificationType: 'ResourceCreated',
    };

    const result = PubSubValidator.validateDecodedMessage(decodedData);

    expect(result).toBe('RESOURCE_CREATED_MESSAGE');
  });

  it('should throw an error if the message type is not OrderCreated', () => {
    const decodedData: DecodedMessageType = {
      notificationType: 'Message',
      type: 'SomeOtherType',
      order: {
        id: 'test-order-id',
      },
    };

    expect(() => PubSubValidator.validateDecodedMessage(decodedData)).toThrow(
      CustomError
    );
    expect(() => PubSubValidator.validateDecodedMessage(decodedData)).toThrow(
      'Bad request. The message is not for OrderCreated event.'
    );
  });

  it('should throw an error if the order ID is missing', () => {
    const decodedData: DecodedMessageType = {
      notificationType: 'Message',
      type: 'OrderCreated',
      order: {
        id: '', // Empty ID
      },
    };

    expect(() => PubSubValidator.validateDecodedMessage(decodedData)).toThrow(
      CustomError
    );
    expect(() => PubSubValidator.validateDecodedMessage(decodedData)).toThrow(
      'Bad request. The order ID cannot be found in message.'
    );
  });

  it('should return the order ID for valid OrderCreated messages', () => {
    const decodedData: DecodedMessageType = {
      notificationType: 'Message',
      type: 'OrderCreated',
      order: {
        id: 'test-order-id',
      },
    };

    const result = PubSubValidator.validateDecodedMessage(decodedData);

    expect(result).toBe('test-order-id');
  });
});
