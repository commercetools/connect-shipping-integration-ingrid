import {
  ShippingComponent,
  ShippingComponentBuilder,
  ShippingInitResult
} from '../shipping-enabler/shipping-enabler';

import { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";

export class DefaultComponentBuilder implements ShippingComponentBuilder {
  constructor(private baseOptions: BaseOptions) {}

  build(): ShippingComponent {
    return new DefaultComponent(this.baseOptions);
  }
}

export class DefaultComponent implements ShippingComponent{
  protected processorUrl: BaseOptions['processorUrl'];
  protected sessionId: BaseOptions['sessionId'];
  protected onInitCompleted: (result: ShippingInitResult) => void;
  protected onUpdateCompleted: () => void;
  protected onError: (error?: unknown) => void;
    
  constructor(baseOptions: BaseOptions) {
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.onInitCompleted = baseOptions.onInitCompleted;
    this.onUpdateCompleted = baseOptions.onUpdateCompleted;
    this.onError = baseOptions.onError;
  }

  mount(selector: string) {
    document
      .querySelector(`#${selector}`)
      .insertAdjacentHTML("afterbegin", '<div id="ingrid-component"/>');
  }

  async update() {
    // TODO: implement update() to send request to processor /sessions/update API
  }

  async init(cocoSessionId: string): Promise<string>{
    // here we would call the SDK to submit the payment
    // this.sdk.init({ environment: this.environment });
    try {
     
      // TODO: implement actuall API call to processor
      
      // const response = await fetch(this.processorUrl + "/sessions/init", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "X-Session-Id": sessionId,
      //   },

      // });
      // const data = await response.json();
      console.log(cocoSessionId)
      const data = {
        ingridSessionId: '1234-2345-3456-4567',
        html: '<div>HelloWorld</div>'
      }
      if (data) { // TODO: fix the condition checking 
          this.onInitCompleted({
            isSuccess: true,
            ingridSessionId: data.ingridSessionId,
            ingridHtml: data.html
          });
          document.querySelector('#ingrid-component').insertAdjacentHTML("afterbegin", data.html);
          return data.ingridSessionId
   
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

}
