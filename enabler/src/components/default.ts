import {
  ComponentOptions,
  ShippingComponent,
  ShippingComponentBuilder,
  ShippingInitResult
} from '../shipping-enabler/shipping-enabler';
import { Sdk } from '../sdk';
// import styles from '../../../style/style.module.scss';
// import buttonStyles from "../../../style/button.module.scss";
import { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";

export class DefaultComponentBuilder implements ShippingComponentBuilder {
  public componentHasSubmit = true;
  constructor(private baseOptions: BaseOptions) {}

  build(config: ComponentOptions): ShippingComponent {
    return new DefaultComponent(this.baseOptions, config);
  }
}

export class DefaultComponent {

  protected sdk: Sdk;
  protected processorUrl: BaseOptions['processorUrl'];
  protected sessionId: BaseOptions['sessionId'];
  protected environment: BaseOptions['environment'];
  protected onInitCompleted: (result: ShippingInitResult) => void;
  protected onUpdateCompleted: () => void;
  protected onSubmissionCompleted: () => void;
  protected onError: (error?: any) => void;
  
    
  private ingridComponentId: string = 'ingrid-component'
 
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

  mount(selector: string) {
    document
      .querySelector(selector)
      .insertAdjacentHTML("afterbegin", this._getTemplate());

    
  }

  

  async update() {
    // TODO: implement update() to send request to processor /sessions/update API
  }

  async init(sessionId: string) {
    // here we would call the SDK to submit the payment
    this.sdk.init({ environment: this.environment });
    try {
      const requestData = {
        "purchase_country": "SE",
        "purchase_currency": "SEK",
        "cart": {
          "total_value": 10000,
          "items": [
            {
                "sku": "SKU12345",
                "name": "Saucony Shadow 6000",
                "quantity": 1
            }
          ],
          "cart_id": "UNIQUE_ID"
        },
        "locales": [
          "sv-SE"
        ]
      } 
     
      // TODO: implement actuall API call to processor
      
      const response = await fetch(this.processorUrl + "/sessions/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
        },
        body: JSON.stringify(requestData),
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
      this.onError("Some error occurred. Please try again.");
    }
  }

  async submit() {
    this.sdk.init({ environment: this.environment });
    try {
      const requestData = {} // TODO: implement request body
      const response = await fetch(this.processorUrl + "/sessions/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": this.sessionId,
        },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
      if (data) {
   
          this.onSubmissionCompleted();
      } else {
        this.onError("Some error occurred. Please try again.");
      }
    } catch (e) {
      this.onError("Some error occurred. Please try again.");
    }
  }

  private _getTemplate() {
   return `<div id=${this.ingridComponentId}></div>`
  }

  private postInit(ingridSessionId: string, ingridHtml: string) {
    document.querySelector(this.ingridComponentId).innerHTML = ingridHtml;
    console.log(ingridSessionId)
    // TODO : store session ID into local storage
  }
}
