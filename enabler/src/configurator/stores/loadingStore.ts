import { exhaustiveMatchingGuard } from "../lib";
import Store from "./Store";
export type Action = "START_LOADING" | "DONE";

let loadingCounter = 0;
const loadingStore = new Store<boolean, Action>((action, state, setState) => {
  if (action === "START_LOADING") {
    loadingCounter++;
    setState(loadingCounter > 0);
  } else if (action === "DONE") {
    loadingCounter--;
    setState(loadingCounter > 0);
  } else {
    exhaustiveMatchingGuard(action);
  }
});

export default loadingStore;
