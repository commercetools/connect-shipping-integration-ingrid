export type ErrorxAdditionalOpts = {
  privateFields?: object;
  privateMessage?: string;
  fields?: object;
  skipLog?: boolean;
  cause?: Error | unknown;
};

export type ErrorxBaseOpts = {
  message: string;
  code: string;
  httpErrorStatus: number;
};

export type ErrorxOpts = ErrorxBaseOpts & ErrorxAdditionalOpts;

/**
 * Errorx is a custom error class that extends the native Error class.
 */
export class Errorx extends Error {
  public code: string;
  public httpErrorStatus: number;
  public cause?: Error | unknown;
  public privateFields?: object;
  public privateMessage?: string;
  public fields?: object;
  public skipLog?: boolean;
  constructor(opts: ErrorxOpts) {
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
