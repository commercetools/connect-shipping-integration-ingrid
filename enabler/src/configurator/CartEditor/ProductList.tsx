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
      {products.map((p) => (
        <li key={p.id}>
          {p.name[language]} <PriceComponent price={p.masterVariant.price} />{" "}
          <button
            disabled={!p.masterVariant.price || loading}
            onClick={() => {
              cartStore.dispatch({
                type: "ADD_ITEM",
                sku: p.masterVariant.sku,
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
