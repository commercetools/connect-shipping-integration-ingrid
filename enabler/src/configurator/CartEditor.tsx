import {
  memo,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import client from "./coco/index";
import {
  Cart,
  Price,
  ProductProjection,
  Project,
} from "@commercetools/platform-sdk";
import cartStore from "./stores/CartStore";
import countryCurrencyLanguageStore from "./stores/CountryCurrencyLanguageStore";
import cocoProjectSettingsStore from "./stores/cocoProjectSettingsStore";
import cocoSessionStore from "./stores/cocoSessionStore";

function CartEditor() {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot);
  const project = useSyncExternalStore(
    cocoProjectSettingsStore.subscribe,
    cocoProjectSettingsStore.getSnapshot
  );
  const session = useSyncExternalStore(
    cocoSessionStore.subscribe,
    cocoSessionStore.getSnapshot
  );
  console.log("session:", session);

  return project ? (
    <div>
      {/* @ts-ignore */}
      {session ? <p>SessionId: {session.id}</p> : ""}
      {cart && (
        <button
          onClick={() =>
            cartStore.emit({
              type: "DELETE_CART",
            })
          }
        >
          Delete cart
        </button>
      )}
      <LocaleCountryCurrency cart={cart} project={project} />
      <ProductSearch />
      <pre>{JSON.stringify(cart, undefined, 2)}</pre>
    </div>
  ) : undefined;
}
export default memo(CartEditor);

type ProductSearchProps = {};
const ProductSearch = memo(function ProductSearch({}: ProductSearchProps) {
  const { country, currency, language } = useSyncExternalStore(
    countryCurrencyLanguageStore.subscribe,
    countryCurrencyLanguageStore.getSnapshot
  );
  const [search, setSearch] = useState<string>("");
  const [products, setProducts] = useState<ProductProjection[]>([]);
  useEffect(() => {
    client
      .productProjections()
      .search()
      .get({
        queryArgs: {
          priceCurrency: currency,
          priceCountry: country,
          localeProjection: language,
          [`text.${language}`]: search,
        },
      })
      .execute()
      .then((result) => setProducts(result.body.results))
      .catch((e) => console.error("something went wrong:", e));
  }, [search, country, currency, language]);
  return (
    <div>
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

type PriceComponentProps = { price: Price };
const PriceComponent = memo(function PriceComponent({
  price,
}: PriceComponentProps) {
  return price
    ? `${price?.value?.centAmount} ${price?.value?.currencyCode}`
    : "not available";
});

type ProductListProps = {
  products: ProductProjection[];
};
const ProductList = memo(function ProductList({ products }: ProductListProps) {
  const { language } = useSyncExternalStore(
    countryCurrencyLanguageStore.subscribe,
    countryCurrencyLanguageStore.getSnapshot
  );
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name[language]} -
          <PriceComponent price={p.masterVariant.price} />
          <button
            disabled={!p.masterVariant.price}
            onClick={() => {
              cartStore.emit({
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

type LocaleCountryCurrencyProps = {
  cart?: Cart;
  project?: Project;
};
const LocaleCountryCurrency = memo(function LocaleCountryCurrency({
  cart,
  project,
}: LocaleCountryCurrencyProps) {
  const disabled = Boolean(cart);
  const { country, currency, language } = useSyncExternalStore(
    countryCurrencyLanguageStore.subscribe,
    countryCurrencyLanguageStore.getSnapshot
  );
  const createOnChange = (key: string) => (e) => {
    countryCurrencyLanguageStore.emit({
      type: "SET_CCL",
      ccl: {
        country,
        currency,
        language,
        ...{ [key]: e.target.value },
      },
    });
  };
  if (!project) {
    return;
  }
  return (
    <div>
      <label>
        country
        <select
          disabled={disabled}
          value={country || project.countries[0]}
          onChange={createOnChange("country")}
        >
          {project.countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>
      <label>
        currency
        <select
          disabled={disabled}
          value={currency || project.currencies[0]}
          onChange={createOnChange("currency")}
        >
          {project.currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </label>
      <label>
        language
        <select
          disabled={disabled}
          value={language || project.languages[0]}
          onChange={createOnChange("language")}
        >
          {project.languages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
});
