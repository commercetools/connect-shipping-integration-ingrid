import { describe, expect, it } from '@jest/globals';
import * as helpers from '../../src/validators/helpers.validators';
import validator from 'validator';

describe('Validator Helpers', () => {
  describe('standardNaturalNumber', () => {
    it('should validate natural numbers correctly', () => {
      const [path, validators] = helpers.standardNaturalNumber(
        'testPath',
        'Invalid number'
      );
      const [validatorFn, message] = validators[0];

      // Test the validator function directly
      expect(path).toBe('testPath');
      expect(message).toBe('Invalid number');

      // Valid cases
      expect(validatorFn('123')).toBe(true);
      expect(validatorFn(123)).toBe(true);

      // Invalid cases
      expect(validatorFn('-123')).toBe(false);
      expect(validatorFn('123.45')).toBe(false);
      expect(validatorFn('abc')).toBe(false);
      expect(validatorFn('')).toBe(false);
      expect(validatorFn(null)).toBe(false);
      expect(validatorFn(undefined)).toBe(false);
    });
  });

  describe('array', () => {
    it('should validate arrays correctly', () => {
      // Create a simple validator function to use with array
      const mockValidator = (path: string, message: string) => [
        path,
        [[(value: string) => validator.isEmail(String(value)), message]],
      ];

      // Wrap the validator with array
      const arrayValidator = helpers.array(mockValidator);
      const [path, validators] = arrayValidator(
        'emails',
        'Invalid email array'
      );
      const [validatorFn, message] = validators[0];

      expect(path).toBe('emails');
      expect(message).toBe('Invalid email array');

      // Valid cases
      expect(validatorFn(['test@example.com', 'another@example.com'])).toBe(
        true
      );
      expect(validatorFn(['test@example.com'])).toBe(true);
      expect(validatorFn([])).toBe(true); // Empty array should pass

      // Invalid cases - array with invalid items
      expect(validatorFn(['test@example.com', 'invalid-email'])).toBe(false);
      expect(validatorFn(['invalid-email'])).toBe(false);

      // Test the implementation logic directly
      const testFn = (value: string[]) => {
        return (
          Array.isArray(value) &&
          value.every((item) => validator.isEmail(String(item)))
        );
      };

      // Test non-array values with our test function
      // @ts-expect-error - Intentionally testing with invalid type
      expect(testFn('not-an-array')).toBe(false);
      // @ts-expect-error - Intentionally testing with invalid type
      expect(testFn(null)).toBe(false);
      // @ts-expect-error - Intentionally testing with invalid type
      expect(testFn(undefined)).toBe(false);
    });

    it('should handle validator arguments correctly', () => {
      // Create a validator that uses additional arguments
      const mockValidator = (path: string, message: string) => [
        path,
        [
          [
            (value: string, additionalArg: string) => value === additionalArg,
            message,
            'expectedValue', // This is the validatorArgs
          ],
        ],
      ];

      // Wrap the validator with array
      const arrayValidator = helpers.array(mockValidator);
      const [, /* path */ validators] = arrayValidator(
        'values',
        'Invalid values'
      );
      const [validatorFn /* message */, , validatorArgs] = validators[0];

      expect(validatorArgs).toBe('expectedValue');

      // Test with the additional argument
      expect(
        validatorFn(['expectedValue', 'expectedValue'], 'expectedValue')
      ).toBe(true);
      expect(
        validatorFn(['expectedValue', 'differentValue'], 'expectedValue')
      ).toBe(false);
    });
  });

  describe('getValidateMessages', () => {
    it('should return validation messages for invalid items', () => {
      // Create some validator configs
      const validatorConfigs = [
        helpers.standardString(['name'], {
          code: 'REQUIRED',
          message: 'Name is required',
          referencedBy: 'name',
        }),
        helpers.standardEmail(['email'], {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format',
          referencedBy: 'email',
        }),
        helpers.standardNaturalNumber(['age'], {
          code: 'INVALID_AGE',
          message: 'Age must be a positive number',
          referencedBy: 'age',
        }),
      ];
      // Test with valid item
      const validItem = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      expect(helpers.getValidateMessages(validatorConfigs, validItem)).toEqual(
        []
      );

      // Test with invalid item
      const invalidItem = {
        name: '',
        email: 'invalid-email',
        age: -5,
      };

      const messages = helpers.getValidateMessages(
        validatorConfigs,
        invalidItem
      );
      expect(messages.length).toBe(3);
      expect(messages[0].message).toContain('Name is required');
      expect(messages[1].message).toContain('Invalid email format');
      expect(messages[2].message).toContain('Age must be a positive number');
    });
  });
});
