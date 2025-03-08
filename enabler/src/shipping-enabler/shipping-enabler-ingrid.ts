import { DefaultComponentBuilder } from "../components/default";
import type {
  EnablerOptions,
  ShippingComponentBuilder,
  ShippingEnabler,
  ShippingInitResult,
  ShippingUpdateResult,
} from "./shipping-enabler";

export type BaseOptions = {
  processorUrl: string;
  sessionId: string;
  locale?: string;
  onInitCompleted: (result: ShippingInitResult) => void;
  onUpdateCompleted: (result: ShippingUpdateResult) => void;
  onError: (error?: unknown) => void;
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

    // const sdkOptions = {
    //   // environment: configJson.environment,
    //   environment: "test",
    // };

    return Promise.resolve({
      baseOptions: {
        processorUrl: options.processorUrl,
        sessionId: options.sessionId || "",
        onInitCompleted: options.onInitCompleted || (() => {}),
        onUpdateCompleted: options.onUpdateCompleted || (() => {}),
        onError: options.onError || (() => {}),
      },
    });
  };

  async createComponentBuilder(): Promise<ShippingComponentBuilder | never> {
    const { baseOptions } = await this.setupData;

    return new DefaultComponentBuilder(baseOptions);
  }
}
