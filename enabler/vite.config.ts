import { resolve } from "path";
import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin({
      injectCodeFunction: function injectCodeCustomRunTimeFunction(
        cssCode: string,
        options
      ) {
        try {
          if (typeof document != "undefined") {
            var elementStyle = document.createElement("style");
            // this attribute will allow the client application using this connector to
            // identify the style tag and remove it if needed for cleanup purposes
            elementStyle.setAttribute("data-ctc-connector-styles", "");
            for (const attribute in options.attributes) {
              elementStyle.setAttribute(
                attribute,
                options.attributes[attribute]
              );
            }
            elementStyle.appendChild(document.createTextNode(cssCode));
            document.head.appendChild(elementStyle);
          }
        } catch (e) {
          console.error("vite-plugin-css-injected-by-js", e);
        }
      },
    }),
  ],
  build: {
    outDir: resolve(__dirname, "public"),
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/main.ts"),
      name: "Connector",
      formats: ["es", "umd"],
      // the proper extensions will be added
      fileName: (format) => `connector-enabler.${format}.js`,
    },
  },
  server: {
    cors: {
      origin: true, // Allow all origins in development
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    },
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  }
});
