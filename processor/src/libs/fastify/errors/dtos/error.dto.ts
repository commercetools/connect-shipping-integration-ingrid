import { type Static, Type } from '@sinclair/typebox';

/**
 * Represents https://docs.commercetools.com/api/errors#errorobject
 */
export const ErrorObject = Type.Object(
  {
    code: Type.String(),
    message: Type.String(),
  },
  { additionalProperties: true },
);

/**
 * Represents https://docs.commercetools.com/api/errors#errorresponse
 */
export const ErrorResponse = Type.Object({
  statusCode: Type.Integer(),
  message: Type.String(),
  errors: Type.Array(ErrorObject),
});

/**
 * Represents https://docs.commercetools.com/api/errors#autherrorresponse
 */
export const AuthErrorResponse = Type.Composite([
  ErrorResponse,
  Type.Object({
    error: Type.String(),
    error_description: Type.Optional(Type.String()),
  }),
]);

export type TErrorObject = Static<typeof ErrorObject>;
export type TErrorResponse = Static<typeof ErrorResponse>;
export type TAuthErrorResponse = Static<typeof AuthErrorResponse>;

export type CustomErrorAdditionalOpts = {
  privateFields?: object;
  privateMessage?: string;
  fields?: object;
  skipLog?: boolean;
  cause?: Error | unknown;
};

export type CustomErrorBaseOpts = {
  message: string;
  code: string;
  httpErrorStatus: number;
};

export type CustomErrorOpts = CustomErrorBaseOpts & CustomErrorAdditionalOpts;
