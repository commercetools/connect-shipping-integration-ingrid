import type { ProductProjection } from "@commercetools/platform-sdk";
import { memo, useSyncExternalStore } from "react";
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

              if (shippingComponent) {
                console.log("shipping component has been mounted, updating shipping");
                // shippingComponent.update();
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
