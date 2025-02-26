import { CustomError } from './custom.error';
import type { CustomErrorAdditionalOpts } from './dtos/error.dto';

/**
 * RequiredField (https://docs.commercetools.com/api/errors#requiredfield)
 * Returned when a value is not defined for a required field.
 */
export class ErrorRequiredField extends CustomError {
  constructor(field: string, additionalOpts?: CustomErrorAdditionalOpts) {
    const { fields, ...rest } = additionalOpts || {};
    super({
      code: 'RequiredField',
      httpErrorStatus: 400,
      message: `A value is required for field ${field}.`,
      fields: {
        ...fields,
        field,
      },
      ...rest,
    });
  }
}
