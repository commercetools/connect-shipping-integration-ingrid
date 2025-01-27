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

const countryCurrencyLanguageStore = new Store<CCL, Action>(
  (action, _state, setState) => {
    if (action.type === "SET_CCL") {
      setState(action.ccl);
    }
  }
);
const unsubscribe = cocoProjectSettingsStore.subscribe(() => {
  const cart = cartStore.getSnapshot();
  if (cart) {
    countryCurrencyLanguageStore.dispatch({
      type: "SET_CCL",
      ccl: {
        country: cart.country,
        currency: cart.totalPrice.currencyCode,
        language: cart.locale,
      },
    });
  } else {
    const project = cocoProjectSettingsStore.getSnapshot();
    countryCurrencyLanguageStore.dispatch({
      type: "SET_CCL",
      ccl: {
        country: project.countries[0],
        currency: project.currencies[0],
        language: project.languages[0],
      },
    });
    unsubscribe();
  }
});
export default countryCurrencyLanguageStore;
