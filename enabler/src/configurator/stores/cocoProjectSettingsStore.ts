import client from "../coco/index";

import { Project } from "@commercetools/platform-sdk";
import countryCurrencyLanguageStore from "./CountryCurrencyLanguageStore";
import cartStore from "./CartStore";
const cocoProjectSettingsStore = (function cocoProjectSettingsStore() {
  let state: Project = undefined;
  let cart = cartStore.getSnapshot();
  const listeners = new Map();
  cartStore.subscribe(() => {
    cart = cartStore.getSnapshot();
    const ccl = countryCurrencyLanguageStore.getSnapshot();
    if (
      cart &&
      (ccl.country !== cart.country ||
        ccl.currency !== cart.totalPrice.currencyCode ||
        ccl.language !== cart.locale)
    ) {
      countryCurrencyLanguageStore.emit({
        type: "SET_CCL",
        ccl: {
          country: cart.country,
          currency: cart.totalPrice.currencyCode,
          language: cart.locale,
        },
      });
    }
  });

  client
    .get()
    .execute()
    .then((result) => {
      if (!cart) {
        countryCurrencyLanguageStore.emit({
          type: "SET_CCL",
          ccl: {
            country: result.body.countries[0],
            currency: result.body.currencies[0],
            language: result.body.languages[0],
          },
        });
      } else {
        countryCurrencyLanguageStore.emit({
          type: "SET_CCL",
          ccl: {
            country: cart.country,
            currency: cart.totalPrice.currencyCode,
            language: cart.locale,
          },
        });
      }
      state = result.body;
      listeners.forEach((l) => l());
    });

  return {
    subscribe(fn) {
      listeners.set(fn, fn);
      return () => listeners.delete(fn);
    },
    getSnapshot() {
      return state;
    },
  };
})();
export default cocoProjectSettingsStore;
