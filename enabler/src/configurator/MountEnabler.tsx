import { memo, useEffect, useState, useSyncExternalStore } from "react";
import cocoSessionStore from "./stores/cocoSessionStore";
import type {
  ShippingComponent,
  ShippingInitResult,
  ShippingUpdateResult,
} from "../shipping-enabler/shipping-enabler";
import type { Cart } from '@commercetools/platform-sdk';
import client from './coco';
const ingridElementId = "enablerContainer";
const MountEnabler = memo(function MountEnabler() {
  const [showEnabler, setShowEnabler] = useState(false);
  const [showPaymentButton, setShowPaymentButton] = useState(false);
  const [updateEndpoint, setUpdateEndpoint] = useState(false);
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot
  );

  const [component, setComponent] = useState<ShippingComponent | null>(null);
  const showMessage = (message: string) => {
    const resultMessageEle = document.getElementById("result-message")
    if (resultMessageEle)
      resultMessageEle.innerHTML = message + '<br>'
  }
  const appendMessage = (message: string) => {
    const resultMessageEle = document.getElementById("result-message")
    if (resultMessageEle)
      resultMessageEle.innerHTML += message + '<br>'
  }

  const createOrder = async() => {
    const cartString = localStorage.getItem('cart');
    const cart = cartString ? JSON.parse(cartString) as Cart : undefined;
    if (cart) {

      const cartId = cart.id;
      let cartVersion = cart.version;
      
      setTimeout(() => {
      
        client
          .carts().withId({ ID: cartId })
          .get()
          .execute()
          .then((updatedCartResponse) => {
            cartVersion = updatedCartResponse?.body.version as number;
            return cartVersion;
          })
          .then((cartVersion) => {
            const order = client
              .orders()
              .post({
                body: {
                  'cart': {
                    'id': cartId,
                    'typeId': 'cart',
                  },
                  'version': cartVersion,
                },
              })
              .execute();
              return order
          })
          .then((result) => {
            console.log('Order created', result);
            appendMessage(`Order created : ${result.body.id}`)
          })
          .catch((e) => {
            console.error('something went wrong:', e)
            appendMessage(`Something went wrong: ${e.message}`)
          });
      }, 500);
    }
  }
  const initEnabler = async () => {
 
    const enabler = await import(import.meta.env.VITE_ENABLER_URL)
      .then(({Enabler}) => {
        const enabler = new Enabler({
          processorUrl: import.meta.env.VITE_PROCESSOR_URL,
          sessionId: session?.id,
    
          onInitCompleted: (result: ShippingInitResult) => {
            console.log("onInitCompleted", { result });
            if (result.isSuccess) {
              localStorage.setItem("ingrid-session-id", result.ingridSessionId);
            }
            setShowPaymentButton(true)
          },
          onUpdateCompleted: async (result: ShippingUpdateResult) => {
            console.log("onUpdateCompleted", { result });
            showMessage(`shipping options updated : ${result.isSuccess?"success":"failed"}`)
            if (result.isSuccess) 

            await createOrder().then(() => {
              setShowEnabler(false)
              setShowPaymentButton(false) 
            });
          },
          onError: (err: Error) => {           
            console.error("onError", err.message);
            showMessage(`Something went wrong: ${err.message} `)
          },
        });
        return enabler
      })
      .catch((err) => {
        console.error("Failed to load IngridShippingEnabler", err);
        return null;
      });
      enabler.createComponentBuilder();
      const builder = await enabler.createComponentBuilder();
      const component = builder.build();
      return component;
  };

  useEffect(() => {
    if (component) {
      component.update();
    }
  }, [updateEndpoint]);

  useEffect(() => {
    if (showEnabler && session) {
      const mountComponent = async () => {
        const componentResult = await initEnabler();
        if (componentResult) {
          setComponent(componentResult);
          componentResult.mount(ingridElementId);
          componentResult.init(session.id);
        }
      };
      mountComponent();
    }
  }, [showEnabler]);

  return session ? (
    <div>
      <br/>
      <button onClick={() => setShowEnabler((e) => !e)}>
        Shipping Methods
      </button>
      {showEnabler ? <div id={ingridElementId} /> : null}
      {component && (
        <div><br/>
        <button style={{ display: showPaymentButton?"block":"none" }}
          onClick={() => setUpdateEndpoint((e) => !e)}>
         Proceed Payment
        </button>
        
        </div>
      )}
      <p className="standard-font" id="result-message"></p>
    </div>
  ) : null;
});

export default MountEnabler;
