import type {
  ShippingComponent,
  ShippingComponentBuilder,
  ShippingInitResult,
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
  protected onUpdateCompleted: () => void;
  protected onError: (error?: unknown) => void;
  private clientDOMElementId: string = "";

  constructor(baseOptions: BaseOptions) {
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.onInitCompleted = baseOptions.onInitCompleted;
    this.onUpdateCompleted = baseOptions.onUpdateCompleted;
    this.onError = baseOptions.onError;
  }

  mount(elementId: string) {
    this.clientDOMElementId = elementId;
  }

  async update() {
    // TODO: implement update() to send request to processor /sessions/update API
  }

  async init(cocoSessionId: string) {
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
      console.log(cocoSessionId);

      const clientElement = document.querySelector(
        `#${this.clientDOMElementId}`
      );
      if (data && clientElement) {
        this.onInitCompleted({
          isSuccess: true,
          ingridSessionId: data.ingridSessionId,
          ingridHtml: data.html,
        });

        clientElement.insertAdjacentHTML("afterbegin", data.html);
        replaceScriptNode(clientElement);
      } else {
        if (!clientElement) {
          this.onError(
            `Error initialising Ingrid integration, element with ID ${this.clientDOMElementId} doesn't exist`
          );
        } else {
          this.onError("Some error occurred. Please try again.");
        }
      }
    } catch (e) {
      console.log(e);
      this.onError("Some error occurred. Please try again.");
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
