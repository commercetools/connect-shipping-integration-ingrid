import cartStore from "./cartStore";
import cocoProjectSettingsStore from "./cocoProjectSettingsStore";
import Store from "./Store";

export type ActionType = "SET_CCL";
export type CCL = {
  country: string;
  currency: string;
  language: string;
};
export type Action = {
  type: "SET_CCL";
  ccl: CCL;
};

const initialState = {
  country: "",
  currency: "",
  language: "",
}; // TODO should this really be our initial state, or should it be undefined with STATE: CCL | undefined?

const countryCurrencyLanguageStore = new Store<CCL, Action>(
  (action, _state, setState) => {
    if (action.type === "SET_CCL") {
      setState(action.ccl);
    }
  },
  initialState
);
const unsubscribe = cocoProjectSettingsStore.subscribe(() => {
  const cart = cartStore.getSnapshot();
  if (cart) {
    countryCurrencyLanguageStore.dispatch({
      type: "SET_CCL",
      ccl: {
        country: cart.country || "", //TODO should we still be dispatching if country is undefined and/or throw error/warning?
        currency: cart.totalPrice.currencyCode,
        language: cart.locale || "", //TODO should we still be dispatching if locale is undefined and/or throw error/warning?
      },
    });
  } else {
    const project = cocoProjectSettingsStore.getSnapshot();
    countryCurrencyLanguageStore.dispatch({
      type: "SET_CCL",
      ccl: {
        country: project?.countries[0] || "", //TODO should we still be dispatching if project is undefined and/or throw error/warning?
        currency: project?.currencies[0] || "", //TODO should we still be dispatching if project is undefined and/or throw error/warning?
        language: project?.languages[0] || "", //TODO should we still be dispatching if project is undefined and/or throw error/warning?
      },
    });
    unsubscribe();
  }
});
export default countryCurrencyLanguageStore;
