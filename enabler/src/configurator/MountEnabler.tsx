import { memo, useEffect, useState, useSyncExternalStore } from "react";
import cocoSessionStore from "./stores/cocoSessionStore";
import type {
  ShippingComponent,
  ShippingInitResult,
  ShippingUpdateResult,
} from "../shipping-enabler/shipping-enabler";
// import type { Cart } from '@commercetools/platform-sdk';
// import client from './coco';
const ingridElementId = "enablerContainer";
import { paymentFlow, close } from '@commercetools/checkout-browser-sdk';
import cartStore from "./stores/cartStore";
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

  const proceedPayment = async () => {  
    paymentFlow({
      projectKey: import.meta.env.VITE_CTP_PROJECT_KEY,
      region: import.meta.env.VITE_CTP_REGION ?? "europe-west1.gcp",
      sessionId: session?.id || "",
      locale: "en",
      logInfo: true,
      logWarn: true,
      logError: true,
      onInfo: (message) => {
        if (message.code==="checkout_completed") {
          setShowEnabler(false)
          setShowPaymentButton(false) 
          const {
            order: { id: orderId },
          } = message.payload as {
            order: { id: string };
          };
          cartStore.dispatch({ type: "FETCH_CART" })
          console.log('Order created : ', orderId);
          appendMessage(`Order created : ${orderId}`)
        }
      },
      onError: (error) => {
        console.log("error", error);
        cartStore.dispatch({ type: "FETCH_CART" })
        close();
        appendMessage(`Failed to create order: ${(error as unknown as { message:string}).message}`)
      }
    });
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
            cartStore.dispatch({ type: "FETCH_CART" })
          },
          onUpdateCompleted: async (result: ShippingUpdateResult) => {
            console.log("onUpdateCompleted", { result });
            showMessage(`shipping options updated : ${result.isSuccess?"success":"failed"}`)
            cartStore.dispatch({ type: "FETCH_CART" })
            if (result.isSuccess)  {
              proceedPayment()
            }
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
         Update Shipping Options
        </button>
        
        </div>
      )}
      <p className="standard-font" id="result-message"></p>
    </div>
  ) : null;
});

export default MountEnabler;
