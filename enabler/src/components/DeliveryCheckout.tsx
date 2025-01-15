import React, { useEffect, useRef } from 'react';
import { createSession } from '../services/api';

const DeliveryCheckout: React.FC = () => {
  const widgetWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initiateSession = async () => {
      try {
        const payload = { /* Populate with required Ingrid session payload */ };
        const data = await createSession(payload);

        // Only update innerHTML if widgetWrapperRef.current and data.htmlSnippet are not null
        if (widgetWrapperRef.current && data.htmlSnippet) {
          widgetWrapperRef.current.innerHTML = data.htmlSnippet;
          replaceScriptNode(widgetWrapperRef.current);
        }
      } catch (error) {
        console.error('Error creating Ingrid session:', error);
      }
    };

    // Helper functions for replacing script nodes
    function replaceScriptNode(node: Node) {
      if (isScriptNode(node) && !isExternalScript(node)) {
        node.parentNode?.replaceChild(cloneScriptNode(node), node);
      } else {
        node.childNodes.forEach(child => replaceScriptNode(child));
      }
      return node;
    }

    function isScriptNode(node: Node): node is HTMLScriptElement {
      return node.nodeName === "SCRIPT";
    }

    function isExternalScript(node: HTMLScriptElement) {
      return !!node.src && node.src !== "";
    }

    function cloneScriptNode(node: HTMLScriptElement): HTMLScriptElement {
      const script = document.createElement("script");
      script.text = node.innerHTML;
      Array.from(node.attributes).forEach(attr =>
        script.setAttribute(attr.name, attr.value)
      );
      return script;
    }

    initiateSession();
  }, []);

  return (
    <div
      ref={widgetWrapperRef}
      style={{ width: "100vw", maxWidth: "610px" }}
    />
  );
};

export default DeliveryCheckout;
