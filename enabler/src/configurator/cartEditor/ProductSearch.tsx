import { memo, useEffect, useState, useSyncExternalStore } from "react";
import countryCurrencyLanguageStore from "../stores/countryCurrencyLanguageStore";
import client from "../coco";
import type { ProductProjection } from "@commercetools/platform-sdk";
import { ProductList } from "./ProductList";

export const ProductSearch = memo(function ProductSearch() {
  const { country, currency, language } = useSyncExternalStore(
    countryCurrencyLanguageStore.subscribe,
    countryCurrencyLanguageStore.getSnapshot
  );
  const [search, setSearch] = useState<string>("");
  const products = useProductsSearch(search, country, currency, language);
  return (
    <div className="standard-font">
      <label>
        search:
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <ProductList products={products} />
    </div>
  );
});
const useProductsSearch = (function createSearch() {
  const check = { current: {} };
  return function useProductsSearch(
    search: string,
    country: string,
    currency: string,
    language: string
  ) {
    const [products, setProducts] = useState<ProductProjection[]>([]);
    useEffect(() => {
      setProducts([]);
      const current = {};
      check.current = current;
      //debounce
      setTimeout(() => {
        if (current !== check.current) {
          return;
        }
        client
          .productProjections()
          .search()
          .get({
            queryArgs: {
              priceCurrency: currency,
              priceCountry: country,
              localeProjection: language,
              [`text.${language}`]: search,
              limit: 20,
              sort: "lastModifiedAt desc",
            },
          })
          .execute()
          .then((result) => {
            if (check.current === current) {
              //only set when this was the latest requested result
              setProducts(result.body.results);
            }
          })
          .catch((e) => console.error("something went wrong:", e));
      }, 500);
    }, [search, country, currency, language]);
    return products;
  };
})();
