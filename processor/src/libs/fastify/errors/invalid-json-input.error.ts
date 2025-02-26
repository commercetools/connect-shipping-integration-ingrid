import { CustomError } from './custom.error';
import type { CustomErrorAdditionalOpts } from './dtos/error.dto';

/**
 * InvalidJsonInput (https://docs.commercetools.com/api/errors#invalidjsoninput)
 * Returned when an invalid JSON input has been sent. Either the JSON is syntactically incorrect or does not conform to the expected shape (for example is missing a required field).
 *
 * The client application should validate the input according to the constraints described in the error message before sending the request.
 */
export class ErrorInvalidJsonInput extends CustomError {
  constructor(detailedErrorMessage?: string, additionalOpts?: CustomErrorAdditionalOpts) {
    const { fields, ...rest } = additionalOpts || {};
    super({
      code: 'InvalidJsonInput',
      httpErrorStatus: 400,
      message: 'Request body does not contain valid JSON.',
      fields: {
        ...fields,
        detailedErrorMessage,
      },
      ...rest,
    });
  }
}
