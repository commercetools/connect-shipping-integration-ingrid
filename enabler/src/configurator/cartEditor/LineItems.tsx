import { memo } from "react";

import '../css/CartEditor.css';
import type { Cart } from "@commercetools/platform-sdk";

type LineItemsProp = { cart: Cart | undefined};


export const LineItems = memo(function LineItems({
  cart,
}: LineItemsProp) {
  const lineItems = cart?.lineItems;
  if (!lineItems) return (
    <div>
      <hr></hr>
      <p>No items in cart</p>
    </div>
  )
  return (
    <div>
      <hr></hr>
      <p className="title-font">Items in Cart</p>
      
      {lineItems.map((item, index) => (
        <div className="standard-font" key={index}>{item.name["en-US"]} x {item.quantity} : {item.taxedPrice?.totalGross.centAmount}</div>
      ))}
    </div>
  );
});
