import envValidators from '../../../src/validators/env.validators';  
import { getValidateMessages } from '../../../src/validators/helpers.validators';  

import { describe, test, expect, afterEach, jest, afterAll, beforeAll, beforeEach } from '@jest/globals';
 
describe('env.validators', () => {
  
  beforeAll(() => {
   
  });

  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  afterAll(() => {
    
  });

  afterEach(() => {
   
  });


  test('No validation errors with proper envVars', async () => {
    const envVars = {
        clientId: '123456789012345678901234',
        clientSecret: '12345678901234567890123456789012',
        projectKey: 'connect-shipping-integration-ingrid',
        scope: 'manage_project:connect-shipping-integration-ingrid',
        region: 'europe-west1.gcp',
        ingridApiKey: '12345',
        ingridEnvironment: 'STAGING'
      
    }
    const validationErrors = getValidateMessages(envValidators, envVars);
    expect(validationErrors).toEqual([]);
  });
  test('Return error with short clientID', async () => {
    const envVars = {
        clientId: '1234',
        clientSecret: '12345678901234567890123456789012',
        projectKey: 'connect-shipping-integration-ingrid',
        scope: 'manage_project:connect-shipping-integration-ingrid',
        region: 'europe-west1.gcp',
        ingridApiKey: '12345',
        ingridEnvironment: 'STAGING'
    }
    const validationErrors = getValidateMessages(envValidators, envVars);
    expect(validationErrors).toBeDefined();
    expect(validationErrors.length).toEqual(1);
    expect(validationErrors[0].message).toEqual('Client id should be 24 characters.');
  });
  test('Return error with short client secret', async () => {
    const envVars = {
        clientId: '123456789012345678901234',
        clientSecret: '1234',
        projectKey: 'connect-shipping-integration-ingrid',
        scope: 'manage_project:connect-shipping-integration-ingrid',
        region: 'europe-west1.gcp',
        ingridApiKey: '12345',
        ingridEnvironment: 'STAGING'
    }
    const validationErrors = getValidateMessages(envValidators, envVars);
    expect(validationErrors).toBeDefined();
    expect(validationErrors.length).toEqual(1);
    expect(validationErrors[0].message).toEqual('Client secret should be 32 characters.');
  });
  test('Return error with invalid project key', async () => {
    const envVars = {
        clientId: '123456789012345678901234',
        clientSecret: '12345678901234567890123456789012',
        projectKey: '%%%%%%%',
        scope: 'manage_project:connect-shipping-integration-ingrid',
        region: 'europe-west1.gcp',
        ingridApiKey: '12345',
        ingridEnvironment: 'STAGING'
    }
    const validationErrors = getValidateMessages(envValidators, envVars);
    expect(validationErrors).toBeDefined();
    expect(validationErrors.length).toEqual(1);
    expect(validationErrors[0].message).toEqual('Project key should be a valid string.');
  });
  test('Return error with invalid scope', async () => {
    const envVars = {
        clientId: '123456789012345678901234',
        clientSecret: '12345678901234567890123456789012',
        projectKey: 'connect-shipping-integration-ingrid',
        scope: 'u',
        region: 'europe-west1.gcp',
        ingridApiKey: '12345',
        ingridEnvironment: 'STAGING'
    }
    const validationErrors = getValidateMessages(envValidators, envVars);
    expect(validationErrors).toBeDefined();
    expect(validationErrors.length).toEqual(1);
    expect(validationErrors[0].message).toEqual('Scope should be at least 2 characters long.');
  });
  test('Return error with invalid scope', async () => {
    const envVars = {
        clientId: '123456789012345678901234',
        clientSecret: '12345678901234567890123456789012',
        projectKey: 'connect-shipping-integration-ingrid',
        scope: 'manage_project:connect-shipping-integration-ingrid',
        region: 'europe-east1.gcp',
        ingridApiKey: '12345',
        ingridEnvironment: 'STAGING'
    }
    const validationErrors = getValidateMessages(envValidators, envVars);
    expect(validationErrors).toBeDefined();
    expect(validationErrors.length).toEqual(1);
    expect(validationErrors[0].message).toEqual('Not a valid region.');
  });
});
