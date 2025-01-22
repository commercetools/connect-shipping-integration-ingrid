const config = {
  // Required by Payment SDK
  projectKey: process.env.CTP_PROJECT_KEY || 'projectKey',
  clientId: process.env.CTP_CLIENT_ID || 'xxx',
  clientSecret: process.env.CTP_CLIENT_SECRET || 'xxx',
  authUrl: process.env.CTP_AUTH_URL || 'https://auth.europe-west1.gcp.commercetools.com',
  apiUrl: process.env.CTP_API_URL || 'https://api.europe-west1.gcp.commercetools.com',
  sessionUrl: process.env.CTP_SESSION_URL || 'https://session.europe-west1.gcp.commercetools.com/',

  // Required by logger
  loggerLevel: process.env.LOGGER_LEVEL || 'info',

  // Required by Ingrid
  ingridApiKey: process.env.INGRID_API_KEY || 'xxx',
  ingridEnvironment: process.env.INGRID_ENVIRONMENT || 'STAGING',
};
export const getConfig = () => {
  return config;
};
