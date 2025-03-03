import { memo, useEffect, useState, useSyncExternalStore } from "react";
import cocoSessionStore from "./stores/cocoSessionStore";
import type {
  ShippingComponent,
  ShippingInitResult,
  ShippingUpdateResult,
} from "../shipping-enabler/shipping-enabler";


const ingridElementId = "enablerContainer";
const MountEnabler = memo(function MountEnabler() {
  const [showEnabler, setShowEnabler] = useState(false);
  const [updateEndpoint, setUpdateEndpoint] = useState(false);
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot
  );

  const [component, setComponent] = useState<ShippingComponent | null>(null);

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
          },
          onUpdateCompleted: (result: ShippingUpdateResult) => {
            console.log("onUpdateCompleted", { result });
            const updateShippingOptionsResultMessageEle = document.getElementById("update-shipping-options-result-message")
            if (updateShippingOptionsResultMessageEle)
              updateShippingOptionsResultMessageEle.innerHTML = `shipping options updated : ${result.isSuccess?"success":"failed"}`
          },
          onError: (err: unknown) => {
            console.error("onError", err);
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
        <button
          disabled={!showEnabler}
          onClick={() => setUpdateEndpoint((e) => !e)}
        >
          Confirm Shipping Option
        </button>
        <p className="standard-font" id="update-shipping-options-result-message"></p>
        </div>
      )}
    </div>
  ) : null;
});

export default MountEnabler;
