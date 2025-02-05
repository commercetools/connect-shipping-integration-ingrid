import { memo, useEffect, useState, useSyncExternalStore } from "react";
import cocoSessionStore from "./stores/cocoSessionStore";
import { IngridShippingEnabler } from "../shipping-enabler/shipping-enabler-ingrid";
import { ShippingInitResult } from "../shipping-enabler/shipping-enabler";

const ingridElementId = "enablerContainer";
const MountEnabler = memo(function MountEnabler() {
  const [showEnabler, setShowEnabler] = useState(false);
  const [updateEndpoint, setUpdateEndpoint] = useState(false);
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot
  );

  useEffect(() => {
    if (showEnabler) {
      const initEnabler = async () => {
        const enabler = new IngridShippingEnabler({
          processorUrl: import.meta.env.VITE_PROCESSOR_URL,
          sessionId: session?.id,

          onInitCompleted: (result: ShippingInitResult) => {
            console.log("onInitCompleted", { result });
            if (result.isSuccess) {
              localStorage.setItem("ingrid-session-id", result.ingridSessionId);
            }
          },
          onUpdateCompleted: (result: ShippingInitResult) => {
            console.log("onUpdateCompleted", { result });
          },
          onError: (err) => {
            console.error("onError", err);
          },
        });
        enabler.createComponentBuilder();
        const builder = await enabler.createComponentBuilder();
        const component = builder.build();
        component.mount(ingridElementId);
        if (session) {
          if (updateEndpoint) {
            component.update();
          } else {
            component.init(session.id);
          }
        } else {
          // TODO throw error? Should we still mount if there's no session?
        }
      };
      initEnabler();
    }
  }, [session, showEnabler, updateEndpoint]);

  return session ? (
    <div>
      <button onClick={() => setShowEnabler((e) => !e)}>
        Toggle shipping content
      </button>

      <button onClick={() => setUpdateEndpoint((e) => !e)}>
        Toggle update endpoint
      </button>
      {showEnabler ? <div id={ingridElementId} /> : null}
    </div>
  ) : null;
});

export default MountEnabler;
