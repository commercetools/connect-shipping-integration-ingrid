import type { ShippingComponent } from "../../shipping-enabler/shipping-enabler";

type ShippingComponentState = {
  component: ShippingComponent | null;
};

type Action = { type: "SET_COMPONENT"; payload: ShippingComponent | null };

const createStore = () => {
  let state: ShippingComponentState = {
    component: null,
  };
  const listeners = new Set<() => void>();

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return state.component;
    },
    dispatch(action: Action) {
      switch (action.type) {
        case "SET_COMPONENT":
          state = { ...state, component: action.payload };
          break;
      }
      listeners.forEach((listener) => listener());
    },
  };
};

const shippingComponentStore = createStore();
export default shippingComponentStore;