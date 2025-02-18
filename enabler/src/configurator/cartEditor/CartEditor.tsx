import { memo, useState, useSyncExternalStore } from "react";
import cartStore from "../stores/cartStore";
import cocoSessionStore from "../stores/cocoSessionStore";
import { LocaleCountryCurrency } from "./LocaleCountryCurrency";
import { ProductSearch } from "./ProductSearch";
import loadingStore from "../stores/loadingStore";
import countryCurrencyLanguageStore from "../stores/countryCurrencyLanguageStore";
import client from "../coco/index";
import type { Cart, CartUpdateAction } from "@commercetools/platform-sdk";

async function setValue(cart: Cart, name: string, count: number) {
  let actions: CartUpdateAction[] = [
    {
      action: "setCustomField",
      name,
      value: `value for: ${name} ${count}`,
    },
  ];
  if (!cart.custom) {
    actions = [
      {
        action: "setCustomType",
        type: {
          key: "custom-type-one",
          typeId: "type",
        },
      },
      ...actions,
    ];
  }
  const newCart = await client
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions,
      },
    })
    .execute();
  cartStore.dispatch({ type: "SET_CART", cart: newCart.body });
}

function CartEditor() {
  const [count, setCount] = useState(0);
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

  return ccl.country && ccl.currency && ccl.language ? (
    <div>
      {cart && (
        <div>
          <button
            onClick={() => {
              setValue(cart, "value-a", count);
              setCount((c) => c + 1);
            }}
          >
            set custom value a
          </button>
          <button
            onClick={() => {
              setValue(cart, "value-b", count);
              setCount((c) => c + 1);
            }}
          >
            set custom value b
          </button>
        </div>
      )}
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
