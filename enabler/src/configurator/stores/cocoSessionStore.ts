import cartStore from "./cartStore";
import loadingStore from "./loadingStore";
import Store from "./Store";

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${month}${day}-${randomPart}`; // e.g. "231001-1234"
}

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
        metadata: {
          applicationKey: import.meta.env.VITE_CTP_APPLICATION_KEY ?? "",
          futureOrderNumber: generateOrderNumber(),
        }
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

type Session =
  | {
      id: string;
      activeCart: {
        cartRef: {
          id: string;
        };
      };
    }
  | undefined;

type Action = { type: "SET_SESSION"; session?: Session };

const cocoSession: string = localStorage.getItem("cocoSession") || "";
const initialState = cocoSession ? JSON.parse(cocoSession) : undefined;

const cocoSessionStore = new Store<Session, Action>(
  (action, _state, setState) => {
    if (action.type === "SET_SESSION") {
      setState(action.session);
    }
  },
  initialState
);

cartStore.subscribe(() => {
  const cart = cartStore.getSnapshot();
  if (
    cocoSessionStore.getSnapshot()?.activeCart?.cartRef?.id !==
    cartStore.getSnapshot()?.id
  ) {
    if (!cart && cocoSessionStore.getSnapshot()) {
      loadingStore.dispatch("START_LOADING");
      removeSession(cocoSessionStore.getSnapshot()!.id)
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
      createSession(cart!.id)
        .then((session) => {
          localStorage.setItem("cocoSession", JSON.stringify(session));
          cocoSessionStore.dispatch({ type: "SET_SESSION", session: session });
        })
        .finally(() => loadingStore.dispatch("DONE"));
    }
  }
  

});
  
export default cocoSessionStore;
