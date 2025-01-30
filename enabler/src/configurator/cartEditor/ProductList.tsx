import { ProductProjection } from "@commercetools/platform-sdk";
import { memo, useSyncExternalStore } from "react";
import CountryCurrencyLanguageStore from "../stores/countryCurrencyLanguageStore";
import cartStore from "../stores/cartStore";
import { PriceComponent } from "./PriceComponent";
import loadingStore from "../stores/loadingStore";

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
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name[language]}{" "}
          <PriceComponent price={product.masterVariant.price} />{" "}
          <button
            disabled={!product.masterVariant.price || loading}
            onClick={() => {
              {
                /*TODO how should we handle if product.masterVariant.sku in undefined? */
              }
              cartStore.dispatch({
                type: "ADD_ITEM",
                sku: product.masterVariant.sku || "",
              });
            }}
          >
            Add to cart
          </button>
        </li>
      ))}
    </ul>
  );
});
