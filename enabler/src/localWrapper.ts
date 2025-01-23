import { Sdk } from "./sdk";

export function init() {
  //@ts-ignore
  if (import.meta.hot) {
    //@ts-ignore
    import.meta.hot.accept(() => {
      // Handle hot module replacement
      const enablerWrapper = document.getElementById("enabler-wrapper");
      if (enablerWrapper) {
        const sdk = new Sdk({ environment: "environment as string" });
        //@todo: we will initialize and bind the enabler to the div here
        enablerWrapper.innerHTML = "hello world" + sdk.init("");
      }
    });
  }
}
