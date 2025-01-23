import { DefaultComponentBuilder } from "../components/default";
import { Sdk } from "../sdk";
import {
  
  EnablerOptions,
  ShippingComponentBuilder,
  ShippingEnabler,
  ShippingInitResult,
} from "./shipping-enabler";

declare global {
  interface ImportMeta {
    env: any;
  }
}

export type BaseOptions = {
  sdk: Sdk;
  processorUrl: string;
  sessionId: string;
  environment: string;
  locale?: string;
  onInitCompleted: (result: ShippingInitResult) => void;
  onUpdateCompleted: () => void;
  onSubmissionCompleted: () => void;
  onError: (error?: any) => void;
};

export class IngridShippingEnabler implements ShippingEnabler {
  setupData: Promise<{ baseOptions: BaseOptions }>;

  constructor(options: EnablerOptions) {
    this.setupData = IngridShippingEnabler._Setup(options);
  }

  private static _Setup = async (
    options: EnablerOptions
  ): Promise<{ baseOptions: BaseOptions }> => {
    // Fetch SDK config from processor if needed, for example:

    // const configResponse = await fetch(instance.processorUrl + '/config', {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json', 'X-Session-Id': options.sessionId },
    // });

    // const configJson = await configResponse.json();

    const sdkOptions = {
      // environment: configJson.environment,
      environment: "test",
    };

    return Promise.resolve({
      baseOptions: {
        sdk: new Sdk(sdkOptions),
        processorUrl: options.processorUrl,
        sessionId: options.sessionId,
        environment: sdkOptions.environment,
        onInitCompleted: options.onInitCompleted || (() => {}),
        onUpdateCompleted: options.onUpdateCompleted || (() => {}),
        onSubmissionCompleted: options.onSubmissionCompleted || (() => {}),
        onError: options.onError || (() => {}),
      },
    });
  };

  async createComponentBuilder(): Promise<ShippingComponentBuilder | never> {
    const { baseOptions } = await this.setupData;

    return new DefaultComponentBuilder(baseOptions);
  }

}
