import { memo, useSyncExternalStore } from "react";
import cartStore from "../stores/cartStore";
import cocoSessionStore from "../stores/cocoSessionStore";
import { LocaleCountryCurrency } from "./LocaleCountryCurrency";
import { ProductSearch } from "./ProductSearch";
import loadingStore from "../stores/loadingStore";
import countryCurrencyLanguageStore from "../stores/countryCurrencyLanguageStore";

function CartEditor() {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot);
  const ccl = useSyncExternalStore(
    countryCurrencyLanguageStore.subscribe,
    countryCurrencyLanguageStore.getSnapshot
  );
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot
  );
  const loading = useSyncExternalStore(
    loadingStore.subscribe,
    loadingStore.getSnapshot
  );

  return ccl ? (
    <div>
      {/* @ts-ignore */}
      {session ? <p>SessionId: {session.id}</p> : ""}
      {cart && (
        <button
          disabled={loading}
          onClick={() =>
            cartStore.dispatch({
              type: "DELETE_CART",
            })
          }
        >
          Delete cart
        </button>
      )}
      <LocaleCountryCurrency cart={cart} />
      <ProductSearch />
      <pre>{JSON.stringify(cart, undefined, 2)}</pre>
    </div>
  ) : undefined;
}
export default memo(CartEditor);
