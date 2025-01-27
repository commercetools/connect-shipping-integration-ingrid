import { setupPaymentSDK, Logger, RequestContextData } from '@commercetools/connect-payments-sdk';
import { getConfig } from './config/config';
import { getRequestContext, updateRequestContext } from './libs/fastify/context/context';
import { log } from './libs/logger/index';

export class AppLogger implements Logger {
  public debug = (obj: object, message: string) => {
    log.debug(message, obj || undefined);
  };
  public info = (obj: object, message: string) => {
    log.info(message, obj || undefined);
  };
  public warn = (obj: object, message: string) => {
    log.warn(message, obj || undefined);
  };
  public error = (obj: object, message: string) => {
    log.error(message, obj || undefined);
  };
}

const appLogger = new AppLogger();

export const paymentSDK = setupPaymentSDK({
  apiUrl: getConfig().apiUrl,
  authUrl: getConfig().authUrl,
  clientId: getConfig().clientId,
  clientSecret: getConfig().clientSecret,
  projectKey: getConfig().projectKey,
  sessionUrl: getConfig().sessionUrl,
  jwksUrl: getConfig().jwksUrl,
  jwtIssuer: getConfig().jwtIssuer,
  getContextFn: (): RequestContextData => {
    const { correlationId, requestId, authentication } = getRequestContext();
    return {
      correlationId: correlationId || '',
      requestId: requestId || '',
      authentication,
    };
  },
  updateContextFn: (context: Partial<RequestContextData>) => {
    const requestContext = Object.assign(
      {},
      context.correlationId ? { correlationId: context.correlationId } : {},
      context.requestId ? { requestId: context.requestId } : {},
      context.authentication ? { authentication: context.authentication } : {},
    );
    updateRequestContext(requestContext);
  },
  logger: appLogger,
});
