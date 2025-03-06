import { memo, useSyncExternalStore, useState, useEffect} from "react";
import cartStore from "../stores/cartStore";
import cocoSessionStore from "../stores/cocoSessionStore";
import { LocaleCountryCurrency } from "./LocaleCountryCurrency";
import { LineItems } from "./LineItems";
import { ProductSearch } from "./ProductSearch";
import loadingStore from "../stores/loadingStore";
import countryCurrencyLanguageStore from "../stores/countryCurrencyLanguageStore";
import type { Address } from "@commercetools/platform-sdk";
import '../css/CartEditor.scss';

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
      <div className="cart-editor_column standard-font">
          {session ? <p>SessionId: {session.id}</p> : ""}
          {cart && (
            <button
              disabled={loading}
              onClick={() => {
                  setTextareaValue('');
                  cartStore.dispatch({
                    type: "FETCH_CART",
                  })
                }
              }
            >
            Fetch cart
            </button>
            
          )}
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
          {cart && (
            <div> 
              <br/>
              <button
                disabled={loading}
                onClick={() => {
                  const percetage = parseInt((document.getElementById("direct-discount-input") as HTMLInputElement)?.value)
                  cartStore.dispatch({
                    type: "APPLY_DISCOUNT",
                    percetage
                  })
                  }
                }
              >
              Apply direct discount %
              </button>
              <input type="text" id="direct-discount-input" />
              <br/><br/>
            </div>
          )}
          {cart && (
            <div> 
              <br/>
              <button
                disabled={loading}
                onClick={() => {
                  const address: Address = {
                    country: "DE",
                    city: "Munich",
                    streetName: "Adams-Lehmann-Straße",
                    streetNumber: "44",
                    postalCode: "80797",
                    firstName: "King-Hin",
                    lastName: "Leung",
                    company: "Commercetools GmbH",
                    phone: "+49012345678901",
                    email: "kinghin.leung@test.de"
                  }
                  cartStore.dispatch({
                    type: "SET_SHIPPING_ADDRESS",
                    address: address
                    
                  })
                  }
                }
              >
              Apply commercetools Munich office as shipping address
              </button>
              <br/><br/>
            </div>
          )}
          <LocaleCountryCurrency cart={cart} />
          <ProductSearch />
          <LineItems cart={cart} />
          <div className="standard-font" >
            <br/>
            Total : {cart?.taxedPrice?.totalGross.centAmount}
          </div>
        </div>
        <div className="cart-editor_column">
          <p className="title-font">Cart Object</p>
          <textarea id="cart-editor_textarea-id" className="cart-editor_textarea"  cols={70} rows={40} value={textareaValue} />
        </div>
    </div>
  ) : undefined;
}
export default memo(CartEditor);
