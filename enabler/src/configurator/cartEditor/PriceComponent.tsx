import type { Price } from "@commercetools/platform-sdk";
import { memo } from "react";

type PriceComponentProps = { price?: Price };

export const PriceComponent = memo(function PriceComponent({
  price,
}: PriceComponentProps) {
  const actualPrice =
    price?.discounted?.value.centAmount ?? price?.value.centAmount;
  if (!price) return "not available";

  return (
    <>
      {price.discounted && <s>{price.value.centAmount} </s>}
      <b>
        {actualPrice}{" "}
        {price.discounted?.value.currencyCode || price.value.currencyCode}
      </b>
    </>
  );
});
