import { fileURLToPath } from "url";
import { dirname } from "path";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname, // Ensure this is the correct path
});

const globals = {
  localStorage: "readonly",
  window: "readonly",
  document: "readonly",
  fetch: "readonly",
  btoa: "readonly",
  console: "readonly",
  setTimeout: "readonly",
  // Add other browser globals as needed
};

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals,
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.tsx"],
    languageOptions: {
      globals,
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },
    settings: {
      react: {
        version: "detect",
        pragma: "React",
        pragmaFrag: "React.Fragment",
        runtime: "automatic", // This line configures the react/jsx-runtime setting
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-uses-react": "off", // Disable this rule
      "react/react-in-jsx-scope": "off", // Disable this rule
    },
  },
  ...compat.extends(
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ),
];
