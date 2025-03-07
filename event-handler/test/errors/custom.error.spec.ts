import { describe, it, expect } from '@jest/globals';
import CustomError from '../../src/errors/custom.error';

describe('CustomError', () => {
  it('should create a CustomError with statusCode and message', () => {
    const error = new CustomError(400, 'Bad Request');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CustomError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad Request');
    expect(error.errors).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it('should create a CustomError with errors array', () => {
    const errorItems = [
      { statusCode: 400, message: 'Field is required' },
      { statusCode: 400, message: 'Invalid format', referencedBy: 'email' },
    ];

    const error = new CustomError(400, 'Validation Error', {
      errors: errorItems,
    });

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Validation Error');
    expect(error.errors).toEqual(errorItems);
    expect(error.cause).toBeUndefined();
  });

  it('should create a CustomError with cause', () => {
    const originalError = new Error('Original error');
    const error = new CustomError(500, 'Internal Server Error', {
      cause: originalError,
    });

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Internal Server Error');
    expect(error.errors).toBeUndefined();
    expect(error.cause).toBe(originalError);
  });

  it('should create a CustomError with both errors array and cause', () => {
    const errorItems = [{ statusCode: 400, message: 'Field is required' }];
    const originalError = new Error('Original error');

    const error = new CustomError(400, 'Validation Error', {
      errors: errorItems,
      cause: originalError,
    });

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Validation Error');
    expect(error.errors).toEqual(errorItems);
    expect(error.cause).toBe(originalError);
  });

  it('should handle string statusCode', () => {
    const error = new CustomError('INVALID_INPUT', 'Invalid input provided');

    expect(error.statusCode).toBe('INVALID_INPUT');
    expect(error.message).toBe('Invalid input provided');
  });
});
