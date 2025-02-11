import React, { useState } from "react";
import * as ReactDOM from "react-dom/client";
import CartEditor from "./cartEditor";
import MountEnabler from "./MountEnabler";
import OrderCreationButton from "./order/OrderCreationButton";

const rootId = "root";

const domRoot = document.getElementById(rootId);
if (!domRoot) {
  throw Error(
    `Error loading Ingrid integration, element with ID ${rootId} does not exist.`
  );
}
const root = ReactDOM.createRoot(domRoot);
root.render(
  <React.StrictMode>
    <MyComponent />
  </React.StrictMode>
);

function MyComponent() {
  const [show, setShow] = useState<boolean>(true);
  return (
    <div>
      <button onClick={() => setShow((s) => !s)}>
        {show ? "Hide" : "Show"} config editor
      </button>
      <MountEnabler />
      <div style={{ display: show ? "inline" : "none" }}>
        <CartEditor />
      </div>
      <OrderCreationButton/>
    </div>
  );
}
