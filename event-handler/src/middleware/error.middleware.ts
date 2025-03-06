import { ErrorRequestHandler, Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';

export const errorMiddleware: ErrorRequestHandler = (
  error: Error,
  _: Request,
  res: Response
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  logger.error(error.message, error);

  if (error instanceof CustomError) {
    res.status(error.statusCode as number).json({
      message: error.message,
      errors: error.errors,
      stack: isDevelopment ? error.stack : undefined,
    });

    return;
  }

  res
    .status(500)
    .send(
      isDevelopment
        ? { messge: error.message }
        : { message: 'Internal server error' }
    );
};
