import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { Request, Response } from 'express';
import { errorMiddleware } from '../../src/middleware/error.middleware';
import CustomError from '../../src/errors/custom.error';
import { logger } from '../../src/utils/logger.utils';

// Define the ErrorItem type based on the CustomError implementation
type ErrorItem = {
  statusCode: number | string;
  message: string;
  referencedBy?: string;
  cause?: string;
};

// Mock the logger
jest.mock('../../src/utils/logger.utils');

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
    send: jest.Mock;
  };
  let mockNext: jest.Mock;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should handle CustomError correctly in development environment', () => {
    // Set environment to development
    process.env.NODE_ENV = 'development';

    const errorItem: ErrorItem = {
      statusCode: 400,
      message: 'Validation error',
    };
    const customError = new CustomError(400, 'Bad Request', {
      errors: [errorItem],
    });
    customError.stack = 'Stack trace';

    errorMiddleware(
      customError,
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      customError.message,
      customError
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'Bad Request',
      errors: [errorItem],
      stack: 'Stack trace',
    });
  });

  it('should handle CustomError correctly in production environment', () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';

    const errorItem: ErrorItem = {
      statusCode: 400,
      message: 'Validation error',
    };
    const customError = new CustomError(400, 'Bad Request', {
      errors: [errorItem],
    });

    errorMiddleware(
      customError,
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      customError.message,
      customError
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'Bad Request',
      errors: [errorItem],
      stack: undefined,
    });
  });

  it('should handle regular Error correctly in development environment', () => {
    // Set environment to development
    process.env.NODE_ENV = 'development';

    const error = new Error('Something went wrong');

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      error.message,
      error
    );
    expect(mockResponse.status).toHaveBeenCalledWith(202);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'Something went wrong',
    });
  });

  it('should handle regular Error correctly in production environment', () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';

    const error = new Error('Something went wrong');

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as unknown as Response,
      mockNext
    );

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      error.message,
      error
    );
    expect(mockResponse.status).toHaveBeenCalledWith(202);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });
});
