import { memo } from "react";

import '../css/CartEditor.css';
import type { Cart, LineItem } from "@commercetools/platform-sdk";

type LineItemsProp = { cart: Cart | undefined};


function getTotalProductDiscount(lineItem: LineItem) {
  const productDiscountPerItem = lineItem.price.value.centAmount - (lineItem.price.discounted?.value.centAmount ?? lineItem.price.value.centAmount);
  const totalProductDiscount = productDiscountPerItem * lineItem.quantity;
  return totalProductDiscount
}
function getTotalLineItemDiscount(lineItem: LineItem) {
  if (lineItem.discountedPricePerQuantity && lineItem.discountedPricePerQuantity.length>0) {
    const totalDiscountedPrice = lineItem.discountedPricePerQuantity.reduce((acc, item) => {
      return acc + item.discountedPrice.value.centAmount * item.quantity;
    }, 0);
    return (lineItem.price.discounted?.value.centAmount ?? lineItem.price.value.centAmount)  * lineItem.quantity - totalDiscountedPrice
    
  } 
  return 0
}

function getTotalCartDiscount(lineItem: LineItem) {
  return getTotalProductDiscount(lineItem) +  getTotalLineItemDiscount(lineItem)
}


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
            <th style={{width: 100}} align="left">Name</th>
            <th style={{width: 50}} align="left">Quantity</th>
            <th style={{width: 100}} align="left">Original price</th>
            <th style={{width: 100}} align="left">Tax included price</th>
            <th style={{width: 50}} align="left">Tax</th>
            <th style={{width: 100}} align="left">Total Product Discount</th>
            <th style={{width: 100}} align="left">Total Line Item Discount</th>
            <th style={{width: 100}} align="left">Total Cart Discount</th>
          </tr>
          {lineItems.map((item, index) => (
            <tr className="standard-font" key={index}>
              <td style={{width: 100}} align="left">{item.name["en-US"]}</td>
              <td style={{width: 50}} align="left">{item.quantity}</td>
              <td style={{width: 100}} align="left"> {item.price?.value.centAmount*item.quantity}</td>
              <td style={{width: 100}} align="left"> {item.taxedPrice?.totalGross.centAmount}</td>
              <td style={{width: 50}} align="left"> {item.taxedPrice?.totalTax?.centAmount}</td>
              <td style={{width: 100}} align="left"> {getTotalProductDiscount(item)}</td>
              <td style={{width: 100}} align="left"> {getTotalLineItemDiscount(item)}</td>
              <td style={{width: 100}} align="left"> {getTotalCartDiscount(item)}</td>
            </tr>
          ))}
        </thead>
      </table>
    </div>
  );
});
