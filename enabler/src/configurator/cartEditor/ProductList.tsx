import type { ProductProjection } from "@commercetools/platform-sdk";
import { memo, useEffect, useSyncExternalStore } from "react";
import CountryCurrencyLanguageStore from "../stores/countryCurrencyLanguageStore";
import cartStore from "../stores/cartStore";
import { PriceComponent } from "./PriceComponent";
import loadingStore from "../stores/loadingStore";
import shippingComponentStore from "../stores/shippingComponentStore";

type ProductListProps = {
  products: ProductProjection[];
};
export const ProductList = memo(function ProductList({
  products,
}: ProductListProps) {
  const { language } = useSyncExternalStore(
    CountryCurrencyLanguageStore.subscribe,
    CountryCurrencyLanguageStore.getSnapshot
  );
  const loading = useSyncExternalStore(
    loadingStore.subscribe,
    loadingStore.getSnapshot
  );

  const shippingComponent = useSyncExternalStore(
    shippingComponentStore.subscribe,
    shippingComponentStore.getSnapshot
  );

  useEffect(() => {
    if (shippingComponent) {
      // Component is now available, you can use it here
      console.log('Shipping component is ready');
    }
  }, [shippingComponent]);


  return (
    <ul className="standard-font">
      {products.map((product) => (
        <li key={product.id}>
          {product.name[language]}{" "}
          <PriceComponent price={product.masterVariant.price} />{" "}
          <button
            disabled={!product.masterVariant.price || loading}
            onClick={() => {
              cartStore.dispatch({
                type: "ADD_ITEM",
                sku: product.masterVariant.sku || "",
              });
              console.log("shipping component has been mounted");
              if (shippingComponent) {
                console.log("shipping component has been mounted, updating cart to ingrid shipping component");
                shippingComponent.update();
              }
              
            }}
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
});
