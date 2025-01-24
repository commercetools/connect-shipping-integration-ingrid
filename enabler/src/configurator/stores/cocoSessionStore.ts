// import client from "../coco/index";
import cardStore from "./CartStore";

// import { exhaustiveMatchingGuard } from "../lib";
export type Event = {
  type: "SET_SESSION";
  session: Object;
};
const cocoSessionStore = (function cocoSessionStore() {
  let cartId = undefined;
  const sessionJSON = localStorage.getItem("session");

  let state: object = sessionJSON ? JSON.parse(sessionJSON) : undefined;
  const listeners = new Map();
  cardStore.subscribe(() => {
    if (cartId !== cardStore.getSnapshot()?.id) {
      if (!cardStore.getSnapshot()) {
        //todo: remove session
      } else {
        //todo: update or create session
      }
    }
  });
  return {
    subscribe(fn) {
      listeners.set(fn, fn);
      return () => listeners.delete(fn);
    },
    getSnapshot() {
      return state;
    },
    emit(event: Event) {
      if (event.type === "SET_SESSION") {
        state = event.session;
        localStorage.setItem("session", JSON.stringify(state));
        listeners.forEach((l) => l());
      }
      //   } else {
      //     exhaustiveMatchingGuard(event);
      //   }
    },
  };
})();
export default cocoSessionStore;
