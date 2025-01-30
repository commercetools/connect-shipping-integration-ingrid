import {
  ShippingComponent,
  ShippingComponentBuilder,
  ShippingInitResult
} from '../shipping-enabler/shipping-enabler';

import { BaseOptions } from "../shipping-enabler/shipping-enabler-ingrid";

import { replaceScriptNode } from '../web.util';
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
  
  private htmlSnippet = "<div id=\"shipwallet-container\" style=\"min-height:350px\">  <style>    #ingrid-loader {      min-height: 350px;      padding: 32px 12px 12px 12px;      border: 1px solid #e6e6e6;      border-radius: 6px;      background-color: white;    }    ._ingrid-skeleton {      background-color: #ededed;      position: relative;      overflow: hidden;      -webkit-mask-image: -webkit-radial-gradient(white, black);    }    ._ingrid-skeleton::before {      content: '';      background-image: linear-gradient(90deg, #ededed 0px, #f8f8f8 80px, #ededed 160px);      animation: transform 1.8s ease-out infinite;      transform-origin: 0 0;      width: 100vw;      height: 100%;      left: -160px;      position: absolute;      display: block;    }    ._ingrid-skeleton-text {      height: 10px;    }    ._ingrid-skeleton-shipping-indicator {      height: 45px;      width: 100%;    }    ._ingrid-skeleton-shipping-indicator-label {      margin-bottom: 20px;      width: 100px;    }    ._ingrid-skeleton-delivery-categories-wrapper {      display: flex;      flex-direction: column;      width: 100%;      padding-bottom: 9px;    }    ._ingrid-skeleton-shipping-option-first-row {      display: flex;      align-items: center;      width: 100%;    }    ._ingrid-skeleton-checkbox {      width: 20px;      height: 20px;      border-radius: 10px;      margin-right: 8px;    }    ._ingrid-skeleton-flex-1 {      flex: 1;    }    ._ingrid-skeleton-shipping-option-name {      width: 60%;    }    ._ingrid-skeleton-price {      width: 30px;      margin-right: 12px;    }    ._ingrid-skeleton-shipping-option-second-row {      display: flex;      width: 100%;    }    ._ingrid-skeleton-delivery-description {      width: 35%;    }    ._ingrid-skeleton-delivery-logo {      width: 32px;      height: 32px;      border-radius: 50%;    }    ._ingrid-skeleton-delivery-categories-label {      width: 200px;    }    ._ingrid-skeleton-delivery-category-wrapper {      padding-bottom: 16px;    }    @keyframes transform {      to {        transform: translateX(120%);      }    }    ._ingrid-skeleton-zipcode-label {      width: 70px;      margin-bottom: 12px;    }    ._ingrid-skeleton-zipcode-input {      height: 50px;      width: 100%;      margin-bottom: 28px;    }  </style>  <div id=\"ingrid-loader\">      <div style=\"width: 100%\">        <div>          <div class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-zipcode-label\"></div>          <div class=\"_ingrid-skeleton _ingrid-skeleton-zipcode-input\"></div>          <div            class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-shipping-indicator-label\"          ></div>        <div class=\"_ingrid-skeleton-delivery-categories-wrapper\">          <div class=\"_ingrid-skeleton-delivery-category-wrapper\">            <div class=\"_ingrid-skeleton-shipping-option-first-row\">            <div class=\"_ingrid-skeleton _ingrid-skeleton-checkbox\"></div>            <div class=\"_ingrid-skeleton-flex-1\">              <div                class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-shipping-option-name\"              ></div>            </div>            <div class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-price\"></div>            <div class=\"_ingrid-skeleton _ingrid-skeleton-delivery-logo\"></div>          </div>          <div class=\"_ingrid-skeleton-shipping-option-second-row\">            <div class=\"_ingrid-skeleton-checkbox\"></div>            <div class=\"_ingrid-skeleton-flex-1\">              <div                class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-delivery-description\"              ></div>            </div>          </div>          </div>          <div class=\"_ingrid-skeleton-delivery-category-wrapper\">            <div class=\"_ingrid-skeleton-shipping-option-first-row\">            <div class=\"_ingrid-skeleton _ingrid-skeleton-checkbox\"></div>            <div class=\"_ingrid-skeleton-flex-1\">              <div                class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-shipping-option-name\"              ></div>            </div>            <div class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-price\"></div>            <div class=\"_ingrid-skeleton _ingrid-skeleton-delivery-logo\"></div>          </div>          <div class=\"_ingrid-skeleton-shipping-option-second-row\">            <div class=\"_ingrid-skeleton-checkbox\"></div>            <div class=\"_ingrid-skeleton-flex-1\">              <div                class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-delivery-description\"              ></div>            </div>          </div>          </div>          <div class=\"_ingrid-skeleton-delivery-category-wrapper\">            <div class=\"_ingrid-skeleton-shipping-option-first-row\">            <div class=\"_ingrid-skeleton _ingrid-skeleton-checkbox\"></div>            <div class=\"_ingrid-skeleton-flex-1\">              <div                class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-shipping-option-name\"              ></div>            </div>            <div class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-price\"></div>            <div class=\"_ingrid-skeleton _ingrid-skeleton-delivery-logo\"></div>          </div>          <div class=\"_ingrid-skeleton-shipping-option-second-row\">            <div class=\"_ingrid-skeleton-checkbox\"></div>            <div class=\"_ingrid-skeleton-flex-1\">              <div                class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-delivery-description\"              ></div>            </div>          </div>          </div>          <div class=\"_ingrid-skeleton-shipping-option-first-row\">            <div class=\"_ingrid-skeleton _ingrid-skeleton-checkbox\"></div>            <div class=\"_ingrid-skeleton-flex-1\">              <div                class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-shipping-option-name\"              ></div>            </div>            <div class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-price\"></div>            <div class=\"_ingrid-skeleton _ingrid-skeleton-delivery-logo\"></div>          </div>          <div class=\"_ingrid-skeleton-shipping-option-second-row\">            <div class=\"_ingrid-skeleton-checkbox\"></div>            <div class=\"_ingrid-skeleton-flex-1\">              <div                class=\"_ingrid-skeleton _ingrid-skeleton-text _ingrid-skeleton-delivery-description\"              ></div>            </div>          </div>        </div>      </div>    </div>  </div>  <script>    (function(window, instanceId, containerId, document) {      window[instanceId] = window[instanceId] || function() { (window[instanceId].q = window[instanceId].q || []).push(arguments)  };      var bootstrapURL = \"https://cdn-stage.ingrid.com/checkout-widget/9a96e8e/bootstrap.js\";      var bootstrapFallbackURL = \"\";      if (/MSIE|Trident/.test(window.navigator.userAgent)) {        bootstrapURL = bootstrapFallbackURL;      }      window[instanceId].config = {        container: document.getElementById(containerId),        bootstrapURL: bootstrapURL,        bootstrapFallbackURL: bootstrapFallbackURL,        features: {\"hide_toc\":false,\"show_shipping_price_on_service_points_view\":true,\"show_carrier_icons\":false,\"new_search_address\":true,\"door_code\":false,\"show_map\":true,\"hide_street_on_address_fields\":false,\"disable_address_form\":false,\"show_city_on_address_fields\":false,\"display_upfront_address\":false,\"autocomplete_street\":false,\"display_location_type\":false,\"dont_require_street_on_address_fields\":false,\"show_state_on_address_fields\":false,\"show_delivered_by\":false,\"show_street_on_address_module\":false,\"show_city_on_address_module\":false,\"require_street_on_address_module\":false,\"enable_ingrid_logo\":true,\"enable_widget_border\":true,\"enable_transparent_background\":false,\"show_shipping_categories_before_address\":true,\"enable_accent_color_for_widget_elements\":false,\"dark_color_enabled\":true,\"show_slogan\":false,\"show_carrier_logos_in_shipping_categories_placeholder\":false,\"enable_free_shipping_indicator\":true,\"enable_free_shipping_indicator_category_name_message\":false,\"enable_free_shipping_indicator_carrier_logo\":false,\"enable_delivery_address_form\":false,\"show_privacy_policy\":false,\"show_region\":false,\"require_region\":false,\"shipping_categories_visible_when_folded_count\":0,\"enable_multiple_home_delivery_in_category\":false,\"display_currency_iso_code\":false,\"enable_postal_code_in_location_address\":false,\"enable_analytics\":false,\"show_currency_before_price\":false,\"show_cancel_button_on_modal\":false,\"enable_full_sentry_tracing\":false,\"enable_state_get_retry\":true,\"external_address_book_provider\":\"\"},        instanceId: instanceId,        locale: \"en-GB\",        logging: \"https://c7a68a2a3cfe4024bf719e6485aa8751@sentry.io/141995\",        status: \"\\",        style:  null ,        session: \"VM2-4c3d7eb46bb2437ea4e3a9b717b38e82\",        token: \"Y2xpZW50dHdvOjI1MDhlYzhiZDgxNjQzNmZhYmEzZTQwNTM1N2IxOTc3\",        version: \"81415263\",        loaderId: \"ingrid-loader\",        customStylesheetPath: \"\"      };      var container = document.getElementById(containerId);      var bootstrapScript = document.createElement(\"script\");      bootstrapScript.async = true;      bootstrapScript.src = bootstrapURL;      bootstrapScript.className = \"ingrid-bootstrap-script\";      bootstrapScript.addEventListener(\"load\", function (e) {        if (typeof _ingrid_initializeWidgetInstance === \"function\") {           _ingrid_initializeWidgetInstance(instanceId);         }      });      container.appendChild(bootstrapScript);    })(window, '_sw', 'shipwallet-container', document);  </script>  <noscript>    Please <a href=\"https://enable-javascript.com\">enable JavaScript</a>.  </noscript></div>"
  constructor(baseOptions: BaseOptions) {
    this.processorUrl = baseOptions.processorUrl;
    this.sessionId = baseOptions.sessionId;
    this.onInitCompleted = baseOptions.onInitCompleted;
    this.onUpdateCompleted = baseOptions.onUpdateCompleted;
    this.onError = baseOptions.onError;
  }
  private clientDOMElementId: string = ''
  
  mount(elementId: string) {
    this.clientDOMElementId = elementId
  }

  async update() {
    // TODO: implement update() to send request to processor /sessions/update API
  }

  async init(cocoSessionId: string) {
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
          const clientElement = document.querySelector(`#${this.clientDOMElementId}`) 
          // clientElement.insertAdjacentHTML("afterbegin", data.html);
          clientElement.insertAdjacentHTML("afterbegin", this.htmlSnippet);
          replaceScriptNode(clientElement);
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
