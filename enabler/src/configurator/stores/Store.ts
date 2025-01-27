export default class Store<STATE, ACTION> {
  #listeners = new Map();
  #state: STATE;
  #reducer: (
    action: ACTION,
    state: STATE,
    setState: (state: STATE) => void
  ) => void;
  constructor(
    reducer: (
      action: ACTION,
      state: STATE,
      setState: (state: STATE) => void
    ) => void,
    initialState?: STATE
  ) {
    this.#state = initialState;
    this.#reducer = reducer;
    this.subscribe = this.subscribe.bind(this);
    this.getSnapshot = this.getSnapshot.bind(this);
    this.dispatch = this.dispatch.bind(this);
  }
  private setState(state: STATE) {
    if (state !== this.#state) {
      this.#state = state;
      this.#listeners.forEach((l) => l());
    }
  }
  public subscribe(fn: () => void) {
    this.#listeners.set(fn, fn);
    return () => this.#listeners.delete(fn);
  }
  public getSnapshot() {
    return this.#state;
  }
  public dispatch(action: ACTION) {
    this.#reducer(action, this.#state, this.setState.bind(this));
  }
}
