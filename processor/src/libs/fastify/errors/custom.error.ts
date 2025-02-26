import { CustomErrorOpts } from './dtos/error.dto';
/**
 * CutsomError is a custom error class that extends the native Error class.
 */
export class CustomError extends Error {
  public code: string;
  public httpErrorStatus: number;
  public override cause?: Error | unknown;
  public privateFields?: object;
  public privateMessage?: string;
  public fields?: object;
  public skipLog?: boolean;
  constructor(opts: CustomErrorOpts) {
    super(opts.message);
    this.name = 'Errorx';
    this.code = opts.code;
    this.httpErrorStatus = opts.httpErrorStatus;
    if (opts.cause) {
      this.cause = opts.cause;
    }
    if (opts.privateFields) {
      this.privateFields = opts.privateFields;
    }
    if (opts.privateMessage) {
      this.privateMessage = opts.privateMessage;
    }
    if (opts.fields) {
      this.fields = opts.fields;
    }
    if (opts.skipLog) {
      this.skipLog = opts.skipLog;
    }
  }
}
