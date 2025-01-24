export type ActionType = "SET_CCL";
export type CCL = {
  country: string;
  currency: string;
  language: string;
};
export type Event = {
  type: "SET_CCL";
  ccl: CCL;
};
export default (function CountryCurrencyLanguageStore() {
  let state: CCL = undefined;
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
      if (event.type === "SET_CCL") {
        state = event.ccl;
        listeners.forEach((l) => l(event));
      }
    },
  };
})();
