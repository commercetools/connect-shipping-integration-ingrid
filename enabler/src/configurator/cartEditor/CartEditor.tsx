import { memo, useSyncExternalStore, useState, useEffect} from "react";
import cartStore from "../stores/cartStore";
import cocoSessionStore from "../stores/cocoSessionStore";
import { LocaleCountryCurrency } from "./LocaleCountryCurrency";
import { ProductSearch } from "./ProductSearch";
import loadingStore from "../stores/loadingStore";
import countryCurrencyLanguageStore from "../stores/countryCurrencyLanguageStore";
import '../css/CartEditor.css';

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
  const [textareaValue, setTextareaValue] = useState(JSON.stringify(cart, undefined, 2));

  useEffect(() => {
    setTextareaValue(JSON.stringify(cart, undefined, 2));
  }, [cart]);

  return ccl.country && ccl.currency && ccl.language ? (
    <div className="cart-editor">
      <div className="cart-editor_column">
          {session ? <p>SessionId: {session.id}</p> : ""}
          {cart && (
            <button
              disabled={loading}
              onClick={() => {
                  setTextareaValue('');
                  cartStore.dispatch({
                    type: "DELETE_CART",
                  })
                }
              }
            >
            Delete cart
            </button>
          )}
          <LocaleCountryCurrency cart={cart} />
          <ProductSearch />
        </div>
        <div className="cart-editor_column">
          <p><b>Cart Object</b></p>
          <textarea id="cart-editor_textarea-id" className="cart-editor_textarea"  cols={70} rows={40} value={textareaValue} />
        </div>
    </div>
  ) : undefined;
}
export default memo(CartEditor);
