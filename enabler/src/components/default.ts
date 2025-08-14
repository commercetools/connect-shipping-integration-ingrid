import type {
  ShippingComponent,
  ShippingComponentBuilder,
  ShippingInitResult,
  ShippingUpdateResult,
} from "../shipping-enabler/shipping-enabler";

import type { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";
import { replaceScriptNode } from "../utils/html-node.util";
import type { DataChangedMeta, SummaryChangedMeta } from "./types/default.type";
import type { Api } from "./types/default.type";
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

  async init(voucherCode?: string) {
    console.log(`voucherCode`);
    console.log(voucherCode);
    try {
      const response = await fetch(this.processorUrl + "/sessions/init", {
        method: "POST",
        headers: {
          "X-Session-Id": this.sessionId,
        },
        body: JSON.stringify({
          voucherCode,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message)
      }

      const clientElement = document.querySelector(
        `#${this.clientDOMElementId}`
      );

      if (data.success && clientElement) {
        
        clientElement.insertAdjacentHTML("afterbegin", data.ingridHtml);
        replaceScriptNode(clientElement);

        // Update the shipping price any time option is changed
        window._sw((api: Api) => {
          api.on("data_changed", (data, meta) => {
            if(!(meta as DataChangedMeta).initial_load) {
              console.log("data_changed: data", data);
              console.log("data_changed: meta", meta);
              this.update();
            }
          });
          api.on("summary_changed", (data, meta) => {
            if((meta as SummaryChangedMeta).delivery_address_changed) {
              console.log("summary_changed: data", data);
              console.log("summary_changed: meta", meta);
              this.update();
            }
          });

        });
        this.onInitCompleted({
          isSuccess: data.success,
          ingridSessionId: data.ingridSessionId,
          ingridHtml: data.ingridHtml,
          cartVersion: data.cartVersion,
        });
      } else {
        this.onError(
          `Error initialising Ingrid integration, element with ID ${this.clientDOMElementId} doesn't exist`
        );
      }
    } catch (error) {
      this.onError(error);
    }
  }

  async update(voucherCode?: string) {
    try {
      const response = await fetch(this.processorUrl + "/sessions/update", {
        method: "POST",
        headers: {
          "X-Session-Id": this.sessionId,
        },
        body : JSON.stringify({ 
          voucherCode,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message)
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
}
