import { Sdk } from '../sdk';
import { ComponentOptions, ShippingComponent, ShippingInitResult } from '../shipping-enabler/shipping-enabler';
import { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";

/**
 * Base Web Component
 */
export abstract class BaseComponent implements ShippingComponent {
  protected sdk: Sdk;
  protected processorUrl: BaseOptions['processorUrl'];
  protected sessionId: BaseOptions['sessionId'];
  protected environment: BaseOptions['environment'];
  protected onInitCompleted: (result: ShippingInitResult) => void;
  protected onUpdateCompleted: () => void;
  protected onSubmissionCompleted: () => void;
  protected onError: (error?: any) => void;

  constructor(baseOptions: BaseOptions, _componentOptions: ComponentOptions) {
    this.sdk = baseOptions.sdk;
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.environment = baseOptions.environment;
    this.onInitCompleted = baseOptions.onInitCompleted;
    this.onUpdateCompleted = baseOptions.onUpdateCompleted;
    this.onSubmissionCompleted = baseOptions.onSubmissionCompleted;
    
    this.onError = baseOptions.onError;
  }

  abstract init(): void;
  abstract update(): void;
  abstract submit(): void;

  abstract mount(selector: string): void ;

  showValidation?(): void;
  isValid?(): boolean;
  getState?(): string;
  isAvailable?(): Promise<boolean>;
}
