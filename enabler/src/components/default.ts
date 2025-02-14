import {
  ShippingComponent,
  ShippingComponentBuilder,
  ShippingInitResult,
} from "../shipping-enabler/shipping-enabler";

import { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";
import { replaceScriptNode } from "../utils/html-node.util";


interface Api {
  on(event: string, callback: (data: unknown, meta: unknown) => void): void;
}

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
  protected onShippingDataChanged: () => void;
  protected onUpdateCompleted: () => void;
  protected onError: (error?: unknown) => void;

  constructor(baseOptions: BaseOptions) {
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.onInitCompleted = baseOptions.onInitCompleted;
    this.onShippingDataChanged = baseOptions.onShippingDataChanged;
    this.onUpdateCompleted = baseOptions.onUpdateCompleted;
    this.onError = baseOptions.onError;
  }
  private clientDOMElementId: string = "";
  mount(elementId: string) {
    this.clientDOMElementId = elementId;
  }

  async update() {
    // try {
    //   const response = await fetch(this.processorUrl + "/sessions/update", {
    //     method: "POST",
    //     headers: {
    //       "X-Session-Id": this.sessionId,
    //     },
    //   });
    //   console.log(response)
    //   // const data = await response.json();
    // } catch (e) {
    //   console.log(e);
    //   this.onError("Some error occurred. Please try again.");
    // }
    console.log("update called");
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
      const clientElement = document.querySelector(
        `#${this.clientDOMElementId}`
      );
      if (data && clientElement) {
        // TODO: fix the condition checking
        this.onInitCompleted({
          isSuccess: true,
          ingridSessionId: data.ingridSessionId,
          ingridHtml: data.html,
        });
        clientElement.insertAdjacentHTML("afterbegin", data.html);
        // const proceedButton = document.getElementById('proceed-button');
        // if (proceedButton) {
        //   proceedButton.addEventListener('click', function() {
        //     // Your event handler code here
        //     console.log('Proceed button clicked');
        //   });
        // }

        replaceScriptNode(clientElement);

        if (typeof window !== 'undefined' && window._sw) {
          window._sw!((api: unknown) => {
            const typedApi = api as Api;
            typedApi.on("summary_changed", () => {
              this.onShippingDataChanged()
            });
            typedApi.on("data_changed", () => {          
              this.onShippingDataChanged()
            });
          });
        } else {
          console.error('window._sw is not available');
        }
      } else if (!clientElement) {
        this.onError(
          `Error initialising Ingrid integration, element with ID ${this.clientDOMElementId} doesn't exist`
        );
      } else {
        this.onError("Some error occurred. Please try again.");
      }
    } catch (e) {
      console.error(e);
      this.onError("Some error occurred. Please try again.");
    }
  }
}
