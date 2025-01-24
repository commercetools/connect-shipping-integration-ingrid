import React, { useState } from "react";
import * as ReactDOM from "react-dom/client";
import CartEditor from "./CartEditor";

const root = ReactDOM.createRoot(document.getElementById("root"));
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
      <div style={{ display: show ? "inline" : "none" }}>
        <CartEditor />
      </div>
    </div>
  );
}
