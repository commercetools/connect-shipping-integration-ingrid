import client from "../coco/index";

import { Cart } from "@commercetools/platform-sdk";
import { exhaustiveMatchingGuard } from "../lib";
import countryCurrencyLanguageStore from "./CountryCurrencyLanguageStore";
export type ActionType = "SET_CART";
export type Event =
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

const cartStore = (function CardStore() {
  const cartJSON = localStorage.getItem("cart");

  let state: Cart = cartJSON ? JSON.parse(cartJSON) : undefined;
  const listeners = new Map();
  return {
    subscribe(fn) {
      listeners.set(fn, fn);
      return () => listeners.delete(fn);
    },
    getSnapshot() {
      return state;
    },
    emit(event: Event) {
      if (event.type === "SET_CART") {
        state = event.cart;
        localStorage.setItem("cart", JSON.stringify(event.cart));
        listeners.forEach((l) => l());
      } else if (event.type === "ADD_ITEM") {
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
              state = response.body;
              localStorage.setItem("cart", JSON.stringify(state));
              cartStore.emit(event);
            });
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
                    sku: event.sku,
                  },
                ],
              },
            })
            .execute()
            .then((cart) =>
              cartStore.emit({
                type: "SET_CART",
                cart: cart.body,
              })
            );
        }
      } else if (event.type === "DELETE_CART") {
        client
          .carts()
          .withId({ ID: state.id })
          .delete({
            queryArgs: { version: state.version },
          })
          .execute()
          .then(() => {
            localStorage.removeItem("cart");
            state = undefined;
            listeners.forEach((ls) => ls());
          });
      } else {
        exhaustiveMatchingGuard(event);
      }
    },
  };
})();
export default cartStore;
