import {
  ShippingComponent,
  ShippingComponentBuilder,
  ShippingInitResult
} from '../shipping-enabler/shipping-enabler';

import { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";

export class DefaultComponentBuilder implements ShippingComponentBuilder {
  public componentHasSubmit = true;
  constructor(private baseOptions: BaseOptions) {}

  build(): ShippingComponent {
    return new DefaultComponent(this.baseOptions);
  }
}

export class DefaultComponent {
  protected processorUrl: BaseOptions['processorUrl'];
  protected sessionId: BaseOptions['sessionId'];
  protected environment: BaseOptions['environment'];
  protected onInitCompleted: (result: ShippingInitResult) => void;
  protected onUpdateCompleted: () => void;
  protected onError: (error?: unknown) => void;
    
  private ingridComponentId: string = 'ingrid-component'
 
  constructor(baseOptions: BaseOptions) {
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.environment = baseOptions.environment;
    this.onInitCompleted = baseOptions.onInitCompleted;
    this.onUpdateCompleted = baseOptions.onUpdateCompleted;
    this.onError = baseOptions.onError;
  }

  mount(selector: string) {
    document
      .querySelector(`#${selector}`)
      .insertAdjacentHTML("afterbegin", this._getTemplate());
  }

  async update() {
    // TODO: implement update() to send request to processor /sessions/update API
  }

  async init(sessionId: string) {
    // here we would call the SDK to submit the payment
    // this.sdk.init({ environment: this.environment });
    try {
     
      // TODO: implement actuall API call to processor
      
      const response = await fetch(this.processorUrl + "/sessions/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
        },

      });
      const data = await response.json();
      if (data) { // TODO: fix the condition checking 
          this.onInitCompleted({
            isSuccess: true,
            ingridSessionId: data.ingridSessionId,
            ingridHtml: data.html
          });
          console.log(data)
          this.postInit(data.ingridSessionId, data.html)
      } else {
        this.onError("Some error occurred. Please try again.");
      }
    } catch (e) {
      console.log(e)
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

  private _getTemplate() {
   return `<div id=${this.ingridComponentId}>HelloWorld</div>`
  }

  private postInit(ingridSessionId: string, ingridHtml: string) {
    document.querySelector(`#${this.ingridComponentId}`).insertAdjacentHTML("afterbegin", ingridHtml);
    console.log(ingridSessionId)
    // TODO : store session ID into local storage
  }
}
