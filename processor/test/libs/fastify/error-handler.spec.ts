import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import Fastify, { FastifyError, type FastifyInstance } from 'fastify';
import { errorHandler } from '../../../src/libs/fastify/error-handler';
import { CustomErrorAdditionalOpts } from '../../../src/libs/fastify/errors/dtos/error.dto';
import { requestContextPlugin } from '../../../src/libs/fastify/context';
import type { FastifySchemaValidationError } from 'fastify/types/schema';
import { CustomError, ErrorAuthErrorResponse } from '../../../src/libs/fastify/errors';
import { ErrorInvalidJsonInput } from '../../../src/libs/fastify/errors/invalid-json-input.error';
import { ErrorInvalidField } from '../../../src/libs/fastify/errors/invalid-field.error';

describe('error-handler', () => {
  let fastify: FastifyInstance;
  beforeEach(async () => {
    fastify = Fastify();
    fastify.setErrorHandler(errorHandler);
    await fastify.register(requestContextPlugin);
  });

  afterEach(async () => {
    await fastify.close();
  });

  test('errox error', async () => {
    fastify.get('/', () => {
      throw new CustomError({
        code: 'ErrorCode',
        message: 'someMessage',
        httpErrorStatus: 404,
      });
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.json()).toStrictEqual({
      message: 'someMessage',
      statusCode: 404,
      errors: [
        {
          code: 'ErrorCode',
          message: 'someMessage',
        },
      ],
    });
  });

  test('errox with fields', async () => {
    fastify.get('/', () => {
      throw new CustomError({
        code: 'ErrorCode',
        message: 'someMessage',
        httpErrorStatus: 404,
        fields: {
          test: 'field1',
        },
      });
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.json()).toStrictEqual({
      message: 'someMessage',
      statusCode: 404,
      errors: [
        {
          code: 'ErrorCode',
          message: 'someMessage',
          test: 'field1',
        },
      ],
    });
  });

  test('general error', async () => {
    fastify.get('/', () => {
      throw new Error('some message goes here');
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.json()).toStrictEqual({
      message: 'Internal server error.',
      statusCode: 500,
      errors: [
        {
          code: 'General',
          message: 'Internal server error.',
        },
      ],
    });
  });

  test('Fastify error with missing required field', async () => {
    const validationError: FastifySchemaValidationError = {
      keyword: 'required',
      instancePath: 'instancePath/domain/value',
      schemaPath: 'schemaPath/domain/value',
      params: {
        missingProperty: 'dummy-field',
      },
      message: 'fastify-error-message',
    };
    const fastifyError: FastifyError = {
      code: 'ErrorCode',
      name: 'fastify-error',
      message: 'fastify-error-message',
      validation: [validationError],
    };
    fastify.get('/', () => {
      throw fastifyError;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.json()).toStrictEqual({
      message: 'A value is required for field dummy-field.',
      statusCode: 400,
      errors: [
        {
          code: 'RequiredField',
          field: 'dummy-field',
          message: 'A value is required for field dummy-field.',
        },
      ],
    });
  });

  test('ErrorAuthErrorResponse', async () => {
    const opts: CustomErrorAdditionalOpts = {
      privateFields: {},
      privateMessage: '',
      fields: {},
      skipLog: true,
      cause: undefined,
    };
    const authErrorResponse: ErrorAuthErrorResponse = new ErrorAuthErrorResponse('someMessage', opts, '401');

    fastify.get('/', () => {
      throw authErrorResponse;
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.json()).toStrictEqual({
      message: 'someMessage',
      statusCode: 401,
      errors: [
        {
          code: '401',
          message: 'someMessage',
        },
      ],
      error: '401',
      error_description: 'someMessage',
    });
  });
});

describe('Custom Errors', () => {
  describe('ErrorInvalidJsonInput', () => {
    test('should create error with default message', () => {
      const error = new ErrorInvalidJsonInput();

      expect(error.code).toBe('InvalidJsonInput');
      expect(error.message).toBe('Request body does not contain valid JSON.');
      expect(error.httpErrorStatus).toBe(400);
    });

    test('should create error with detailed message', () => {
      const detailedMessage = 'Missing required field: name';
      const error = new ErrorInvalidJsonInput(detailedMessage);

      expect(error.code).toBe('InvalidJsonInput');
      expect(error.message).toBe('Request body does not contain valid JSON.');
      expect(error.fields).toEqual({
        detailedErrorMessage: detailedMessage,
      });
    });

    test('should create error with additional options', () => {
      const additionalOpts = {
        fields: { customField: 'value' },
        skipLog: true,
        privateMessage: 'Internal error details',
        privateFields: { internalId: '123' },
      };

      const error = new ErrorInvalidJsonInput('Detailed message', additionalOpts);

      expect(error.fields).toEqual({
        detailedErrorMessage: 'Detailed message',
        customField: 'value',
      });
      expect(error.skipLog).toBe(true);
      expect(error.privateMessage).toBe('Internal error details');
      expect(error.privateFields).toEqual({ internalId: '123' });
    });
  });

  describe('ErrorInvalidField', () => {
    test('should create error with required fields', () => {
      const error = new ErrorInvalidField('status', 'pending', 'active,inactive');

      expect(error.code).toBe('InvalidField');
      expect(error.message).toBe('The value pending is not valid for field status.');
      expect(error.httpErrorStatus).toBe(400);
      expect(error.fields).toEqual({
        field: 'status',
        invalidValue: 'pending',
        allowedValues: 'active,inactive',
      });
    });

    test('should create error with additional options', () => {
      const additionalOpts = {
        fields: { additionalInfo: 'Custom validation failed' },
        skipLog: true,
        privateMessage: 'Internal validation error',
        privateFields: { validationId: '456' },
      };

      const error = new ErrorInvalidField('category', 'unknown', 'books,electronics', additionalOpts);

      expect(error.code).toBe('InvalidField');
      expect(error.message).toBe('The value unknown is not valid for field category.');
      expect(error.fields).toEqual({
        field: 'category',
        invalidValue: 'unknown',
        allowedValues: 'books,electronics',
        additionalInfo: 'Custom validation failed',
      });
      expect(error.skipLog).toBe(true);
      expect(error.privateMessage).toBe('Internal validation error');
      expect(error.privateFields).toEqual({ validationId: '456' });
    });

    test('should handle empty additional options', () => {
      const error = new ErrorInvalidField('price', '-10', 'positive number');

      expect(error.code).toBe('InvalidField');
      expect(error.message).toBe('The value -10 is not valid for field price.');
      expect(error.fields).toEqual({
        field: 'price',
        invalidValue: '-10',
        allowedValues: 'positive number',
      });
      expect(error.skipLog).toBeUndefined();
      expect(error.privateMessage).toBeUndefined();
      expect(error.privateFields).toBeUndefined();
    });
  });
});
