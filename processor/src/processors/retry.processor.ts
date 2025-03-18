import { CustomError } from '../libs/fastify/errors';
import { CustomErrorOpts } from '../libs/fastify/errors/dtos/error.dto';

export class RetryProcessor<T> {
  #ONE_SECOND_INTERVAL = 1000;
  #fn: () => Promise<T>;
  #successfulPredicate: (result: T) => boolean;
  #retries: number;
  #interval: number;
  #backoffFactor: number;
  #maxDelay: number;
  #errorMessage: string;

  delay = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  constructor(fn: () => Promise<T>) {
    this.#fn = fn;
    this.#successfulPredicate = () => true;
    this.#retries = 5;
    this.#interval = this.#ONE_SECOND_INTERVAL;
    this.#backoffFactor = 2;
    this.#maxDelay = this.#ONE_SECOND_INTERVAL * 5; //5 seconds max delay
    this.#errorMessage = `Failed after ${this.#retries} retries`;
  }

  successfulPredicate(successfulPredicate: (result: T) => boolean): this {
    this.#successfulPredicate = successfulPredicate;
    return this;
  }

  retries(retries: number): this {
    this.#retries = retries;
    return this;
  }

  interval(interval: number): this {
    this.#interval = interval;
    return this;
  }

  backOffFactor(factor: number): this {
    this.#backoffFactor = factor;
    return this;
  }

  maxDelay(maxDelay: number): this {
    this.#maxDelay = maxDelay;
    return this;
  }

  errorMessage(errorMessage: string): this {
    this.#errorMessage = errorMessage;
    return this;
  }

  async execute(): Promise<T> {
    let attempts = 0;
    let delay = this.#interval;
    const errors: CustomError[] = [];

    while (attempts < this.#retries) {
      try {
        const result = await this.#fn();
        if (this.#successfulPredicate(result)) {
          return result;
        }
        this.addResultCustomError('Successful Predicate failed checked retrying', attempts, result, errors);
      } catch (error) {
        if (error instanceof CustomError) {
          // if it is a custom error thrown from elsewhere, we can attempt retry only if HTTP status > 500
          if (error.httpErrorStatus < 500) {
            throw error; // don't retry if HTTP status is not a server error
          }
          errors.push(error);
        } else {
          // if it is not a custom error, we can attempt retry
          const opts: CustomErrorOpts = {
            message: error instanceof Error ? error.message : String(error),
            code: 'EXECUTION_FAILED_IN_RETRY_PROCESS',
            httpErrorStatus: 500,
            cause: error,
          };
          const retryError = new CustomError(opts);
          errors.push(retryError);
        }
      }
      attempts++;
      if (attempts < this.#retries) {
        await this.delay(delay);
        if (delay < this.#maxDelay) {
          delay *= this.#backoffFactor;
        } else {
          delay = this.#maxDelay;
        }
      }
    }

    const opts: CustomErrorOpts = {
      message: this.#errorMessage,
      code: 'RETRY_FAILED',
      httpErrorStatus: 500,
      cause: this.transformErrorsToChain(errors),
    };
    throw new CustomError(opts);
  }

  private addResultCustomError(message: string, attempts: number, result: Awaited<T>, errors: CustomError[]) {
    const CustomErrorOpts = {
      message: `${message}. Attempts: ${attempts}.`,
      code: 'EXECUTION_FAILED_IN_RETRY_PROCESS',
      httpErrorStatus: 500,
      cause: result,
    };
    const retryError = new CustomError(CustomErrorOpts);
    errors.push(retryError);
  }

  private transformErrorsToChain(errors: Error[] | Error | undefined) {
    if (!errors) {
      return undefined;
    }

    if (!Array.isArray(errors)) {
      return errors;
    }

    if (errors.length === 0) {
      return undefined;
    }

    return errors.reduce((accumulator: Error, error: Error) => {
      accumulator.cause = error;
      return accumulator;
    });
  }
}
