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
      <table style={{ border: "1px solid black" }}>
        <thead>
          <tr>
            <th style={{width: 150}} align="left">Name</th>
            <th style={{width: 100}} align="left">Quantity</th>
            <th style={{width: 150}} align="left">Tax included price</th>
            <th style={{width: 150}} align="left">Tax</th>
          </tr>
          {lineItems.map((item, index) => (
            <tr className="standard-font" key={index}>
              <td style={{width: 150}} align="left">{item.name["en-US"]}</td>
              <td style={{width: 100}} align="left">{item.quantity}</td>
              <td style={{width: 150}} align="left"> {item.taxedPrice?.totalGross.centAmount}</td>
              <td style={{width: 150}} align="left"> {item.taxedPrice?.totalTax?.centAmount}</td>
            </tr>
          ))}
        </thead>
      </table>
    </div>
  );
});
