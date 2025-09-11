import {
  assert,
  assertError,
  assertString,
} from '../../src/utils/assert.utils';
import { describe, expect, test } from '@jest/globals';

describe('assert.utils', () => {
  describe('assert', () => {
    test('should not throw if condition is true', () => {
      expect(() => assert(true, 'This should not throw')).not.toThrow();
    });

    test('should throw Error if condition is false', () => {
      expect(() => assert(false, 'Test error message')).toThrow(
        'Assertion failed: Test error message'
      );
    });
  });

  describe('assertError', () => {
    test('should not throw if value is an Error', () => {
      const error = new Error('Test error');
      expect(() => assertError(error)).not.toThrow();
    });

    test('should throw Error if value is not an Error', () => {
      expect(() => assertError('not an error')).toThrow(
        'Assertion failed: Invalid error value'
      );
    });

    test('should use custom message if provided', () => {
      expect(() => assertError('not an error', 'Custom error message')).toThrow(
        'Assertion failed: Custom error message'
      );
    });
  });

  describe('assertString', () => {
    test('should not throw if value is a string', () => {
      expect(() => assertString('this is a string')).not.toThrow();
    });

    test('should throw Error if value is not a string', () => {
      expect(() => assertString(123)).toThrow(
        'Assertion failed: Invalid string value'
      );
    });

    test('should use custom message if provided', () => {
      expect(() => assertString(123, 'Must be a string')).toThrow(
        'Assertion failed: Must be a string'
      );
    });
  });
});
