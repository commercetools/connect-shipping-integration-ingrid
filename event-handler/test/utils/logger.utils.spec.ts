import { describe, it, expect, jest } from '@jest/globals';
import { logger } from '../../src/utils/logger.utils';
import { createApplicationLogger } from '@commercetools-backend/loggers';

// Mock the createApplicationLogger
jest.mock('@commercetools-backend/loggers', () => ({
  createApplicationLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('Logger Utils', () => {
  it('should create an application logger', () => {
    // Verify the logger was created using createApplicationLogger
    expect(jest.mocked(createApplicationLogger)).toHaveBeenCalled();
    expect(logger).toBeDefined();
  });
});
