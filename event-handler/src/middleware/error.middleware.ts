import { ErrorRequestHandler, Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';

export const errorMiddleware: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _next: (err?: Error) => void
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  logger.error(error.message, error);

  if (error instanceof CustomError) {
    console.log('ready to send custom error response');
    res.status(error.statusCode as number).send({
      message: error.message,
      errors: error.errors,
      cause: error.cause,
      stack: isDevelopment ? error.stack : undefined,
    });
  } else {
    res
      .status(202)
      .send(
        isDevelopment
          ? { message: error.message }
          : { message: 'Internal server error' }
      );
  }
};
