import cartStore from "./cartStore";
import cardStore from "./cartStore";
import loadingStore from "./loadingStore";
import Store from "./Store";

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

type Session = {
  id: string;
  activeCart: {
    cartRef: {
      id: string;
    };
  };
};
type Action = { type: "SET_SESSION"; session: Session };
const initialState = localStorage.getItem("cocoSession")
  ? JSON.parse(localStorage.getItem("cocoSession"))
  : undefined;
const cocoSessionStore = new Store<Session, Action>(
  (action, _state, setState) => {
    if (action.type === "SET_SESSION") {
      setState(action.session);
    }
  },
  initialState
);

cardStore.subscribe(() => {
  const cart = cartStore.getSnapshot();
  if (
    cocoSessionStore.getSnapshot()?.activeCart?.cartRef?.id !==
    cardStore.getSnapshot()?.id
  ) {
    if (!cart && cocoSessionStore.getSnapshot()) {
      loadingStore.dispatch("START_LOADING");
      removeSession(cocoSessionStore.getSnapshot().id)
        .catch((e) => console.error(e))
        .finally(() => {
          loadingStore.dispatch("DONE");
          localStorage.removeItem("cocoSession");
          cocoSessionStore.dispatch({
            type: "SET_SESSION",
            session: undefined,
          });
        });
    } else {
      loadingStore.dispatch("START_LOADING");
      createSession(cart.id)
        .then((session) => {
          localStorage.setItem("cocoSession", JSON.stringify(session));
          cocoSessionStore.dispatch({ type: "SET_SESSION", session: session });
        })
        .finally(() => loadingStore.dispatch("DONE"));
    }
  }
});

export default cocoSessionStore;
