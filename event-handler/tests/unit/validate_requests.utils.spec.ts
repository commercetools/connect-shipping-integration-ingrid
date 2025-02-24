import PubSubValidator from '../../src/utils/validate_requests.utils';
import CustomError from '../../src/errors/custom.error';
import {logger} from '../../src/utils/logger.utils';

// Mock logger
jest.mock('../../src/utils/logger.utils');

describe('PubSubValidator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateRequestBody', () => {
        it('should return body when request contains valid body', () => {
            const mockBody = {message: {data: 'test'}};
            const mockRequest = {body: mockBody};

            const result = PubSubValidator.validateRequestBody(mockRequest);

            expect(result).toBe(mockBody);
        });

        it('should throw CustomError when request body is missing', () => {
            const mockRequest = {};

            expect(() => PubSubValidator.validateRequestBody(mockRequest)).toThrow(
                new CustomError(400, 'Bad request: No Pub/Sub message was received')
            );
            expect(logger.error).toHaveBeenCalledWith('Missing request body.');
        });
    });

    describe('validateMessageFormat', () => {
        it('should return message when body contains valid message', () => {
            const mockMessage = {data: 'test'};
            const mockBody = {message: mockMessage};

            const result = PubSubValidator.validateMessageFormat(mockBody);

            expect(result).toBe(mockMessage);
        });

        it('should throw CustomError when message is missing', () => {
            const mockBody = {};

            expect(() => PubSubValidator.validateMessageFormat(mockBody)).toThrow(
                new CustomError(400, 'Bad request: Wrong No Pub/Sub message format')
            );
            expect(logger.error).toHaveBeenCalledWith('Missing body message');
        });
    });

    describe('decodeMessageData', () => {
        it('should decode and parse valid base64 encoded JSON data', () => {
            const testData = {orderId: '123'};
            const encodedData = Buffer.from(JSON.stringify(testData)).toString('base64');
            const mockMessage = {data: encodedData};

            const result = PubSubValidator.decodeMessageData(mockMessage);

            expect(result).toEqual(testData);
        });

        it('should throw CustomError when message data is missing', () => {
            const mockMessage = {};

            expect(() => PubSubValidator.decodeMessageData(mockMessage)).toThrow(
                new CustomError(400, 'Bad request: No message data found')
            );
            expect(logger.error).toHaveBeenCalledWith('Missing message data');
        });

        it('should throw CustomError when decoded data is empty', () => {
            const encodedEmptyString = Buffer.from('  ').toString('base64');
            const mockMessage = {data: encodedEmptyString};

            expect(() => PubSubValidator.decodeMessageData(mockMessage)).toThrow(
                new CustomError(400, 'Bad request: Invalid message data format')
            );
            expect(logger.error).toHaveBeenCalledWith(
                'Failed to decode or parse message data:',
                expect.any(Error)
            );
        });

        it('should throw CustomError when data is not valid JSON', () => {
            const invalidJson = 'not json';
            const encodedInvalidJson = Buffer.from(invalidJson).toString('base64');
            const mockMessage = {data: encodedInvalidJson};

            expect(() => PubSubValidator.decodeMessageData(mockMessage)).toThrow(
                new CustomError(400, 'Bad request: Invalid message data format')
            );
            expect(logger.error).toHaveBeenCalledWith(
                'Failed to decode or parse message data:',
                expect.any(Error)
            );
        });

        it('should handle complex JSON objects', () => {
            const complexData = {
                orderId: '123',
                customer: {
                    name: 'Test User',
                    address: {
                        street: '123 Test St',
                        city: 'Test City'
                    }
                },
                items: [
                    {id: 1, name: 'Item 1'},
                    {id: 2, name: 'Item 2'}
                ]
            };
            const encodedData = Buffer.from(JSON.stringify(complexData)).toString('base64');
            const mockMessage = {data: encodedData};

            const result = PubSubValidator.decodeMessageData(mockMessage);

            expect(result).toEqual(complexData);
        });
    });

    describe('Integration tests', () => {
        it('should validate and decode a complete valid request', () => {
            const testData = {orderId: '123'};
            const encodedData = Buffer.from(JSON.stringify(testData)).toString('base64');
            const mockRequest = {
                body: {
                    message: {
                        data: encodedData
                    }
                }
            };

            const body = PubSubValidator.validateRequestBody(mockRequest);
            const message = PubSubValidator.validateMessageFormat(body);
            const decodedData = PubSubValidator.decodeMessageData(message);

            expect(decodedData).toEqual(testData);
        });

        it('should handle the complete validation chain with invalid data', () => {
            const mockRequest = {
                body: {
                    message: {
                        data: 'invalid-base64'
                    }
                }
            };

            const body = PubSubValidator.validateRequestBody(mockRequest);
            const message = PubSubValidator.validateMessageFormat(body);

            expect(() => PubSubValidator.decodeMessageData(message)).toThrow(
                new CustomError(400, 'Bad request: Invalid message data format')
            );
        });
    });
}); 