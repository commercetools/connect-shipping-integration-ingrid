import CustomError from '../errors/custom.error';
import envValidators from '../validators/env.validators';
import { getValidateMessages } from '../validators/helpers.validators';

/**
 * Read the configuration env vars
 * (Add yours accordingly)
 *
 * @returns The configuration with the correct env vars
 */
export const readConfiguration = () => {
  const envVars = {
    clientId: process.env.CTP_CLIENT_ID as string,
    clientSecret: process.env.CTP_CLIENT_SECRET as string,
    projectKey: process.env.CTP_PROJECT_KEY as string,
    authUrl:
      (process.env.CTP_AUTH_URL as string) ??
      'https://auth.europe-west1.gcp.commercetools.com',
    apiUrl:
      (process.env.CTP_API_URL as string) ??
      'https://api.europe-west1.gcp.commercetools.com',
    ingridApiKey: process.env.INGRID_API_KEY as string,
    ingridEnvironment: process.env.INGRID_ENVIRONMENT as
      | 'STAGING'
      | 'PRODUCTION',
    ingridShippingCustomTypeKey: process.env
      .INGRID_SHIPPING_CUSTOM_TYPE_KEY as string,
  };

  const validationErrors = getValidateMessages(envValidators, envVars);

  if (validationErrors.length) {
    throw new CustomError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file',
      validationErrors
    );
  }
  return envVars;
};
