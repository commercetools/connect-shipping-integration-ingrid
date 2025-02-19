import type {
  ShippingComponent,
  ShippingComponentBuilder,
  ShippingInitResult,
  ShippingUpdateResult,
} from "../shipping-enabler/shipping-enabler";

import type { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";
import { replaceScriptNode } from "../utils/html-node.util";
export class DefaultComponentBuilder implements ShippingComponentBuilder {
  constructor(private baseOptions: BaseOptions) {}

  build(): ShippingComponent {
    return new DefaultComponent(this.baseOptions);
  }
}

export class DefaultComponent implements ShippingComponent {
  protected processorUrl: BaseOptions["processorUrl"];
  protected sessionId: BaseOptions["sessionId"];
  protected onInitCompleted: (result: ShippingInitResult) => void;
  protected onUpdateCompleted: (result: ShippingUpdateResult) => void;
  protected onError: (error?: unknown) => void;

  constructor(baseOptions: BaseOptions) {
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.onInitCompleted = baseOptions.onInitCompleted;
    this.onUpdateCompleted = baseOptions.onUpdateCompleted;
    this.onError = baseOptions.onError;
  }
  private clientDOMElementId: string = "";

  mount(elementId: string) {
    this.clientDOMElementId = elementId;
  }

  async init() {
    // here we would call the SDK to submit the payment
    // this.sdk.init({ environment: this.environment });
    try {
      const response = await fetch(this.processorUrl + "/sessions/init", {
        method: "POST",
        headers: {
          "X-Session-Id": this.sessionId,
        },
      });

      const data = await response.json();
      if (!data.success) {
        this.onError(data);
      }

      const clientElement = document.querySelector(
        `#${this.clientDOMElementId}`
      );

      if (data.success && clientElement) {
        this.onInitCompleted({
          isSuccess: data.success,
          ingridSessionId: data.ingridSessionId,
          ingridHtml: data.ingridHtml,
          cartVersion: data.cartVersion,
        });
        clientElement.insertAdjacentHTML("afterbegin", data.ingridHtml);
        replaceScriptNode(clientElement);
      } else {
        this.onError(
          `Error initialising Ingrid integration, element with ID ${this.clientDOMElementId} doesn't exist`
        );
      }
    } catch (error) {
      this.onError(error);
    }
  }

  async update() {
    try {
      const response = await fetch(this.processorUrl + "/sessions/update", {
        method: "POST",
        headers: {
          "X-Session-Id": this.sessionId,
        },
      });

      const data = await response.json();
      console.log(data);

      if (!data.success) {
        this.onError(data);
      }
      this.onUpdateCompleted({
        isSuccess: data.success,
        ingridSessionId: data.ingridSessionId,
        cartVersion: data.cartVersion,
      });
    } catch (error) {
      this.onError(error);
    }
  }

  // async submit() {
  //   this.sdk.init({ environment: this.environment });
  //   try {
  //     const requestData = {} // TODO: implement request body
  //     const response = await fetch(this.processorUrl + "/sessions/submit", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-Session-Id": this.sessionId,
  //       },
  //       body: JSON.stringify(requestData),
  //     });
  //     const data = await response.json();
  //     if (data) {

  //         this.onSubmissionCompleted();
  //     } else {
  //       this.onError("Some error occurred. Please try again.");
  //     }
  //   } catch (e) {
  //     this.onError("Some error occurred. Please try again.");
  //   }
  // }
}
