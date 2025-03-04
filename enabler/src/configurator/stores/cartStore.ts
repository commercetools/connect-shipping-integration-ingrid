import client from "../coco/index";

import type { Cart, Address } from "@commercetools/platform-sdk";
import { exhaustiveMatchingGuard } from "../lib";
import countryCurrencyLanguageStore from "./countryCurrencyLanguageStore";
import loadingStore from "./loadingStore";
import Store from "./Store";

type ACTION =
  {
    type: "SET_SHIPPING_ADDRESS",
    address: Address;
  }
  | {
    type: "APPLY_DISCOUNT";
    percetage: number;
  }
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
    }
  | {
      type: "FETCH_CART";
    };

const cartJSON = localStorage.getItem("cart");

const initialState: Cart = cartJSON ? JSON.parse(cartJSON) : undefined;

const cartStore = new Store<Cart | undefined, ACTION>(
  (action, state, setState) => {
    switch (action.type) {
      case "FETCH_CART": 
        if (!state) return;
      
        loadingStore.dispatch("START_LOADING");
        client
          .carts()
          .withId({ ID: state.id })
          .get()
          .execute()
          .then((cart) =>
            cartStore.dispatch({
              type: "SET_CART",
              cart: cart.body,
            })
          )
          .catch((e) => console.error(e))
          .finally(() => {
            loadingStore.dispatch("DONE");
   
          });
        break;
      case "SET_SHIPPING_ADDRESS":
        if (state) {
          loadingStore.dispatch("START_LOADING");
          client
            .carts()
            .withId({ ID: state.id })
            .post({
              body: {
                version: state.version,
                actions: [
                  {
                    action: "setShippingAddress",
                    address: action.address
                  },
                ],
              },
            })
            .execute()
            .then((cart) => {
              cartStore.dispatch({
                type: "SET_CART",
                cart: cart.body,
              })
            })
            .finally(() => loadingStore.dispatch("DONE"));
          }
        break;
      case "APPLY_DISCOUNT":
       
        if (state) {
          loadingStore.dispatch("START_LOADING");
          client
            .carts()
            .withId({ ID: state.id })
            .post({
              body: {
                version: state.version,
                actions: [
                  {
                    action: "setDirectDiscounts",
                    discounts: [
                      {
                        value: {
                          type: "relative",
                          permyriad: action.percetage
                        },
                        target: {
                          type: "lineItems",
                          predicate: "true"
                        }
                      }
                    ]
                  },
                ],
              },
            })
            .execute()
            .then((cart) => {
              cartStore.dispatch({
                type: "SET_CART",
                cart: cart.body,
              })
            })
            .finally(() => loadingStore.dispatch("DONE"));
          }
        break;
        
      case "SET_CART":
        localStorage.setItem("cart", JSON.stringify(action.cart));
        setState(action.cart);
        break;
      case "ADD_ITEM":
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
                shippingAddress: { country: countryCurrencyLanguageStore.getSnapshot().country },
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
        break;
      case "DELETE_CART":
        if (!state) {
          // TODO should we throw some kind of warning/error here?
          return;
        }
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
        break;
      default:
        exhaustiveMatchingGuard(action);
    }
  },
  initialState
);
export default cartStore;
