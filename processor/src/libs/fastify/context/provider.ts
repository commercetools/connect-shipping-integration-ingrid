import { ContextProvider, RequestContextData } from './types';

/**
 * ContextProvider is a class that provides a way to access and update the context data.
 */
export class RequestContextProvider implements ContextProvider<RequestContextData> {
  private getContextFn: () => RequestContextData;
  private updateContextFn: (ctx: Partial<RequestContextData>) => void;

  constructor(opts: {
    getContextFn: () => RequestContextData;
    updateContextFn: (ctx: Partial<RequestContextData>) => void;
  }) {
    this.getContextFn = opts.getContextFn;
    this.updateContextFn = opts.updateContextFn;
  }

  getContextData(): RequestContextData {
    return this.getContextFn();
  }

  updateContextData(ctx: Partial<RequestContextData>) {
    this.updateContextFn(ctx);
  }
}
