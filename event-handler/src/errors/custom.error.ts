type ErrorItem = {
  statusCode: number | string;
  message: string;
  referencedBy?: string;
  cause?: string;
};

class CustomError extends Error {
  statusCode: number | string;
  override message: string;
  errors?: ErrorItem[];
  override cause?: Error;

  constructor(
    statusCode: number | string,
    message: string,
    options?: { errors?: ErrorItem[]; cause?: Error }
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.cause = options?.cause;
    if (options?.errors) {
      this.errors = options.errors;
    }
  }
}

export default CustomError;
