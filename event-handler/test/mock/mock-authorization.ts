export const mockAccessTokenInvalidClient = {
  statusCode: 401,
  message: 'invalid_client',
  errors: [
    {
      code: 'invalid_client',
      message: 'invalid_client',
    },
  ],
  error: 'invalid_client',
};

export const mockAccessToken = {
  access_token: 'dummy-access-token',
  token_type: 'string',
  scope: 'dummy-scope',
  expires_in: 3600,
};
export type ErrorPrivateFields =
  | {
      responseStatus: number;
      responseText: string;
    }
  | undefined;
