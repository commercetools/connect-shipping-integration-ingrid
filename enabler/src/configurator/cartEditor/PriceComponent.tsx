import type { Price } from "@commercetools/platform-sdk";
import { memo } from "react";

type PriceComponentProps = { price?: Price };

export const PriceComponent = memo(function PriceComponent({
  price,
}: PriceComponentProps) {
  return price
    ? `${price?.value?.centAmount} ${price?.value?.currencyCode}`
    : "not available";
});
