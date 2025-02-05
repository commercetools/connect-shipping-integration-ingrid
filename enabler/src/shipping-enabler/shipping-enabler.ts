/**
 * Represents the shipping enabler. The shipping enabler is the entry point for creating the components.
 *
 * Usage:
 *    const enabler = new Enabler({
 *      processorUrl: __VITE_PROCESSOR_URL__,
 *      sessionId: sessionId,
 *      config: {
 *
 *      },
 *      onComplete: ({ isSuccess, shippingReference }) => {
 *        console.log('onComplete', { isSuccess, shippingReference });
 *      },
 *    });
 *
 *    enabler.createComponentBuilder('card')
 *      .then(builder => {
 *          const shippiongElement = builder.build({
 *            showInitButton: false,
 *            showSubmitButton: false
 *          });
 *          paymentElement.mount('#card-component')
 *      })
 *
 *
 */
export interface ShippingEnabler {
  /**
   * Creates a shipping component builder of the specified type.
   * @returns A promise that resolves to the shipping component builder.
   * @throws {Error} If the shipping component builder cannot be created.
   */
  createComponentBuilder: () => Promise<ShippingComponentBuilder | never>;
}
/**
 * Represents the interface for a payment component.
 */
export interface ShippingComponent {
  /**
   * Mounts the shipping component to the specified selector.
   * @param selector - The selector where the component will be mounted.
   */
  mount(selector: string): void;

  /**
   * init the shipping.
   */
  init(sessionId: string): void;

  /**
   * update the shipping.
   */
  update(): void;
}

/**
 * Represents the interface for a payment component builder.
 */
export interface ShippingComponentBuilder {
  /**
   * Builds a shipping component with the specified configuration.
   * @returns The built shipping component.
   */
  build(): ShippingComponent;
}

/**
 * Represents the options for the payment enabler.
 */
export type EnablerOptions = {
  /**
   * The URL of the shipping processor.
   */
  processorUrl: string;

  /**
   * The session ID for the shipping.
   */
  sessionId?: string;

  /**
   * The locale for the shipping.
   */
  locale?: string;

  /**
   * A callback function that is called when the shipping init is completed.
   * @param result - The result of the shipping init.
   */
  onInitCompleted?: (result: ShippingInitResult) => void;

  /**
   * A callback function that is called when the shipping update is completed.
   */
  onUpdateCompleted?: (result: ShippingInitResult) => void;

  /**
   * A callback function that is called when an error occurs during the shipping process.
   * @param error - The error that occurred.
   */
  onError?: (error: unknown) => void;
};

/**
 * Represents the result of a shipping.
 */
export type ShippingInitResult =
  | {
      /**
       * Indicates whether the shipping was successful.
       */
      isSuccess: true;

      /**
       * The session ID generated by Ingrid
       */
      ingridSessionId: string;

      /**
       * The HTML snippet generated by Ingrid
       */
      ingridHtml: string;
    }
  | {
      /**
       * Indicates whether the shipping was unsuccessful.
       */
      isSuccess: false;
    };
