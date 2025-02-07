import { CustomError } from './custom.error';
import { CustomErrorAdditionalOpts } from './dtos/error.dto';

/**
 * AuthErrorResponse (https://docs.commercetools.com/api/errors#autherrorresponse)
 * Represents errors related to authentication and authorization in a format conforming to the OAuth 2.0 specification.
 * {
 *   "statusCode": 401,
 *   "message": "invalid_token",
 *   "errors": [
 *     {
 *       "code": "invalid_token",
 *       "message": "invalid_token"
 *     }
 *   ],
 *   "error": "invalid_token"
 * }
 */
export class ErrorAuthErrorResponse extends CustomError {
  constructor(message?: string, additionalOpts?: CustomErrorAdditionalOpts, code?: string) {
    super({
      code: code || 'invalid_token',
      httpErrorStatus: 401,
      message: message || 'Authentication error.',
      ...additionalOpts,
    });
  }
}
