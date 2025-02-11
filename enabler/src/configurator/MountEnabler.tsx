import { memo, useEffect, useState, useSyncExternalStore, useRef } from "react";
import cocoSessionStore from "./stores/cocoSessionStore";
import { IngridShippingEnabler } from "../shipping-enabler/shipping-enabler-ingrid";
import { ShippingComponent } from "../shipping-enabler/shipping-enabler";
import { ShippingInitResult } from "../shipping-enabler/shipping-enabler";
import { stateEmitter } from '../components/state-emitter';

const ingridElementId = "enablerContainer";
const MountEnabler = memo(function MountEnabler() {
  const [showEnabler, setShowEnabler] = useState(false);
  const [isShippingDataChanged, setIsShippingDataChanged] = useState(false);
  const [isProceedShipment, setIsProceedShipment] = useState(false);
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot
  );
  let ingridComponent = useRef<ShippingComponent | null>(null);
  useEffect(() => {
    const handleIngridDataChanged = (value: boolean) => {
      setIsShippingDataChanged(value);
    };

    stateEmitter.on('shippingDataChanged', handleIngridDataChanged);

    // Cleanup function to remove the event listener
    return () => {
      stateEmitter.off('shippingDataChanged', handleIngridDataChanged);
    };
  }, []);

  useEffect(() => {
    if (isShippingDataChanged) {
      console.log('Ingrid data has changed.');
      // Perform actions based on the change
    }
  }, [isShippingDataChanged]);

  useEffect(() => {
    console.log("isProceedShipment", isProceedShipment);
    console.log("ingridComponent", ingridComponent);

    if (isProceedShipment && ingridComponent.current) {
      ingridComponent.current.update();
    }
  }, [isProceedShipment]);

  useEffect(() => {
    if (showEnabler) {
       const initEnabler = async () => {
        if (!session) {
          console.error("session is undefined.")
          return
        }
        const enabler = new IngridShippingEnabler({
          processorUrl: import.meta.env.VITE_PROCESSOR_URL,
          sessionId: session.id,

          onInitCompleted: (result: ShippingInitResult) => {
            console.log("onInitCompleted", { result });
            if (result.isSuccess) {
              localStorage.setItem("ingrid-session-id", result.ingridSessionId);
            }
          },
          onUpdateCompleted: () => {
            console.log("onUpdateCompleted", "OK");
          },
          onError: (err) => {
            console.error("onError", err);
          },
        });
        ingridComponent.current = (await enabler.createComponentBuilder()).build();
        console.log("ingridComponent", ingridComponent);
        ingridComponent.current.mount(ingridElementId);
        ingridComponent.current.init();
      };
      initEnabler();
    }
  }, [session, showEnabler]);

  return session ? (
    <div>
      <button onClick={() => setShowEnabler((e) => !e)}>
        Toggle shipping content
      </button>

      {showEnabler ? <div id={ingridElementId} /> : null}
      <button onClick={() => setIsProceedShipment((e) => !e)} style={{ display: isShippingDataChanged ? "inline" : "none" }}>proceed shipment</button>
    </div>
  ) : null;
});

export default MountEnabler;
