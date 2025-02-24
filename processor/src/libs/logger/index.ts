import { createApplicationLogger } from '@commercetools-backend/loggers';
import { getRequestContext } from '../fastify/context/context';
import { getConfig } from '../../config';
import setIn from 'lodash/set';
import { format } from 'logform';
import cloneDeep from 'lodash/cloneDeep';
import type { DefaultFields } from './types/logger.type';

const defaultFieldsFormatter = (defaults: DefaultFields) => {
  return format((info) => {
    const clone = cloneDeep(info);

    Object.entries(defaults).forEach(([key, value]) => {
      if (value === undefined) {
        // Do nothing
      } else if (typeof value === 'object' || typeof value === 'string') {
        setIn(clone, key, value);
      } else if (typeof value === 'function') {
        const evaluated = value();
        if (evaluated !== undefined) {
          setIn(clone, key, evaluated);
        }
      }
    });

    return clone;
  })(defaults);
};

export const appLogger = createApplicationLogger({
  formatters: [
    defaultFieldsFormatter({
      projectKey: getConfig().projectKey,
      version: process.env.npm_package_version,
      name: process.env.npm_package_name,
      correlationId: () => getRequestContext().correlationId,
      pathTemplate: () => getRequestContext().pathTemplate,
      path: () => getRequestContext().path,
    }),
  ],
});
