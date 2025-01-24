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
        "Content-Type": "application/json",
        authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify({
        cart: {
          cartRef: {
            id: cartId,
          },
        },
      }),
    }
  ).then((r) => r.json());
}

async function removeSession(sessionId: string) {
  const token = await createToken();
  return fetch(
    `${import.meta.env.VITE_CTP_SESSION_URL}/${
      import.meta.env.VITE_CTP_PROJECT_KEY
    }/sessions/${sessionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify({ actions: [{ action: "revoke" }] }),
    }
  ).then((r) => r.json());
}

const cocoSessionStore = (function cocoSessionStore() {
  const sessionJSON = localStorage.getItem("cocoSession");
  let state: object = sessionJSON ? JSON.parse(sessionJSON) : undefined;
  //@ts-ignore
  let cartId = state?.activeCart?.cartRef?.id;
  const listeners = new Map();
  cardStore.subscribe(() => {
    const cart = cartStore.getSnapshot();
    if (cartId !== cardStore.getSnapshot()?.id) {
      cartId = cardStore.getSnapshot()?.id;
      if (!cart && state) {
        //@ts-ignore
        removeSession(state.id).then(() => {
          state = undefined;
          localStorage.removeItem("cocoSession");
          listeners.forEach((l) => l());
        });
      } else {
        createSession(cart.id).then((session) => {
          state = session;
          localStorage.setItem("cocoSession", JSON.stringify(state));
          listeners.forEach((l) => l());
        });
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
    emit() {
      throw new Error("Do not need implementation at this time.");
    },
  };
})();
export default cocoSessionStore;
