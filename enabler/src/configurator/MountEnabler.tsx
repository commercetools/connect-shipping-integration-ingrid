import { memo, useEffect, useState, useSyncExternalStore } from "react";
import cocoSessionStore from "./stores/cocoSessionStore";

const MountEnabler = memo(function MountEnabler() {
  const [showEnabler, setShowEnabler] = useState(true);
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot
  );
  useEffect(() => {
    //@todo: mount if session is not undefined
    console.log("session", session);
    //if session is false do we unmount????
  }, [session]);
  return session ? (
    <div>
      <button>Mount enabler</button>
      <button onClick={() => setShowEnabler((e) => !e)}>
        Toggle shipping content
      </button>

      {showEnabler ? (
        <div id="enablerContainer">
          Enabler will render here so Ingrid content will be shown here
        </div>
      ) : null}
    </div>
  ) : null;
});

export default MountEnabler;
