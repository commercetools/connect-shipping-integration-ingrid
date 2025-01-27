import { CustomError } from './custom.error';
import { CustomErrorAdditionalOpts } from './dtos/error.dto';

/**
 * InvalidField (https://docs.commercetools.com/api/errors#invalidfield)
 * Returned when a field has an invalid value.
 */
export class ErrorInvalidField extends CustomError {
  constructor(field: string, invalidValue: string, allowedValues: string, additionalOpts?: CustomErrorAdditionalOpts) {
    const { fields, ...rest } = additionalOpts || {};
    super({
      code: 'InvalidField',
      httpErrorStatus: 400,
      message: `The value ${invalidValue} is not valid for field ${field}.`,
      fields: {
        ...fields,
        field,
        invalidValue,
        allowedValues,
      },
      ...rest,
    });
  }
}
