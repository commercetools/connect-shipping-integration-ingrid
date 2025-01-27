import { memo, useEffect, useState, useSyncExternalStore } from "react";
import cocoSessionStore from "./stores/cocoSessionStore";
import { IngridShippingEnabler } from "../shipping-enabler/shipping-enabler-ingrid";
import { ShippingInitResult } from "../shipping-enabler/shipping-enabler";

const ingridElementId = "enablerContainer"

const MountEnabler = memo(function MountEnabler() {
  const [showEnabler, setShowEnabler] = useState(false);
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot
  );
  useEffect(() => {
    //@todo: mount if session is not undefined
    
    //if session is false do we unmount????
  }, [session]);

  useEffect(() => {
    //@todo: mount if session is not undefined
    initEnabler();
    //if session is false do we unmount????
  }, [session, showEnabler]);

  async function initEnabler() {
    const enabler = new IngridShippingEnabler({
      processorUrl: import.meta.env.VITE_PROCESSOR_URL,
      sessionId: session.id,

      onInitCompleted: (result: ShippingInitResult) => {
        console.log("onInitCompleted", { result });
      },
      onUpdateCompleted: () => {
        console.log("onUpdateCompleted", "OK");
      },
      onError: (err) => {
        console.error("onError", err);
      },
    });
    enabler.createComponentBuilder()
    const builder = await enabler.createComponentBuilder();
    const component = builder.build();
    component.mount(ingridElementId)
    // component.init(session.id)
  }

  return session ? (
    <div>

      <button onClick={ () => setShowEnabler((e) => !e) }>
        Toggle shipping content
      </button>

      {showEnabler ? (
        <div id={ingridElementId} />
      ) : null}
    </div>
  ) : null;
});

export default MountEnabler;
