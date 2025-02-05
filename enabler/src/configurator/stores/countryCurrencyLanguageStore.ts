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
};

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
        country: cart.country!,
        currency: cart.totalPrice.currencyCode,
        language: cart.locale!,
      },
    });
  } else {
    const project = cocoProjectSettingsStore.getSnapshot();
    if (
      !project?.countries[0] ||
      !project?.currencies[0] ||
      !project?.languages[0]
    ) {
      console.error("Project is missing counry, currency or language:");
      console.log("project is:", project);
      throw new Error("Project is not set");
    }
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
