import { exhaustiveMatchingGuard } from "../lib";
import Store from "./Store";

export type Action = "START_LOADING" | "DONE";

const initialState = false;
let loadingCounter = 0;

const loadingStore = new Store<boolean, Action>((action, _state, setState) => {
  switch (action) {
    case "START_LOADING":
      loadingCounter++;
      setState(loadingCounter > 0);
      break;
    case "DONE":
      loadingCounter--;
      setState(loadingCounter > 0);
      break;
    default:
      exhaustiveMatchingGuard(action);
  }
}, initialState);

export default loadingStore;
