import client from "../coco/index";

import { Cart } from "@commercetools/platform-sdk";
import { exhaustiveMatchingGuard } from "../lib";
import countryCurrencyLanguageStore from "./countryCurrencyLanguageStore";
import loadingStore from "./loadingStore";
import Store from "./Store";
type ACTION =
  | {
      type: "SET_CART";
      cart: Cart;
    }
  | {
      type: "ADD_ITEM";
      sku: string;
    }
  | {
      type: "DELETE_CART";
    };

const cartJSON = localStorage.getItem("cart");
const initialState: Cart = cartJSON ? JSON.parse(cartJSON) : undefined;
const cartStore = new Store<Cart, ACTION>((action, state, setState) => {
  if (action.type === "SET_CART") {
    localStorage.setItem("cart", JSON.stringify(action.cart));
    setState(action.cart);
  } else if (action.type === "ADD_ITEM") {
    loadingStore.dispatch("START_LOADING");
    if (!state) {
      //create the cart first
      client
        .carts()
        .post({
          body: {
            currency: countryCurrencyLanguageStore.getSnapshot().currency,
            country: countryCurrencyLanguageStore.getSnapshot().country,
            locale: countryCurrencyLanguageStore.getSnapshot().language,
          },
        })
        .execute()
        .then((response) => {
          //save the cart and re emit add item
          localStorage.setItem("cart", JSON.stringify(response.body));
          setState(response.body);
          cartStore.dispatch(action);
        })
        .finally(() => loadingStore.dispatch("DONE"));
    } else {
      client
        .carts()
        .withId({ ID: state.id })
        .post({
          body: {
            version: state.version,
            actions: [
              {
                action: "addLineItem",
                sku: action.sku,
              },
            ],
          },
        })
        .execute()
        .then((cart) =>
          cartStore.dispatch({
            type: "SET_CART",
            cart: cart.body,
          })
        )
        .finally(() => loadingStore.dispatch("DONE"));
    }
  } else if (action.type === "DELETE_CART") {
    loadingStore.dispatch("START_LOADING");
    client
      .carts()
      .withId({ ID: state.id })
      .delete({
        queryArgs: { version: state.version },
      })
      .execute()
      .catch((e) => console.error(e))
      .finally(() => {
        loadingStore.dispatch("DONE");
        localStorage.removeItem("cart");
        setState(undefined);
      });
  } else {
    exhaustiveMatchingGuard(action);
  }
}, initialState);
export default cartStore;
