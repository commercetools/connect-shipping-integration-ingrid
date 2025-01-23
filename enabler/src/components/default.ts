import {
  ComponentOptions,
  ShippingComponent,
  ShippingComponentBuilder
} from '../shipping-enabler/shipping-enabler';
import { BaseComponent } from "./base";
import styles from '../../../style/style.module.scss';
import buttonStyles from "../../../style/button.module.scss";
import { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";

export class DefaultComponentBuilder implements ShippingComponentBuilder {
  public componentHasSubmit = true;
  constructor(private baseOptions: BaseOptions) {}

  build(config: ComponentOptions): ShippingComponent {
    return new DefaultComponent(this.baseOptions, config);
  }
}

export class DefaultComponent extends BaseComponent {

  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    super(baseOptions, componentOptions);
  }

  mount(selector: string) {
    const html: string = this._getTemplate()
    document
      .querySelector(selector)
      .insertAdjacentHTML("afterbegin", html);

    // TODO : add HTML listener and invoke update() function.
  }

  async update() {
    // TODO: implement update() to send request to processor /sessions/update API
  }

  async init() {
    // here we would call the SDK to submit the payment
    this.sdk.init({ environment: this.environment });
    try {
      const requestData = {} // TODO: implement request body
      const response = await fetch(this.processorUrl + "/sessions/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": this.sessionId,
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
          // TODO: insert data.html content into a specifi HTML tag to render Ingrid web component
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
   return ''
  }
}
