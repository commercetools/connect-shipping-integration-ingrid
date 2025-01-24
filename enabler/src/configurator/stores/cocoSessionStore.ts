// import client from "../coco/index";
import cartStore from "./CartStore";
import cardStore from "./CartStore";

function createToken() {
  return fetch(`${import.meta.env.VITE_CTP_AUTH_URL}/oauth/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    headers: {
      authorization: `Basic ${btoa(
        `${import.meta.env.VITE_CTP_CLIENT_ID}:${
          import.meta.env.VITE_CTP_CLIENT_SECRET
        }`
      )}`,
    },
  }).then((res) => res.json());
}

async function createSession(cartId: string) {
  const token = await createToken();
  return fetch(
    `${import.meta.env.VITE_CTP_SESSION_URL}/${
      import.meta.env.VITE_CTP_PROJECT_KEY
    }/sessions`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify({
        cart: {
          cartRef: {
            id: cartId,
          },
        },
        metadata: {
          applicationKey: "applicationKey",
        },
      }),
    }
  ).then((r) => r.json());
}

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
    const cart = cartStore.getSnapshot();
    if (cartId !== cardStore.getSnapshot()?.id) {
      if (!cart) {
        //todo: remove session if exist
      } else {
        if (!state) {
          createSession(cart.id).then((session) => {
            //always get me a 400 Request body does not contain valid JSON
            console.log("session:", session);
            state = session;
            listeners.forEach((l) => l());
          });
        }
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
