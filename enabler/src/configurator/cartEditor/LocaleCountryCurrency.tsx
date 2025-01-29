import { memo, useSyncExternalStore } from "react";
import CountryCurrencyLanguageStore from "../stores/countryCurrencyLanguageStore";
import { Cart, Project } from "@commercetools/platform-sdk";
import cocoProjectSettingsStore from "../stores/cocoProjectSettingsStore";

type LocaleCountryCurrencyProps = {
  cart?: Cart;
  project?: Project;
};
export const LocaleCountryCurrency = memo(function LocaleCountryCurrency({
  cart,
}: LocaleCountryCurrencyProps) {
  const disabled = Boolean(cart);
  const { country, currency, language } = useSyncExternalStore(
    CountryCurrencyLanguageStore.subscribe,
    CountryCurrencyLanguageStore.getSnapshot
  );
  const project = useSyncExternalStore(
    cocoProjectSettingsStore.subscribe,
    cocoProjectSettingsStore.getSnapshot
  );
  const createOnChange = (key: string) => (e) => {
    CountryCurrencyLanguageStore.dispatch({
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
          value={country}
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
          value={currency}
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
          value={language}
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
