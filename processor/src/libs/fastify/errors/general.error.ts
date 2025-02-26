import { CustomError } from './custom.error';
import type { CustomErrorAdditionalOpts } from './dtos/error.dto';

/**
 * General (https://docs.commercetools.com/api/errors#general)
 * Returned when a server-side problem occurs.
 */

export class GeneralError extends CustomError {
  constructor(msg: string = 'Unknown error.', additionalOpts?: CustomErrorAdditionalOpts) {
    super({
      code: 'General',
      httpErrorStatus: 500,
      message: msg,
      ...additionalOpts,
    });
  }
}
